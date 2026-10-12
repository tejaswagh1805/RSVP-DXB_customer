import { neon } from "@neondatabase/serverless";

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
