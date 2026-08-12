import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

import { getSettings } from "@/lib/content/settings";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";

/**
 * Landing.
 *
 * The only page every visitor sees, and it has eight seconds to say who this
 * is, what he does, and where to click.
 *
 * The three strings ARE the message — position, then intent, then domain, each
 * saying something the others do not. Nothing else belongs here: any sentence
 * added would have to earn its place against the eight seconds, and none does.
 *
 * One call to action, and a minimal footer, so nothing competes with it. The
 * footer is supplied by the `(landing)` layout — this page sits outside the
 * `(site)` group, so which footer it gets is structural rather than a prop.
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
  setRequestLocale(locale);
  const l = locale as Locale;

  const [settings, ui] = await Promise.all([getSettings(l), getUiStrings(l)]);

  const name = settings.get("name");
  const tagline = settings.get("tagline");
  const intro = settings.get("intro");
  const description = settings.get("description");
  const workLabel = ui.t("page_work");

  return (
    <div className="mx-auto flex w-full max-w-container flex-1 flex-col justify-center px-gutter py-section-y-hero">
        <div className="max-w-measure">
          {/*
            Every line is omitted rather than rendered empty if its setting is
            missing — the fallback rule applied to the most visible page on the
            site. A blank heading here would be the first thing a recruiter saw.
          */}
          {name ? (
            <h1 className="text-hero text-fg">{name}</h1>
          ) : null}

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

          {/* Intent. */}
          {intro ? (
            <p className="mt-5 max-w-measure-lead text-body text-fg-body">{intro}</p>
          ) : null}

          {/*
            Domain. The Arabic runs longer than the English here and is
            expected to wrap to two lines on a narrow screen; `text-wrap: pretty`
            and the measure cap keep that from becoming a ragged block.
          */}
          {description ? (
            <p className="mt-3 max-w-measure-lead text-body text-fg-muted">
              {description}
            </p>
          ) : null}

          {/* The single way in. */}
          {workLabel ? (
            <Link
              href={`/${l}/work`}
              className="mt-10 inline-flex h-control-h items-center rounded-control border border-strong px-5 text-ui text-fg transition-colors hover:border-fg"
            >
              {workLabel}
            </Link>
          ) : null}
      </div>
    </div>
  );
}
