import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getDb } from "@/lib/db/database";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "A&S Report Assistant — Accueil" },
      { name: "description", content: "Préparez vos rapports d'essais avec un assistant unique : documents, expérience A&S, sources et rapport." },
      { property: "og:title", content: "A&S Report Assistant" },
      { property: "og:description", content: "Préparez vos rapports d'essais avec un assistant unique." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: getDb().session ? "/projets" : "/login", replace: true });
  }, [navigate]);
  return <div className="min-h-screen bg-background" />;
}
