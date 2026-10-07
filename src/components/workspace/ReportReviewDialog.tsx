import { AlertTriangle, CheckCircle2, FileCheck2, FlaskConical, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDb } from "@/lib/db/database";
import { reportReadiness } from "@/services/report-service";

export function ReportReviewDialog({ projectId, open, mode, onOpenChange, onContinue }: { projectId: string; open: boolean; mode: "generate" | "validate"; onOpenChange: (open: boolean) => void; onContinue: () => void }) {
  const db = useDb((d) => d);
  const review = reportReadiness(db, projectId);
  const sources = db.external_sources.filter((s) => db.project_selected_sources.some((x) => x.project_id === projectId && x.source_id === s.id));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contrôle avant {mode === "generate" ? "génération" : "validation"}</DialogTitle>
          <DialogDescription>Vérifiez la complétude et la preuve de chaque donnée avant de poursuivre.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <ReviewBlock icon={FileCheck2} title={`Fichiers (${review.files.length})`} ok={!review.blockingFiles.length}>
            {review.files.map((f) => <Row key={f.id} main={f.filename} detail={f.status} warning={review.blockingFiles.some((x) => x.id === f.id)} />)}
          </ReviewBlock>
          <ReviewBlock icon={FlaskConical} title={`Échantillons (${review.samples.length})`} ok={review.samples.length > 0}>
            {review.samples.map((s) => <Row key={s.id} main={s.reference} detail={s.name} />)}
          </ReviewBlock>
          <ReviewBlock icon={Link2} title={`Valeurs, unités et preuves (${review.measurements.length})`} ok={!review.uncertain.length}>
            {review.measurements.map((m) => {
              const file = review.files.find((f) => f.id === m.source_file_id);
              return <Row key={m.id} main={`${m.parameter} · ${m.value} ${m.unit === "—" ? "" : m.unit}`} detail={`${file?.filename ?? "Sans source"} · v${m.version}`} warning={m.status === "à confirmer"} />;
            })}
          </ReviewBlock>
          <ReviewBlock icon={Link2} title={`Sources externes (${sources.length})`} ok={sources.every((s) => s.verified)}>
            {sources.length ? sources.map((s) => <Row key={s.id} main={s.identifier} detail={s.publisher} warning={!s.verified} />) : <p className="text-xs text-muted-foreground">Aucune source externe retenue.</p>}
          </ReviewBlock>
        </div>
        {review.missing.length > 0 && <div className="border-l-2 border-warning bg-warning-soft p-4 text-sm"><div className="font-semibold">Informations manquantes à signaler dans le rapport</div>{review.missing.map((f) => <p key={f.id} className="mt-1 text-xs">{f.filename} — {f.note}</p>)}</div>}
        {!review.ready && <div className="flex gap-2 border-l-2 border-destructive bg-danger-soft p-4 text-sm text-destructive"><AlertTriangle className="h-4 w-4 shrink-0" /><span>La suite est bloquée : confirmez les fichiers et valeurs signalés dans le panneau Projet.</span></div>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Revenir au projet</Button>
          <Button disabled={!review.ready} onClick={onContinue}><CheckCircle2 className="h-4 w-4" /> {mode === "generate" ? "Générer le brouillon" : "Valider le rapport"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReviewBlock({ icon: Icon, title, ok, children }: { icon: typeof FileCheck2; title: string; ok: boolean; children: React.ReactNode }) {
  return <section className="border border-border bg-card p-4"><div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4" />{title}<span className={ok ? "ml-auto text-success" : "ml-auto text-warning"}>{ok ? "Conforme" : "À contrôler"}</span></div><div className="space-y-2">{children}</div></section>;
}
function Row({ main, detail, warning }: { main: string; detail: string; warning?: boolean }) {
  return <div className="flex items-start justify-between gap-3 border-b border-border pb-2 text-xs last:border-0 last:pb-0"><span className="font-medium">{main}</span><span className={warning ? "text-right text-warning" : "text-right text-muted-foreground"}>{detail}</span></div>;
}