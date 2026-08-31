// Demo harness for the messenger UI.
//
// Two things on one page: a live widget pinned to the corner (how a host
// actually uses it) and a gallery of every state the design canvas draws, each
// rendered inline so they can be compared side by side.

import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { Launcher, Messenger, sampleData } from "../src/ui";
import type { MessengerData, View } from "../src/ui";

// Bundled into demo/bundle.css by esbuild. Importing rather than <link>ing the
// widget stylesheet keeps it reachable from the dev server, which only serves
// demo/ and cannot see ../src.
import "../src/ui/widget.css";
import "./demo.css";

function Frame({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="frame" id={id}>
      <figcaption>
        <a className="frame__id" href={`#${id}`}>
          {id}
        </a>
        <span>{label}</span>
      </figcaption>
      {children}
    </figure>
  );
}

type Theme = "dark" | "light";

/** A gallery cell: one panel, opened straight onto a given screen. */
function Panel({
  view,
  theme,
  data = sampleData,
  mobile = false,
}: {
  view: View;
  theme: Theme;
  data?: MessengerData;
  mobile?: boolean;
}) {
  return (
    <Messenger
      data={data}
      defaultOpen
      defaultView={view}
      inline
      mobile={mobile}
      hideLauncher
      theme={theme}
      onEvent={(name, meta) => console.log("[geiger]", name, meta ?? "")}
    />
  );
}

const offlineData: MessengerData = { ...sampleData, online: false };
const quietData: MessengerData = { ...sampleData, proactive: undefined };

function App() {
  const [theme, setTheme] = useState<Theme>("dark");

  return (
    <div data-demo-theme={theme}>
      <header className="page-head">
        <div>
          <h1>Geiger Comms — Messenger</h1>
          <p>
            Direction <strong>1a</strong> from the design canvas: circular launcher, three-tab
            panel, bubble chat. Turn 2&rsquo;s states re-skinned into this shell.
          </p>
        </div>
        <button type="button" className="themebtn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? "Light pass" : "Dark pass"}
        </button>
      </header>

      <section className="turn">
        <h2>1a · The shell</h2>
        <div className="row">
          <Frame id="home" label="Home">
            <Panel view={{ kind: "home" }} theme={theme} />
          </Frame>
          <Frame id="ai" label="AI conversation">
            <Panel view={{ kind: "conversation", id: "c-ask" }} theme={theme} />
          </Frame>
          <Frame id="launcher" label="Launcher — idle · unread · open">
            <div className="gc-widget launchers" data-theme={theme}>
              <Launcher state="idle" />
              <Launcher state="unread" unread={2} />
              <Launcher state="open" />
            </div>
          </Frame>
        </div>
      </section>

      <section className="turn">
        <h2>Turn 2 · Every other state, re-skinned into 1a</h2>
        <div className="row">
          <Frame id="2a" label="Handed off to a human">
            <Panel view={{ kind: "conversation", id: "c-refund" }} theme={theme} />
          </Frame>
          <Frame id="2b" label="Past conversations">
            <Panel view={{ kind: "messages" }} theme={theme} />
          </Frame>
          <Frame id="2c" label="Help centre search">
            <Panel view={{ kind: "help" }} theme={theme} />
          </Frame>
          <Frame id="2d" label="Article reader">
            <Panel view={{ kind: "article", id: "a-late" }} theme={theme} />
          </Frame>
          <Frame id="2e" label="Start a new conversation">
            <Panel view={{ kind: "new" }} theme={theme} />
          </Frame>
          <Frame id="2f" label="Proactive message">
            <div className="proactive-cell">
              <Messenger data={sampleData} inline theme={theme} onEvent={() => {}} />
            </div>
          </Frame>
          <Frame id="2g" label="Offline — leave a message">
            <Panel view={{ kind: "offline" }} data={offlineData} theme={theme} />
          </Frame>
          <Frame id="2h" label="Rating after the chat">
            <Panel view={{ kind: "conversation", id: "c-closed" }} theme={theme} />
          </Frame>
          <Frame id="2i" label="Attachments">
            <Panel view={{ kind: "conversation", id: "c-blender" }} theme={theme} />
          </Frame>
          <Frame id="2j" label="Mobile, full screen">
            <Panel view={{ kind: "conversation", id: "c-ask" }} mobile theme={theme} />
          </Frame>
        </div>
      </section>

      <section className="turn">
        <h2>Live</h2>
        <p className="note">
          A real instance is pinned to the bottom-right of this page — click the launcher. It routes
          between all three tabs and every sub-screen. Interactions log to the console.
        </p>
      </section>

      {/* The pinned, interactive widget. */}
      <Messenger
        data={quietData}
        align="right"
        theme={theme}
        onEvent={(name, meta) => console.log("[geiger]", name, meta ?? "")}
      />
    </div>
  );
}

const host = document.getElementById("root");
if (host) {
  createRoot(host).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
