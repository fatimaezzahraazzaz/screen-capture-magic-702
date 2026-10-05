import { getDb, now, uid, updateDb } from "@/lib/db/database";
import type { Database, ProjectStatus, ProjectUiState } from "@/lib/db/types";
import { suggestReportTemplate } from "./report-service";

export const ALL_TECHNIQUES = [
  "DRX", "MEB/EDS", "Infrarouge", "Granulométrie", "Analyses thermiques",
  "Surface / topographie", "Nanoindentation", "Propriétés des poudres", "Autre",
];

export const WELCOME = "Bonjour. J'ai analysé les documents disponibles pour ce projet. Que souhaitez-vous faire ?";

export function createProject(input: { name: string; client: string; reference: string; description: string; techniques: string[] }) {
  const id = uid("p");
  const t = now();
  updateDb((db) => ({
    ...db,
    projects: [{ id, ...input, status: "En cours" as ProjectStatus, created_at: t, updated_at: t }, ...db.projects],
    techniques: [...db.techniques, ...input.techniques.map((name) => ({ id: uid("t"), project_id: id, name }))],
    chat_messages: [...db.chat_messages, { id: uid("c"), project_id: id, role: "assistant", content: "Bonjour. Le projet est créé. Déposez vos documents dans la colonne de gauche, puis demandez-moi de les analyser.", created_at: t }],
  }));
  return id;
}

export function touchProject(db: Database, projectId: string, status?: ProjectStatus): Database {
  return { ...db, projects: db.projects.map((p) => (p.id === projectId ? { ...p, updated_at: now(), status: status ?? p.status } : p)) };
}

export function getUi(db: Database, projectId: string): ProjectUiState {
  return db.project_ui[projectId] ?? { internalShown: false, externalShown: false, templateId: suggestReportTemplate(db, projectId).id, associationConfirmed: false };
}

export function setUi(projectId: string, patch: Partial<ProjectUiState>) {
  updateDb((db) => ({ ...db, project_ui: { ...db.project_ui, [projectId]: { ...getUi(db, projectId), ...patch } } }));
}

export function toggleExperience(projectId: string, experienceId: string) {
  updateDb((db) => {
    const exists = db.project_selected_experiences.some((s) => s.project_id === projectId && s.experience_id === experienceId);
    return {
      ...db,
      project_selected_experiences: exists
        ? db.project_selected_experiences.filter((s) => !(s.project_id === projectId && s.experience_id === experienceId))
        : [...db.project_selected_experiences, { project_id: projectId, experience_id: experienceId }],
    };
  });
}

export function toggleSource(projectId: string, sourceId: string) {
  updateDb((db) => {
    const exists = db.project_selected_sources.some((s) => s.project_id === projectId && s.source_id === sourceId);
    return {
      ...db,
      project_selected_sources: exists
        ? db.project_selected_sources.filter((s) => !(s.project_id === projectId && s.source_id === sourceId))
        : [...db.project_selected_sources, { project_id: projectId, source_id: sourceId }],
    };
  });
}

export function confirmAssociation(projectId: string, messageId: string) {
  updateDb((db) => ({
    ...db,
    project_ui: { ...db.project_ui, [projectId]: { ...getUi(db, projectId), associationConfirmed: true } },
    measurements: db.measurements.map((m) => (m.project_id === projectId && m.status === "à confirmer" ? { ...m, status: "contrôlé", version: m.version + 1 } : m)),
    project_files: db.project_files.map((f) => (f.project_id === projectId && f.status === "À vérifier" ? { ...f, status: "Analysé", note: "Association à ECH-002 confirmée par l'analyste" } : f)),
    chat_messages: [
      ...db.chat_messages.map((m) => (m.id === messageId ? { ...m, action_done: true } : m)),
      { id: uid("c"), project_id: projectId, role: "assistant" as const, content: "Association confirmée : les mesures EDS (Fe, Cr) sont rattachées à l'échantillon ECH-002. Leur statut passe à « Contrôlé » (version 2).", created_at: now() },
    ],
  }));
}

export function selectedIds(db: Database, projectId: string) {
  return {
    experiences: db.project_selected_experiences.filter((s) => s.project_id === projectId).map((s) => s.experience_id),
    sources: db.project_selected_sources.filter((s) => s.project_id === projectId).map((s) => s.source_id),
  };
}

export { getDb };
