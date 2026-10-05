import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { DocumentsPanel } from "@/components/workspace/DocumentsPanel";
import { ChatPanel } from "@/components/workspace/ChatPanel";
import { useDb } from "@/lib/db/database";
import { ProjectStatusBadge } from "@/components/app/shared";

export const Route = createFileRoute("/projets/$projectId")({
  head: () => ({ meta: [{ title: "Projet — A&S Report Assistant" }, { name: "description", content: "Espace de travail du projet." }, { property: "og:title", content: "Projet — A&S Report Assistant" }, { property: "og:description", content: "Espace de travail du projet." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Workspace,
});

function Workspace() {
  const { projectId } = Route.useParams();
  const project = useDb((d) => d.projects.find((p) => p.id === projectId));
  return (
    <AppShell title={project?.name ?? "Projet"} fullBleed>
      <div className="flex h-full flex-col">
        {project && (
          <div className="flex items-center gap-3 border-b border-border bg-card px-6 py-3 text-sm">
            <span className="font-semibold">{project.client}</span>
            <span className="font-mono text-xs text-muted-foreground">{project.reference}</span>
            <ProjectStatusBadge status={project.status} />
          </div>
        )}
        <div className="flex min-h-0 flex-1">
          <aside className="w-72 shrink-0 border-r border-border bg-sidebar"><DocumentsPanel projectId={projectId} /></aside>
          <section className="min-w-0 flex-1"><ChatPanel projectId={projectId} onResult={() => {}} onOpenReport={() => {}} /></section>
        </div>
      </div>
    </AppShell>
  );
}
