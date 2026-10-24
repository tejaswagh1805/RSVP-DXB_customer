import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useStore } from "@/lib/store";
import { Button } from "./ui-kit";
import { Apple, MessageCircle, Play, Send, Ticket } from "lucide-react";
import { CursorBlob } from "./GenZFx";
import clientLogoUrl from "@/assets/rsvp-client-logo.png";
import { getMemberSession, signOutMember } from "@/lib/database";
const clientLogo = { url: clientLogoUrl };

const NAV = [
  { to: "/events", label: "Events" },
  { to: "/host", label: "Host" },
  { to: "/membership", label: "Membership" },
  { to: "/wall", label: "Events Wall" },
  { to: "/press", label: "Press" },
  { to: "/about", label: "About" },
  { to: "/tickets", label: "Tickets & Offers" },
] as const;

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const { profile, signOut, hydrateMember } = useStore();
  const navigate = useNavigate();
  const readMemberSession = useServerFn(getMemberSession);
  const endMemberSession = useServerFn(signOutMember);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let current = true;
    void readMemberSession().then((member) => {
      if (current) hydrateMember(member);
    }).catch(() => {
      if (current) hydrateMember(null);
    });
    return () => { current = false; };
  }, [readMemberSession, hydrateMember]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`customer-header sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur${overlay ? " customer-header-overlay" : ""}${scrolled ? " is-scrolled" : ""}`}>
      <div className="header-main mx-auto min-h-20 w-full max-w-[1600px] items-center gap-4 px-5 lg:px-10">
        <Link to="/" className="customer-logo shrink-0" aria-label="RSVP DXB home">
          <img src={clientLogo.url} alt="RSVP DXB" width={132} height={60} />
        </Link>

        <nav className="customer-nav flex items-center gap-5" aria-label="Main navigation">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-xs font-medium uppercase text-foreground transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions flex items-center gap-2">
          <Link to="/tickets" className="header-ticket"><Button size="sm"><Ticket size={15} />Last minute ticket</Button></Link>
          {profile.signedIn ? (
            <>
              <Link to="/me">
                <Button size="sm" variant="outline">
                  My account
                </Button>
              </Link>
              <Button size="sm" variant="ghost" onClick={async () => {
                try {
                  await endMemberSession();
                } catch {
                  // Clear the local member state and leave the protected page even if
                  // the session cleanup request fails; the server still guards /me.
                }
                signOut();
                hydrateMember(null);
                await navigate({ to: "/" });
              }}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/signin" className="hidden sm:block">
                <Button size="sm" variant="ghost">
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>

    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="customer-footer border-t border-border bg-surface">
      <div className="footer-newsletter">
        <p className="eyebrow">The city is better together.</p>
        <div className="footer-app-badges">
          <Link to="/apps" className="app-badge" aria-label="Download on the App Store">
            <Apple size={22} aria-hidden="true" />
            <span><small>Download on the</small><strong>App Store</strong></span>
          </Link>
          <Link to="/apps" className="app-badge" aria-label="Get it on Google Play">
            <Play size={20} aria-hidden="true" />
            <span><small>Get it on</small><strong>Google Play</strong></span>
          </Link>
        </div>
        <h2>GET ON THE LIST.</h2>
        <p className="footer-newsletter-sub">New rooms, secret dinners and last-minute drops — straight to your inbox.</p>
        <NewsletterForm />
      </div>
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 md:grid-cols-4">
        <div>
          <Link to="/" className="footer-logo" aria-label="RSVP DXB home"><img src={clientLogo.url} alt="RSVP DXB" width={180} height={82} loading="lazy" /></Link>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Dubai's invitation-only guest list for media, creators, tastemakers and the private
            circle. A Tickbox UAE company.
          </p>
        </div>
        <FooterCol
          title="Platform"
          links={[
            ["/events", "What is on"],
            ["/top-picks", "Top Picks"],
            ["/wall", "Events Wall"],
            ["/membership", "Membership"],
            ["/me", "Member area"],
          ]}
        />
        <FooterCol
          title="Business"
          links={[
            ["/host", "Host an event"],
            ["/host", "House parties"],
            ["/press", "Press"],
            ["/about", "Partner with us"],
          ]}
        />
        <FooterCol
          title="Find us / Stay connected"
          links={[
            ["/contact", "Find Us"],
            ["/signin", "Members login"],
            ["/contact", "Talk to us"],
            ["/faq", "FAQ"],
          ]}
        />
      </div>
      <div className="border-t border-border px-5 py-5 text-center text-[11px] text-muted-foreground">
        Prototype — RSVP DXB platform concept. Content is demonstration data.
      </div>
    </footer>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return done ? (
    <p className="footer-newsletter-done">You're on the list. Watch your inbox.</p>
  ) : (
    <form
      className="footer-newsletter-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim()) setDone(true);
      }}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        aria-label="Email address"
      />
      <button type="submit" aria-label="Subscribe"><Send size={16} aria-hidden="true" />Subscribe</button>
    </form>
  );
}

export function WhatsAppFloat() {
  return (
    <a
      className="whatsapp-float"
      href="https://wa.me/?text=Hi%20RSVP%20DXB%2C%20I%27d%20love%20to%20know%20more."
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle size={26} aria-hidden="true" />
      <span className="whatsapp-float-pulse" aria-hidden="true" />
    </a>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <ul className="mt-4 space-y-2">
        {links.map(([to, label], i) => (
          <li key={`${to}-${i}`}>
            <Link to={to} className="text-sm text-muted-foreground hover:text-primary">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SitePage({ children, overlayHeader = false }: { children: ReactNode; overlayHeader?: boolean }) {
  return (
    <div className={`customer-scope flex min-h-screen flex-col bg-background text-foreground${overlayHeader ? " customer-banner-page" : ""}`}>
      <SiteHeader overlay={overlayHeader} />
      <CursorBlob />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro: string;
}) {
  return (
    <div className="customer-page-hero border-b border-border bg-surface">
      <div className="mx-auto w-full max-w-6xl px-5 py-16">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">{intro}</p>
      </div>
    </div>
  );
}
