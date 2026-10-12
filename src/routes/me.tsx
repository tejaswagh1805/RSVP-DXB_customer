import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type React from "react";
import { QRCodeSVG } from "qrcode.react";
import { LayoutDashboard, CalendarDays, QrCode, Video, Award, UserRound, ArrowUpRight, Camera, Trash2 } from "lucide-react";
import { SitePage } from "@/components/SiteLayout";
import { EventImage } from "@/components/EventImage";
import { Badge, Button, Card, Field, PasswordInput, Stat, inputClass } from "@/components/ui-kit";
import { POINT_RULES, RANKS, formatDate, rankFor } from "@/lib/data";
import { useStore } from "@/lib/store";
import { getMemberRsvps, getMemberSession, updateEventRsvp } from "@/lib/database";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/me")({
  loader: async () => {
    const member = await getMemberSession();
    if (!member) throw redirect({ to: "/signin" });
    return { member, rsvps: await getMemberRsvps() };
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

function MemberArea() {
  const { profile, events, rsvps: demoRsvps, saved, hydrateMember } = useStore();
  const loaderData = Route.useLoaderData();
  const databaseRsvps = loaderData.rsvps;
  const persistRsvp = useServerFn(updateEventRsvp);
  const rsvps = { ...demoRsvps, ...databaseRsvps };
  const toggleRsvp = (eventId: string) => {
    if (!profile.signedIn) return;
    void persistRsvp({ data: { eventId, wantsGoing: rsvps[eventId] === "none" || !rsvps[eventId] } })
      .then(() => window.location.reload());
  };
  const [tab, setTab] = useState("Dashboard");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState("");
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [avatarMsg, setAvatarMsg] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
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

  const myEvents = events.filter((e) => (rsvps[e.id] ?? "none") !== "none");
  const rank = rankFor(profile.points);
  const nextRank = RANKS.find((r) => r.at > profile.points);
  const matched = events.filter(
    (e) => e.status === "published" && e.tracks.includes(profile.track) && !rsvps[e.id],
  );

  return (
    <SitePage>
      <div className="member-workspace">
        <aside className="member-sidebar">
          <p className="eyebrow">Your private space</p>
          <div className="member-avatar relative overflow-hidden">
            {avatar ? <img src={avatar} alt={profile.name} className="h-full w-full object-cover" /> : initials}
          </div>
          <h1 className="text-3xl">{profile.name}</h1><p className="mt-2 text-xs text-muted-foreground">{profile.track} · Dubai</p>
          <div className="mt-4 flex flex-wrap gap-2"><Badge tone="gold">{rank}</Badge><Badge tone={profile.approved ? "green" : "amber"}>{profile.approved ? "Approved" : "Pending review"}</Badge></div>
          <nav className="member-nav" aria-label="Member sections">{TABS.map((t, i) => { const Icon = TAB_ICONS[i] ?? UserRound; return <Button key={t} variant={tab === t ? "primary" : "ghost"} className="justify-start" onClick={() => setTab(t)}><Icon size={18} />{t}</Button>; })}</nav>
          <div className="member-rank"><Award size={24} /><p className="mt-3 font-display text-3xl">{profile.points} points</p><p className="mt-1 text-xs text-muted-foreground">{nextRank ? `${nextRank.at - profile.points} to ${nextRank.name}` : "Top tier unlocked"}</p><progress className="mt-4 w-full" value={profile.points} max={nextRank?.at ?? profile.points} /></div>
        </aside>
        <div className="member-content">
          <div className="member-content-heading"><div><p className="eyebrow">Member area / {tab}</p><h2 className="mt-2 text-4xl">{tab === "Dashboard" ? `Hello, ${profile.name.split(" ")[0]}.` : tab}</h2></div><Link to="/events"><Button variant="outline">Discover events <ArrowUpRight size={18} /></Button></Link></div>
        {tab === "Dashboard" ? (
          <div className="member-overview space-y-8">
            <div className="grid gap-4 sm:grid-cols-4">
              <Stat label="Upcoming" value={String(myEvents.length)} hint="Confirmed & waitlist" />
              <Stat label="Rank" value={rank} />
              <Stat label="Saved" value={String(saved.length)} />
              <Stat label="Content due" value="1" hint="Reel for Maison Dalia" />
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
                    <Button size="sm" onClick={() => toggleRsvp(e.id)}>
                      RSVP
                    </Button>
                    <Link to="/events/$eventId" params={{ eventId: e.id }}>
                      <Button size="sm" variant="ghost">
                        Details
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
                <Badge tone={rsvps[e.id] === "going" ? "green" : "amber"}>
                  {rsvps[e.id] === "going" ? "Confirmed" : "Waitlist"}
                </Badge>
                <Button size="sm" variant="outline">
                  Add to calendar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toggleRsvp(e.id)}>
                  Cancel
                </Button>
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
            {myEvents.map((e) => (
              <Card key={e.id} className="text-center">
                <p className="eyebrow">{e.brand}</p>
                <h3 className="mt-1 text-lg">{e.title}</h3>
                <div className="mx-auto mt-5 inline-block rounded-md bg-white p-2">
                  <QRCodeSVG value={`RSVP-DXB|${e.id}|${profile.email}|RSVP-4471`} size={128} />
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
            {myEvents.length === 0 ? (
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
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                <input className={inputClass} defaultValue={profile.name} />
              </Field>
              <Field label="Email">
                <input className={inputClass} defaultValue={profile.email} />
              </Field>
              <Field label="WhatsApp">
                <input className={inputClass} defaultValue="+971 50 123 4567" />
              </Field>
              <Field label="City">
                <input className={inputClass} defaultValue="Dubai" />
              </Field>
              <Field label="Instagram">
                <input className={inputClass} defaultValue="@tejas" />
              </Field>
              <Field label="Follower count">
                <input className={inputClass} defaultValue="128,000" />
              </Field>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button onClick={() => setProfileMsg("Changes saved.")}>Save changes</Button>
              {profileMsg ? <span className="text-sm text-primary">{profileMsg}</span> : null}
            </div>
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
