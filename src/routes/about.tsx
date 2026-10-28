import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageHero, SitePage } from "@/components/SiteLayout";
import { Button, Card, Field, Section, inputClass } from "@/components/ui-kit";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — RSVP DXB" },
      {
        name: "description",
        content:
          "RSVP DXB is a Tickbox UAE company connecting Dubai brands with media, creators, tastemakers and the private circle.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "About — RSVP DXB" },
      { property: "og:description", content: "Our story, Tickbox UAE, partnerships and contact." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const [sent, setSent] = useState(false);
  const whatsappDigits = String(import.meta.env["VITE_RSVP_WHATSAPP_NUMBER"] || "971552789169").replace(/\D/g, "");
  const whatsappDisplay = whatsappDigits.startsWith("971")
    ? `+971 ${whatsappDigits.slice(3, 5)} ${whatsappDigits.slice(5, 8)} ${whatsappDigits.slice(8)}`
    : `+${whatsappDigits}`;

  return (
    <SitePage>
      <PageHero
        eyebrow="About"
        title="Our story"
        intro="RSVP DXB started as a little black book of the people who make a room work. It is now the guest-list platform behind hundreds of Dubai openings, dinners, launches and previews."
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-4">
          <AnimatedStat label="Members" value="4,280" hint="Approved across four tracks" />
          <AnimatedStat label="Events hosted" value="612" hint="Till Now" />
          <AnimatedStat label="Brand partners" value="140" />
          <AnimatedStat label="Avg. attendance" value="87%" hint="Of confirmed RSVPs" />
        </div>
      </Section>

      <div className="border-y border-border bg-surface">
        <Section eyebrow="Tickbox UAE" title="The company behind the list">
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            RSVP DXB is operated by Tickbox UAE, a Dubai events and communications company. The same
            team handles production, PR and media relations, which is why a guest list with us comes
            with a door team, a content brief and a report at the end.
          </p>
        </Section>
      </div>

      <Section eyebrow="Partner with us" title="Contact">
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            {sent ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Thank you — we will be in touch shortly.
              </p>
            ) : (
              <form
                className="grid gap-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                <Field label="Name">
                  <input className={inputClass} required />
                </Field>
                <Field label="Company">
                  <input className={inputClass} />
                </Field>
                <Field label="Email">
                  <input className={inputClass} type="email" required />
                </Field>
                <Field label="Message">
                  <textarea className={inputClass} rows={4} required />
                </Field>
                <Button type="submit">Send message</Button>
              </form>
            )}
          </Card>
          <div className="space-y-4">
            <Card>
              <p className="eyebrow">Office</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Tickbox UAE, Business Bay, Dubai, United Arab Emirates
              </p>
            </Card>
            <Card>
              <p className="eyebrow">General</p>
              <a className="mt-2 inline-block text-sm text-muted-foreground transition-colors hover:text-primary" href="mailto:vinitahirani@rsvpdxb.com">vinitahirani@rsvpdxb.com</a>
            </Card>
            <Card>
              <p className="eyebrow">Brands & partnerships</p>
              <a className="mt-2 inline-block text-sm text-muted-foreground transition-colors hover:text-primary" href="mailto:vinitahirani@rsvpdxb.com">vinitahirani@rsvpdxb.com</a>
            </Card>
            <Card>
              <p className="eyebrow">Connect with us</p>
              <a className="mt-2 inline-block text-sm text-muted-foreground transition-colors hover:text-primary" href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noreferrer">{whatsappDisplay}</a>
            </Card>
          </div>
        </div>
      </Section>
    </SitePage>
  );
}

function AnimatedStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    const target = Number(value.replace(/[^\d.]/g, ""));
    if (!Number.isFinite(target)) {
      setDisplayValue(value);
      return;
    }
    const element = ref.current;
    if (!element) return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setDisplayValue(value);
        return;
      }
      const start = performance.now();
      const duration = 3000;
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - (1 - progress) ** 3;
        const current = Math.round(target * eased);
        setDisplayValue(`${current.toLocaleString()}${value.endsWith("%") ? "%" : ""}`);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.35 });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <Card className="p-4">
      <p className="eyebrow">{label}</p>
      <p ref={ref} className="mt-2 font-display text-3xl text-foreground" aria-label={value}>{displayValue}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  );
}
