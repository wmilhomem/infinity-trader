export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      badges: {
        Row: {
          descricao: string | null;
          earned_at: string;
          id: string;
          slug: string;
          titulo: string;
          user_id: string;
        };
        Insert: {
          descricao?: string | null;
          earned_at?: string;
          id?: string;
          slug: string;
          titulo: string;
          user_id: string;
        };
        Update: {
          descricao?: string | null;
          earned_at?: string;
          id?: string;
          slug?: string;
          titulo?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      behavior_patterns: {
        Row: {
          descricao: string | null;
          detected_at: string;
          id: string;
          metricas: Json | null;
          pattern_key: string;
          severidade: string;
          titulo: string;
          user_id: string;
        };
        Insert: {
          descricao?: string | null;
          detected_at?: string;
          id?: string;
          metricas?: Json | null;
          pattern_key: string;
          severidade?: string;
          titulo: string;
          user_id: string;
        };
        Update: {
          descricao?: string | null;
          detected_at?: string;
          id?: string;
          metricas?: Json | null;
          pattern_key?: string;
          severidade?: string;
          titulo?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: {
          content: string;
          created_at: string;
          id: string;
          parts: Json | null;
          role: string;
          thread_id: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: string;
          parts?: Json | null;
          role: string;
          thread_id: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: string;
          parts?: Json | null;
          role?: string;
          thread_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey";
            columns: ["thread_id"];
            isOneToOne: false;
            referencedRelation: "chat_threads";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_threads: {
        Row: {
          context_ref: string | null;
          context_type: string;
          contexto: Json | null;
          created_at: string;
          id: string;
          titulo: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          context_ref?: string | null;
          context_type?: string;
          contexto?: Json | null;
          created_at?: string;
          id?: string;
          titulo?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          context_ref?: string | null;
          context_type?: string;
          contexto?: Json | null;
          created_at?: string;
          id?: string;
          titulo?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      checklists: {
        Row: {
          completo: boolean;
          created_at: string;
          diary_entry_id: string | null;
          id: string;
          respostas: Json;
          simulation_id: string | null;
          user_id: string;
        };
        Insert: {
          completo?: boolean;
          created_at?: string;
          diary_entry_id?: string | null;
          id?: string;
          respostas?: Json;
          simulation_id?: string | null;
          user_id: string;
        };
        Update: {
          completo?: boolean;
          created_at?: string;
          diary_entry_id?: string | null;
          id?: string;
          respostas?: Json;
          simulation_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "checklists_diary_entry_id_fkey";
            columns: ["diary_entry_id"];
            isOneToOne: false;
            referencedRelation: "diary_entries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "checklists_simulation_id_fkey";
            columns: ["simulation_id"];
            isOneToOne: false;
            referencedRelation: "simulations";
            referencedColumns: ["id"];
          },
        ];
      };
      cheques_cognitivos: {
        Row: {
          created_at: string;
          emocao: string;
          id: string;
          motivo: string;
          regra_id: string | null;
          sinal: Json | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          emocao: string;
          id?: string;
          motivo: string;
          regra_id?: string | null;
          sinal?: Json | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          emocao?: string;
          id?: string;
          motivo?: string;
          regra_id?: string | null;
          sinal?: Json | null;
          user_id?: string;
        };
        Relationships: [];
      };
      decision_memory: {
        Row: {
          contexto: Json | null;
          created_at: string;
          diary_entry_id: string | null;
          emocao: string | null;
          estrategia: string | null;
          id: string;
          licao_aprendida: string | null;
          motivo: string | null;
          resultado: number | null;
          simulation_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          contexto?: Json | null;
          created_at?: string;
          diary_entry_id?: string | null;
          emocao?: string | null;
          estrategia?: string | null;
          id?: string;
          licao_aprendida?: string | null;
          motivo?: string | null;
          resultado?: number | null;
          simulation_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          contexto?: Json | null;
          created_at?: string;
          diary_entry_id?: string | null;
          emocao?: string | null;
          estrategia?: string | null;
          id?: string;
          licao_aprendida?: string | null;
          motivo?: string | null;
          resultado?: number | null;
          simulation_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "decision_memory_diary_entry_id_fkey";
            columns: ["diary_entry_id"];
            isOneToOne: false;
            referencedRelation: "diary_entries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "decision_memory_simulation_id_fkey";
            columns: ["simulation_id"];
            isOneToOne: false;
            referencedRelation: "simulations";
            referencedColumns: ["id"];
          },
        ];
      };
      decision_scores: {
        Row: {
          breakdown: Json;
          created_at: string;
          diary_entry_id: string | null;
          id: string;
          score: number;
          user_id: string;
        };
        Insert: {
          breakdown?: Json;
          created_at?: string;
          diary_entry_id?: string | null;
          id?: string;
          score?: number;
          user_id: string;
        };
        Update: {
          breakdown?: Json;
          created_at?: string;
          diary_entry_id?: string | null;
          id?: string;
          score?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "decision_scores_diary_entry_id_fkey";
            columns: ["diary_entry_id"];
            isOneToOne: false;
            referencedRelation: "diary_entries";
            referencedColumns: ["id"];
          },
        ];
      };
      diary_entries: {
        Row: {
          ativo: string;
          checklist: Json | null;
          created_at: string;
          decision_score: number | null;
          emocao: string | null;
          estrutura: string;
          id: string;
          interpretacao: Json | null;
          licao_aprendida: string | null;
          motivo: string | null;
          resultado: number | null;
          rule_id: string | null;
          seguiu_regra: boolean | null;
          simulation_id: string | null;
          status: string;
          user_id: string;
        };
        Insert: {
          ativo: string;
          checklist?: Json | null;
          created_at?: string;
          decision_score?: number | null;
          emocao?: string | null;
          estrutura: string;
          id?: string;
          interpretacao?: Json | null;
          licao_aprendida?: string | null;
          motivo?: string | null;
          resultado?: number | null;
          rule_id?: string | null;
          seguiu_regra?: boolean | null;
          simulation_id?: string | null;
          status?: string;
          user_id: string;
        };
        Update: {
          ativo?: string;
          checklist?: Json | null;
          created_at?: string;
          decision_score?: number | null;
          emocao?: string | null;
          estrutura?: string;
          id?: string;
          interpretacao?: Json | null;
          licao_aprendida?: string | null;
          motivo?: string | null;
          resultado?: number | null;
          rule_id?: string | null;
          seguiu_regra?: boolean | null;
          simulation_id?: string | null;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "diary_entries_rule_id_fkey";
            columns: ["rule_id"];
            isOneToOne: false;
            referencedRelation: "personal_rules";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "diary_entries_simulation_id_fkey";
            columns: ["simulation_id"];
            isOneToOne: false;
            referencedRelation: "simulations";
            referencedColumns: ["id"];
          },
        ];
      };
      learning_recommendations: {
        Row: {
          created_at: string;
          id: string;
          lesson_slug: string;
          motivo: string | null;
          status: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          lesson_slug: string;
          motivo?: string | null;
          status?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          lesson_slug?: string;
          motivo?: string | null;
          status?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      lessons_progress: {
        Row: {
          attempts: number;
          completed_at: string | null;
          explicacao_coerente: boolean | null;
          lesson_slug: string;
          missao_correta: boolean | null;
          missao_explicacao: string | null;
          missao_opcao: number | null;
          quiz_score: number | null;
          transferencia_correta: boolean | null;
          transferencia_opcao: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          attempts?: number;
          completed_at?: string | null;
          explicacao_coerente?: boolean | null;
          lesson_slug: string;
          missao_correta?: boolean | null;
          missao_explicacao?: string | null;
          missao_opcao?: number | null;
          quiz_score?: number | null;
          transferencia_correta?: boolean | null;
          transferencia_opcao?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          attempts?: number;
          completed_at?: string | null;
          explicacao_coerente?: boolean | null;
          lesson_slug?: string;
          missao_correta?: boolean | null;
          missao_explicacao?: string | null;
          missao_opcao?: number | null;
          quiz_score?: number | null;
          transferencia_correta?: boolean | null;
          transferencia_opcao?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      monthly_reviews: {
        Row: {
          created_at: string;
          id: string;
          metricas: Json;
          period_start: string;
          resumo: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          metricas?: Json;
          period_start: string;
          resumo?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          metricas?: Json;
          period_start?: string;
          resumo?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      personal_rules: {
        Row: {
          ativa: boolean;
          categoria: string;
          created_at: string;
          id: string;
          nome: string | null;
          parametros_json: Json | null;
          texto: string;
          tipo: string;
          user_id: string;
        };
        Insert: {
          ativa?: boolean;
          categoria?: string;
          created_at?: string;
          id?: string;
          nome?: string | null;
          parametros_json?: Json | null;
          texto: string;
          tipo?: string;
          user_id: string;
        };
        Update: {
          ativa?: boolean;
          categoria?: string;
          created_at?: string;
          id?: string;
          nome?: string | null;
          parametros_json?: Json | null;
          texto?: string;
          tipo?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          ja_operou: boolean;
          nivel_atual: number;
          nome: string | null;
          onboarded: boolean;
          streak_dias: number;
          ultima_atividade: string | null;
          updated_at: string;
          voz_ativa: boolean;
          xp_total: number;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id: string;
          ja_operou?: boolean;
          nivel_atual?: number;
          nome?: string | null;
          onboarded?: boolean;
          streak_dias?: number;
          ultima_atividade?: string | null;
          updated_at?: string;
          voz_ativa?: boolean;
          xp_total?: number;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          ja_operou?: boolean;
          nivel_atual?: number;
          nome?: string | null;
          onboarded?: boolean;
          streak_dias?: number;
          ultima_atividade?: string | null;
          updated_at?: string;
          voz_ativa?: boolean;
          xp_total?: number;
        };
        Relationships: [];
      };
      reflexoes_diarias: {
        Row: {
          conteudo: string;
          created_at: string;
          data: string;
          estado: string;
          id: string;
          user_id: string;
        };
        Insert: {
          conteudo?: string;
          created_at?: string;
          data?: string;
          estado: string;
          id?: string;
          user_id: string;
        };
        Update: {
          conteudo?: string;
          created_at?: string;
          data?: string;
          estado?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      simulations: {
        Row: {
          ativo: string | null;
          created_at: string;
          id: string;
          pernas: Json;
          preco_atual: number | null;
          tipo_estrategia: string;
          user_id: string;
        };
        Insert: {
          ativo?: string | null;
          created_at?: string;
          id?: string;
          pernas: Json;
          preco_atual?: number | null;
          tipo_estrategia: string;
          user_id: string;
        };
        Update: {
          ativo?: string | null;
          created_at?: string;
          id?: string;
          pernas?: Json;
          preco_atual?: number | null;
          tipo_estrategia?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      timeline_events: {
        Row: {
          created_at: string;
          descricao: string | null;
          id: string;
          meta: Json | null;
          occurred_at: string;
          tipo: string;
          titulo: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          descricao?: string | null;
          id?: string;
          meta?: Json | null;
          occurred_at?: string;
          tipo: string;
          titulo: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          descricao?: string | null;
          id?: string;
          meta?: Json | null;
          occurred_at?: string;
          tipo?: string;
          titulo?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      weekly_reviews: {
        Row: {
          created_at: string;
          id: string;
          metricas: Json;
          period_start: string;
          resumo: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          metricas?: Json;
          period_start: string;
          resumo?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          metricas?: Json;
          period_start?: string;
          resumo?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
