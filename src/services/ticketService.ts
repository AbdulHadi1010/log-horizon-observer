
import { LogEntry } from "./logService";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "in-queue" | "resolved" | "closed" | "reopened";
  assignee?: string;
  createdAt: string;
  updatedAt: string;
  logSnapshot?: LogEntry;
  messageCount: number;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  type: "user" | "system" | "ai";
}

export const generateMockTickets = (count: number): Ticket[] => {
  const titles = [
    "Database connection timeout",
    "Payment gateway integration failure",
    "Authentication service down",
    "Memory leak in user service",
    "API rate limit exceeded",
    "SSL certificate expired",
    "Email delivery failures",
    "Cache invalidation issues",
    "File upload corruption",
    "Webhook delivery failures"
  ];

  const assignees = ["John Doe", "Jane Smith", "Bob Johnson", "Alice Wilson", "Charlie Brown"];
  const priorities: Ticket["priority"][] = ["low", "medium", "high", "critical"];
  const statuses: Ticket["status"][] = ["open", "in-progress", "in-queue", "resolved", "closed"];

  return Array.from({ length: count }, (_, index) => {
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const title = titles[Math.floor(Math.random() * titles.length)];
    
    return {
      id: `TKT-${String(index + 1).padStart(3, '0')}`,
      title,
      description: `Automatically generated ticket for: ${title}. This issue was detected through automated log monitoring and requires immediate attention.`,
      priority,
      status,
      assignee: Math.random() > 0.3 ? assignees[Math.floor(Math.random() * assignees.length)] : undefined,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      messageCount: Math.floor(Math.random() * 15) + 1,
      tags: ["auto-generated", "error-detection", priority]
    };
  });
};

export const generateMockChatMessages = (ticketId: string, count: number): ChatMessage[] => {
  const users = [
    { id: "user1", name: "John Doe" },
    { id: "user2", name: "Jane Smith" },
    { id: "ai", name: "AI Assistant" },
    { id: "system", name: "System" }
  ];

  const messages = [
    "I'm investigating this issue now",
    "Found the root cause - it's related to the database connection pool",
    "Applied a temporary fix, monitoring for improvements",
    "The error rate has decreased significantly",
    "Need to update the configuration to prevent this in the future",
    "Ticket resolved - monitoring for 24h to ensure stability"
  ];

  return Array.from({ length: count }, (_, index) => {
    const user = users[Math.floor(Math.random() * users.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    return {
      id: `msg-${ticketId}-${index}`,
      ticketId,
      userId: user.id,
      userName: user.name,
      message,
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      type: user.id === "ai" ? "ai" : user.id === "system" ? "system" : "user"
    };
  });
};
