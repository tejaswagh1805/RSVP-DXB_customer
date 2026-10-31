import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SitePage } from "@/components/SiteLayout";
import { Section } from "@/components/ui-kit";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Use — RSVP DXB" }, { name: "description", content: "Terms for using the RSVP DXB website and services." }] }),
  component: TermsPage,
});

function TermsPage() {
  return <SitePage>
    <PageHero eyebrow="Terms of use" title="Using RSVP DXB" intro="These terms cover your use of the RSVP DXB website and its account, application, event, and enquiry features." />
    <Section title="Website use">
      <div className="mt-6 max-w-3xl space-y-5 text-sm leading-7 text-muted-foreground">
        <p>Provide accurate information when creating an account, applying for membership, making an RSVP, or contacting the team. Keep your sign-in details secure and use the site lawfully and respectfully.</p>
        <p>Submitting an application or RSVP request does not guarantee approval, admission, or a ticket. Event access, age limits, schedules, venue rules, ticket prices, and cancellation terms are set for each event and may be provided by its organizer or ticketing provider.</p>
        <p>Event listings and availability can change. Check the event page and organizer’s instructions before attending. External links are operated by their respective providers.</p>
        <p>RSVP DXB may update or temporarily suspend site features to maintain the service. Contact <a className="underline underline-offset-4" href="mailto:vinitahirani@rsvpdxb.com">vinitahirani@rsvpdxb.com</a> if you need help.</p>
        <p>These terms were last updated 31 October 2026.</p>
      </div>
    </Section>
  </SitePage>;
}
