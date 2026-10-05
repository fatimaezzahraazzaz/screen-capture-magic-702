// Data model mirroring the target PostgreSQL schema (see AGENTS.md).
export type ProjectStatus = "En cours" | "Rapport généré" | "Rapport validé" | "Validé";
export type FileStatus = "Analysé" | "À vérifier" | "Format non pris en charge" | "Information manquante" | "Analyse en cours";
export type MeasureStatus = "contrôlé" | "à confirmer";

export interface User { id: string; email: string; name: string; role: string }
export interface Project {
  id: string; name: string; client: string; reference: string; description: string;
  status: ProjectStatus; created_at: string; updated_at: string;
}
export interface ProjectFile {
  id: string; project_id: string; filename: string; file_type: string; size: string;
  status: FileStatus; note?: string | undefined; created_at: string;
}
export interface Sample { id: string; project_id: string; reference: string; name: string }
export interface Technique { id: string; project_id: string; name: string }
export interface Measurement {
  id: string; project_id: string; sample_id: string; parameter: string; value: string;
  unit: string; source_file_id: string; status: MeasureStatus; version: number; method: string;
}
export type ChatAction = "confirm_association" | "open_report" | "show_experiences" | "show_sources";
export interface ChatMessage {
  id: string; project_id: string; role: "user" | "assistant"; content: string;
  created_at: string; action?: ChatAction | undefined; action_done?: boolean | undefined;
}
export interface HistoricalExperience {
  id: string; title: string; reference: string; material: string; technique: string;
  summary: string; fake_similarity_score: number; year: number; client_sector: string;
}
export interface ExternalSource {
  id: string; title: string; publisher: string; year: number; url: string; summary: string; demo: boolean;
}
export interface ReportTemplate { id: string; name: string; techniques: string[]; sections: string[] }
export interface ReportContent {
  objet: string; synthese: string; conclusion: string;
  experienceIds: string[]; sourceIds: string[]; fileIds: string[];
}
export interface Report {
  id: string; project_id: string; template_id: string; status: "Brouillon" | "Validé";
  version: number; content: ReportContent; created_at: string;
  approved_by?: string; approved_at?: string;
}
export interface ReportVersion { id: string; report_id: string; version: number; label: string; content: ReportContent; created_at: string }

export interface ProjectUiState { internalShown: boolean; externalShown: boolean; templateId: string; associationConfirmed: boolean }

export interface Database {
  users: User[];
  projects: Project[];
  project_files: ProjectFile[];
  samples: Sample[];
  techniques: Technique[];
  measurements: Measurement[];
  chat_messages: ChatMessage[];
  historical_experiences: HistoricalExperience[];
  project_selected_experiences: { project_id: string; experience_id: string }[];
  external_sources: ExternalSource[];
  project_selected_sources: { project_id: string; source_id: string }[];
  report_templates: ReportTemplate[];
  reports: Report[];
  report_versions: ReportVersion[];
  project_ui: Record<string, ProjectUiState>;
  session: { userId: string } | null;
}
