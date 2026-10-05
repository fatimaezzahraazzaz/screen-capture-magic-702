import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ALL_TECHNIQUES, createProject } from "@/services/project-service";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projets/nouveau")({
  head: () => ({
    meta: [
      { title: "Nouveau projet — A&S Report Assistant" },
      { name: "description", content: "Créer un nouveau projet d'essais." },
      { property: "og:title", content: "Nouveau projet — A&S Report Assistant" },
      { property: "og:description", content: "Créer un nouveau projet d'essais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewProject,
});

function NewProject() {
  const navigate = useNavigate();
  const [f, setF] = useState({ name: "", client: "", reference: `AS-2026-${150 + Math.floor(Math.random() * 40)}`, description: "" });
  const [techs, setTechs] = useState<string[]>([]);
  const valid = f.name.trim() && f.client.trim() && f.reference.trim();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const id = createProject({ ...f, techniques: techs });
    navigate({ to: "/projets/$projectId", params: { projectId: id } });
  };

  return (
    <AppShell title="Nouveau projet">
      <div className="mx-auto max-w-2xl p-8">
        <Link to="/projets" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Mes projets</Link>
        <form onSubmit={submit} className="space-y-6 rounded-2xl border border-border bg-card p-8 shadow-soft">
          <div>
            <h2 className="font-display text-xl font-bold">Créer un projet</h2>
            <p className="mt-1 text-sm text-muted-foreground">Vous pourrez déposer les documents juste après.</p>
          </div>
          <div className="space-y-2"><Label>Nom du projet *</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ex. Analyse de dépôt sur joint" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Client *</Label><Input value={f.client} onChange={(e) => setF({ ...f, client: e.target.value })} placeholder="Ex. Industrie Alpha" /></div>
            <div className="space-y-2"><Label>Référence *</Label><Input value={f.reference} onChange={(e) => setF({ ...f, reference: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>Description courte</Label><Textarea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Contexte et objectif de l'étude" /></div>
          <div className="space-y-2">
            <Label>Techniques connues <span className="font-normal text-muted-foreground">(optionnel)</span></Label>
            <div className="flex flex-wrap gap-2">
              {ALL_TECHNIQUES.map((t) => {
                const on = techs.includes(t);
                return (
                  <button type="button" key={t} onClick={() => setTechs(on ? techs.filter((x) => x !== t) : [...techs, t])} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors", on ? "border-primary bg-accent text-accent-foreground" : "border-border hover:bg-muted")}>
                    {on && <Check className="h-3.5 w-3.5" />}{t}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate({ to: "/projets" })}>Annuler</Button>
            <Button type="submit" disabled={!valid}>Créer le projet</Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
