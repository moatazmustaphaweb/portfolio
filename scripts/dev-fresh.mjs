/**
 * `npm run fresh` — clear the build cache, start the dev server, open a browser.
 *
 * Why this exists as a script rather than a one-line npm command:
 *
 *  - Deleting `.next` must happen BEFORE the server starts. Removing it while a
 *    dev server is running corrupts that server's state and produces exactly
 *    the symptoms it is meant to cure — stale or broken pages that survive a
 *    refresh and a private window.
 *  - Next refuses to start a second dev server in the same directory and points
 *    at the existing one. That message is easy to miss in a scrollback, so this
 *    checks first and says so plainly.
 *  - The browser should open when the server is READY, not after a guessed
 *    delay.
 *
 * Content note: this clears the BUILD cache, which only matters for code. A
 * Supabase content change appears on refresh in dev without any of this —
 * `revalidate = 300` covers the production build.
 */

import { spawn } from "node:child_process";
import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT ?? 3000);
const URL_TO_OPEN = `http://localhost:${PORT}/en`;

/**
 * Is a dev server already running FOR THIS DIRECTORY?
 *
 * Checking the port is the wrong test and actively dangerous. Next allows one
 * dev server per project directory, not per port, so a server on :3000 blocks
 * `PORT=3200 npm run fresh` too — and a port-only check would sail past that
 * and delete `.next` out from under the running server before Next got the
 * chance to refuse. Next records the owner in `.next/dev/lock`; that is the
 * only thing that actually answers the question.
 */
async function runningDevServer() {
  let lock;
  try {
    lock = JSON.parse(await readFile(path.join(ROOT, ".next/dev/lock"), "utf8"));
  } catch {
    return null; // no lock, or unreadable — nothing claims this directory
  }
  if (!lock?.pid) return null;
  try {
    process.kill(lock.pid, 0); // signal 0 tests liveness without signalling
  } catch {
    return null; // stale lock from a crashed server; safe to clear
  }
  return lock;
}

async function waitForReady(timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(URL_TO_OPEN, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return true;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

function openBrowser(url) {
  const cmd =
    process.platform === "darwin"
      ? ["open", [url]]
      : process.platform === "win32"
        ? ["cmd", ["/c", "start", "", url]]
        : ["xdg-open", [url]];
  try {
    spawn(cmd[0], cmd[1], { stdio: "ignore", detached: true }).unref();
  } catch {
    console.log(`\n  Open ${url} manually.\n`);
  }
}

const running = await runningDevServer();
if (running) {
  console.error(
    `\n  A dev server is already running for this project.\n\n` +
      `    ${running.appUrl ?? `http://localhost:${running.port}`}   (pid ${running.pid})\n\n` +
      `  Next allows one per directory, so this would be refused — and clearing\n` +
      `  .next first would corrupt the running server's state.\n\n` +
      `  Stop it, then re-run:\n\n` +
      `    kill ${running.pid} && npm run fresh\n`,
  );
  process.exit(1);
}

console.log("  Clearing .next …");
await rm(path.join(ROOT, ".next"), { recursive: true, force: true });

console.log(`  Starting dev server on ${PORT} …\n`);
const dev = spawn("npx", ["next", "dev", "--port", String(PORT)], {
  cwd: ROOT,
  stdio: "inherit",
  env: process.env,
});

if (await waitForReady()) {
  console.log(`\n  Ready — opening ${URL_TO_OPEN}\n`);
  openBrowser(URL_TO_OPEN);
} else {
  console.log(`\n  Server did not become ready. Check the output above.\n`);
}

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => {
    dev.kill(sig);
    process.exit(0);
  });
}
dev.on("exit", (code) => process.exit(code ?? 0));
