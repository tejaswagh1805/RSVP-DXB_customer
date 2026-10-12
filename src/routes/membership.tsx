import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, SitePage } from "@/components/SiteLayout";
import { Button, Card, Section } from "@/components/ui-kit";
import { POINT_RULES, RANKS, TRACKS } from "@/lib/data";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Membership — RSVP DXB" },
      {
        name: "description",
        content:
          "How RSVP DXB membership works: tracks, approval, points, ranks, rewards and referrals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Membership — RSVP DXB" },
      {
        property: "og:description",
        content: "Tracks, approval, points, ranks, rewards and referrals at RSVP DXB.",
      },
    ],
  }),
  component: MembershipPage,
});

const FAQS: [string, string][] = [
  ["Is membership free?", "Yes. Membership is free for approved members. Brands pay to host."],
  ["How long does approval take?", "Every profile is reviewed by our team, normally within 48 hours."],
  ["Can I bring a guest?", "Plus-ones depend on the event and your rank. Gold and above get them most often."],
  ["What if I cannot attend?", "Cancel from your member area. Repeated no-shows affect your access."],
  ["Is Private Circle different?", "Yes. Private Circle profiles are private, with no points, posting or public lists."],
];

const REWARDS = [
  ["Priority access", "Skip the waitlist on matched events."],
  ["Plus-one credits", "Bring a guest to selected evenings."],
  ["Reward drops", "Dining, stays and product from partner brands."],
  ["Referral bonus", "+100 points for every approved referral."],
];

function MembershipPage() {
  return (
    <SitePage>
      <PageHero
        eyebrow="Membership"
        title="How it works"
        intro="One profile, reviewed by our team, then matched to the events you are right for. Attend, post, earn points, rise through the ranks."
      />

      <Section eyebrow="Tracks" title="Pick your track">
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {TRACKS.map((t) => (
            <Card key={t.name}>
              <h3 className="text-xl">{t.name}</h3>
              <p className="mt-1 text-xs uppercase tracking-wider text-primary">{t.blurb}</p>
              <p className="mt-3 text-sm text-muted-foreground">{t.detail}</p>
            </Card>
          ))}
        </div>
      </Section>

      <div className="border-y border-border bg-surface">
        <Section eyebrow="Points & ranks" title="What earns what">
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card className="bg-background">
              <ul className="divide-y divide-border">
                {POINT_RULES.map((r) => (
                  <li key={r.label} className="flex justify-between py-2.5 text-sm">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="text-primary">+{r.points}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="bg-background">
              <div className="space-y-3">
                {RANKS.map((r) => (
                  <div key={r.name} className="flex items-center justify-between rounded-md bg-surface-2 px-4 py-3">
                    <span className="font-display text-lg">{r.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {r.at === 0 ? "Entry" : `${r.at.toLocaleString()} points`}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Section>
      </div>

      <Section eyebrow="Rewards" title="What you get back">
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {REWARDS.map(([title, body]) => (
            <Card key={title}>
              <h3 className="text-lg">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <div className="border-t border-border bg-surface">
        <Section eyebrow="FAQs" title="Good to know">
          <div className="mt-8 space-y-3">
            {FAQS.map(([q, a]) => (
              <Card key={q} className="bg-background">
                <p className="text-sm font-medium">{q}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{a}</p>
              </Card>
            ))}
          </div>
          <div className="mt-10">
            <Link to="/register">
              <Button size="lg">Apply for membership</Button>
            </Link>
          </div>
        </Section>
      </div>
    </SitePage>
  );
}
