import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import diningImage from "@/assets/event-dining.jpg";
import fashionImage from "@/assets/event-fashion.jpg";
import nightlifeImage from "@/assets/event-nightlife.jpg";
import propertyImage from "@/assets/event-property.jpg";
import { getSql } from "./db.server";
import { memberEmailHtml, sendMemberEmail } from "./email.server";
import type { EventItem, Track } from "./data";

const scrypt = promisify(scryptCallback);
const MEMBER_COOKIE = "rsvp_member_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

function cookieValue(name: string): string | null {
  const cookie = getRequestHeader("cookie") ?? "";
  const pair = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : null;
}

async function passwordMatches(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, expectedHex] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !expectedHex || !/^[a-f0-9]{128}$/i.test(expectedHex)) return false;
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("base64url");
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${hash.toString("hex")}`;
}

async function currentMember() {
  const token = cookieValue(MEMBER_COOKIE);
  if (!token) return null;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const sql = getSql();
  const rows = (await sql`
    SELECT m.id, m.name, m.email, m.track, m.points, m.rank, m.city
    FROM member_sessions s JOIN members m ON m.id = s.member_id
    WHERE s.token_hash = ${tokenHash} AND s.expires_at > now() AND m.status = 'approved'
    LIMIT 1
  `) as unknown as { id: string; name: string; email: string; track: Track; points: number; rank: string; city: string }[];
  return rows[0] ?? null;
}

type EventRow = Omit<EventItem, "image" | "images"> & { image_key: string; image_data: string | null; image_gallery?: string[] | null };

const EVENT_IMAGES: Record<string, string> = {
  "atlantis-chef-table": diningImage,
  "jumeirah-spring-launch": fashionImage,
  "dubai-hills-preview": propertyImage,
  "marina-sunset-session": nightlifeImage,
  "difc-art-night": fashionImage,
  "beach-club-opening": nightlifeImage,
};

function mapEvent(row: EventRow): EventItem {
  const { image_data, image_key, image_gallery, ...event } = row;
  const images = image_gallery?.length ? image_gallery : image_data ? [image_data] : [];
  return {
    ...event,
    image: images[0] || EVENT_IMAGES[image_key] || EVENT_IMAGES["atlantis-chef-table"]!,
    images,
  };
}

export const listPublishedEvents = createServerFn({ method: "GET" }).handler(async () => {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, title, brand, to_char(date, 'YYYY-MM-DD') AS date, time, venue, area,
      category, tracks, capacity, confirmed, dress_code AS "dressCode", about,
      included, who_is_invited AS "whoIsInvited", host_note AS "hostNote",
      status, image_key, image_data, image_gallery
    FROM events WHERE status = 'published' ORDER BY date, time
  `) as unknown as EventRow[];
  return rows.map(mapEvent);
});

export const getEventById = createServerFn({ method: "GET" })
  .validator((eventId: string) => eventId)
  .handler(async ({ data: eventId }) => {
    const sql = getSql();
    const rows = (await sql`
      SELECT id, title, brand, to_char(date, 'YYYY-MM-DD') AS date, time, venue, area,
        category, tracks, capacity, confirmed, dress_code AS "dressCode", about,
        included, who_is_invited AS "whoIsInvited", host_note AS "hostNote",
        status, image_key, image_data, image_gallery
      FROM events WHERE id = ${eventId} AND status IN ('published', 'closed') LIMIT 1
    `) as unknown as EventRow[];
    return rows[0] ? mapEvent(rows[0]) : null;
  });

export const getMemberRsvps = createServerFn({ method: "GET" }).handler(async () => {
    const member = await currentMember();
    if (!member) return {};
    const sql = getSql();
    const rows = (await sql`
      SELECT event_id, state FROM event_rsvps WHERE guest_key = ${member.id}
    `) as unknown as { event_id: string; state: "going" | "waitlist" }[];
    return Object.fromEntries(rows.map((row) => [row["event_id"], row["state"]]));
  });

export const updateEventRsvp = createServerFn({ method: "POST" })
  .validator((input: { eventId: string; wantsGoing: boolean }) => input)
  .handler(async ({ data }) => {
    const member = await currentMember();
    if (!member) throw new Error("Sign in with an approved member account to RSVP.");
    const sql = getSql();
    if (!data.wantsGoing) {
      await sql`DELETE FROM event_rsvps WHERE event_id = ${data.eventId} AND guest_key = ${member.id}`;
      await sql`UPDATE events SET confirmed = GREATEST(confirmed - 1, 0) WHERE id = ${data.eventId}`;
    } else {
      const result = (await sql`
        INSERT INTO event_rsvps (event_id, guest_key, state)
        SELECT e.id, ${member.id},
          CASE WHEN e.confirmed < e.capacity THEN 'going' ELSE 'waitlist' END
        FROM events e WHERE e.id = ${data.eventId}
        ON CONFLICT (event_id, guest_key) DO NOTHING
        RETURNING state
      `) as unknown as { state: "going" | "waitlist" }[];
      if (result[0]?.["state"] === "going") {
        await sql`UPDATE events SET confirmed = confirmed + 1 WHERE id = ${data.eventId}`;
      }
    }
    const rows = (await sql`
      SELECT event_id, state FROM event_rsvps WHERE guest_key = ${member.id}
    `) as unknown as { event_id: string; state: "going" | "waitlist" }[];
    return Object.fromEntries(rows.map((row) => [row["event_id"], row["state"]]));
  });

export type GuestInvitationView = {
  guestName: string;
  eventId: string;
  eventTitle: string;
  brand: string;
  date: string;
  time: string;
  venue: string;
  area: string;
  dressCode: string;
  tableNo: string;
  status: "pending" | "accepted" | "declined";
  plusOnes: number;
};

export const getGuestInvitation = createServerFn({ method: "GET" })
  .validator((token: string) => token)
  .handler(async ({ data: token }) => {
    if (!/^[A-Za-z0-9_-]{32,100}$/.test(token)) return null;
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const sql = getSql();
    const rows = (await sql`
      SELECT g.guest_name AS "guestName", g.event_id AS "eventId",
        e.title AS "eventTitle", e.brand, to_char(e.date, 'YYYY-MM-DD') AS date,
        e.time, e.venue, e.area, e.dress_code AS "dressCode", g.table_no AS "tableNo",
        g.status, g.plus_ones AS "plusOnes"
      FROM guest_invitations g JOIN events e ON e.id = g.event_id
      WHERE g.token_hash = ${tokenHash} AND e.status IN ('published', 'closed')
      LIMIT 1
    `) as unknown as GuestInvitationView[];
    return rows[0] ?? null;
  });

export const respondToGuestInvitation = createServerFn({ method: "POST" })
  .validator((input: { token: string; attending: boolean; plusOnes: number }) => input)
  .handler(async ({ data }) => {
    if (!/^[A-Za-z0-9_-]{32,100}$/.test(data.token)) throw new Error("This invitation link is invalid.");
    if (typeof data.attending !== "boolean" || !Number.isInteger(data.plusOnes) || data.plusOnes < 0 || data.plusOnes > 2) {
      throw new Error("Choose a valid RSVP response.");
    }
    if (!data.attending && data.plusOnes !== 0) throw new Error("A declined invitation cannot include guests.");
    const tokenHash = createHash("sha256").update(data.token).digest("hex");
    const sql = getSql();
    const rows = (await sql`
      UPDATE guest_invitations g
      SET status = ${data.attending ? "accepted" : "declined"},
          plus_ones = ${data.attending ? data.plusOnes : 0}, responded_at = now()
      FROM events e
      WHERE g.event_id = e.id AND g.token_hash = ${tokenHash}
        AND e.status = 'published'
      RETURNING g.status, g.plus_ones AS "plusOnes"
    `) as unknown as { status: "accepted" | "declined"; plusOnes: number }[];
    if (!rows[0]) throw new Error("This invitation is unavailable or RSVPs are closed.");
    return rows[0];
  });

export const submitApplication = createServerFn({ method: "POST" })
  .validator((input: { name: string; email: string; password: string; track: Track; city: string; detail: string; instagramProfile: string; instagramFollowers: string; mobile: string; outlet: string; applicationRole: string; platform: string; allProfiles: string }) => input)
  .handler(async ({ data }) => {
    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();
    const password = data.password;
    if (name.length < 2 || name.length > 120) throw new Error("Enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
    if (password.length < 12 || password.length > 200) throw new Error("Password must be at least 12 characters.");
    if (!["Media", "Creators", "Tastemakers", "Private Circle"].includes(data.track)) throw new Error("Choose a valid membership track.");
    const submittedProfile = String(data.instagramProfile ?? "").trim();
    const urlMatch = submittedProfile.match(/^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]{1,30})\/?$/i);
    const handleMatch = submittedProfile.match(/^@?([a-zA-Z0-9._]{1,30})$/);
    const instagramHandle = urlMatch?.[1] ?? handleMatch?.[1];
    if (!instagramHandle || instagramHandle.startsWith(".") || instagramHandle.endsWith(".")) {
      throw new Error("Enter a valid Instagram profile or username.");
    }
    const followerCount = String(data.instagramFollowers ?? "").trim();
    if (!/^\d{1,10}$/.test(followerCount)) {
      throw new Error("Enter your Instagram follower count as a whole number.");
    }
    // Keep a plain numeric string because the staff API parses it as an integer on approval.
    const followers = followerCount;
    const profileUrl = `https://www.instagram.com/${instagramHandle}/`;
    const handle = `@${instagramHandle}`;
    const mobile = String(data.mobile ?? "").trim().slice(0, 100);
    const outlet = String(data.outlet ?? "").trim().slice(0, 180);
    const applicationRole = String(data.applicationRole ?? "").trim().slice(0, 180);
    const platform = String(data.platform ?? "Instagram").trim().slice(0, 80) || "Instagram";
    const allProfiles = String(data.allProfiles ?? "").trim().slice(0, 1000);
    const detail = data.detail.trim().slice(0, 1000);
    const sql = getSql();
    const existing = await sql`SELECT id FROM applications WHERE lower(email) = ${email} AND status = 'pending' LIMIT 1`;
    if (existing.length) throw new Error("An application for this email is already under review.");
    const existingMember = await sql`SELECT id FROM members WHERE lower(email) = ${email} LIMIT 1`;
    if (existingMember.length) throw new Error("An account for this email already exists. Please sign in.");
    const passwordHash = await hashPassword(password);
    const rows = (await sql`
      INSERT INTO applications (
        id, name, email, track, city, detail, followers, profile_url, handle, platform,
        mobile, outlet, application_role, all_profiles, source_track, password_hash, submitted, status
      )
      VALUES (
        ${crypto.randomUUID()}, ${name}, ${email}, ${data.track},
        ${data.city.trim().slice(0, 100) || "Dubai"}, ${detail}, ${followers},
        ${profileUrl}, ${handle}, ${platform}, ${mobile}, ${outlet},
        ${applicationRole}, ${allProfiles}, ${data.track}, ${passwordHash}, CURRENT_DATE, 'pending'
      )
      RETURNING id, name, email
    `) as unknown as { id: string; name: string; email: string }[];
    const application = rows[0];
    if (!application) throw new Error("Could not save your application. Please try again.");
    const adminEmail = process.env["RSVP_ADMIN_EMAIL"] || "vinitahirani@rsvpdxb.com";
    const [customerEmailResult, adminEmailResult] = await Promise.all([
      sendMemberEmail({
        to: application.email,
        subject: "We received your RSVP DXB application",
        text: `Hello ${application.name},\n\nThank you for applying to RSVP DXB. Our team will review your application and normally respond within 48 hours.\n\nRegards,\nRSVP DXB`,
        html: memberEmailHtml(application.name, "Thank you for applying to RSVP DXB. Our team will review your application and normally respond within 48 hours."),
      }),
      sendMemberEmail({
        to: adminEmail,
        subject: `New RSVP DXB application: ${application.name}`,
        text: [
          "A new RSVP DXB application has been submitted.",
          "",
          `Name: ${application.name}`,
          `Email: ${application.email}`,
          `Track: ${data.track}`,
          `City: ${data.city.trim() || "Dubai"}`,
          `Instagram: ${handle}`,
          `Followers: ${followers}`,
          `Mobile / WhatsApp: ${mobile || "Not provided"}`,
          `Outlet: ${outlet || "Not provided"}`,
          `Role: ${applicationRole || "Not provided"}`,
          `Profile details: ${allProfiles || "Not provided"}`,
          `Application details: ${detail || "Not provided"}`,
          `Application ID: ${application.id}`,
          "Status: Pending review",
        ].join("\n"),
        html: memberEmailHtml(
          "RSVP DXB team",
          `A new application was submitted by ${application.name} (${application.email}). Track: ${data.track}. City: ${data.city.trim() || "Dubai"}. Instagram: ${handle}. Followers: ${followers}. Mobile: ${mobile || "Not provided"}. Outlet: ${outlet || "Not provided"}. Role: ${applicationRole || "Not provided"}. Profile details: ${allProfiles || "Not provided"}. Application details: ${detail || "Not provided"}. Application ID: ${application.id}. Status: Pending review.`,
        ),
      }),
    ]);
    return {
      id: application.id,
      status: "pending" as const,
      emailSent: customerEmailResult.sent,
      adminEmailSent: adminEmailResult.sent,
    };
  });

export const getMemberSession = createServerFn({ method: "GET" }).handler(async () => {
  const member = await currentMember();
  return member ? { ...member, signedIn: true as const, approved: true as const } : null;
});

export const signInMember = createServerFn({ method: "POST" })
  .validator((input: { email: string; password: string }) => input)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !data.password || data.password.length > 200) {
      throw new Error("Email or password is incorrect.");
    }
    const sql = getSql();
    const rows = (await sql`
      SELECT id, name, email, track, points, rank, city, password_hash
      FROM members WHERE lower(email) = ${email} AND status = 'approved' LIMIT 1
    `) as unknown as { id: string; name: string; email: string; track: Track; points: number; rank: string; city: string; password_hash: string | null }[];
    const member = rows[0];
    if (!member || !member.password_hash || !(await passwordMatches(data.password, member.password_hash))) {
      const pending = await sql`SELECT id FROM applications WHERE lower(email) = ${email} AND status = 'pending' LIMIT 1`;
      if (pending.length) throw new Error("Your application is still under review. You can sign in after the team approves it.");
      throw new Error("Email or password is incorrect.");
    }
    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await sql`
      INSERT INTO member_sessions (token_hash, member_id, expires_at)
      VALUES (${tokenHash}, ${member.id}, now() + (${SESSION_DURATION_SECONDS} * interval '1 second'))
    `;
    const secure = process.env["NODE_ENV"] === "production" ? "; Secure" : "";
    setResponseHeader("Set-Cookie", `${MEMBER_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DURATION_SECONDS}${secure}`);
    return { id: member.id, name: member.name, email: member.email, track: member.track, points: member.points, rank: member.rank, city: member.city, signedIn: true as const, approved: true as const };
  });

export const signOutMember = createServerFn({ method: "POST" }).handler(async () => {
  const token = cookieValue(MEMBER_COOKIE);
  if (token) {
    const sql = getSql();
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await sql`DELETE FROM member_sessions WHERE token_hash = ${tokenHash}`;
  }
  setResponseHeader("Set-Cookie", `${MEMBER_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  return { ok: true };
});

