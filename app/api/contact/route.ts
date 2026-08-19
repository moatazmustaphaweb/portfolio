import { NextResponse } from "next/server";

import { getUiStrings } from "@/lib/content/ui";
import { notifyContactSubmission } from "@/lib/notify/contact-notification";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Contact form delivery (decision 044 option A, amended by decision 051).
 *
 * Writes to `contact_messages` through the service role, **then** notifies
 * Moataz by email. Storage is still the system of record; the mail only tells
 * him a row arrived. If the mail fails the row is still there, the visitor
 * still sees success, and the failure is recorded on the row itself — see
 * `notifyAndRecord` at the bottom of this file and migration 0029.
 *
 * Validates at the boundary — nothing that arrives here is trusted, including
 * the subject, which must be one of the four keys the form offers.
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

/**
 * Two things post here, and they carry different amounts of information.
 *
 * `contact` — the full form: name, subject, message, all required.
 * `cv`      — the CV request panel: an email address, and optionally one line.
 *             There is no name field and nothing else to collect, because the
 *             whole message is pre-composed and fixed.
 *
 * This is one mechanism with two shapes, not two mechanisms. The honeypot,
 * the timing window and the global ceiling above apply identically to both —
 * which is the point of extending this route rather than adding another.
 *
 * `contact_messages.name` and `.message` are NOT NULL, so a CV request stores
 * empty strings for what it genuinely did not collect. That is the honest
 * shape: `subject = 'cv'` says what the row is, `email` says where the CV
 * goes, and an empty name is an absence rather than an invention.
 */
type Kind = "contact" | "cv";

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

  const kind: Kind = clean(body.kind, 20) === "cv" ? "cv" : "contact";

  const name = clean(body.name, 120);
  const email = clean(body.email, 254);
  const message = clean(body.message, 5_000);
  const rawSubject = clean(body.subject, 40);

  /*
   * A CV request needs only a valid address; the line about themselves is
   * optional by design and an empty one is stored as empty rather than
   * padded. The contact form keeps its original, stricter contract.
   */
  const valid =
    kind === "cv" ? looksLikeEmail(email) : Boolean(name && message) && looksLikeEmail(email);

  if (!valid) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const subject = kind === "cv" ? "cv" : SUBJECTS.has(rawSubject) ? rawSubject : null;

  /*
   * ── STEP 1: STORE. This alone decides what the visitor sees. ──────────────
   *
   * `select().single()` because the notification needs the row id, so the mail
   * can name the row it describes and the outcome can be written back to it.
   */
  const { data: row, error } = await supabaseServer
    .from("contact_messages")
    .insert({ name, email, subject, message })
    .select("id, created_at")
    .single();

  if (error || !row) {
    // The message is lost to the visitor either way; what matters is that the
    // form tells them so, and that the direct email is still on the page.
    console.error("[contact] insert failed:", error?.message);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }

  /*
   * ── STEP 2: NOTIFY. Cannot change the outcome above. ──────────────────────
   *
   * Decision 051: email is a notification on top of storage, never instead of
   * it. The message is already saved, so there is nothing here worth failing
   * the request over — a provider outage must not tell a visitor their message
   * was lost when it was not.
   *
   * Awaited rather than deferred. `after()` would shave ~300ms off the
   * response, and would do it by moving the send into a phase where a failure
   * cannot be written back to the row — which is the one thing that makes a
   * silent outage findable. The latency is worth the evidence.
   *
   * The whole block is wrapped even though `notifyContactSubmission` is
   * documented never to throw: "documented not to throw" and "cannot throw" are
   * different claims, and the cost of being wrong here is a stored message
   * reported to the visitor as an error.
   */
  try {
    await notifyAndRecord({
      id: row.id,
      kind,
      email,
      name,
      message,
      subjectKey: subject,
      createdAt: row.created_at,
    });
  } catch (unexpected) {
    console.error("[contact] notification block threw unexpectedly:", unexpected);
  }

  return NextResponse.json({ ok: true });
}

/**
 * Resolve the subject label, send, and record the outcome on the row.
 *
 * Split out so the request path above reads as the two steps it is. Every
 * failure inside is swallowed and recorded — the caller has already committed
 * to a 200.
 */
async function notifyAndRecord(input: {
  id: string;
  kind: Kind;
  email: string;
  name: string;
  message: string;
  subjectKey: string | null;
  createdAt: string;
}): Promise<void> {
  /*
   * The subject LABEL comes from the database, the rest of the mail does not.
   * The label is the visitor's own choice from a `ui_strings` list, so the
   * notification should name it the way the site named it — `hiring` is a key,
   * "Hiring" is what they picked. English only: this mail has one reader.
   *
   * A CV request has no subject to resolve — the key is the literal `cv`, which
   * identifies the row rather than describing a choice, and the mail already
   * says "CV REQUEST" at the top.
   *
   * If `ui_strings` cannot be reached, the notification still goes out without
   * a label. A missing word must not cost the whole message.
   */
  let subjectLabel: string | null = null;
  if (input.kind === "contact" && input.subjectKey) {
    try {
      const ui = await getUiStrings("en");
      subjectLabel = ui.t(`form_subject_${input.subjectKey}`) ?? null;
    } catch (labelError) {
      console.error("[contact] subject label lookup failed:", labelError);
    }
  }

  const result = await notifyContactSubmission({
    id: input.id,
    kind: input.kind,
    email: input.email,
    name: input.name,
    message: input.message,
    subjectLabel,
    createdAt: input.createdAt,
  });

  if (!result.ok) {
    // Loud in the deployed case, and durable in the row either way. The two
    // answer different questions: the log says "something is wrong now", the
    // column says "these specific people were never announced".
    console.error(`[contact] notification failed for row ${input.id}: ${result.error}`);
  }

  /*
   * Write the outcome back. Also guarded: if this update fails, the row simply
   * keeps `notified_at = null`, which the unnotified query already treats as
   * "not known to have been sent". Failing safe means over-reporting misses,
   * never under-reporting them.
   */
  try {
    await supabaseServer
      .from("contact_messages")
      .update(
        result.ok
          ? { notified_at: new Date().toISOString(), notify_error: null }
          : { notified_at: null, notify_error: result.error },
      )
      .eq("id", input.id);
  } catch (updateError) {
    console.error("[contact] could not record notification state:", updateError);
  }
}
