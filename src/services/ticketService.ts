export interface ChatMessage {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  type: 'user' | 'ai' | 'system';
}

export interface Ticket {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'in-queue' | 'resolved' | 'closed';
  assignee: string;
  created: string;
  messages: number;
  description?: string;
  chatMessages?: ChatMessage[];
}

const names = ["Abdul Hadi", "Noor", "Nimra", "Ahmed", "Usman", "Unassigned"];
const titles = [
  "Database connection timeout",
  "API rate limit exceeded",
  "Memory leak in user service",
  "Cache invalidation issues",
  "SSL certificate expired",
  "Authentication service down",
  "Payment gateway integration failure",
  "Email delivery failures",
  "File upload corruption",
];

const priorities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
const statuses: Array<'open' | 'in-progress' | 'in-queue' | 'resolved' | 'closed'> = ['open', 'in-progress', 'in-queue', 'resolved', 'closed'];

export function generateMockTickets(count: number): Ticket[] {
  const tickets: Ticket[] = [];
  for (let i = 0; i < count; i++) {
    const ticketNumber = String(i + 1).padStart(3, '0');
    tickets.push({
      id: `TKT-${ticketNumber}`,
      title: titles[Math.floor(Math.random() * titles.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      assignee: names[Math.floor(Math.random() * names.length)],
      created: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      messages: Math.floor(Math.random() * 15) + 1,
    });
  }
  return tickets;
}
