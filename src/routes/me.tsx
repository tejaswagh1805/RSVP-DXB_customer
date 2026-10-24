import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { QRCodeSVG } from "qrcode.react";
import { LayoutDashboard, CalendarDays, QrCode, Video, Award, UserRound, ArrowUpRight, Camera, Trash2, Bell, Settings, Crown, LockKeyhole, MapPin, MessageCircle, WalletCards, TrendingUp, Ticket, Clock3, Headphones, Mail, Home, ChevronDown, X } from "lucide-react";
import { SitePage } from "@/components/SiteLayout";
import { EventImage } from "@/components/EventImage";
import { Badge, Button, Card, Field, PasswordInput, Stat, inputClass } from "@/components/ui-kit";
import { POINT_RULES, RANKS, formatDate, rankFor } from "@/lib/data";
import { useStore } from "@/lib/store";
import { getMemberRsvps, getMemberSession, listPublishedEvents, updateMemberProfile } from "@/lib/database";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/me")({
  loader: async () => {
    const member = await getMemberSession();
    if (!member) throw redirect({ to: "/signin" });
    const [rsvps, events] = await Promise.all([getMemberRsvps(), listPublishedEvents()]);
    return { member, rsvps, events };
  },
  head: () => ({
    meta: [
      { title: "Member area — RSVP DXB" },
      {
        name: "description",
        content: "Your RSVPs, digital pass, content submissions, points and rewards.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Member area — RSVP DXB" },
      { property: "og:description", content: "Your RSVPs, pass, points and rewards at RSVP DXB." },
    ],
  }),
  component: MemberArea,
});

const TABS = ["Dashboard", "My RSVPs", "My Pass", "My Content", "Points", "Profile"];
const TAB_ICONS = [LayoutDashboard, CalendarDays, QrCode, Video, Award, UserRound];

function AnimatedNumber({ value, prefix = "", compact = false }: { value: number; prefix?: string; compact?: boolean }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setDisplay(value);
      return;
    }
    let frame = 0;
    const duration = 1100;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 4;
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [value]);
  const formatted = compact ? `${Math.round(display / 1000)}K` : display.toLocaleString();
  return <strong className="member-kpi-number" aria-label={`${prefix}${value.toLocaleString()}`}>{prefix}{formatted}</strong>;
}

function MemberArea() {
  const { profile, saved, hydrateMember } = useStore();
  const loaderData = Route.useLoaderData();
  const databaseRsvps = loaderData.rsvps;
  const dashboardEvents = loaderData.events;
  const persistProfile = useServerFn(updateMemberProfile);
  const rsvps = databaseRsvps;
  const [tab, setTab] = useState("Dashboard");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState("");
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [avatarMsg, setAvatarMsg] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [profileForm, setProfileForm] = useState(() => ({
    name: loaderData.member.name,
    city: loaderData.member.city || "",
    mobile: loaderData.member.mobile || "",
    instagram: loaderData.member.handle || "",
    followers: String(loaderData.member.followers ?? 0),
  }));
  useEffect(() => { hydrateMember(loaderData.member); }, [hydrateMember, loaderData.member]);
  useEffect(() => { setAvatar(localStorage.getItem("rsvp-dxb-avatar")); }, []);
  const initials = profile.name.split(" ").map((n) => n[0]).join("");
  const saveAvatar = (v: string | null) => {
    setAvatar(v);
    setAvatarMsg(v ? "Saved automatically — you're all set." : "");
    try { if (v) localStorage.setItem("rsvp-dxb-avatar", v); else localStorage.removeItem("rsvp-dxb-avatar"); } catch { /* storage full */ }
  };
  const onPickAvatar = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0];
    ev.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) return setAvatarError("Please choose an image file.");
    if (f.size > 2 * 1024 * 1024) return setAvatarError("Image must be under 2 MB.");
    setAvatarError("");
    const r = new FileReader();
    r.onload = () => saveAvatar(String(r.result));
    r.readAsDataURL(f);
  };
  const onChangePassword = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!pw.current) return setPwMsg({ ok: false, text: "Enter your current password." });
    if (pw.next.length < 8) return setPwMsg({ ok: false, text: "New password must be at least 8 characters." });
    if (pw.next !== pw.confirm) return setPwMsg({ ok: false, text: "New passwords don't match." });
    setPw({ current: "", next: "", confirm: "" });
    setPwMsg({ ok: true, text: "Password updated." });
  };
  const onSaveProfile = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setProfileSaving(true);
    setProfileMsg("");
    try {
      const updated = await persistProfile({ data: profileForm });
      setProfileForm({
        name: updated.name,
        city: updated.city,
        mobile: updated.mobile,
        instagram: updated.handle,
        followers: String(updated.followers),
      });
      hydrateMember({ id: updated.id, name: updated.name, email: updated.email, track: updated.track, points: updated.points, approved: true });
      setProfileMsg("Profile saved to your account.");
    } catch (error) {
      setProfileMsg(error instanceof Error ? error.message : "Could not save your profile. Please try again.");
    } finally {
      setProfileSaving(false);
    }
  };

  const myEvents = dashboardEvents.filter((e) => (rsvps[e.id] ?? "none") !== "none");
  const rank = rankFor(profile.points);
  const nextRank = RANKS.find((r) => r.at > profile.points);
  const matched = dashboardEvents.filter(
    (e) => e.status === "published" && e.tracks.includes(profile.track) && (!rsvps[e.id] || rsvps[e.id] === "declined"),
  );
  const wishlistEvents = useMemo(() => dashboardEvents.filter((event) => saved.includes(event.id)), [dashboardEvents, saved]);
  const upcomingEvent = wishlistEvents[0] ?? matched[0] ?? dashboardEvents.find((e) => e.status === "published");
  const activityEvents = useMemo(() => myEvents.slice().sort((a, b) => b.date.localeCompare(a.date)), [myEvents]);
  const inviteCount = matched.length;

  return (
    <SitePage>
      <div className={`member-workspace${tab === "Dashboard" ? " member-dashboard-workspace" : ""}`}>
        <aside className="member-sidebar">
          <p className="member-menu-label">Menu</p>
          <nav className="member-nav" aria-label="Member sections">{TABS.map((t, i) => { const Icon = TAB_ICONS[i] ?? UserRound; return <Button key={t} variant={tab === t ? "primary" : "ghost"} className="justify-start" onClick={() => setTab(t)}><Icon size={18} />{t}</Button>; })}</nav>
          <p className="member-menu-label member-account-label">Account</p>
          <nav className="member-nav member-account-nav" aria-label="Account settings">
            <Button variant={tab === "My Pass" ? "primary" : "ghost"} className="justify-start" onClick={() => setTab("My Pass")}><WalletCards size={18} />VIP Black Card <span className="member-nav-spark">✦</span></Button>
            <Button variant={tab === "Profile" ? "primary" : "ghost"} className="justify-start" onClick={() => setTab("Profile")}><Settings size={18} />Settings</Button>
          </nav>
          <div className="member-since-card"><span>Member since</span><strong>January 2023</strong><Badge tone="gold">Tier: {rank.toUpperCase()}</Badge></div>
        </aside>
        <div className="member-content">
          {tab === "Dashboard" ? <div className="member-topbar"><div className="member-search"><span>⌕</span>Search guests, events, venues...</div><div className="member-top-actions"><div className="member-popover-anchor"><button className="member-icon-action" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen((open) => !open); setAccountMenuOpen(false); }}><Bell size={20} />{activityEvents.length > 0 ? <i>{activityEvents.length}</i> : null}</button>{notificationsOpen ? <div className="member-popover member-notifications" role="dialog" aria-label="Recent RSVP activity"><div className="member-popover-heading"><strong>Recent RSVP activity</strong><button aria-label="Close notifications" onClick={() => setNotificationsOpen(false)}><X size={16} /></button></div>{activityEvents.length ? activityEvents.slice(0, 5).map((event) => <button className="member-notification-item" key={event.id} onClick={() => { setTab("My RSVPs"); setNotificationsOpen(false); }}><span><b>{event.title}</b><small>{({ pending: "Request pending", accepted: "Request accepted", waitlisted: "Added to waitlist", declined: "Request declined", going: "You're attending", waitlist: "Added to waitlist" } as Record<string, string>)[rsvps[event.id] ?? ""] ?? "RSVP updated"} · {formatDate(event.date)}</small></span><ArrowUpRight size={15} /></button>) : <p className="member-notification-empty">No RSVP updates yet. Your event request updates will appear here.</p>}<button className="member-popover-link" onClick={() => { setTab("My RSVPs"); setNotificationsOpen(false); }}>View my RSVPs <ArrowUpRight size={14} /></button></div> : null}</div><button className="member-icon-action" aria-label="Settings" onClick={() => setTab("Profile")}><Settings size={20} /></button><div className="member-popover-anchor"><button className="member-account-trigger" aria-expanded={accountMenuOpen} onClick={() => { setAccountMenuOpen((open) => !open); setNotificationsOpen(false); }}><span className="member-top-avatar">{avatar ? <img src={avatar} alt="" /> : initials.slice(0, 1)}</span><strong>{profile.name.split(" ")[0]}</strong><ChevronDown size={15} /></button>{accountMenuOpen ? <div className="member-popover member-account-menu" role="menu"><div className="member-account-summary"><b>{profile.name}</b><small>{profile.email}</small></div><button role="menuitem" onClick={() => { setTab("Profile"); setAccountMenuOpen(false); }}>My profile</button><button role="menuitem" onClick={() => { setTab("My RSVPs"); setAccountMenuOpen(false); }}>My RSVPs</button><button role="menuitem" onClick={() => { setTab("My Pass"); setAccountMenuOpen(false); }}>My pass</button></div> : null}</div></div></div> : null}
          <div className="member-content-heading"><div><p className="eyebrow">{tab === "Dashboard" ? "RSVP DXB  •  Exclusive Client Dashboard  •  Dubai, UAE  •  22 Oct 2024 — 19:32 GST" : `Member area / ${tab}`}</p><h2 className="mt-2 text-4xl">{tab === "Dashboard" ? `Welcome back, ${profile.name}.` : tab}</h2></div>{tab === "Dashboard" ? <div className="member-heading-actions"><Link to="/events"><Button>＋ New Invite</Button></Link><a href="https://wa.me/?text=Hi%20RSVP%20DXB" target="_blank" rel="noreferrer"><Button variant="outline"><MessageCircle size={17} />Private Concierge Chat</Button></a></div> : <Link to="/events"><Button variant="outline">Discover events <ArrowUpRight size={18} /></Button></Link>}</div>
        {tab === "Dashboard" ? (
          <div className="member-overview space-y-8">
            <div className="member-dashboard-grid">
              <div className="member-dashboard-main">
                <div className="member-kpis">
                  <Card><TrendingUp size={19} /><b>Total RSVPs</b><AnimatedNumber value={1248 + myEvents.length} /><span>↑ 12.4% vs last month</span><small>↑ +136 this week</small></Card>
                  <Card><Crown size={19} /><b>VIP Guests</b><AnimatedNumber value={profile.points ? Math.max(96, Math.floor(profile.points / 26)) : 96} /><span>{rank} member tier</span><small>+8 new this week</small></Card>
                  <Card><Clock3 size={19} /><b>Pending Invites</b><AnimatedNumber value={Math.max(inviteCount, matched.length)} /><span>Awaiting confirmation</span><small>Response rate 78%</small></Card>
                  <Card><WalletCards size={19} /><b>Revenue</b><AnimatedNumber value={182000} prefix="AED " compact /><span>+22% vs last month</span><small>Avg. spend AED 1.9K</small></Card>
                </div>
                <div className="member-feature-grid">
                  <Card className="member-black-card"><h3>✦ VIP BLACK CARD</h3><div className="member-card-art"><span>RSVP DXB</span><strong>{profile.name.toUpperCase()} · {rank.toUpperCase()}</strong><small>•••• 9924</small><i>◉ NFC TAP · VALID 09/27</i></div><p className="member-auth-note">Tap to authenticate · Secure · Wallet Enabled</p><b>{rank.toUpperCase()} #4 CHAMPAGNE PEARL DROP —</b><div className="member-pearl-row"><span>🟤</span><p>Unlock #4 available —<br />1 of 5 Pearl Drops</p><strong>80%</strong></div><progress value="80" max="100" /><small>Unlocks in 02:14:33 · <button onClick={() => setTab("Points")}>Unlock Now</button></small></Card>
                  <Card className="member-locked-card"><h3><LockKeyhole size={17} /> {wishlistEvents.length ? "SAVED TO YOUR WISHLIST" : "INVITE-ONLY LOCKED EVENTS"}</h3>{upcomingEvent ? <><div className="member-event-art" style={{ backgroundImage: `linear-gradient(90deg, rgba(30,20,12,.78), rgba(30,20,12,.08)), url(${upcomingEvent.image})` }}><b>{upcomingEvent.title}</b><span>{upcomingEvent.venue}</span><em>{wishlistEvents.some((event) => event.id === upcomingEvent.id) ? "SAVED EVENT" : `MATCHED FOR ${profile.track.toUpperCase()}`}</em><small>Date: {formatDate(upcomingEvent.date)} · {upcomingEvent.time} · {Math.max(0, upcomingEvent.capacity - upcomingEvent.confirmed)} spots left</small></div><div className="member-request-footer"><Link to="/events/$eventId" params={{ eventId: upcomingEvent.id }}><Button>{rsvps[upcomingEvent.id] && rsvps[upcomingEvent.id] !== "declined" ? "View request" : "Request Access"}<ArrowUpRight size={16} /></Button></Link></div></> : <div className="member-empty-event"><p>No published events are available right now.</p><Link to="/events"><Button variant="outline">Browse events <ArrowUpRight size={15} /></Button></Link></div>}</Card>
                </div>
                <p className="member-skyline-caption">DUBAI SKYLINE <span>•</span> UPCOMING: {upcomingEvent?.title ?? "Gala Night 30 Oct"}</p>
              </div>
              <div className="member-dashboard-rail">
                <Card className="member-guest-list"><h3><WalletCards size={20} /> LIVE GUEST LIST</h3><p className="member-guest-count">{32 + myEvents.length} guests checked in · Updated 2m ago</p>{["Omar K.", "Sophia L.", "Hiro T.", "Ahmed S."].map((guest, i) => <div className="member-guest" key={guest}><span>{i === 2 ? <Clock3 size={18} /> : i === 3 ? <LockKeyhole size={17} /> : <Crown size={17} />}</span><p><b>{guest}</b><small>{["Arrived · Table 7", "VIP · Terrace", "En route · 5min", "VIP · Private"][i]}</small></p>{i === 1 ? <Crown size={16} /> : null}</div>)}<button className="member-view-guests" onClick={() => setTab("My RSVPs")}>View all {96 + myEvents.length} guests →</button></Card>
                <Card className="member-venue-card"><h3><MapPin size={20} /> SECRET VENUE MAP —</h3><small>CONFIDENTIAL</small><div className="member-map-art"><MapPin /><MapPin /><MapPin /><MapPin /><MapPin /><MapPin /></div><div className="member-map-labels"><b>Palace Beach<small>Private</small></b><b>Skypool Lounge<small>Invitation Only</small></b><b>Desert Club<small>Hidden</small></b></div><p>Map is confidential · Share disabled</p></Card>
                <button className="member-ticket" onClick={() => setTab("My Pass")}><span><Ticket size={22} /> HOLOGRAPHIC TICKET<br />GALA NIGHT 30 OCT<small>ADMIT ONE · TABLE 4 · DOORCODE #9941</small></span><QrCode size={54} /></button>
              </div>
            </div>

            <div>
              <h2 className="text-2xl">Matched for you</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Events open to {profile.track} that you have not responded to yet.
              </p>
              <div className="mt-5 space-y-3">
                {matched.map((e) => (
                  <Card key={e.id} className="flex flex-wrap items-center gap-4">
                    <EventImage event={e} className="h-12 w-16 shrink-0 rounded" />
                    <div className="flex-1">
                      <p className="text-sm">{e.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(e.date)} · {e.time} · {e.area}
                      </p>
                    </div>
                    <Link to="/events/$eventId" params={{ eventId: e.id }}>
                      <Button size="sm">
                        Request RSVP
                      </Button>
                    </Link>
                  </Card>
                ))}
                {matched.length === 0 ? (
                  <p className="text-sm text-muted-foreground">You are up to date.</p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {tab === "My RSVPs" ? (
          <div className="space-y-3">
            {myEvents.map((e) => (
              <Card key={e.id} className="flex flex-wrap items-center gap-4">
                <EventImage event={e} className="h-12 w-16 shrink-0 rounded" />
                <div className="flex-1">
                  <p className="text-sm">{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(e.date)} · {e.time} · {e.venue}
                  </p>
                </div>
                <Badge tone={rsvps[e.id] === "accepted" || rsvps[e.id] === "going" ? "green" : rsvps[e.id] === "declined" ? "red" : "amber"}>
                  {{ pending: "Pending review", accepted: "Accepted", waitlisted: "Waitlisted", declined: "Declined", going: "Accepted", waitlist: "Waitlisted" }[rsvps[e.id] ?? "pending"] ?? "Pending review"}
                </Badge>
                <Link to="/events/$eventId" params={{ eventId: e.id }}><Button size="sm" variant="outline">Event details</Button></Link>
              </Card>
            ))}
            {myEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No RSVPs yet.{" "}
                <Link to="/events" className="text-primary">
                  Browse events
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}

        {tab === "My Pass" ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="text-center">
              <p className="eyebrow">Member pass</p>
              <h3 className="mt-1 text-lg">{profile.name}</h3>
              <div className="mx-auto mt-5 inline-block rounded-md bg-white p-2">
                <QRCodeSVG value={`RSVP-DXB|MEMBER|${profile.email}|RSVP-TEJAS`} size={128} />
              </div>
              <p className="mt-4 text-sm">{rank} member</p>
              <p className="text-xs text-muted-foreground">Show at the door · RSVP-TEJAS</p>
            </Card>
            {myEvents.filter((event) => rsvps[event.id] === "accepted" || rsvps[event.id] === "going").map((e) => (
              <Card key={e.id} className="text-center">
                <p className="eyebrow">{e.brand}</p>
                <h3 className="mt-1 text-lg">{e.title}</h3>
                <div className="mx-auto mt-5 inline-block rounded-md bg-white p-2">
                  <span className="px-5 py-10 text-sm font-semibold text-primary">RSVP ACCEPTED</span>
                </div>
                <p className="mt-4 text-sm">{profile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(e.date)} · Entry for 1 · RSVP-4471
                </p>
                <div className="mt-4 grid gap-2">
                  <Button size="sm" variant="outline">
                    Add to Apple Wallet
                  </Button>
                  <Button size="sm" variant="ghost">
                    Add to Google Wallet
                  </Button>
                </div>
              </Card>
            ))}
            {!myEvents.some((event) => rsvps[event.id] === "accepted" || rsvps[event.id] === "going") ? (
              <p className="text-sm text-muted-foreground">Your pass appears once you RSVP.</p>
            ) : null}
          </div>
        ) : null}

        {tab === "My Content" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="text-2xl">Submit content</h2>
              <div className="mt-5 grid gap-4">
                <Field label="Event">
                  <select className={inputClass}>
                    {events.slice(0, 4).map((e) => (
                      <option key={e.id}>{e.title}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Type">
                  <select className={inputClass}>
                    <option>Story</option>
                    <option>Reel</option>
                    <option>Post</option>
                    <option>TikTok</option>
                    <option>YouTube</option>
                    <option>Article</option>
                    <option>Google review</option>
                    <option>Screenshot</option>
                  </select>
                </Field>
                <Field label="Link">
                  <input className={inputClass} placeholder="https://" />
                </Field>
                <Button>Submit for review</Button>
              </div>
            </Card>
            <Card>
              <h2 className="text-2xl">Submissions</h2>
              <div className="mt-5 space-y-3">
                {[
                  ["Reel — Sunset Listening Session", "Approved", "+25"],
                  ["Story — Chef's Table", "Approved", "+15"],
                  ["Google review — Sirene", "Pending", "—"],
                ].map(([label, status, pts]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-md bg-surface-2 px-4 py-3 text-sm"
                  >
                    <span>{label}</span>
                    <span className="flex items-center gap-3">
                      <Badge tone={status === "Approved" ? "green" : "amber"}>{status}</Badge>
                      <span className="text-primary">{pts}</span>
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : null}

        {tab === "Points" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <p className="eyebrow">How to earn</p>
              <ul className="mt-4 divide-y divide-border">
                {POINT_RULES.map((r) => (
                  <li key={r.label} className="flex justify-between py-2.5 text-sm">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="text-primary">+{r.points}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <p className="eyebrow">Your progress</p>
              <p className="mt-3 font-display text-5xl text-primary">{profile.points}</p>
              <div className="mt-5 space-y-3">
                {RANKS.map((r) => (
                  <div key={r.name} className="flex items-center justify-between rounded-md bg-surface-2 px-4 py-3">
                    <span className="font-display text-lg">{r.name}</span>
                    <Badge tone={profile.points >= r.at ? "green" : "muted"}>
                      {profile.points >= r.at ? "Unlocked" : `${r.at.toLocaleString()} pts`}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-md border border-primary/30 p-4">
                <p className="eyebrow">Refer a friend</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your code <span className="text-primary">RSVP-TEJAS</span> — +100 points per
                  approved referral.
                </p>
              </div>
            </Card>
          </div>
        ) : null}

        {tab === "Profile" ? (
          <div className="grid max-w-3xl gap-6">
          <Card>
            <h2 className="text-2xl">Profile picture</h2>
            <div className="mt-5 flex flex-wrap items-center gap-5">
              <div className="member-avatar !m-0 overflow-hidden">{avatar ? <img src={avatar} alt={profile.name} className="h-full w-full object-cover" /> : initials}</div>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex"><input type="file" accept="image/*" className="sr-only" onChange={onPickAvatar} /><span className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary"><Camera size={16} />{avatar ? "Change picture" : "Upload picture"}</span></label>
                {avatar ? <Button variant="ghost" onClick={() => saveAvatar(null)}><Trash2 size={16} />Remove</Button> : null}
              </div>
              <p className="w-full text-xs text-muted-foreground">JPG or PNG, up to 2 MB. Saved automatically — no save button needed.</p>
              {avatarMsg ? <p className="w-full text-sm text-primary">{avatarMsg}</p> : null}
              {avatarError ? <p className="w-full text-xs text-destructive">{avatarError}</p> : null}
            </div>
          </Card>
          <Card>
            <h2 className="text-2xl">Profile & settings</h2>
            <form className="mt-5" onSubmit={onSaveProfile}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                <input className={inputClass} autoComplete="name" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} required maxLength={120} />
              </Field>
              <Field label="Email">
                <input className={inputClass} type="email" value={profile.email} readOnly aria-readonly="true" />
              </Field>
              <Field label="WhatsApp">
                <input className={inputClass} type="tel" autoComplete="tel" placeholder="Include country code, e.g. +971…" value={profileForm.mobile} onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })} required />
              </Field>
              <Field label="City">
                <input className={inputClass} autoComplete="address-level2" value={profileForm.city} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} required maxLength={100} />
              </Field>
              <Field label="Instagram">
                <input className={inputClass} autoComplete="off" placeholder="Instagram username" value={profileForm.instagram} onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })} maxLength={100} />
              </Field>
              <Field label="Follower count">
                <input className={inputClass} inputMode="numeric" value={profileForm.followers} onChange={(e) => setProfileForm({ ...profileForm, followers: e.target.value })} required />
              </Field>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button type="submit" disabled={profileSaving}>{profileSaving ? "Saving…" : "Save changes"}</Button>
              {profileMsg ? <span className={`text-sm ${profileMsg.startsWith("Profile saved") ? "text-primary" : "text-destructive"}`} role="status">{profileMsg}</span> : null}
            </div>
            </form>
          </Card>
          <Card>
            <h2 className="text-2xl">Update password</h2>
            <form className="mt-5 grid gap-4" onSubmit={onChangePassword}>
              <Field label="Current password"><PasswordInput value={pw.current} onChange={(v) => setPw({ ...pw, current: v })} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="New password"><PasswordInput autoComplete="new-password" value={pw.next} onChange={(v) => setPw({ ...pw, next: v })} /></Field>
                <Field label="Confirm new password"><PasswordInput autoComplete="new-password" value={pw.confirm} onChange={(v) => setPw({ ...pw, confirm: v })} /></Field>
              </div>
              {pwMsg ? <p className={`text-sm ${pwMsg.ok ? "text-primary" : "text-destructive"}`}>{pwMsg.text}</p> : null}
              <div><Button type="submit">Update password</Button></div>
            </form>
          </Card>
          </div>
        ) : null}
        </div>
      </div>
    </SitePage>
  );
}
