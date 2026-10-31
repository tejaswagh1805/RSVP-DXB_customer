import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SitePage } from "@/components/SiteLayout";
import { Section } from "@/components/ui-kit";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — RSVP DXB" }, { name: "description", content: "How RSVP DXB uses information submitted through this website." }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return <SitePage>
    <PageHero eyebrow="Privacy" title="Your information, handled with care" intro="This notice explains what information RSVP DXB receives through this website and how it is used." />
    <Section title="Information you provide">
      <div className="mt-6 max-w-3xl space-y-5 text-sm leading-7 text-muted-foreground">
        <p>Depending on how you use the site, you may provide account and application details, contact information, event RSVP details, press or hosting enquiries, and an email address for newsletter updates.</p>
        <p>We use that information to operate accounts and guest lists, review applications, respond to requests, deliver event-related messages you ask for, and send newsletter updates when you have opted in. Newsletter emails include an unsubscribe link.</p>
        <p>Information is stored and processed using the services configured to operate RSVP DXB, including its database, hosting, media storage, and email delivery providers. Authorized RSVP DXB staff may access information to handle these requests and run the service.</p>
        <p>Do not include sensitive personal information in public enquiries. You can request access to or correction of information you submitted by contacting <a className="underline underline-offset-4" href="mailto:vinitahirani@rsvpdxb.com">vinitahirani@rsvpdxb.com</a>. We may need to verify your identity before responding.</p>
        <p>We update this notice when the website or its data use changes. This page was last updated 31 October 2026.</p>
      </div>
    </Section>
  </SitePage>;
}
