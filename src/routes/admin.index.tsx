import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge, Button, Card, Stat } from "@/components/ui-kit";
import { formatDate } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard — RSVP DXB Admin" },
      { name: "description", content: "Review applications, live events and activity in RSVP DXB." },
      { property: "og:title", content: "Dashboard — RSVP DXB Admin" },
      { property: "og:description", content: "Review applications, live events and activity in RSVP DXB." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { applications, members, events, wall, brands, guests } = useStore();
  const pending = applications.filter((a) => a.status === "pending");
  const live = events.filter((e) => e.status === "published");
  const confirmed = live.reduce((sum, e) => sum + e.confirmed, 0);
  const checkedIn = guests.filter((g) => g.checkedInAt).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Thursday 1 October 2026 · 3 events live this week
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Applications pending" value={String(pending.length)} hint="48h SLA" />
        <Stat label="Approved members" value={String(members.length * 713)} hint="All tracks" />
        <Stat label="RSVPs this week" value={String(confirmed)} hint="Across live events" />
        <Stat label="Checked in tonight" value={`${checkedIn}/${guests.length}`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl">Application queue</h2>
            <Link to="/admin/applications">
              <Button size="sm" variant="outline">
                Open queue
              </Button>
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {pending.slice(0, 4).map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-surface-2 px-4 py-3"
              >
                <div>
                  <p className="text-sm">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.detail}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="gold">{a.track}</Badge>
                  <span className="text-xs text-muted-foreground">{a.submitted}</span>
                </div>
              </div>
            ))}
            {pending.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">Queue is clear.</p>
            ) : null}
          </div>
        </Card>

        <Card>
          <h2 className="text-xl">Needs attention</h2>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="Events awaiting approval" value={String(events.filter((e) => e.status === "pending").length)} />
            <Row label="Wall posts pending" value={String(wall.filter((p) => p.status === "pending").length)} />
            <Row label="Content submissions" value="7" />
            <Row label="Brands low on credits" value={String(brands.filter((b) => b.credits < 10).length)} />
            <Row label="Waitlists with free places" value="2" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Live events</h2>
          <Link to="/admin/events">
            <Button size="sm" variant="outline">
              Manage events
            </Button>
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2">Event</th>
                <th className="py-2">Brand</th>
                <th className="py-2">Date</th>
                <th className="py-2">Capacity</th>
                <th className="py-2">Fill</th>
              </tr>
            </thead>
            <tbody>
              {live.map((e) => (
                <tr key={e.id} className="border-t border-border">
                  <td className="py-3">{e.title}</td>
                  <td className="py-3 text-muted-foreground">{e.brand}</td>
                  <td className="py-3 text-muted-foreground">{formatDate(e.date)}</td>
                  <td className="py-3 text-muted-foreground">
                    {e.confirmed}/{e.capacity}
                  </td>
                  <td className="py-3">
                    <div className="h-1.5 w-28 overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${Math.min((e.confirmed / e.capacity) * 100, 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-surface-2 px-4 py-2.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-primary">{value}</span>
    </div>
  );
}
