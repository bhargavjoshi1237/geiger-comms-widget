// Contract test against the REAL loader (GEIGER_COMMS_DIR, default ../geiger-comms): the widget's
// `chime` message plays the reply chime, throttled, and the SDK's `options.sound: false` silences it.
// Its own file, so the SDK singleton starts fresh. Skipped when the checkout is missing.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Window } from "happy-dom";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const commsDir = resolve(repoRoot, process.env.GEIGER_COMMS_DIR || "../geiger-comms");
const loaderPath = resolve(commsDir, "lib/widget/loader.js");
const skip = existsSync(loaderPath) ? false : `no loader at ${loaderPath}`;

const ORIGIN = "https://comms.test";
const BASE = "/comms";

// Records the frequency of every oscillator the chime starts.
function fakeAudioContext(started) {
  const gain = { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} };
  return class {
    state = "running";
    currentTime = 0;
    destination = {};
    resume() {
      return Promise.resolve();
    }
    createGain() {
      return { gain, connect() {} };
    }
    createOscillator() {
      return {
        frequency: { value: 0 },
        connect() {},
        start() {
          started.push(this.frequency.value);
        },
        stop() {},
      };
    }
  };
}

test("the loader chimes for a new reply, at most once per 3 s, unless options.sound is false", { skip }, async () => {
  const source = readFileSync(loaderPath, "utf8");
  const { buildLoaderScript } = await import(`data:text/javascript,${encodeURIComponent(source)}`);
  const win = new Window({
    url: "https://customer.example/pricing",
    settings: { disableIframePageLoading: true, disableJavaScriptFileLoading: true },
  });
  globalThis.window = win;
  globalThis.document = win.document;
  const started = [];
  win.AudioContext = fakeAudioContext(started);

  let injected = null;
  const append = win.document.head.appendChild.bind(win.document.head);
  win.document.head.appendChild = (el) => {
    if (el.hasAttribute && el.hasAttribute("data-geiger-comms-sdk")) {
      injected = el;
      return el;
    }
    return append(el);
  };

  // The loader's throttle reads Date.now from this realm.
  const realNow = Date.now;
  let clock = 1_000_000;
  Date.now = () => clock;
  try {
    const { default: G } = await import("../dist/index.js");
    G.boot({ appId: "wg_chime", scriptUrl: `${ORIGIN}${BASE}/widget/v1.js` });
    const fakeFetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ appearance: {} }) });
    new Function("window", "document", "fetch", buildLoaderScript(ORIGIN, BASE))(win, win.document, fakeFetch);
    const loaded = G.load();
    injected.dispatchEvent(new win.Event("load"));
    assert.equal(await loaded, true);

    G.show();
    const iframe = win.document.querySelector("[data-geiger-comms] iframe");
    const post = (type, payload) =>
      win.dispatchEvent(
        new win.MessageEvent("message", {
          data: { source: "geiger-comms", v: 1, type, payload },
          origin: ORIGIN,
          source: iframe.contentWindow,
        }),
      );

    post("chime");
    assert.equal(started.length, 6, "two notes of three partials each");
    assert.deepEqual(
      started.filter((f) => f < 1000),
      [587.33, 783.99],
      "Mallet: D5, then G5",
    );

    clock += 2_999;
    post("chime");
    assert.equal(started.length, 6, "a second reply inside 3 s stays quiet");

    clock += 1;
    post("chime");
    assert.equal(started.length, 12, "the next reply after the gap chimes");

    G.boot({ appId: "wg_chime", options: { sound: false } });
    clock += 10_000;
    post("chime");
    assert.equal(started.length, 12, "options.sound false silences it");

    G.boot({ appId: "wg_chime" });
    post("chime");
    assert.equal(started.length, 18, "booting without the option turns it back on");

    G.shutdown();
  } finally {
    Date.now = realNow;
    await win.happyDOM.close();
  }
});
