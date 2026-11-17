"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        body: JSON.stringify({ messages: history.slice(-20) }),
      });

      if (!res.ok || !res.body) {
        throw new Error((await res.text()) || "Something went wrong.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: answer }]);
      }

      if (!answer.trim()) throw new Error("The assistant returned no answer.");
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
        <div className="h-[calc(100vh-24rem)] min-h-64 space-y-4 overflow-y-auto pr-1">
          {messages.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Ask me about cash flow, invoicing or budgeting. I cannot see your
              company data yet.
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