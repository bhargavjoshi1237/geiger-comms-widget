# @geiger/comms-widget

Typed loader injection, API and React bindings for the **Geiger Comms
Messenger** — the embeddable chat widget built by the [`geiger-comms`](../geiger-comms)
project. This package is the public surface that host pages use to mount the
messenger; the messenger itself (component tree, bridge, server endpoints)
lives in the [`geiger-comms`](../geiger-comms) repo.

> Private package. Installed from GitHub, not npm:
> `npm install github:bhargavjoshi1237/geiger-comms-widget#<sha>`
>
> `dist/` is committed, so a GitHub install needs no build step on your side.

## Install

```bash
npm install github:bhargavjoshi1237/geiger-comms-widget#<commit-sha>

# Local development against a local Geiger Comms:
npm install github:bhargavjoshi1237/geiger-comms-widget#main
```

## Repository layout

```
src/
  types.ts    settings, routes, launcher states, event names
  index.ts    core: loader injection, typed method API
  react.tsx   GeigerProvider, useGeigerComms, useGeigerEvent
  ui/         the rendered messenger (see "Messenger UI" below)
demo/         runnable gallery of every messenger state
dist/         committed build (esm + cjs + d.ts)
```

Rebuild after editing `src/`: `npm install && npm run build`, then commit
`dist/`.

## Quick start (vanilla)

```js
import { GeigerComms, configure } from "@geiger/comms-widget";

// Optional — point at a local dev server while you iterate.
configure({ scriptUrl: "http://localhost:3000/comms/widget/v1.js" });

GeigerComms.boot({ appId: "wg_7fk2p9" });
GeigerComms.showAsk("Where is my order #48120?");
```

## Quick start (React)

```jsx
import { GeigerProvider, useGeigerComms } from "@geiger/comms-widget/react";

<GeigerProvider appId="wg_7fk2p9" jwt={jwt} options={{ hideDefaultLauncher: true }}>
  <App />
</GeigerProvider>;

function HelpButton() {
  const { open } = useGeigerComms();
  return <button onClick={() => open()}>Open chat</button>;
}
```

`GeigerProvider` boots on mount, **re-boots when `jwt` changes identity**, and
shuts down on unmount — so a signed-out visitor never inherits the previous
user's session.

## Signing identity JWTs (server-side)

Identity is a **JWT signed HS256 by your backend** with the widget app's
signing secret. Sign it on the server — **never in the browser**, or you leak
the secret.

Claims: `user_id` (required), optional `name` / `email`, `exp` ≤ 24 hours.

```js
// npm install jsonwebtoken
const jwt = require("jsonwebtoken");

function geigerTokenForUser(user) {
  return jwt.sign(
    { user_id: String(user.id), name: user.name, email: user.email },
    process.env.GEIGER_WIDGET_SIGNING_SECRET, // from the Install screen, shown once
    { algorithm: "HS256", expiresIn: "24h" },
  );
}
```

Then pass it to `boot({ appId, jwt })` from an authenticated page. Anonymous
visitors work without a `jwt`; when someone signs in later, call
`update({ jwt })` (or re-render `GeigerProvider jwt=…`) and their anonymous
chat history merges into their contact automatically.

---

## Modes, routes and launcher states

The messenger is a single SPA that switches between **modes** (called
"spaces"). Every method on `GeigerComms` lands in one of them. Visual specs
for each mode are in the screenshots committed alongside the docs.

### Spaces

| Space | Triggered by | What it renders |
|---|---|---|
| `home` | `show()`, `showSpace("home")`, the launcher pulse | **Hub** — greeting, Ask Aria input, Quick actions grid, conversations, Popular right now, Geiger Comms footer. |
| `ask` | `showAsk("…")`, typing into Ask Aria, top-of-list search hits | AI Ask space: numbered Answer Card with summary, steps, sources, follow-ups and related articles. Bottom bar grows upward while typing. |
| `messages` | `showMessages()`, opening a conversation, replying to proactive, the `+ New` button | Conversations list (Open / Closed tabs), Thread view, New conversation flow, Offline leave-a-message, post-chat rating. |
| `help` | `showSpace("help")`, "Ask about my order instead" deep link | Help centre search (with query highlighting + "Ask Aria instead"), Article reader with author + last updated + helpful vote + FAQ callout + related-articles rail. |
| `news` | `showSpace("news")`, `showNews(id)` | List of published posts, single post reader. |
| `tickets` | `showSpace("tickets")`, `showTicket(id)` | Caller's tickets, read-only. |

### Launcher states

The launcher that mounts in the host page is fully driven by the messenger
via the postMessage bridge (`loader.js ↔ bridge.js ↔ widget_app.jsx`). Three
shapes exist:

| State | Rendered as | Trigger |
|---|---|---|
| **idle (Help pill)** | A label-pill "Help" with chat-bubble icon | Launcher default; `setLauncherState({ icon: "help" })` resets it. |
| **unread (named reply)** | A label-pill reading e.g. "Maya replied" | New inbound agent message arrives on a conversation not currently open in the foreground. |
| **open** | Close-X circle | While the messenger is open. |

Setting a launcher programmatically is supported via
`GeigerComms.setLauncherState({ label, unread, icon })` (forward-pushed by
the launcher), and via the read-only echo from the messenger
(`event:launcher` envelopes).

#### Launcher events observed by the host

```js
GeigerComms.onEvent((event) => {
  // event.name ∈ { "launcher:opened", "space:opened", "ask:submitted", ... }
  if (event.name === "ask:submitted") analytics.track("ask_submitted", event.meta);
});
```

### Proactive popup

The messenger can render a small floater on top of any space when the team
has outbound context to share (an order update, a returns-window reminder,
a missed follow-up). The popup surfaces:

* Two quick-action chips (`Yes, check it` / `No thanks`)
* A reply box that converts to a new conversation prefilled with the user's
  text (`setRoute({ space: "messages", newAbout, draft })`)
* Auto-dismiss after 60 s
* Tracking event `proactive:replied` with `{ id, text }`

### Human handover

When the AI escalates a conversation, the widget:

1. Sets the launcher to the *"Maya replied"* state (or whichever teammate
   name is in the metadata).
2. Renders a `human` banner above the thread ("Aria handed this thread to
   Maya · just now") inside the same conversation.
3. Re-fetches the conversation through `/api/widget/conversations/:id/messages`
   and switches the typing indicator to human.

---

## API surface

| Method | Notes |
|---|---|
| `boot(settings)` | `appId` required; `jwt`, `anonymousId`, `hideDefaultLauncher` optional. |
| `update(data)` | Hot-swap identity (`{ jwt }`) without re-booting. |
| `shutdown()` | Removes the launcher and iframe; clears the in-memory session. |
| `show()` / `hide()` | Open / close the messenger iframe. |
| `showSpace(name)` | Navigate the messenger to one of `home \| ask \| messages \| help \| news \| tickets`. |
| `showAsk(text?)` | Open the messenger directly into AI Ask mode, pre-filling the query. |
| `showMessages()` | Open and route to the conversations list. |
| `showNewMessage(text?)` | Open and route to the new-conversation flow prefilled. |
| `showConversation(id)` | Open a specific thread. |
| `showArticle(id)` | Open the Help centre reader for one article. |
| `showNews(id?)` | Open the news list (or a specific post). |
| `showTicket(id)` | Open the tickets list (or a specific ticket). |
| `setLauncherState({ label, unread, icon })` | Override the launcher label, badge count and icon. |
| `trackEvent(name, meta?)` | Forward-compat passthrough; same as the messenger's internal tracking. |
| `getVisitorId()` | This browser's stable visitor id. |
| `onShow(cb)` / `onHide(cb)` | Messenger visibility changes. |
| `onUnreadCountChange(cb)` | Badged unread count rises / clears. |
| `onUserEmailSupplied(cb)` | A user typed their email into the offline form. |
| `onEvent(cb)` / `onTrackedEvent(cb)` | Generic widget events. |

### Events the host receives

```ts
{ name: "space:opened", meta: { space: "ask" } }
{ name: "ask:submitted", meta: { query: "refund" } }
{ name: "ask:answer:rendered", meta: { sources: 3, steps: 2 } }
{ name: "article:opened", meta: { id, title } }
{ name: "message:sent", meta: { conversationId } }
{ name: "conversation:started", meta: { kind, orderId } }
{ name: "conversation:rated", meta: { score, comment } }
{ name: "attachment:uploaded", meta: { name, sizeKb } }
{ name: "attachment:rejected", meta: { name, reason } }
{ name: "proactive:replied", meta: { id, text } }
{ name: "thread:handover", meta: { conversationId, to } }
{ name: "launcher:opened", meta: { source } }
```

---

## Communication with the `geiger-comms` project

This package is the integration layer; the actual messenger is implemented
by [`geiger-comms`](../geiger-comms). That project owns:

* **The bootstrap loader** (`lib/widget/loader.js`) — the small ES5 script
  loaded by `injectLoader()`. It owns the host page's launcher, the lazy
  iframe mount, the anonymous-id UUID in localStorage, and the
  postMessage bridge.
* **The bridge** (`components/widget/bridge.js`) — strict
  versioned-envelope `{ source, v, type, payload }` messaging inside the
  iframe. Every inbound frame is origin-checked, source-checked, shape-
  checked and rejected if unknown.
* **The iframe app** (`components/widget/widget_app.jsx`) — routes between
  spaces, owns session tokens, manages realtime subscription and unread
  count, hosts the proactive popup overlay.
* **The public REST API** (`app/api/widget/**`) — the `/session`,
  `/conversations`, `/articles`, `/ask`, `/leads`, etc. endpoints the
  iframe fetches through the service client.
* **The Supabase data layer** (`lib/widget/data.js`,
  `lib/widget/viewmodels.js`) — service-role access; ownership comes only
  from the session token, never from request parameters.

This package is intentionally thin: ~3 source files, no runtime
dependencies, no React requirement unless you import `react.tsx`. It is the
typed front door that lets a host page drive the messenger without
knowing how it's wired up.

### Lifecycle

```
host page                  this package (comms-widget)            geiger-comms
-----------                -----------------------------           ------------
<script>                                                                   v
GeigerComms.boot()  -->   injectLoader()         -->  GET /widget/v1.js (loader.js)
                                              -->  iframe mounted
                                              -->  loader postMessages('ready')
                                              <-- messenger emits 'boot' (jwt, anonymousId)
                                              -->  POST /api/widget/session
                                              <--  { sessionToken, realtimeToken, config }
                                              -->  iframe renders <WidgetApp />
                                              -->  GET /api/widget/conversations  ...
showAsk('refund') -->     showAsk('refund')     -->  messenger routes to { space: 'ask' }
                                              -->  POST /api/widget/ask  { query }
                                              <--  { answer: { summary, steps, sources, ... } }
                                              -->  messenger renders AnswerCard
setLauncherState({ ... })
                       -->  toWidget('launcher', { label, unread })
                                              -->  messenger postMessages('launcher')
                                              <-- loader renders launcher pill / badge / close icon
```

### API client → endpoint mapping

| Client method (`api_client.js`) | Endpoint | Notes |
|---|---|---|
| `conversations()` | `GET /api/widget/conversations` | Ownership derived from session token. |
| `messages(id, before?)` | `GET /api/widget/conversations/:id/messages?before=` | Keyset pagination. |
| `sendMessage(id, text, atts)` | `POST /api/widget/conversations/:id/messages` | RPC `post_message` under the hood. |
| `createConversation(subject, aboutKind, aboutOrderId, aboutLabel)` | `POST /api/widget/conversations` | Returns `{ conversation, message }`. |
| `rate(id, score, comment)` | `POST /api/widget/conversations/:id/rating` | Closes the conversation when recorded. |
| `markRead(id)` | `POST /api/widget/conversations/:id/read` | Fire-and-forget. |
| `upload(file)` | `POST /api/widget/upload` | Multipart; metadata is stripped client-side (`image.js`). |
| `articles(q?)` | `GET /api/widget/articles?q=` | Published only. |
| `popularArticles()` | `GET /api/widget/articles?popular=1` | Hub footer rail. |
| `article(id)` | `GET /api/widget/articles/:id` | Single row or 404. |
| `ask(query)` | `POST /api/widget/ask` | AI AnswerCard payload. |
| `leaveMessage(email, message)` | `POST /api/widget/leads` | Anonymous-allowed; tied to the workspace via `appId + origin`. |
| `quickActions()` | `GET /api/widget/quick-actions` | Hub Quick actions grid. |
| `recentOrders()` | `GET /api/widget/orders` | New Conversation order picker. |
| `news()` | `GET /api/widget/news` | Published posts. |
| `tickets()` | `GET /api/widget/tickets` | Caller's tickets. |
| `trackEvent(name, meta)` | `POST /api/widget/events` | Capped at 50 visitor events. |

### Bridge envelopes

* **Host → messenger** (`INBOUND_TYPES` in `bridge.js`): `boot`, `update`,
  `show`, `hide`, `showSpace`, `showAsk`, `showArticle`, `showNews`,
  `showConversation`, `showNewMessage`, `showTicket`, `trackEvent`,
  `shutdown`.
* **Messenger → host** (`OUTBOUND_TYPES` in `bridge.js`): `ready`,
  `unreadCount`, `resize`, `open`, `close`, `visitor`, `userEmailSupplied`,
  `launcher`, `event`.

The loader lets through exactly the `OUTBOUND_TYPES` above; anything else
is dropped without logging the payload.

### Identity handshake

Anonymous visitors carry a UUID minted by the loader and stored in the
host page's `localStorage` under `geiger_comms_anonymous_id`. Signed-in
visitors additionally carry a JWT signed by your backend with the widget
app's HS256 signing secret. The full boot flow lives in
`geiger-comms/lib/widget/session.js`; the relevant guarantees:

* Origin must be on the widget app's `allowed_origins` allowlist (exact
  origin match, no wildcards).
* A failed refresh triggers exactly one silent re-boot before the messenger
  surfaces an error screen.
* The realtime token (if `SUPABASE_JWT_SECRET` is configured) is the only
  identity used for the private Broadcast channel so Realtime's RLS can
  verify every message delivery.

---

## Messenger UI

`src/ui/` implements the end-user messenger from the Claude Design canvas
*Comms Widget* — **direction 1a, "Messenger"**: circular launcher, three-tab
panel (Home · Messages · Help), bubble chat.

This is **additive and independent of the loader**. `src/index.ts` still proxies
to the hosted `v1.js` exactly as before; nothing in `src/ui/` is imported by it.
Use `src/ui/` when you want to render the messenger yourself — a preview, a
design review, or a host that already holds the data.

```tsx
import { Messenger, sampleData } from "@geiger/comms-widget/ui";
import "@geiger/comms-widget/ui/widget.css";

<Messenger data={sampleData} onEvent={(name, meta) => track(name, meta)} />;
```

Styles are **not** injected — import `widget.css` once. Everything is scoped
under `.gc-widget`, so the widget cannot leak styles into the host page and the
host cannot restyle it by accident. Tokens mirror the Geiger UI bundle
(`--surface-card`, `--border-strong`, …) under a `--gc-` prefix; pass
`theme="light"` for the light token set.

### Screens

| Canvas | Screen | Component |
| --- | --- | --- |
| 1a | Home, AI conversation, launcher | `HomeView`, `ThreadView`, `Launcher` |
| 2a | Handed off to a human | `ThreadView` |
| 2b | Past conversations | `MessagesView` |
| 2c | Help centre search | `HelpView` |
| 2d | Article reader | `ArticleView` |
| 2e | Start a new conversation | `NewConversationView` |
| 2f | Proactive message | `ProactiveCard` |
| 2g | Offline — leave a message | `OfflineView` |
| 2h | Rating after the chat | `ThreadView` |
| 2i | Attachments | `ThreadView` |
| 2j | Mobile, full screen | `Messenger mobile` / `@media (max-width: 480px)` |

`ThreadView` covers four of these because they are the same layout with
different data: an AI author gets numbered steps and cited sources, a human
author gets an avatar and a read receipt, a closed thread swaps the composer
for the rating card.

### Demo

```bash
npm run demo          # esbuild dev server on http://localhost:5173
npm run demo:build    # one-off bundle to demo/bundle.js
```

The page shows every state inline for comparison, plus a live widget pinned to
the corner. Events log to the console.

### Deviations from the canvas

Three things in the canvas needed a decision rather than a transcription:

- **Turn 2 was drawn in 1b's Hub shell**, and the canvas says it would be
  re-skinned once a direction was chosen. Those ten states are re-skinned into
  1a here: tab roots (2b, 2c) gain the three-tab nav, sub-screens hide it, and
  2f's pill launcher becomes 1a's circular one.
- **`GeigerLauncherState` in `src/types.ts` has five members** (`idle`,
  `unread`, `open`, `minimized`, `typing`) but the canvas draws three. The UI's
  `LauncherState` is the drawn three; the loader-side type is untouched.
- **Placeholder copy is kept verbatim** (Northwind, Aria, Maya Chen, #48120) in
  `src/ui/sample.ts`. Two list previews were reworded so a row and the thread it
  opens tell the same story.

## Out of scope (today)

`startTour`, `startSurvey`, `startChecklist`, `startConversation`. They will
arrive as additional outbound bridge commands + their own spaces; the
host-side surface will mirror the same `GeigerComms.*` method names.

## Development

```bash
# in this folder
npm install
npm run build       # compile to dist/
npm run watch       # tsc -b --watch while iterating
npm run typecheck   # tsc --noEmit
npm run demo        # messenger UI gallery on :5173
```

Verify the `dist/` files are committed — GitHub installs use them directly
with no build step on the consumer side.
