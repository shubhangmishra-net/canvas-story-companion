import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { JWALA_WIKI } from "@/lib/wiki-jwala.server";

const SYSTEM = `You are the friendly narrator of a retro pixel-game presentation: "Personalities Who Raised the Universal Consciousness — Jwala Gutta". Answer ANY audience question helpfully (general questions too). For facts about Jwala Gutta, rely on the Wikipedia article below; if it doesn't cover something, say so briefly. Keep answers under 80 words, plain text, no markdown.

WIKIPEDIA ARTICLE:
${JWALA_WIKI}`;

const Body = z.object({ question: z.string().trim().min(1).max(500) });

export const Route = createFileRoute("/api/ask")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = Body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: "Please type a question." }, { status: 400 });
        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return Response.json({ error: "AI is not configured." }, { status: 500 });

        let upstream: Response;
        try {
        upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, "X-Lovable-AIG-SDK": "fetch" },
          body: JSON.stringify({
            model: "google/gemini-3.8-flash",
            stream: true,
            reasoning_effort: "low",
            messages: [{ role: "system", content: SYSTEM }, { role: "user", content: parsed.data.question }],
          }),
        });
        } catch (err) {
          // Expected when the audience member leaves or the browser cancels mid-request.
          if (request.signal.aborted || (err instanceof Error && err.name === "AbortError")) return new Response(null, { status: 499 });
          return Response.json({ error: "Couldn't reach the AI. Try again." }, { status: 502 });
        }
        if (!upstream.ok || !upstream.body) {
          let msg = "The AI couldn't answer right now.";
          if (upstream.status === 429) msg = "Too many questions at once — try again in a moment.";
          else if (upstream.status === 402) msg = "AI credits have run out for this workspace.";
          else { try { const j = await upstream.json(); msg = j?.error?.message || j?.message || msg; } catch { /* keep default */ } }
          return Response.json({ error: msg }, { status: upstream.status });
        }

        const reader = upstream.body.getReader();
        const dec = new TextDecoder();
        const enc = new TextEncoder();
        let buf = "";
        const stream = new ReadableStream<Uint8Array>({
          async pull(ctrl) {
            for (let sent = false; !sent;) {
            let chunk: ReadableStreamReadResult<Uint8Array>;
            try { chunk = await reader.read(); } catch { ctrl.close(); return; }
            const { done, value } = chunk;
            if (done) { ctrl.close(); return; }
            buf += dec.decode(value, { stream: true });
            const lines = buf.split("\n");
            buf = lines.pop() ?? "";
            for (const l of lines) {
              const t = l.trim();
              if (!t.startsWith("data:")) continue;
              const p = t.slice(5).trim();
              if (p === "[DONE]") continue;
              try {
                const c = JSON.parse(p).choices?.[0]?.delta?.content;
                if (c) { ctrl.enqueue(enc.encode(c)); sent = true; }
              } catch { /* partial chunk */ }
            }
            }
          },
          cancel() { reader.cancel(); },
        });
        return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
      },
    },
  },
});
