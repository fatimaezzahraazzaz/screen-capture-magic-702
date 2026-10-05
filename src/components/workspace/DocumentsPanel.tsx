import { useRef } from "react";
import { FileImage, FileSpreadsheet, FileText, FileType, Loader2, Plus, Trash2, Activity } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDb } from "@/lib/db/database";
import type { ProjectFile } from "@/lib/db/types";
import { removeFile, uploadFiles } from "@/services/storage-service";
import { FileStatusBadge, fmtDate } from "@/components/app/shared";

function iconFor(f: ProjectFile) {
  const t = f.file_type;
  if (["JPG", "JPEG", "PNG", "TIF", "TIFF"].includes(t)) return FileImage;
  if (["CSV", "XLSX", "XLS"].includes(t)) return FileSpreadsheet;
  if (["ASC", "RAW", "MMES", "TRI", "MIT"].includes(t)) return Activity;
  if (["PDF", "DOCX", "DOC", "TXT"].includes(t)) return FileText;
  return FileType;
}

export function DocumentsPanel({ projectId }: { projectId: string }) {
  const files = useDb((d) => d.project_files.filter((f) => f.project_id === projectId));
  const input = useRef<HTMLInputElement>(null);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <div>
          <h3 className="text-sm font-bold">Documents du projet</h3>
          <p className="text-xs text-muted-foreground">{files.length} fichier{files.length > 1 ? "s" : ""}</p>
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
        {files.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">Aucun document. Ajoutez la commande client, les fichiers de mesure et les images.</div>
        )}
        {files.map((f) => {
          const Icon = iconFor(f);
          return (
            <div key={f.id} className="group animate-fade-up rounded-xl border border-border bg-card p-3 shadow-soft">
              <div className="flex items-start gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                  {f.status === "Analyse en cours" ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Icon className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium" title={f.filename}>{f.filename}</div>
                  <div className="text-[11px] text-muted-foreground">{f.file_type} · {f.size} · {fmtDate(f.created_at)}</div>
                </div>
                <button onClick={() => { removeFile(f.id); toast("Fichier retiré du projet"); }} className="opacity-0 transition-opacity group-hover:opacity-100" aria-label="Supprimer">
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
              <div className="mt-2"><FileStatusBadge status={f.status} /></div>
              {f.note && <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{f.note}</p>}
            </div>
          );
        })}
      </div>
      <div className="border-t border-border p-3">
        <input ref={input} type="file" multiple className="hidden" onChange={(e) => {
          const list = Array.from(e.target.files ?? []);
          if (list.length) { uploadFiles(projectId, list); toast.success(`${list.length} fichier(s) ajouté(s)`, { description: "Analyse du fichier..." }); }
          e.target.value = "";
        }} />
        <Button variant="outline" className="w-full" onClick={() => input.current?.click()}><Plus className="h-4 w-4" /> Ajouter des fichiers</Button>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">PDF, CSV, ASC, images, DOCX · formats natifs .raw .mmes .tri .mit</p>
      </div>
    </div>
  );
}
