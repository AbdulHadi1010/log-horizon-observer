
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, User, Clock } from "lucide-react";
import { Ticket, ChatMessage, generateMockTickets, generateMockChatMessages } from "../../services/ticketService";
import { CollapsibleAIAssistant } from "./CollapsibleAIAssistant";

interface TicketDetailsProps {
  ticketId: string;
  onBack: () => void;
}

export function TicketDetails({ ticketId, onBack }: TicketDetailsProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Load ticket details
    const mockTickets = generateMockTickets(25);
    const foundTicket = mockTickets.find(t => t.id === ticketId);
    if (foundTicket) {
      setTicket(foundTicket);
      setChatMessages(generateMockChatMessages(ticketId, 8));
    }
  }, [ticketId]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      ticketId,
      userId: "current-user",
      userName: "Current User",
      message: newMessage,
      timestamp: new Date().toISOString(),
      type: "user"
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  const handleAiMessage = async (aiQuery: string) => {
    // Simulate AI response
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: `ai-${Date.now()}`,
          ticketId,
          userId: "ai",
          userName: "AI Assistant",
          message: `Based on the error logs, this appears to be a database connection timeout issue. I recommend checking: 1) Database server health, 2) Connection pool configuration, 3) Network connectivity between services. Similar issues were resolved in tickets TKT-045 and TKT-078.`,
          timestamp: new Date().toISOString(),
          type: "ai"
        };
        
        setChatMessages(prev => [...prev, aiResponse]);
        resolve();
      }, 2000);
    });
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "destructive";
      case "in-progress": return "secondary";
      case "resolved": return "default";
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

  if (!ticket) {
    return <div className="p-6">Loading ticket details...</div>;
  }

  const teamChatMessages = chatMessages.filter(msg => msg.type !== 'ai');

  return (
    <div className="h-full flex flex-col relative">
      {/* Ticket Information Header - Full Width */}
      <div className="border-b bg-card">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div>
              <h2 className="text-2xl font-bold">{ticket.id}: {ticket.title}</h2>
              <p className="text-muted-foreground">Created {formatTimestamp(ticket.createdAt)}</p>
            </div>
          </div>

          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-2">
                    <Badge variant={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Priority</label>
                  <div className="mt-2">
                    <Badge variant={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Assignee</label>
                  <p className="text-sm mt-2 font-medium">{ticket.assignee || "Unassigned"}</p>
                </div>
                <div className="md:col-span-1 col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm mt-2">{ticket.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Team Chat - 60% width, fills remaining height */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full w-full max-w-[60%] p-6">
          <Card className="h-full flex flex-col">
            <CardHeader className="border-b">
              <CardTitle>Team Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {teamChatMessages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      {message.type === 'system' ? (
                        <Clock className="w-4 h-4 text-primary-foreground" />
                      ) : (
                        <User className="w-4 h-4 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{message.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm bg-muted/50 rounded-lg p-3 break-words">
                        {message.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
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

      {/* Collapsible AI Assistant */}
      <CollapsibleAIAssistant
        ticketId={ticketId}
        chatMessages={chatMessages}
        onSendMessage={handleAiMessage}
      />
    </div>
  );
}
