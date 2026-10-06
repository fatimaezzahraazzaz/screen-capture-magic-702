import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, FileText } from "lucide-react";
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
        <div className="flex items-center justify-between gap-4 border-b border-border bg-card px-6 py-3">
          <div className="flex min-w-0 items-center gap-3 text-sm">
            <Link to="/projets" className="text-muted-foreground hover:text-foreground" aria-label="Retour"><ArrowLeft className="h-4 w-4" /></Link>
            <span className="font-semibold">{project.client}</span>
            <span className="font-mono text-xs text-muted-foreground">{project.reference}</span>
            <div className="flex gap-1">{techs.map((t) => <TechChip key={t.id} name={t.name} />)}</div>
            <ProjectStatusBadge status={project.status} />
            <DemoBadge />
          </div>
          <div className="flex gap-2">
            {hasReport && <Button variant="outline" onClick={() => setReportOpen(true)}>Voir le rapport</Button>}
            <Button onClick={prepare} disabled={busy}><FileText className="h-4 w-4" /> Préparer le rapport</Button>
          </div>
        </div>
        <div className="flex min-h-0 flex-1">
          <aside className="w-72 shrink-0 border-r border-border bg-sidebar"><DocumentsPanel projectId={projectId} /></aside>
          <section className="min-w-0 flex-1">
            <ChatPanel projectId={projectId} onOpenReport={() => setReportOpen(true)} onResult={(r) => { if (r.focusTab) setTab(r.focusTab); if (r.openReport) setReportOpen(true); }} />
          </section>
          <aside className="w-80 shrink-0 border-l border-border bg-sidebar"><ContextPanel projectId={projectId} tab={tab} onTab={setTab} /></aside>
        </div>
      </div>
      <ReportDialog projectId={projectId} open={reportOpen} onOpenChange={setReportOpen} />
    </AppShell>
  );
}
