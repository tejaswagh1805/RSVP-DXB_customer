import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero, SitePage } from "@/components/SiteLayout";
import { Button, Card, Field, Section, Stat, inputClass } from "@/components/ui-kit";

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

  return (
    <SitePage>
      <PageHero
        eyebrow="About"
        title="Our story"
        intro="RSVP DXB started as a little black book of the people who make a room work. It is now the guest-list platform behind hundreds of Dubai openings, dinners, launches and previews."
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-4">
          <Stat label="Members" value="4,280" hint="Approved across four tracks" />
          <Stat label="Events hosted" value="612" hint="Last 24 months" />
          <Stat label="Brand partners" value="140" />
          <Stat label="Avg. attendance" value="87%" hint="Of confirmed RSVPs" />
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
              <p className="mt-2 text-sm text-muted-foreground">hello@rsvpdxb.com</p>
            </Card>
            <Card>
              <p className="eyebrow">Brands & partnerships</p>
              <p className="mt-2 text-sm text-muted-foreground">brands@rsvpdxb.com</p>
            </Card>
            <Card>
              <p className="eyebrow">WhatsApp</p>
              <p className="mt-2 text-sm text-muted-foreground">+971 50 000 0000</p>
            </Card>
          </div>
        </div>
      </Section>
    </SitePage>
  );
}
