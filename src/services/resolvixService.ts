
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type LogLevel = Database['public']['Enums']['log_level'];
type TicketStatus = Database['public']['Enums']['ticket_status'];
type TicketPriority = Database['public']['Enums']['ticket_priority'];

export interface LogEntry {
  id?: string;
  timestamp?: string;
  level: LogLevel;
  source: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface Ticket {
  id?: string;
  log_id?: string;
  created_by?: string;
  assignee?: string;
  status: TicketStatus;
  priority: TicketPriority;
  title: string;
  description?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessage {
  id?: string;
  ticket_id: string;
  user_id: string;
  message: string;
  attachments?: Record<string, any>;
  created_at?: string;
}

export interface Recommendation {
  id?: string;
  ticket_id: string;
  title: string;
  description?: string;
  url?: string;
  created_at?: string;
}

export class ResolvixService {
  // Log ingestion
  static async ingestLog(log: LogEntry) {
    console.log('Ingesting log:', log);
    
    const { data, error } = await supabase.functions.invoke('log-ingestion', {
      body: log
    });

    if (error) {
      console.error('Error ingesting log:', error);
      throw error;
    }

    return data;
  }

  // Ticket operations
  static async getTickets(filters?: {
    status?: TicketStatus;
    priority?: TicketPriority;
    assignee?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.assignee) params.append('assignee', filters.assignee);

    const { data, error } = await supabase.functions.invoke('tickets-api', {
      body: { method: 'GET', params: params.toString() }
    });

    if (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }

    return data;
  }

  static async getTicket(id: string) {
    const { data, error } = await supabase.functions.invoke('tickets-api', {
      body: { method: 'GET', ticketId: id }
    });

    if (error) {
      console.error('Error fetching ticket:', error);
      throw error;
    }

    return data;
  }

  static async createTicket(ticket: Omit<Ticket, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase.functions.invoke('tickets-api', {
      body: { method: 'POST', ...ticket }
    });

    if (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }

    return data;
  }

  static async updateTicket(id: string, updates: Partial<Ticket>) {
    const { data, error } = await supabase.functions.invoke('tickets-api', {
      body: { method: 'PATCH', ticketId: id, ...updates }
    });

    if (error) {
      console.error('Error updating ticket:', error);
      throw error;
    }

    return data;
  }

  // Chat operations
  static async getChatMessages(ticketId: string) {
    const { data, error } = await supabase.functions.invoke('chat-api', {
      body: { method: 'GET', ticketId }
    });

    if (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }

    return data;
  }

  static async postChatMessage(message: Omit<ChatMessage, 'id' | 'created_at'>) {
    const { data, error } = await supabase.functions.invoke('chat-api', {
      body: { method: 'POST', ...message }
    });

    if (error) {
      console.error('Error posting chat message:', error);
      throw error;
    }

    return data;
  }

  // AI Recommendations
  static async getRecommendations(ticketId: string) {
    const { data, error } = await supabase.functions.invoke('ai-recommendations', {
      body: { method: 'GET', ticketId }
    });

    if (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }

    return data;
  }

  static async generateRecommendations(ticketId: string) {
    const { data, error } = await supabase.functions.invoke('ai-recommendations', {
      body: { method: 'POST', ticketId }
    });

    if (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }

    return data;
  }

  // Realtime subscriptions
  static subscribeToTickets(callback: (payload: any) => void) {
    return supabase
      .channel('tickets-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tickets'
      }, callback)
      .subscribe();
  }

  static subscribeToChat(ticketId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`chat-${ticketId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `ticket_id=eq.${ticketId}`
      }, callback)
      .subscribe();
  }
}
