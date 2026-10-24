import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, MapPin, Sparkles, Star } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui-kit";
import { SitePage } from "@/components/SiteLayout";
import type { Venue } from "@/lib/database";

export const VENUE_GUIDE_CATEGORIES = [
  "Our partners",
  "Desi luxe",
  "Dinner to party",
  "Bars & night culture",
  "Coffee",
  "Daytime & alcohol-free",
] as const;

function VenueCard({ venue, featured = false }: { venue: Venue; featured?: boolean }) {
  const dateLabel = venue.featuredDate
    ? new Date(`${venue.featuredDate}T12:00:00`).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })
    : "";
  return (
    <Link
      to="/top-picks/$venueSlug"
      params={{ venueSlug: venue.slug }}
      className={`venue-guide-card${featured ? " venue-guide-card-featured" : ""}`}
    >
      <div className="venue-guide-card-image">
        <img src={venue.imageUrl} alt={venue.name} loading="lazy" />
        {!featured ? <span className="venue-guide-card-category">{venue.category}</span> : null}
        <span className="venue-guide-card-arrow">
          <ArrowUpRight size={19} />
        </span>
      </div>
      <div className="venue-guide-card-copy">
        <div className="venue-guide-card-meta">
          {dateLabel ? (
            <span>
              <CalendarDays size={13} />
              {dateLabel}
            </span>
          ) : null}
          <span>
            <MapPin size={13} />
            {venue.location}
          </span>
        </div>
        <h3>{venue.name}</h3>
        {!featured && venue.tagline ? <p>{venue.tagline}</p> : null}
      </div>
    </Link>
  );
}

export function VenueTopPicks({ venues }: { venues: Venue[] }) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const moveSlider = (direction: -1 | 1) => {
    const slider = sliderRef.current;
    if (!slider) return;
    const card = slider.querySelector<HTMLElement>(".venue-guide-card-featured");
    const gap = Number.parseFloat(getComputedStyle(slider).columnGap) || 18;
    const step = (card?.getBoundingClientRect().width ?? slider.clientWidth) + gap;
    const maxScroll = Math.max(0, slider.scrollWidth - slider.clientWidth);
    const target = Math.max(0, Math.min(maxScroll, slider.scrollLeft + direction * step));
    slider.scrollTo({ left: target, behavior: "smooth" });
  };
  if (!venues.length) return null;
  return (
    <section className="venue-home-picks">
      <div className="venue-home-heading">
        <div>
          <p className="eyebrow">
            <Sparkles size={13} /> CURATED FOR YOUR NEXT RSVP
          </p>
          <h2>Venue Top Picks</h2>
        </div>
        <div className="venue-home-heading-actions">
          <Link to="/top-picks" className="venue-guide-cta">
            Explore the venue guide <ArrowUpRight size={16} />
          </Link>
          <div className="venue-slider-controls" aria-label="Venue slider controls">
            <button type="button" aria-label="Previous venues" title="Previous venues" onClick={() => moveSlider(-1)}><ArrowLeft size={17} /></button>
            <button type="button" aria-label="Next venues" title="Next venues" onClick={() => moveSlider(1)}><ArrowRight size={17} /></button>
          </div>
        </div>
      </div>
      <div className="venue-home-grid" ref={sliderRef} aria-label="Featured venue picks">
        {venues.slice(0, 4).map((venue) => (
          <VenueCard key={venue.id} venue={venue} featured />
        ))}
      </div>
    </section>
  );
}

export function VenueDirectory({ venues }: { venues: Venue[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("All venues");
  const groups = VENUE_GUIDE_CATEGORIES.map((category) => ({
    category,
    venues: venues.filter((venue) => venue.category === category),
  })).filter((group) => group.venues.length);
  const shownGroups =
    activeCategory === "All venues"
      ? groups
      : groups.filter((group) => group.category === activeCategory);
  return (
    <SitePage>
      <main className="venue-directory-page">
        <section className="venue-directory-hero">
          <div className="venue-directory-hero-copy">
            <p className="eyebrow">
              <Sparkles size={13} /> RSVP DXB · THE CITY EDIT
            </p>
            <h1>
              Places worth
              <br />
              <em>knowing.</em>
            </h1>
            <p>
              Thoughtful picks for the nights, long lunches, slow mornings and everything in
              between.
            </p>
            <div className="venue-directory-count">
              <strong>{venues.length.toString().padStart(2, "0")}</strong>
              <span>CURATED DUBAI PLACES</span>
            </div>
          </div>
          <div className="venue-directory-hero-image">
            {venues[0] ? (
              <>
                <img src={venues[0].imageUrl} alt={venues[0].name} />
                <div>
                  <span>THE RSVP EDIT</span>
                  <strong>{venues[0].name}</strong>
                  <small>
                    <MapPin size={13} />
                    {venues[0].location}
                  </small>
                </div>
              </>
            ) : (
              <div className="venue-empty-art">
                <Sparkles size={30} />
                <span>New places are on their way</span>
              </div>
            )}
          </div>
        </section>
        <section className="venue-directory-content">
          <div className="venue-category-filter" aria-label="Filter venue categories">
            {["All venues", ...groups.map((group) => group.category)].map((category) => (
              <button
                key={category}
                type="button"
                className={activeCategory === category ? "is-active" : ""}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          {!venues.length ? (
            <div className="venue-directory-empty">
              <Sparkles size={24} />
              <h2>We’re curating the first picks.</h2>
              <p>Check back soon for the RSVP DXB venue edit.</p>
            </div>
          ) : (
            shownGroups.map((group, index) => (
              <section
                className="venue-category-section"
                key={group.category}
                id={`venue-${index}`}
              >
                <div className="venue-category-heading">
                  <div>
                    <span className="eyebrow">
                      THE CITY, THROUGH OUR LENS · {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2>{group.category}</h2>
                  </div>
                  <span>{String(group.venues.length).padStart(2, "0")} PLACES</span>
                </div>
                <div className="venue-directory-grid">
                  {group.venues.map((venue) => (
                    <VenueCard key={venue.id} venue={venue} />
                  ))}
                </div>
              </section>
            ))
          )}
        </section>
      </main>
    </SitePage>
  );
}

export function VenueDetails({ venue }: { venue: Venue | null }) {
  if (!venue)
    return (
      <SitePage>
        <section className="venue-not-found">
          <p className="eyebrow">PLACE NOT FOUND</p>
          <h1>This venue is no longer on the list.</h1>
          <Link to="/top-picks">
            <Button>
              <ArrowLeft size={16} /> Back to Top Picks
            </Button>
          </Link>
        </section>
      </SitePage>
    );
  const paragraphs = venue.description.split(/\n\s*\n/).filter(Boolean);
  return (
    <SitePage>
      <main className="venue-detail-page">
        <section className="venue-detail-layout">
          <div className="venue-detail-visual">
            <img src={venue.imageUrl} alt={venue.name} />
            <span className="venue-detail-image-caption">RSVP DXB · CITY GUIDE</span>
            <span className="venue-detail-image-number">
              01 / {String(venue.displayOrder + 1).padStart(2, "0")}
            </span>
          </div>
          <article className="venue-detail-copy">
            <Link to="/top-picks" className="venue-detail-back">
              <ArrowLeft size={16} /> All Top Picks
            </Link>
            <p className="eyebrow venue-detail-kicker">
              <Star size={13} /> {venue.category}
            </p>
            <h1>{venue.name}</h1>
            {venue.tagline ? <p className="venue-detail-tagline">{venue.tagline}</p> : null}
            <div className="venue-detail-location">
              <MapPin size={17} />
              <span>{venue.location}</span>
            </div>
            {venue.featuredDate ? (
              <div className="venue-detail-date">
                <CalendarDays size={16} />
                <span>
                  Featured{" "}
                  {new Date(`${venue.featuredDate}T12:00:00`).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            ) : null}
            <div className="venue-detail-rule" />
            <p className="eyebrow">THE PLACE</p>
            <div className="venue-detail-description">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            {venue.highlights.length ? (
              <div className="venue-detail-highlights">
                <p className="eyebrow">BEST FOR</p>
                <div>
                  {venue.highlights.map((highlight) => (
                    <span key={highlight}>{highlight}</span>
                  ))}
                </div>
              </div>
            ) : null}
            {venue.offer ? (
              <aside className="venue-detail-offer">
                <span>
                  <Sparkles size={15} /> GOOD TO KNOW
                </span>
                <p>{venue.offer}</p>
              </aside>
            ) : null}
            <div className="venue-detail-links">
              {venue.websiteUrl ? (
                <a
                  href={venue.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="venue-detail-primary-link"
                >
                  Visit website <ArrowUpRight size={16} />
                </a>
              ) : null}
              {venue.moreInfoUrl ? (
                <a
                  href={venue.moreInfoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="venue-detail-secondary-link"
                >
                  More info <ArrowUpRight size={16} />
                </a>
              ) : null}
            </div>
          </article>
        </section>
        <footer className="venue-detail-footer">
          <span>GOOD PLACES. GOOD PEOPLE.</span>
          <Link to="/top-picks">
            Back to the city edit <ArrowUpRight size={15} />
          </Link>
        </footer>
      </main>
    </SitePage>
  );
}
