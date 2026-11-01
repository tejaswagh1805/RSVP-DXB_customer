const DEFAULT_CREATOR_PASS_FORM_URL = "https://docs.google.com/forms/d/1VvAsWM2fEU_4NILdJvtKy0D4cPkzTRbG9ODfe7bTwcM/viewform";

const configuredUrl = String(import.meta.env["VITE_CREATOR_PASS_GOOGLE_FORM_URL"] || DEFAULT_CREATOR_PASS_FORM_URL).trim();
const eventEntryId = String(import.meta.env["VITE_CREATOR_PASS_EVENT_ENTRY_ID"] || "").trim();

const baseFormUrl = /^https:\/\/(docs\.google\.com\/forms\/|forms\.gle\/)/i.test(configuredUrl)
  ? configuredUrl
  : DEFAULT_CREATOR_PASS_FORM_URL;

type CreatorPassEvent = { title: string; date?: string | null; venue?: string | null };

// Google Forms needs its question entry ID to preselect a choice. Without it,
// opening the shared form can leave its old default event selected by mistake.
export function creatorPassFormUrlForEvent(event: CreatorPassEvent): string | null {
  if (!/^\d+$/.test(eventEntryId)) return null;
  const label = [event.title, event.date, event.venue].filter(Boolean).join(" · ");
  const url = new URL(baseFormUrl);
  url.searchParams.set("usp", "pp_url");
  url.searchParams.set(`entry.${eventEntryId}`, label);
  return url.toString();
}
