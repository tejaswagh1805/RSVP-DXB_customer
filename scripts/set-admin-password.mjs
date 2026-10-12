import { neon } from "@neondatabase/serverless";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { createInterface } from "node:readline/promises";

process.loadEnvFile?.();
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is missing. Add it to the project .env file.");
if (!process.stdin.isTTY || !process.stdin.setRawMode) {
  throw new Error("Run this command in an interactive terminal so the password can be entered without echo.");
}

const terminal = createInterface({ input: process.stdin, output: process.stdout });
const email = (await terminal.question("Admin email to update or create: ")).trim().toLowerCase();
const suggestedName = email.split("@")[0]?.replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) || "RSVP DXB Admin";
const name = (await terminal.question(`Admin display name (${suggestedName}): `)).trim() || suggestedName;
terminal.close();

function hiddenPrompt(label) {
  return new Promise((resolve, reject) => {
    const input = process.stdin;
    let value = "";
    process.stdout.write(label);
    input.setRawMode(true);
    input.resume();
    const onData = (chunk) => {
      const key = chunk.toString("utf8");
      if (key === "\u0003") {
        cleanup();
        reject(new Error("Cancelled."));
      } else if (key === "\r" || key === "\n") {
        cleanup();
        process.stdout.write("\n");
        resolve(value);
      } else if (key === "\u007f" || key === "\b") {
        value = value.slice(0, -1);
      } else if (key >= " " && key !== "\u007f") {
        value += key;
      }
    };
    function cleanup() {
      input.off("data", onData);
      input.setRawMode(false);
      input.pause();
    }
    input.on("data", onData);
  });
}

const password = await hiddenPrompt("New admin password (minimum 12 characters): ");
if (password.length < 12 || password.length > 200) throw new Error("Password must be between 12 and 200 characters.");
const salt = randomBytes(16).toString("base64url");
const hash = await promisify(scryptCallback)(password, salt, 64);
const passwordHash = `scrypt$${salt}$${Buffer.from(hash).toString("hex")}`;
const sql = neon(databaseUrl);
const existing = await sql`SELECT id, active FROM admin_users WHERE lower(email) = ${email} LIMIT 1`;
if (existing[0]) {
  if (!existing[0].active) throw new Error("That admin account is inactive. Ask an Owner to reactivate it.");
  await sql`UPDATE admin_users SET password_hash = ${passwordHash}, updated_at = now() WHERE id = ${existing[0].id}`;
  console.info("Admin password updated. Sign in at /admin.");
} else {
  await sql`
    INSERT INTO admin_users (id, name, email, password_hash, role, active)
    VALUES (${`adm-${randomBytes(12).toString("hex")}`}, ${name}, ${email}, ${passwordHash}, 'Owner', true)
  `;
  console.info("Owner admin account created. Sign in at /admin.");
}
