// SERVER-ONLY. Signs the identity JWT that GeigerComms.boot({ jwt }) carries.
// Run this in your backend (route handler, server component, API) with the
// widget app's signing secret from Messenger > Install. Never import it into
// browser code and never expose the secret through a NEXT_PUBLIC_ variable.
//
// What Geiger Comms verifies (lib/widget/jwt.js): HS256 only, keyed with the
// secret's raw UTF-8 bytes; `user_id` is a non-empty string (max 255 chars);
// `exp` is required, at most 24h away and at most 24h after `iat`; 60s clock
// skew. Optional `email`/`name` strings fill the contact on first sign-in.
// 12h, not minutes: the Messenger reuses the token when it re-authenticates.
import { createHmac } from "node:crypto";
import { SignJWT } from "jose";

const MAX_LIFETIME_S = 24 * 60 * 60;
const DEFAULT_LIFETIME_S = 12 * 60 * 60;

function claimsFor(user) {
  if (!user || user.id === undefined || user.id === null || user.id === "") {
    throw new Error("signWidgetJwt: user.id is required");
  }
  const claims = { user_id: String(user.id) };
  if (user.email) claims.email = String(user.email);
  if (user.name) claims.name = String(user.name);
  return claims;
}

// Option A — `jose` (the same library Geiger Comms verifies with).
export async function signWidgetJwt(user, secret = process.env.GEIGER_COMMS_SIGNING_SECRET) {
  if (!secret) throw new Error("GEIGER_COMMS_SIGNING_SECRET is not set");
  return new SignJWT(claimsFor(user))
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(new TextEncoder().encode(secret));
}

// Option B — zero dependencies, Node's built-in crypto.
export function signWidgetJwtNoDeps(user, secret = process.env.GEIGER_COMMS_SIGNING_SECRET, lifetimeSeconds = DEFAULT_LIFETIME_S) {
  if (!secret) throw new Error("GEIGER_COMMS_SIGNING_SECRET is not set");
  const now = Math.floor(Date.now() / 1000);
  const payload = { ...claimsFor(user), iat: now, exp: now + Math.min(lifetimeSeconds, MAX_LIFETIME_S) };
  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const unsigned = `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}`;
  const signature = createHmac("sha256", secret).update(unsigned).digest("base64url");
  return `${unsigned}.${signature}`;
}
