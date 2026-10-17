# @geiger/comms-widget

Typed, SSR-safe SDK for the **Geiger Comms Messenger**. It wraps the hosted
loader script (`/widget/v1.js`) with:

- **A typed API**: every method and settings field, so a typo is a compile error instead of a silent no-op.
- **SSR safety**: nothing touches `window` until you call a method in a browser. Importing it in a Next.js server component is safe.
- **A pre-boot queue**: calls made before the loader arrives are replayed in order, with full arguments.
- **React bindings**: `GeigerProvider` boots on mount, re-boots when the signed-in user changes, and shuts down on unmount. `useGeigerComms()` gives you controls and live unread/open state.
- **A local dev target**: `apiBase` points at a local Geiger Comms with no tunnels.

There are zero runtime dependencies. React 18 or newer is an optional peer, needed only for `@geiger/comms-widget/react`.

## Install

The package is not on npm. Install it from GitHub and **pin a commit sha**:

```bash
npm install github:bhargavjoshi1237/geiger-comms-widget#<commit-sha>
```

```jsonc
// package.json
"dependencies": {
  "@geiger/comms-widget": "github:bhargavjoshi1237/geiger-comms-widget#<commit-sha>"
}
```

The built `dist/` is committed, so installing needs no build step on your side.

**Before you start**, open **Messenger → Install** in Geiger Comms and create a
widget app. You get:

- a **public id** (`wg_…`), which goes in your frontend;
- a **signing secret** (`sk_…`), shown once, which goes in your backend's secrets manager.

Add every origin the widget runs on as an exact `scheme://host[:port]`, for
example `https://acme.com` or `http://localhost:5173`. A request from any other
origin is rejected.

## Vanilla usage

```js
import GeigerComms from "@geiger/comms-widget";

// Anonymous visitor
GeigerComms.boot({ appId: "wg_7fk2p9" });

// Signed-in user: the jwt is minted by YOUR server (see "Signing the JWT")
GeigerComms.boot({ appId: "wg_7fk2p9", jwt });

GeigerComms.showSpace("help");
GeigerComms.trackEvent("plan_upgraded", { plan: "pro" });

const off = GeigerComms.onUnreadCountChange((n) => setBadge(n));
off(); // every on* returns an unsubscribe

// Sign-out: tear the session down so the next user starts clean
GeigerComms.shutdown();
```

The first `boot()` injects the loader. Calls made before it arrives are queued
and replayed in order. Display commands (`show`, `showSpace`, `trackEvent`, and
so on) issued before `boot()` wait for it. All methods are also named exports:
`import { boot, showSpace } from "@geiger/comms-widget"`. CommonJS works too:
`require("@geiger/comms-widget").default`.

## React

```tsx
import { GeigerProvider, useGeigerComms } from "@geiger/comms-widget/react";

export function Root({ jwt }: { jwt?: string }) {
  return (
    <GeigerProvider appId="wg_7fk2p9" jwt={jwt} options={{ hideDefaultLauncher: true }}>
      <App />
    </GeigerProvider>
  );
}

// Your own launcher, now that the default one is hidden
function HelpButton() {
  const { open, close, showSpace, unreadCount, isReady, isOpen } = useGeigerComms();
  return (
    <button disabled={!isReady} onClick={isOpen ? close : open}>
      Help {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
    </button>
  );
}
```

`GeigerProvider` props: `appId` (required), `jwt`, `user` (`{ email }`),
`options` (`{ hideDefaultLauncher }`), `scriptUrl`, and `apiBase`.

How the provider reacts to changes:

| Change | What the provider does |
|---|---|
| Mount | `boot()` |
| Anonymous → signed in | `boot()` with the jwt and **no** shutdown. The anonymous id is kept, so the visitor's earlier conversations merge into their account. |
| Same user, new token | Nothing. The token is verified once, at boot. |
| User A → user B, signed in → signed out, or a new `appId` | `shutdown()`, then `boot()`, so one user's session never leaks into the next |
| `options` or `user.email` changes | `boot()` again with the new settings |
| Unmount | `shutdown()`, deferred by one tick so React StrictMode's simulated unmount doesn't tear the session down |

The provider derives identity from the token's `user_id` claim. It only reads
the claim; the server does the verification.

`useGeigerComms()` returns `{ open, close, showSpace, unreadCount, isReady, isOpen }`.
It works anywhere in the tree. The provider only owns the lifecycle.

### Next.js App Router

The `/react` entry is a `"use client"` module, so a server layout can sign the
token and render the provider directly:

```tsx
// app/layout.tsx (a server component)
import { GeigerProvider } from "@geiger/comms-widget/react";
import { getCurrentUser } from "@/lib/auth";
import { signWidgetJwt } from "@/lib/geiger-comms-jwt"; // server-only, see below

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const jwt = user ? await signWidgetJwt(user) : undefined;
  return (
    <html lang="en">
      <body>
        <GeigerProvider appId="wg_7fk2p9" jwt={jwt}>
          {children}
        </GeigerProvider>
      </body>
    </html>
  );
}
```

## Signing the JWT (server-side, Node)

> **Sign on your server, never in the browser.** The signing secret lets anyone
> who holds it impersonate any of your users in the Messenger. Never put it in
> frontend code or in a `NEXT_PUBLIC_*` / `VITE_*` variable, never commit it,
> and never send it to a client. Only the public id (`wg_…`) belongs in the page.

What Geiger Comms verifies:

| Field | Rule |
|---|---|
| `alg` | `HS256` only. `none` and every asymmetric algorithm are rejected. |
| Key | The `sk_…` signing secret, used as-is as UTF-8 bytes. Do not base64-decode it. |
| `user_id` | Required: your stable user id as a non-empty **string** of up to 255 characters. Stringify numeric ids. |
| `exp` | Required and enforced. It can be at most **24h** away, and `exp - iat` can be at most 24h. 60s of clock skew is allowed. |
| `iat` | Recommended. If present, it must not be in the future. |
| `email`, `name` | Optional strings that fill in the contact the first time the user signs in |

Option A uses [`jose`](https://github.com/panva/jose), the same library Geiger
Comms verifies with:

```js
// lib/geiger-comms-jwt.js (server only; add `import "server-only"` in Next.js)
import { SignJWT } from "jose";

export async function signWidgetJwt(user) {
  const secret = process.env.GEIGER_COMMS_SIGNING_SECRET; // sk_… from Messenger → Install
  if (!secret) throw new Error("GEIGER_COMMS_SIGNING_SECRET is not set");
  const claims = { user_id: String(user.id) };
  if (user.email) claims.email = user.email;
  if (user.name) claims.name = user.name;
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("12h") // at most 24h
    .sign(new TextEncoder().encode(secret));
}
```

Option B has zero dependencies and uses Node's built-in `crypto`:

```js
import { createHmac } from "node:crypto";

export function signWidgetJwt(user) {
  const secret = process.env.GEIGER_COMMS_SIGNING_SECRET;
  if (!secret) throw new Error("GEIGER_COMMS_SIGNING_SECRET is not set");
  const now = Math.floor(Date.now() / 1000);
  const payload = { user_id: String(user.id), iat: now, exp: now + 12 * 60 * 60 }; // at most 24h
  if (user.email) payload.email = user.email;
  if (user.name) payload.name = user.name;
  const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const unsigned = `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}`;
  const signature = createHmac("sha256", secret).update(unsigned).digest("base64url");
  return `${unsigned}.${signature}`;
}
```

Mint a fresh token on each page load or session and pass it to `boot({ jwt })`
or `<GeigerProvider jwt>`. The Messenger reuses the token if it has to sign in
again, for example after a laptop wakes from sleep. That is why the examples use
12h rather than minutes. On pages that stay open longer, pass a fresh token with
`GeigerComms.update({ jwt })`. Both examples live in
[`examples/sign-widget-jwt.mjs`](examples/sign-widget-jwt.mjs). The test suite
checks them against Geiger Comms' real verifier.

**Rotation:** **Rotate secret** in Messenger → Install issues a new secret. The
previous secret keeps verifying for a grace period, so you can deploy the new
one without signing anyone out.

## Local development

Point the SDK at a Geiger Comms running on `localhost:3000`:

```ts
const apiBase = process.env.NODE_ENV === "development" ? "http://localhost:3000" : undefined;

GeigerComms.boot({ appId: "wg_…", apiBase });
// or
<GeigerProvider appId="wg_…" apiBase={apiBase}>…</GeigerProvider>
```

- `apiBase` is the base URL of a Geiger Comms deployment (its origin plus base path). The loader is fetched from `${apiBase}/widget/v1.js`. To give the full URL instead, pass `scriptUrl`. The default is `https://geiger.studio/comms/widget/v1.js`.
- The loader bakes its own origin into itself when it is served, so the Messenger's API calls go to the same deployment that served the script. In your local Geiger Comms, leave `NEXT_PUBLIC_APP_ORIGIN` unset or set it to `http://localhost:3000`. Otherwise the local loader talks to that origin instead.
- Add your app's dev origin (e.g. `http://localhost:5173`) to the widget app's allowed origins.
- `scriptUrl` and `apiBase` are read on the first load only.

## API

| Method | Notes |
|---|---|
| `boot(settings)` | `{ appId, jwt?, user?: { email? }, options?: { hideDefaultLauncher? }, scriptUrl?, apiBase? }`. Injects the loader on first call. |
| `update(data)` | `{ jwt?, user?: { email? } }`. A new `jwt` re-authenticates the running Messenger. |
| `shutdown()` | Removes the launcher and ends the session. Call it on sign-out. |
| `show()` / `hide()` | Open or close the panel |
| `showSpace(name)` | `"home" \| "messages" \| "help" \| "news" \| "tickets"` |
| `showMessages()`, `showNewMessage(text?)` | |
| `showConversation(id)`, `showArticle(id)`, `showNews(id?)`, `showTicket(id)` | |
| `showAsk(text?)` | Geiger extension: opens AI Ask |
| `setLauncherState({ label?, unread?, icon? })` | Geiger extension: pill label, badge, or `"help" \| "ai" \| "minimize"` icon |
| `trackEvent(name, meta?)` | `meta` must be JSON-safe: string, number, boolean, or null values |
| `getVisitorId()` | `string \| null` once a session has booted |
| `onShow(cb)`, `onHide(cb)` | Return an unsubscribe |
| `onUnreadCountChange(cb)` | Called right away with the current count, then on each change |
| `onUserEmailSupplied(cb)`, `onEvent(cb)` (alias `onTrackedEvent`) | Return an unsubscribe |
| `load(options?)` | Warm the loader up without booting. Resolves `true` when it is live, or `false` on the server or on failure. Never rejects. |
| `getState()`, `subscribe(fn)` | `{ loaded, booted, isOpen, unreadCount }`. Compatible with `useSyncExternalStore`. |

## Developing this package

```bash
npm install
npm run verify   # typecheck (src + consumer view of dist) + build + tests
```

- **Commit `dist/` after every source change.** GitHub installs never build.
- `test/real-loader.test.mjs` and `test/jwt.test.mjs` run against a sibling
  `geiger-comms` checkout (set `GEIGER_COMMS_DIR` to point elsewhere). They
  catch drift between the hosted loader and this SDK, and are skipped when the
  checkout is missing.
