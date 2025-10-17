import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Server, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MachineConfig {
  id: string;
  ipAddress: string;
  username: string;
  password: string;
  status: 'pending' | 'connected' | 'failed';
}

export default function GettingStarted() {
  const [machines, setMachines] = useState<MachineConfig[]>([
    { id: '1', ipAddress: '', username: '', password: '', status: 'pending' }
  ]);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const addMachine = () => {
    setMachines([
      ...machines,
      { id: Date.now().toString(), ipAddress: '', username: '', password: '', status: 'pending' }
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

  const saveConfiguration = async () => {
    const connectedMachines = machines.filter(m => m.status === 'connected');
    
    if (connectedMachines.length === 0) {
      toast({
        title: "No connected machines",
        description: "Please test connections first",
        variant: "destructive"
      });
      return;
    }

    // Store machine configurations in Supabase (encrypted)
    const { error } = await supabase.functions.invoke('save-machine-config', {
      body: { machines: connectedMachines }
    });

    if (error) {
      toast({
        title: "Failed to save configuration",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Configuration saved",
        description: `${connectedMachines.length} machine(s) configured successfully`
      });
    }
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
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
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
                    <div className="space-y-2">
                      <Label htmlFor={`pass-${machine.id}`}>Password</Label>
                      <Input
                        id={`pass-${machine.id}`}
                        type="password"
                        placeholder="••••••••"
                        value={machine.password}
                        onChange={(e) => updateMachine(machine.id, 'password', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">Status:</div>
                    {machine.status === 'connected' && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Connected</span>
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
        <Button onClick={saveConfiguration} variant="secondary" className="flex-1">
          Save Configuration
        </Button>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</div>
            <div>
              <p className="font-medium">Test your connections</p>
              <p className="text-sm text-muted-foreground">Verify SSH access to all machines</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</div>
            <div>
              <p className="font-medium">Save your configuration</p>
              <p className="text-sm text-muted-foreground">Securely store machine credentials</p>
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
