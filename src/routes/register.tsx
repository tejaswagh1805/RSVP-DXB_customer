import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type CSSProperties } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  AtSign,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Check,
  CircleUserRound,
  Compass,
  Instagram,
  KeyRound,
  Link2,
  Mail,
  MapPin,
  Newspaper,
  Phone,
  Sparkles,
  Utensils,
  UsersRound,
} from "lucide-react";
import { SitePage } from "@/components/SiteLayout";
import { Badge, Button, Card, Field, inputClass, PasswordInput } from "@/components/ui-kit";
import { TRACKS, type Track } from "@/lib/data";
import { submitApplication } from "@/lib/database";
import { getEmailValidationMessage } from "@/lib/email";
import { isValidPassword } from "@/lib/password";
import { formatPhoneNational, normalizeWhatsAppNumber, PHONE_COUNTRIES, type PhoneCountryCode } from "@/lib/phone";

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
      { property: "og:description", content: "Apply for RSVP DXB membership in three short steps." },
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

const TRACK_ICONS = {
  Media: Newspaper,
  Creators: Sparkles,
  Tastemakers: Utensils,
  "Private Circle": BadgeCheck,
} satisfies Record<Track, typeof Newspaper>;

const PROFILE_FIELD_ICONS: Record<string, typeof MapPin> = {
  City: MapPin,
  "Mobile / WhatsApp": Phone,
  Instagram: Instagram,
  "Follower count": UsersRound,
  Outlet: Building2,
  Role: BriefcaseBusiness,
  Subjects: Compass,
  "Recent work": Link2,
  "TikTok / YouTube": AtSign,
  Niche: Sparkles,
  Company: Building2,
  Industry: Compass,
  "Profession / company": BriefcaseBusiness,
  "Preferred events": Sparkles,
  "Assistant contact": Phone,
};

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
  const [emailNotice, setEmailNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [interests, setInterests] = useState<string[]>(["Dining"]);
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [whatsappNotice, setWhatsappNotice] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState<PhoneCountryCode>("+971");
  const passwordChecks = [password.length >= 8, /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9\s]/.test(password)];
  const passwordStrength = passwordChecks.filter(Boolean).length;
  const emailError = getEmailValidationMessage(email);
  const mobile = profileDetails["Mobile / WhatsApp"] ?? "";
  const selectedPhoneCountry = PHONE_COUNTRIES.find((country) => country.code === phoneCountryCode)!;
  const phoneError = mobile && !normalizeWhatsAppNumber(mobile, phoneCountryCode)
    ? `Enter a valid ${selectedPhoneCountry.country} mobile number with ${selectedPhoneCountry.digits} digits.`
    : whatsappOptIn && !mobile
      ? "Enter a WhatsApp number to receive the welcome message."
      : "";

  const toggleInterest = (i: string) =>
    setInterests((list) => (list.includes(i) ? list.filter((x) => x !== i) : [...list, i]));

  const setProfileDetail = (key: string, value: string) =>
    setProfileDetails((current) => ({ ...current, [key]: value }));

  const setPhoneNumber = (value: string) => {
    let digits = value.replace(/\D/g, "");
    const code = phoneCountryCode.replace(/\D/g, "");
    if (digits.startsWith("00")) digits = digits.slice(2);
    const nationalLength = selectedPhoneCountry.digits;
    const hasInternationalLength = digits.length === code.length + nationalLength ||
      Boolean(selectedPhoneCountry.trunk && digits.length === code.length + nationalLength + 1);
    if (digits.startsWith(code) && hasInternationalLength) digits = digits.slice(code.length);
    if (selectedPhoneCountry.trunk && digits.startsWith(selectedPhoneCountry.trunk) && digits.length === selectedPhoneCountry.digits + 1) digits = digits.slice(1);
    setProfileDetail("Mobile / WhatsApp", digits.slice(0, selectedPhoneCountry.digits));
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError("");
    const detail = Object.entries(profileDetails)
      .filter(([key, value]) => key !== "Instagram" && key !== "Follower count" && value.trim())
      .map(([key, value]) => `${key}: ${value.trim()}`)
      .join(" · ");
    try {
      const result = await submitToDatabase({
        data: {
          name,
          email,
          password,
          track,
          city,
          detail: [detail, `Interests: ${interests.join(", ")}`].filter(Boolean).join(" · "),
          instagramProfile: profileDetails["Instagram"] ?? "",
          instagramFollowers: profileDetails["Follower count"] ?? "",
          mobile: profileDetails["Mobile / WhatsApp"] ?? "",
          mobileCountryCode: phoneCountryCode,
          whatsappOptIn,
          outlet:
            profileDetails["Outlet"] ??
            profileDetails["Company"] ??
            profileDetails["Profession / company"] ??
            "",
          applicationRole: profileDetails["Role"] ?? profileDetails["Profession / company"] ?? "",
          platform: [
            "Instagram",
            profileDetails["TikTok / YouTube"]?.trim() ? "TikTok / YouTube" : "",
          ]
            .filter(Boolean)
            .join(", "),
          allProfiles: Object.entries(profileDetails)
            .filter(
              ([key, value]) =>
                value.trim() &&
                ![
                  "Instagram",
                  "Follower count",
                  "Mobile / WhatsApp",
                  "Outlet",
                  "Company",
                  "Profession / company",
                  "Role",
                ].includes(key),
            )
            .map(([key, value]) => `${key}: ${value.trim()}`)
            .join(" | "),
        },
      });
      setEmailNotice(
        result.emailSent
          ? `A confirmation email has been sent to ${email.trim()}. Please check your inbox and spam folder.`
          : "Your application is safely submitted for review. We could not send a confirmation email just now; please contact the RSVP DXB team if you need assistance.",
      );
      setWhatsappNotice(
        whatsappOptIn
          ? result.whatsappSent
            ? "Your WhatsApp welcome message was accepted for delivery."
            : "Your application was saved, but we could not send the WhatsApp welcome message right now. The team will follow up by email."
          : "",
      );
      setStep(5);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Application could not be submitted. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SitePage>
      <div className="customer-auth-content mx-auto w-full max-w-2xl px-5 py-20">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl">Register</h1>
          {step < 5 ? <Badge tone="gold">Step {step} of 3</Badge> : null}
        </div>

        <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(Math.min(step, 3) / 3) * 100}%` }}
          />
        </div>

        <Card className="register-card mt-8">
          {step === 1 ? (
            <div key="register-step-1" className="register-step-content">
              <h2 className="text-2xl">Create your account</h2>
              <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> Register with email
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="grid gap-4">
                <Field label="Full name" icon={<CircleUserRound size={15} />}>
                  <input
                    className={inputClass}
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </Field>
                <Field label="Email" icon={<Mail size={15} />}>
                  <input
                    className={`${inputClass} ${emailError ? "border-destructive" : ""}`}
                    required
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    aria-invalid={Boolean(emailError)}
                    aria-describedby={emailError ? "register-email-error" : undefined}
                  />
                  {emailError ? <p id="register-email-error" className="mt-2 text-xs text-destructive" role="alert">{emailError}</p> : null}
                </Field>
                <Field label="Password" icon={<KeyRound size={15} />}>
                  <PasswordInput
                    value={password}
                    onChange={setPassword}
                    autoComplete="new-password"
                    placeholder="Password"
                  />
                  <ul className="register-password-rules" aria-live="polite">
                    <li className={password.length >= 8 ? "is-met" : ""}>At least 8 characters</li>
                    <li className={/[A-Z]/.test(password) ? "is-met" : ""}>One capital letter</li>
                    <li className={/\d/.test(password) ? "is-met" : ""}>One number</li>
                    <li className={/[^A-Za-z0-9\s]/.test(password) ? "is-met" : ""}>One special character</li>
                  </ul>
                  <div className="register-password-strength" aria-label={`Password strength ${passwordStrength} of 4`}>
                    <div className="register-password-strength-track"><span style={{ width: `${passwordStrength * 25}%` }} /></div>
                    <span className={passwordStrength < 2 ? "is-weak" : passwordStrength < 4 ? "is-building" : "is-strong"}>
                      {passwordStrength === 0 ? "Password strength" : passwordStrength < 2 ? "Keep going" : passwordStrength < 4 ? "Getting stronger" : "Strong password"}
                    </span>
                  </div>
                </Field>
                <Button
                  variant="outline"
                  disabled={name.trim().length < 2 || Boolean(emailError) || !email.trim() || !isValidPassword(password)}
                  onClick={() => setStep(2)}
                >
                  Continue <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div key="register-step-2" className="register-step-content">
              <h2 className="text-2xl">Select your track</h2>
              <div className="mt-5 grid gap-3">
                {TRACKS.map((t) => {
                  const TrackIcon = TRACK_ICONS[t.name];
                  return (
                    <button
                      key={t.name}
                      onClick={() => setTrack(t.name)}
                      style={{ "--track-index": TRACKS.indexOf(t) } as CSSProperties}
                      className={`register-track-option rounded-lg border p-4 text-left transition-colors ${
                        track === t.name ? "border-primary bg-surface-2" : "border-border"
                      }`}
                      aria-pressed={track === t.name}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-3 font-display text-xl">
                          <span className="register-track-icon"><TrackIcon size={18} /></span>
                          {t.name}
                        </span>
                        <span className="flex items-center gap-2 text-xs text-primary">{t.blurb}{track === t.name ? <Check className="register-track-check" size={16} /> : null}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{t.detail}</p>
                    </button>
                  );
                })}
              </div>
              <Nav onBack={() => setStep(1)} onNext={() => setStep(3)} />
            </div>
          ) : null}

          {step === 3 ? (
            <div key="register-step-3" className="register-step-content">
              <h2 className="text-2xl">Complete your profile</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Fields shown are specific to the {track} track.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="City" icon={<MapPin size={15} />}>
                  <input
                    className={inputClass}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </Field>
                <Field label="Mobile / WhatsApp" icon={<Phone size={15} />}>
                  <div className={`register-phone-control ${phoneError ? "has-error" : ""}`}>
                    <select
                      className="register-phone-country"
                      value={phoneCountryCode}
                      onChange={(event) => setPhoneCountryCode(event.target.value as PhoneCountryCode)}
                      aria-label="Phone country code"
                    >
                      {PHONE_COUNTRIES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.code} · {item.country}
                        </option>
                      ))}
                    </select>
                    <input
                      className="register-phone-number"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      maxLength={24}
                      placeholder={selectedPhoneCountry.example}
                      value={formatPhoneNational(mobile, phoneCountryCode)}
                      onChange={(event) => setPhoneNumber(event.target.value)}
                      aria-invalid={Boolean(phoneError)}
                      aria-describedby={phoneError ? "register-phone-error" : "register-phone-help"}
                    />
                  </div>
                  <p id="register-phone-help" className="mt-2 text-xs text-muted-foreground">
                    Example: {phoneCountryCode} {selectedPhoneCountry.example} ({selectedPhoneCountry.digits} digits).
                  </p>
                  {phoneError ? <p id="register-phone-error" className="mt-2 text-xs text-destructive" role="alert">{phoneError}</p> : null}
                </Field>
                <Field label="Instagram profile" icon={<Instagram size={15} />}>
                  <input
                    className={inputClass}
                    placeholder="@yourhandle or instagram.com/yourhandle"
                    value={profileDetails["Instagram"] ?? ""}
                    onChange={(e) => setProfileDetail("Instagram", e.target.value)}
                    autoComplete="url"
                  />
                </Field>
                <Field label="Instagram follower count" icon={<UsersRound size={15} />}>
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="25000"
                    value={profileDetails["Follower count"] ?? ""}
                    onChange={(e) => setProfileDetail("Follower count", e.target.value)}
                  />
                </Field>
                <p className="text-xs text-muted-foreground sm:col-span-2">
                  Our membership team reviews your profile and follower count before making a
                  decision. Follower counts may be checked.
                </p>
                <label className="register-whatsapp-consent sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={whatsappOptIn}
                    onChange={(event) => setWhatsappOptIn(event.target.checked)}
                  />
                  <span>Send me a WhatsApp welcome message from RSVP DXB after I submit my application.</span>
                </label>
                {track === "Media" ? (
                  <>
                    <Field label="Outlet" icon={<Building2 size={15} />}>
                      <input
                        className={inputClass}
                        placeholder="Outlet"
                        value={profileDetails["Outlet"] ?? ""}
                        onChange={(e) => setProfileDetail("Outlet", e.target.value)}
                      />
                    </Field>
                    <Field label="Role" icon={<BriefcaseBusiness size={15} />}>
                      <input
                        className={inputClass}
                        placeholder="Role"
                        value={profileDetails["Role"] ?? ""}
                        onChange={(e) => setProfileDetail("Role", e.target.value)}
                      />
                    </Field>
                    <Field label="Subjects covered" icon={<Compass size={15} />}>
                      <input
                        className={inputClass}
                        placeholder="Food, travel, luxury"
                        value={profileDetails["Subjects"] ?? ""}
                        onChange={(e) => setProfileDetail("Subjects", e.target.value)}
                      />
                    </Field>
                    <Field label="Link to recent work" icon={<Link2 size={15} />}>
                      <input
                        className={inputClass}
                        placeholder="Link to recent work"
                        value={profileDetails["Recent work"] ?? ""}
                        onChange={(e) => setProfileDetail("Recent work", e.target.value)}
                      />
                    </Field>
                  </>
                ) : null}
                {track === "Creators" ? (
                  <>
                    <Field label="TikTok / YouTube" icon={<AtSign size={15} />}>
                      <input
                        className={inputClass}
                        placeholder="@handle"
                        value={profileDetails["TikTok / YouTube"] ?? ""}
                        onChange={(e) => setProfileDetail("TikTok / YouTube", e.target.value)}
                      />
                    </Field>
                    <Field label="Niche" icon={<Sparkles size={15} />}>
                      <input
                        className={inputClass}
                        placeholder="Fashion & lifestyle"
                        value={profileDetails["Niche"] ?? ""}
                        onChange={(e) => setProfileDetail("Niche", e.target.value)}
                      />
                    </Field>
                  </>
                ) : null}
                {track === "Tastemakers" ? (
                  <>
                    <Field label="Company" icon={<Building2 size={15} />}>
                      <input
                        className={inputClass}
                        placeholder="Company"
                        value={profileDetails["Company"] ?? ""}
                        onChange={(e) => setProfileDetail("Company", e.target.value)}
                      />
                    </Field>
                    <Field label="Role" icon={<BriefcaseBusiness size={15} />}>
                      <input
                        className={inputClass}
                        placeholder="Role"
                        value={profileDetails["Role"] ?? ""}
                        onChange={(e) => setProfileDetail("Role", e.target.value)}
                      />
                    </Field>
                    <Field label="Industry" icon={<Compass size={15} />}>
                      <input
                        className={inputClass}
                        placeholder="Hospitality"
                        value={profileDetails["Industry"] ?? ""}
                        onChange={(e) => setProfileDetail("Industry", e.target.value)}
                      />
                    </Field>
                  </>
                ) : null}
                {track === "Private Circle" ? (
                  <>
                    <Field label="Profession / company" icon={<BriefcaseBusiness size={15} />}>
                      <input
                        className={inputClass}
                        placeholder="Profession / company"
                        value={profileDetails["Profession / company"] ?? ""}
                        onChange={(e) => setProfileDetail("Profession / company", e.target.value)}
                      />
                    </Field>
                    <Field label="Preferred events" icon={<Sparkles size={15} />}>
                      <input
                        className={inputClass}
                        placeholder="Private dinners, previews"
                        value={profileDetails["Preferred events"] ?? ""}
                        onChange={(e) => setProfileDetail("Preferred events", e.target.value)}
                      />
                    </Field>
                    <Field label="Assistant contact" icon={<Phone size={15} />}>
                      <input
                        className={inputClass}
                        placeholder="Name & number"
                        value={profileDetails["Assistant contact"] ?? ""}
                        onChange={(e) => setProfileDetail("Assistant contact", e.target.value)}
                      />
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
                onNext={() => void submit()}
                nextLabel="Submit application"
                busy={submitting}
                busyLabel="Submitting…"
                disabled={
                  !profileDetails["Instagram"]?.trim() ||
                  !/^\d+$/.test(profileDetails["Follower count"]?.trim() ?? "") ||
                  Boolean(phoneError)
                }
              />
              {submitError ? (
                <p className="mt-3 text-sm text-destructive" role="alert">
                  {submitError}
                </p>
              ) : null}
              <p className="mt-3 text-xs text-muted-foreground">Application details are used to review your request. See our <Link to="/privacy" className="underline underline-offset-4">Privacy Policy</Link>.</p>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="register-success py-6 text-center" role="status" aria-live="polite">
              <div className="register-confetti" aria-hidden="true">
                {Array.from({ length: 16 }, (_, index) => <span key={index} />)}
              </div>
              <div className="register-success-icon" aria-hidden="true">✓</div>
              <p className="eyebrow mt-4">Congratulations, {name.trim().split(/\s+/)[0]}!</p>
              <Badge tone="amber">Pending review</Badge>
              <h2 className="mt-3 text-3xl">Your application is in</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Thank you for your interest in RSVP DXB. Our membership team will review your {track}
                profile and send an update to {email.trim()}, typically within 48 hours.
              </p>
              {emailNotice ? <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground" role="status">{emailNotice}</p> : null}
              {whatsappNotice ? <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground" role="status">{whatsappNotice}</p> : null}
              <div className="mt-8 flex justify-center gap-3">
                <Link to="/">
                  <Button className="register-success-cta">Back to RSVP DXB</Button>
                </Link>
              </div>
            </div>
          ) : null}
        </Card>
      </div>
    </SitePage>
  );
}

function Nav({
  onBack,
  onNext,
  disabled = false,
  nextLabel = "Continue",
  busy = false,
  busyLabel = "Please wait…",
}: {
  onBack: () => void;
  onNext: () => void;
  disabled?: boolean;
  nextLabel?: string;
  busy?: boolean;
  busyLabel?: string;
}) {
  return (
    <div className="mt-7 flex gap-3">
      <Button variant="outline" onClick={onBack}>
        Back
      </Button>
      <Button className="flex-1" onClick={onNext} disabled={disabled || busy}>
        {busy ? busyLabel : nextLabel}
      </Button>
    </div>
  );
}
