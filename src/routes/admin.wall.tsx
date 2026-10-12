import { createFileRoute } from "@tanstack/react-router";
import { Badge, Button, Card } from "@/components/ui-kit";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/wall")({
  head: () => ({
    meta: [
      { title: "Manage Events Wall — RSVP DXB Admin" },
      { name: "description", content: "Moderate brand posts on the RSVP DXB Events Wall." },
      { property: "og:title", content: "Manage Events Wall — RSVP DXB Admin" },
      { property: "og:description", content: "Moderate brand posts on the RSVP DXB Events Wall." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminWallPage,
});

function AdminWallPage() {
  const { wall, moderatePost } = useStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Events Wall</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Approve, pin, boost or remove brand posts. A post costs the brand 1 credit, a 24-hour
          boost costs 3.
        </p>
      </div>

      <div className="space-y-3">
        {wall.map((p) => (
          <Card key={p.id} className={p.boosted ? "border-primary/50" : ""}>
            <div className="flex flex-wrap items-start gap-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-primary/15" />
              <div className="min-w-50 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">{p.brand}</span>
                  <Badge tone="muted">{p.type}</Badge>
                  <Badge tone={p.status === "live" ? "green" : "amber"}>{p.status}</Badge>
                  {p.boosted ? <Badge tone="gold">Boosted</Badge> : null}
                  <span className="text-xs text-muted-foreground">{p.posted}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
              </div>
              <div className="flex gap-2">
                {p.status === "pending" ? (
                  <Button size="sm" variant="success" onClick={() => moderatePost(p.id, "approve")}>
                    Approve
                  </Button>
                ) : null}
                <Button size="sm" variant="outline" onClick={() => moderatePost(p.id, "boost")}>
                  {p.boosted ? "Unboost" : "Boost (3)"}
                </Button>
                <Button size="sm" variant="danger" onClick={() => moderatePost(p.id, "remove")}>
                  Remove
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
