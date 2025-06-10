
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Bot, User, Clock } from "lucide-react";
import { Ticket, ChatMessage, generateMockTickets, generateMockChatMessages } from "../../services/ticketService";

interface TicketDetailsProps {
  ticketId: string;
  onBack: () => void;
}

export function TicketDetails({ ticketId, onBack }: TicketDetailsProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);

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

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return;

    setIsLoadingAi(true);
    
    // Simulate AI response
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
      setAiQuery("");
      setIsLoadingAi(false);
    }, 2000);
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{ticket.id}: {ticket.title}</h2>
          <p className="text-muted-foreground">Created {formatTimestamp(ticket.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Info */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <div className="mt-1">
                <Badge variant={getStatusColor(ticket.status)}>
                  {ticket.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <div className="mt-1">
                <Badge variant={getPriorityColor(ticket.priority)}>
                  {ticket.priority}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Assignee</label>
              <p className="text-sm mt-1">{ticket.assignee || "Unassigned"}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <p className="text-sm mt-1">{ticket.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Team Chat */}
        <Card>
          <CardHeader>
            <CardTitle>Team Chat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-96 overflow-y-auto space-y-3 border rounded p-3">
              {chatMessages.filter(msg => msg.type !== 'ai').map((message) => (
                <div key={message.id} className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    {message.type === 'system' ? (
                      <Clock className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <User className="w-4 h-4 text-primary-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{message.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{message.message}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Assistant */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-96 overflow-y-auto space-y-3 border rounded p-3">
              {chatMessages.filter(msg => msg.type === 'ai').map((message) => (
                <div key={message.id} className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">AI Assistant</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{message.message}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="Ask the AI about this ticket..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                rows={3}
              />
              <Button 
                onClick={handleAiQuery}
                disabled={isLoadingAi}
                className="w-full"
              >
                {isLoadingAi ? "Thinking..." : "Ask AI"}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              AI can help with error analysis, suggested fixes, and finding related tickets.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
