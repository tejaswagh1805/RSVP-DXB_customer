import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageHero, SitePage } from "@/components/SiteLayout";
import { Button, Card, Section } from "@/components/ui-kit";
import { ArrowRight, ArrowUpRight, Facebook, Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

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
  const whatsappDigits = String(import.meta.env["VITE_RSVP_WHATSAPP_NUMBER"] || "971552789169").replace(/\D/g, "");

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

      <Section className="about-contact-section" eyebrow="Contact" title="We’d love to hear from you">
        <div className="about-contact-grid">
          <div className="about-contact-details">
            <a className="about-contact-card" href="https://maps.google.com/?q=Diplomat+One+Building+Umm+Hurair+1+Dubai" target="_blank" rel="noopener noreferrer">
              <span className="about-contact-icon"><MapPin size={25} aria-hidden="true" /></span>
              <span><strong>Visit us</strong><small>303 Diplomat One Building, AWR Properties, 9th Street, Umm Hurair 1, Dubai, UAE</small></span>
              <ArrowUpRight className="about-contact-arrow" size={17} aria-hidden="true" />
            </a>
            <a className="about-contact-card" href="tel:+971552521124">
              <span className="about-contact-icon"><Phone size={25} aria-hidden="true" /></span>
              <span><strong>Call us</strong><small>+971 55 252 1124</small></span>
              <ArrowUpRight className="about-contact-arrow" size={17} aria-hidden="true" />
            </a>
            <a className="about-contact-card" href="mailto:vinitahirani@tickboxuae.com">
              <span className="about-contact-icon"><Mail size={25} aria-hidden="true" /></span>
              <span><strong>Email us</strong><small>vinitahirani@tickboxuae.com</small></span>
              <ArrowUpRight className="about-contact-arrow" size={17} aria-hidden="true" />
            </a>
            <div className="about-contact-socials">
              <a href="https://www.instagram.com/rsvpdxb/" target="_blank" rel="noopener noreferrer" aria-label="RSVP DXB on Instagram"><Instagram size={21} /></a>
              <span title="Facebook profile link not configured" aria-label="Facebook"><Facebook size={21} /></span>
              <span title="LinkedIn profile link not configured" aria-label="LinkedIn"><Linkedin size={21} /></span>
              <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noopener noreferrer" aria-label="Chat with RSVP DXB on WhatsApp"><MessageCircle size={21} /></a>
            </div>
          </div>
          <div className="about-contact-form-card">
            <h2>Drop us a line</h2>
            <form onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const name = String(form.get("name") ?? "").trim();
              const email = String(form.get("email") ?? "").trim();
              const organisation = String(form.get("organisation") ?? "").trim();
              const project = String(form.get("project") ?? "").trim();
              const message = ["Hello RSVP DXB, I would like to get in touch.", `Name: ${name}`, `Email: ${email}`, `Organisation: ${organisation}`, project ? `Project: ${project}` : ""].filter(Boolean).join("\n");
              window.location.href = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(message)}`;
            }}>
              <div className="about-contact-fields">
                <input name="name" autoComplete="name" placeholder="Your name" aria-label="Your name" required />
                <input name="email" type="email" autoComplete="email" placeholder="Email address*" aria-label="Email address" required />
                <input className="about-contact-wide" name="organisation" placeholder="Name of organisation*" aria-label="Name of organisation" required />
                <textarea className="about-contact-wide" name="project" placeholder="Tell us about your project" aria-label="Tell us about your project" rows={4} />
              </div>
              <Button className="about-contact-submit" type="submit">Send message <ArrowRight size={19} /></Button>
              <p className="about-contact-note">Submitting opens WhatsApp with your message — the fastest way to reach us.</p>
            </form>
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
