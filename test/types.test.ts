// Compile-time contract (run by `npm run typecheck`): valid calls compile, and
// each @ts-expect-error line must fail to compile or tsc reports it unused.
import GeigerComms, { getState, type GeigerBootSettings } from "../src/index";

GeigerComms.boot({ appId: "wg_7fk2p9" });
GeigerComms.boot({ appId: "wg_7fk2p9", jwt: "a.b.c", user: { email: "a@b.co" }, options: { hideDefaultLauncher: true } });
GeigerComms.boot({ appId: "wg_7fk2p9", apiBase: "http://localhost:3000" });
GeigerComms.showSpace("help");
GeigerComms.showNews();
GeigerComms.trackEvent("plan_upgraded", { plan: "pro", seats: 3, trial: false });
GeigerComms.setLauncherState({ label: "Chat with us", icon: "ai" });
const off: () => void = GeigerComms.onUnreadCountChange((n: number) => n.toFixed());
off();
const visitor: string | null = GeigerComms.getVisitorId();
const ready: Promise<boolean> = GeigerComms.load();
const unread: number = getState().unreadCount;
void [visitor, ready, unread];

// @ts-expect-error appId is required
GeigerComms.boot({ jwt: "a.b.c" });
// @ts-expect-error hideDefaultLauncher belongs under options
GeigerComms.boot({ appId: "wg_7fk2p9", hideDefaultLauncher: true });
// @ts-expect-error unknown settings field
const typo: GeigerBootSettings = { appId: "wg_7fk2p9", jtw: "a.b.c" };
void typo;
// @ts-expect-error not a Messenger space
GeigerComms.showSpace("settings");
// @ts-expect-error showConversation needs an id
GeigerComms.showConversation();
// @ts-expect-error event metadata must be JSON-safe
GeigerComms.trackEvent("x", { cb: () => 1 });
// @ts-expect-error unknown launcher icon
GeigerComms.setLauncherState({ icon: "rocket" });
// @ts-expect-error not part of the API (Proactive is out of scope for v1)
GeigerComms.startTour("t1");
