import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PageHero, SitePage } from "@/components/SiteLayout";
import { Badge, Button, Card, Field, Section, inputClass } from "@/components/ui-kit";
import { PRESS } from "@/lib/data";
import { requestPressAsset, submitPressEnquiry } from "@/lib/database";

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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [deliveryWarning, setDeliveryWarning] = useState(false);
  const [assetEmail, setAssetEmail] = useState("");
  const [assetBusy, setAssetBusy] = useState(false);
  const [assetMessage, setAssetMessage] = useState("");
  const submitEnquiry = useServerFn(submitPressEnquiry);
  const requestAsset = useServerFn(requestPressAsset);

  async function sendAssetRequest(asset: string) {
    setAssetBusy(true);
    setAssetMessage("");
    try {
      const result = await requestAsset({ data: { asset, email: assetEmail } });
      setAssetMessage(result.adminEmailSent
        ? `Your request for “${asset}” was sent to our press team. We’ll reply to ${assetEmail}.`
        : `Your request for “${asset}” was saved, but the team notification could not be sent. Please email vinitahirani@rsvpdxb.com.`);
    } catch (requestError) {
      setAssetMessage(requestError instanceof Error ? requestError.message : "We couldn't send your request. Please try again.");
    } finally {
      setAssetBusy(false);
    }
  }

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
                <Button type="button" size="sm" variant="outline" disabled={assetBusy} onClick={() => void sendAssetRequest(r.title)}>{r.pdf ? "Request PDF" : "Request release"}</Button>
              </Card>
            ))}
          </div>
          <div className="mt-8 grid max-w-xl gap-3">
            <Field label="Email for press asset requests">
              <input className={inputClass} type="email" autoComplete="email" required maxLength={254} value={assetEmail} onChange={(event) => setAssetEmail(event.target.value)} placeholder="you@publication.com" />
            </Field>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" disabled={assetBusy} onClick={() => void sendAssetRequest("RSVP DXB media kit")}>Request media kit</Button>
              <Button type="button" variant="outline" disabled={assetBusy} onClick={() => void sendAssetRequest("RSVP DXB logos and imagery")}>Request logos & imagery</Button>
            </div>
            {assetMessage ? <p className="text-sm text-muted-foreground" role="status">{assetMessage}</p> : null}
          </div>
        </Section>
      </div>

      <Section eyebrow="Press enquiries" title="Talk to the team">
        <Card className="mt-8 max-w-xl">
          {sent ? (
            <div className="py-6 text-center text-sm text-muted-foreground" role="status">
              <p>Your enquiry has been saved. Our press team will follow up by email.</p>
              {deliveryWarning ? <p className="mt-2 text-destructive">The team notification could not be sent automatically. Please contact vinitahirani@rsvpdxb.com.</p> : null}
              <Button className="mt-5" type="button" variant="outline" onClick={() => setSent(false)}>Send another</Button>
            </div>
          ) : (
            <form
              className="grid gap-5"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const values = new FormData(form);
                const name = String(values.get("name") || "").trim();
                const outlet = String(values.get("outlet") || "").trim();
                const email = String(values.get("email") || "").trim();
                const enquiry = String(values.get("enquiry") || "").trim();
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
                setBusy(true);
                setError("");
                try {
                  const result = await submitEnquiry({ data: { name, outlet, email, enquiry } });
                  setDeliveryWarning(!result.adminEmailSent || !result.confirmationEmailSent);
                  setSent(true);
                } catch (submitError) {
                  setError(submitError instanceof Error ? submitError.message : "We couldn't send your enquiry. Please try again.");
                } finally {
                  setBusy(false);
                }
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
              <Button type="submit" disabled={busy}>{busy ? "Sending enquiry…" : "Send enquiry"}</Button>
              {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
            </form>
          )}
        </Card>
      </Section>
    </SitePage>
  );
}
