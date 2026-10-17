// The README's server-side signing examples produce tokens Geiger Comms
// accepts. Verified against the REAL verifyCustomerJwt from a geiger-comms
// checkout (GEIGER_COMMS_DIR, default ../geiger-comms) when present.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { registerHooks } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { signWidgetJwt, signWidgetJwtNoDeps } from "../examples/sign-widget-jwt.mjs";

// The server modules are written for Next's bundler: stub "server-only" and
// resolve extensionless relative imports ("./env") the way it does.
registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "server-only") return { url: "data:text/javascript,", shortCircuit: true };
    try {
      return next(specifier, context);
    } catch (error) {
      if (specifier.startsWith(".") && !/\.[cm]?js$/.test(specifier)) return next(`${specifier}.js`, context);
      throw error;
    }
  },
});

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const jwtPath = resolve(repoRoot, process.env.GEIGER_COMMS_DIR || "../geiger-comms", "lib/widget/jwt.js");
const skip = existsSync(jwtPath) ? false : `no server verifier at ${jwtPath}`;

// Same shape as the secrets Messenger > Install hands out.
const secret = `sk_${randomBytes(32).toString("base64url")}`;
const user = { id: 42, email: "ada@example.com", name: "Ada Lovelace" };

test("both examples verify with the real server check", { skip }, async () => {
  const { verifyCustomerJwt } = await import(pathToFileURL(jwtPath).href);
  for (const token of [await signWidgetJwt(user, secret), signWidgetJwtNoDeps(user, secret)]) {
    const payload = await verifyCustomerJwt(token, secret);
    assert.ok(payload, "accepted");
    assert.equal(payload.user_id, "42");
    assert.equal(payload.email, "ada@example.com");
    assert.equal(payload.name, "Ada Lovelace");
  }
});

test("the server rejects what the README warns about", { skip }, async () => {
  const { verifyCustomerJwt } = await import(pathToFileURL(jwtPath).href);
  const good = signWidgetJwtNoDeps(user, secret);
  assert.equal(await verifyCustomerJwt(good, `${secret}x`), null, "wrong secret");

  // A 25h lifetime is refused (the example clamps to 24h, so forge one by hand).
  const now = Math.floor(Date.now() / 1000);
  const { createHmac } = await import("node:crypto");
  const enc = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const sign = (payload, header = { alg: "HS256", typ: "JWT" }) => {
    const unsigned = `${enc(header)}.${enc(payload)}`;
    return `${unsigned}.${createHmac("sha256", secret).update(unsigned).digest("base64url")}`;
  };
  assert.equal(await verifyCustomerJwt(sign({ user_id: "42", iat: now, exp: now + 25 * 3600 }), secret), null, "lifetime > 24h");
  assert.equal(await verifyCustomerJwt(sign({ user_id: "42", iat: now }), secret), null, "no exp");
  assert.equal(await verifyCustomerJwt(sign({ iat: now, exp: now + 600 }), secret), null, "no user_id");
  assert.equal(await verifyCustomerJwt(sign({ user_id: "", iat: now, exp: now + 600 }), secret), null, "empty user_id");
  const none = `${enc({ alg: "none", typ: "JWT" })}.${enc({ user_id: "42", exp: now + 600 })}.`;
  assert.equal(await verifyCustomerJwt(none, secret), null, "alg none");
});

test("the examples refuse to sign without a secret or user id", async () => {
  await assert.rejects(() => signWidgetJwt(user, ""), /SIGNING_SECRET/);
  assert.throws(() => signWidgetJwtNoDeps({ email: "x@y.z" }, secret), /user\.id is required/);
});
