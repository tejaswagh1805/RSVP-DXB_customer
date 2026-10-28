import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import diningImage from "@/assets/event-dining.jpg";
import fashionImage from "@/assets/event-fashion.jpg";
import nightlifeImage from "@/assets/event-nightlife.jpg";
import propertyImage from "@/assets/event-property.jpg";
import { getSql } from "./db.server";
import { applicationAdminEmail, applicationConfirmationEmail, memberEmailHtml, memberPasswordResetEmail, sendMemberEmail } from "./email.server";
import { profileSlug, type EventItem, type Track } from "./data";

export type HomepageMediaItem = { id: string; slot: "gallery" | "top_pick"; title: string; caption: string; imageUrl: string; mediaType: "image" | "video"; linkUrl: string; displayOrder: number };
export type PeopleProfile = { id: string; category: "artist" | "influencer"; name: string; role: string; subtitle: string; bio: string; imageUrl: string; instagramUrl: string; tiktokUrl: string; youtubeUrl: string; xUrl: string; displayOrder: number };
export type Venue = { id: string; slug: string; category: string; name: string; tagline: string; description: string; location: string; highlights: string[]; offer: string; featuredDate: string | null; imageUrl: string; websiteUrl: string; moreInfoUrl: string; displayOrder: number; featured: boolean };

function isMissingVenueTable(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return message.includes("venues") && message.includes("does not exist");
}

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
    SELECT m.id, m.name, m.email, m.track, m.points, m.rank, m.city,
      m.mobile, m.handle, m.followers
    FROM member_sessions s JOIN members m ON m.id = s.member_id
    WHERE s.token_hash = ${tokenHash} AND s.expires_at > now() AND m.status = 'approved'
    LIMIT 1
  `) as unknown as { id: string; name: string; email: string; track: Track; points: number; rank: string; city: string; mobile: string; handle: string; followers: number }[];
  return rows[0] ?? null;
}

type EventRow = Omit<EventItem, "image" | "images" | "video"> & { image_key: string; image_data: string | null; image_gallery?: string[] | null; video_url?: string | null; track_capacities?: Partial<Record<Track, number>> | null; influencer_deliverables?: string | null; map_url?: string | null; endDate?: string | null; end_time?: string | null; gates_open_time?: string | null; ticket_url?: string | null; reservation_phone?: string | null; creator_pass_note?: string | null; age_restriction?: string | null; application_deadline?: string | null; action_label?: string | null };

const EVENT_IMAGES: Record<string, string> = {
  "atlantis-chef-table": diningImage,
  "jumeirah-spring-launch": fashionImage,
  "dubai-hills-preview": propertyImage,
  "marina-sunset-session": nightlifeImage,
  "difc-art-night": fashionImage,
  "beach-club-opening": nightlifeImage,
};

function mapEvent(row: EventRow): EventItem {
  const { image_data, image_key, image_gallery, video_url, influencer_deliverables, map_url, endDate, end_time, gates_open_time, ticket_url, reservation_phone, creator_pass_note, age_restriction, application_deadline, action_label, ...event } = row;
  const images = image_gallery?.length ? image_gallery : image_data ? [image_data] : [];
  return {
    ...event,
    image: images[0] || EVENT_IMAGES[image_key] || EVENT_IMAGES["atlantis-chef-table"]!,
    images,
    influencerDeliverables: influencer_deliverables ?? "",
    mapUrl: map_url ?? "",
    endDate: endDate ?? undefined,
    endTime: end_time ?? "",
    gatesOpenTime: gates_open_time ?? "",
    ticketUrl: ticket_url ?? "",
    reservationPhone: reservation_phone ?? "",
    creatorPassNote: creator_pass_note ?? "",
    ageRestriction: age_restriction ?? "",
    applicationDeadline: application_deadline ?? "",
    actionLabel: action_label ?? "",
    ...(video_url ? { video: video_url } : {}),
  };
}

export const listPublishedEvents = createServerFn({ method: "GET" }).handler(async () => {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, title, brand, to_char(date, 'YYYY-MM-DD') AS date, time, venue, area,
      category, tracks, capacity, confirmed, dress_code AS "dressCode", about,
      included, who_is_invited AS "whoIsInvited", host_note AS "hostNote",
      ticket_url, reservation_phone, creator_pass_note, age_restriction, hashtag,
      to_char(application_deadline, 'YYYY-MM-DD') AS application_deadline, action_label,
      track_capacities AS "trackCapacities", influencer_deliverables, map_url,
      to_char(end_date, 'YYYY-MM-DD') AS "endDate", end_time, gates_open_time,
      status, image_key, image_data, image_gallery, video_url
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
        ticket_url, reservation_phone, creator_pass_note, age_restriction, hashtag,
        to_char(application_deadline, 'YYYY-MM-DD') AS application_deadline, action_label,
        track_capacities AS "trackCapacities", influencer_deliverables, map_url,
        to_char(end_date, 'YYYY-MM-DD') AS "endDate", end_time, gates_open_time,
        status, image_key, image_data, image_gallery, video_url
      FROM events WHERE id = ${eventId} AND status IN ('published', 'closed') LIMIT 1
    `) as unknown as EventRow[];
    return rows[0] ? mapEvent(rows[0]) : null;
  });

export const listHomepageMedia = createServerFn({ method: "GET" }).handler(async () => {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, slot, title, caption, image_url AS "imageUrl", COALESCE(media_type, 'image') AS "mediaType", link_url AS "linkUrl", display_order AS "displayOrder"
    FROM site_media WHERE active = TRUE ORDER BY slot, display_order, created_at DESC
  `) as unknown as HomepageMediaItem[];
  return rows;
});

export const listPeopleProfiles = createServerFn({ method: "GET" }).handler(async () => {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, category, name, role, subtitle, bio, image_url AS "imageUrl",
      instagram_url AS "instagramUrl", tiktok_url AS "tiktokUrl",
      youtube_url AS "youtubeUrl", x_url AS "xUrl", display_order AS "displayOrder"
    FROM people_profiles WHERE active = TRUE ORDER BY category, display_order, created_at DESC
  `) as unknown as PeopleProfile[];
  return rows;
});

export const listVenues = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const sql = getSql();
    const rows = (await sql`
      SELECT id, slug, category, name, tagline, description, location, highlights, offer,
        to_char(featured_date, 'YYYY-MM-DD') AS "featuredDate", image_url AS "imageUrl",
        website_url AS "websiteUrl", more_info_url AS "moreInfoUrl",
        display_order AS "displayOrder", featured
      FROM venues WHERE active = TRUE ORDER BY CASE category
        WHEN 'Our partners' THEN 1 WHEN 'Desi luxe' THEN 2 WHEN 'Dinner to party' THEN 3
        WHEN 'Bars & night culture' THEN 4 WHEN 'Coffee' THEN 5 ELSE 6 END, display_order, name
    `) as unknown as Venue[];
    return rows;
  } catch (error) {
    if (isMissingVenueTable(error)) return [];
    throw error;
  }
});

export const listFeaturedVenues = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const sql = getSql();
    const rows = (await sql`
      SELECT id, slug, category, name, tagline, description, location, highlights, offer,
        to_char(featured_date, 'YYYY-MM-DD') AS "featuredDate", image_url AS "imageUrl",
        website_url AS "websiteUrl", more_info_url AS "moreInfoUrl",
        display_order AS "displayOrder", featured
      FROM venues WHERE active = TRUE AND featured = TRUE ORDER BY display_order, name LIMIT 12
    `) as unknown as Venue[];
    return rows;
  } catch (error) {
    if (isMissingVenueTable(error)) return [];
    throw error;
  }
});

export const getVenueBySlug = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    try {
      const sql = getSql();
      const rows = (await sql`
        SELECT id, slug, category, name, tagline, description, location, highlights, offer,
          to_char(featured_date, 'YYYY-MM-DD') AS "featuredDate", image_url AS "imageUrl",
          website_url AS "websiteUrl", more_info_url AS "moreInfoUrl",
          display_order AS "displayOrder", featured
        FROM venues WHERE active = TRUE AND slug = ${slug} LIMIT 1
      `) as unknown as Venue[];
      return rows[0] ?? null;
    } catch (error) {
      if (isMissingVenueTable(error)) return null;
      throw error;
    }
  });

export const getPeopleProfileById = createServerFn({ method: "GET" })
  .validator((profileKey: string) => profileKey)
  .handler(async ({ data: profileKey }) => {
    const sql = getSql();
    const byId = (await sql`
      SELECT id, category, name, role, subtitle, bio, image_url AS "imageUrl",
        instagram_url AS "instagramUrl", tiktok_url AS "tiktokUrl",
        youtube_url AS "youtubeUrl", x_url AS "xUrl", display_order AS "displayOrder"
      FROM people_profiles WHERE active = TRUE AND id = ${profileKey} LIMIT 1
    `) as unknown as PeopleProfile[];
    if (byId[0]) return byId[0];

    // Use the same slug normalization as the profile links so punctuation,
    // accents, and whitespace cannot make a valid name URL miss its record.
    const profiles = (await sql`
      SELECT id, category, name, role, subtitle, bio, image_url AS "imageUrl",
        instagram_url AS "instagramUrl", tiktok_url AS "tiktokUrl",
        youtube_url AS "youtubeUrl", x_url AS "xUrl", display_order AS "displayOrder"
      FROM people_profiles WHERE active = TRUE
    `) as unknown as PeopleProfile[];
    return profiles.find((profile) => profileSlug(profile.name) === profileKey) ?? null;
  });

export const getMemberRsvps = createServerFn({ method: "GET" }).handler(async () => {
  const member = await currentMember();
  if (!member) return {};
  const sql = getSql();
  const rows = (await sql`
    SELECT event_id, status AS state FROM event_rsvp_requests WHERE member_id = ${member.id}
  `) as unknown as { event_id: string; state: "pending" | "accepted" | "waitlisted" | "declined" }[];
  return Object.fromEntries(rows.map((row) => [row.event_id, row.state]));
});

export const submitEventRsvpRequest = createServerFn({ method: "POST" })
  .validator((input: { eventId: string; track: Track; guestNames: string[]; deliverablesAgreed: boolean }) => input)
  .handler(async ({ data }) => {
    const member = await currentMember();
    if (!member) throw new Error("Sign in with an approved member account to RSVP.");
    if (!Array.isArray(data.guestNames) || data.guestNames.length > 2 || data.guestNames.some((name) => typeof name !== "string" || name.trim().length < 2 || name.trim().length > 120)) {
      throw new Error("Add the full name for each guest, up to two guests.");
    }
    if (!(["Media", "Creators", "Tastemakers", "Private Circle"] as string[]).includes(data.track) || data.track !== member.track) {
      throw new Error("Choose the audience track on your approved member profile.");
    }
    const sql = getSql();
    const events = (await sql`
      SELECT id, title, date::text AS date, time, venue, tracks, status, influencer_deliverables
      FROM events WHERE id = ${data.eventId} LIMIT 1
    `) as unknown as { id: string; title: string; date: string; time: string; venue: string; tracks: Track[]; status: string; influencer_deliverables: string }[];
    const event = events[0];
    if (!event || event.status !== "published") throw new Error("This event is not accepting RSVP requests.");
    if (!event.tracks.includes(data.track)) throw new Error("This event is not open to your track.");
    if (data.track === "Creators" && event.influencer_deliverables.trim() && !data.deliverablesAgreed) {
      throw new Error("Please agree to the creator deliverables before submitting.");
    }
    const guestNames = data.guestNames.map((name) => name.trim());
    const rows = (await sql`
      INSERT INTO event_rsvp_requests (
        id, event_id, member_id, member_email, track, guest_names, deliverables_agreed, status
      ) VALUES (
        ${`rsvp-${randomBytes(16).toString("hex")}`}, ${event.id}, ${member.id}, ${member.email},
        ${data.track}, ${guestNames}, ${data.track === "Creators" ? data.deliverablesAgreed : false}, 'pending'
      )
      ON CONFLICT (event_id, member_id) DO UPDATE SET
        track = EXCLUDED.track,
        guest_names = EXCLUDED.guest_names,
        deliverables_agreed = EXCLUDED.deliverables_agreed,
        status = 'pending', reviewed_at = NULL, reviewed_by = NULL,
        created_at = NOW(), updated_at = NOW()
      WHERE event_rsvp_requests.status = 'declined'
      RETURNING status
    `) as unknown as { status: "pending" }[];
    if (!rows[0]) {
      const existing = (await sql`
        SELECT status FROM event_rsvp_requests WHERE event_id = ${event.id} AND member_id = ${member.id} LIMIT 1
      `) as unknown as { status: string }[];
      throw new Error(existing[0] ? `You already have an RSVP request for this event (${existing[0].status}).` : "Your RSVP request could not be saved.");
    }
    const details = [event.date, event.time, event.venue].filter(Boolean).join(" · ");
    const message = `Thank you for your RSVP request to ${event.title}. Our team is reviewing your profile. A request does not guarantee a place; we will email you when a decision is made.${details ? ` Event details: ${details}.` : ""}`;
    const delivery = await sendMemberEmail({
      to: member.email,
      subject: `RSVP request received · ${event.title}`,
      text: `Hello ${member.name},\n\n${message}\n\nWarm regards,\nThe RSVP DXB team`,
      html: memberEmailHtml(member.name, message),
    });
    return { status: "pending" as const, emailSent: delivery.sent };
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
        html: applicationConfirmationEmail(application.name),
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
        html: applicationAdminEmail({
          name: application.name,
          email: application.email,
          track: data.track,
          city: data.city.trim() || "Dubai",
          handle,
          followers,
          mobile,
          outlet,
          role: applicationRole,
          profiles: allProfiles,
          detail,
          id: application.id,
          ...(process.env["ADMIN_DASHBOARD_URL"] ? { dashboardUrl: process.env["ADMIN_DASHBOARD_URL"] } : {}),
        }),
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

export const updateMemberProfile = createServerFn({ method: "POST" })
  .validator((input: { name: string; city: string; mobile: string; instagram: string; followers: string }) => input)
  .handler(async ({ data }) => {
    const member = await currentMember();
    if (!member) throw new Error("Sign in to update your profile.");

    const name = data.name.trim().slice(0, 120);
    const city = data.city.trim().slice(0, 100);
    const digits = data.mobile.replace(/\D/g, "");
    const mobile = `${data.mobile.trim().startsWith("+") ? "+" : ""}${digits}`;
    const instagram = data.instagram.trim().replace(/^@+/, "").slice(0, 100);
    const followers = Number(data.followers.replace(/[ ,]/g, ""));

    if (!name) throw new Error("Enter your name.");
    if (!city) throw new Error("Enter your city.");
    if (digits.length < 8 || digits.length > 15) throw new Error("Enter a WhatsApp number with 8 to 15 digits, including the country code.");
    if (!Number.isSafeInteger(followers) || followers < 0) throw new Error("Enter a valid follower count.");

    const profileUrl = instagram ? `https://www.instagram.com/${encodeURIComponent(instagram)}/` : "";
    const sql = getSql();
    const rows = (await sql`
      UPDATE members
      SET name = ${name}, city = ${city}, mobile = ${mobile}, handle = ${instagram},
          profile_url = ${profileUrl}, followers = ${followers}
      WHERE id = ${member.id} AND status = 'approved'
      RETURNING id, name, email, track, points, rank, city, mobile, handle, followers
    `) as unknown as { id: string; name: string; email: string; track: Track; points: number; rank: string; city: string; mobile: string; handle: string; followers: number }[];
    if (!rows[0]) throw new Error("Your member profile could not be found.");
    return rows[0];
  });

export const requestMemberPasswordReset = createServerFn({ method: "POST" })
  .validator((input: { email: string }) => input)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      throw new Error("Enter a valid email address.");
    }

    const sql = getSql();
    const members = (await sql`
      SELECT id, name, email FROM members
      WHERE lower(email) = ${email} AND status = 'approved'
      LIMIT 1
    `) as unknown as { id: string; name: string; email: string }[];
    const member = members[0];
    if (!member) return { ok: true };

    // Limit reset email requests to one per member per minute.
    const recent = await sql`
      SELECT 1 FROM member_password_resets
      WHERE member_id = ${member.id} AND created_at > now() - interval '1 minute'
      LIMIT 1
    `;
    if (recent.length) return { ok: true };

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await sql`DELETE FROM member_password_resets WHERE member_id = ${member.id}`;
    await sql`
      INSERT INTO member_password_resets (token_hash, member_id, expires_at)
      VALUES (${tokenHash}, ${member.id}, now() + interval '30 minutes')
    `;

    const siteUrl = (process.env["PUBLIC_SITE_URL"] || "https://d25iiefhi451d5.cloudfront.net").replace(/\/$/, "");
    const resetUrl = `${siteUrl}/reset-password?token=${token}`;
    const delivery = await sendMemberEmail({
      to: member.email,
      from: process.env["RSVP_PASSWORD_RESET_FROM"] || "RSVP DXB <noreply@rsvpdxb.com>",
      subject: "Reset your RSVP DXB password",
      text: `Hello ${member.name},\n\nWe received a request to reset your RSVP DXB member password. Open this link within 30 minutes to choose a new password. It can be used once:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.\n\nThe RSVP DXB team`,
      html: memberPasswordResetEmail(member.name, resetUrl),
    });
    if (!delivery.sent) {
      await sql`DELETE FROM member_password_resets WHERE token_hash = ${tokenHash}`;
      console.error("Member password reset email could not be sent", delivery.reason);
    }

    // Always return the same response so the endpoint does not reveal account existence.
    return { ok: true };
  });

export const resetMemberPassword = createServerFn({ method: "POST" })
  .validator((input: { token: string; password: string }) => input)
  .handler(async ({ data }) => {
    if (!/^[a-f0-9]{64}$/i.test(data.token)) throw new Error("This reset link is invalid or expired. Request a new one.");
    if (data.password.length < 12 || data.password.length > 200) throw new Error("Password must be at least 12 characters.");
    const tokenHash = createHash("sha256").update(data.token).digest("hex");
    const passwordHash = await hashPassword(data.password);
    const sql = getSql();
    const rows = (await sql`
      WITH consumed AS (
        DELETE FROM member_password_resets
        WHERE token_hash = ${tokenHash} AND expires_at > now()
        RETURNING member_id
      ), changed AS (
        UPDATE members
        SET password_hash = ${passwordHash}
        FROM consumed
        WHERE members.id = consumed.member_id AND members.status = 'approved'
        RETURNING members.id
      ), revoked AS (
        DELETE FROM member_sessions WHERE member_id IN (SELECT id FROM changed)
        RETURNING member_id
      )
      SELECT id FROM changed
    `) as unknown as { id: string }[];
    if (!rows[0]) throw new Error("This reset link is invalid or expired. Request a new one.");
    await sql`DELETE FROM member_password_resets WHERE member_id = ${rows[0].id}`;
    return { ok: true };
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

