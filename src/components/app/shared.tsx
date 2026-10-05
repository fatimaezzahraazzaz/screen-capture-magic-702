import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { FileStatus, ProjectStatus } from "@/lib/db/types";
import { FlaskConical } from "lucide-react";

export const fmtDate = (iso: string) => format(new Date(iso), "d MMM yyyy", { locale: fr });
export const fmtDateTime = (iso: string) => format(new Date(iso), "d MMM yyyy 'à' HH:mm", { locale: fr });
export const fmtAgo = (iso: string) => formatDistanceToNow(new Date(iso), { locale: fr, addSuffix: true });

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-brand text-primary-foreground shadow-soft">
        <span className="font-display text-sm font-extrabold tracking-tight">A&amp;S</span>
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="font-display text-sm font-bold">A&amp;S Report Assistant</div>
          <div className="text-[11px] text-muted-foreground">Laboratoire d'essais matériaux</div>
        </div>
      )}
    </div>
  );
}

const projectTone: Record<ProjectStatus, string> = {
  "En cours": "bg-info-soft text-info",
  "Rapport généré": "bg-accent text-accent-foreground",
  "Rapport validé": "bg-success-soft text-success",
  Validé: "bg-success-soft text-success",
};
export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", projectTone[status])}>{status}</span>;
}

const fileTone: Record<FileStatus, string> = {
  Analysé: "bg-success-soft text-success",
  "À vérifier": "bg-warning-soft text-warning",
  "Format non pris en charge": "bg-danger-soft text-destructive",
  "Information manquante": "bg-warning-soft text-warning",
  "Analyse en cours": "bg-accent text-accent-foreground",
};
export function FileStatusBadge({ status }: { status: FileStatus }) {
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap", fileTone[status])}>{status === "Analyse en cours" ? "Analyse du fichier..." : status}</span>;
}

export function TechChip({ name }: { name: string }) {
  return <span className="inline-flex items-center rounded-md border border-border bg-card px-2 py-0.5 text-xs font-medium text-secondary-foreground">{name}</span>;
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-0.5 text-[11px] text-muted-foreground", className)}>
      <FlaskConical className="h-3 w-3" /> Données de démonstration
    </span>
  );
}
