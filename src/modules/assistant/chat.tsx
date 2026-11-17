"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };

export function Chat({
  initialMessages,
  initialConversationId,
}: {
  initialMessages: Message[];
  initialConversationId: string | null;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId
  );
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function newChat() {
    if (pending) return;
    setMessages([]);
    setConversationId(null);
    setError("");
  }

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = input.trim();
    if (!text || pending) return;

    setError("");
    setInput("");
    setPending(true);

    const history: Message[] = [...messages, { role: "user", content: text }];
    setMessages([...history, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          ...(conversationId && { conversationId }),
        }),
      });

      const answer = await res.text();
      if (!res.ok) throw new Error(answer || "Something went wrong.");

      const newId = res.headers.get("X-Conversation-Id");
      if (newId) setConversationId(newId);

      setMessages([...history, { role: "assistant", content: answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setMessages(history);
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={newChat}
            disabled={pending || messages.length === 0}
          >
            <Plus className="size-4" /> New chat
          </Button>
        </div>

        <div className="h-[calc(100vh-27rem)] min-h-64 space-y-4 overflow-y-auto pr-1">
          {messages.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Ask about your income, expenses, invoices or budgets. Answers can
              take up to a minute on a small computer.
            </p>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={cn("flex", m.role === "user" && "justify-end")}
            >
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background"
                )}
              >
                {m.content || (pending ? "Thinking..." : "")}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <form onSubmit={send} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            maxLength={2000}
            disabled={pending}
          />
          <Button type="submit" disabled={pending || !input.trim()}>
            <Send className="size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}