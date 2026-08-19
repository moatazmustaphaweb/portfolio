import "server-only";

/**
 * Operator notification for contact and CV submissions (decision 051).
 *
 * Storage is still the system of record — `contact_messages` holds the message
 * and the visitor's response is decided by that insert alone. This module only
 * tells Moataz a row arrived. It is a notification layer over storage, never a
 * replacement for it.
 *
 * ── NO SDK ──────────────────────────────────────────────────────────────────
 *
 * Resend's REST API is one POST with a bearer token and a JSON body, which is
 * what the `resend` package wraps. Calling it directly keeps `package.json`
 * unchanged and leaves nothing to keep patched.
 *
 * ── NOTHING HERE IS SENT TO THE VISITOR ─────────────────────────────────────
 *
 * No auto-reply, no confirmation, no CV attached. The visitor is told on-screen
 * that Moataz will reply, and then Moataz replies himself. That is the design of
 * the CV flow, not a limitation of it — so this module has exactly one
 * recipient, read from `CONTACT_NOTIFY_TO`, and no code path that can address
 * anyone else.
 *
 * ── WHY THE COPY IN HERE IS HARDCODED, AND WHY THAT IS NOT A RULE 1 BREACH ──
 *
 * Rule 1 governs what a VISITOR reads. This mail is addressed to the operator,
 * so its labels — `From:`, `Kind:`, `Received:` — are operational, closer to a
 * column name or a log line than to page copy. Confirmed as the intended reading
 * by Moataz and recorded in decision 051.
 *
 * The one thing resolved from the database is the SUBJECT LABEL, because that
 * is the visitor's own choice from a `ui_strings` list. If the notification said
 * `hiring` while the site said "Hiring", the two would describe the same choice
 * differently. The label is resolved in English only; there is no Arabic
 * translation of a mail read by one bilingual person.
 */

/** Which of the two things posted. `cv` needs a different reaction to an enquiry. */
export type NotifyKind = "contact" | "cv";

export type NotifyInput = {
  /** `contact_messages.id`, so the mail points at the row it describes. */
  id: string;
  kind: NotifyKind;
  /**
   * The visitor's address. Always body content; additionally a `Reply-To`
   * header IF AND ONLY IF it survives `safeReplyTo`. See that function.
   */
  email: string;
  name: string;
  /** The message, or the CV panel's optional line. May be empty. */
  message: string;
  /** The resolved `ui_strings` label, e.g. "Hiring". Null for a CV request. */
  subjectLabel: string | null;
  createdAt: string;
};

export type NotifyResult = { ok: true } | { ok: false; error: string };

const ENDPOINT = "https://api.resend.com/emails";

/** A hung provider must not hold the visitor's request open indefinitely. */
const TIMEOUT_MS = 10_000;

/** `notify_error` is a diagnostic, not a transcript. */
const MAX_ERROR_LEN = 500;

/**
 * RFC 5321 caps: 64 for the local part, 254 for the whole address. Enforced
 * here rather than trusted from upstream — this function is the last thing
 * standing between visitor input and a mail header.
 */
const MAX_REPLY_TO_LEN = 254;
const MAX_LOCAL_LEN = 64;

/**
 * Deliberately far stricter than `looksLikeEmail()` in the route.
 *
 * They are answering different questions. The route asks "is this plausibly a
 * real address, so should I accept this message?" and errs toward accepting,
 * because a rejected message is a lost visitor. This asks "can this string go
 * into a mail header?" and errs toward refusing, because the cost of a wrong
 * yes is header injection.
 *
 * No display names, no angle brackets, no quoted local parts, no groups, no
 * comments. All of those are legal RFC 5322 address syntax and none of them
 * are needed here: the only thing that ever reaches this is a single address
 * typed into a form field.
 */
const STRICT_ADDRESS =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;

/** Characters that must never appear, checked before anything structural. */
function hasControlCharacter(value: string): boolean {
  for (const char of value) {
    const code = char.codePointAt(0);
    if (code === undefined) return true;
    if (
      code < 0x20 || // C0, which is where CR (0x0d) and LF (0x0a) live
      code === 0x7f || // DEL
      (code >= 0x80 && code <= 0x9f) || // C1
      code === 0x2028 || // LINE SEPARATOR
      code === 0x2029 // PARAGRAPH SEPARATOR
    ) {
      return true;
    }
  }
  return false;
}

export type ReplyToDecision =
  | { ok: true; address: string }
  | { ok: false; reason: string };

/**
 * Decide whether the visitor's address may become a `Reply-To` header.
 *
 * Exported for direct testing: the route's own validation rejects most hostile
 * shapes before they reach this module, which means an end-to-end test cannot
 * exercise these branches. A guard that cannot be tested where it runs gets
 * tested where it is.
 *
 * Returns the reason on refusal so the notification can say WHY replying will
 * not work, rather than silently behaving differently from one mail to the next.
 */
export function safeReplyTo(value: unknown): ReplyToDecision {
  if (typeof value !== "string") return { ok: false, reason: "not a string" };

  /*
   * ── FIRST, BEFORE ANYTHING ELSE ─────────────────────────────────────────
   *
   * CR and LF are the injection vector: a header is terminated by CRLF, so an
   * address containing one can end the Reply-To header and begin another —
   * `victim@example.com\r\nBcc: everyone@example.com`. Checked on the raw
   * value BEFORE trimming, because trimming would quietly repair a trailing
   * newline and turn a hostile value into an accepted one.
   *
   * The whole C0/C1 range goes, not just CR and LF. Nothing legitimate in an
   * email address is a control character, and enumerating only the two
   * characters known to be dangerous is how the third one gets through.
   */
  if (hasControlCharacter(value)) {
    return { ok: false, reason: "contains a control character" };
  }

  // Length before structure: never run a regex over an unbounded string.
  if (value.length === 0) return { ok: false, reason: "empty" };
  if (value.length > MAX_REPLY_TO_LEN) {
    return { ok: false, reason: `longer than ${MAX_REPLY_TO_LEN} characters` };
  }

  /*
   * No trimming. If the value has surrounding whitespace it is not the bare
   * address this header requires, and silently repairing input is how a
   * validator and the thing it validates drift apart.
   */
  if (value !== value.trim()) {
    return { ok: false, reason: "leading or trailing whitespace" };
  }

  // Explicit refusals, named individually so the reason is useful. Every one
  // of these is also caught by STRICT_ADDRESS below; they are listed because a
  // reason of "malformed" tells nobody anything.
  if (/[<>]/.test(value)) return { ok: false, reason: "contains angle brackets" };
  if (/[,;]/.test(value)) return { ok: false, reason: "contains a comma or semicolon" };
  if (/\s/.test(value)) return { ok: false, reason: "contains whitespace" };
  if (/["'()[\]\\]/.test(value)) return { ok: false, reason: "contains quoting or grouping characters" };

  // Exactly one address means exactly one @.
  const atCount = (value.match(/@/g) ?? []).length;
  if (atCount !== 1) {
    return { ok: false, reason: atCount === 0 ? "no @" : "more than one address" };
  }

  const [local, domain] = value.split("@");
  if (local.length > MAX_LOCAL_LEN) {
    return { ok: false, reason: `local part longer than ${MAX_LOCAL_LEN} characters` };
  }
  if (domain.length > 255) return { ok: false, reason: "domain longer than 255 characters" };

  if (!STRICT_ADDRESS.test(value)) {
    return { ok: false, reason: "not a single bare address" };
  }

  return { ok: true, address: value };
}

/**
 * Read at call time rather than at module scope.
 *
 * A missing key is a runtime STATE — "notifications are not configured yet" —
 * and it must surface as a recorded `notify_error` on the row. Reading env at
 * import time would turn it into a module-load crash, which would take down the
 * whole route and lose the message: the exact inversion this design refuses.
 */
function config() {
  return {
    apiKey: process.env.RESEND_API_KEY,
    to: process.env.CONTACT_NOTIFY_TO,
    from: process.env.CONTACT_NOTIFY_FROM,
  };
}

function truncate(value: string): string {
  return value.length > MAX_ERROR_LEN ? `${value.slice(0, MAX_ERROR_LEN - 1)}…` : value;
}

/**
 * Dubai, named. Moataz is in Dubai and acts on these from a phone; a bare UTC
 * stamp means arithmetic before he knows whether something arrived at breakfast
 * or at midnight. The ISO value goes on the same line so the mail is still
 * unambiguous to anything that parses it.
 */
function stamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const local = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dubai",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
  return `${local} (Dubai) · ${iso}`;
}

/** Subject line: the kind first, because it is what decides the reaction. */
function subjectLine(input: NotifyInput): string {
  if (input.kind === "cv") return `CV request — ${input.email}`;
  return input.subjectLabel
    ? `Contact (${input.subjectLabel}) — ${input.email}`
    : `Contact — ${input.email}`;
}

/**
 * Plain text, not HTML. Everything needed to act is here, so the dashboard is
 * never the only way to read a message — which was the actual complaint.
 */
function body(input: NotifyInput, replyTo: ReplyToDecision): string {
  const isCv = input.kind === "cv";
  const lines: string[] = [
    isCv ? "CV REQUEST" : "CONTACT ENQUIRY",
    "moatazmustapha.com",
    "",
    `From:      ${input.email}`,
  ];

  // The CV panel collects no name — it has nothing to put in one. An empty
  // label would read as a name that failed to arrive rather than a field that
  // was never asked for, so the line is omitted instead.
  if (input.name) lines.push(`Name:      ${input.name}`);

  lines.push(`Kind:      ${isCv ? "CV request" : "General enquiry"}`);
  if (input.subjectLabel) lines.push(`Subject:   ${input.subjectLabel}`);
  lines.push(`Received:  ${stamp(input.createdAt)}`);
  lines.push("");

  if (input.message) {
    lines.push(isCv ? "They added:" : "Message:", "", input.message);
  } else {
    lines.push(
      isCv
        ? "They left the optional line blank."
        : "No message body was submitted.",
    );
  }

  lines.push("", "—");

  if (isCv) {
    lines.push("Send the CV yourself. Nothing was attached and nothing was sent to them.");
  }

  /*
   * Whether Reply-To was set is stated in every mail, in both directions.
   *
   * The previous wording — "replying does NOT reach them" — was unconditional
   * and is now true only sometimes. An unconditional line that is sometimes
   * wrong is worse than no line: it would train the habit of ignoring it, and
   * the one time it mattered would be the time a reply went nowhere.
   *
   * The failure case names the reason, because "your reply will not arrive" is
   * an instruction to do something else, and the reason is what says what.
   */
  if (replyTo.ok) {
    lines.push(`Reply to this message and it goes to ${replyTo.address}.`);
  } else {
    lines.push(
      "Reply-To is NOT set on this message — replying reaches nobody.",
      `Their address did not pass strict validation (${replyTo.reason}), so it was`,
      "kept out of the header. Copy it from the From: line above instead.",
    );
  }

  lines.push(`Row ${input.id} in contact_messages.`);

  return lines.join("\n");
}

/**
 * The exact JSON body POSTed to Resend.
 *
 * Split out from the sending so it can be inspected without sending anything —
 * "is the header present?" should be answerable by reading the payload, not
 * inferred from a 200 or from looking in an inbox.
 */
export function buildNotificationPayload(input: NotifyInput, from: string, to: string) {
  const replyTo = safeReplyTo(input.email);

  return {
    from,
    to: [to],
    subject: subjectLine(input),
    text: body(input, replyTo),
    /*
     * Present only when the address survived `safeReplyTo`. Spread rather than
     * set-to-undefined so the key is genuinely ABSENT from the JSON on
     * refusal — `reply_to: undefined` would serialise away here, but relying on
     * that is relying on a serialiser detail for a security property.
     *
     * The address is in the body either way (see above). The header is a
     * convenience; the body is the record.
     */
    ...(replyTo.ok ? { reply_to: replyTo.address } : {}),
  };
}

/**
 * Send the notification. Resolves to a result; **never throws.**
 *
 * The caller has already stored the message by the time this runs, so there is
 * no failure here worth turning into a visitor-facing error. Every path returns
 * a value, including a thrown fetch, a timeout and a missing key.
 */
export async function notifyContactSubmission(input: NotifyInput): Promise<NotifyResult> {
  const { apiKey, to, from } = config();

  // Named individually. "Notifications are not configured" sends someone to
  // check three variables; naming the missing one sends them to the right line.
  const missing = [
    !apiKey && "RESEND_API_KEY",
    !to && "CONTACT_NOTIFY_TO",
    !from && "CONTACT_NOTIFY_FROM",
  ].filter(Boolean);

  // The truthiness checks above already establish this; restated as a narrowing
  // guard so the compiler agrees rather than being told to with a cast.
  if (missing.length > 0 || !apiKey || !to || !from) {
    return { ok: false, error: `not configured: ${missing.join(", ")} unset` };
  }

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildNotificationPayload(input, from, to)),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      // Resend puts a useful reason in the body — a sandbox restriction reads
      // as "You can only send testing emails to your own address". Worth
      // keeping verbatim; it is the difference between a wrong key and a wrong
      // recipient. Never contains the key.
      const detail = await response.text().catch(() => "");
      return {
        ok: false,
        error: truncate(`resend ${response.status}: ${detail || response.statusText}`),
      };
    }

    return { ok: true };
  } catch (error) {
    // A timeout arrives here as a TimeoutError, a DNS failure as a TypeError.
    // Both are the same thing to the caller: not sent, and here is why.
    const reason = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    return { ok: false, error: truncate(reason) };
  }
}
