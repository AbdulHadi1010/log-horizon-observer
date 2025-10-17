import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Server, CheckCircle, XCircle, Download, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";

interface MachineConfig {
  id: string;
  ipAddress: string;
  username: string;
  password: string;
  logPaths: string;
  status: 'pending' | 'connected' | 'agent-installed' | 'failed';
  installScript?: string;
}

export default function GettingStarted() {
  const [machines, setMachines] = useState<MachineConfig[]>([
    { id: '1', ipAddress: '', username: '', password: '', logPaths: '/var/log/syslog', status: 'pending' }
  ]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const { toast } = useToast();

  const addMachine = () => {
    setMachines([
      ...machines,
      { id: Date.now().toString(), ipAddress: '', username: '', password: '', logPaths: '/var/log/syslog', status: 'pending' }
    ]);
  };

  const removeMachine = (id: string) => {
    setMachines(machines.filter(m => m.id !== id));
  };

  const updateMachine = (id: string, field: keyof MachineConfig, value: string) => {
    setMachines(machines.map(m =>
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const testConnections = async () => {
    setIsConnecting(true);
    
    try {
      // Test each machine connection
      for (const machine of machines) {
        if (!machine.ipAddress || !machine.username || !machine.password) {
          updateMachine(machine.id, 'status', 'failed');
          continue;
        }

        // Call edge function to test SSH connection
        const { data, error } = await supabase.functions.invoke('test-ssh-connection', {
          body: {
            host: machine.ipAddress,
            username: machine.username,
            password: machine.password
          }
        });

        if (error) {
          updateMachine(machine.id, 'status', 'failed');
          toast({
            title: `Failed to connect to ${machine.ipAddress}`,
            description: error.message,
            variant: "destructive"
          });
        } else if (data?.success) {
          updateMachine(machine.id, 'status', 'connected');
          toast({
            title: `Connected to ${machine.ipAddress}`,
            description: "SSH connection successful"
          });
        } else {
          updateMachine(machine.id, 'status', 'failed');
        }
      }
    } catch (error) {
      toast({
        title: "Connection test failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const installAgent = async () => {
    setIsInstalling(true);
    
    try {
      const connectedMachines = machines.filter(m => m.status === 'connected');
      
      for (const machine of connectedMachines) {
        const { data, error } = await supabase.functions.invoke('install-agent', {
          body: {
            machineIp: machine.ipAddress,
            username: machine.username,
            password: machine.password,
            logPaths: machine.logPaths.split(',').map(p => p.trim())
          }
        });

        if (error) {
          toast({
            title: `Failed to install agent on ${machine.ipAddress}`,
            description: error.message,
            variant: "destructive"
          });
        } else if (data?.success) {
          setMachines(prev => prev.map(m =>
            m.id === machine.id 
              ? { ...m, status: 'agent-installed', installScript: data.installScript }
              : m
          ));
          
          toast({
            title: `Agent installation script ready for ${machine.ipAddress}`,
            description: "Download and run the script on your machine"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Agent installation failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsInstalling(false);
    }
  };

  const downloadInstallScript = (machine: MachineConfig) => {
    if (!machine.installScript) return;
    
    const blob = new Blob([machine.installScript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resolvix-agent-install-${machine.ipAddress}.sh`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Getting Started</h1>
        <p className="text-muted-foreground">
          Configure your Linux machines to enable log monitoring and incident management
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Machine Configuration
          </CardTitle>
          <CardDescription>
            Add your Linux servers with SSH credentials. We'll securely store and use these to collect logs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {machines.map((machine, index) => (
            <Card key={machine.id} className="p-4">
              <div className="flex items-start gap-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`ip-${machine.id}`}>IP Address</Label>
                    <Input
                      id={`ip-${machine.id}`}
                      placeholder="192.168.1.100"
                      value={machine.ipAddress}
                      onChange={(e) => updateMachine(machine.id, 'ipAddress', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`user-${machine.id}`}>Username</Label>
                    <Input
                      id={`user-${machine.id}`}
                      placeholder="root"
                      value={machine.username}
                      onChange={(e) => updateMachine(machine.id, 'username', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`pass-${machine.id}`}>Password (only for initial setup)</Label>
                  <Input
                    id={`pass-${machine.id}`}
                    type="password"
                    placeholder="••••••••"
                    value={machine.password}
                    onChange={(e) => updateMachine(machine.id, 'password', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`logs-${machine.id}`}>Log Paths (comma-separated)</Label>
                  <Textarea
                    id={`logs-${machine.id}`}
                    placeholder="/var/log/syslog, /var/log/messages"
                    value={machine.logPaths}
                    onChange={(e) => updateMachine(machine.id, 'logPaths', e.target.value)}
                    rows={2}
                  />
                </div>
                  
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">Status:</div>
                  {machine.status === 'connected' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                  )}
                  {machine.status === 'agent-installed' && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Terminal className="w-4 h-4" />
                      <span className="text-sm font-medium">Agent Ready</span>
                    </div>
                  )}
                  {machine.status === 'failed' && (
                    <div className="flex items-center gap-1 text-destructive">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Failed</span>
                    </div>
                  )}
                  {machine.status === 'pending' && (
                    <span className="text-sm text-muted-foreground">Not tested</span>
                  )}
                </div>

                {machine.installScript && (
                  <Button
                    onClick={() => downloadInstallScript(machine)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Installation Script
                  </Button>
                )}
              </div>

              {machines.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMachine(machine.id)}
                  className="flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}

        <Button onClick={addMachine} variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Another Machine
        </Button>
      </CardContent>
    </Card>

    <div className="flex gap-4">
      <Button onClick={testConnections} disabled={isConnecting} className="flex-1">
        {isConnecting ? "Testing..." : "Test Connections"}
      </Button>
      <Button 
        onClick={installAgent} 
        disabled={isInstalling || !machines.some(m => m.status === 'connected')} 
        variant="secondary" 
        className="flex-1"
      >
        {isInstalling ? "Installing..." : "Install Agent"}
      </Button>
    </div>

    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Setup Steps</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</div>
          <div>
            <p className="font-medium">Test SSH connections</p>
            <p className="text-sm text-muted-foreground">Verify you can connect to your machines</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</div>
          <div>
            <p className="font-medium">Install Resolvix Agent</p>
            <p className="text-sm text-muted-foreground">Download and run the installation script on each machine</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">3</div>
          <div>
            <p className="font-medium">Monitor live logs</p>
            <p className="text-sm text-muted-foreground">Navigate to Live Logs to view real-time log streams</p>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
