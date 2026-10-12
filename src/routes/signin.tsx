import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SitePage } from "@/components/SiteLayout";
import { Button, Card, Field, inputClass, PasswordInput } from "@/components/ui-kit";
import { useStore } from "@/lib/store";
import { signInMember } from "@/lib/database";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in — RSVP DXB" },
      { name: "description", content: "Sign in to your RSVP DXB member account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Sign in — RSVP DXB" },
      { property: "og:description", content: "Sign in to your RSVP DXB member account." },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  const { hydrateMember } = useStore();
  const signIn = useServerFn(signInMember);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <SitePage>
      <div className="mx-auto w-full max-w-md px-5 py-24">
        <h1 className="text-center text-4xl">Welcome back</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Sign in to see your invitations, RSVPs and pass.
        </p>
        <Card className="mt-8">
          <form
            className="grid gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                const member = await signIn({ data: { email, password } });
                hydrateMember(member);
                await navigate({ to: "/me" });
              } catch (cause) {
                setError(cause instanceof Error ? cause.message : "Sign in failed. Please try again.");
              } finally {
                setBusy(false);
              }
            }}
          >
            <Field label="Email">
              <input className={inputClass} type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <div>
              <Field label="Password">
                <PasswordInput value={password} onChange={setPassword} autoComplete="current-password" />
              </Field>
              <div className="mt-2 flex justify-end">
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>
            {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
            <Button type="submit" variant="outline" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            No account yet?{" "}
            <Link to="/register" className="text-primary">
              Register
            </Link>
          </p>
        </Card>
        <p className="mt-6 text-center text-xs text-muted-foreground">Membership sign-in is available after your application is approved.</p>
      </div>
    </SitePage>
  );
}
