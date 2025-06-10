
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react";

export function Dashboard() {
  const stats = [
    {
      title: "Total Logs Today",
      value: "1,247",
      icon: FileText,
      change: "+12%"
    },
    {
      title: "Open Tickets",
      value: "23",
      icon: AlertTriangle,
      change: "+3"
    },
    {
      title: "Resolved Today",
      value: "18",
      icon: CheckCircle,
      change: "+15%"
    },
    {
      title: "Avg Resolution Time",
      value: "2.4h",
      icon: Clock,
      change: "-0.3h"
    }
  ];

  const recentTickets = [
    { id: "TKT-001", title: "Database connection timeout", priority: "high", status: "open" },
    { id: "TKT-002", title: "API rate limit exceeded", priority: "medium", status: "in-progress" },
    { id: "TKT-003", title: "Memory leak in service", priority: "high", status: "open" },
    { id: "TKT-004", title: "Authentication failure", priority: "low", status: "resolved" }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "default";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "destructive";
      case "in-progress": return "secondary";
      case "resolved": return "default";
      default: return "outline";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your logs and incidents</p>
      </div>

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
              <p className="text-xs text-muted-foreground">
                {stat.change} from yesterday
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{ticket.id}</p>
                    <p className="text-sm text-muted-foreground">{ticket.title}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                    <Badge variant={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Log Ingestion Rate</span>
                <Badge variant="default">Normal</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Error Detection</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Assistant</span>
                <Badge variant="default">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Notification Queue</span>
                <Badge variant="secondary">3 pending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
