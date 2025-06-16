import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Play, Pause, Download, Filter } from "lucide-react";

export function LogsView() {
  const [logs, setLogs] = useState([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNode, setSelectedNode] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const logsEndRef = useRef(null);

  const nodes = ["all", "master-node-01", "master-node-02", "worker-node-01", "worker-node-02", "worker-node-03"];
  const levels = ["all", "info", "warning", "error", "debug"];

  // Simulate log generation
  useEffect(() => {
    if (!isStreaming) return;

    const generateLog = () => {
      const nodeNames = ["master-node-01", "master-node-02", "worker-node-01", "worker-node-02", "worker-node-03"];
      const services = ["kubelet", "kube-proxy", "containerd", "etcd", "kube-apiserver", "nginx"];
      const logLevels = ["info", "warning", "error", "debug"];
      const messages = [
        "Successfully processed request",
        "Container started successfully",
        "Health check passed",
        "Configuration loaded",
        "Memory usage: 45%",
        "Network connection established",
        "Backup operation completed",
        "Certificate renewal required",
        "High CPU usage detected",
        "Pod scheduling completed",
        "Log rotation performed",
        "Authentication successful"
      ];

      return {
        id: Date.now().toString() + Math.random(),
        timestamp: new Date().toISOString(),
        node: nodeNames[Math.floor(Math.random() * nodeNames.length)],
        level: logLevels[Math.floor(Math.random() * logLevels.length)],
        service: services[Math.floor(Math.random() * services.length)],
        message: messages[Math.floor(Math.random() * messages.length)]
      };
    };

    const interval = setInterval(() => {
      const newLog = generateLog();
      setLogs(prev => [...prev, newLog].slice(-1000)); // Keep last 1000 logs
    }, Math.random() * 2000 + 500); // Random interval between 500ms and 2.5s

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNode = selectedNode === "all" || log.node === selectedNode;
    const matchesLevel = selectedLevel === "all" || log.level === selectedLevel;
    
    return matchesSearch && matchesNode && matchesLevel;
  });

  const getLevelColor = (level) => {
    switch (level) {
      case "error":
        return "destructive";
      case "warning":
        return "secondary";
      case "info":
        return "default";
      case "debug":
        return "outline";
      default:
        return "outline";
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Live Logs</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsStreaming(!isStreaming)}
            variant={isStreaming ? "default" : "outline"}
            size="sm"
          >
            {isStreaming ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
            {isStreaming ? "Pause" : "Resume"}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      <Card className="flex-shrink-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedNode} onValueChange={setSelectedNode}>
              <SelectTrigger>
                <SelectValue placeholder="Select node" />
              </SelectTrigger>
              <SelectContent>
                {nodes.map(node => (
                  <SelectItem key={node} value={node}>
                    {node === "all" ? "All Nodes" : node}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map(level => (
                  <SelectItem key={level} value={level}>
                    {level === "all" ? "All Levels" : level.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{filteredLogs.length} entries</Badge>
              {isStreaming && (
                <Badge variant="default" className="animate-pulse">
                  Live
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle>Log Stream</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto bg-slate-900 dark:bg-slate-950 rounded-lg p-4 font-mono text-sm">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex gap-3 text-green-400 mb-1 hover:bg-slate-800 dark:hover:bg-slate-900 px-2 py-1 rounded"
              >
                <span className="text-slate-500 min-w-[80px]">
                  {formatTimestamp(log.timestamp)}
                </span>
                <span className="text-blue-400 min-w-[120px] truncate">
                  {log.node}
                </span>
                <Badge 
                  variant={getLevelColor(log.level)}
                  className="text-xs min-w-[60px] justify-center"
                >
                  {log.level.toUpperCase()}
                </Badge>
                <span className="text-yellow-400 min-w-[100px] truncate">
                  {log.service}
                </span>
                <span className="text-white flex-1">
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
