import { Check, ExternalLink, Eye, FileUp, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRef, useState } from "react";
import { useDb } from "@/lib/db/database";
import { getUi, selectedIds, setUi, toggleExperience, toggleSource } from "@/services/project-service";
import { searchInternalHistory } from "@/services/rag-service";
import { searchExternalSources } from "@/services/external-search-service";
import { importReportTemplate, suggestReportTemplate } from "@/services/report-service";
import { DemoBadge, TechChip } from "@/components/app/shared";
import { EvidenceDialog } from "@/components/workspace/EvidenceDialog";

export type ContextTab = "projet" | "experience" | "sources" | "modele";

export function ContextPanel({ projectId, tab, onTab }: { projectId: string; tab: ContextTab; onTab: (t: ContextTab) => void }) {
  const db = useDb((d) => d);
  const project = db.projects.find((p) => p.id === projectId);
  const ui = getUi(db, projectId);
  const sel = selectedIds(db, projectId);
  const samples = db.samples.filter((s) => s.project_id === projectId);
  const techs = db.techniques.filter((t) => t.project_id === projectId).map((t) => t.name);
  const files = db.project_files.filter((f) => f.project_id === projectId);
  const measures = db.measurements.filter((m) => m.project_id === projectId);
  const missing = files.filter((f) => f.status === "Information manquante" || f.status === "À vérifier");
  const hits = searchInternalHistory(db, projectId);
  const sources = searchExternalSources(db, projectId);
  const suggested = suggestReportTemplate(db, projectId);
  const tpl = db.report_templates.find((t) => t.id === ui.templateId) ?? suggested;
  const [view, setView] = useState<{ title: string; body: string; meta: string; quote?: string; quoteMeta?: string } | null>(null);
  const [trace, setTrace] = useState<string | null>(null);
  const templateInput = useRef<HTMLInputElement>(null);

  if (!project) return null;

  const Empty = ({ text, prompt }: { text: string; prompt: string }) => (
    <div className="rounded-xl border border-dashed border-border p-6 text-center">
      <Search className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
      <p className="text-xs text-muted-foreground">{text}</p>
      <p className="mt-2 text-xs font-medium text-accent-foreground">Demandez : « {prompt} »</p>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 pt-4"><h3 className="text-sm font-bold">Contexte & sources</h3></div>
      <Tabs value={tab} onValueChange={(v) => onTab(v as ContextTab)} className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mx-3 mt-3 grid grid-cols-4">
          <TabsTrigger value="projet" className="text-[11px]">Projet</TabsTrigger>
          <TabsTrigger value="experience" className="text-[11px]">Expérience</TabsTrigger>
          <TabsTrigger value="sources" className="text-[11px]">Externes</TabsTrigger>
          <TabsTrigger value="modele" className="text-[11px]">Modèle</TabsTrigger>
        </TabsList>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <TabsContent value="projet" className="mt-0 space-y-4">
            <Info label="Client" value={project.client} />
            <Info label="Référence" value={project.reference} />
            <Section title="Échantillons">
              {samples.length ? samples.map((s) => <div key={s.id} className="text-sm"><span className="font-mono text-xs text-muted-foreground">{s.reference}</span> · {s.name}</div>) : <p className="text-xs text-muted-foreground">À identifier après analyse</p>}
            </Section>
            <Section title="Techniques identifiées"><div className="flex flex-wrap gap-1">{techs.map((t) => <TechChip key={t} name={t} />)}</div></Section>
            <Section title={`Documents analysés (${files.filter((f) => f.status === "Analysé").length}/${files.length})`}><span /></Section>
            <Section title="Résultats tracés">
              <div className="space-y-1">
                {measures.map((m) => (
                  <Button key={m.id} variant="ghost" onClick={() => setTrace(m.id)} className="h-auto w-full justify-between px-2 py-1.5 text-left text-xs">
                    <span>{m.parameter} · <b>{m.value} {m.unit !== "—" ? m.unit : ""}</b></span>
                    <span className={m.status === "contrôlé" ? "text-success" : "text-warning"}>{m.status === "contrôlé" ? "✓" : "!"}</span>
                  </Button>
                ))}
              </div>
            </Section>
            <Section title="Informations manquantes">
              {missing.length ? missing.map((f) => <p key={f.id} className="text-xs text-warning">{f.filename} — {f.note ?? f.status}</p>) : <p className="text-xs text-muted-foreground">Aucune</p>}
            </Section>
          </TabsContent>

          <TabsContent value="experience" className="mt-0 space-y-3">
            {!ui.internalShown ? <Empty text="Aucune recherche dans l'historique A&S pour l'instant." prompt="Avons-nous déjà travaillé sur ce matériau ?" /> : hits.map(({ experience: e, score }) => {
              const on = sel.experiences.includes(e.id);
              return (
                <div key={e.id} className="animate-fade-up rounded-xl border border-border bg-card p-3 shadow-soft">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-semibold">Rapport {e.reference}</div>
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">{score} %</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">Matériau : {e.material} · Technique : {e.technique}</div>
                  <p className="mt-2 text-xs leading-relaxed">{e.summary}</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setView({ title: `Rapport ${e.reference} — ${e.title}`, meta: `${e.material} · ${e.technique} · ${e.year} · secteur ${e.client_sector}`, body: e.summary, quote: e.passage, quoteMeta: `${e.passage_location}${e.quote_reference ? ` · Devis lié ${e.quote_reference}` : ""}` })}><Eye className="h-3.5 w-3.5" /> Ouvrir le passage</Button>
                    <Button size="sm" variant={on ? "secondary" : "outline"} onClick={() => toggleExperience(projectId, e.id)}>{on ? <><Check className="h-3.5 w-3.5" /> Sélectionné</> : "Utiliser dans le rapport"}</Button>
                  </div>
                </div>
              );
            })}
            <DemoBadge />
          </TabsContent>

          <TabsContent value="sources" className="mt-0 space-y-3">
            {!ui.externalShown ? <Empty text="Aucune recherche externe pour l'instant." prompt="Fais aussi une recherche externe." /> : sources.map((s, i) => {
              const on = sel.sources.includes(s.id);
              return (
                <div key={s.id} className="animate-fade-up rounded-xl border border-border bg-card p-3 shadow-soft">
                  <div className="text-[11px] text-muted-foreground">Publication {i + 1} · {s.publisher} · {s.year}</div>
                  <div className="mt-1 text-sm font-semibold leading-snug">{s.title}</div>
                  <p className="mt-2 text-xs leading-relaxed">{s.summary}</p>
                  <div className="mt-2 flex items-center gap-2 text-[10px]"><span className="bg-success-soft px-1.5 py-0.5 text-success">Référence vérifiable</span><span className="font-mono text-muted-foreground">{s.identifier}</span></div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="ghost" asChild><a href={s.url} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /> Ouvrir</a></Button>
                    <Button size="sm" variant={on ? "secondary" : "outline"} onClick={() => toggleSource(projectId, s.id)}>{on ? <><Check className="h-3.5 w-3.5" /> Source retenue</> : "Ajouter au rapport"}</Button>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="modele" className="mt-0 space-y-3">
            <div className="rounded-xl border border-primary/30 bg-accent/40 p-4">
              <div className="text-[11px] font-medium uppercase tracking-wide text-accent-foreground">{tpl.id === suggested.id ? "Modèle recommandé" : "Modèle choisi"}</div>
              <div className="mt-1 font-display text-sm font-bold">{tpl.name}</div>
              <ol className="mt-3 space-y-1 text-xs">{tpl.sections.map((s, i) => <li key={s}>{i + 1}. {s}</li>)}</ol>
            </div>
            <div className="space-y-1.5">
              <div className="text-xs font-medium">Changer de modèle</div>
              <Select value={tpl.id} onValueChange={(v) => { setUi(projectId, { templateId: v }); toast.success("Modèle mis à jour"); }}>
                <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                <SelectContent>{db.report_templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="border-t border-border pt-3">
              <input ref={templateInput} type="file" accept=".docx" className="hidden" onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                const id = importReportTemplate(projectId, file);
                setUi(projectId, { templateId: id });
                toast.success("Rapport blanc importé", { description: "Les sections des techniques du dossier ont été activées." });
                event.target.value = "";
              }} />
              <Button variant="outline" className="w-full" onClick={() => templateInput.current?.click()}><FileUp className="h-4 w-4" /> Importer un rapport blanc DOCX</Button>
              {tpl.imported_filename && <p className="mt-2 text-xs text-success">Modèle importé : {tpl.imported_filename}</p>}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{view?.title}</DialogTitle><DialogDescription>{view?.meta}</DialogDescription></DialogHeader>
          <p className="text-sm leading-relaxed">{view?.body}</p>
          {view?.quote && <blockquote className="border-l-2 border-primary bg-accent/40 p-4 text-sm"><p>« {view.quote} »</p><footer className="mt-2 text-xs text-muted-foreground">{view.quoteMeta}</footer></blockquote>}
          {!view?.quote && <DemoBadge />}
        </DialogContent>
      </Dialog>
      <EvidenceDialog measurementId={trace} onClose={() => setTrace(null)} />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div><div className="text-sm font-medium">{value}</div></div>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><div className="mb-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">{title}</div>{children}</div>;
}
