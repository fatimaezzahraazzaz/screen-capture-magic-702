import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/app/shared";
import { resetDb, useDb } from "@/lib/db/database";

export const Route = createFileRoute("/parametres")({
  head: () => ({ meta: [{ title: "Paramètres — A&S Report Assistant" }, { name: "description", content: "Compte et réglages de la démonstration." }, { property: "og:title", content: "Paramètres" }, { property: "og:description", content: "Compte et réglages de la démonstration." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const user = useDb((d) => d.users[0]);
  return (
    <AppShell title="Paramètres">
      <div className="mx-auto max-w-2xl space-y-6 p-8">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display font-bold">Compte</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div><div className="text-xs text-muted-foreground">Nom</div>{user?.name}</div>
            <div><div className="text-xs text-muted-foreground">Rôle</div>{user?.role}</div>
            <div><div className="text-xs text-muted-foreground">E-mail</div>{user?.email}</div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display font-bold">Démonstration</h2>
          <p className="mt-1 text-sm text-muted-foreground">Remet tous les projets, conversations et rapports dans leur état initial.</p>
          <Button variant="outline" className="mt-4" onClick={() => { resetDb(); toast.success("Données de démonstration réinitialisées"); }}>Réinitialiser la démo</Button>
        </div>
        <DemoBadge />
      </div>
    </AppShell>
  );
}
