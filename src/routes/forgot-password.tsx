import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, MailCheck } from "lucide-react";
import { SitePage } from "@/components/SiteLayout";
import { Button, Card, Field, inputClass } from "@/components/ui-kit";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password — RSVP DXB" },
      {
        name: "description",
        content: "Reset your RSVP DXB member password. Enter your email and we'll send a reset link.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Forgot password — RSVP DXB" },
      {
        property: "og:description",
        content: "Reset your RSVP DXB member password. Enter your email and we'll send a reset link.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("tejas@creators.ae");
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const submit = () => {
    setSent(true);
  };

  return (
    <SitePage>
      <div className="mx-auto w-full max-w-md px-5 py-24">
        <h1 className="text-center text-4xl">Forgot password?</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a link to set a new password.
        </p>

        <Card className="mt-8">
          {sent ? (
            <div className="py-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                <MailCheck className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-2xl">Check your inbox</h2>
              <p className="mx-auto mt-3 max-w-xs text-sm text-muted-foreground">
                We&apos;ve sent reset instructions to{" "}
                <span className="text-foreground">
                  {email.trim() || "tejas@creators.ae"}
                </span>
                . The link stays valid for 30 minutes.
              </p>
              <div className="mt-7 grid gap-3">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => void navigate({ to: "/reset-password" })}
                >
                  Open the reset page
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => setSent(false)}>
                  Use a different email
                </Button>
              </div>
            </div>
          ) : (
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <Field label="Email">
                <input
                  className={inputClass}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                />
              </Field>
              <Button type="submit" size="lg" className="w-full">
                Send reset link
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Remembered it?{" "}
                <Link to="/signin" className="text-primary">
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Prototype — no email is actually sent. The reset link opens the set-new-password page.
        </p>
      </div>
    </SitePage>
  );
}
