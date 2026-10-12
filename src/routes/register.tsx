import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SitePage } from "@/components/SiteLayout";
import { Badge, Button, Card, Field, inputClass, PasswordInput } from "@/components/ui-kit";
import { TRACKS, type Track } from "@/lib/data";
import { submitApplication } from "@/lib/database";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — RSVP DXB" },
      {
        name: "description",
        content:
          "Apply for RSVP DXB membership. Choose your track, complete your profile and get reviewed within 48 hours.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Register — RSVP DXB" },
      { property: "og:description", content: "Apply for RSVP DXB membership in four short steps." },
    ],
  }),
  component: RegisterPage,
});

const INTERESTS = [
  "Dining",
  "Fashion",
  "Beauty",
  "Property",
  "Art",
  "Music",
  "Travel",
  "Nightlife",
  "Wellness",
  "Motoring",
];

function RegisterPage() {
  const submitToDatabase = useServerFn(submitApplication);
  const [step, setStep] = useState(1);
  const [track, setTrack] = useState<Track>("Creators");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("Dubai");
  const [profileDetails, setProfileDetails] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [interests, setInterests] = useState<string[]>(["Dining"]);

  const toggleInterest = (i: string) =>
    setInterests((list) => (list.includes(i) ? list.filter((x) => x !== i) : [...list, i]));

  const setProfileDetail = (key: string, value: string) =>
    setProfileDetails((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    setSubmitting(true);
    setSubmitError("");
    const detail = Object.entries(profileDetails)
      .filter(([key, value]) => key !== "Instagram" && key !== "Follower count" && value.trim())
      .map(([key, value]) => `${key}: ${value.trim()}`)
      .join(" · ");
    try {
      await submitToDatabase({ data: {
        name,
        email,
        password,
        track,
        city,
        detail: [detail, `Interests: ${interests.join(", ")}`].filter(Boolean).join(" · "),
        instagramProfile: profileDetails["Instagram"] ?? "",
        instagramFollowers: profileDetails["Follower count"] ?? "",
        mobile: profileDetails["Mobile / WhatsApp"] ?? "",
        outlet: profileDetails["Outlet"] ?? profileDetails["Company"] ?? profileDetails["Profession / company"] ?? "",
        applicationRole: profileDetails["Role"] ?? profileDetails["Profession / company"] ?? "",
        platform: ["Instagram", profileDetails["TikTok / YouTube"]?.trim() ? "TikTok / YouTube" : ""].filter(Boolean).join(", "),
        allProfiles: Object.entries(profileDetails)
          .filter(([key, value]) => value.trim() && !["Instagram", "Follower count", "Mobile / WhatsApp", "Outlet", "Company", "Profession / company", "Role"].includes(key))
          .map(([key, value]) => `${key}: ${value.trim()}`).join(" | "),
      } });
      setStep(5);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Application could not be submitted. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SitePage>
      <div className="mx-auto w-full max-w-2xl px-5 py-20">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl">Register</h1>
          {step < 5 ? <Badge tone="gold">Step {step} of 4</Badge> : null}
        </div>

        <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(Math.min(step, 5) / 5) * 100}%` }}
          />
        </div>

        <Card className="mt-8">
          {step === 1 ? (
            <div>
              <h2 className="text-2xl">Create your account</h2>
              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> register with email
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid gap-4">
                <Field label="Full name">
                  <input
                    className={inputClass}
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </Field>
                <Field label="Email">
                  <input
                    className={inputClass}
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                  />
                </Field>
                <Field label="Password">
                  <PasswordInput value={password} onChange={setPassword} autoComplete="new-password" placeholder="At least 12 characters" />
                </Field>
                <Button variant="outline" disabled={!name.trim() || !email.trim() || password.length < 12} onClick={() => setStep(2)}>
                  Continue
                </Button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <h2 className="text-2xl">Select your track</h2>
              <div className="mt-5 grid gap-3">
                {TRACKS.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => setTrack(t.name)}
                    className={`rounded-lg border p-4 text-left transition-colors ${
                      track === t.name ? "border-primary bg-surface-2" : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-xl">{t.name}</span>
                      <span className="text-xs text-primary">{t.blurb}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{t.detail}</p>
                  </button>
                ))}
              </div>
              <Nav onBack={() => setStep(1)} onNext={() => setStep(3)} />
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <h2 className="text-2xl">Complete your profile</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Fields shown are specific to the {track} track.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="City">
                  <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} />
                </Field>
                <Field label="Mobile / WhatsApp">
                  <input className={inputClass} placeholder="+971 50 000 0000" value={profileDetails["Mobile / WhatsApp"] ?? ""} onChange={(e) => setProfileDetail("Mobile / WhatsApp", e.target.value)} />
                </Field>
                <Field label="Instagram profile">
                  <input className={inputClass} placeholder="@yourhandle or instagram.com/yourhandle" value={profileDetails["Instagram"] ?? ""} onChange={(e) => setProfileDetail("Instagram", e.target.value)} autoComplete="url" />
                </Field>
                <Field label="Instagram follower count">
                  <input className={inputClass} type="number" min="0" step="1" inputMode="numeric" placeholder="25000" value={profileDetails["Follower count"] ?? ""} onChange={(e) => setProfileDetail("Follower count", e.target.value)} />
                </Field>
                <p className="text-xs text-muted-foreground sm:col-span-2">
                  Our membership team reviews your profile and follower count before making a decision. Follower counts may be checked.
                </p>
                {track === "Media" ? (
                  <>
                    <Field label="Outlet">
                      <input className={inputClass} placeholder="Outlet" value={profileDetails["Outlet"] ?? ""} onChange={(e) => setProfileDetail("Outlet", e.target.value)} />
                    </Field>
                    <Field label="Role">
                      <input className={inputClass} placeholder="Role" value={profileDetails["Role"] ?? ""} onChange={(e) => setProfileDetail("Role", e.target.value)} />
                    </Field>
                    <Field label="Subjects covered">
                      <input className={inputClass} placeholder="Food, travel, luxury" value={profileDetails["Subjects"] ?? ""} onChange={(e) => setProfileDetail("Subjects", e.target.value)} />
                    </Field>
                    <Field label="Link to recent work">
                      <input className={inputClass} placeholder="Link to recent work" value={profileDetails["Recent work"] ?? ""} onChange={(e) => setProfileDetail("Recent work", e.target.value)} />
                    </Field>
                  </>
                ) : null}
                {track === "Creators" ? (
                  <>
                    <Field label="TikTok / YouTube">
                      <input className={inputClass} placeholder="@handle" value={profileDetails["TikTok / YouTube"] ?? ""} onChange={(e) => setProfileDetail("TikTok / YouTube", e.target.value)} />
                    </Field>
                    <Field label="Niche">
                      <input className={inputClass} placeholder="Fashion & lifestyle" value={profileDetails["Niche"] ?? ""} onChange={(e) => setProfileDetail("Niche", e.target.value)} />
                    </Field>
                  </>
                ) : null}
                {track === "Tastemakers" ? (
                  <>
                    <Field label="Company">
                      <input className={inputClass} placeholder="Company" value={profileDetails["Company"] ?? ""} onChange={(e) => setProfileDetail("Company", e.target.value)} />
                    </Field>
                    <Field label="Role">
                      <input className={inputClass} placeholder="Role" value={profileDetails["Role"] ?? ""} onChange={(e) => setProfileDetail("Role", e.target.value)} />
                    </Field>
                    <Field label="Industry">
                      <input className={inputClass} placeholder="Hospitality" value={profileDetails["Industry"] ?? ""} onChange={(e) => setProfileDetail("Industry", e.target.value)} />
                    </Field>
                  </>
                ) : null}
                {track === "Private Circle" ? (
                  <>
                    <Field label="Profession / company">
                      <input className={inputClass} placeholder="Profession / company" value={profileDetails["Profession / company"] ?? ""} onChange={(e) => setProfileDetail("Profession / company", e.target.value)} />
                    </Field>
                    <Field label="Preferred events">
                      <input className={inputClass} placeholder="Private dinners, previews" value={profileDetails["Preferred events"] ?? ""} onChange={(e) => setProfileDetail("Preferred events", e.target.value)} />
                    </Field>
                    <Field label="Assistant contact">
                      <input className={inputClass} placeholder="Name & number" value={profileDetails["Assistant contact"] ?? ""} onChange={(e) => setProfileDetail("Assistant contact", e.target.value)} />
                    </Field>
                  </>
                ) : null}
              </div>

              <div className="mt-6">
                <p className="eyebrow">Interests</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {INTERESTS.map((i) => (
                    <button
                      key={i}
                      onClick={() => toggleInterest(i)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        interests.includes(i)
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <Nav
                onBack={() => setStep(2)}
                onNext={() => setStep(4)}
                disabled={
                  !profileDetails["Instagram"]?.trim() ||
                  !/^\d+$/.test(profileDetails["Follower count"]?.trim() ?? "")
                }
              />
            </div>
          ) : null}

          {step === 4 ? (
            <div>
              <h2 className="text-2xl">How should we reach you?</h2>
              <div className="mt-5 space-y-3">
                {[
                  ["Email invitations", true],
                  ["WhatsApp invitations", true],
                  ["Event reminders", true],
                  ["Press releases (Media only)", track === "Media"],
                  ["Member offers", true],
                ].map(([label, on]) => (
                  <label
                    key={String(label)}
                    className="flex items-center justify-between rounded-md bg-surface-2 px-4 py-3 text-sm"
                  >
                    {label}
                    <input type="checkbox" defaultChecked={Boolean(on)} className="h-4 w-4 accent-[var(--primary)]" />
                  </label>
                ))}
              </div>
              <p className="mt-5 text-xs text-muted-foreground">
                Every profile is reviewed by our team. We normally answer within 48 hours.
              </p>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button className="flex-1" onClick={() => void submit()} disabled={submitting || !name.trim() || !email.trim() || password.length < 12 || !profileDetails["Instagram"]?.trim() || !/^\d+$/.test(profileDetails["Follower count"]?.trim() ?? "")}>
                  {submitting ? "Submitting…" : "Submit application"}
                </Button>
              </div>
              {submitError ? <p className="mt-3 text-sm text-destructive" role="alert">{submitError}</p> : null}
            </div>
          ) : null}

          {step === 5 ? (
            <div className="py-6 text-center">
              <Badge tone="amber">Pending review</Badge>
              <h2 className="mt-4 text-3xl">Application submitted</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Thank you. Your {track} application is saved for the team to review. We normally respond within 48 hours.
              </p>
              <div className="mt-8 flex justify-center gap-3">
                <Link to="/">
                  <Button>Back to RSVP DXB</Button>
                </Link>
              </div>
            </div>
          ) : null}
        </Card>
      </div>
    </SitePage>
  );
}

function Nav({ onBack, onNext, disabled = false }: { onBack: () => void; onNext: () => void; disabled?: boolean }) {
  return (
    <div className="mt-7 flex gap-3">
      <Button variant="outline" onClick={onBack}>
        Back
      </Button>
      <Button className="flex-1" onClick={onNext} disabled={disabled}>
        Continue
      </Button>
    </div>
  );
}
