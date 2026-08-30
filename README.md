# @geiger/comms-widget

Typed loader injection, API and React bindings for the **Geiger Comms Messenger** —
the embeddable chat widget. Use this instead of the paste-a-script-tag workflow when
you want types, lifecycle control and SSR safety.

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

## Vanilla usage

```js
import GeigerComms from "@geiger/comms-widget";

GeigerComms.boot({ appId: "wg_7fk2p9" });
GeigerComms.showSpace("help");

const off = GeigerComms.onUnreadCountChange((n) => setBadge(n));
// later: off()
```

Point at a local deployment while developing:

```js
import { configure } from "@geiger/comms-widget";
configure({ scriptUrl: "http://localhost:3000/widget/v1.js" });
```

## React usage

```jsx
import { GeigerProvider, useGeigerComms } from "@geiger/comms-widget/react";

<GeigerProvider appId="wg_7fk2p9" jwt={jwt} options={{ hideDefaultLauncher: true }}>
  <App />
</GeigerProvider>;

const { open, close, showSpace, unreadCount, isReady } = useGeigerComms();
```

`GeigerProvider` boots on mount, re-boots when `jwt` changes identity, and shuts
down on unmount.

## Signing identity JWTs (server-side!)

Identity is a **JWT signed HS256 by your backend** with the widget app's signing
secret. Sign it on the server — **never in the browser**, or you leak the secret.
Claims: `user_id` (required), optional `name` / `email`, `exp` ≤ 24 hours.

Node example:

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

app.get("/geiger-token", requireAuth, (req, res) => {
  res.json({ jwt: geigerTokenForUser(req.user) });
});
```

Then pass that token to `boot({ appId, jwt })` from your authenticated page.

Anonymous visitors work without a `jwt`; when someone signs in later, call
`update({ jwt })` (or re-render `GeigerProvider jwt=…`) and their anonymous chat
history merges into their contact automatically.

## API surface

| Method | Notes |
|---|---|
| `boot(settings)` | `appId` required; `jwt`, `anonymousId`, `hideDefaultLauncher` optional |
| `update(data)` | Change settings/identity after boot |
| `shutdown()` | Removes the launcher and iframe |
| `show()` / `hide()` | Open/close the messenger |
| `showSpace(name)` | `home` \| `messages` \| `help` \| `news` \| `tickets` |
| `showMessages()` / `showNewMessage(text?)` | |
| `showConversation(id)` / `showArticle(id)` / `showNews(id?)` / `showTicket(id)` | Deep links |
| `trackEvent(name, meta?)` | |
| `getVisitorId()` | This browser's stable visitor id |
| `onShow(cb)` / `onHide(cb)` / `onUnreadCountChange(cb)` / `onUserEmailSupplied(cb)` | Return an unsubscribe function |

Out of scope for v1: `startTour`, `startSurvey`, `startChecklist`, `startConversation`.

## Repo layout

```
src/index.ts    core: loader injection, typed method API
src/react.tsx   GeigerProvider, useGeigerComms
src/types.ts    settings + method types
dist/           committed build (esm + cjs + d.ts)
```

Rebuild after editing `src/`: `npm install && npm run build`, then commit `dist/`.
