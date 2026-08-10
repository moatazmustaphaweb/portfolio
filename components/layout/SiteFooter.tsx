import { getNavigation } from "@/lib/content/navigation";
import { getSettings } from "@/lib/content/settings";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";

import { Nav } from "./Nav";

/**
 * Site footer — nav, contact links, name.
 *
 * Every link is conditional on its setting existing. `cv_url` is still NULL
 * (a launch-gate blocker), so the CV link simply does not render rather than
 * pointing at "#" — a dead link is worse than an absent one, and "no dead
 * ends" is a non-negotiable.
 */
export async function SiteFooter({ locale }: { locale: Locale }) {
  const [settings, ui, items] = await Promise.all([
    getSettings(locale),
    getUiStrings(locale),
    getNavigation("footer", locale),
  ]);

  const name = settings.get("name");
  const email = settings.get("email");
  const linkedin = settings.get("linkedin_url");
  const cvUrl = settings.get("cv_url");

  return (
    <footer className="border-t border-DEFAULT bg-surface">
      <div className="mx-auto flex max-w-container flex-wrap justify-between gap-8 px-gutter py-10">
        <Nav
          items={items}
          locale={locale}
          className="flex flex-wrap gap-x-8 gap-y-3"
          linkClassName="text-ui text-fg-muted transition-colors hover:text-fg"
        />

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
          {cvUrl && ui.t("cv") ? (
            <a
              href={cvUrl}
              className="text-ui text-fg-muted transition-colors hover:text-fg"
            >
              {ui.t("cv")}
            </a>
          ) : null}
        </div>

        {name ? (
          <div className="w-full font-mono text-label uppercase text-fg-dim">
            {name}
          </div>
        ) : null}
      </div>
    </footer>
  );
}
