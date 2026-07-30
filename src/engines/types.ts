export type DiaryEntry = {
  id: string;
  ativo: string;
  estrutura: string;
  motivo: string | null;
  rule_id: string | null;
  seguiu_regra: boolean | null;
  resultado: number | null;
  status: string;
  created_at: string;
  simulation_id?: string | null;
  interpretacao?: any;
  decision_score?: number | null;
  checklist?: any;
  emocao?: string | null;
  licao_aprendida?: string | null;
};

export type Simulacao = {
  id: string;
  ativo: string | null;
  tipo_estrategia: string;
  created_at: string;
  pernas: any;
};
