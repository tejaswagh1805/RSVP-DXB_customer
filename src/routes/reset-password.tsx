import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { SitePage } from "@/components/SiteLayout";
import { Button, Card, Field, PasswordInput } from "@/components/ui-kit";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — RSVP DXB" },
      {
        name: "description",
        content: "Choose a new password for your RSVP DXB member account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Set a new password — RSVP DXB" },
      {
        property: "og:description",
        content: "Choose a new password for your RSVP DXB member account.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const tooShort = pass.length > 0 && pass.length < 8;
  const mismatch = confirm.length > 0 && pass !== confirm;
  const canSave = pass.length >= 8 && pass === confirm;

  return (
    <SitePage>
      <div className="mx-auto w-full max-w-md px-5 py-24">
        <h1 className="text-center text-4xl">Set a new password</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Choose something you don&apos;t use anywhere else. At least 8 characters.
        </p>

        <Card className="mt-8">
          {done ? (
            <div className="py-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-2xl">Password updated</h2>
              <p className="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">
                You&apos;re all set. Sign in with your new password to see your invitations and pass.
              </p>
              <Button className="mt-7 w-full" size="lg" onClick={() => void navigate({ to: "/signin" })}>
                Back to sign in
              </Button>
            </div>
          ) : (
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (canSave) setDone(true);
              }}
            >
              <Field label="New password">
                <PasswordInput
                  value={pass}
                  onChange={setPass}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />
                <span className="mt-1 block text-xs text-destructive">
                  {tooShort ? "Use at least 8 characters." : ""}
                </span>
              </Field>
              <Field label="Confirm new password">
                <PasswordInput
                  value={confirm}
                  onChange={setConfirm}
                  autoComplete="new-password"
                  placeholder="Type it again"
                />
                <span className="mt-1 block text-xs text-destructive">
                  {mismatch ? "Both passwords must match." : ""}
                </span>
              </Field>
              <Button type="submit" size="lg" className="w-full" disabled={!canSave}>
                Save new password
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Changed your mind?{" "}
                <Link to="/signin" className="text-primary">
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Prototype — the new password is not stored. Use the eye icon to check what you typed.
        </p>
      </div>
    </SitePage>
  );
}
