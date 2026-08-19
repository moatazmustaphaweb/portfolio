import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { getSettings } from "@/lib/content/settings";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";
import { routing } from "@/i18n/routing";

/**
 * Landing — composed from `Home.dc.html`.
 *
 * Three things restored from the design that never reached `tokens.md`, and so
 * were lost at extraction rather than at build:
 *
 *  - A **radial accent glow** behind the hero. The only non-flat surface in
 *    the whole system, and the one place the accent is allowed to be ambient
 *    rather than a state marker.
 *  - An **eyebrow pill** above the name — bordered, on surface, mono.
 *  - **Two** calls to action: the work, and a way to make contact.
 *
 * The eight seconds this page has are unchanged. The strings still carry the
 * message; the design just gives them somewhere to sit.
 */
/**
 * ISR window (decision 009). Next requires this to be a literal — an imported
 * constant fails the build with "Invalid segment configuration export".
 * See lib/content/revalidate.ts for why 300.
 */
export const revalidate = 300;

export default async function Landing({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  /*
   * The parent layout guards too, but a layout does not gate its page: Next
   * renders both concurrently, so this page's query reached Postgres with
   * locale="favicon.ico" -- a browser asking for an icon that does not exist
   * matches [locale] -- and the enum rejected it before notFound() upstream
   * could take effect. Guarding at every entry point is the fix; the cast on
   * the next line is only sound once this has run.
   */
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const l = locale as Locale;

  const [settings, ui] = await Promise.all([getSettings(l), getUiStrings(l)]);

  const name = settings.get("name");
  const tagline = settings.get("tagline");
  const intro = settings.get("intro");
  const description = settings.get("description");
  const workLabel = ui.t("page_work");
  const contactLabel = ui.t("page_contact");

  return (
    <div className="relative flex w-full flex-1 flex-col justify-center overflow-hidden">
      {/*
        The hero glow. Purely decorative and pointer-transparent, centred on
        the top edge so it reads as light coming from off-canvas rather than a
        shape on the page. `--color-accent` at low alpha — the value is in the
        gradient rather than a token because a one-off radial is not a system
        primitive.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-22 start-1/2 h-[520px] w-[900px] max-w-[140vw] -translate-x-1/2 rtl:translate-x-1/2"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, color-mix(in srgb, var(--color-accent) 16%, transparent) 0%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-container px-gutter py-section-y-hero">
        <div className="max-w-measure-lead">
          {/*
            Every line is omitted rather than rendered empty if its setting is
            missing — the fallback rule applied to the most visible page on the
            site. A blank heading here would be the first thing a recruiter saw.
          */}
          {ui.t("case_file") ? (
            <p className="inline-flex rounded-pill border border-DEFAULT bg-surface px-3 py-1 font-mono text-label uppercase text-fg-muted">
              {ui.t("page_work")}
            </p>
          ) : null}

          {name ? <h1 className="mt-6 text-hero text-fg">{name}</h1> : null}

          {/*
            The tagline states a position. It is the largest line after the
            name because it is the one thing to remember.

            ⚠️ The Arabic is WRITTEN, not translated — البساطة تصنع المستحيل is
            the counterpart of "Simple, where it's hard", not a rendering of it.
            Do not align them.
          */}
          {tagline ? (
            <p className="mt-6 text-lead text-fg-body">{tagline}</p>
          ) : null}

          {intro ? (
            <p className="mt-5 max-w-measure-lead text-body text-fg-body">{intro}</p>
          ) : null}

          {description ? (
            <p className="mt-3 max-w-measure-lead text-body text-fg-muted">
              {description}
            </p>
          ) : null}

          <div className="mt-10 flex flex-wrap gap-3">
            {workLabel ? (
              <Link
                href={`/${l}/work`}
                className="inline-flex h-control-h items-center gap-2 rounded-control border border-fg bg-fg px-5 text-ui text-bg transition-opacity hover:opacity-85"
              >
                {workLabel}
                <span aria-hidden="true" className="rtl:rotate-180">
                  →
                </span>
              </Link>
            ) : null}

            {contactLabel ? (
              <Link
                href={`/${l}/contact`}
                className="inline-flex h-control-h items-center rounded-control border border-strong px-5 text-ui text-fg transition-colors hover:border-fg"
              >
                {contactLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
