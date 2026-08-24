import { dirForLocale } from "@/lib/content/types";
import type { CareerRole } from "@/lib/content/career";
import type { Locale } from "@/lib/content/types";

/**
 * The career timeline on About.
 *
 * Built 2026-08-24, task `044240826`, against migrations 0053–0056. The design
 * has carried this component since before the site existed and it was never
 * built, because — as `CLAUDE.md` put it — there was nothing to put in it. The
 * CV closed that.
 *
 * ── NO EMPLOYER NAMES, AND NOT BY RESTRAINT ─────────────────────────────────
 *
 * Moataz asked for the domain, the title, the dates, the city and the country,
 * **without the names.** `career_roles` has no `employer` column, so this
 * component has nothing to render even if a later edit tried. The absence is
 * structural, which is the only kind that survives.
 *
 * ── DATES ARE FORMATTED HERE, NOT STORED ────────────────────────────────────
 *
 * The rows hold real `date` values; `Intl.DateTimeFormat` turns them into
 * "Jul 2022" / "يوليو ٢٠٢٢" using the page's own locale. Storing a formatted
 * string would have frozen one language's month names into the data.
 *
 * `ended === null` means the role is current, and what that RENDERS as comes
 * from `ui_strings.career_present` — never from a literal here. "Present" is a
 * word, and rule 1 does not exempt short ones.
 *
 * ── RTL ─────────────────────────────────────────────────────────────────────
 *
 * Every utility is symmetric (`mt-`, `gap-`, `max-w-`) or logical (`border-s`,
 * `ps-`). Nothing branches on the page's direction. `lang`/`dir` go on each
 * text run from the language THAT RUN is written in — decision 053 — because a
 * role whose Arabic is missing falls back to English, and unmarked English
 * inside a `dir="rtl"` document lays out as Arabic.
 *
 * The date range needs NO direction override, and an early draft's was a bug:
 * `Intl` formats it in the page's own locale, so an Arabic page gets an Arabic
 * run that bidi already lays out start-on-the-right. Forcing `ltr` moved the
 * start to the left — the very thing the override was added to prevent.
 *
 * The place line joins city and country with `، ` in Arabic and `, ` in
 * English. A Latin comma inside Arabic text is a typographic error, and the
 * first render shipped one.
 */
export function CareerTimeline({
  roles,
  locale,
  heading,
  presentLabel,
}: {
  roles: CareerRole[];
  locale: Locale;
  /** `ui_strings.career_heading`. */
  heading?: string;
  /** `ui_strings.career_present` — shown when a role has no end date. */
  presentLabel?: string;
}) {
  if (roles.length === 0) return null;

  /*
   * One formatter for the whole list rather than one per row. `Intl` respects
   * the locale's own calendar and numerals, so Arabic gets Arabic month names
   * without a lookup table in this file.
   */
  const month = new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", {
    year: "numeric",
    month: "short",
  });

  const format = (iso: string) => month.format(new Date(`${iso}T00:00:00`));

  /*
   * Arabic writes its comma the other way round — U+060C, `،`. A Latin comma
   * inside Arabic text is a real typographic error, not a near-enough.
   */
  const listSeparator = locale === "ar" ? "، " : ", ";

  return (
    <section className="mt-14 scroll-mt-18 border-t border-DEFAULT pt-10">
      {heading ? (
        <h2 className="mb-4 max-w-measure text-h3 text-fg">{heading}</h2>
      ) : null}

      <ol className="flex flex-col">
        {roles.map((role) => {
          const { title, domain, city, country } = role.fields;
          const titleLang = role.fieldLocales.title;

          /*
           * "Dubai, United Arab Emirates" — but "Remote" alone where there is
           * no city. Joined here rather than stored joined, because the
           * separator belongs to the presentation and the two parts translate
           * separately.
           *
           * ⚠️ The separator is `listSeparator`, not a literal `", "`. Arabic
           * uses ARABIC COMMA (U+060C, `،`), which sits on the baseline the
           * other way round. The first render of this component shipped
           * "دبي, الإمارات العربية المتحدة" with a Latin comma — caught by
           * reading the served Arabic HTML, not by looking at the page, where
           * it is a few pixels.
           */
          const place = [city, country].filter(Boolean).join(listSeparator);
          const placeLang = role.fieldLocales.city ?? role.fieldLocales.country;

          return (
            <li
              key={role.id}
              /*
               * `border-s` — the rail is on the inline start, so it moves to
               * the right in Arabic with no direction check. `last:border-0`
               * stops the line running past the final entry into whitespace.
               */
              className="border-s border-DEFAULT ps-6 pb-8 last:pb-0"
            >
              <p
                /*
                 * NO `dir` override, and that is a correction.
                 *
                 * The first version forced `dir="ltr"` on the reasoning that a
                 * date range would otherwise be reordered end-first. That was
                 * wrong, and backwards: `Intl` formats these in the page's own
                 * locale, so on `/ar` the whole range is already an Arabic run
                 * — "يوليو 2022 – حتى الآن" — and the bidi algorithm lays it
                 * out start-on-the-RIGHT, which is correct Arabic reading
                 * order. Forcing LTR put the start on the LEFT and produced
                 * exactly the defect the override claimed to prevent.
                 *
                 * There is no fallback case to guard against either: a date is
                 * formatted, never translated, so it cannot arrive in the
                 * wrong language the way a `title` can.
                 */
                className="font-mono text-micro uppercase text-fg-dim"
              >
                {format(role.started)} – {role.ended ? format(role.ended) : presentLabel}
              </p>

              {title ? (
                <p
                  className="mt-2 max-w-measure text-h3 text-fg"
                  lang={titleLang}
                  dir={titleLang ? dirForLocale(titleLang) : undefined}
                >
                  {title}
                </p>
              ) : null}

              {/*
                Domain and place on one line, separated by the same middot the
                rest of the site uses. Either may be absent — the two oldest
                roles have no domain, and the freelance years have no city —
                and `filter(Boolean)` means an absence closes up rather than
                leaving a stray separator.
              */}
              {domain || place ? (
                <p className="mt-1 text-body-sm text-fg-muted">
                  {[
                    domain ? (
                      <span
                        key="domain"
                        lang={role.fieldLocales.domain}
                        dir={role.fieldLocales.domain ? dirForLocale(role.fieldLocales.domain) : undefined}
                      >
                        {domain}
                      </span>
                    ) : null,
                    place ? (
                      <span
                        key="place"
                        lang={placeLang}
                        dir={placeLang ? dirForLocale(placeLang) : undefined}
                      >
                        {place}
                      </span>
                    ) : null,
                  ]
                    .filter(Boolean)
                    .flatMap((node, i) =>
                      i === 0 ? [node] : [<span key={`sep-${i}`} aria-hidden="true"> · </span>, node],
                    )}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
