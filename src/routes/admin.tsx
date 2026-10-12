import { createFileRoute, Link, Outlet, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Badge, Button, Card, Field, PasswordInput, inputClass } from "@/components/ui-kit";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getAdminSession, signInAdmin, signOutAdmin } from "@/lib/database";

export const Route = createFileRoute("/admin")({
  loader: () => getAdminSession(),
  head: () => ({
    meta: [
      { title: "Admin portal — RSVP DXB" },
      {
        name: "description",
        content:
          "RSVP DXB admin portal: applications, members, events, wall moderation, clients and door check-in.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Admin portal — RSVP DXB" },
      { property: "og:description", content: "Operate the RSVP DXB platform end to end." },
    ],
  }),
  component: AdminLayout,
});

const NAV: { to: string; label: string; group: string }[] = [
  { to: "/admin", label: "Dashboard", group: "Overview" },
  { to: "/admin/applications", label: "Applications", group: "People" },
  { to: "/admin/members", label: "Members", group: "People" },
  { to: "/admin/events", label: "Events", group: "Programme" },
  { to: "/admin/wall", label: "Events Wall", group: "Programme" },
  { to: "/admin/clients", label: "Clients & credits", group: "Business" },
  { to: "/admin/door", label: "Door app", group: "Operations" },
];

function AdminLayout() {
  const admin = Route.useLoaderData();
  const logout = useServerFn(signOutAdmin);
  const router = useRouter();

  if (!admin) return <AdminSignIn />;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-surface lg:block">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link to="/" className="font-display text-lg">
            RSVP<span className="text-primary"> DXB</span>
          </Link>
        </div>
        <nav className="p-3">
          {["Overview", "People", "Programme", "Business", "Operations"].map((group) => (
            <div key={group} className="mb-4">
              <p className="eyebrow px-2">{group}</p>
              <div className="mt-2 space-y-0.5">
                {NAV.filter((n) => n.group === group).map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    activeOptions={{ exact: n.to === "/admin" }}
                    activeProps={{ className: "bg-surface-2 text-primary" }}
                    className="flex items-center justify-between rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {n.label}
                    {n.to === "/admin/applications" && admin.pendingCount > 0 ? (
                      <Badge tone="amber">{admin.pendingCount}</Badge>
                    ) : null}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="mx-3 rounded-md border border-border p-3">
          <p className="eyebrow">Signed in as</p>
          <p className="mt-1 text-sm">Admin · Owner</p>
          <Link to="/" className="mt-2 inline-block text-xs text-primary">
            View public site
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border px-5">
          <div className="flex gap-2 overflow-x-auto lg:hidden">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/admin" }}
                activeProps={{ className: "text-primary" }}
                className="whitespace-nowrap text-xs text-muted-foreground"
              >
                {n.label}
              </Link>
            ))}
          </div>
          <p className="hidden text-xs uppercase tracking-[0.18em] text-muted-foreground lg:block">
            Admin portal
          </p>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Badge tone="gold">{admin.role}</Badge>
            <Button size="sm" variant="ghost" onClick={() => void logout().then(() => router.invalidate())}>Sign out</Button>
            <div className="h-8 w-8 rounded-full bg-primary/20" />
          </div>
        </header>
        <main className="flex-1 p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AdminSignIn() {
  const login = useServerFn(signInAdmin);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="grid min-h-screen place-items-center bg-background px-5">
      <Card className="w-full max-w-md">
        <p className="eyebrow">RSVP DXB</p>
        <h1 className="mt-2 text-3xl">Admin sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">Use your admin account to review applications and manage the platform.</p>
        <form className="mt-6 grid gap-4" onSubmit={(event) => {
          event.preventDefault();
          setBusy(true);
          setError("");
          void login({ data: { email, password } })
            .then(() => router.invalidate())
            .catch((cause) => setError(cause instanceof Error ? cause.message : "Sign in failed."))
            .finally(() => setBusy(false));
        }}>
          <Field label="Admin email"><input className={inputClass} type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></Field>
          <Field label="Password"><PasswordInput autoComplete="current-password" value={password} onChange={setPassword} /></Field>
          {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
          <Button type="submit" size="lg" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
        </form>
      </Card>
    </div>
  );
}
