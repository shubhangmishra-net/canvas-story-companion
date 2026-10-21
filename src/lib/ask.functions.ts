import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SYSTEM = `You are the narrator of a retro pixel-game presentation titled "Personalities Who Raised the Universal Consciousness — Jwala Gutta". Answer audience questions about Jwala Gutta (Indian badminton doubles champion), her life, achievements, activism, and the idea of universal (collective) consciousness. Keep answers under 90 words, warm, clear, in plain text. If unsure of a fact, say so.`;

export const askGemini = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ question: z.string().min(1).max(500) }).parse(d))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { error: "AI is not configured." };
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        stream: true,
        messages: [{ role: "system", content: SYSTEM }, { role: "user", content: data.question }],
      }),
    });
    if (!res.ok || !res.body) {
      if (res.status === 429) return { error: "Too many questions right now — try again in a moment." };
      if (res.status === 402) return { error: "AI credits have run out for this workspace." };
      let msg = "The AI couldn't answer right now.";
      try { const j = await res.json(); msg = j?.error?.message || j?.message || msg; } catch {}
      return { error: msg };
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "", out = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const l of lines) {
        const t = l.trim();
        if (!t.startsWith("data:")) continue;
        const p = t.slice(5).trim();
        if (p === "[DONE]") continue;
        try { out += JSON.parse(p).choices?.[0]?.delta?.content ?? ""; } catch {}
      }
    }
    return out ? { answer: out } : { error: "No answer was returned." };
  });
