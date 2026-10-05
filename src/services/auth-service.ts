import { getDb, updateDb } from "@/lib/db/database";

const DEMO = { email: "expert@analyse-surface.fr", password: "demo123" };

export function login(email: string, password: string): { ok: true } | { ok: false; error: string } {
  if (email.trim().toLowerCase() !== DEMO.email || password !== DEMO.password) {
    return { ok: false, error: "Identifiants incorrects. Utilisez le compte de démonstration." };
  }
  const user = getDb().users.find((u) => u.email === DEMO.email)!;
  updateDb((db) => ({ ...db, session: { userId: user.id } }));
  return { ok: true };
}

export function logout() {
  updateDb((db) => ({ ...db, session: null }));
}
