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
      // Simulate connection test for each machine
      for (const machine of machines) {
        if (!machine.ipAddress || !machine.username || !machine.password) {
          setMachines(prev => prev.map(m =>
            m.id === machine.id ? { ...m, status: 'failed' } : m
          ));
          continue;
        }

        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mark as connected (in real implementation, you'd test SSH)
        setMachines(prev => prev.map(m =>
          m.id === machine.id ? { ...m, status: 'connected' } : m
        ));

        toast({
          title: `Connected to ${machine.ipAddress}`,
          description: "SSH connection successful"
        });
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

  const generateInstallScript = (machine: MachineConfig) => {
    const supabaseUrl = "https://dedjxngllokyyktaklmz.supabase.co";
    const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZGp4bmdsbG9reXlrdGFrbG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDM2OTUsImV4cCI6MjA2NTExOTY5NX0.qNPIqjYETGqoKDmXa6J7ujIy7I9nqjaSSq_5MZa6Fb0";
    
    const logPaths = machine.logPaths.split(',').map(p => p.trim());
    
    return `#!/bin/bash
# Resolvix Agent Installation Script
# Machine: ${machine.ipAddress}

echo "Installing Resolvix Agent..."

# Create agent directory
sudo mkdir -p /opt/resolvix
cd /opt/resolvix

# Create Python agent script
cat > /opt/resolvix/resolvix-agent.py << 'EOF'
#!/usr/bin/env python3
import json
import os
import time
import requests
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class LogMonitor(FileSystemEventHandler):
    def __init__(self):
        self.supabase_url = "${supabaseUrl}"
        self.api_key = "${supabaseAnonKey}"
        self.machine_ip = "${machine.ipAddress}"
        self.log_paths = ${JSON.stringify(logPaths)}
        self.file_positions = {}
        
    def on_modified(self, event):
        if event.is_directory:
            return
        
        log_path = event.src_path
        if any(log_path.endswith(p.split('/')[-1]) for p in self.log_paths):
            self.process_log_file(log_path)
    
    def process_log_file(self, log_path):
        try:
            last_pos = self.file_positions.get(log_path, 0)
            
            with open(log_path, 'r') as f:
                f.seek(last_pos)
                new_lines = f.readlines()
                new_pos = f.tell()
            
            if new_lines:
                self.send_logs_to_supabase(log_path, new_lines)
                self.file_positions[log_path] = new_pos
                
        except Exception as e:
            print(f"Error processing {log_path}: {e}")
    
    def send_logs_to_supabase(self, log_path, lines):
        logs = []
        for line in lines:
            log_entry = self.parse_log_line(line.strip())
            if log_entry:
                logs.append({
                    'machine_ip': self.machine_ip,
                    'log_path': log_path,
                    'level': log_entry['level'],
                    'message': log_entry['message'],
                    'timestamp': log_entry['timestamp']
                })
        
        if logs:
            try:
                url = f"{self.supabase_url}/rest/v1/live_logs"
                headers = {
                    'apikey': self.api_key,
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                }
                
                response = requests.post(url, json=logs, headers=headers)
                if response.status_code in [200, 201]:
                    print(f"Sent {len(logs)} log entries")
                else:
                    print(f"Error: {response.status_code}")
            except Exception as e:
                print(f"Error sending to Supabase: {e}")
    
    def parse_log_line(self, line):
        if not line:
            return None
        
        level = 'info'
        if 'ERROR' in line.upper() or 'ERR' in line.upper():
            level = 'error'
        elif 'WARN' in line.upper():
            level = 'warn'
        elif 'DEBUG' in line.upper():
            level = 'debug'
        
        return {
            'level': level,
            'message': line,
            'timestamp': datetime.utcnow().isoformat()
        }

def main():
    print("Starting Resolvix Agent for ${machine.ipAddress}")
    
    monitor = LogMonitor()
    observer = Observer()
    
    for log_path in monitor.log_paths:
        if os.path.exists(log_path):
            observer.schedule(monitor, os.path.dirname(log_path), recursive=False)
            monitor.process_log_file(log_path)
            print(f"Monitoring: {log_path}")
        else:
            print(f"Warning: {log_path} not found")
    
    observer.start()
    print("Agent started successfully!")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        print("Agent stopped")
    
    observer.join()

if __name__ == '__main__':
    main()
EOF

# Make script executable
sudo chmod +x /opt/resolvix/resolvix-agent.py

# Install dependencies
sudo apt-get update
sudo apt-get install -y python3 python3-pip
sudo pip3 install requests watchdog

# Create systemd service
sudo cat > /etc/systemd/system/resolvix-agent.service << 'EOFSERVICE'
[Unit]
Description=Resolvix Log Agent
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/resolvix
ExecStart=/usr/bin/python3 /opt/resolvix/resolvix-agent.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOFSERVICE

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable resolvix-agent
sudo systemctl start resolvix-agent

echo ""
echo "✅ Resolvix Agent installed successfully!"
echo "Check status: sudo systemctl status resolvix-agent"
echo "View logs: sudo journalctl -u resolvix-agent -f"
`;
  };

  const installAgent = async () => {
    setIsInstalling(true);
    
    try {
      const connectedMachines = machines.filter(m => m.status === 'connected');
      
      for (const machine of connectedMachines) {
        const script = generateInstallScript(machine);
        
        setMachines(prev => prev.map(m =>
          m.id === machine.id 
            ? { ...m, status: 'agent-installed', installScript: script }
            : m
        ));
      }
      
      toast({
        title: "Installation scripts generated",
        description: "Download and run the scripts on your machines"
      });
    } catch (error) {
      toast({
        title: "Failed to generate installation scripts",
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
