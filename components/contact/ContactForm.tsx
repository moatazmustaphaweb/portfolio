"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The contact form.
 *
 * Posts to /api/contact, which writes to `contact_messages` (decision 044,
 * option A). `deliveryConfigured` is kept as a prop rather than assumed: with
 * it false the fields still render and the submit button is replaced by the
 * direct email, which is what shipped while the question was open and is the
 * right behaviour again if delivery is ever turned off.
 *
 * Spam control lives mostly in the route. What belongs here is the honeypot
 * field and the render timestamp — see below, and the route's header for why
 * a per-IP rate limit is not among the controls.
 *
 * Every string arrives resolved from `ui_strings` (rule 1) — this component
 * contains no copy of its own.
 */

export type ContactStrings = {
  name?: string;
  email?: string;
  subject?: string;
  subjectOptions: { value: string; label?: string }[];
  message?: string;
  messagePlaceholder?: string;
  submit?: string;
  sending?: string;
  success?: string;
  error?: string;
  required?: string;
};

export function ContactForm({
  strings,
  deliveryConfigured,
  fallbackEmail,
}: {
  strings: ContactStrings;
  /** False until open question D is answered. */
  deliveryConfigured: boolean;
  /** `settings.email` — the route that works regardless. */
  fallbackEmail?: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  /*
   * When the form became fillable. Set on mount rather than at render, because
   * this page is statically generated — a build-time timestamp would be hours
   * old for every visitor and the route's freshness window would reject them
   * all. The route treats a missing value as "unknown" rather than as failure.
   */
  const renderedAt = useRef<number | null>(null);
  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");

    const body = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, renderedAt: renderedAt.current }),
      });
      setState(res.ok ? "sent" : "failed");
    } catch {
      setState("failed");
    }
  }

  const field =
    "mt-2 w-full rounded-control border border-DEFAULT bg-surface px-4 py-3 text-body text-fg " +
    "transition-colors placeholder:text-fg-dim focus:border-strong focus:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-accent";
  const label = "font-mono text-micro uppercase text-fg-dim";

  if (state === "sent") {
    return (
      <p role="status" className="mt-6 max-w-measure text-body text-fg">
        {strings.success}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate={false} className="mt-6 flex flex-col gap-6">
      {/*
        Honeypot. Hidden from people — including from screen readers, via
        aria-hidden and tabIndex -1, because a field a blind visitor fills in
        would silently discard their message. Offered only to bots that fill
        every input they can parse.

        `position: absolute; left: -9999px` rather than `display: none`: some
        bots skip fields that are display:none specifically because it is the
        obvious tell.
      */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="contact-name" className={label}>
          {strings.name}
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className={field}
        />
      </div>

      <div>
        <label htmlFor="contact-email" className={label}>
          {strings.email}
        </label>
        {/*
          `dir="ltr"` and `text-align: start`, from the design.
          An email address is always left-to-right. Left in the page's RTL
          direction, "moataz@example.com" renders with the domain leading and
          the caret jumping — the field is unusable in Arabic. The label above
          it stays RTL; only the value is forced.
        */}
        <input
          id="contact-email"
          name="email"
          type="email"
          dir="ltr"
          required
          autoComplete="email"
          className={`${field} text-start`}
        />
      </div>

      {strings.subjectOptions.length > 0 ? (
        <div>
          <label htmlFor="contact-subject" className={label}>
            {strings.subject}
          </label>
          <select id="contact-subject" name="subject" className={field}>
            {strings.subjectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div>
        <label htmlFor="contact-message" className={label}>
          {strings.message}
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          required
          placeholder={strings.messagePlaceholder}
          className={field}
        />
      </div>

      {state === "failed" ? (
        <p role="alert" className="max-w-measure text-body-sm text-fg">
          {strings.error}
        </p>
      ) : null}

      {deliveryConfigured ? (
        <div>
          <button
            type="submit"
            disabled={state === "sending"}
            className="inline-flex h-control-h items-center rounded-control border border-strong px-5 text-ui text-fg transition-colors hover:border-fg disabled:opacity-60"
          >
            {state === "sending" ? strings.sending : strings.submit}
          </button>
        </div>
      ) : fallbackEmail ? (
        /*
          Delivery undecided. Rather than a button that fails, the direct route
          — which is the same action the visitor wanted.
        */
        <div>
          <a
            href={`mailto:${fallbackEmail}`}
            className="inline-flex h-control-h items-center rounded-control border border-strong px-5 text-ui text-fg transition-colors hover:border-fg"
          >
            {fallbackEmail}
          </a>
        </div>
      ) : null}
    </form>
  );
}
