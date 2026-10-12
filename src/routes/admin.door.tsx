import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge, Button, Card, inputClass } from "@/components/ui-kit";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/door")({
  head: () => ({
    meta: [
      { title: "Door app — RSVP DXB Admin" },
      { name: "description", content: "Check in guests at RSVP DXB events." },
      { property: "og:title", content: "Door app — RSVP DXB Admin" },
      { property: "og:description", content: "Check in guests at RSVP DXB events." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DoorApp,
});

interface Result {
  tone: "green" | "amber" | "red";
  title: string;
  detail: string;
}

function DoorApp() {
  const { guests, events, scan } = useStore();
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [query, setQuery] = useState("");

  const event = events.find((e) => e.id === "marina-sunset-session");
  const arrived = guests.filter((g) => g.checkedInAt);
  const expected = guests.reduce((s, g) => s + g.plusOnes + 1, 0);
  const inside = arrived.reduce((s, g) => s + g.plusOnes + 1, 0);

  const doScan = (value: string) => {
    setResult(scan(value));
    setCode("");
  };

  const tones: Record<string, string> = {
    green: "border-success bg-success/10 text-success",
    amber: "border-warning bg-warning/10 text-warning",
    red: "border-destructive bg-destructive/10 text-destructive",
  };

  const searchHits = guests.filter((g) =>
    g.name.toLowerCase().includes(query.toLowerCase().trim()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Door app</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {event ? `${event.title} · ${event.venue}` : "Select an event"} · Door staff role ·
            Offline mode ready
          </p>
        </div>
        <div className="flex gap-3">
          <Badge tone="green">{inside} inside</Badge>
          <Badge tone="muted">{expected} expected</Badge>
          <Badge tone="amber">Synced 1 min ago</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl">Scan QR</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Point the camera at the member's pass, or enter the code manually.
          </p>
          <div className="mt-5 grid h-44 place-items-center rounded-lg border border-dashed border-border bg-surface-2 text-xs text-muted-foreground">
            Camera preview
          </div>
          <div className="mt-4 flex gap-2">
            <input
              className={inputClass}
              placeholder="RSVP-4471"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") doScan(code);
              }}
            />
            <Button onClick={() => doScan(code)}>Scan</Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {guests.slice(0, 3).map((g) => (
              <Button key={g.id} size="sm" variant="outline" onClick={() => doScan(g.code)}>
                Demo {g.code}
              </Button>
            ))}
            <Button size="sm" variant="ghost" onClick={() => doScan("RSVP-0000")}>
              Demo not on list
            </Button>
          </div>

          {result ? (
            <div className={`mt-5 rounded-lg border-2 p-6 text-center ${tones[result.tone]}`}>
              <p className="font-display text-3xl">{result.title}</p>
              <p className="mt-1 text-sm">{result.detail}</p>
            </div>
          ) : null}
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="text-xl">Search guest</h2>
            <input
              className={`${inputClass} mt-4`}
              placeholder="Type a name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="mt-4 space-y-2">
              {searchHits.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between rounded-md bg-surface-2 px-4 py-3 text-sm"
                >
                  <span>
                    {g.name}{" "}
                    <span className="text-xs text-muted-foreground">
                      · entry for {g.plusOnes + 1}
                    </span>
                  </span>
                  {g.checkedInAt ? (
                    <Badge tone="green">In at {g.checkedInAt}</Badge>
                  ) : (
                    <Button size="sm" onClick={() => doScan(g.code)}>
                      Check in
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl">Walk-in</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a guest who is not on the list. Flagged for admin review afterwards.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input className={inputClass} placeholder="Guest name" />
              <input className={inputClass} type="number" defaultValue={1} min={1} />
            </div>
            <Button className="mt-4" variant="outline">
              Add walk-in
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
