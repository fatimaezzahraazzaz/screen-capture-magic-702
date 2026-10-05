import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Bell, FolderKanban, History, LayoutTemplate, LogOut, Settings, ChevronDown } from "lucide-react";
import { useDb } from "@/lib/db/database";
import { logout } from "@/services/auth-service";
import { Logo } from "./shared";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const NAV = [
  { to: "/projets", label: "Projets", icon: FolderKanban },
  { to: "/historique", label: "Historique", icon: History },
  { to: "/modeles", label: "Modèles de rapports", icon: LayoutTemplate },
  { to: "/parametres", label: "Paramètres", icon: Settings },
] as const;

export function AppShell({ title, children, fullBleed }: { title: string; children: ReactNode; fullBleed?: boolean }) {
  const session = useDb((d) => d.session);
  const user = useDb((d) => d.users[0]) ?? { name: "Expert Démo", role: "Expert", email: "" };
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [hydrated, setHydrated] = useHydratedFlag();

  useEffect(() => setHydrated(true), [setHydrated]);
  useEffect(() => {
    if (hydrated && !session) navigate({ to: "/login" });
  }, [hydrated, session, navigate]);

  return (
    <div className="flex h-screen bg-background">
      <aside className="flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="px-5 py-5"><Logo /></div>
        <nav className="flex-1 space-y-1 px-3 pt-2">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = path.startsWith(to);
            return (
              <Link key={to} to={to} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors", active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-muted")}>
                <Icon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="m-3 rounded-xl border border-dashed border-border p-3 text-[11px] leading-relaxed text-muted-foreground">
          Prototype — toutes les données affichées sont fictives et servent uniquement à la démonstration.
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
          <h1 className="font-display text-lg font-bold">{title}</h1>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger className="relative grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="border-b border-border px-4 py-3 text-sm font-semibold">Notifications</div>
                {[
                  ["Analyse terminée", "7 fichiers analysés — AS-2026-143"],
                  ["Rapport généré", "Brouillon prêt — AS-2026-127"],
                  ["Rapport validé", "AS-2026-102 approuvé"],
                ].map(([t, d]) => (
                  <div key={t} className="border-b border-border px-4 py-3 last:border-0">
                    <div className="text-sm font-medium">{t}</div>
                    <div className="text-xs text-muted-foreground">{d}</div>
                  </div>
                ))}
              </PopoverContent>
            </Popover>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">ED</div>
                <div className="text-left leading-tight">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-[11px] text-muted-foreground">{user.role}</div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/parametres" })}><Settings className="mr-2 h-4 w-4" /> Paramètres</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { logout(); navigate({ to: "/login" }); }}><LogOut className="mr-2 h-4 w-4" /> Se déconnecter</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className={cn("min-h-0 flex-1", fullBleed ? "overflow-hidden" : "overflow-y-auto")}>
          {hydrated && session ? children : null}
        </main>
      </div>
    </div>
  );
}

function useHydratedFlag() {
  return useState(false);
}
