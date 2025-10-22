
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Ticket {
  id: string;
  assignees: { id: string; full_name: string }[];
  status: "open" | "in-progress" | "in-queue" | "resolved" | "closed" | "reopened";
  priority: "low" | "medium" | "high" | "critical";
  description: string | null;
  created_at: string;  // allow null
  updated_at: string | null;  // allow null
  severity: string | null;
  log_line: string | null;
  application: string | null;
  system_ip: string | null;
  timestamp: string | null;
  log_path: string | null;
}


interface TicketSystemProps {
  onTicketSelect: (ticketId: string) => void;
}

export function TicketSystem({ onTicketSelect }: TicketSystemProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [availableProfiles, setAvailableProfiles] = useState<
  { id: string; full_name: string }[]
>([]);

  const statuses = ["all", "open", "in-progress", "in-queue", "resolved", "closed", "reopened"];
  const priorities = ["all", "low", "medium", "high", "critical"];
  const [isModalOpen, setIsModalOpen] = useState(false);
const [newTicketData, setNewTicketData] = useState<Partial<Ticket>>({
  status: "open",
  priority: "low",
  severity: null,
  description: "",
  assignees: [],
  application: "",
  system_ip: "",
  log_path: "",
  log_line: "",
  timestamp: null,
});
   
  useEffect(() => {
  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name");

    if (error) {
      console.error("Error fetching profiles:", error);
    } else {
      const cleaned = (data || []).map((p) => ({
        id: p.id,
        full_name: p.full_name ?? "Unnamed User", // fallback if null
      }));
      setAvailableProfiles(cleaned);
    }
  };

  fetchProfiles();
}, []);



  useEffect(() => {
     const fetchTickets = async () => {
    setLoading(true);

    const { data, error } = await supabase
  .rpc("get_tickets_with_assignees"); // this already includes names


    if (error) {
      console.error("Error fetching tickets:", error);
      setLoading(false);
      return;
    }

    if (data) {
  const ticketsWithDefaults: Ticket[] = data.map((t: any) => ({
    id: t.id,
    assignees: t.assignees || [],   // ✅ comes from SQL function
    status: t.status,
    priority: t.priority,
    description: t.description ?? null,
    created_at: t.created_at ?? new Date().toISOString(),
    updated_at: t.updated_at ?? new Date().toISOString(),
    severity: t.severity ?? null,
    log_line: t.log_line ?? null,
    application: t.application ?? null,
    system_ip: t.system_ip ?? null,
    timestamp: t.log_timestamp ?? null, // ✅ we renamed in SQL function
    log_path: t.log_path ?? null,
  }));

  setTickets(ticketsWithDefaults);
}



    setLoading(false);
  };

  fetchTickets();
}, []);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = searchTerm === "" || 

      ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || ticket.status === selectedStatus;
    const matchesPriority = selectedPriority === "all" || ticket.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "destructive";
      case "in-progress": return "secondary";
      case "in-queue": return "outline";
      case "resolved": return "default";
      case "closed": return "outline";
      case "reopened": return "destructive";
      default: return "outline";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "default";
      default: return "outline";
    }
  };
  const getSeverityColor = (severity: string | null) => {
  switch (severity) {
    case "critical":
      return "destructive";
    case "high":
      return "destructive";
    case "error":
      return "destructive";
    case "warn":
      return "secondary";
    default:
      return "outline";
  }
};


  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ticket System</h2>
          <p className="text-muted-foreground">Manage incidents and error reports</p>
        </div>
        <Button onClick={() => {
  setIsModalOpen(true);
  setNewTicketData({ // reset every time modal opens
    status: "open",
    priority: "low",
    severity: null,
    description: "",
    assignees:[],
    application: "",
    system_ip: "",
    log_path: "",
    log_line: "",
    timestamp: null,
  });
}}>
  <Plus className="w-4 h-4 mr-1" />
  New Ticket
</Button>

      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map(priority => (
                  <SelectItem key={priority} value={priority}>
                    {priority === "all" ? "All Priorities" : priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center">
              <Badge variant="outline">{filteredTickets.length} tickets</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono">{ticket.id}</TableCell>
              
                  <TableCell>
                    <Badge variant={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
  {ticket.assignees.length > 0
    ? ticket.assignees.map(a => a.full_name).join(", ")
    : "Unassigned"}
</TableCell>

                  <TableCell>{formatTimestamp(ticket.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant={getSeverityColor(ticket.severity)}>
                      {ticket.severity}
                      </Badge>
                      </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onTicketSelect(ticket.id)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto"> {/* bigger dialog */}
    <DialogHeader>
      <DialogTitle>Create New Ticket</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      {/* Ticket ID (auto-generated, read-only) */}
      <div>
        <p className="font-semibold mb-1">Ticket ID</p>
        <Input
          value={newTicketData.id || "Auto-generated"}
          disabled
        />
      </div>

      {/* Description */}
      <div>
        <p className="font-semibold mb-1">Description</p>
        <Input
          placeholder="Description"
          value={newTicketData.description || ""}
          onChange={(e) =>
            setNewTicketData((prev) => ({ ...prev, description: e.target.value }))
          }
        />
      </div>

      {/* Priority */}
      <div>
        <p className="font-semibold mb-1">Priority</p>
        <Select
          value={newTicketData.priority || "low"}
          onValueChange={(val) =>
            setNewTicketData((prev) => ({ ...prev, priority: val as Ticket["priority"] }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            {["low", "medium", "high", "critical"].map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Severity */}
      <div>
        <p className="font-semibold mb-1">Severity</p>
        <Select
          value={newTicketData.severity || ""}
          onValueChange={(val) => setNewTicketData((prev) => ({ ...prev, severity: val }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            {["error", "warn", "high", "critical"].map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

  
      {/* Assignees */}
<div>
  <p className="font-semibold mb-1">Assignees (max 3)</p>
  <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
    {availableProfiles.map((p) => {
      const isSelected = newTicketData.assignees?.some((a) => a.id === p.id);

      return (
        <label key={p.id} className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isSelected}
            disabled={
              !isSelected && (newTicketData.assignees?.length || 0) >= 3
            }
            onChange={(e) => {
              setNewTicketData((prev) => {
                let updatedAssignees = prev.assignees || [];

                if (e.target.checked) {
                  // add user if not already added
                  updatedAssignees = [
                    ...updatedAssignees,
                    { id: p.id, full_name: p.full_name },
                  ];
                } else {
                  // remove user
                  updatedAssignees = updatedAssignees.filter((a) => a.id !== p.id);
                }

                return { ...prev, assignees: updatedAssignees };
              });
            }}
          />
          <span>{p.full_name}</span>
        </label>
      );
    })}
  </div>
  <p className="text-xs text-muted-foreground">
    You can assign up to 3 people.
  </p>
</div>


      {/* Created At */}
      <div>
        <p className="font-semibold mb-1">Created At (auto-filled)</p>
        <Input
          value={newTicketData.created_at || new Date().toISOString()}
          disabled
        />
      </div>

      {/* Application */}
      <div>
        <p className="font-semibold mb-1">Application</p>
        <Input
          placeholder="Application"
          value={newTicketData.application || ""}
          onChange={(e) => setNewTicketData((prev) => ({ ...prev, application: e.target.value }))}
        />
      </div>

      {/* System IP */}
      <div>
        <p className="font-semibold mb-1">System IP</p>
        <Input
          placeholder="System IP"
          value={newTicketData.system_ip || ""}
          onChange={(e) => setNewTicketData((prev) => ({ ...prev, system_ip: e.target.value }))}
        />
      </div>

      {/* Log Path */}
      <div>
        <p className="font-semibold mb-1">Log Path</p>
        <Input
          placeholder="Log Path"
          value={newTicketData.log_path || ""}
          onChange={(e) => setNewTicketData((prev) => ({ ...prev, log_path: e.target.value }))}
        />
      </div>

      {/* Log Line */}
      <div>
        <p className="font-semibold mb-1">Log Line</p>
        <Input
          placeholder="Log Line"
          value={newTicketData.log_line || ""}
          onChange={(e) => setNewTicketData((prev) => ({ ...prev, log_line: e.target.value }))}
        />
      </div>

      {/* Timestamp */}
      <div>
        <p className="font-semibold mb-1">Timestamp</p>
        <Input
          value={newTicketData.timestamp || new Date().toISOString()}
    disabled
        />
      </div>
    </div>

    <div className="flex justify-end gap-2 pt-4">
      <Button variant="outline" onClick={() => setIsModalOpen(false)}>
        Cancel
      </Button>
      <Button
        onClick={async () => {
          // Ensure all required fields are set
          const ticketToInsert = {
            ...newTicketData,
            assignees: (newTicketData.assignees || []).map(a => a.id),
            timestamp: newTicketData.timestamp === "" ? null : newTicketData.timestamp,
            created_at: newTicketData.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { data, error } = await supabase
            .from("tickets")
            .insert([ticketToInsert])
            .select();

          if (error) {
            console.error("Insert error:", error);
            alert("Failed to save ticket. Check console for details.");
            return;
          }

          if (data && data.length > 0) {
            const newTicketFromDb: Ticket = {
              id: data[0].id,
              status: data[0].status,
              priority: data[0].priority,
              severity: data[0].severity ?? null,
              description: data[0].description ?? "",
             assignees: (newTicketData.assignees || []).map(a => ({
      id: a.id,
      full_name: a.full_name,
    })),
              application: data[0].application ?? "",
              system_ip: data[0].system_ip ?? "",
              log_path: data[0].log_path ?? "",
              log_line: data[0].log_line ?? "",
              timestamp: data[0].timestamp ?? null,
              created_at: data[0].created_at ?? new Date().toISOString(),
              updated_at: data[0].updated_at ?? new Date().toISOString(),
            };

            setTickets((prev) => [newTicketFromDb, ...prev]);
            setIsModalOpen(false);
          }
        }}
      >
        Save
      </Button>
    </div>
  </DialogContent>
</Dialog>



    </div>
  );
}
