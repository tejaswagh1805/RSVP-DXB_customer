import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge, Button, Card, Stat, inputClass } from "@/components/ui-kit";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/members")({
  head: () => ({
    meta: [
      { title: "Members — RSVP DXB Admin" },
      { name: "description", content: "Browse member tracks and attendance at RSVP DXB." },
      { property: "og:title", content: "Members — RSVP DXB Admin" },
      { property: "og:description", content: "Browse member tracks and attendance at RSVP DXB." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MembersPage,
});

const TRACK_FILTERS = ["All", "Media", "Creators", "Tastemakers", "Private Circle"];

function MembersPage() {
  const { members } = useStore();
  const [track, setTrack] = useState("All");
  const [q, setQ] = useState("");

  const list = members.filter(
    (m) =>
      (track === "All" || m.track === track) &&
      m.name.toLowerCase().includes(q.toLowerCase().trim()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Members</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Member CRM with tracks, ranks, points and attendance. Private Circle records stay hidden
          from public lists.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Media" value={String(members.filter((m) => m.track === "Media").length)} />
        <Stat label="Creators" value={String(members.filter((m) => m.track === "Creators").length)} />
        <Stat label="Tastemakers" value={String(members.filter((m) => m.track === "Tastemakers").length)} />
        <Stat label="Private Circle" value={String(members.filter((m) => m.track === "Private Circle").length)} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {TRACK_FILTERS.map((t) => (
          <Button key={t} size="sm" variant={track === t ? "primary" : "outline"} onClick={() => setTrack(t)}>
            {t}
          </Button>
        ))}
        <input
          className={`${inputClass} h-8 max-w-56 py-0`}
          placeholder="Search members"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button size="sm" variant="ghost">
          Export CSV
        </Button>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-muted-foreground">
              <th className="py-2">Member</th>
              <th className="py-2">Track</th>
              <th className="py-2">Rank</th>
              <th className="py-2">Points</th>
              <th className="py-2">Events</th>
              <th className="py-2">City</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((m) => (
              <tr key={m.id} className="border-t border-border">
                <td className="py-3">{m.name}</td>
                <td className="py-3">
                  <Badge tone={m.track === "Private Circle" ? "red" : "gold"}>{m.track}</Badge>
                </td>
                <td className="py-3 text-muted-foreground">{m.rank}</td>
                <td className="py-3 text-primary">{m.points.toLocaleString()}</td>
                <td className="py-3 text-muted-foreground">{m.events}</td>
                <td className="py-3 text-muted-foreground">{m.city}</td>
                <td className="py-3 text-right">
                  <Button size="sm" variant="ghost">
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No members match.</p>
        ) : null}
      </Card>
    </div>
  );
}
