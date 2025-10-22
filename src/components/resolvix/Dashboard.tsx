import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, FileText, Ticket, Users } from "lucide-react";

type TicketType = {
   id: string;
  description: string | null;  // ✅ allow null
  status: "open" | "in-progress" | "in-queue" | "resolved" | "closed" | "reopened";
  application: string | null;  // ✅ allow null
  system_ip: string | null
};

export function Dashboard() {
  const [stats, setStats] = useState({
    openTickets: 0,
    resolvedToday: 0,
    activeNodes: 0,
    teamMembers: 0,
  });
  const [recentTickets, setRecentTickets] = useState<TicketType[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Open Tickets
    const { count: openTickets } = await supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("status", "open");

    // Resolved Today (status = 'resolved')
    const { count: resolvedToday } = await supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .eq("status", "resolved");

    // Active Nodes
    const { count: activeNodes } = await supabase
      .from("system_info")
      .select("*", { count: "exact", head: true });

    // Team Members
    const { count: teamMembers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // 3 Most Recent Tickets
    const { data: ticketsData } = await supabase
      .from("tickets")
      .select("id, description, status, application, system_ip")
      .order("created_at", { ascending: false })
      .limit(3);

    setStats({
      openTickets: openTickets || 0,
      resolvedToday: resolvedToday || 0,
      activeNodes: activeNodes || 0,
      teamMembers: teamMembers || 0,
    });

    setRecentTickets(ticketsData || []);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-700";
      case "open":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const statsArray = [
    { title: "Open Tickets", value: stats.openTickets, icon: Ticket, color: "text-red-500" },
    { title: "Resolved Today", value: stats.resolvedToday, icon: CheckCircle, color: "text-green-500" },
    { title: "Active Nodes", value: stats.activeNodes, icon: FileText, color: "text-blue-500" },
    { title: "Team Members", value: stats.teamMembers, icon: Users, color: "text-purple-500" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your systems.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsArray.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
             <stat.icon className={`w-4 h-4 ${stat.color}`} />

            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Recent Tickets</CardTitle>
              <CardDescription>
                Latest incident tickets requiring attention
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => (window.location.href = "http://localhost:8080/tickets")}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{ticket.id}</span>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {ticket.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>{ticket.application || "Unknown App"}</span>
                      <span>{ticket.system_ip}</span>
                    </div>
                  </div>
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}