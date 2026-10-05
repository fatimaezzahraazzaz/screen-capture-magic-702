import { useEffect, useRef, useState } from "react";
import { ArrowUp, Check, FileSearch, FileText, Globe, History, Microscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDb } from "@/lib/db/database";
import { answerChat, type ChatResult } from "@/services/mock-ai";
import { confirmAssociation } from "@/services/project-service";
import { cn } from "@/lib/utils";

const QUICK = [
  { label: "Analyser les documents", prompt: "Analyse les documents de ce projet.", icon: FileSearch },
  { label: "Rechercher une expérience A&S", prompt: "Avons-nous déjà travaillé sur ce matériau ?", icon: History },
  { label: "Recherche externe", prompt: "Fais aussi une recherche externe.", icon: Globe },
  { label: "Préparer le rapport", prompt: "Prépare maintenant le rapport.", icon: FileText },
];

export function ChatPanel({ projectId, onResult, onOpenReport }: { projectId: string; onResult: (r: ChatResult) => void; onOpenReport: () => void }) {
  const messages = useDb((d) => d.chat_messages.filter((m) => m.project_id === projectId));
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const ta = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length, busy]);
  useEffect(() => { if (!busy) ta.current?.focus(); }, [busy]);

  const send = async (msg: string) => {
    if (!msg.trim() || busy) return;
    setText("");
    setBusy(true);
    const r = await answerChat(projectId, msg.trim());
    setBusy(false);
    onResult(r);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-5 px-6 py-6">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex animate-fade-up gap-3", m.role === "user" && "justify-end")}>
              {m.role === "assistant" && (
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-brand text-primary-foreground"><Microscope className="h-4 w-4" /></span>
              )}
              <div className={cn("max-w-[85%]", m.role === "user" ? "rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground" : "text-sm leading-relaxed")}>
                <div className="whitespace-pre-wrap">{m.content}</div>
                {m.action === "confirm_association" && (
                  <Button size="sm" variant={m.action_done ? "secondary" : "default"} className="mt-3" disabled={m.action_done} onClick={() => confirmAssociation(projectId, m.id)}>
                    {m.action_done ? <><Check className="h-4 w-4" /> Association confirmée</> : "Confirmer l'association"}
                  </Button>
                )}
                {m.action === "open_report" && (
                  <Button size="sm" className="mt-3" onClick={onOpenReport}><FileText className="h-4 w-4" /> Aperçu du rapport</Button>
                )}
                {m.action === "show_experiences" && (
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => onResult({ focusTab: "experience" })}>Voir les expériences A&S</Button>
                )}
                {m.action === "show_sources" && (
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => onResult({ focusTab: "sources" })}>Voir les sources externes</Button>
                )}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-brand text-primary-foreground"><Microscope className="h-4 w-4" /></span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Analyse en cours
                <span className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 animate-dot rounded-full bg-primary" style={{ animationDelay: `${i * 0.15}s` }} />)}</span>
              </div>
            </div>
          )}
          <div ref={end} />
        </div>
      </div>
      <div className="border-t border-border bg-card px-6 py-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-3 flex flex-wrap gap-2">
            {QUICK.map(({ label, prompt, icon: Icon }) => (
              <button key={label} disabled={busy} onClick={() => send(prompt)} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:border-primary hover:bg-accent hover:text-accent-foreground disabled:opacity-50">
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="flex items-end gap-2 rounded-2xl border border-input bg-background p-2 focus-within:ring-2 focus-within:ring-ring/30">
            <Textarea ref={ta} rows={1} value={text} onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); } }}
              placeholder="Posez une question sur ce projet…" className="min-h-10 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0" />
            <Button type="submit" size="icon" disabled={busy || !text.trim()} aria-label="Envoyer"><ArrowUp className="h-4 w-4" /></Button>
          </form>
        </div>
      </div>
    </div>
  );
}
