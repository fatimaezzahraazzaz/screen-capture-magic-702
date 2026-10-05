import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { DemoBadge } from "@/components/app/shared";

export const Route = createFileRoute("/modeles")({
  head: () => ({ meta: [{ title: "Modèles de rapports — A&S Report Assistant" }, { name: "description", content: "Modèles de rapports" }, { property: "og:title", content: "Modèles de rapports" }, { property: "og:description", content: "Modèles de rapports" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => (
    <AppShell title="Modèles de rapports">
      <div className="mx-auto max-w-4xl space-y-4 p-8"><h2 className="font-display text-2xl font-bold">Modèles de rapports</h2><p className="text-sm text-muted-foreground">Modèles disponibles pour la génération des rapports.</p><DemoBadge /></div>
    </AppShell>
  ),
});
