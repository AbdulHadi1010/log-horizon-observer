export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      assignment_tracker: {
        Row: {
          id: number
          last_index: number | null
          role: string | null
        }
        Insert: {
          id?: number
          last_index?: number | null
          role?: string | null
        }
        Update: {
          id?: number
          last_index?: number | null
          role?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          attachments: Json | null
          created_at: string | null
          id: string
          message: string
          ticket_id: string | null
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          message: string
          ticket_id?: string | null
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          id?: string
          message?: string
          ticket_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      live_logs: {
        Row: {
          created_at: string
          id: string
          level: string | null
          log_path: string
          machine_ip: string
          message: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: string | null
          log_path: string
          machine_ip: string
          message: string
          timestamp?: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: string | null
          log_path?: string
          machine_ip?: string
          message?: string
          timestamp?: string
        }
        Relationships: []
      }
      logs: {
        Row: {
          created_at: string | null
          id: string
          level: Database["public"]["Enums"]["log_level"]
          message: string
          metadata: Json | null
          source: string
          timestamp: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          level: Database["public"]["Enums"]["log_level"]
          message: string
          metadata?: Json | null
          source: string
          timestamp?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: Database["public"]["Enums"]["log_level"]
          message?: string
          metadata?: Json | null
          source?: string
          timestamp?: string
        }
        Relationships: []
      }
      machine_configs: {
        Row: {
          created_at: string
          encrypted_password: string
          id: string
          ip_address: string
          status: string | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          encrypted_password: string
          id?: string
          ip_address: string
          status?: string | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          encrypted_password?: string
          id?: string
          ip_address?: string
          status?: string | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          joining_date: string | null
          location: string | null
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          joining_date?: string | null
          location?: string | null
          phone_number?: string | null
          role: Database["public"]["Enums"]["user_role"]
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          joining_date?: string | null
          location?: string | null
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          id: string
          log_line: string
          recommendation: string | null
        }
        Insert: {
          id?: string
          log_line: string
          recommendation?: string | null
        }
        Update: {
          id?: string
          log_line?: string
          recommendation?: string | null
        }
        Relationships: []
      }
      system_info: {
        Row: {
          CPU_logical_Core: number | null
          CPU_Physical_Core: number | null
          Disk_Free_GB: number | null
          Disk_Usage_Percentage: number | null
          Disk_Used_GB: number | null
          Hostname: string | null
          id: number
          IP_address: string | null
          MAC_address: string | null
          Machine_Architecture: string | null
          OS: string | null
          OS_Release: string | null
          OS_Version: string | null
          Total_Disk_GB: number | null
          Total_RAM_GB: number | null
        }
        Insert: {
          CPU_logical_Core?: number | null
          CPU_Physical_Core?: number | null
          Disk_Free_GB?: number | null
          Disk_Usage_Percentage?: number | null
          Disk_Used_GB?: number | null
          Hostname?: string | null
          id?: number
          IP_address?: string | null
          MAC_address?: string | null
          Machine_Architecture?: string | null
          OS?: string | null
          OS_Release?: string | null
          OS_Version?: string | null
          Total_Disk_GB?: number | null
          Total_RAM_GB?: number | null
        }
        Update: {
          CPU_logical_Core?: number | null
          CPU_Physical_Core?: number | null
          Disk_Free_GB?: number | null
          Disk_Usage_Percentage?: number | null
          Disk_Used_GB?: number | null
          Hostname?: string | null
          id?: number
          IP_address?: string | null
          MAC_address?: string | null
          Machine_Architecture?: string | null
          OS?: string | null
          OS_Release?: string | null
          OS_Version?: string | null
          Total_Disk_GB?: number | null
          Total_RAM_GB?: number | null
        }
        Relationships: []
      }
      tickets: {
        Row: {
          application: string | null
          assignees: string[] | null
          created_at: string | null
          description: string | null
          id: string
          log_line: string | null
          log_path: string | null
          priority: Database["public"]["Enums"]["ticket_priority"]
          severity: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          system_ip: string | null
          timestamp: string | null
          updated_at: string | null
        }
        Insert: {
          application?: string | null
          assignees?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          log_line?: string | null
          log_path?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          severity?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          system_ip?: string | null
          timestamp?: string | null
          updated_at?: string | null
        }
        Update: {
          application?: string | null
          assignees?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          log_line?: string | null
          log_path?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          severity?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          system_ip?: string | null
          timestamp?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_tickets_with_assignees: {
        Args: Record<PropertyKey, never>
        Returns: {
          application: string
          assignees: Json
          created_at: string
          description: string
          id: string
          log_line: string
          log_path: string
          log_timestamp: string
          priority: string
          severity: string
          status: string
          system_ip: string
          updated_at: string
        }[]
      }
      get_user_primary_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      uuid_array_to_names: {
        Args: { "": string[] }
        Returns: string[]
      }
    }
    Enums: {
      log_level: "debug" | "info" | "warning" | "error"
      ticket_priority: "low" | "medium" | "high" | "critical"
      ticket_status:
        | "open"
        | "in-progress"
        | "in-queue"
        | "resolved"
        | "closed"
        | "reopened"
      user_role: "admin" | "engineer" | "support"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      log_level: ["debug", "info", "warning", "error"],
      ticket_priority: ["low", "medium", "high", "critical"],
      ticket_status: [
        "open",
        "in-progress",
        "in-queue",
        "resolved",
        "closed",
        "reopened",
      ],
      user_role: ["admin", "engineer", "support"],
    },
  },
} as const
