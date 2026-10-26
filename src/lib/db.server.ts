import { neon } from "@neondatabase/serverless";

// Use bundled content for local previews until a development database is configured.
export function isLocalPreview() {
  return import.meta.env.DEV && !process.env["DATABASE_URL"];
}

function getDatabaseUrl() {
  const url = process.env["DATABASE_URL"];
  if (!url) {
    throw new Error(
      "DATABASE_URL is missing. Set it in .env locally and in the hosting environment.",
    );
  }
  return url;
}

export function getSql() {
  return neon(getDatabaseUrl());
}
