import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { SitePage } from "@/components/SiteLayout";
import { Button, Card, Field, PasswordInput } from "@/components/ui-kit";
import { resetMemberPassword } from "@/lib/database";
import { isValidPassword } from "@/lib/password";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search["token"] === "string" ? search["token"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Set a new password — RSVP DXB" },
      { name: "description", content: "Choose a new password for your RSVP DXB member account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const resetPassword = useServerFn(resetMemberPassword);
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const invalidPassword = pass.length > 0 && !isValidPassword(pass);
  const mismatch = confirm.length > 0 && pass !== confirm;
  const canSave = isValidPassword(pass) && pass === confirm && Boolean(token);

  return (
    <SitePage>
      <div className="customer-auth-content mx-auto w-full max-w-md px-5 py-24">
        <h1 className="text-center text-4xl">Set a new password</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Use at least 8 characters, including a capital letter, a number, and a special character.
        </p>
        <Card className="mt-8">
          {done ? (
            <div className="py-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-2xl">Password updated</h2>
              <p className="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">
                Sign in with your new password. For security, other member sessions have been signed out.
              </p>
              <Button className="mt-7 w-full" size="lg" onClick={() => void navigate({ to: "/signin" })}>
                Back to sign in
              </Button>
            </div>
          ) : !token ? (
            <div className="py-4 text-center">
              <p className="text-sm text-muted-foreground">This reset link is missing or invalid. Request a fresh link from your email.</p>
              <Link to="/forgot-password"><Button className="mt-6" size="lg">Request a reset link</Button></Link>
            </div>
          ) : (
            <form
              className="grid gap-4"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!canSave) return;
                setBusy(true);
                setError("");
                try {
                  await resetPassword({ data: { token, password: pass } });
                  setDone(true);
                } catch (cause) {
                  setError(cause instanceof Error ? cause.message : "Could not update your password. Request a fresh link and try again.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Field label="New password">
                <PasswordInput value={pass} onChange={setPass} autoComplete="new-password" placeholder="Password" />
                <span className="mt-1 block text-xs text-destructive">{invalidPassword ? "Use at least 8 characters, one capital letter, one number, and one special character." : ""}</span>
              </Field>
              <Field label="Confirm new password">
                <PasswordInput value={confirm} onChange={setConfirm} autoComplete="new-password" placeholder="Type it again" />
                <span className="mt-1 block text-xs text-destructive">{mismatch ? "Both passwords must match." : ""}</span>
              </Field>
              {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
              <Button type="submit" size="lg" className="w-full" disabled={!canSave || busy}>
                {busy ? "Saving…" : "Save new password"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Changed your mind? <Link to="/signin" className="text-primary">Back to sign in</Link>
              </p>
            </form>
          )}
        </Card>
      </div>
    </SitePage>
  );
}
