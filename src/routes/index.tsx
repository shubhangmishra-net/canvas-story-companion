import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askGemini } from "@/lib/ask.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jwala Gutta — Personalities Who Raised the Universal Consciousness" },
      { name: "description", content: "An interactive pixel-game presentation on Jwala Gutta's life, wins and voice — with a Gemini-powered audience Q&A." },
      { property: "og:title", content: "Jwala Gutta — Universal Consciousness" },
      { property: "og:description", content: "Interactive retro presentation with live AI audience Q&A." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Deck,
});

type Slide = { level: string; title: string; render: () => React.ReactNode };

const Card = ({ children, tone = "bg-card" }: { children: React.ReactNode; tone?: string }) => (
  <div className={`pixel-box ${tone} p-5`}>{children}</div>
);

function Timeline() {
  const items = [
    ["1983", "Born 7 Sept in Wardha, Maharashtra; raised in Hyderabad."],
    ["2010", "Commonwealth Games GOLD — women's doubles with Ashwini Ponnappa."],
    ["2011", "World Championships BRONZE — first Indian women's pair to medal. Arjuna Award."],
    ["2012-16", "Represents India at the London and Rio Olympics."],
  ];
  const [open, setOpen] = useState(0);
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {items.map(([y, t], i) => (
        <button key={y} onClick={() => setOpen(i)}
          className={`pixel-btn p-4 text-left ${open === i ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground"}`}>
          <div className="text-xs md:text-sm">{y}</div>
          {open === i && <p className="mt-3 font-mono text-xl leading-tight">{t}</p>}
        </button>
      ))}
    </div>
  );
}

function Quiz() {
  const q = { text: "Who partnered Jwala Gutta to Commonwealth Games gold in 2010?", opts: ["Saina Nehwal", "Ashwini Ponnappa", "P. V. Sindhu"], ans: 1 };
  const [pick, setPick] = useState<number | null>(null);
  return (
    <Card>
      <p className="text-2xl md:text-3xl">{q.text}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {q.opts.map((o, i) => (
          <button key={o} onClick={() => setPick(i)}
            className={`pixel-btn p-3 text-xs ${pick === null ? "bg-muted text-foreground" : i === q.ans ? "bg-secondary text-secondary-foreground" : pick === i ? "bg-destructive text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
            {o}
          </button>
        ))}
      </div>
      {pick !== null && <p className="mt-4 text-2xl text-primary">{pick === q.ans ? "+500 POINTS! Correct." : "Miss! It was Ashwini Ponnappa."}</p>}
    </Card>
  );
}

function AskAI() {
  const ask = useServerFn(askGemini);
  const [q, setQ] = useState("");
  const [log, setLog] = useState<{ q: string; a: string; err?: boolean }[]>([]);
  const [busy, setBusy] = useState(false);
  const submit = async (question: string) => {
    if (!question.trim() || busy) return;
    setBusy(true); setQ("");
    try {
      const r = await ask({ data: { question } });
      setLog((l) => [{ q: question, a: "answer" in r && r.answer ? r.answer : (r as { error?: string }).error ?? "No answer.", err: !("answer" in r) }, ...l]);
    } catch { setLog((l) => [{ q: question, a: "Connection lost. Try again.", err: true }, ...l]); }
    setBusy(false);
  };
  const samples = ["What does universal consciousness mean?", "How did Jwala fight for equality?", "Why is doubles badminton special?"];
  return (
    <div className="space-y-4" onKeyDown={(e) => e.stopPropagation()}>
      <form onSubmit={(e) => { e.preventDefault(); submit(q); }} className="flex gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type an audience question..."
          className="pixel-box min-w-0 flex-1 bg-input px-4 py-3 text-2xl text-foreground outline-none placeholder:text-muted-foreground" />
        <button disabled={busy} className="pixel-btn bg-primary px-4 text-xs text-primary-foreground disabled:opacity-60">{busy ? "..." : "ASK"}</button>
      </form>
      <div className="flex flex-wrap gap-2">
        {samples.map((s) => <button key={s} onClick={() => submit(s)} className="pixel-btn bg-muted px-3 py-2 text-[10px] text-foreground">{s}</button>)}
      </div>
      <div className="max-h-[38vh] space-y-3 overflow-y-auto pr-2">
        {busy && <Card><span className="text-2xl">GEMINI IS THINKING<span className="animate-blink">_</span></span></Card>}
        {log.map((m, i) => (
          <Card key={i}>
            <p className="text-xl text-primary">&gt; {m.q}</p>
            <p className={`mt-2 text-2xl leading-snug ${m.err ? "text-destructive" : ""}`}>{m.a}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

const slides: Slide[] = [
  { level: "START", title: "", render: () => (
    <div className="flex flex-col items-center text-center">
      <p className="text-[10px] text-primary md:text-sm">PLAYER 1 · HIGHSCORE 2500 · PLAYER 2</p>
      <h1 className="text-pixel-shadow mt-8 font-pixel text-xl leading-relaxed md:text-4xl">PERSONALITIES WHO RAISED THE UNIVERSAL CONSCIOUSNESS</h1>
      <p className="text-pixel-shadow mt-6 font-pixel text-lg text-primary md:text-3xl">— JWALA GUTTA</p>
      <p className="mt-8 max-w-2xl text-2xl md:text-3xl">The biography of Jwala Gutta, how she raised the universal consciousness — and what universal consciousness really is.</p>
      <p className="mt-10 animate-blink font-pixel text-xs text-primary">PRESS → OR SPACE TO START</p>
    </div>) },
  { level: "LEVEL 1", title: "What is Universal Consciousness?", render: () => (
    <div className="grid gap-5 md:grid-cols-3">
      {[["★", "Shared awareness", "The idea that we're all part of one larger human awareness — our choices ripple outward."],
        ["♥", "Empathy", "Seeing others' struggles as our own, beyond borders, race or gender."],
        ["↑", "Collective rise", "When one person breaks a barrier, everyone's sense of what's possible expands."]].map(([i, h, t]) => (
        <Card key={h}><div className="animate-bob font-pixel text-3xl text-star">{i}</div><h3 className="mt-4 font-pixel text-sm">{h}</h3><p className="mt-3 text-2xl leading-snug">{t}</p></Card>))}
    </div>) },
  { level: "LEVEL 2", title: "Player Profile", render: () => (
    <div className="grid gap-5 md:grid-cols-2">
      <Card><h3 className="font-pixel text-sm text-primary">JWALA GUTTA</h3>
        <ul className="mt-4 space-y-2 text-2xl"><li>▸ Class: Badminton doubles</li><li>▸ Origin: Wardha → Hyderabad</li><li>▸ Heritage: Telugu father, Chinese mother</li><li>▸ Special move: Left-handed power smash</li></ul></Card>
      <Card tone="bg-muted"><h3 className="font-pixel text-sm text-secondary">STATS</h3>
        {[["SKILL", 95], ["COURAGE", 100], ["VOICE", 98]].map(([k, v]) => (
          <div key={k} className="mt-4"><div className="flex justify-between text-2xl"><span>{k}</span><span>{v}</span></div>
            <div className="pixel-box mt-1 h-5 bg-background"><div className="h-full bg-secondary" style={{ width: `${v}%` }} /></div></div>))}</Card>
    </div>) },
  { level: "LEVEL 3", title: "Quest Log — tap a year", render: () => <Timeline /> },
  { level: "LEVEL 4", title: "Raising the Consciousness", render: () => (
    <div className="grid gap-5 md:grid-cols-3">
      {[["Speaking up", "Openly called out racism, sexism and unfair treatment of athletes — even when it cost her."],
        ["Breaking moulds", "Proved Indian doubles players can win on the world stage, inspiring a new generation."],
        ["Giving back", "Founded a badminton academy in Hyderabad to train young players."]].map(([h, t]) => (
        <Card key={h}><h3 className="font-pixel text-sm text-accent">{h}</h3><p className="mt-3 text-2xl leading-snug">{t}</p></Card>))}
    </div>) },
  { level: "BONUS", title: "Audience Quiz", render: () => <Quiz /> },
  { level: "BOSS LEVEL", title: "Ask Gemini anything", render: () => <AskAI /> },
  { level: "GAME OVER", title: "", render: () => (
    <div className="text-center"><h2 className="text-pixel-shadow font-pixel text-2xl md:text-5xl">THANK YOU!</h2>
      <p className="mx-auto mt-6 max-w-2xl text-3xl">One voice, one smash, one stand — and the whole court changes. That's universal consciousness.</p>
      <p className="mt-8 font-pixel text-xs text-primary">CONTINUE? ← PRESS TO REPLAY</p></div>) },
];

function Deck() {
  const [i, setI] = useState(0);
  const go = useCallback((d: number) => setI((x) => Math.max(0, Math.min(slides.length - 1, x + d))), []);
  const touch = useRef<number | null>(null);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (["ArrowRight", " ", "PageDown"].includes(e.key)) { e.preventDefault(); go(1); }
      if (["ArrowLeft", "PageUp"].includes(e.key)) go(-1);
      if (e.key === "f") document.documentElement.requestFullscreen?.();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [go]);
  const s = slides[i]!;
  return (
    <main className="bg-sky-gradient relative flex h-screen flex-col overflow-hidden"
      onTouchStart={(e) => (touch.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => { if (touch.current === null) return; const dx = (e.changedTouches[0]?.clientX ?? 0) - touch.current; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); touch.current = null; }}>
      {[8, 22, 40, 63, 78, 91].map((l, n) => (
        <span key={l} className="animate-twinkle pointer-events-none absolute font-pixel text-star" style={{ left: `${l}%`, top: `${6 + (n % 3) * 9}%`, animationDelay: `${n * 0.2}s` }}>✦</span>))}
      <header className="relative z-10 flex items-center justify-between p-4 font-pixel text-[10px] md:text-xs">
        <span className="text-primary">{s.level}</span>
        <div className="flex gap-1">{slides.map((_, n) => <button key={n} aria-label={`Slide ${n + 1}`} onClick={() => setI(n)} className={`h-3 w-3 border-2 border-border md:h-4 md:w-4 ${n <= i ? "bg-primary" : "bg-muted"}`} />)}</div>
        <span>{i + 1}/{slides.length}</span>
      </header>
      <section key={i} className="animate-in fade-in zoom-in-95 relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center overflow-y-auto px-5 pb-28">
        {s.title && <h2 className="text-pixel-shadow mb-8 font-pixel text-lg md:text-3xl">{s.title}</h2>}
        {s.render()}
      </section>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 border-t-4 border-border bg-grass" />
      <nav className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-4">
        <button onClick={() => go(-1)} disabled={i === 0} className="pixel-btn bg-card px-4 py-2 text-xs text-card-foreground disabled:opacity-40">◀ BACK</button>
        <button onClick={() => (i === slides.length - 1 ? setI(0) : go(1))} className="pixel-btn bg-primary px-4 py-2 text-xs text-primary-foreground">{i === slides.length - 1 ? "REPLAY" : "NEXT ▶"}</button>
      </nav>
    </main>
  );
}
