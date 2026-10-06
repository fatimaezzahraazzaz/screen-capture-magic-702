import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Input } from "@/components/ui/input";
import { DemoBadge, TechChip } from "@/components/app/shared";
import { useDb } from "@/lib/db/database";

export const Route = createFileRoute("/historique")({
  head: () => ({ meta: [{ title: "Historique A&S — A&S Report Assistant" }, { name: "description", content: "Anciens rapports A&S consultables par l'assistant." }, { property: "og:title", content: "Historique A&S" }, { property: "og:description", content: "Anciens rapports A&S consultables par l'assistant." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const items = useDb((d) => d.historical_experiences);
  const [q, setQ] = useState("");
  const rows = items.filter((e) => `${e.reference} ${e.title} ${e.material} ${e.technique}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <AppShell title="Historique">
      <div className="mx-auto max-w-5xl space-y-6 p-8">
        <div className="flex items-end justify-between">
          <div><h2 className="font-display text-2xl font-bold">Expérience A&S</h2><p className="mt-1 text-sm text-muted-foreground">Anciens rapports indexés que l'assistant consulte pour trouver des cas similaires.</p></div>
          <DemoBadge />
        </div>
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="bg-card pl-9" placeholder="Matériau, technique, référence…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-4">
          {rows.map((e) => (
            <div key={e.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex justify-between"><span className="font-mono text-xs text-muted-foreground">Rapport {e.reference} · {e.year}</span><TechChip name={e.technique} /></div>
              <div className="mt-2 font-semibold">{e.title}</div>
              <div className="text-xs text-muted-foreground">{e.material} · {e.client_sector}</div>
              <p className="mt-2 text-sm">{e.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
