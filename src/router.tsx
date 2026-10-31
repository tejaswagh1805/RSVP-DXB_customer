import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Keep the source page's data and layout warm for browser Back so the
    // router can restore its saved scroll position without waiting on loaders.
    defaultStaleTime: 60_000,
    // Reuse loader results fetched by hover/focus preloading for 30 seconds.
    defaultPreload: "intent",
    defaultPreloadStaleTime: 30_000,
  });

  return router;
};
