import { createFileRoute } from "@tanstack/react-router";
import { CustomerInfo } from "@/components/CustomerInfo";
import { listPublishedEvents } from "@/lib/database";
export const Route = createFileRoute("/tickets")({ loader: () => listPublishedEvents(), head: () => ({ meta: [{ title: "Last minute tickets & offers — RSVP DXB" }, { name: "description", content: "Discover final places and invitation-only event offers in Dubai." }, { property: "og:title", content: "Last minute tickets & offers — RSVP DXB" }, { property: "og:description", content: "Find your next place on Dubai’s curated guest list." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: Tickets });

function Tickets() {
  const events = Route.useLoaderData();
  return <CustomerInfo page="tickets" ticketEvents={events} />;
}
