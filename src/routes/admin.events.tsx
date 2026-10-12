import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge, Button, Card, Field, inputClass } from "@/components/ui-kit";
import { formatDate } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/events")({
  head: () => ({
    meta: [
      { title: "Manage events — RSVP DXB Admin" },
      { name: "description", content: "Review events, guest lists and publishing at RSVP DXB." },
      { property: "og:title", content: "Manage events — RSVP DXB Admin" },
      { property: "og:description", content: "Review events, guest lists and publishing at RSVP DXB." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminEventsPage,
});

function AdminEventsPage() {
  const { events, decideEvent, guests } = useStore();
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const selected = events.find((e) => e.id === open);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, review and publish events. Brand submissions are checked before going live.
          </p>
        </div>
        <Button onClick={() => setCreating((v) => !v)}>
          {creating ? "Close" : "Create event"}
        </Button>
      </div>

      {creating ? (
        <Card>
          <h2 className="text-xl">New event</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Field label="Title">
              <input className={inputClass} placeholder="Event name" />
            </Field>
            <Field label="Brand">
              <input className={inputClass} placeholder="Host brand" />
            </Field>
            <Field label="Venue">
              <input className={inputClass} />
            </Field>
            <Field label="Date">
              <input className={inputClass} type="date" />
            </Field>
            <Field label="Time">
              <input className={inputClass} type="time" />
            </Field>
            <Field label="Capacity">
              <input className={inputClass} type="number" defaultValue={80} />
            </Field>
            <Field label="Audience tracks">
              <select className={inputClass} multiple size={4}>
                <option>Media</option>
                <option>Creators</option>
                <option>Tastemakers</option>
                <option>Private Circle</option>
              </select>
            </Field>
            <Field label="Interests">
              <input className={inputClass} placeholder="Dining, luxury" />
            </Field>
            <Field label="Guest requirements">
              <input className={inputClass} placeholder="Min 10k followers" />
            </Field>
          </div>
          <div className="mt-5 flex gap-2">
            <Button onClick={() => setCreating(false)}>Save & publish</Button>
            <Button variant="outline" onClick={() => setCreating(false)}>
              Save as draft
            </Button>
          </div>
        </Card>
      ) : null}

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-muted-foreground">
              <th className="py-2">Event</th>
              <th className="py-2">Brand</th>
              <th className="py-2">Date</th>
              <th className="py-2">RSVPs</th>
              <th className="py-2">Status</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-t border-border">
                <td className="py-3">{e.title}</td>
                <td className="py-3 text-muted-foreground">{e.brand}</td>
                <td className="py-3 text-muted-foreground">{formatDate(e.date)}</td>
                <td className="py-3 text-muted-foreground">
                  {e.confirmed}/{e.capacity}
                </td>
                <td className="py-3">
                  <Badge
                    tone={e.status === "published" ? "green" : e.status === "pending" ? "amber" : "muted"}
                  >
                    {e.status}
                  </Badge>
                </td>
                <td className="py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {e.status === "pending" ? (
                      <Button size="sm" variant="success" onClick={() => decideEvent(e.id, "published")}>
                        Publish
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => decideEvent(e.id, "closed")}>
                        Close RSVPs
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setOpen(open === e.id ? null : e.id)}>
                      Guest list
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {selected ? (
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-xl">Guest list — {selected.title}</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                Export
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setOpen(null)}>
                Close
              </Button>
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            {guests.map((g) => (
              <div
                key={g.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-surface-2 px-4 py-3 text-sm"
              >
                <span>
                  {g.name}{" "}
                  <span className="text-xs text-muted-foreground">
                    · {g.track} · entry for {g.plusOnes + 1}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{g.code}</span>
                  <Badge tone={g.checkedInAt ? "green" : "muted"}>
                    {g.checkedInAt ? `Arrived ${g.checkedInAt}` : "Confirmed"}
                  </Badge>
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Guest list shown is the demo list used by the Door app.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
