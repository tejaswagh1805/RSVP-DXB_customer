import { neon } from "@neondatabase/serverless";
import { readFile } from "node:fs/promises";

try {
  process.loadEnvFile?.();
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing. Add DATABASE_URL=... to the project .env file.");
}

const sql = neon(databaseUrl);
function splitSqlStatements(source) {
  const statements = [];
  let current = "";
  let quote = "";
  let lineComment = false;
  let blockComment = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (lineComment) {
      current += char;
      if (char === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      current += char;
      if (char === "*" && next === "/") { current += next; index += 1; blockComment = false; }
      continue;
    }
    if (quote) {
      current += char;
      if (char === quote) {
        if (next === quote) { current += next; index += 1; }
        else quote = "";
      }
      continue;
    }
    if (char === "-" && next === "-") { current += char + next; index += 1; lineComment = true; continue; }
    if (char === "/" && next === "*") { current += char + next; index += 1; blockComment = true; continue; }
    if (char === "'" || char === '"') { quote = char; current += char; continue; }
    if (char === ";") {
      if (current.trim()) statements.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  if (quote) throw new Error("Unterminated quoted value in migration SQL.");
  if (blockComment) throw new Error("Unterminated block comment in migration SQL.");
  if (current.trim()) statements.push(current.trim());
  return statements;
}

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
  "0012_client_event_listing_fields.sql",
  "0013_client_event_listings.sql",
  "0014_member_password_resets.sql",
  "0015_member_numbers.sql",
]) {
  const migration = await readFile(new URL(`../drizzle/${fileName}`, import.meta.url), "utf8");
  for (const statement of splitSqlStatements(migration)) {
    await sql.query(statement);
  }
  console.info(`Applied ${fileName}.`);
}
