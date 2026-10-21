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

function Medals() {
  const rows = [
    ["BWF World Championships (2011)", "Ashwini Ponnappa", "Bronze"],
    ["Commonwealth Games (2010)", "Ashwini Ponnappa", "Gold"],
    ["Commonwealth Games (2014)", "Ashwini Ponnappa", "Silver"],
    ["BWF Superseries Masters Finals (2009)", "V. Diju", "Runner-up"],
  ];
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="pixel-box bg-card">
      <div className="grid grid-cols-3 border-b-4 border-border bg-muted p-3 font-pixel text-[10px] md:text-xs"><span>TOURNAMENT</span><span>PARTNER</span><span>MEDAL</span></div>
      {rows.map(([t, p, m], i) => (
        <button key={t} onClick={() => setOpen(open === i ? null : i)} className={`grid w-full grid-cols-3 border-b-2 border-border p-3 text-left text-xl md:text-2xl ${open === i ? "bg-primary text-primary-foreground" : ""}`}>
          <span>{t}</span><span>{p}</span><span>{m === "Gold" ? "★ " : ""}{m}</span>
        </button>))}
    </div>
  );
}

function Impact() {
  const items = [
    ["🪙", "Breast milk donation", "After her daughter's birth she donated nearly 60 litres of breast milk, sparking talk about neonatal care and breaking taboos around lactation."],
    ["🏀", "Equality in sport", "She pulled doubles badminton out of the shadows, called out systemic neglect, and spoke up about harassment and bias during #MeToo."],
    ["🌳", "Fertility & maternity", "By openly sharing her IVF journey she helped normalise talk about reproductive challenges and postpartum recovery."],
  ];
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      <p className="mb-5 text-2xl text-primary">Click the coin, the ball and the tree to see how she raised the collective consciousness!</p>
      <div className="grid gap-5 md:grid-cols-3">
        {items.map(([i, h, t], n) => (
          <button key={h} onClick={() => setOpen(n)} className={`pixel-btn p-5 text-left ${open === n ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground"}`}>
            <div className="animate-bob text-5xl">{i}</div>
            <h3 className="mt-4 text-xs md:text-sm">{h}</h3>
            {open === n && <p className="mt-3 font-mono text-2xl leading-snug">{t}</p>}
          </button>))}
      </div>
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
  const samples = ["What does universal consciousness mean?", "What happened at the 2010 Commonwealth Games?", "Why is doubles badminton special?"];
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
      <p className="mt-8 max-w-2xl text-2xl md:text-3xl">The whole biography of Jwala Gutta, how she raised the universal consciousness — and what universal consciousness really is.</p>
      <p className="mt-10 animate-blink font-pixel text-xs text-primary">PRESS → OR SPACE TO START</p>
    </div>) },
  { level: "MENU", title: "Agenda", render: () => (
    <div className="grid gap-4 md:grid-cols-2">
      {["What is consciousness?", "What is universal consciousness?", "The personality who raised it", "Her legacy in badminton"].map((t, n) => (
        <Card key={t}><span className="font-pixel text-sm text-primary">0{n + 1}</span><p className="mt-2 text-3xl">{t}</p></Card>))}
    </div>) },
  { level: "LEVEL 1", title: "What is consciousness?", render: () => (
    <Card><p className="text-3xl leading-snug">At its most basic level, consciousness is the state of being awake and aware of one's surroundings, thoughts and feelings. It is the subjective, inner life of the mind — the continuous experience of "what it is like" to be you.</p></Card>) },
  { level: "LEVEL 2", title: "What is universal consciousness?", render: () => (
    <div className="space-y-5">
      <Card><p className="text-3xl leading-snug">A branch of basic consciousness: a global, fixed standard of a value — like kindness, empathy or gratitude — and raising it to eternal heights.</p></Card>
      <div className="grid gap-4 md:grid-cols-3">{[["♥", "Kindness"], ["★", "Empathy"], ["↑", "Gratitude"]].map(([i, h]) => (
        <Card key={h} tone="bg-muted"><span className="animate-bob inline-block font-pixel text-2xl text-star">{i}</span><span className="ml-4 font-pixel text-sm">{h}</span></Card>))}</div>
    </div>) },
  { level: "LEVEL 3", title: "Meet Jwala Gutta", render: () => (
    <div className="grid gap-5 md:grid-cols-2">
      <Card><p className="text-2xl leading-snug">One of India's most successful badminton players, known for her aggressive, left-handed doubles play. Born 7 September 1983 in Wardha, Maharashtra, to a Telugu father and a Chinese mother, she grew up in Hyderabad and trained under Dronacharya Award-winning coach S. M. Arif.</p></Card>
      <Card tone="bg-muted"><h3 className="font-pixel text-sm text-secondary">PLAYER CARD</h3>
        <ul className="mt-4 space-y-2 text-2xl"><li>▸ Started badminton at age 6</li><li>▸ 14-time National Champion</li><li>▸ Rare forehand serve in doubles</li><li>▸ Arjuna Award winner</li><li>▸ Olympian: London 2012 & Rio 2016</li></ul></Card>
    </div>) },
  { level: "LEVEL 4", title: "Why I chose her", render: () => (
    <Card><p className="text-3xl leading-snug">I am a badminton player myself. I want to gain experience, play in tournaments and become more athletic on court — and I always look to underrated badminton players for inspiration instead of football or cricket stars.</p></Card>) },
  { level: "LEVEL 5", title: "How she raised the consciousness", render: () => <Impact /> },
  { level: "LEVEL 6", title: "Historic milestones", render: () => (
    <div className="grid gap-4 md:grid-cols-2">
      {[["TOP 10 ×2", "Only Indian in the BWF top 10 in both doubles — No. 6 mixed (2010), No. 10 women's (2015)."],
        ["316 WINS", "Most match wins by any Indian doubles shuttler."],
        ["2 EVENTS", "First Indian badminton player to qualify for two events at one Olympics (London 2012)."],
        ["14 TITLES", "National Champion 14 times, dominating the domestic circuit for over a decade."]].map(([h, t]) => (
        <Card key={h}><h3 className="font-pixel text-base text-primary md:text-lg">{h}</h3><p className="mt-3 text-2xl leading-snug">{t}</p></Card>))}
    </div>) },
  { level: "LEVEL 7", title: "Medal cabinet", render: () => <Medals /> },
  { level: "BONUS", title: "Audience Quiz", render: () => <Quiz /> },
  { level: "BOSS LEVEL", title: "Ask Gemini anything", render: () => <AskAI /> },
  { level: "GAME OVER", title: "", render: () => (
    <div className="text-center"><h2 className="text-pixel-shadow font-pixel text-2xl md:text-5xl">THANK YOU!</h2>
      <p className="mx-auto mt-6 max-w-2xl text-3xl">One voice, one smash, one stand — and the whole court changes. That's universal consciousness.</p>
      <p className="mt-8 font-pixel text-xs text-primary">CONTINUE? PRESS REPLAY</p></div>) },
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
