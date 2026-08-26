import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { getSettings } from "@/lib/content/settings";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";
import { routing } from "@/i18n/routing";
import { HeroMark } from "@/components/brand/HeroMark";

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

      {/*
        The brand mark, standing in the half of the hero the copy does not use.

        THE HERO IS ALREADY TWO HALVES — the text is capped at
        `max-w-measure-lead` inside a `max-w-container`, so on a wide screen the
        inline-end half has always been empty. This fills it rather than
        changing the layout: the copy is not moved, resized, or re-flowed, and
        removing this element leaves the hero exactly as it was.

        `end-0` and not `right-0`: the empty half is the RIGHT in English and
        the LEFT in Arabic, because the text hugs the inline start in both. A
        physical side would have put the mark on top of the Arabic copy. This is
        layout, so it takes its direction from the locale — `rtl-guard`'s own
        test — and nothing here reads `dir` to do it.

        HIDDEN BELOW `lg`. There is no empty half on a narrow screen; the mark
        would sit under the text and fight it.

        `text-accent`, not `text-fg`. THE BLUE IS ALREADY HERE: the radial glow
        twenty lines above is `--color-accent` at 16% alpha, and it sits
        directly behind this mark. Tinting the mark with the same token means it
        reads as part of that light rather than as a grey object laid on top of
        it — which is what "integrated with the background" asks for. It is also
        the only accent on the site, so this introduces no new colour.

        `opacity-20`, up from the 10 that grey needed. Blue is lighter than
        black to the eye at the same alpha, and at 10% the mark had all but
        vanished. The two numbers are not comparable across two hues; each was
        set by looking.

        ⚠️ Opacity is one of the few scales `tailwind.config.ts` does NOT
        replace, so Tailwind's own steps apply: 0 · 5 · 10 · 20 · 25 … There is
        **no `opacity-15`**. Reaching for one compiles to nothing and the mark
        silently returns to FULL strength — the loudest possible failure for the
        quietest element on the page.

        `aria-hidden` lives on the component itself, and it is decoration: the
        name is the <h1> a few lines below, so this carries nothing a reader
        needs.
      */}
      <div
        className="pointer-events-none absolute inset-y-0 end-0 hidden w-1/2 items-center justify-center lg:flex"
      >
        <HeroMark className="h-auto w-[min(60%,340px)] text-accent opacity-20" />
      </div>

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
