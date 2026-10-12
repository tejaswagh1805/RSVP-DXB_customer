import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Badge, Button, Card } from "@/components/ui-kit";
import { decideApplicationInDatabase, getAdminApplications } from "@/lib/database";

export const Route = createFileRoute("/admin/applications")({
  loader: () => getAdminApplications(),
  head: () => ({
    meta: [
      { title: "Applications — RSVP DXB Admin" },
      { name: "description", content: "Review membership applications for RSVP DXB." },
      { property: "og:title", content: "Applications — RSVP DXB Admin" },
      { property: "og:description", content: "Review membership applications for RSVP DXB." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ApplicationsPage,
});

const FILTERS = ["pending", "approved", "rejected", "all"] as const;

function ApplicationsPage() {
  const { applications: initialApplications } = Route.useLoaderData();
  const [applications, setApplications] = useState(initialApplications);
  const decideApplication = useServerFn(decideApplicationInDatabase);
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const decide = async (id: string, decision: "approved" | "rejected") => {
    setBusyId(id);
    setError("");
    try {
      await decideApplication({ data: { id, decision } });
      setApplications((list) => list.map((application) => application.id === id ? { ...application, status: decision } : application));
      void router.invalidate();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update this application.");
    } finally {
      setBusyId(null);
    }
  };

  const list = applications.filter((a) => (filter === "all" ? true : a.status === filter));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every profile is reviewed. Approving creates an active member account and sends the
          welcome email and WhatsApp message.
        </p>
      </div>

      {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "primary" : "outline"}
            onClick={() => setFilter(f)}
          >
            {f[0]!.toUpperCase() + f.slice(1)} (
            {f === "all" ? applications.length : applications.filter((a) => a.status === f).length})
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {list.map((a) => (
          <Card key={a.id} className="flex flex-wrap items-center gap-4">
            <div className="h-11 w-11 shrink-0 rounded-full bg-primary/15" />
            <div className="min-w-50 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{a.name}</p>
                <Badge tone="gold">{a.track}</Badge>
                <Badge
                  tone={a.status === "approved" ? "green" : a.status === "rejected" ? "red" : "amber"}
                >
                  {a.status}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{a.detail}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {a.email} · {a.city} · reach {a.followers} · submitted {a.submitted}
              </p>
            </div>
            {a.status === "pending" ? (
              <div className="flex gap-2">
                <Button size="sm" variant="success" disabled={busyId === a.id} onClick={() => void decide(a.id, "approved")}>
                  {busyId === a.id ? "Saving…" : "Approve"}
                </Button>
                <Button size="sm" variant="danger" disabled={busyId === a.id} onClick={() => void decide(a.id, "rejected")}>
                  Reject
                </Button>
                <Button size="sm" variant="ghost">
                  Notes
                </Button>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">
                {a.status === "approved" ? "Member created" : "Rejection sent"}
              </span>
            )}
          </Card>
        ))}
        {list.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Nothing in this view.</p>
        ) : null}
      </div>
    </div>
  );
}
