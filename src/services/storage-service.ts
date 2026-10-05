// Mock file storage + parsing. Replace with real storage and scientific parsers later.
import { now, uid, updateDb } from "@/lib/db/database";
import type { FileStatus } from "@/lib/db/types";

const NATIVE = ["raw", "mmes", "tri", "mit"];
const SUPPORTED = ["pdf", "csv", "asc", "txt", "xlsx", "xls", "jpg", "jpeg", "png", "tif", "tiff", "docx", "doc"];

function formatSize(bytes: number) {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} Mo`;
  return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
}

export function uploadFiles(projectId: string, files: File[]) {
  const created = files.map((f) => ({
    id: uid("f"),
    project_id: projectId,
    filename: f.name,
    file_type: (f.name.split(".").pop() ?? "?").toUpperCase(),
    size: formatSize(f.size),
    status: "Analyse en cours" as FileStatus,
    created_at: now(),
  }));
  updateDb((db) => ({ ...db, project_files: [...db.project_files, ...created] }));

  created.forEach((file) => {
    const ext = file.file_type.toLowerCase();
    setTimeout(() => {
      let status: FileStatus = "Analysé";
      let note: string | undefined;
      if (NATIVE.includes(ext)) {
        status = "Format non pris en charge";
        note = "Format natif détecté. Un export CSV/TXT/Excel peut être nécessaire.";
      } else if (!SUPPORTED.includes(ext)) {
        status = "Format non pris en charge";
        note = "Ce format n'est pas reconnu.";
      } else if (ext === "docx" || ext === "doc") {
        status = "À vérifier";
        note = "Contenu extrait, relecture conseillée.";
      }
      updateDb((db) => ({ ...db, project_files: db.project_files.map((x) => (x.id === file.id ? { ...x, status, note } : x)) }));
    }, 1200 + Math.random() * 800);
  });
  return created;
}

export function removeFile(fileId: string) {
  updateDb((db) => ({ ...db, project_files: db.project_files.filter((f) => f.id !== fileId) }));
}
