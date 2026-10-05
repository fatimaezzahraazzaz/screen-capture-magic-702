import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, MessagesSquare, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/services/auth-service";
import { DemoBadge, Logo } from "@/components/app/shared";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Connexion — A&S Report Assistant" },
      { name: "description", content: "Connectez-vous à A&S Report Assistant." },
      { property: "og:title", content: "Connexion — A&S Report Assistant" },
      { property: "og:description", content: "Connectez-vous à A&S Report Assistant." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("expert@analyse-surface.fr");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = login(email, password);
    if (r.ok) navigate({ to: "/projets" });
    else setError(r.error);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-subtle p-12 lg:flex">
        <Logo />
        <div className="max-w-md space-y-8">
          <h2 className="font-display text-3xl font-bold leading-tight">De vos documents d'essais à un rapport validé, avec un seul assistant.</h2>
          <ul className="space-y-4 text-sm text-muted-foreground">
            {[
              [FileText, "Déposez les documents du projet, l'assistant les analyse."],
              [MessagesSquare, "Interrogez l'expérience A&S et la littérature scientifique."],
              [ShieldCheck, "Chaque résultat reste traçable jusqu'à son fichier source."],
            ].map(([Icon, t], i) => {
              const I = Icon as typeof FileText;
              return (
                <li key={i} className="flex items-start gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-card text-primary shadow-soft"><I className="h-4 w-4" /></span>
                  <span className="pt-1.5">{t as string}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <DemoBadge />
      </div>
      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm space-y-6">
          <div className="lg:hidden"><Logo /></div>
          <div>
            <h1 className="font-display text-2xl font-bold">Connexion</h1>
            <p className="mt-1 text-sm text-muted-foreground">Accédez à vos projets d'essais.</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pwd">Mot de passe</Label>
              <Input id="pwd" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <Button type="submit" className="w-full" size="lg">Se connecter</Button>
          <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            Compte de démonstration : <b>expert@analyse-surface.fr</b> / <b>demo123</b>
          </div>
        </form>
      </div>
    </div>
  );
}
