import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { SitePage } from "@/components/SiteLayout";
import { Button, Card, Field, inputClass } from "@/components/ui-kit";
import { requestMemberPasswordReset } from "@/lib/database";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password — RSVP DXB" },
      { name: "description", content: "Reset your RSVP DXB member password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const requestReset = useServerFn(requestMemberPasswordReset);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <SitePage>
      <div className="customer-auth-content mx-auto w-full max-w-md px-5 py-24">
        <h1 className="text-center text-4xl">Forgot password?</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Enter the email address associated with your approved member account.
        </p>
        <Card className="mt-8">
          {sent ? (
            <div className="py-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                <MailCheck className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-2xl">Check your inbox</h2>
              <p className="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">
                If an approved member account uses that email, reset instructions will arrive shortly. The link is valid for 30 minutes.
              </p>
              <Button className="mt-7 w-full" variant="outline" onClick={() => setSent(false)}>
                Use a different email
              </Button>
            </div>
          ) : (
            <form
              className="grid gap-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setBusy(true);
                setError("");
                try {
                  await requestReset({ data: { email } });
                  setSent(true);
                } catch (cause) {
                  setError(cause instanceof Error ? cause.message : "Could not request a reset link. Please try again.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Field label="Email">
                <input className={inputClass} type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@email.com" />
              </Field>
              {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? "Sending…" : "Send reset link"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Remembered it? <Link to="/signin" className="text-primary">Back to sign in</Link>
              </p>
            </form>
          )}
        </Card>
      </div>
    </SitePage>
  );
}
