"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * The CV request panel.
 *
 * The CV is not published as a file. A visitor asks, and Moataz sends it —
 * this is interest capture, not automated delivery. The panel is styled as a
 * mail compose window so the visitor can see exactly what they are sending:
 * To, Subject and body are fixed and inert, and only two things are editable.
 *
 * It posts to `/api/contact` with `kind: "cv"` — the same endpoint, the same
 * honeypot, the same timing window, the same global ceiling. There is no
 * second send mechanism.
 *
 * ⚠️ "Send" writes a row to `contact_messages`. It does NOT send an email —
 * nothing in this project does. See the entry in docs/status.md.
 *
 * NO MOTION. Decision 023: the panel appears, it does not slide, fade or
 * animate, and the phone layout is a bottom sheet in geometry only. There is
 * no transition on any property here, including transform, which decision 048
 * scopes to the Motion Layer regardless.
 *
 * Every string arrives resolved from `ui_strings` (rule 1) — no copy here.
 */

export type CvStrings = {
  trigger?: string;
  toLabel?: string;
  subjectLabel?: string;
  subjectValue?: string;
  greeting?: string;
  body?: string;
  optionalPlaceholder?: string;
  emailPlaceholder?: string;
  close?: string;
  submit?: string;
  sending?: string;
  success?: string;
  error?: string;
};

export function CvRequestPanel({
  strings,
  toAddress,
  variant = "button",
}: {
  strings: CvStrings;
  /** `settings.email`. One source for the address — never a second literal. */
  toAddress?: string;
  /**
   * `button` on the contact page, where it is a primary action alongside the
   * other CTAs. `link` in the footer, where it sits in a row of text links and
   * a bordered control would shout. Same panel either way.
   */
  variant?: "button" | "link";
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [email, setEmail] = useState("");
  const [invalid, setInvalid] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  /* Set on mount, not at render: this page is statically generated, so a
   * build-time timestamp would be hours old and the route's freshness window
   * would reject every visitor. Same reasoning as the contact form. */
  const renderedAt = useRef<number | null>(null);
  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  const titleId = useId();

  /*
   * Focus goes into the panel on open and comes back to the trigger on close,
   * Escape closes, and Tab cycles within the panel rather than escaping to the
   * page behind it. Written out rather than pulled from a library: it is one
   * dialog, and a dependency for it would not earn its weight.
   */
  useEffect(() => {
    if (!open) return;

    emailRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        // `close()`, not `setOpen(false)` — Escape must reset the send state
        // too, or reopening shows a stale success or error message.
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, input, textarea, a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  /*
   * Returning focus is what makes the panel usable by keyboard at all —
   * without it, closing drops the caret at the top of the document.
   *
   * Guarded by `wasOpen`, because an unguarded `if (!open) focus()` also fires
   * on MOUNT, where `open` is already false: every page carrying this panel
   * would steal focus to the trigger on load, which moves a keyboard visitor's
   * starting point and skips the skip-link. Only an actual open→closed
   * transition should return focus.
   */
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open) triggerRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  function close() {
    setOpen(false);
    setState("idle");
    setInvalid(false);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Deliberately loose, and matched to the route's own check. The point is
    // to catch a typo, not to argue about what a valid address may contain.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setInvalid(true);
      emailRef.current?.focus();
      return;
    }
    setInvalid(false);
    setState("sending");

    const form = new FormData(event.currentTarget);
    const note = String(form.get("message") ?? "").trim();

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "cv",
          email: email.trim(),
          // Omitted entirely when blank — no empty line, no dangling label.
          message: note,
          name: "",
          website: String(form.get("website") ?? ""),
          renderedAt: renderedAt.current,
        }),
      });
      setState(res.ok ? "sent" : "failed");
    } catch {
      setState("failed");
    }
  }

  const line = "font-mono text-meta text-fg-dim";
  const inputBase =
    "w-full rounded-control border border-DEFAULT bg-surface px-3 py-2 text-body text-fg " +
    "placeholder:text-fg-dim focus:border-strong focus:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-accent";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className={
          variant === "link"
            ? "text-ui text-fg-muted transition-colors hover:text-fg"
            : "inline-flex h-control-h items-center gap-2 rounded-control border border-strong px-5 text-ui text-fg transition-colors hover:border-fg"
        }
      >
        {strings.trigger}
      </button>

      {open ? (
        <>
          {/* Scrim. No transition — it is present or it is not. */}
          <div
            className="fixed inset-0 z-40 bg-scrim"
            onClick={close}
            aria-hidden="true"
          />

          {/*
            Positioning lives on this wrapper, not on the dialog, and it is a
            flex box rather than offset maths.

            The first attempt centred with `left-1/2` plus a negative
            `margin-inline-start`, which put the panel off-screen in Arabic:
            `left` is physical and `ms` is logical, so under dir="rtl" they
            pull in opposite directions. Flex centring has no sides at all and
            is correct in both directions by construction.

            Bottom sheet on a phone, centred from `sm` up — a difference of
            alignment only. Nothing animates into place (decision 023).
          */}
          <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="max-h-[90vh] w-full overflow-y-auto rounded-t-panel border border-strong bg-surface p-card-p
                         sm:w-[min(44rem,92vw)] sm:rounded-panel"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 id={titleId} className="text-h3 text-fg">
                  {strings.trigger}
                </h2>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-control border border-DEFAULT px-3 py-1 text-ui text-fg-muted hover:border-strong hover:text-fg"
                >
                  {strings.close}
                </button>
              </div>

              {state === "sent" ? (
                <p role="status" className="mt-6 text-body text-fg">
                  {strings.success}
                </p>
              ) : (
                <form onSubmit={onSubmit} className="mt-5">
                  {/*
                    The fixed header of the message. Inert text, not disabled
                    inputs — a disabled input announces as a form control the
                    visitor cannot use, which is a worse thing to hear than a
                    line of text.
                  */}
                  <div className="rounded-panel border border-DEFAULT bg-surface-raised p-4">
                    <p className={line}>
                      <span className="text-fg-muted">{strings.toLabel}</span>{" "}
                      <span dir="ltr">{toAddress}</span>
                    </p>
                    <p className={`${line} mt-1`}>
                      <span className="text-fg-muted">{strings.subjectLabel}</span>{" "}
                      {strings.subjectValue}
                    </p>

                    <div className="mt-4 border-t border-subtle pt-4 text-body text-fg-body">
                      <p>{strings.greeting}</p>
                      <p className="mt-3">{strings.body}</p>
                    </div>

                    <div className="mt-4 flex flex-col gap-3">
                      {/* The one optional line. */}
                      <textarea
                        name="message"
                        rows={2}
                        placeholder={strings.optionalPlaceholder}
                        className={`${inputBase} resize-none`}
                      />

                      {/*
                        Required. Latin and dir="ltr" in both locales — an email
                        address typed into an RTL field reverses as you type,
                        which looks like a bug to the person typing it.
                      */}
                      <input
                        ref={emailRef}
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        required
                        dir="ltr"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (invalid) setInvalid(false);
                        }}
                        aria-invalid={invalid || undefined}
                        placeholder={strings.emailPlaceholder}
                        className={`${inputBase} text-start ${invalid ? "border-strong" : ""}`}
                      />
                    </div>
                  </div>

                  {/* Honeypot — hidden from people and from assistive tech, and
                      offered only to bots. Same field name the route expects. */}
                  <div
                    aria-hidden="true"
                    className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
                  >
                    <label htmlFor="cv-website">Website</label>
                    <input id="cv-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={state === "sending"}
                      className="inline-flex h-control-h min-w-control items-center justify-center rounded-control border border-strong bg-fg px-5 text-ui text-bg disabled:opacity-60"
                    >
                      {state === "sending" ? strings.sending : strings.submit}
                    </button>
                    {state === "failed" ? (
                      <p role="alert" className="text-body-sm text-fg-body">
                        {strings.error}
                      </p>
                    ) : null}
                  </div>
                </form>
              )}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
