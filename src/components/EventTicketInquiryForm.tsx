import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, TicketCheck } from "lucide-react";
import type { EventItem } from "@/lib/data";
import { submitEventTicketInquiry } from "@/lib/database";
import { Button, inputClass } from "@/components/ui-kit";

export function EventTicketInquiryForm({ event }: { event: EventItem }) {
  const submitInquiry = useServerFn(submitEventTicketInquiry);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = async (form: FormEvent<HTMLFormElement>) => {
    form.preventDefault();
    setError("");
    const normalizedPhone = phone.replace(/[\s().-]/g, "");
    if (!name.trim()) return setError("Enter your name.");
    if (!/^\+?[\d]{8,15}$/.test(normalizedPhone)) return setError("Enter a valid phone number with country code, such as +971501234567.");
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email address or leave it blank.");
    setBusy(true);
    try {
      await submitInquiry({ data: { eventId: event.id, name: name.trim(), email: email.trim(), phone: normalizedPhone } });
      setSubmitted(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not save your request. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-primary/20 bg-surface p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><TicketCheck size={19} /></span>
        <div>
          <p className="font-medium">Need help with tickets?</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Send us your details and the RSVP DXB team will follow up. This is an inquiry, not a ticket purchase.</p>
        </div>
      </div>
      {submitted ? (
        <p className="mt-4 rounded-md border border-success/20 bg-success/10 px-3 py-3 text-sm text-success" role="status">Request received for {event.title}. Our team will contact you.</p>
      ) : (
        <form className="mt-4 grid gap-3" onSubmit={submit}>
          <input className={inputClass} required minLength={2} maxLength={120} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" aria-label="Your name" />
          <input className={inputClass} type="tel" required maxLength={30} autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="WhatsApp number with country code" aria-label="WhatsApp number with country code" />
          <input className={inputClass} type="email" maxLength={254} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" aria-label="Email (optional)" />
          {error ? <p className="text-xs text-destructive" role="alert">{error}</p> : null}
          <Button type="submit" disabled={busy} className="w-full">{busy ? "Sending request…" : <>Request ticket help <ArrowRight size={15} /></>}</Button>
        </form>
      )}
    </div>
  );
}
