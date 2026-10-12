import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero, SitePage } from "@/components/SiteLayout";
import { Badge, Button, Card, Field, Section, inputClass } from "@/components/ui-kit";
import { PACKAGES } from "@/lib/data";

export const Route = createFileRoute("/host")({
  head: () => ({
    meta: [
      { title: "Host an event — RSVP DXB" },
      {
        name: "description",
        content:
          "Host an event with RSVP DXB, or let us host your house party. Guest lists, full evenings and launches at home.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Host an event — RSVP DXB" },
      {
        property: "og:description",
        content: "Guest lists, full evenings and brand launches hosted in Dubai homes and venues.",
      },
    ],
  }),
  component: HostPage,
});

function HostPage() {
  const [sent, setSent] = useState(false);
  const [pkg, setPkg] = useState(PACKAGES[0]!.name);

  return (
    <SitePage>
      <PageHero
        eyebrow="Host"
        title="Fill the room with the right people"
        intro="We build the guest list by track, interest, area and reach — then handle invitations, RSVPs, the door, content collection and the report."
      />

      <Section eyebrow="Packages & pricing" title="Three ways to work with us">
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PACKAGES.map((p) => (
            <Card key={p.name} className={pkg === p.name ? "border-primary/60" : ""}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl">{p.name}</h3>
                <Badge tone="gold">from {p.from}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{p.detail}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {p.includes.map((i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary">·</span>
                    {i}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-5 w-full"
                variant={pkg === p.name ? "primary" : "outline"}
                onClick={() => setPkg(p.name)}
              >
                {pkg === p.name ? "Selected" : "Choose"}
              </Button>
            </Card>
          ))}
        </div>
      </Section>

      <div className="border-t border-border bg-surface">
        <Section eyebrow="Plan my party" title="Tell us about the evening">
          <Card className="mt-8 max-w-2xl bg-background">
            {sent ? (
              <div className="py-8 text-center">
                <h3 className="text-2xl">Thank you.</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Our team will come back to you within 24 hours with a plan for {pkg}.
                </p>
                <Button className="mt-6" variant="outline" onClick={() => setSent(false)}>
                  Send another
                </Button>
              </div>
            ) : (
              <form
                className="grid gap-5 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                <Field label="Your name">
                  <input className={inputClass} required placeholder="Full name" />
                </Field>
                <Field label="Email or WhatsApp">
                  <input className={inputClass} required placeholder="+971 50 000 0000" />
                </Field>
                <Field label="Date">
                  <input className={inputClass} type="date" required />
                </Field>
                <Field label="Guests">
                  <input className={inputClass} type="number" defaultValue={40} min={5} />
                </Field>
                <Field label="Area">
                  <input className={inputClass} placeholder="Palm Jumeirah" />
                </Field>
                <Field label="Occasion">
                  <select className={inputClass} defaultValue="Birthday">
                    <option>Birthday</option>
                    <option>Brand launch</option>
                    <option>Private dinner</option>
                    <option>Preview</option>
                    <option>Other</option>
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Package">
                    <select
                      className={inputClass}
                      value={pkg}
                      onChange={(e) => setPkg(e.target.value)}
                    >
                      {PACKAGES.map((p) => (
                        <option key={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" size="lg" className="w-full">
                    Plan my party
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </Section>
      </div>
    </SitePage>
  );
}
