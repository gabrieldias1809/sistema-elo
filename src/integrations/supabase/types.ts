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
      profiles: {
        Row: {
          created_at: string
          id: string
          nome_guerra: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          nome_guerra?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome_guerra?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ptec_armto_os: {
        Row: {
          created_at: string
          created_by: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          marca: string | null
          mem: string | null
          numero_os: string
          observacoes: string | null
          om_apoiada: string
          quantidade_classe_iii: number | null
          servico_realizado: string | null
          servico_solicitado: string | null
          sistema: string | null
          situacao: string
          situacao_atual: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          marca?: string | null
          mem?: string | null
          numero_os: string
          observacoes?: string | null
          om_apoiada: string
          quantidade_classe_iii?: number | null
          servico_realizado?: string | null
          servico_solicitado?: string | null
          sistema?: string | null
          situacao: string
          situacao_atual?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          marca?: string | null
          mem?: string | null
          numero_os?: string
          observacoes?: string | null
          om_apoiada?: string
          quantidade_classe_iii?: number | null
          servico_realizado?: string | null
          servico_solicitado?: string | null
          sistema?: string | null
          situacao?: string
          situacao_atual?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ptec_auto_os: {
        Row: {
          created_at: string
          created_by: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          marca: string | null
          mem: string | null
          numero_os: string
          observacoes: string | null
          om_apoiada: string
          quantidade_classe_iii: number | null
          servico_realizado: string | null
          servico_solicitado: string | null
          sistema: string | null
          situacao: string
          situacao_atual: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          marca?: string | null
          mem?: string | null
          numero_os: string
          observacoes?: string | null
          om_apoiada: string
          quantidade_classe_iii?: number | null
          servico_realizado?: string | null
          servico_solicitado?: string | null
          sistema?: string | null
          situacao: string
          situacao_atual?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          marca?: string | null
          mem?: string | null
          numero_os?: string
          observacoes?: string | null
          om_apoiada?: string
          quantidade_classe_iii?: number | null
          servico_realizado?: string | null
          servico_solicitado?: string | null
          sistema?: string | null
          situacao?: string
          situacao_atual?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ptec_blind_os: {
        Row: {
          created_at: string
          created_by: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          marca: string | null
          mem: string | null
          numero_os: string
          observacoes: string | null
          om_apoiada: string
          quantidade_classe_iii: number | null
          servico_realizado: string | null
          servico_solicitado: string | null
          sistema: string | null
          situacao: string
          situacao_atual: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          marca?: string | null
          mem?: string | null
          numero_os: string
          observacoes?: string | null
          om_apoiada: string
          quantidade_classe_iii?: number | null
          servico_realizado?: string | null
          servico_solicitado?: string | null
          sistema?: string | null
          situacao: string
          situacao_atual?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          marca?: string | null
          mem?: string | null
          numero_os?: string
          observacoes?: string | null
          om_apoiada?: string
          quantidade_classe_iii?: number | null
          servico_realizado?: string | null
          servico_solicitado?: string | null
          sistema?: string | null
          situacao?: string
          situacao_atual?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ptec_com_os: {
        Row: {
          created_at: string
          created_by: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          marca: string | null
          mem: string | null
          numero_os: string
          observacoes: string | null
          om_apoiada: string
          servico_realizado: string | null
          servico_solicitado: string | null
          sistema: string | null
          situacao: string
          situacao_atual: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          marca?: string | null
          mem?: string | null
          numero_os: string
          observacoes?: string | null
          om_apoiada: string
          servico_realizado?: string | null
          servico_solicitado?: string | null
          sistema?: string | null
          situacao: string
          situacao_atual?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          marca?: string | null
          mem?: string | null
          numero_os?: string
          observacoes?: string | null
          om_apoiada?: string
          servico_realizado?: string | null
          servico_solicitado?: string | null
          sistema?: string | null
          situacao?: string
          situacao_atual?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ptec_mb_os: {
        Row: {
          created_at: string
          created_by: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          marca: string | null
          mem: string | null
          numero_os: string
          observacoes: string | null
          om_apoiada: string
          quantidade_classe_iii: number | null
          servico_realizado: string | null
          servico_solicitado: string | null
          sistema: string | null
          situacao: string
          situacao_atual: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          marca?: string | null
          mem?: string | null
          numero_os: string
          observacoes?: string | null
          om_apoiada: string
          quantidade_classe_iii?: number | null
          servico_realizado?: string | null
          servico_solicitado?: string | null
          sistema?: string | null
          situacao: string
          situacao_atual?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          marca?: string | null
          mem?: string | null
          numero_os?: string
          observacoes?: string | null
          om_apoiada?: string
          quantidade_classe_iii?: number | null
          servico_realizado?: string | null
          servico_solicitado?: string | null
          sistema?: string | null
          situacao?: string
          situacao_atual?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ptec_op_os: {
        Row: {
          created_at: string
          created_by: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          marca: string | null
          mem: string | null
          numero_os: string
          observacoes: string | null
          om_apoiada: string
          quantidade_classe_iii: number | null
          servico_realizado: string | null
          servico_solicitado: string | null
          sistema: string | null
          situacao: string
          situacao_atual: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          marca?: string | null
          mem?: string | null
          numero_os: string
          observacoes?: string | null
          om_apoiada: string
          quantidade_classe_iii?: number | null
          servico_realizado?: string | null
          servico_solicitado?: string | null
          sistema?: string | null
          situacao: string
          situacao_atual?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          marca?: string | null
          mem?: string | null
          numero_os?: string
          observacoes?: string | null
          om_apoiada?: string
          quantidade_classe_iii?: number | null
          servico_realizado?: string | null
          servico_solicitado?: string | null
          sistema?: string | null
          situacao?: string
          situacao_atual?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ptec_pedidos_material: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          material: string
          oficina_destino: string
          os_id: string
          ptec_origem: string
          quantidade: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          material: string
          oficina_destino: string
          os_id: string
          ptec_origem: string
          quantidade?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          material?: string
          oficina_destino?: string
          os_id?: string
          ptec_origem?: string
          quantidade?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      ptec_rh_ocorrencias: {
        Row: {
          causa_provavel: string | null
          created_at: string
          created_by: string | null
          data: string
          graduacao: string | null
          hora: string | null
          id: string
          local: string | null
          nome_guerra: string | null
          observacoes: string | null
          quantidade_corpos: number | null
          updated_at: string
        }
        Insert: {
          causa_provavel?: string | null
          created_at?: string
          created_by?: string | null
          data: string
          graduacao?: string | null
          hora?: string | null
          id?: string
          local?: string | null
          nome_guerra?: string | null
          observacoes?: string | null
          quantidade_corpos?: number | null
          updated_at?: string
        }
        Update: {
          causa_provavel?: string | null
          created_at?: string
          created_by?: string | null
          data?: string
          graduacao?: string | null
          hora?: string | null
          id?: string
          local?: string | null
          nome_guerra?: string | null
          observacoes?: string | null
          quantidade_corpos?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      ptec_sau_pms: {
        Row: {
          atividade: string | null
          conduta_esperada: string | null
          created_at: string
          created_by: string | null
          data: string
          descricao: string | null
          fracao: string | null
          hora: string | null
          id: string
          local: string | null
          numero_pms: string
          observacoes: string | null
          om_responsavel: string
          updated_at: string
        }
        Insert: {
          atividade?: string | null
          conduta_esperada?: string | null
          created_at?: string
          created_by?: string | null
          data: string
          descricao?: string | null
          fracao?: string | null
          hora?: string | null
          id?: string
          local?: string | null
          numero_pms: string
          observacoes?: string | null
          om_responsavel: string
          updated_at?: string
        }
        Update: {
          atividade?: string | null
          conduta_esperada?: string | null
          created_at?: string
          created_by?: string | null
          data?: string
          descricao?: string | null
          fracao?: string | null
          hora?: string | null
          id?: string
          local?: string | null
          numero_pms?: string
          observacoes?: string | null
          om_responsavel?: string
          updated_at?: string
        }
        Relationships: []
      }
      ptec_sau_prontuarios: {
        Row: {
          created_at: string
          created_by: string | null
          data: string
          id: string
          idade: number
          nivel_gravidade: string
          nome: string
          situacao_atual: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          data?: string
          id?: string
          idade: number
          nivel_gravidade: string
          nome: string
          situacao_atual: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          data?: string
          id?: string
          idade?: number
          nivel_gravidade?: string
          nome?: string
          situacao_atual?: string
          updated_at?: string
        }
        Relationships: []
      }
      ptec_trp_transportes: {
        Row: {
          chefe_vtr: string | null
          classe_material: string | null
          created_at: string
          created_by: string | null
          data_hora_entrada: string | null
          data_hora_saida: string | null
          destino: string | null
          id: string
          motorista: string | null
          observacoes: string | null
          odometro_retorno: number | null
          odometro_saida: number | null
          placa_vtr: string
          quantidade_transportada: number | null
          updated_at: string
          utilizacao: string | null
        }
        Insert: {
          chefe_vtr?: string | null
          classe_material?: string | null
          created_at?: string
          created_by?: string | null
          data_hora_entrada?: string | null
          data_hora_saida?: string | null
          destino?: string | null
          id?: string
          motorista?: string | null
          observacoes?: string | null
          odometro_retorno?: number | null
          odometro_saida?: number | null
          placa_vtr: string
          quantidade_transportada?: number | null
          updated_at?: string
          utilizacao?: string | null
        }
        Update: {
          chefe_vtr?: string | null
          classe_material?: string | null
          created_at?: string
          created_by?: string | null
          data_hora_entrada?: string | null
          data_hora_saida?: string | null
          destino?: string | null
          id?: string
          motorista?: string | null
          observacoes?: string | null
          odometro_retorno?: number | null
          odometro_saida?: number | null
          placa_vtr?: string
          quantidade_transportada?: number | null
          updated_at?: string
          utilizacao?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "ptec_com"
        | "ptec_mb"
        | "ptec_sau"
        | "ptec_rh"
        | "ptec_trp"
        | "ptec_auto"
        | "ptec_blind"
        | "ptec_op"
        | "ptec_armto"
        | "p_distr"
        | "oficina_com"
        | "oficina_auto"
        | "oficina_blind"
        | "oficina_op"
        | "oficina_armto"
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
      app_role: [
        "admin",
        "ptec_com",
        "ptec_mb",
        "ptec_sau",
        "ptec_rh",
        "ptec_trp",
        "ptec_auto",
        "ptec_blind",
        "ptec_op",
        "ptec_armto",
        "p_distr",
        "oficina_com",
        "oficina_auto",
        "oficina_blind",
        "oficina_op",
        "oficina_armto",
      ],
    },
  },
} as const
