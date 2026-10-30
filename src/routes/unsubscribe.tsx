import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SitePage } from "@/components/SiteLayout";
import { Button, Card } from "@/components/ui-kit";
import { unsubscribeNewsletter } from "@/lib/database";

export const Route = createFileRoute("/unsubscribe")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search["token"] === "string" ? search["token"] : "",
  }),
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const { token } = Route.useSearch();
  const unsubscribe = useServerFn(unsubscribeNewsletter);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function confirmUnsubscribe() {
    setBusy(true);
    setError("");
    try {
      await unsubscribe({ data: { token } });
      setDone(true);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "We couldn't update your email preferences.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SitePage>
      <div className="mx-auto w-full max-w-xl px-5 py-24">
        <Card className="text-center">
          {done ? (
            <>
              <h1 className="text-3xl">You’re unsubscribed.</h1>
              <p className="mt-3 text-sm text-muted-foreground">You won’t receive future RSVP DXB newsletter campaigns at this address.</p>
              <Link className="mt-7 inline-flex h-10 items-center justify-center rounded-md border border-border px-5 text-sm font-medium hover:bg-surface-2" to="/">Back to RSVP DXB</Link>
            </>
          ) : (
            <>
              <p className="eyebrow">Email preferences</p>
              <h1 className="mt-3 text-3xl">Unsubscribe from updates?</h1>
              <p className="mt-3 text-sm text-muted-foreground">Confirm below to stop future RSVP DXB newsletter campaigns.</p>
              {error ? <p className="mt-4 text-sm text-destructive" role="alert">{error}</p> : null}
              <Button className="mt-7" disabled={busy || !token} onClick={() => void confirmUnsubscribe()}>
                {busy ? "Updating…" : "Unsubscribe"}
              </Button>
              {!token ? <p className="mt-4 text-sm text-destructive" role="alert">This unsubscribe link is invalid.</p> : null}
            </>
          )}
        </Card>
      </div>
    </SitePage>
  );
}
