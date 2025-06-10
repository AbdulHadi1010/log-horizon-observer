
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Server, Cpu, HardDrive, Activity, Eye } from "lucide-react";

interface Node {
  id: string;
  name: string;
  type: "master" | "worker";
  status: "ready" | "not-ready" | "warning";
  cpu: string;
  memory: string;
  disk: string;
  agentStatus: "connected" | "disconnected";
  lastSeen: string;
}

export function NodesView() {
  const nodes: Node[] = [
    {
      id: "1",
      name: "master-node-01",
      type: "master",
      status: "ready",
      cpu: "15%",
      memory: "62%",
      disk: "45%",
      agentStatus: "connected",
      lastSeen: "2s ago"
    },
    {
      id: "2",
      name: "master-node-02",
      type: "master",
      status: "warning",
      cpu: "85%",
      memory: "78%",
      disk: "52%",
      agentStatus: "connected",
      lastSeen: "1s ago"
    },
    {
      id: "3",
      name: "master-node-03",
      type: "master",
      status: "ready",
      cpu: "22%",
      memory: "45%",
      disk: "38%",
      agentStatus: "connected",
      lastSeen: "3s ago"
    },
    {
      id: "4",
      name: "worker-node-01",
      type: "worker",
      status: "ready",
      cpu: "45%",
      memory: "67%",
      disk: "89%",
      agentStatus: "connected",
      lastSeen: "1s ago"
    },
    {
      id: "5",
      name: "worker-node-02",
      type: "worker",
      status: "ready",
      cpu: "32%",
      memory: "54%",
      disk: "72%",
      agentStatus: "connected",
      lastSeen: "4s ago"
    },
    {
      id: "6",
      name: "worker-node-03",
      type: "worker",
      status: "not-ready",
      cpu: "0%",
      memory: "0%",
      disk: "0%",
      agentStatus: "disconnected",
      lastSeen: "2m ago"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "default";
      case "warning":
        return "secondary";
      case "not-ready":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Cluster Nodes</h2>
        <div className="flex gap-2">
          <Badge variant="default">{nodes.filter(n => n.status === "ready").length} Ready</Badge>
          <Badge variant="secondary">{nodes.filter(n => n.status === "warning").length} Warning</Badge>
          <Badge variant="destructive">{nodes.filter(n => n.status === "not-ready").length} Not Ready</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {nodes.map((node) => (
          <Card key={node.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  {node.name}
                </CardTitle>
                <Badge variant={getStatusColor(node.status)}>
                  {node.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {node.type}
                </Badge>
                <Badge 
                  variant={node.agentStatus === "connected" ? "default" : "destructive"}
                  className="text-xs"
                >
                  Agent {node.agentStatus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3 h-3" />
                    CPU
                  </span>
                  <span className="font-mono">{node.cpu}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Memory
                  </span>
                  <span className="font-mono">{node.memory}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3" />
                    Disk
                  </span>
                  <span className="font-mono">{node.disk}</span>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Last seen: {node.lastSeen}</span>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  <Eye className="w-3 h-3 mr-1" />
                  View Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
