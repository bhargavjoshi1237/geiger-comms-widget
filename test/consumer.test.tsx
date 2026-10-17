// Consumer view: resolves "@geiger/comms-widget" through package.json "exports"
// to the committed dist/*.d.ts, exactly as an app installing from GitHub would.
import GeigerComms from "@geiger/comms-widget";
import { GeigerProvider, useGeigerComms, type GeigerProviderProps } from "@geiger/comms-widget/react";

GeigerComms.boot({ appId: "wg_7fk2p9", jwt: "a.b.c" });
GeigerComms.showSpace("help");
const off = GeigerComms.onUnreadCountChange((n) => n.toFixed());
off();

export function Launcher() {
  const { open, close, showSpace, unreadCount, isReady, isOpen } = useGeigerComms();
  return (
    <button type="button" disabled={!isReady} onClick={isOpen ? close : open} onDoubleClick={() => showSpace("messages")}>
      Help {unreadCount > 0 ? `(${unreadCount})` : null}
    </button>
  );
}

export function App({ jwt }: { jwt?: string }) {
  return (
    <GeigerProvider appId="wg_7fk2p9" jwt={jwt} options={{ hideDefaultLauncher: true }}>
      <Launcher />
    </GeigerProvider>
  );
}

// @ts-expect-error hideDefaultLauncher belongs under options
const bad: GeigerProviderProps = { appId: "wg_7fk2p9", hideDefaultLauncher: true };
void bad;
