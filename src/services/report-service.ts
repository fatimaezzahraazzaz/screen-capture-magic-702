// Report drafting, validation, versioning and (mock) Word export.
import { getDb, now, uid, updateDb } from "@/lib/db/database";
import type { Database, Report, ReportContent } from "@/lib/db/types";

export function suggestReportTemplate(db: Database, projectId: string) {
  const techs = db.techniques.filter((t) => t.project_id === projectId).map((t) => t.name);
  if (techs.includes("DRX") && techs.includes("MEB/EDS")) return db.report_templates.find((t) => t.id === "tpl-multi-drx-meb")!;
  if (techs.length === 1) {
    const single = db.report_templates.find((t) => t.techniques.length === 1 && t.techniques[0] === techs[0]);
    if (single) return single;
  }
  return db.report_templates.find((t) => t.id === "tpl-multi")!;
}

export function latestReport(db: Database, projectId: string): Report | undefined {
  return db.reports.filter((r) => r.project_id === projectId).sort((a, b) => b.version - a.version)[0];
}

export function generateReport(projectId: string, templateId: string, experienceIds: string[], sourceIds: string[]) {
  const db = getDb();
  const p = db.projects.find((x) => x.id === projectId)!;
  const files = db.project_files.filter((f) => f.project_id === projectId && f.status !== "Format non pris en charge");
  const content: ReportContent = {
    objet: `À la demande de ${p.client}, le laboratoire A&S a réalisé ${p.description ? p.description.charAt(0).toLowerCase() + p.description.slice(1) : "les essais demandés."}`,
    synthese:
      "La poudre ECH-001 présente une structure semi-cristalline dominée par la phase α du PA66 (taux de cristallinité estimé à 38 %). La distribution granulométrique est monomodale (Dv50 = 18,73 µm). La particule ECH-002 est riche en fer et chrome, compatible avec un acier inoxydable. Le dépôt ECH-003 présente une composition organique cohérente avec le polymère de base.",
    conclusion:
      "La contamination observée provient vraisemblablement d'une usure d'un élément métallique en acier inoxydable de la ligne de production. La poudre PA66 elle-même est conforme aux caractéristiques attendues.",
    experienceIds,
    sourceIds,
    fileIds: files.map((f) => f.id),
  };
  const existing = latestReport(db, projectId);
  const reportId = existing?.id ?? uid("r");
  const version = (existing?.version ?? 0) + 1;
  const report: Report = { id: reportId, project_id: projectId, template_id: templateId, status: "Brouillon", version, content, created_at: now() };
  updateDb((d) => ({
    ...d,
    reports: [...d.reports.filter((r) => r.id !== reportId), report],
    report_versions: [...d.report_versions, { id: uid("rv"), report_id: reportId, version, label: version === 1 ? "Brouillon initial" : "Nouveau brouillon", content, created_at: now() }],
    projects: d.projects.map((x) => (x.id === projectId ? { ...x, status: "Rapport généré", updated_at: now() } : x)),
  }));
  return report;
}

export function updateReportContent(reportId: string, patch: Partial<ReportContent>, label: string) {
  updateDb((d) => {
    const r = d.reports.find((x) => x.id === reportId)!;
    const version = r.version + 1;
    const content = { ...r.content, ...patch };
    return {
      ...d,
      reports: d.reports.map((x) => (x.id === reportId ? { ...x, content, version, status: "Brouillon" } : x)),
      report_versions: [...d.report_versions, { id: uid("rv"), report_id: reportId, version, label, content, created_at: now() }],
    };
  });
}

export function validateReport(reportId: string, approver: string) {
  updateDb((d) => {
    const r = d.reports.find((x) => x.id === reportId)!;
    const version = r.version + 1;
    const t = now();
    return {
      ...d,
      reports: d.reports.map((x) => (x.id === reportId ? { ...x, version, status: "Validé", approved_by: approver, approved_at: t } : x)),
      report_versions: [...d.report_versions, { id: uid("rv"), report_id: reportId, version, label: "Rapport validé", content: r.content, created_at: t }],
      projects: d.projects.map((x) => (x.id === r.project_id ? { ...x, status: "Rapport validé", updated_at: t } : x)),
    };
  });
}

export function exportWord(projectName: string, reference: string, content: ReportContent) {
  const html = `<html><head><meta charset="utf-8"><title>Rapport ${reference}</title></head><body>
<h1>Rapport d'essais — ${projectName}</h1><p><b>Référence :</b> ${reference}</p>
<p><i>Document de démonstration — données fictives.</i></p>
<h2>Objet de l'étude</h2><p>${content.objet}</p>
<h2>Synthèse</h2><p>${content.synthese}</p>
<h2>Conclusion</h2><p>${content.conclusion}</p></body></html>`;
  const blob = new Blob([html], { type: "application/msword" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `Rapport_${reference}.doc`;
  a.click();
  URL.revokeObjectURL(a.href);
}
