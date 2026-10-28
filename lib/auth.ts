import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "ma_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function sessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "insecure-development-secret"
  );
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function createSessionToken(): string {
  const payload = String(Date.now() + SESSION_TTL_MS);
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const given = Buffer.from(signature);
  const target = Buffer.from(expected);

  if (given.length !== target.length) return false;
  if (!timingSafeEqual(given, target)) return false;

  return Number(payload) > Date.now();
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;

  const given = Buffer.from(input);
  const target = Buffer.from(expected);

  if (given.length !== target.length) return false;
  return timingSafeEqual(given, target);
}

export const SESSION_MAX_AGE = Math.floor(SESSION_TTL_MS / 1000);

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}
