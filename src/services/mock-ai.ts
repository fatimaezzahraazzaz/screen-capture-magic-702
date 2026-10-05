// Single assistant — mock AI orchestrator. Replace `answerChat` internals with a real LLM later.
import { getDb, now, uid, updateDb } from "@/lib/db/database";
import type { ChatAction, Database } from "@/lib/db/types";
import { getUi, selectedIds, setUi } from "./project-service";
import { searchInternalHistory } from "./rag-service";
import { searchExternalSources } from "./external-search-service";
import { generateReport, suggestReportTemplate } from "./report-service";

export type Intent = "analyze" | "internal" | "external" | "report" | "selection" | "fallback";

const has = (m: string, words: string[]) => words.some((w) => m.includes(w));

export function detectIntent(raw: string): Intent {
  const m = raw.toLowerCase();
  if (has(m, ["externe", "publication", "recherche scientifique", "littérature", "web"])) return "external";
  if (has(m, ["rapport", "générer", "generer", "préparer", "preparer", "brouillon"])) return "report";
  if (has(m, ["utilise", "sélectionn", "retiens"])) return "selection";
  if (has(m, ["déjà", "deja", "historique", "similaire", "matériau", "materiau", "expérience"])) return "internal";
  if (has(m, ["analyse", "dossier", "document", "fichier"])) return "analyze";
  return "fallback";
}

export function analyzeProject(db: Database, projectId: string) {
  const samples = db.samples.filter((s) => s.project_id === projectId);
  const techniques = db.techniques.filter((t) => t.project_id === projectId).map((t) => t.name);
  const files = db.project_files.filter((f) => f.project_id === projectId);
  const measurements = db.measurements.filter((m) => m.project_id === projectId);
  return {
    samples,
    techniques,
    measurements,
    images: files.filter((f) => ["JPG", "JPEG", "PNG", "TIF"].includes(f.file_type)),
    missing_information: files.filter((f) => f.status === "Information manquante").map((f) => f.note ?? f.filename),
    uncertainties: measurements.filter((m) => m.status === "à confirmer"),
    unsupported: files.filter((f) => f.status === "Format non pris en charge"),
    files,
  };
}

function reply(projectId: string, content: string, action?: ChatAction) {
  updateDb((db) => ({
    ...db,
    chat_messages: [...db.chat_messages, { id: uid("c"), project_id: projectId, role: "assistant", content, created_at: now(), action }],
    projects: db.projects.map((p) => (p.id === projectId ? { ...p, updated_at: now() } : p)),
  }));
}

export interface ChatResult { openReport?: boolean; focusTab?: "projet" | "experience" | "sources" | "modele" }

export async function answerChat(projectId: string, message: string): Promise<ChatResult> {
  updateDb((db) => ({ ...db, chat_messages: [...db.chat_messages, { id: uid("c"), project_id: projectId, role: "user", content: message, created_at: now() }] }));
  await new Promise((r) => setTimeout(r, 700 + Math.random() * 800));

  const db = getDb();
  const intent = detectIntent(message);
  const ui = getUi(db, projectId);

  switch (intent) {
    case "analyze": {
      const a = analyzeProject(db, projectId);
      if (a.files.length === 0) {
        reply(projectId, "Aucun document n'est encore disponible. Ajoutez des fichiers avec le bouton « + Ajouter des fichiers ».");
        return {};
      }
      const lines = [
        "J'ai identifié :",
        `- ${a.samples.length} échantillon${a.samples.length > 1 ? "s" : ""}${a.samples.length ? " (" + a.samples.map((s) => s.reference).join(", ") + ")" : ""}`,
        ...a.techniques.map((t) => `- une analyse ${t}`),
        a.images.length ? `- ${a.images.length} image${a.images.length > 1 ? "s" : ""}` : "",
        a.measurements.length ? `- ${a.measurements.length} résultats chiffrés tracés jusqu'à leur fichier source` : "",
      ].filter(Boolean);
      if (a.missing_information.length) lines.push("", `Information manquante : ${a.missing_information.join(" ; ")}.`);
      if (a.unsupported.length) lines.push("", `Format natif à exporter : ${a.unsupported.map((f) => f.filename).join(", ")}.`);
      const needsConfirm = a.uncertainties.length > 0 && !ui.associationConfirmed;
      if (needsConfirm) lines.push("", "Une association entre une mesure et l'échantillon ECH-002 reste à confirmer.");
      reply(projectId, lines.join("\n"), needsConfirm ? "confirm_association" : undefined);
      return { focusTab: "projet" };
    }
    case "internal": {
      const hits = searchInternalHistory(db, projectId);
      setUi(projectId, { internalShown: true });
      reply(projectId, `Oui. J'ai identifié ${hits.length} expériences A&S potentiellement pertinentes dans l'historique :\n${hits.map((h) => `- Rapport ${h.experience.reference} — ${h.experience.material}, ${h.experience.technique} (${h.score} %)`).join("\n")}\n\nElles sont disponibles dans l'onglet « Expérience A&S ». Sélectionnez celles à utiliser dans le rapport.`, "show_experiences");
      return { focusTab: "experience" };
    }
    case "external": {
      const src = searchExternalSources(db, projectId);
      setUi(projectId, { externalShown: true });
      reply(projectId, `J'ai identifié ${src.length} publications potentiellement pertinentes. Elles sont disponibles dans la section Sources externes.\n\nCes sources sont des données de démonstration.`, "show_sources");
      return { focusTab: "sources" };
    }
    case "selection": {
      const m = message.toLowerCase();
      let changed = 0;
      updateDb((d) => {
        let next = d;
        d.historical_experiences.forEach((e) => {
          if (m.includes(e.reference) && !next.project_selected_experiences.some((s) => s.project_id === projectId && s.experience_id === e.id)) {
            next = { ...next, project_selected_experiences: [...next.project_selected_experiences, { project_id: projectId, experience_id: e.id }] };
            changed++;
          }
        });
        const pub = m.match(/publication\s*(\d)/);
        if (pub) {
          const src = searchExternalSources(d, projectId)[Number(pub[1]) - 1];
          if (src && !next.project_selected_sources.some((s) => s.project_id === projectId && s.source_id === src.id)) {
            next = { ...next, project_selected_sources: [...next.project_selected_sources, { project_id: projectId, source_id: src.id }] };
            changed++;
          }
        }
        return next;
      });
      const sel = selectedIds(getDb(), projectId);
      reply(projectId, changed ? `C'est noté. ${sel.experiences.length} expérience(s) A&S et ${sel.sources.length} source(s) externe(s) sont maintenant retenues pour le rapport.` : "Je n'ai pas trouvé de référence à sélectionner. Indiquez par exemple « Utilise le rapport historique 22-0521 et la publication 2 », ou utilisez les boutons du panneau de droite.");
      return {};
    }
    case "report": {
      const sel = selectedIds(db, projectId);
      const tpl = db.report_templates.find((t) => t.id === ui.templateId) ?? suggestReportTemplate(db, projectId);
      generateReport(projectId, tpl.id, sel.experiences, sel.sources);
      reply(projectId, `Je vais utiliser :\n- les documents du projet ;\n- ${sel.experiences.length} expérience${sel.experiences.length > 1 ? "s" : ""} A&S sélectionnée${sel.experiences.length > 1 ? "s" : ""} ;\n- ${sel.sources.length} source${sel.sources.length > 1 ? "s" : ""} externe${sel.sources.length > 1 ? "s" : ""} sélectionnée${sel.sources.length > 1 ? "s" : ""} ;\n- le modèle ${tpl.name}.\n\nLe brouillon est prêt.`, "open_report");
      return { openReport: true };
    }
    default:
      reply(projectId, "Je peux analyser les documents du projet, rechercher des expériences A&S similaires, effectuer une recherche externe ou préparer le rapport. Que souhaitez-vous faire ?");
      return {};
  }
}
