// Mock scientific web search. Replace `search` with a real search API later.
import type { Database, ExternalSource } from "@/lib/db/types";

export const externalSearchService = {
  search(db: Database, projectId: string, limit = 3): ExternalSource[] {
    const techs = db.techniques.filter((t) => t.project_id === projectId).map((t) => t.name);
    const order = ["e-1", "e-2", "e-3", "e-4", "e-5", "e-6"];
    if (techs.includes("Surface / topographie")) order.unshift("e-6");
    const ids = [...new Set(order)].slice(0, limit);
    return ids.map((id) => db.external_sources.find((s) => s.id === id)!).filter(Boolean);
  },
};

export function searchExternalSources(db: Database, projectId: string) {
  return externalSearchService.search(db, projectId);
}
