import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase/server";

/**
 * Contact form delivery (decision 044, option A).
 *
 * Writes to `contact_messages` through the service role. Validates at the
 * boundary — nothing that arrives here is trusted, including the subject,
 * which must be one of the four keys the form offers.
 *
 * ── Spam control, without an IP ─────────────────────────────────────────────
 *
 * The usual answer is a per-IP rate limit, and it is not available. Decision
 * 029 commits to the IP being "never read by our code and never stored", and
 * that is published on /how-this-site-works in both languages. Reading it here
 * to build a limiter would break a promise made to every visitor, in order to
 * protect a form. So three weaker controls that need no identifier:
 *
 *  1. HONEYPOT — a field hidden from people and offered to bots. Filled means
 *     bot. The response is a normal 200: telling a spammer their submission
 *     was rejected only tells them what to change.
 *  2. TIMING — a form rendered and submitted in under three seconds was not
 *     typed by a person. Two hours is the upper bound, after which the tab was
 *     probably left open and the timestamp is meaningless.
 *  3. GLOBAL RATE LIMIT — a per-instance in-memory ceiling, held in a variable
 *     and never persisted.
 *
 * The trade-off, stated rather than buried: a global limit means one spammer
 * can exhaust the window for everyone. At this volume that is acceptable, and
 * a CAPTCHA — the usual next step — is a third-party tracker and is not an
 * option on this site.
 */

/** Subjects the form actually offers. Anything else is not from our form. */
const SUBJECTS = new Set(["hiring", "project", "speaking", "other"]);

const MIN_FILL_MS = 3_000;
const MAX_FORM_AGE_MS = 2 * 60 * 60 * 1000;

const LIMIT_WINDOW_MS = 60 * 60 * 1000;
const LIMIT_MAX = 20;

/** In memory, per instance. Never written anywhere. */
let windowStart = 0;
let windowCount = 0;

function rateLimited(now: number): boolean {
  if (now - windowStart > LIMIT_WINDOW_MS) {
    windowStart = now;
    windowCount = 0;
  }
  windowCount++;
  return windowCount > LIMIT_MAX;
}

/** Deliberately loose. The point is to reject obvious rubbish, not to police
 *  what a valid address looks like — that argument has no winner and real
 *  addresses lose it. */
function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // 1. Honeypot. A person cannot see this field, so a value means a bot.
  //    200, not 400 — see the note above.
  if (clean(body.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  // 2. Timing.
  const now = Date.now();
  const renderedAt = Number(body.renderedAt);
  if (Number.isFinite(renderedAt)) {
    const age = now - renderedAt;
    if (age < MIN_FILL_MS || age > MAX_FORM_AGE_MS) {
      return NextResponse.json({ ok: true });
    }
  }

  // 3. Global ceiling.
  if (rateLimited(now)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 254);
  const message = clean(body.message, 5_000);
  const rawSubject = clean(body.subject, 40);
  const subject = SUBJECTS.has(rawSubject) ? rawSubject : null;

  if (!name || !message || !looksLikeEmail(email)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const { error } = await supabaseServer
    .from("contact_messages")
    .insert({ name, email, subject, message });

  if (error) {
    // The message is lost to the visitor either way; what matters is that the
    // form tells them so, and that the direct email is still on the page.
    console.error("[contact] insert failed:", error.message);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
