/**
 * Screenshot a running page — the visual pass, made repeatable.
 *
 * Sessions have been taking these ad hoc, and the one trap worth writing down
 * is `--window-size` on a headless Chrome command line: it sizes the CAPTURE
 * but not the layout viewport, so the page lays out at Chrome's default 800px
 * and the image is a crop of that. A 390px "mobile" check taken that way is a
 * desktop layout with its right-hand side cut off, which looks exactly like a
 * broken responsive rule. Two shots were thrown away to that before this
 * existed.
 *
 * The viewport has to be set over the DevTools protocol
 * (`Emulation.setDeviceMetricsOverride`) instead. Node 22+ has a global
 * WebSocket, so that needs no dependency.
 *
 * USAGE
 *   node scripts/screenshot.mjs <url> <out.png> [--width 390] [--dsf 2]
 *                                              [--clip <selector>] [--pad 32]
 *                                              [--full] [--eval "<js>"]
 *
 *   --clip   capture just this element (plus --pad px above and below), full
 *            width. Use it to photograph one component instead of a page.
 *   --full   capture the whole scrollable page.
 *   --eval   run an expression after load and print the result — measure the
 *            thing rather than eyeball it.
 *
 * Requires a dev server running (`npm run dev`) and Google Chrome installed.
 */
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9222;

const argv = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};
/* Positional args are whatever is not a flag or a flag's value. */
const BOOLEAN_FLAGS = new Set(["--full"]);
const positional = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith("--")) {
    if (!BOOLEAN_FLAGS.has(argv[i])) i++;
    continue;
  }
  positional.push(argv[i]);
}
const [url, out] = positional;
const width = Number(flag("width", 1440));
const dsf = Number(flag("dsf", 2));
const pad = Number(flag("pad", 32));
const clipSel = flag("clip", null);
const full = argv.includes("--full");
const expr = flag("eval", null);

if (!url || !out) {
  console.error("usage: node scripts/screenshot.mjs <url> <out.png> [--width 390] [--clip h1]");
  process.exit(1);
}

/** Reuse a browser already listening on 9222; start one otherwise. */
async function browser() {
  try {
    await fetch(`http://127.0.0.1:${PORT}/json/version`);
    return null;
  } catch {
    const child = spawn(CHROME, [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      `--remote-debugging-port=${PORT}`,
      "--user-data-dir=/tmp/chrome-screenshot-profile",
      "about:blank",
    ], { stdio: "ignore", detached: true });
    child.unref();
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 250));
      try { await fetch(`http://127.0.0.1:${PORT}/json/version`); return child; } catch { /* not up yet */ }
    }
    throw new Error("Chrome did not start");
  }
}

const child = await browser();
const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let id = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  const p = pending.get(msg.id);
  if (!p) return;
  pending.delete(msg.id);
  if (msg.error) p.rej(new Error(JSON.stringify(msg.error)));
  else p.res(msg.result);
};
const send = (method, params = {}) =>
  new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });

await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: dsf, mobile: width < 500 });
await send("Page.enable");
await send("Page.navigate", { url });
await new Promise((r) => setTimeout(r, 2500));
/* Wait for the webfonts — a shot taken before them measures the fallback. */
await send("Runtime.evaluate", { expression: "document.fonts.ready", awaitPromise: true });

if (expr) {
  const { result } = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
  console.log(result.value);
}

let clip;
if (clipSel) {
  const { result } = await send("Runtime.evaluate", {
    expression: `(()=>{const e=document.querySelector(${JSON.stringify(clipSel)});if(!e)return null;const r=e.getBoundingClientRect();return JSON.stringify({x:0,y:Math.max(0,r.top-${pad}),width:${width},height:r.height+${pad}*2});})()`,
    returnByValue: true,
  });
  if (!result.value) throw new Error(`no element matches ${clipSel}`);
  clip = { ...JSON.parse(result.value), scale: 1 };
} else if (full) {
  const { cssContentSize } = await send("Page.getLayoutMetrics");
  clip = { x: 0, y: 0, width, height: cssContentSize.height, scale: 1 };
}

const { data } = await send("Page.captureScreenshot", {
  format: "png",
  ...(clip ? { clip, captureBeyondViewport: true } : {}),
});
writeFileSync(out, Buffer.from(data, "base64"));
console.log(out);

ws.close();
if (child) process.kill(-child.pid);
process.exit(0);
