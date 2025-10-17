import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Pause, Play, Download, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LogLine {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

export default function LiveLogs() {
  const [machines, setMachines] = useState<{ ip: string; username: string }[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const [logPath, setLogPath] = useState<string>("/var/log/syslog");
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const logsEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMachines();
  }, []);

  useEffect(() => {
    if (isStreaming) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isStreaming]);

  const loadMachines = async () => {
    const { data, error } = await supabase.functions.invoke('get-machine-configs');
    
    if (error) {
      toast({
        title: "Failed to load machines",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    if (data?.machines) {
      setMachines(data.machines);
    }
  };

  const startStreaming = async () => {
    if (!selectedMachine || !logPath) {
      toast({
        title: "Missing information",
        description: "Please select a machine and enter log path",
        variant: "destructive"
      });
      return;
    }

    setIsStreaming(true);
    setLogs([]);

    try {
      // Call edge function to start log streaming via WebSocket
      const { data, error } = await supabase.functions.invoke('stream-logs', {
        body: {
          machineIp: selectedMachine,
          logPath: logPath
        }
      });

      if (error) throw error;

      // Set up real-time channel for log updates
      const channel = supabase
        .channel(`logs-${selectedMachine}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'live_logs',
            filter: `machine_ip=eq.${selectedMachine}`
          },
          (payload) => {
            const newLog: LogLine = {
              id: payload.new.id,
              timestamp: payload.new.timestamp,
              level: payload.new.level || 'info',
              message: payload.new.message
            };
            setLogs(prev => [...prev, newLog]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      toast({
        title: "Streaming failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
      setIsStreaming(false);
    }
  };

  const stopStreaming = async () => {
    setIsStreaming(false);
    
    await supabase.functions.invoke('stop-log-stream', {
      body: { machineIp: selectedMachine }
    });

    toast({
      title: "Streaming stopped",
      description: "Log streaming has been stopped"
    });
  };

  const downloadLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`
    ).join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${selectedMachine}-${new Date().toISOString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600';
      case 'warn': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      case 'debug': return 'text-gray-600';
      default: return 'text-foreground';
    }
  };

  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Activity className="w-8 h-8" />
          Live Logs Viewer
        </h1>
        <p className="text-muted-foreground">
          Stream real-time logs from your Linux machines
        </p>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Log Stream Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Machine</Label>
              <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                <SelectTrigger>
                  <SelectValue placeholder="Select machine" />
                </SelectTrigger>
                <SelectContent>
                  {machines.map((machine) => (
                    <SelectItem key={machine.ip} value={machine.ip}>
                      {machine.ip} ({machine.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Log Path</Label>
              <Input
                placeholder="/var/log/syslog"
                value={logPath}
                onChange={(e) => setLogPath(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <div className="flex gap-2">
                {!isStreaming ? (
                  <Button onClick={startStreaming} className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Start Stream
                  </Button>
                ) : (
                  <Button onClick={stopStreaming} variant="destructive" className="flex-1">
                    <Pause className="w-4 h-4 mr-2" />
                    Stop Stream
                  </Button>
                )}
                <Button onClick={downloadLogs} variant="outline" disabled={logs.length === 0}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Log Stream</CardTitle>
            <div className="flex items-center gap-2">
              {isStreaming && (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Streaming</span>
                </div>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <div className="h-full overflow-y-auto p-4 bg-black/5 dark:bg-black/20 font-mono text-sm">
            {filteredLogs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {isStreaming ? "Waiting for logs..." : "Select a machine and start streaming"}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="flex gap-4 hover:bg-muted/50 px-2 py-1 rounded">
                    <span className="text-muted-foreground flex-shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`font-semibold flex-shrink-0 w-16 ${getLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="flex-1 break-all">{log.message}</span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
