import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Reuse loader results fetched by hover/focus preloading for 30 seconds.
    defaultPreload: "intent",
    defaultPreloadStaleTime: 30_000,
  });

  return router;
};
