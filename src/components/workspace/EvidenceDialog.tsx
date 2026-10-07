import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDb } from "@/lib/db/database";

export function EvidenceDialog({ measurementId, onClose }: { measurementId: string | null; onClose: () => void }) {
  const db = useDb((d) => d);
  const measurement = db.measurements.find((m) => m.id === measurementId);
  const sample = db.samples.find((s) => s.id === measurement?.sample_id);
  const file = db.project_files.find((f) => f.id === measurement?.source_file_id);
  return (
    <Dialog open={!!measurement} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Preuve exacte</DialogTitle><DialogDescription>Origine contrôlable de la valeur utilisée dans le rapport.</DialogDescription></DialogHeader>
        {measurement && <dl className="grid grid-cols-2 gap-4 text-sm">
          <Info label="Paramètre" value={measurement.parameter} />
          <Info label="Valeur et unité" value={`${measurement.value} ${measurement.unit === "—" ? "" : measurement.unit}`} />
          <Info label="Échantillon" value={`${sample?.reference ?? "—"} · ${sample?.name ?? "Non identifié"}`} />
          <Info label="Fichier source" value={file?.filename ?? "—"} />
          <Info label="Méthode" value={measurement.method} />
          <Info label="Version" value={`v${measurement.version}`} />
          <Info label="Statut" value={measurement.status === "contrôlé" ? "Contrôlé par l'analyste" : "À confirmer"} />
          <Info label="Identifiant de preuve" value={measurement.id} />
        </dl>}
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>;
}