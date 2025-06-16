import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Play, Pause, Download, Filter, AlertTriangle } from "lucide-react";
import { generateMockLog } from "../../services/logService";

export function LogsExplorer() {
  const [logs, setLogs] = useState([]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [expandedLog, setExpandedLog] = useState(null);
  const logsEndRef = useRef(null);

  const sources = ["all", "auth-service", "payment-service", "user-service", "notification-service", "database"];
  const severities = ["all", "info", "warning", "error", "debug"];

  // Simulate log generation
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const newLog = generateMockLog();
      setLogs(prev => [newLog, ...prev].slice(0, 1000)); // Keep last 1000 logs
    }, Math.random() * 3000 + 1000); // Random interval between 1-4s

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logsEndRef.current && isStreaming) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isStreaming]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = selectedSource === "all" || log.source === selectedSource;
    const matchesSeverity = selectedSeverity === "all" || log.level === selectedSeverity;
    
    return matchesSearch && matchesSource && matchesSeverity;
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
    return new Date(timestamp).toLocaleString();
  };

  const truncateMessage = (message, maxLength = 100) => {
    return message.length > maxLength ? message.substring(0, maxLength) + "..." : message;
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between p-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold">Logs Explorer</h2>
          <p className="text-muted-foreground">Search and filter system logs in real-time</p>
        </div>
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

      <div className="px-6 pb-4 flex-shrink-0">
        <Card>
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
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map(source => (
                    <SelectItem key={source} value={source}>
                      {source === "all" ? "All Sources" : source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  {severities.map(severity => (
                    <SelectItem key={severity} value={severity}>
                      {severity === "all" ? "All Severities" : severity.toUpperCase()}
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
      </div>

      <div className="flex-1 px-6 pb-6 min-h-0">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle>Log Stream</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <div className="h-full overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead className="w-[180px]">Timestamp</TableHead>
                    <TableHead className="w-[80px]">Level</TableHead>
                    <TableHead className="w-[150px]">Source</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow 
                      key={log.id} 
                      className={`${log.level === 'error' ? 'bg-destructive/5' : ''} hover:bg-muted/50`}
                    >
                      <TableCell className="font-mono text-xs">
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getLevelColor(log.level)} className="text-xs">
                          {log.level.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {log.source}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">
                            {expandedLog === log.id ? log.message : truncateMessage(log.message)}
                          </p>
                          {log.message.length > 100 && (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                            >
                              {expandedLog === log.id ? "Show less" : "Show more"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.level === 'error' && (
                          <Button variant="outline" size="sm">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Ticket
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div ref={logsEndRef} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
