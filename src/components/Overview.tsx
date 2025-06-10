
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Activity, AlertTriangle, CheckCircle } from "lucide-react";

export function Overview() {
  const stats = [
    {
      title: "Total Nodes",
      value: "12",
      icon: Server,
      status: "healthy"
    },
    {
      title: "Active Agents",
      value: "11",
      icon: Activity,
      status: "healthy"
    },
    {
      title: "Warnings",
      value: "3",
      icon: AlertTriangle,
      status: "warning"
    },
    {
      title: "System Health",
      value: "98.5%",
      icon: CheckCircle,
      status: "healthy"
    }
  ];

  const recentEvents = [
    { time: "14:32:15", node: "worker-node-01", event: "Agent connected", level: "info" },
    { time: "14:31:48", node: "master-node-02", event: "High CPU usage detected", level: "warning" },
    { time: "14:30:22", node: "worker-node-03", event: "Log rotation completed", level: "info" },
    { time: "14:29:55", node: "worker-node-01", event: "Memory usage normalized", level: "info" },
    { time: "14:28:11", node: "master-node-01", event: "Backup completed successfully", level: "info" }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <Badge 
                variant={stat.status === "healthy" ? "default" : "destructive"}
                className="mt-2"
              >
                {stat.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cluster Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Master Nodes</span>
                <Badge variant="default">3/3 Ready</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Worker Nodes</span>
                <Badge variant="default">9/9 Ready</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Log Agents</span>
                <Badge variant="secondary">11/12 Connected</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEvents.map((event, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <div className="text-muted-foreground min-w-[60px]">
                    {event.time}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{event.node}</div>
                    <div className="text-muted-foreground">{event.event}</div>
                  </div>
                  <Badge 
                    variant={event.level === "warning" ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {event.level}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
