import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, FileText, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDb } from "@/lib/db/database";
import { ALL_TECHNIQUES } from "@/services/project-service";
import { DemoBadge, fmtAgo, ProjectStatusBadge, TechChip } from "@/components/app/shared";

export const Route = createFileRoute("/projets/")({
  head: () => ({
    meta: [
      { title: "Mes projets — A&S Report Assistant" },
      { name: "description", content: "Liste des projets d'essais en cours et terminés." },
      { property: "og:title", content: "Mes projets — A&S Report Assistant" },
      { property: "og:description", content: "Liste des projets d'essais en cours et terminés." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const navigate = useNavigate();
  const projects = useDb((d) => d.projects);
  const techniques = useDb((d) => d.techniques);
  const files = useDb((d) => d.project_files);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [tech, setTech] = useState("all");

  const rows = useMemo(
    () =>
      projects
        .map((p) => ({ ...p, techs: techniques.filter((t) => t.project_id === p.id).map((t) => t.name), nFiles: files.filter((f) => f.project_id === p.id).length }))
        .filter((p) => (status === "all" || p.status === status) && (tech === "all" || p.techs.includes(tech)))
        .filter((p) => `${p.name} ${p.client} ${p.reference}`.toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at)),
    [projects, techniques, files, q, status, tech],
  );

  return (
    <AppShell title="Mes projets">
      <div className="mx-auto max-w-6xl space-y-6 p-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Mes projets</h2>
            <p className="mt-1 text-sm text-muted-foreground">1 projet = 1 dossier de travail = 1 conversation avec l'assistant.</p>
          </div>
          <Button asChild size="lg"><Link to="/projets/nouveau"><Plus className="h-4 w-4" /> Nouveau projet</Link></Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-64 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher un projet, un client, une référence…" className="bg-card pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-48 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {["En cours", "Rapport généré", "Rapport validé", "Validé"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={tech} onValueChange={setTech}>
            <SelectTrigger className="w-52 bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les techniques</SelectItem>
              {ALL_TECHNIQUES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="grid grid-cols-[2.2fr_1.2fr_1fr_1.6fr_1fr_1fr_24px] gap-4 border-b border-border bg-muted px-6 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <div>Projet</div><div>Client</div><div>Référence</div><div>Techniques</div><div>Statut</div><div>Modifié</div><div />
          </div>
          {rows.length === 0 && <div className="px-6 py-12 text-center text-sm text-muted-foreground">Aucun projet ne correspond à ces filtres.</div>}
          {rows.map((p) => (
            <button key={p.id} onClick={() => navigate({ to: "/projets/$projectId", params: { projectId: p.id } })} className="group grid w-full grid-cols-[2.2fr_1.2fr_1fr_1.6fr_1fr_1fr_24px] items-center gap-4 border-b border-border px-6 py-4 text-left transition-colors last:border-0 hover:bg-accent/40">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground"><FileText className="h-4 w-4" /></span>
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.nFiles} document{p.nFiles > 1 ? "s" : ""}</div>
                </div>
              </div>
              <div className="text-sm">{p.client}</div>
              <div className="font-mono text-xs text-muted-foreground">{p.reference}</div>
              <div className="flex flex-wrap gap-1">{p.techs.length ? p.techs.map((t) => <TechChip key={t} name={t} />) : <span className="text-xs text-muted-foreground">À identifier</span>}</div>
              <div><ProjectStatusBadge status={p.status} /></div>
              <div className="text-xs text-muted-foreground">{fmtAgo(p.updated_at)}</div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          ))}
        </div>
        <DemoBadge />
      </div>
    </AppShell>
  );
}
