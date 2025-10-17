import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, User, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CollapsibleAIAssistant } from "./CollapsibleAIAssistant";

interface TicketDetailsProps {
  ticketId: string;
  onBack: () => void;
}

interface Ticket {
  id: string;
  assignees: string [];
  status: "open" | "in-progress" | "in-queue" | "resolved" | "closed" | "reopened";
  priority: "low" | "medium" | "high" | "critical";
  severity: string | null;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
  application: string | null;
  log_line: string | null;
  system_ip: string | null;
  timestamp: string | null;
  log_path: string | null;
}

interface ChatMessage {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  type: "user" | "ai" | "system";
}

export function TicketDetails({ ticketId, onBack }: TicketDetailsProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);  
  const userCacheRef = useRef<Record<string, string>>({});

  const statuses = ["open", "in-progress", "in-queue", "resolved", "closed", "reopened"];
  const priorities = ["low", "medium", "high", "critical"];
  const severities = ["error", "warn", "high", "critical"];
  const [assigneeProfiles, setAssigneeProfiles] = useState<{ id: string; full_name: string }[]>([]);

useEffect(() => {
  if (ticket?.assignees?.length) {
    const fetchAssignees = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", ticket.assignees);

      if (error) {
  console.error("Error fetching assignee profiles:", error);
} else {
  setAssigneeProfiles(
    (data || []).map((a) => ({
      id: a.id,
      full_name: a.full_name ?? "Unknown", // fallback
    }))
  );
}
    };
    fetchAssignees();
  }
}, [ticket?.assignees]);

 useEffect(() => {
  if (!ticketId) return;

  console.log("Subscribed to channel for ticket:", ticketId);
  console.log("Supabase client:", supabase);

  // Fetch ticket details
  const fetchTicket = async () => {
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (error) {
      console.error("Error fetching ticket:", error);
      return;
    }
    setTicket(data);
  };

  // Fetch existing messages - optimized without join
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching chat messages:", error);
      return;
    }

    // Get unique user IDs
    const userIds = [...new Set((data || []).map(msg => msg.user_id).filter(Boolean))];
    
    // Batch fetch all user profiles at once
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);

    // Build cache from profiles
    const initialCache: Record<string, string> = {};
    (profiles || []).forEach(p => {
      initialCache[p.id] = p.full_name || "Unknown";
    });

    // Format messages using cache
    const formatted = (data || []).map((msg: any) => ({
      id: msg.id,
      ticketId: msg.ticket_id,
      userId: msg.user_id,
      userName: initialCache[msg.user_id] || "Unknown",
      message: msg.message,
      timestamp: msg.created_at,
      type: "user" as ChatMessage["type"],
    } as ChatMessage));

    setChatMessages(formatted);
    userCacheRef.current = initialCache;
  };

  fetchTicket();
  fetchMessages();

  // Realtime subscription: receive raw row, then lookup/cached userName
  const channel = supabase
    .channel("public:chat_messages")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
      },
      (payload) => {
        const msg = payload.new;
        console.log("Realtime payload received:", msg);

        // only handle current ticket
        if (msg.ticket_id !== ticketId) return;

        // helper to append message with a resolved userName
        const appendMessage = (userName: string) => {
          setChatMessages((prev) => [
            ...prev,
            {
              id: msg.id,
              ticketId: msg.ticket_id,
              userId: msg.user_id,
              userName,
              message: msg.message,
              timestamp: msg.created_at,
              type: "user" as ChatMessage["type"],
            },
          ]);
        };

        // If user_id present, try to use cache first
        if (msg.user_id) {
          const cached = userCacheRef.current[msg.user_id];
          if (cached) {
            appendMessage(cached);
            return;
          }

          // not cached — fetch profile asynchronously and cache it
          (async () => {
            try {
              const { data: profile, error } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", msg.user_id)
                .single();

              if (error) {
                console.error("Profile lookup error for user_id", msg.user_id, error);
                appendMessage("Unknown");
                return;
              }

              const name = profile?.full_name || "Unknown";
              // update cache
              userCacheRef.current = { ...userCacheRef.current, [msg.user_id]: name };
              appendMessage(name);
            } catch (err) {
              console.error("Unexpected error fetching profile:", err);
              appendMessage("Unknown");
            }
          })();

          return;
        }

        // no user_id on row
        appendMessage("Unknown");
      }
    )
    .subscribe((status) => {
      console.log("Subscription status:", status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}, [ticketId]);


  const updateTicket = async (field: Partial<Ticket>) => {
    if (!ticket) return;
    const updatedTicket = { ...ticket, ...field };
    setTicket(updatedTicket);

    const { error } = await supabase
      .from("tickets")
      .update({ ...field, updated_at: new Date().toISOString() })
      .eq("id", ticket.id);

    if (error) console.error("Error updating ticket:", error);
  };

 const handleSendMessage = async () => {
  if (!newMessage.trim()) return;

  // Get the currently logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.error("User not logged in");
    return;
  }

  await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { error } = await supabase.from("chat_messages").insert([
    {
      ticket_id: ticketId,
      user_id: user.id,
      message: newMessage.trim(),
    },
  ]);

  if (error) console.error("Error sending message:", error);
  else setNewMessage("");
};




  const handleAiMessage = async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: `ai-${Date.now()}`,
          ticketId,
          userId: "ai",
          userName: "AI Assistant",
          message: "AI assistant response based on logs...",
          timestamp: new Date().toISOString(),
          type: "ai"
        };
        setChatMessages(prev => [...prev, aiResponse]);
        resolve();
      }, 2000);
    });
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleString();
  };

  // Auto-scroll whenever chatMessages changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  if (!ticket) return <div className="p-6">Loading ticket details...</div>;

 
  const teamChatMessages = chatMessages.filter(
  (msg) => assigneeProfiles.some((a) => a.id === msg.userId)
);


  return (
    <div className="h-full flex flex-col relative">
      {/* Header & Ticket Details */}
      <div className="border-b bg-card">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <h2 className="text-2xl font-bold">{ticket.id}</h2>
              <p className="text-muted-foreground">Created {formatTimestamp(ticket.created_at)}</p>
            </div>
          </div>

          {/* Ticket Details Card */}
          <Card className="shadow-sm">
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6"> <div> <label className="text-sm font-medium text-muted-foreground">Status</label> <Select value={ticket.status} onValueChange={(val) => updateTicket({ status: val as Ticket["status"] })}> <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger> <SelectContent> {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)} </SelectContent> </Select> </div> <div> <label className="text-sm font-medium text-muted-foreground">Priority</label> <Select value={ticket.priority} onValueChange={(val) => updateTicket({ priority: val as Ticket["priority"] })}> <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger> <SelectContent> {priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)} </SelectContent> </Select> </div> <div> <label className="text-sm font-medium text-muted-foreground">Severity</label> <Select value={ticket.severity || ""} onValueChange={(val) => updateTicket({ severity: val })}> <SelectTrigger><SelectValue placeholder="Select severity" /></SelectTrigger> <SelectContent> {severities.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)} </SelectContent> </Select> </div> <div className="md:col-span-1 col-span-2"> <label className="text-sm font-medium text-muted-foreground">Description</label> <Input placeholder="Enter description..." value={ticket.description || ""} onChange={(e) => updateTicket({ description: e.target.value })} className="mt-2" /> </div> </div> 
              {/* Other Details */} <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4"> <div>
  <label className="text-sm font-medium text-muted-foreground">Assignees</label>
  <p className="mt-2">
    {assigneeProfiles.length > 0
      ? assigneeProfiles.map((a) => a.full_name).join(", ")
      : "Unassigned"}
  </p>
</div>
 <div> <label className="text-sm font-medium text-muted-foreground">Application</label> <p className="mt-2">{ticket.application || "-"}</p> </div> <div> <label className="text-sm font-medium text-muted-foreground">System IP</label> <p className="mt-2">{ticket.system_ip || "-"}</p> </div> <div> <label className="text-sm font-medium text-muted-foreground">Log Path</label> <p className="mt-2">{ticket.log_path || "-"}</p> </div> </div> <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4"> <div> <label className="text-sm font-medium text-muted-foreground">Timestamp</label> <p className="mt-2">{ticket.timestamp ? formatTimestamp(ticket.timestamp) : "-"}</p> </div> <div> <label className="text-sm font-medium text-muted-foreground">Created At</label> <p className="mt-2">{ticket.created_at ? formatTimestamp(ticket.created_at) : "-"}</p> </div> <div> <label className="text-sm font-medium text-muted-foreground">Updated At</label> <p className="mt-2">{ticket.updated_at ? formatTimestamp(ticket.updated_at) : "-"}</p> </div> </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Log Line Section */}
      <div className="mt-6 px-6">
        <Card className="shadow-sm rounded-lg">
          <CardHeader className="border-b">
            <CardTitle>Log Line</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <pre className="font-mono text-sm text-black break-words whitespace-pre-wrap">
              {ticket.log_line || "No log line available."}
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* Chat Section */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full w-full max-w-[60%] p-6">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b">
              <CardTitle>Team Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {teamChatMessages.map(msg => (
                  <div key={msg.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      {msg.type === 'system' ? <Clock className="w-4 h-4 text-primary-foreground" /> : <User className="w-4 h-4 text-primary-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{msg.userName}</span>
                        <span className="text-xs text-muted-foreground">{formatTimestamp(msg.timestamp)}</span>
                      </div>
                      <p className="text-sm bg-muted/50 rounded-lg p-3 break-words">{msg.message}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} /> {/* <-- Auto-scroll target */}
              </div>

              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <CollapsibleAIAssistant
        ticketId={ticketId}
        chatMessages={chatMessages}
        onSendMessage={handleAiMessage}
      />
    </div>
  );
}
