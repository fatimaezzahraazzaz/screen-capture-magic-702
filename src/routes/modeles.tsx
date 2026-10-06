import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { DemoBadge, TechChip } from "@/components/app/shared";
import { useDb } from "@/lib/db/database";

export const Route = createFileRoute("/modeles")({
  head: () => ({ meta: [{ title: "Modèles de rapports — A&S Report Assistant" }, { name: "description", content: "Modèles utilisés pour générer les rapports d'essais." }, { property: "og:title", content: "Modèles de rapports" }, { property: "og:description", content: "Modèles utilisés pour générer les rapports d'essais." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: TemplatesPage,
});

function TemplatesPage() {
  const tpls = useDb((d) => d.report_templates);
  return (
    <AppShell title="Modèles de rapports">
      <div className="mx-auto max-w-5xl space-y-6 p-8">
        <div className="flex items-end justify-between">
          <div><h2 className="font-display text-2xl font-bold">Modèles de rapports</h2><p className="mt-1 text-sm text-muted-foreground">L'assistant recommande un modèle selon les techniques du projet.</p></div>
          <DemoBadge />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {tpls.map((t) => (
            <div key={t.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="font-display font-bold">{t.name}</div>
              <div className="mt-2 flex flex-wrap gap-1">{t.techniques.length ? t.techniques.map((x) => <TechChip key={x} name={x} />) : <TechChip name="Toutes techniques" />}</div>
              <ol className="mt-3 space-y-0.5 text-xs text-muted-foreground">{t.sections.map((s, i) => <li key={s}>{i + 1}. {s}</li>)}</ol>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
