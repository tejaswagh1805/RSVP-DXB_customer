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
                <a className="inline-flex h-8 items-center justify-center rounded-md border border-border px-3 text-xs font-medium" href={`mailto:vinitahirani@tickboxuae.com?subject=${encodeURIComponent(`Request: ${r.title}`)}`}>{r.pdf ? "Request PDF" : "Request release"}</a>
              </Card>
            ))}
          </div>
          <div className="mt-8 flex gap-3">
            <a className="inline-flex h-10 items-center justify-center rounded-md border border-border px-5 text-sm hover:bg-surface-2" href="mailto:vinitahirani@tickboxuae.com?subject=RSVP%20DXB%20media%20kit">Request media kit</a>
            <a className="inline-flex h-10 items-center justify-center rounded-md px-5 text-sm hover:bg-surface-2" href="mailto:vinitahirani@tickboxuae.com?subject=RSVP%20DXB%20logos%20and%20imagery">Request logos & imagery</a>
          </div>
        </Section>
      </div>

      <Section eyebrow="Press enquiries" title="Talk to the team">
        <Card className="mt-8 max-w-xl">
          {sent ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Your email app should open with the enquiry ready to send. If it did not open, email vinitahirani@tickboxuae.com.
            </p>
          ) : (
            <form
              className="grid gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                const values = new FormData(e.currentTarget);
                const name = String(values.get("name") || "").trim();
                const outlet = String(values.get("outlet") || "").trim();
                const email = String(values.get("email") || "").trim();
                const enquiry = String(values.get("enquiry") || "").trim();
                const form = e.currentTarget;
                const nameField = form.elements.namedItem("name") as HTMLInputElement;
                const outletField = form.elements.namedItem("outlet") as HTMLInputElement;
                const enquiryField = form.elements.namedItem("enquiry") as HTMLTextAreaElement;
                nameField.setCustomValidity(name.length >= 2 ? "" : "Enter your name.");
                outletField.setCustomValidity(outlet.length >= 2 ? "" : "Enter your outlet or organisation.");
                enquiryField.setCustomValidity(enquiry.length >= 10 ? "" : "Please enter at least 10 characters.");
                const isValid = form.reportValidity();
                nameField.setCustomValidity("");
                outletField.setCustomValidity("");
                enquiryField.setCustomValidity("");
                if (!isValid) return;
                const subject = encodeURIComponent(`Press enquiry from ${name} (${outlet})`);
                const body = encodeURIComponent(`Name: ${name}\nOutlet: ${outlet}\nEmail: ${email}\n\n${enquiry}`);
                window.location.href = `mailto:vinitahirani@tickboxuae.com?subject=${subject}&body=${body}`;
                setSent(true);
              }}
            >
              <Field label="Name">
                <input className={inputClass} name="name" autoComplete="name" required minLength={2} maxLength={120} />
              </Field>
              <Field label="Outlet">
                <input className={inputClass} name="outlet" required minLength={2} maxLength={180} />
              </Field>
              <Field label="Email">
                <input className={inputClass} type="email" name="email" autoComplete="email" required maxLength={254} />
              </Field>
              <Field label="Enquiry">
                <textarea className={inputClass} name="enquiry" rows={4} required minLength={10} maxLength={3000} />
              </Field>
              <Button type="submit">Send enquiry</Button>
            </form>
          )}
        </Card>
      </Section>
    </SitePage>
  );
}
