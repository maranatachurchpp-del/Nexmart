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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alert_configurations: {
        Row: {
          alert_type: string
          created_at: string | null
          enabled: boolean | null
          id: string
          notification_channels: string[] | null
          threshold_value: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          notification_channels?: string[] | null
          threshold_value?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          notification_channels?: string[] | null
          threshold_value?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      alert_history: {
        Row: {
          actionable_insight: string | null
          alert_type: string
          category: string
          created_at: string | null
          description: string
          id: string
          is_resolved: boolean | null
          metadata: Json | null
          priority: string
          resolved_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          actionable_insight?: string | null
          alert_type: string
          category: string
          created_at?: string | null
          description: string
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          priority: string
          resolved_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          actionable_insight?: string | null
          alert_type?: string
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          priority?: string
          resolved_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      feature_permissions: {
        Row: {
          can_delete: boolean | null
          can_export: boolean | null
          can_read: boolean | null
          can_write: boolean | null
          created_at: string | null
          feature: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          can_delete?: boolean | null
          can_export?: boolean | null
          can_read?: boolean | null
          can_write?: boolean | null
          created_at?: string | null
          feature: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          can_delete?: boolean | null
          can_export?: boolean | null
          can_read?: boolean | null
          can_write?: boolean | null
          created_at?: string | null
          feature?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      lead_rate_limits: {
        Row: {
          count: number
          created_at: string
          key: string
          reset_at: string
          updated_at: string
        }
        Insert: {
          count?: number
          created_at?: string
          key: string
          reset_at: string
          updated_at?: string
        }
        Update: {
          count?: number
          created_at?: string
          key?: string
          reset_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          converted_at: string | null
          created_at: string | null
          email: string
          id: string
          metadata: Json | null
          source: string | null
        }
        Insert: {
          converted_at?: string | null
          created_at?: string | null
          email: string
          id?: string
          metadata?: Json | null
          source?: string | null
        }
        Update: {
          converted_at?: string | null
          created_at?: string | null
          email?: string
          id?: string
          metadata?: Json | null
          source?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          category: string | null
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          id: string
          paid_at: string | null
          status: string
          stripe_invoice_id: string | null
          subscription_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          id?: string
          paid_at?: string | null
          status: string
          stripe_invoice_id?: string | null
          subscription_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          id?: string
          paid_at?: string | null
          status?: string
          stripe_invoice_id?: string | null
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      product_snapshots: {
        Row: {
          created_at: string | null
          giro_ideal_mes: number | null
          id: string
          marcas_atuais: number | null
          margem_atual: number | null
          participacao_faturamento: number | null
          preco_medio: number | null
          product_id: string
          quebra_atual: number | null
          ruptura_atual: number | null
          snapshot_date: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          giro_ideal_mes?: number | null
          id?: string
          marcas_atuais?: number | null
          margem_atual?: number | null
          participacao_faturamento?: number | null
          preco_medio?: number | null
          product_id: string
          quebra_atual?: number | null
          ruptura_atual?: number | null
          snapshot_date: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          giro_ideal_mes?: number | null
          id?: string
          marcas_atuais?: number | null
          margem_atual?: number | null
          participacao_faturamento?: number | null
          preco_medio?: number | null
          product_id?: string
          quebra_atual?: number | null
          ruptura_atual?: number | null
          snapshot_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_snapshots_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          categoria: string
          classificacao_kvi:
            | Database["public"]["Enums"]["classificacao_kvi"]
            | null
          codigo: string
          created_at: string | null
          departamento: string
          descricao: string
          giro_ideal_mes: number | null
          id: string
          marcas_atuais: number | null
          marcas_max: number | null
          marcas_min: number | null
          margem_a_max: number | null
          margem_a_min: number | null
          participacao_faturamento: number | null
          preco_medio_max: number | null
          preco_medio_min: number | null
          quebra_atual: number | null
          quebra_esperada: number | null
          ruptura_atual: number | null
          ruptura_esperada: number | null
          status: Database["public"]["Enums"]["status_produto"] | null
          subcategoria: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          categoria: string
          classificacao_kvi?:
            | Database["public"]["Enums"]["classificacao_kvi"]
            | null
          codigo: string
          created_at?: string | null
          departamento: string
          descricao: string
          giro_ideal_mes?: number | null
          id?: string
          marcas_atuais?: number | null
          marcas_max?: number | null
          marcas_min?: number | null
          margem_a_max?: number | null
          margem_a_min?: number | null
          participacao_faturamento?: number | null
          preco_medio_max?: number | null
          preco_medio_min?: number | null
          quebra_atual?: number | null
          quebra_esperada?: number | null
          ruptura_atual?: number | null
          ruptura_esperada?: number | null
          status?: Database["public"]["Enums"]["status_produto"] | null
          subcategoria: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          categoria?: string
          classificacao_kvi?:
            | Database["public"]["Enums"]["classificacao_kvi"]
            | null
          codigo?: string
          created_at?: string | null
          departamento?: string
          descricao?: string
          giro_ideal_mes?: number | null
          id?: string
          marcas_atuais?: number | null
          marcas_max?: number | null
          marcas_min?: number | null
          margem_a_max?: number | null
          margem_a_min?: number | null
          participacao_faturamento?: number | null
          preco_medio_max?: number | null
          preco_medio_min?: number | null
          quebra_atual?: number | null
          quebra_esperada?: number | null
          ruptura_atual?: number | null
          ruptura_esperada?: number | null
          status?: Database["public"]["Enums"]["status_produto"] | null
          subcategoria?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          annual_revenue: string | null
          company_name: string | null
          created_at: string | null
          dashboard_layout: Json | null
          experience_level: string | null
          focus_areas: string[] | null
          id: string
          name: string | null
          store_count: number | null
          stripe_customer_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          annual_revenue?: string | null
          company_name?: string | null
          created_at?: string | null
          dashboard_layout?: Json | null
          experience_level?: string | null
          focus_areas?: string[] | null
          id?: string
          name?: string | null
          store_count?: number | null
          stripe_customer_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          annual_revenue?: string | null
          company_name?: string | null
          created_at?: string | null
          dashboard_layout?: Json | null
          experience_level?: string | null
          focus_areas?: string[] | null
          id?: string
          name?: string | null
          store_count?: number | null
          stripe_customer_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      report_history: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          file_url: string | null
          id: string
          recipients_notified: string[] | null
          report_type: string
          scheduled_report_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          file_url?: string | null
          id?: string
          recipients_notified?: string[] | null
          report_type: string
          scheduled_report_id?: string | null
          status: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          file_url?: string | null
          id?: string
          recipients_notified?: string[] | null
          report_type?: string
          scheduled_report_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_history_scheduled_report_id_fkey"
            columns: ["scheduled_report_id"]
            isOneToOne: false
            referencedRelation: "scheduled_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_reports: {
        Row: {
          created_at: string | null
          day_of_month: number | null
          day_of_week: number | null
          filters: Json | null
          frequency: string
          id: string
          is_active: boolean | null
          last_run_at: string | null
          name: string
          next_run_at: string | null
          recipients: string[]
          report_type: string
          time_of_day: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          filters?: Json | null
          frequency: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          recipients: string[]
          report_type: string
          time_of_day?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          day_of_month?: number | null
          day_of_week?: number | null
          filters?: Json | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          recipients?: string[]
          report_type?: string
          time_of_day?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_users: number | null
          name: string
          price_monthly: number
          stripe_price_id: string | null
          trial_days: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_users?: number | null
          name: string
          price_monthly?: number
          stripe_price_id?: string | null
          trial_days?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_users?: number | null
          name?: string
          price_monthly?: number
          stripe_price_id?: string | null
          trial_days?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: string
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status?: string
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: string
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_feature_permission: {
        Args: { _feature: string; _permission: string; _user_id: string }
        Returns: boolean
      }
      create_audit_log:
        | {
            Args: {
              _action: string
              _entity_id?: string
              _entity_type: string
              _metadata?: Json
              _new_values?: Json
              _old_values?: Json
            }
            Returns: string
          }
        | {
            Args: {
              _action: string
              _entity_id?: string
              _entity_type: string
              _metadata?: Json
              _new_values?: Json
              _old_values?: Json
              _user_id: string
            }
            Returns: string
          }
      create_sample_produtos: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      generate_daily_snapshots: { Args: never; Returns: undefined }
      get_current_user_roles: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "moderator"
      classificacao_kvi: "Alta" | "Média" | "Baixa"
      status_produto: "success" | "warning" | "destructive"
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
      app_role: ["admin", "user", "moderator"],
      classificacao_kvi: ["Alta", "Média", "Baixa"],
      status_produto: ["success", "warning", "destructive"],
    },
  },
} as const
