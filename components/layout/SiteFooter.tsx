import { getNavigation } from "@/lib/content/navigation";
import { CvRequestPanel } from "@/components/contact/CvRequestPanel";
import { getSettings } from "@/lib/content/settings";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";

import { LocaleSwitch } from "./LocaleSwitch";
import { Nav } from "./Nav";

/**
 * Site footer — nav, contact links, name.
 *
 * Every link is conditional on its setting existing, so a missing setting
 * produces an absent link rather than one pointing at "#" — a dead link is
 * worse than an absent one, and "no dead ends" is a non-negotiable.
 *
 * ⚠️ This comment used to say the CV link does not render because
 * `settings.cv_url` is NULL and a launch-gate blocker. **Both halves are
 * wrong and were wrong in this file's own code, sixty lines below.** The CV
 * became a *request* rather than a download: `CvRequestPanel` renders
 * unconditionally off `settings.email`, and `cv_url` is read by nothing.
 * Corrected 2026-08-23, task `001230826`.
 */
/*
 * ── THE FOOTER CARRIES NO NAVIGATION, AND THAT IS A DESIGN DECISION ─────────
 *
 * Moataz, 2026-08-23, task `012230826`: the footer repeated the header's menu
 * verbatim, and a footer is not a second header — it is where a SITE MAP
 * belongs. Until that sitemap is designed, the footer shows contact and
 * copyright only.
 *
 * `false`, not deleted: the query, the component and the `footer` rows in
 * `navigation` all stay, so restoring this is one line once the sitemap exists.
 *
 * ⚠️ NO EMPTY <nav> IS LEFT BEHIND. An unnamed landmark with nothing in it is
 * worse than no landmark: a screen reader still announces it, and the user
 * arrives somewhere empty. Not rendering it also removes the site's only
 * `landmark-unique` violation — two bare <nav> elements on 24 pages, which
 * `docs/accessibility-audit.md` reports — because one nav cannot be ambiguous
 * with another. When the sitemap returns, it returns WITH an aria-label from
 * `ui_strings`.
 */
const FOOTER_NAV_ENABLED = false;

export async function SiteFooter({
  locale,
  variant = "full",
}: {
  locale: Locale;
  /**
   * `minimal` drops the nav and the wordmark, leaving contact links and the
   * language switch. Used on the Landing page so nothing competes with its
   * single call to action.
   */
  variant?: "full" | "minimal";
}) {
  const isMinimal = variant === "minimal";

  const [settings, ui, items] = await Promise.all([
    getSettings(locale),
    getUiStrings(locale),
    isMinimal || !FOOTER_NAV_ENABLED
      ? Promise.resolve([])
      : getNavigation("footer", locale),
  ]);

  const name = settings.get("name");
  const email = settings.get("email");
  const linkedin = settings.get("linkedin_url");

  return (
    <footer className="border-t border-DEFAULT bg-surface">
      <div className="mx-auto flex max-w-container flex-wrap justify-between gap-8 px-gutter py-10">
        {isMinimal || !FOOTER_NAV_ENABLED ? null : (
          <Nav
            items={items}
            locale={locale}
            className="flex flex-wrap gap-x-8 gap-y-3"
            linkClassName="text-ui text-fg-muted transition-colors hover:text-fg"
          />
        )}

        <div className="flex flex-wrap items-center gap-5">
          {email ? (
            <a
              href={`mailto:${email}`}
              className="text-ui text-fg-muted transition-colors hover:text-fg"
            >
              {email}
            </a>
          ) : null}
          {linkedin && ui.t("linkedin") ? (
            <a
              href={linkedin}
              rel="me noopener noreferrer"
              target="_blank"
              className="text-ui text-fg-muted transition-colors hover:text-fg"
            >
              {ui.t("linkedin")}
            </a>
          ) : null}
          {/*
            The CV is a request, not a download — see CvRequestPanel. The
            footer offers the same single `request_cv` label the contact page
            uses, so the two cannot drift apart in wording.
          */}
          <CvRequestPanel
            variant="link"
            toAddress={settings.get("email")}
            strings={{
              trigger: ui.t("request_cv"),
              toLabel: ui.t("cv_to_label"),
              subjectLabel: ui.t("cv_subject_label"),
              subjectValue: ui.t("cv_subject_value"),
              greeting: ui.t("cv_greeting"),
              body: ui.t("cv_body"),
              optionalPlaceholder: ui.t("cv_optional_placeholder"),
              emailPlaceholder: ui.t("cv_email_placeholder"),
              close: ui.t("cv_close"),
              submit: ui.t("form_submit"),
              sending: ui.t("form_sending"),
              success: ui.t("form_success"),
              error: ui.t("form_error"),
            }}
          />

          {/* On Landing the footer carries the language switch, because the
              minimal footer is the only chrome below the fold. */}
          {isMinimal ? (
            <LocaleSwitch
              locale={locale}
              ariaLabel={ui.t("language")}
              labels={{ en: ui.t("lang_en"), ar: ui.t("lang_ar") }}
            />
          ) : null}
        </div>

        {/*
          The copyright line. The wordmark is already in the header, so on
          Landing this would be a third instance of the name on one screen —
          hence `!isMinimal`.

          ⚠️ Rule 1 holds here and is worth stating, because it looks broken.
          The NAME comes from `settings`, and the YEAR is computed. Neither is
          a human-readable string in code. What IS a literal is `©`, and that
          is a symbol rather than prose — it is not translated, not localised
          and not something a copywriter edits, so it does not belong in
          `ui_strings`. The same reasoning the RTL rules apply to arrows in
          reverse: an arrow reverses per locale and must be data; `©` never
          changes and must not be.

          Numerals stay Western in both locales (`docs/design/tokens.md`), so
          `2026` renders identically in Arabic — deliberately, not by omission.
        */}
        {name && !isMinimal ? (
          <div className="w-full font-mono text-label uppercase text-fg-dim">
            © {new Date().getFullYear()} {name}
          </div>
        ) : null}
      </div>
    </footer>
  );
}
