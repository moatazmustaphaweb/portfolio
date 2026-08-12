"use client";

import { useState } from "react";

/**
 * The contact form.
 *
 * ⚠️ DELIVERY IS UNDECIDED — open question D. This component does not choose.
 * It takes `deliveryConfigured`, and when that is false it renders the fields
 * exactly as they will ship but replaces the submit button with the direct
 * email route.
 *
 * Why not just wire it to a Supabase table and be done: that stores names,
 * email addresses and message bodies, and this project's standing rule is that
 * privacy is a hard constraint rather than a default — anything collecting
 * more than the minimum gets flagged, not implemented. Creating a table of
 * personal data is exactly that kind of decision, and it is reversible only in
 * the sense that deleting rows is possible after they exist.
 *
 * A form that posts into a void is worse than no form, so until delivery is
 * decided the page still offers a way to make contact that works.
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

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");

    const body = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={field}
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
