import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const MODEL = process.env.OLLAMA_MODEL ?? "llama3.2:3b";

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(20),
});

const SYSTEM_PROMPT = `You are TARRAJ AI, a friendly finance assistant for small business owners.
Reply in the same language the user writes in. Use short, simple sentences.
Right now you do NOT have access to the user's company data (transactions, invoices, budgets).
If asked about their numbers, say you cannot see their data yet. Never invent figures.
You can explain general finance ideas (cash flow, profit, invoicing, budgeting) and how to use TARRAJ AI.`;

export async function POST(req: Request) {
  // 1. Vetëm përdorues të kyçur
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Please log in.", { status: 401 });

  // 2. Valido pyetjen
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new Response("Invalid request.", { status: 400 });

  // 3. Dërgo te Ollama (stream: përgjigja vjen pjesë-pjesë)
  let upstream: Response;
  try {
    upstream = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...parsed.data.messages,
        ],
      }),
      signal: req.signal,
    });
  } catch {
    return new Response(
      "Could not reach the AI engine. Make sure Ollama is running.",
      { status: 503 }
    );
  }

  if (!upstream.ok || !upstream.body) {
    return new Response(
      "The AI engine returned an error. Check that the model is installed.",
      { status: 502 }
    );
  }

  // 4. Ollama dërgon një JSON për çdo rresht; ne nnxjerrim vetëm tekstin
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const upstreamBody = upstream.body;

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstreamBody.getReader();
      let buffer = "";

      const handleLine = (line: string) => {
        if (!line.trim()) return;
        try {
          const text = JSON.parse(line)?.message?.content;
          if (text) controller.enqueue(encoder.encode(text));
        } catch {
          // rresht i paplotë, e kalojmë
        }
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          lines.forEach(handleLine);
        }
        handleLine(buffer);
      } catch {
        // lidhja u ndërpre
      } finally {
        try {
          controller.close();
        } catch {
          // tashmë e mbyllur
        }
      }
    },
    cancel() {
      upstreamBody.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}