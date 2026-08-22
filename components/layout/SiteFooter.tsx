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
    isMinimal ? Promise.resolve([]) : getNavigation("footer", locale),
  ]);

  const name = settings.get("name");
  const email = settings.get("email");
  const linkedin = settings.get("linkedin_url");

  return (
    <footer className="border-t border-DEFAULT bg-surface">
      <div className="mx-auto flex max-w-container flex-wrap justify-between gap-8 px-gutter py-10">
        {isMinimal ? null : (
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

        {/* The wordmark is already in the header; on Landing it would be a
            third instance of the name on one screen. */}
        {name && !isMinimal ? (
          <div className="w-full font-mono text-label uppercase text-fg-dim">
            {name}
          </div>
        ) : null}
      </div>
    </footer>
  );
}
