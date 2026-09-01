import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "zenith_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8;

export type AuthSession = {
  email: string;
  role: "admin";
  issuedAt: number;
  expiresAt: number;
};

type SessionPayload = {
  sub: string;
  role: "admin";
  iat: number;
  exp: number;
  nonce: string;
};

function getAuthConfig() {
  const email = process.env.ZENITH_AUTH_EMAIL?.trim();
  const password = process.env.ZENITH_AUTH_PASSWORD;
  const secret = process.env.ZENITH_SESSION_SECRET;

  if (!email || !password || !secret || secret.length < 32) return null;
  return { email, password, secret };
}

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function signaturesMatch(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export function credentialsAreConfigured() {
  return getAuthConfig() !== null;
}

export function credentialsMatch(email: string, password: string) {
  const config = getAuthConfig();
  if (!config) return false;

  const emailMatches = email.trim().toLowerCase() === config.email.toLowerCase();
  const passwordMatches =
    password.length === config.password.length &&
    timingSafeEqual(Buffer.from(password), Buffer.from(config.password));

  return emailMatches && passwordMatches;
}

export function createSessionToken(email: string) {
  const config = getAuthConfig();
  if (!config) {
    throw new Error(
      "Authentication is not configured. Set ZENITH_AUTH_EMAIL, ZENITH_AUTH_PASSWORD, and a 32+ character ZENITH_SESSION_SECRET."
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    sub: email.trim().toLowerCase(),
    role: "admin",
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
    nonce: randomBytes(16).toString("hex"),
  };
  const encodedPayload = encode(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload, config.secret)}`;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function verifySessionToken(token: string | undefined): AuthSession | null {
  if (!token) return null;

  const config = getAuthConfig();
  if (!config) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = sign(encodedPayload, config.secret);
  if (!signaturesMatch(signature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(decode(encodedPayload)) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);

    if (
      payload.role !== "admin" ||
      payload.sub !== config.email.toLowerCase() ||
      !Number.isFinite(payload.iat) ||
      !Number.isFinite(payload.exp) ||
      payload.exp <= now ||
      payload.exp - payload.iat > SESSION_TTL_SECONDS
    ) {
      return null;
    }

    return {
      email: payload.sub,
      role: payload.role,
      issuedAt: payload.iat,
      expiresAt: payload.exp,
    };
  } catch {
    return null;
  }
}

export async function getAuthSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}
