import { useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Copy, Mail, MessageCircle, TicketCheck } from "lucide-react";
import type { EventItem } from "@/lib/data";
import { submitEventTicketInquiry } from "@/lib/database";
import { Button, inputClass } from "@/components/ui-kit";

export function EventTicketInquiryForm({ event, requestType = "ticket", onSubmitted }: { event: EventItem; requestType?: "ticket" | "creator_pass"; onSubmitted?: () => void }) {
  const submitInquiry = useServerFn(submitEventTicketInquiry);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [instagramFollowers, setInstagramFollowers] = useState("");
  const [creatorAddress, setCreatorAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const whatsappNumber = String(import.meta.env["VITE_RSVP_WHATSAPP_NUMBER"] || "").replace(/\D/g, "");

  useEffect(() => {
    if (!submitted || requestType !== "creator_pass" || !onSubmitted) return;
    const timeout = window.setTimeout(onSubmitted, 4000);
    return () => window.clearTimeout(timeout);
  }, [submitted, requestType, onSubmitted]);

  const submit = async (form: FormEvent<HTMLFormElement>) => {
    form.preventDefault();
    setError("");
    const normalizedPhone = phone.replace(/[\s().-]/g, "");
    if (!name.trim()) return setError("Enter your name.");
    if (!/^\+?[\d]{8,15}$/.test(normalizedPhone)) return setError("Enter a valid phone number with country code, such as +971501234567.");
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email address or leave it blank.");
    setBusy(true);
    try {
      await submitInquiry({ data: {
        eventId: event.id,
        name: name.trim(),
        email: email.trim(),
        phone: normalizedPhone,
        instagramHandle: instagramHandle.trim(),
        instagramFollowers: instagramFollowers.trim(),
        creatorAddress: creatorAddress.trim(),
        requestType,
      } });
      setSubmitted(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not save your request. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-primary/20 bg-surface p-5">
      {requestType === "creator_pass" && event.image ? <img className="mb-4 max-h-56 w-full rounded-lg object-cover" src={event.image} alt={`${event.title} event poster`} /> : null}
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><TicketCheck size={19} /></span>
        <div>
          <p className="font-medium">{requestType === "creator_pass" ? `${event.title} — Creator Pass Request` : "Need help with tickets?"}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{requestType === "creator_pass" ? `Send your details so the team can review your request for ${event.title}.` : "Send us your details and the RSVP DXB team will follow up. This is an inquiry, not a ticket purchase."}</p>
        </div>
      </div>
      {submitted ? (
        <div className="mt-4 space-y-3"><p className="rounded-md border border-success/20 bg-success/10 px-3 py-3 text-sm text-success" role="status">{requestType === "creator_pass" ? "Creator pass request saved for admin review." : `Request received for ${event.title}. Our team will contact you.`}</p>{requestType === "creator_pass" ? <div className="flex flex-wrap gap-2">{whatsappNumber ? <a className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm" href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`RSVPDXB creator pass request: ${event.title}. Name: ${name.trim()}. Phone: ${phone.trim()}.`)}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Continue in WhatsApp</a> : null}<a className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm" href={`mailto:vinitahirani@rsvpdxb.com?subject=${encodeURIComponent(`Creator pass request: ${event.title}`)}&body=${encodeURIComponent(`A creator pass request has been submitted on the RSVP DXB website.\n\nEvent: ${event.title}\nName: ${name.trim()}\nPhone: ${phone.trim()}\nEmail: ${email.trim() || "Not provided"}\n\nThe request is already saved in the admin review queue.`)}`}><Mail size={16} /> Email RSVP DXB</a><button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm" onClick={() => { void navigator.clipboard.writeText(`Creator pass request: ${event.title}; Name: ${name.trim()}; Phone: ${phone.trim()}; Email: ${email.trim() || "Not provided"}`).then(() => setCopied(true)).catch(() => setCopied(false)); }}><Copy size={16} /> {copied ? "Details copied" : "Copy details"}</button></div> : null}</div>
      ) : (
        <form className="mt-4 grid gap-3" onSubmit={submit}>
          <input className={inputClass} required minLength={2} maxLength={120} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" aria-label="Your name" />
          <input className={inputClass} type="tel" required maxLength={30} autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="WhatsApp number with country code" aria-label="WhatsApp number with country code" />
          <input className={inputClass} type="email" required={requestType === "creator_pass"} maxLength={254} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={requestType === "creator_pass" ? "Email" : "Email (optional)"} aria-label={requestType === "creator_pass" ? "Email" : "Email (optional)"} />
          {requestType === "creator_pass" ? <>
            <input className={inputClass} required maxLength={100} value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} placeholder="Instagram handle" aria-label="Instagram handle" />
            <input className={inputClass} required maxLength={40} value={instagramFollowers} onChange={(e) => setInstagramFollowers(e.target.value)} placeholder="Following on Instagram" aria-label="Following on Instagram" />
            <textarea className={inputClass} required maxLength={500} rows={3} value={creatorAddress} onChange={(e) => setCreatorAddress(e.target.value)} placeholder="Address" aria-label="Address" />
          </> : null}
          {error ? <p className="text-xs text-destructive" role="alert">{error}</p> : null}
          <Button type="submit" disabled={busy} className="w-full">{busy ? "Saving request…" : <>{requestType === "creator_pass" ? "Submit creator pass request" : "Request ticket help"} <ArrowRight size={15} /></>}</Button>
        </form>
      )}
    </div>
  );
}
