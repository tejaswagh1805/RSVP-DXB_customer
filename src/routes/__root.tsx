import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { StoreProvider } from "../lib/store";
import { SitePage } from "@/components/SiteLayout";

const scrollPositionsKey = "rsvp-scroll-positions-v1";

function getEntryScrollKey(location: { state: object; href: string }) {
  const state = location.state as Record<string, unknown>;
  return String(state["__TSR_key"] || state["key"] || location.href);
}

type ScrollSnapshot = { y: number; sectionIndex?: number; sectionOffset?: number };

function readScrollSnapshot(key: string): ScrollSnapshot | null {
  try {
    const positions = JSON.parse(sessionStorage.getItem(scrollPositionsKey) || "{}");
    const value = positions[key];
    if (typeof value === "number") return { y: value };
    if (!value || !Number.isFinite(Number(value.y))) return null;
    return value;
  } catch {
    return null;
  }
}

function saveScrollY(key: string, snapshot: ScrollSnapshot) {
  try {
    const positions = JSON.parse(sessionStorage.getItem(scrollPositionsKey) || "{}");
    positions[key] = snapshot;
    const recentEntries = Object.entries(positions).slice(-40);
    sessionStorage.setItem(scrollPositionsKey, JSON.stringify(Object.fromEntries(recentEntries)));
  } catch {
    // Scroll restoration remains usable through TanStack Router if storage is unavailable.
  }
}

function NotFoundComponent() {
  useEffect(() => {
    document.title = "Page not found — RSVP DXB";
  }, []);
  return (
    <SitePage>
      <section className="flex min-h-[55vh] items-center justify-center bg-background px-4 py-20">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
      </section>
    </SitePage>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error instanceof Error ? error : new Error(String(error)), { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#f3e3cb" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "RSVP DXB" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { title: "RSVP DXB — Get on the lists that count" },
      {
        name: "description",
        content:
          "Dubai's invitation-only guest list for media, creators, tastemakers and the private circle.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Bebas+Neue&display=swap" },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="light">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    let pendingBackKey: string | null = null;
    let restoreTimer: ReturnType<typeof setTimeout> | undefined;
    let userInteracted = false;
    let restoreOnInitialLoad = false;

    const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    restoreOnInitialLoad = navigationEntry?.type === "reload";

    const saveCurrentPosition = () => {
      const state = window.history.state || {};
      const key = String(state["__TSR_key"] || state["key"] || window.location.href);
      const sections = Array.from(document.querySelectorAll<HTMLElement>(".customer-home > section"));
      const activeSectionIndex = sections.findIndex((section) => section.offsetTop + section.offsetHeight > window.scrollY);
      const activeSection = activeSectionIndex >= 0 ? sections[activeSectionIndex] : undefined;
      saveScrollY(key, {
        y: window.scrollY,
        ...(activeSection ? { sectionIndex: activeSectionIndex, sectionOffset: Math.max(0, window.scrollY - activeSection.offsetTop) } : {}),
      });
    };
    const onScroll = () => {
      // A browser Back can emit scroll events before the route render completes.
      // Do not replace the destination's saved position with that transient Y.
      if (!pendingBackKey) saveCurrentPosition();
    };
    const onPopState = () => {
      pendingBackKey = String(window.history.state?.["__TSR_key"] || window.history.state?.["key"] || window.location.href);
      userInteracted = false;
    };
    const onUserScrollIntent = () => { userInteracted = true; restoreOnInitialLoad = false; };

    const restorePosition = (destinationKey: string, startedAt = Date.now()) => {
      const currentState = window.history.state || {};
      const currentKey = String(currentState["__TSR_key"] || currentState["key"] || window.location.href);
      if (currentKey !== destinationKey) return;
      const snapshot = readScrollSnapshot(destinationKey);
      if (!snapshot || userInteracted) return;
      const isHome = window.location.pathname === "/";
      const sections = isHome ? Array.from(document.querySelectorAll<HTMLElement>(".customer-home > section")) : [];
      const section = snapshot.sectionIndex === undefined ? undefined : sections[snapshot.sectionIndex];
      const targetY = section
        ? section.offsetTop + (snapshot.sectionOffset || 0)
        : snapshot.y;
      const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      // Homepage media and the pinned showcase can change document height after
      // hydration. Wait for the saved section to exist and fit before restoring;
      // clamping to the temporary page bottom is what sent users to the footer.
      if ((!document.querySelector(".customer-home") || maxScrollY < targetY) && Date.now() - startedAt < 10_000) {
        restoreTimer = setTimeout(() => restorePosition(destinationKey, startedAt), 100);
        return;
      }
      window.scrollTo({ top: Math.min(targetY, maxScrollY), left: 0, behavior: "auto" });
    };

    const unsubscribeBeforeLoad = router.subscribe("onBeforeLoad", (event) => {
      if (event.fromLocation) {
        const sections = Array.from(document.querySelectorAll<HTMLElement>(".customer-home > section"));
        const activeSectionIndex = sections.findIndex((section) => section.offsetTop + section.offsetHeight > window.scrollY);
        const activeSection = activeSectionIndex >= 0 ? sections[activeSectionIndex] : undefined;
        saveScrollY(getEntryScrollKey(event.fromLocation), {
          y: window.scrollY,
          ...(activeSection ? { sectionIndex: activeSectionIndex, sectionOffset: Math.max(0, window.scrollY - activeSection.offsetTop) } : {}),
        });
      }
    });
    const unsubscribeRendered = router.subscribe("onRendered", (event) => {
      const destinationKey = getEntryScrollKey(event.toLocation);
      if (!pendingBackKey || pendingBackKey !== destinationKey) return;
      pendingBackKey = null;
      userInteracted = false;
      if (restoreTimer) clearTimeout(restoreTimer);
      requestAnimationFrame(() => requestAnimationFrame(() => restorePosition(destinationKey)));
    });

    if (restoreOnInitialLoad) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const state = window.history.state || {};
        restorePosition(String(state["__TSR_key"] || state["key"] || window.location.href));
      }));
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("popstate", onPopState, true);
    window.addEventListener("wheel", onUserScrollIntent, { passive: true });
    window.addEventListener("touchstart", onUserScrollIntent, { passive: true });
    window.addEventListener("keydown", onUserScrollIntent);
    window.addEventListener("pagehide", saveCurrentPosition);

    return () => {
      unsubscribeBeforeLoad();
      unsubscribeRendered();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", onPopState, true);
      window.removeEventListener("wheel", onUserScrollIntent);
      window.removeEventListener("touchstart", onUserScrollIntent);
      window.removeEventListener("keydown", onUserScrollIntent);
      window.removeEventListener("pagehide", saveCurrentPosition);
      if (restoreTimer) clearTimeout(restoreTimer);
    };
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </StoreProvider>
    </QueryClientProvider>
  );
}
