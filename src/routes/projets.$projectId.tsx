import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Files, FileText, PanelRight } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { DocumentsPanel } from "@/components/workspace/DocumentsPanel";
import { ChatPanel } from "@/components/workspace/ChatPanel";
import { ContextPanel, type ContextTab } from "@/components/workspace/ContextPanel";
import { ReportDialog } from "@/components/workspace/ReportDialog";
import { Button } from "@/components/ui/button";
import { useDb } from "@/lib/db/database";
import { DemoBadge, ProjectStatusBadge, TechChip } from "@/components/app/shared";
import { answerChat } from "@/services/mock-ai";
import { latestReport } from "@/services/report-service";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { ReportReviewDialog } from "@/components/workspace/ReportReviewDialog";

export const Route = createFileRoute("/projets/$projectId")({
  head: () => ({ meta: [{ title: "Espace projet — A&S Report Assistant" }, { name: "description", content: "Documents, assistant et sources d'un projet d'essais." }, { property: "og:title", content: "Espace projet — A&S Report Assistant" }, { property: "og:description", content: "Documents, assistant et sources d'un projet d'essais." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Workspace,
});

function Workspace() {
  const { projectId } = Route.useParams();
  const project = useDb((d) => d.projects.find((p) => p.id === projectId));
  const techs = useDb((d) => d.techniques).filter((t) => t.project_id === projectId);
  const hasReport = useDb((d) => !!latestReport(d, projectId));
  const [tab, setTab] = useState<ContextTab>("projet");
  const [reportOpen, setReportOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"documents" | "context" | null>(null);
  const [busy, setBusy] = useState(false);

  if (!project) {
    return <AppShell title="Projet introuvable"><div className="p-8 text-sm">Ce projet n'existe pas. <Link to="/projets" className="text-primary underline">Retour aux projets</Link></div></AppShell>;
  }

  const prepare = async () => {
    setBusy(true);
    const r = await answerChat(projectId, "Prépare maintenant le rapport.");
    setBusy(false);
    if (r.openReport) setReportOpen(true);
  };

  return (
    <AppShell title={project.name} fullBleed>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 lg:px-6">
          <div className="flex min-w-0 items-center gap-3 text-sm">
            <Link to="/projets" className="text-muted-foreground hover:text-foreground" aria-label="Retour"><ArrowLeft className="h-4 w-4" /></Link>
            <span className="font-semibold">{project.client}</span>
            <span className="font-mono text-xs text-muted-foreground">{project.reference}</span>
            <div className="hidden gap-1 xl:flex">{techs.map((t) => <TechChip key={t.id} name={t.name} />)}</div>
            <span className="hidden xl:inline-flex"><ProjectStatusBadge status={project.status} /></span>
            <span className="hidden 2xl:inline-flex"><DemoBadge /></span>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="icon" className="xl:hidden" onClick={() => setMobilePanel("documents")} aria-label="Ouvrir les documents"><Files className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="xl:hidden" onClick={() => setMobilePanel("context")} aria-label="Ouvrir le contexte et les sources"><PanelRight className="h-4 w-4" /></Button>
            {hasReport && <Button variant="outline" onClick={() => setReportOpen(true)}>Voir le rapport</Button>}
            <Button onClick={() => setReviewOpen(true)} disabled={busy}><FileText className="h-4 w-4" /> <span className="hidden sm:inline">Préparer le rapport</span></Button>
          </div>
        </div>
        <div className="flex min-h-0 flex-1">
          <aside className="hidden w-72 shrink-0 border-r border-border bg-sidebar xl:block"><DocumentsPanel projectId={projectId} /></aside>
          <section className="min-w-0 flex-1">
            <ChatPanel projectId={projectId} onPrepare={() => setReviewOpen(true)} onOpenReport={() => setReportOpen(true)} onResult={(r) => { if (r.focusTab) { setTab(r.focusTab); setMobilePanel("context"); } if (r.openReport) setReportOpen(true); }} />
          </section>
          <aside className="hidden w-80 shrink-0 border-l border-border bg-sidebar xl:block"><ContextPanel projectId={projectId} tab={tab} onTab={setTab} /></aside>
        </div>
      </div>
      <ReportDialog projectId={projectId} open={reportOpen} onOpenChange={setReportOpen} />
      <ReportReviewDialog projectId={projectId} open={reviewOpen} mode="generate" onOpenChange={setReviewOpen} onContinue={() => { setReviewOpen(false); void prepare(); }} />
      <Sheet open={mobilePanel === "documents"} onOpenChange={(open) => !open && setMobilePanel(null)}><SheetContent side="left" className="w-[min(90vw,24rem)] p-0"><SheetTitle className="sr-only">Documents du projet</SheetTitle><SheetDescription className="sr-only">Fichiers associés au projet</SheetDescription><DocumentsPanel projectId={projectId} /></SheetContent></Sheet>
      <Sheet open={mobilePanel === "context"} onOpenChange={(open) => !open && setMobilePanel(null)}><SheetContent side="right" className="w-[min(92vw,26rem)] p-0"><SheetTitle className="sr-only">Contexte et sources</SheetTitle><SheetDescription className="sr-only">Données, expériences, sources et modèle du projet</SheetDescription><ContextPanel projectId={projectId} tab={tab} onTab={setTab} /></SheetContent></Sheet>
    </AppShell>
  );
}
