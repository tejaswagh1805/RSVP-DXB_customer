import { createFileRoute } from "@tanstack/react-router";
import { Badge, Button, Card, Stat } from "@/components/ui-kit";
import { PACKAGES } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/clients")({
  head: () => ({
    meta: [
      { title: "Clients & credits — RSVP DXB Admin" },
      { name: "description", content: "Manage brand clients and credits at RSVP DXB." },
      { property: "og:title", content: "Clients & credits — RSVP DXB Admin" },
      { property: "og:description", content: "Manage brand clients and credits at RSVP DXB." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClientsPage,
});

function ClientsPage() {
  const { brands, addCredits } = useStore();
  const totalCredits = brands.reduce((s, b) => s + b.credits, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Clients & credits</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Brand accounts, packages, wall credits and invoicing. Credits are separate from member
          points.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Active brands" value={String(brands.filter((b) => b.status === "active").length)} />
        <Stat label="Credits in circulation" value={String(totalCredits)} />
        <Stat label="Open invoices" value="3" hint="AED 74,500" />
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-muted-foreground">
              <th className="py-2">Brand</th>
              <th className="py-2">Package</th>
              <th className="py-2">Events</th>
              <th className="py-2">Credits</th>
              <th className="py-2">Status</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.id} className="border-t border-border">
                <td className="py-3">{b.name}</td>
                <td className="py-3 text-muted-foreground">{b.package}</td>
                <td className="py-3 text-muted-foreground">{b.events}</td>
                <td className="py-3">
                  <span className={b.credits < 10 ? "text-warning" : "text-primary"}>{b.credits}</span>
                </td>
                <td className="py-3">
                  <Badge tone={b.status === "active" ? "green" : "amber"}>{b.status}</Badge>
                </td>
                <td className="py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => addCredits(b.id, 10)}>
                      +10 credits
                    </Button>
                    <Button size="sm" variant="ghost">
                      Invoice
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div>
        <h2 className="text-2xl">Packages</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {PACKAGES.map((p) => (
            <Card key={p.name}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg">{p.name}</h3>
                <Badge tone="gold">from {p.from}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{p.detail}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
