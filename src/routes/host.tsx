import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PageHero, SitePage } from "@/components/SiteLayout";
import { Badge, Button, Card, Field, Section, inputClass } from "@/components/ui-kit";
import { submitHostEnquiry } from "@/lib/database";
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [deliveryWarning, setDeliveryWarning] = useState(false);
  const [pkg, setPkg] = useState(PACKAGES[0]!.name);
  const submitEnquiry = useServerFn(submitHostEnquiry);

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
            <Card key={p.name} className={`host-package-card${pkg === p.name ? " border-primary/60" : ""}`}>
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
                className="host-package-button w-full"
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
                <h3 className="text-2xl">Enquiry received.</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your request has been saved. Our team will follow up using the contact details you provided.
                </p>
                {deliveryWarning ? <p className="mt-3 text-sm text-destructive" role="status">Your request is saved, but an email notification could not be sent. Please contact vinitahirani@rsvpdxb.com.</p> : null}
                <Button className="mt-6" variant="outline" onClick={() => setSent(false)}>
                  Send another
                </Button>
              </div>
            ) : (
              <form
                className="grid gap-5 sm:grid-cols-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const values = new FormData(form);
                  const name = String(values.get("name") || "").trim();
                  const contact = String(values.get("contact") || "").trim();
                  const date = String(values.get("date") || "");
                  const guests = Number(values.get("guests"));
                  const area = String(values.get("area") || "").trim();
                  const occasion = String(values.get("occasion") || "");
                  const nameField = form.elements.namedItem("name") as HTMLInputElement;
                  const contactField = form.elements.namedItem("contact") as HTMLInputElement;
                  const emailContact = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
                  const phoneContact = /^\+?\d{8,15}$/.test(contact.replace(/[\s().-]/g, ""));
                  nameField.setCustomValidity(name.length >= 2 ? "" : "Enter your name.");
                  contactField.setCustomValidity(emailContact || phoneContact ? "" : "Enter a valid email or international phone number.");
                  const isValid = form.reportValidity();
                  nameField.setCustomValidity("");
                  contactField.setCustomValidity("");
                  if (!isValid) return;
                  setBusy(true);
                  setError("");
                  try {
                    const result = await submitEnquiry({ data: { name, contact, date, guests, area, occasion, packageName: pkg } });
                    setDeliveryWarning(!result.adminEmailSent || (emailContact && !result.confirmationEmailSent));
                    setSent(true);
                  } catch (submitError) {
                    setError(submitError instanceof Error ? submitError.message : "We couldn't send your enquiry. Please try again.");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <Field label="Your name">
                  <input className={inputClass} name="name" autoComplete="name" required minLength={2} maxLength={120} placeholder="Full name" />
                </Field>
                <Field label="Email or WhatsApp">
                  <input className={inputClass} name="contact" required minLength={8} maxLength={254} placeholder="Email or WhatsApp number" />
                </Field>
                <Field label="Date">
                  <input className={inputClass} name="date" type="date" required min={new Date().toISOString().slice(0, 10)} />
                </Field>
                <Field label="Guests">
                  <input className={inputClass} name="guests" type="number" defaultValue={40} min={5} max={10000} required />
                </Field>
                <Field label="Area">
                  <input className={inputClass} name="area" maxLength={120} placeholder="Palm Jumeirah" />
                </Field>
                <Field label="Occasion">
                  <select className={inputClass} name="occasion" defaultValue="Birthday" required>
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
                  <Button type="submit" size="lg" className="w-full" disabled={busy}>
                    {busy ? "Sending enquiry…" : "Plan my party"}
                  </Button>
                </div>
                {error ? <p className="sm:col-span-2 text-sm text-destructive" role="alert">{error}</p> : null}
                <p className="sm:col-span-2 text-xs text-muted-foreground">We use these details to respond to your enquiry. See our <Link to="/privacy" className="underline underline-offset-4">Privacy Policy</Link>.</p>
              </form>
            )}
          </Card>
        </Section>
      </div>
    </SitePage>
  );
}
