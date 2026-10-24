import { neon } from "@neondatabase/serverless";
import { readFile } from "node:fs/promises";

process.loadEnvFile?.();
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing. Add DATABASE_URL=... to the project .env file.");
}

const sql = neon(databaseUrl);
for (const fileName of [
  "0001_events_and_rsvps.sql",
  "0002_applications.sql",
  "0003_member_sessions.sql",
  "0005_guest_invitations.sql",
  "0006_event_video.sql",
  "0007_site_media.sql",
  "0008_people_profiles.sql",
  "0009_people_profile_subtitle.sql",
  "0010_event_rsvp_requests.sql",
  "0011_venues.sql",
]) {
  const migration = await readFile(new URL(`../drizzle/${fileName}`, import.meta.url), "utf8");
  for (const statement of migration.split(";").map((part) => part.trim()).filter(Boolean)) {
    await sql.query(statement);
  }
  console.info(`Applied ${fileName}.`);
}
