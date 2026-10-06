import { useState } from "react";
import { CheckCircle2, Download, MessageSquare, Pencil, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDb } from "@/lib/db/database";
import { exportWord, latestReport, updateReportContent, validateReport } from "@/services/report-service";
import { answerChat } from "@/services/mock-ai";
import { DemoBadge, fmtDateTime } from "@/components/app/shared";
import meb1 from "@/assets/meb-01.jpg";
import meb2 from "@/assets/meb-02.jpg";

const DRX = [2, 3, 3, 4, 6, 14, 42, 18, 8, 30, 12, 6, 5, 9, 4, 3, 5, 3, 2, 2];
const GRANULO = [1, 3, 8, 18, 34, 52, 60, 48, 30, 15, 6, 2];

export function ReportDialog({ projectId, open, onOpenChange }: { projectId: string; open: boolean; onOpenChange: (o: boolean) => void }) {
  const db = useDb((d) => d);
  const report = latestReport(db, projectId);
  const project = db.projects.find((p) => p.id === projectId);
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState({ synthese: "", conclusion: "" });
  const [viewVersion, setViewVersion] = useState<number | null>(null);
  if (!report || !project) return null;

  const versions = db.report_versions.filter((v) => v.report_id === report.id).sort((a, b) => a.version - b.version);
  const shown = viewVersion != null ? versions.find((v) => v.version === viewVersion)?.content ?? report.content : report.content;
  const tpl = db.report_templates.find((t) => t.id === report.template_id);
  const samples = db.samples.filter((s) => s.project_id === projectId);
  const m = (p: string) => db.measurements.find((x) => x.project_id === projectId && x.parameter === p);
  const files = db.project_files.filter((f) => shown.fileIds.includes(f.id));
  const exps = db.historical_experiences.filter((e) => shown.experienceIds.includes(e.id));
  const srcs = db.external_sources.filter((s) => shown.sourceIds.includes(s.id));
  const validated = report.status === "Validé";

  const startEdit = () => { setDraft({ synthese: report.content.synthese, conclusion: report.content.conclusion }); setEdit(true); setViewVersion(null); };
  const saveEdit = () => { updateReportContent(report.id, draft, "Modification manuelle"); setEdit(false); toast.success("Modifications enregistrées — nouvelle version créée"); };
  const askFix = () => {
    updateReportContent(report.id, { conclusion: report.content.conclusion + " Une analyse complémentaire de la ligne de production est recommandée pour confirmer l'origine." }, "Correction de la conclusion");
    void answerChat(projectId, "Corrige la conclusion du rapport.");
    toast.success("L'assistant a corrigé la conclusion");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] max-w-6xl flex-col gap-0 p-0">
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <div>
            <DialogTitle className="font-display text-base">Aperçu du rapport</DialogTitle>
            <div className="text-xs text-muted-foreground">Version {viewVersion ?? report.version} · {tpl?.name}</div>
          </div>
          <div className="mr-8 flex flex-wrap gap-2">
            {!validated && !edit && <Button size="sm" variant="outline" onClick={startEdit}><Pencil className="h-3.5 w-3.5" /> Modifier</Button>}
            {edit && <Button size="sm" onClick={saveEdit}>Enregistrer</Button>}
            {!validated && <Button size="sm" variant="outline" onClick={askFix}><MessageSquare className="h-3.5 w-3.5" /> Demander une correction à l'assistant</Button>}
            {!validated && <Button size="sm" onClick={() => { validateReport(report.id, "Expert Démo"); setViewVersion(null); toast.success("Rapport validé"); }}><ShieldCheck className="h-3.5 w-3.5" /> Valider le rapport</Button>}
            <Button size="sm" variant={validated ? "default" : "outline"} onClick={() => { exportWord(project.name, project.reference, report.content); toast.success("Document Word généré avec succès."); }}><Download className="h-3.5 w-3.5" /> Exporter en Word</Button>
          </div>
        </div>
        <div className="flex min-h-0 flex-1">
          <div className="flex-1 overflow-y-auto bg-muted p-8">
            <article className="mx-auto max-w-3xl space-y-8 rounded-xl bg-card p-10 shadow-soft">
              {validated && viewVersion == null && (
                <div className="flex items-center gap-2 rounded-lg bg-success-soft px-4 py-3 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" /> Rapport approuvé par {report.approved_by} le {report.approved_at && fmtDateTime(report.approved_at)}
                </div>
              )}
              <header className="border-b border-border pb-6">
                <div className="flex items-center justify-between"><span className="font-display text-sm font-extrabold text-primary">A&amp;S</span><DemoBadge /></div>
                <h1 className="mt-4 font-display text-2xl font-bold">Rapport d'essais</h1>
                <dl className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div><dt className="text-xs text-muted-foreground">Client</dt><dd className="font-medium">{project.client}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Projet</dt><dd className="font-medium">{project.name}</dd></div>
                  <div><dt className="text-xs text-muted-foreground">Référence</dt><dd className="font-mono font-medium">{project.reference}</dd></div>
                </dl>
              </header>
              <S n={1} t="Objet de l'étude"><p>{shown.objet}</p></S>
              <S n={2} t="Échantillons reçus">
                <table className="w-full text-sm"><tbody>{samples.map((s) => <tr key={s.id} className="border-b border-border"><td className="py-1.5 font-mono text-xs">{s.reference}</td><td>{s.name}</td></tr>)}</tbody></table>
              </S>
              <S n={3} t="Méthodes utilisées"><ul className="list-disc pl-5"><li>Diffraction des rayons X (Cu Kα, 5–60° 2θ)</li><li>Microscopie électronique à balayage couplée EDS (15 kV)</li><li>Granulométrie par diffraction laser, voie sèche</li></ul></S>
              <S n={4} t="Résultats DRX">
                <p>Le diffractogramme de ECH-001 présente deux pics principaux à 20,2° et 23,8° 2θ, caractéristiques de la phase α du PA66.</p>
                <Bars data={DRX} label="Intensité (u.a.) en fonction de 2θ" />
                <Tbl rows={[["Taux de cristallinité", m("Taux de cristallinité")], ["Phase α", m("Phase α (pic 20,2° 2θ)")]]} db={db} />
              </S>
              <S n={5} t="Résultats MEB/EDS">
                <div className="grid grid-cols-2 gap-3">
                  <figure><img src={meb1} alt="Image MEB de la poudre PA66" loading="lazy" width={944} height={704} className="rounded-lg" /><figcaption className="mt-1 text-xs text-muted-foreground">image_MEB_01.jpg — ECH-001</figcaption></figure>
                  <figure><img src={meb2} alt="Image MEB de la particule contaminante" loading="lazy" width={944} height={704} className="rounded-lg" /><figcaption className="mt-1 text-xs text-muted-foreground">image_MEB_02.jpg — ECH-002</figcaption></figure>
                </div>
                <p>Les grains de PA66 présentent une morphologie arrondie. Une particule métallique anguleuse est observée sur ECH-002.</p>
                <Tbl rows={[["Fe — ECH-002", m("Fe (EDS)")], ["Cr — ECH-002", m("Cr (EDS)")], ["C — ECH-003", m("C (EDS)")], ["O — ECH-003", m("O (EDS)")], ["N — ECH-003", m("N (EDS)")]]} db={db} />
              </S>
              <S n={6} t="Granulométrie">
                <Bars data={GRANULO} label="Distribution volumique (%) en fonction de la taille" />
                <Tbl rows={[["Dv10", m("Dv10")], ["Dv50", m("Dv50")], ["Dv90", m("Dv90")]]} db={db} />
              </S>
              <S n={7} t="Synthèse">{edit ? <Textarea rows={5} value={draft.synthese} onChange={(e) => setDraft({ ...draft, synthese: e.target.value })} /> : <p>{shown.synthese}</p>}</S>
              <S n={8} t="Conclusion" badge={!validated ? "À valider par l'expert" : undefined}>{edit ? <Textarea rows={4} value={draft.conclusion} onChange={(e) => setDraft({ ...draft, conclusion: e.target.value })} /> : <p>{shown.conclusion}</p>}</S>
              <S n={9} t="Sources utilisées">
                <Src title="Sources du projet" items={files.map((f) => f.filename)} />
                <Src title="Expériences A&S" items={exps.map((e) => `Rapport ${e.reference} — ${e.title}`)} />
                <Src title="Sources externes" items={srcs.map((s) => `${s.title} (${s.publisher}, ${s.year}) — source de démonstration`)} />
              </S>
            </article>
          </div>
          <aside className="w-60 shrink-0 overflow-y-auto border-l border-border p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Historique des versions</div>
            <div className="space-y-2">
              {[...versions].reverse().map((v) => {
                const active = (viewVersion ?? report.version) === v.version;
                return (
                  <div key={v.id} className={`rounded-lg border p-3 ${active ? "border-primary bg-accent/40" : "border-border"}`}>
                    <div className="text-sm font-medium">Version {v.version}</div>
                    <div className="text-xs text-muted-foreground">{v.label}</div>
                    <div className="text-[11px] text-muted-foreground">{fmtDateTime(v.created_at)}</div>
                    {!active && <Button size="sm" variant="link" className="h-auto p-0 text-xs" onClick={() => setViewVersion(v.version === report.version ? null : v.version)}>Voir cette version</Button>}
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function S({ n, t, children, badge }: { n: number; t: string; children: React.ReactNode; badge?: string | undefined }) {
  return (
    <section className="space-y-3 text-sm leading-relaxed">
      <h2 className="flex items-center gap-3 font-display text-base font-bold">{n}. {t}{badge && <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-medium text-warning">{badge}</span>}</h2>
      {children}
    </section>
  );
}
function Bars({ data, label }: { data: number[]; label: string }) {
  const max = Math.max(...data);
  return (
    <figure>
      <svg viewBox={`0 0 ${data.length * 20} 100`} className="h-32 w-full rounded-lg bg-muted p-2" preserveAspectRatio="none">
        {data.map((v, i) => <rect key={i} x={i * 20 + 3} y={100 - (v / max) * 95} width={14} height={(v / max) * 95} rx={2} className="fill-primary" />)}
      </svg>
      <figcaption className="mt-1 text-xs text-muted-foreground">{label} — graphique de démonstration</figcaption>
    </figure>
  );
}
type DbT = ReturnType<typeof import("@/lib/db/database").getDb>;
function Tbl({ rows, db }: { rows: [string, DbT["measurements"][number] | undefined][]; db: DbT }) {
  return (
    <table className="w-full text-xs">
      <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="py-1.5">Paramètre</th><th>Valeur</th><th>Source</th><th>Statut</th></tr></thead>
      <tbody>{rows.map(([l, m]) => m && (
        <tr key={l} className="border-b border-border">
          <td className="py-1.5">{l}</td><td className="font-medium">{m.value} {m.unit !== "—" ? m.unit : ""}</td>
          <td className="text-muted-foreground">{db.project_files.find((f) => f.id === m.source_file_id)?.filename} · v{m.version}</td>
          <td className={m.status === "contrôlé" ? "text-success" : "text-warning"}>{m.status === "contrôlé" ? "✓ Contrôlé" : "À valider par l'analyste"}</td>
        </tr>
      ))}</tbody>
    </table>
  );
}
function Src({ title, items }: { title: string; items: string[] }) {
  return <div><div className="text-xs font-semibold">{title}</div>{items.length ? <ul className="list-disc pl-5 text-xs">{items.map((i) => <li key={i}>{i}</li>)}</ul> : <p className="text-xs text-muted-foreground">Aucune</p>}</div>;
}
