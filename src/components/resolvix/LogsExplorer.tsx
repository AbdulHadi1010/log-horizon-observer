"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Play, Pause, Download, Filter, Server } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Log {
  id: string;
  timestamp: string;
  level: string;
  source?: string;
  metadata: { raw_log: string };
  created_at?: string;
 
}

interface SystemNode {
  id: string;
  Hostname: string;
  OS: string;
  OS_Version: string;
  OS_Release: string;
  Machine_Architecture: string;
  MAC_address: string;
  IP_address: string;
  Total_RAM_GB: number;
  Total_Disk_GB: number;
  Disk_Used_GB: number;
  Disk_Free_GB: number;
  Disk_Usage_Percentage: number;
  CPU_Physical_Core: number;
  CPU_logical_Core: number;
}

export function LogsExplorer() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedNode, setSelectedNode] = useState<string>("");
  const [nodes, setNodes] = useState<SystemNode[]>([]);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLTableRowElement | null>(null);
  const channelRef = useRef<any>(null);

  const severities = ["all", "info", "warning", "error", "debug"];

  // 🔹 Fetch available nodes
  useEffect(() => {
    const fetchNodes = async () => {
      const { data, error } = await supabase
        .from("system_info")
        .select("*")
        .order("Hostname");

      if (error) {
        console.error("Error fetching nodes:", error);
        toast.error("Failed to load nodes");
        return;
      }
      setNodes(data || []);
    };

    fetchNodes();
  }, []);

  // 🔹 Setup realtime log streaming (Option A)
  useEffect(() => {
    if (!isStreaming || !selectedNode) {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    console.log("Setting up realtime subscription for node:", selectedNode);
    console.log("[DEBUG] Subscribing for:", selectedNode);
    const channel = supabase
      .channel("realtime:logs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "logs"

 },
        (payload) => {
          console.log("New log received:", payload.new);
          setLogs((prev) => [payload.new as Log, ...prev].slice(0, 1000));
        }
      )
      .subscribe((status) => {
      console.log("[DEBUG] Subscription status changed:", status);
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isStreaming, selectedNode]);

  // 🔹 Auto-scroll when new logs arrive
  useEffect(() => {
    if (logsEndRef.current && isStreaming) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isStreaming]);

  // 🔹 Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      (log.metadata?.raw_log || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesSeverity =
      selectedSeverity === "all" || log.level === selectedSeverity;

    return matchesSearch && matchesSeverity;
  });

  // 🔹 Start / Stop streaming
  const handleToggleStreaming = async () => {
    if (!selectedNode) {
      toast.error("Please select a node first");
      return;
    }

    const selectedNodeInfo = nodes.find((n) => n.IP_address === selectedNode);
    if (!selectedNodeInfo) {
      toast.error("Selected node info not found");
      return;
    }

    if (!isStreaming) {
      // Call backend to start agent
      const res = await fetch("http://localhost:3000/api/logs_starter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ node_ip: selectedNodeInfo.IP_address }),
      });

      if (res.ok) {
        toast.success(`Started log collection for ${selectedNodeInfo.Hostname}`);
        setIsStreaming(true);
      } else {
        toast.error("Failed to start collector");
        const error = await res.json();
        console.error(error);
      }
    } else {
      setIsStreaming(false);
      toast.info("Log collection stopped");
    }
  };

  // 🔹 Node selection change
  const handleNodeChange = (nodeId: string) => {
    setLogs([]);
    setSelectedNode(nodeId);
    setIsStreaming(false);
  };

  // 🔹 Export logs as JSON
  const handleExport = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `logs-export-${new Date().toISOString()}.json`;
    link.click();
    toast.success("Logs exported successfully");
  };

  // 🔹 Get color for severity badge
  const getSeverityColor = (level: string) => {
    const colors: Record<string, string> = {
      info: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      error: "bg-red-500/10 text-red-500 border-red-500/20",
      debug: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };
    return colors[level] || colors.info;
  };

  const selectedNodeInfo = nodes.find((n) => n.id === selectedNode);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Logs Explorer</h1>
            <p className="text-muted-foreground mt-1">
              Real-time log monitoring and analysis
            </p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" /> Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Severity</label>
              <Select
                value={selectedSeverity}
                onValueChange={setSelectedSeverity}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {severities.map((sev) => (
                    <SelectItem key={sev} value={sev}>
                      {sev.charAt(0).toUpperCase() + sev.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Node Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" /> Node
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Select Node</label>
                <Select value={selectedNode} onValueChange={handleNodeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a node to monitor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {nodes.map((node) => (
                      <SelectItem key={node.id} value={node.IP_address}>
                        {node.Hostname} ({node.IP_address})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleToggleStreaming}
                disabled={!selectedNode}
                variant={isStreaming ? "destructive" : "default"}
                className="min-w-[120px]"
              >
                {isStreaming ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" /> Start
                  </>
                )}
              </Button>
            </div>

            {selectedNodeInfo && (
              <div className="text-sm text-muted-foreground mt-2">
                Monitoring:{" "}
                <span className="font-medium text-foreground">
                  {selectedNodeInfo.Hostname}
                </span>{" "}
                - {selectedNodeInfo.IP_address}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Live Logs</CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isStreaming ? "bg-green-500 animate-pulse" : "bg-gray-400"
                    }`}
                  />
                  <span className="text-sm text-muted-foreground">
                    {isStreaming ? "Streaming" : "Paused"}
                  </span>
                </div>
                <Badge variant="outline">{filteredLogs.length} logs</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-[180px]">Timestamp</TableHead>
                      <TableHead className="w-[100px]">Level</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <tr ref={logsEndRef} />
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center py-8 text-muted-foreground"
                        >
                          {selectedNode
                            ? isStreaming
                              ? "Waiting for logs..."
                              : "Click Start to begin streaming logs"
                            : "Select a node to view logs"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow
                          key={log.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() =>
                            setExpandedLog(
                              expandedLog === log.id ? null : log.id
                            )
                          }
                        >
                          <TableCell className="font-mono text-xs">
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getSeverityColor(log.level)}
                            >
                              {log.level}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div
                              className={
                                expandedLog === log.id ? "" : "truncate"
                              }
                            >
                              {log.metadata?.raw_log}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default LogsExplorer;
