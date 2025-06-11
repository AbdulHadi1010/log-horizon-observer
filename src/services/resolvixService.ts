import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type LogLevel = Database['public']['Enums']['log_level'];
type TicketStatus = Database['public']['Enums']['ticket_status'];
type TicketPriority = Database['public']['Enums']['ticket_priority'];
type UserRole = Database['public']['Enums']['user_role'];

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
  log?: LogEntry;
  created_by_profile?: {
    id: string;
    full_name?: string;
    email?: string;
  };
  assignee_profile?: {
    id: string;
    full_name?: string;
    email?: string;
  };
}

export interface ChatMessage {
  id?: string;
  ticket_id: string;
  user_id: string;
  message: string;
  attachments?: Record<string, any>;
  created_at?: string;
  user?: {
    id: string;
    full_name?: string;
    email?: string;
  };
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
  // Log operations using direct Supabase client
  static async getLogs(filters?: {
    level?: LogLevel;
    source?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (filters?.level) {
      query = query.eq('level', filters.level);
    }
    if (filters?.source) {
      query = query.eq('source', filters.source);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

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

  // Ticket operations using Edge Functions for complex logic
  static async getTickets(filters?: {
    status?: TicketStatus;
    priority?: TicketPriority;
    assignee?: string;
  }) {
    let query = supabase
      .from('tickets')
      .select(`
        *,
        log:logs(*),
        created_by_profile:profiles!tickets_created_by_fkey(*),
        assignee_profile:profiles!tickets_assignee_fkey(*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }
    if (filters?.assignee) {
      query = query.eq('assignee', filters.assignee);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async getTicket(id: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        log:logs(*),
        created_by_profile:profiles!tickets_created_by_fkey(*),
        assignee_profile:profiles!tickets_assignee_fkey(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async createTicket(ticket: Omit<Ticket, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        ...ticket,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateTicket(id: string, updates: Partial<Ticket>) {
    const { data, error } = await supabase
      .from('tickets')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Chat operations using direct Supabase for simplicity
  static async getChatMessages(ticketId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        user:profiles(*)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async postChatMessage(message: Omit<ChatMessage, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        ...message,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        user:profiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  // AI Recommendations
  static async getRecommendations(ticketId: string) {
    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async generateRecommendations(ticketId: string) {
    const { data, error } = await supabase.functions.invoke('ai-recommendations', {
      body: { ticketId }
    });

    if (error) throw error;
    return data;
  }

  // Users for assignee dropdowns
  static async getUsers(role?: UserRole) {
    let query = supabase
      .from('profiles')
      .select('id, full_name, email, role');

    if (role) {
      query = query.eq('role', role);
    }

    const { data, error } = await query;
    if (error) throw error;
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

  static subscribeToChatUpdates(ticketId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`chat-updates-${ticketId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: `ticket_id=eq.${ticketId}`
      }, callback)
      .subscribe();
  }
}
