import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero, SitePage } from "@/components/SiteLayout";
import { Badge, Button, Card, Field, Section, inputClass } from "@/components/ui-kit";
import { PRESS } from "@/lib/data";

export const Route = createFileRoute("/press")({
  head: () => ({
    meta: [
      { title: "Press — RSVP DXB" },
      {
        name: "description",
        content: "RSVP DXB in the press, press releases, media kit and press enquiries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Press — RSVP DXB" },
      { property: "og:description", content: "Press coverage, releases and media kit for RSVP DXB." },
    ],
  }),
  component: PressPage,
});

const RELEASES = [
  { title: "RSVP DXB launches Private Circle membership", date: "24 Sep 2026", pdf: true },
  { title: "House party service expands across Dubai", date: "11 Aug 2026", pdf: true },
  { title: "Events Wall opens to all approved members", date: "02 Jul 2026", pdf: false },
];

function PressPage() {
  const [sent, setSent] = useState(false);

  return (
    <SitePage>
      <PageHero
        eyebrow="Press"
        title="Press & media"
        intro="Coverage, releases and assets. Accredited media on our database receive releases by email and WhatsApp."
      />

      <Section eyebrow="In the press" title="Recent coverage">
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {PRESS.map((p) => (
            <Card key={p.title}>
              <div className="flex items-center justify-between">
                <Badge tone="gold">{p.outlet}</Badge>
                <span className="text-xs text-muted-foreground">{p.date}</span>
              </div>
              <h3 className="mt-3 text-lg leading-snug">{p.title}</h3>
            </Card>
          ))}
        </div>
      </Section>

      <div className="border-y border-border bg-surface">
        <Section eyebrow="Press releases" title="Latest releases">
          <div className="mt-8 space-y-3">
            {RELEASES.map((r) => (
              <Card key={r.title} className="flex items-center justify-between bg-background">
                <div>
                  <p className="text-sm">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.date}</p>
                </div>
                <Button size="sm" variant="outline">
                  {r.pdf ? "Download PDF" : "Read"}
                </Button>
              </Card>
            ))}
          </div>
          <div className="mt-8 flex gap-3">
            <Button variant="outline">Download media kit</Button>
            <Button variant="ghost">Logos & imagery</Button>
          </div>
        </Section>
      </div>

      <Section eyebrow="Press enquiries" title="Talk to the team">
        <Card className="mt-8 max-w-xl">
          {sent ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Thank you — our press team will respond within 24 hours.
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
              <Field label="Outlet">
                <input className={inputClass} required />
              </Field>
              <Field label="Enquiry">
                <textarea className={inputClass} rows={4} required />
              </Field>
              <Button type="submit">Send enquiry</Button>
            </form>
          )}
        </Card>
      </Section>
    </SitePage>
  );
}
