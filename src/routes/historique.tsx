import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { DemoBadge } from "@/components/app/shared";

export const Route = createFileRoute("/historique")({
  head: () => ({ meta: [{ title: "Historique — A&S Report Assistant" }, { name: "description", content: "Historique" }, { property: "og:title", content: "Historique" }, { property: "og:description", content: "Historique" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => (
    <AppShell title="Historique">
      <div className="mx-auto max-w-4xl space-y-4 p-8"><h2 className="font-display text-2xl font-bold">Historique</h2><p className="text-sm text-muted-foreground">Rapports A&S passés consultables par l'assistant.</p><DemoBadge /></div>
    </AppShell>
  ),
});
