import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { TRACKS } from "@/lib/data";
import { Button } from "./ui-kit";

/** Cursor-follow ring, visible only while the pointer is on the page. */
export function CursorBlob() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!ref.current) return;
      ref.current.style.transform = `translate3d(${e.clientX - 18}px, ${e.clientY - 18}px, 0)`;
      ref.current.classList.add("is-active");
    };
    const hide = () => ref.current?.classList.remove("is-active");
    window.addEventListener("pointermove", move);
    document.documentElement.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
    };
  }, []);
  return <div ref={ref} className="cursor-blob" aria-hidden="true" />;
}

/** Card that tilts toward the pointer. */
export function Tilt({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={`tilt ${className}`}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        e.currentTarget.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
      }}
      onPointerLeave={(e) => (e.currentTarget.style.transform = "")}
    >
      {children}
    </div>
  );
}

/** Fades children up when scrolled into view. */
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => en?.isIntersecting && (setShown(true), io.disconnect()), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${shown ? "is-in" : ""}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

const VIBES = ["Front row, phone out.", "First taste, first opinion.", "Story before the story.", "Doors open quietly."];

/** "Which room is yours?" playful selector. */
export function TrackPicker() {
  const [i, setI] = useState(0);
  const t = TRACKS[i] ?? TRACKS[0];
  if (!t) return null;
  return (
    <div className="track-picker">
      <p className="text-xs uppercase text-muted-foreground">✦ Pick your vibe</p>
      <h2 className="mt-2 font-display text-5xl sm:text-7xl">Which room is yours?</h2>
      <div className="mt-6 flex flex-wrap gap-3">
        {TRACKS.map((tr, n) => (
          <Button key={tr.name} variant="outline" onClick={() => setI(n)} className={`vibe-chip ${n === i ? "is-on" : ""}`}>{tr.name}</Button>
        ))}
      </div>
      <div key={t.name} className="vibe-card mt-6">
        <span className="vibe-emoji">{["📸", "🍸", "🎙️", "🗝️"][i % 4]}</span>
        <div>
          <p className="font-display text-4xl sm:text-6xl">{VIBES[i % 4]}</p>
          <p className="mt-2 max-w-xl text-muted-foreground">{t.detail}</p>
          <Link to="/register" className="mt-4 inline-block underline decoration-primary decoration-4 underline-offset-4">Apply as {t.name} ↗</Link>
        </div>
      </div>
    </div>
  );
}

export function Stickers() {
  return (
    <>
      <span className="sticker sticker-stamp" aria-hidden="true">★ INVITE ONLY ★ DUBAI ★ 2026 ★</span>
      <span className="sticker sticker-pill" aria-hidden="true">⚡ no small talk</span>
      <span className="sticker sticker-live" aria-hidden="true"><i /> 48 rooms live</span>
    </>
  );
}
