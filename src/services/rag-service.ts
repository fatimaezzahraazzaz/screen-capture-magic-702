// Mock semantic search over historical A&S reports.
// Replace `search` with a Chroma query later; the return shape stays the same.
import type { Database, HistoricalExperience } from "@/lib/db/types";

export interface RagHit { experience: HistoricalExperience; score: number }

export const ragService = {
  search(db: Database, projectId: string, limit = 3): RagHit[] {
    const techs = db.techniques.filter((t) => t.project_id === projectId).map((t) => t.name.toLowerCase());
    const project = db.projects.find((p) => p.id === projectId);
    const text = `${project?.name ?? ""} ${project?.description ?? ""}`.toLowerCase();
    return db.historical_experiences
      .map((e) => {
        let score = e.fake_similarity_score;
        if (!text.includes(e.material.toLowerCase().split(" ")[0] ?? "") && !techs.some((t) => e.technique.toLowerCase().includes(t))) score -= 25;
        return { experience: e, score: Math.max(20, Math.min(99, score)) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },
};

export function searchInternalHistory(db: Database, projectId: string) {
  return ragService.search(db, projectId);
}
