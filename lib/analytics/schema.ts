/**
 * Event contract — shared by the client sender and the /api/events handler.
 *
 * PRIVACY IS A HARD CONSTRAINT, not a default (architecture Part 3.5, and the
 * transparency promise the brand rests on). The rules this file enforces:
 *
 *   1. Anonymous session IDs only. Generated client-side, held in
 *      sessionStorage — not a cookie, not localStorage. It dies with the tab,
 *      so it is not a cross-visit identifier.
 *   2. No PII in payloads, ever. Keys are allowlisted per event type, and
 *      values are scanned for anything that looks personal before insert.
 *   3. No IP is stored. The request necessarily has one; we never read it.
 *   4. No User-Agent is stored. It is read once to bucket the device into one
 *      of three literals, then discarded.
 *   5. No full referrer. Only a category — a referrer URL can itself carry
 *      personal information (a search query, a private document URL).
 *   6. Approximate geography only — country and city, resolved at the edge.
 *      The IP is never read by our code, so there is nothing to discard.
 *      No region, no coordinates, no postal code, no timezone.
 *
 * The Layer 2 `/how-this-site-works` page will publish these claims. They have
 * to be true, not approximately true.
 */

/** Event types, per docs/schema.md. */
export const EVENT_TYPES = [
  "page_view",
  "scroll_depth",
  "chapter_complete",
  "entry_handle",
  "door_card",
  "door_budget",
  "door_hypothesis",
  "door_action",
  "door_persona",
  "feedback_response",
  "email_capture",
  "stat_note_seen",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

/**
 * Allowlisted payload keys per event type. Anything not listed is rejected —
 * an allowlist rather than a blocklist, so a new field cannot arrive by
 * accident and quietly start collecting something.
 *
 * ⚠️ `email_capture` deliberately has NO key for the address. The schema names
 * the event, which makes it look like the place an email would go — it is not.
 * An address is personal data with its own consent and retention questions and
 * belongs in its own table, never in an analytics payload. This event records
 * only that a capture happened and where.
 */
export const PAYLOAD_KEYS: Record<EventType, readonly string[]> = {
  page_view: ["route", "locale"],
  scroll_depth: ["route", "percent"],
  chapter_complete: ["case_file", "chapter"],
  entry_handle: ["case_file", "handle"],
  door_card: ["card", "position"],
  door_budget: ["budget"],
  door_hypothesis: ["archetype", "confidence"],
  door_action: ["action"],
  door_persona: ["archetype", "corrected"],
  feedback_response: ["route", "response"],
  email_capture: ["source"], // never the address itself — see above
  stat_note_seen: ["route", "note"],
};

export const MAX_PAYLOAD_BYTES = 1024;

export type EventInput = {
  sessionId: string;
  type: EventType;
  payload?: Record<string, unknown>;
  locale?: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-9a-f][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export function isEventType(value: unknown): value is EventType {
  return (
    typeof value === "string" && (EVENT_TYPES as readonly string[]).includes(value)
  );
}

/**
 * Heuristic PII detector. A backstop, not the primary defence — the key
 * allowlist is. This catches the case where an allowed key is given a value it
 * should never hold, e.g. `{ source: "moataz@example.com" }`.
 *
 * Deliberately conservative: a false positive costs one dropped analytics
 * event, a false negative costs the transparency promise.
 */
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]{2,}/;
const PHONE_RE = /(?:\+|00)\d[\d\s().-]{7,}/;
const LONG_DIGITS_RE = /\d{9,}/; // card numbers, IBANs, national IDs

/**
 * Payload values must be primitives. Nested objects and arrays are rejected
 * outright — they are how structured personal data arrives without tripping
 * the key allowlist (`{ user: { email: … } }` has an allowlisted top-level
 * key). It also makes the payload trivially JSON-serialisable.
 */
export type PayloadValue = string | number | boolean | null;

export function isPrimitivePayload(
  payload: Record<string, unknown>,
): payload is Record<string, PayloadValue> {
  return Object.values(payload).every(
    (v) =>
      v === null ||
      typeof v === "string" ||
      typeof v === "number" ||
      typeof v === "boolean",
  );
}

export function findLikelyPii(payload: Record<string, unknown>): string | null {
  for (const [key, value] of Object.entries(payload)) {
    if (typeof value !== "string") continue;
    if (EMAIL_RE.test(value)) return `${key} looks like an email address`;
    if (PHONE_RE.test(value)) return `${key} looks like a phone number`;
    if (LONG_DIGITS_RE.test(value)) return `${key} contains a long digit string`;
  }
  return null;
}

/**
 * Categorise a referrer WITHOUT storing it. The URL itself can carry personal
 * information — a search query string, an internal document URL — so only the
 * category is ever returned.
 */
export function referrerType(referrer: string | null | undefined): string {
  if (!referrer) return "direct";
  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return "direct";
  }
  if (/(google|bing|duckduckgo|yandex|baidu|ecosia|brave)\./.test(host)) {
    return "search";
  }
  if (
    /(linkedin|twitter|x\.com|facebook|instagram|threads|mastodon|bsky|reddit|t\.co)\./.test(
      host,
    )
  ) {
    return "social";
  }
  if (/(chatgpt|openai|claude|anthropic|perplexity|copilot)\./.test(host)) {
    return "ai";
  }
  return "referral";
}

/**
 * Approximate geography, taken from headers Vercel resolves at the edge.
 *
 * The raw IP never enters this codebase — we read a country code and a city
 * name that were already derived upstream. That is stronger than resolving it
 * ourselves and deleting the address afterwards: there is no window in which
 * we hold it, and no code path that could log it by accident.
 *
 * Returns nulls off-Vercel (local development), which is correct — an
 * unknown location is better than a guessed one.
 */
export function geography(headers: Headers): {
  country: string | null;
  city: string | null;
} {
  const country = headers.get("x-vercel-ip-country");
  const rawCity = headers.get("x-vercel-ip-city");

  let city: string | null = null;
  if (rawCity) {
    // Vercel percent-encodes city names containing spaces or non-ASCII.
    try {
      city = decodeURIComponent(rawCity);
    } catch {
      city = rawCity;
    }
  }

  return {
    // Two-letter ISO code, or nothing. Guards against a malformed header
    // becoming a junk value in the aggregate.
    country: country && /^[A-Z]{2}$/i.test(country) ? country.toUpperCase() : null,
    city: city && city.length <= 100 ? city : null,
  };
}

/**
 * Bucket the device from a User-Agent. The UA is read here and discarded — only
 * the returned literal is ever stored. Coarse on purpose: a finer classification
 * would edge toward fingerprinting, which rule 4 above forbids.
 */
export function deviceType(userAgent: string | null | undefined): string {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk|android(?!.*mobile)/.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android|blackberry|opera mini|iemobile/.test(ua)) {
    return "mobile";
  }
  return "desktop";
}
