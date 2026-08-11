"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import type { EventType } from "@/lib/analytics/schema";

/**
 * Client-side event sender.
 *
 * The session id lives in **sessionStorage**, deliberately:
 *   - not a cookie — no cookie banner obligation, and nothing sent on every
 *     request to every endpoint
 *   - not localStorage — that would persist across visits and become a
 *     cross-visit identifier, which the privacy posture rules out
 *   - sessionStorage is per-tab and dies when the tab closes, which is the
 *     honest meaning of "session"
 *
 * The consequence is that a returning visitor is a new session, and two tabs
 * are two sessions. That undercounts unique people. It is the correct trade:
 * the claim being protected is "we cannot follow you", and an identifier that
 * survives the visit would make that claim false.
 */

const KEY = "session_id";

function sessionId(): string | null {
  try {
    const existing = sessionStorage.getItem(KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    sessionStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    // Private browsing can reject storage. No id means no event — analytics
    // is never worth degrading the page for.
    return null;
  }
}

export function track(
  type: EventType,
  payload?: Record<string, unknown>,
  locale?: string,
): void {
  const id = sessionId();
  if (!id) return;

  const body = JSON.stringify({ sessionId: id, type, payload, locale });

  /*
   * sendBeacon survives the page being closed or navigated away from, which is
   * exactly when scroll_depth and chapter_complete fire. It also cannot block
   * navigation. fetch with keepalive is the fallback.
   */
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
      return;
    }
  } catch {
    // fall through
  }

  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Analytics must never surface an error to a visitor.
  });
}

/**
 * Mounted once in the layout. Sends a page_view per route change.
 */
export function Analytics({ locale }: { locale: string }) {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    // React 18 StrictMode double-invokes effects in development; without this
    // guard every page_view would be recorded twice.
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;

    track("page_view", { route: pathname, locale }, locale);
  }, [pathname, locale]);

  return null;
}
