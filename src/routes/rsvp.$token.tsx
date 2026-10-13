import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Button, Card } from "@/components/ui-kit";
import { getGuestInvitation, respondToGuestInvitation } from "@/lib/database";

export const Route = createFileRoute("/rsvp/$token")({
  loader: ({ params }) => getGuestInvitation({ data: params.token }),
  head: () => ({
    meta: [
      { title: "Your invitation — RSVP DXB" },
      { name: "description", content: "View your personal RSVP DXB event invitation." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: GuestRsvpPage,
});

function GuestRsvpPage() {
  const invitation = Route.useLoaderData();
  const { token } = Route.useParams();
  const respond = useServerFn(respondToGuestInvitation);
  const [attending, setAttending] = useState<boolean | null>(null);
  const [plusOnes, setPlusOnes] = useState(0);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!invitation) {
    return (
      <main className="grid min-h-[75svh] place-items-center px-4 py-10">
        <Card className="w-full max-w-md text-center">
          <p className="eyebrow">RSVP DXB</p>
          <h1 className="mt-3 text-3xl">Invitation unavailable</h1>
          <p className="mt-3 text-sm text-muted-foreground">This invitation link may be invalid or RSVPs may have closed.</p>
          <Link to="/" className="mt-6 inline-block text-sm text-primary">Visit RSVP DXB</Link>
        </Card>
      </main>
    );
  }

  const accepted = saved ? attending === true : invitation.status === "accepted";
  const submitted = saved || invitation.status !== "pending";

  return (
    <main className="min-h-[85svh] bg-background px-4 py-8 sm:grid sm:place-items-center sm:py-12">
      <Card className="mx-auto w-full max-w-lg p-5 sm:p-8">
        <p className="eyebrow">{invitation.brand || "RSVP DXB"} invites you</p>
        <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">{invitation.eventTitle}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {formatEventDate(invitation.date)} · {invitation.time} · {invitation.venue}{invitation.area ? `, ${invitation.area}` : ""}
        </p>
        <div className="mt-7 rounded-lg bg-surface-2 p-4 sm:p-5">
          <p className="text-sm">Dear <strong>{invitation.guestName}</strong>,</p>
          <p className="mt-1 text-sm text-muted-foreground">Please let us know if you can join us.</p>
          {invitation.tableNo ? <p className="mt-4 text-sm">Table: <strong>{invitation.tableNo}</strong></p> : null}
          {invitation.dressCode ? <p className="mt-2 text-sm">Dress code: <strong>{invitation.dressCode}</strong></p> : null}
        </div>

        {submitted ? (
          <div className="mt-6 text-center" aria-live="polite">
            <h2 className="text-2xl">{accepted ? "You’re on the list" : "Thank you for letting us know"}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {accepted ? `We look forward to seeing you${saved ? "" : ` and your ${invitation.plusOnes} guest${invitation.plusOnes === 1 ? "" : "s"}`} at the event.` : "We’re sorry you can’t make it."}
            </p>
            {accepted ? (
              <div className="mx-auto mt-6 inline-block rounded-xl bg-white p-4">
                <QRCodeSVG value={`/rsvp/${token}`} size={192} level="M" />
                <p className="mt-2 text-xs text-black">Show this pass at the entrance</p>
              </div>
            ) : null}
          </div>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={(event) => {
            event.preventDefault();
            if (attending === null) { setError("Please choose accept or decline."); return; }
            setError("");
            setBusy(true);
            void respond({ data: { token, attending, plusOnes: attending ? plusOnes : 0 } })
              .then(() => setSaved(true))
              .catch((cause) => setError(cause instanceof Error ? cause.message : "Your response could not be saved. Please try again."))
              .finally(() => setBusy(false));
          }}>
            <fieldset>
              <legend className="text-sm font-medium">Can you join us?</legend>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button type="button" aria-pressed={attending === true} onClick={() => { setAttending(true); setError(""); }} className={`min-h-12 rounded-md border px-4 py-3 text-sm transition-colors ${attending === true ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface hover:border-primary"}`}>
                  Joyfully accept
                </button>
                <button type="button" aria-pressed={attending === false} onClick={() => { setAttending(false); setPlusOnes(0); setError(""); }} className={`min-h-12 rounded-md border px-4 py-3 text-sm transition-colors ${attending === false ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface hover:border-primary"}`}>
                  Regretfully decline
                </button>
              </div>
            </fieldset>
            {attending ? (
              <label className="block text-sm">Additional guests
                <select className="mt-2 min-h-12 w-full rounded-md border border-border bg-surface px-3" value={plusOnes} onChange={(event) => setPlusOnes(Number(event.target.value))}>
                  <option value={0}>Just me</option><option value={1}>One additional guest</option><option value={2}>Two additional guests</option>
                </select>
              </label>
            ) : null}
            {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
            <Button className="min-h-12 w-full" size="lg" type="submit" disabled={busy || attending === null}>{busy ? "Saving…" : "Confirm response"}</Button>
          </form>
        )}
        <p className="mt-7 text-center text-xs tracking-widest text-muted-foreground">RSVPDXB.COM</p>
      </Card>
    </main>
  );
}

function formatEventDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(date);
}
