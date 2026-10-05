import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { DemoBadge } from "@/components/app/shared";

export const Route = createFileRoute("/parametres")({
  head: () => ({ meta: [{ title: "Paramètres — A&S Report Assistant" }, { name: "description", content: "Paramètres" }, { property: "og:title", content: "Paramètres" }, { property: "og:description", content: "Paramètres" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => (
    <AppShell title="Paramètres">
      <div className="mx-auto max-w-4xl space-y-4 p-8"><h2 className="font-display text-2xl font-bold">Paramètres</h2><p className="text-sm text-muted-foreground">Préférences du compte de démonstration.</p><DemoBadge /></div>
    </AppShell>
  ),
});
