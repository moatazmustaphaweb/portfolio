import Link from "next/link";

import { getNavigation } from "@/lib/content/navigation";
import { getSettings } from "@/lib/content/settings";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";

import { LocaleSwitch } from "./LocaleSwitch";
import { Nav } from "./Nav";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Site header — wordmark, nav, language switch, theme toggle.
 *
 * Every string comes from the database: the wordmark is `settings.name`, the
 * nav labels are `navigation` translations, the control labels are
 * `ui_strings`. Nothing here is a literal.
 *
 * Sticky with a blurred scrim, per docs/design/tokens.md — the one blur in the
 * system.
 */
export async function SiteHeader({ locale }: { locale: Locale }) {
  const [settings, ui, items] = await Promise.all([
    getSettings(locale),
    getUiStrings(locale),
    getNavigation("header", locale),
  ]);

  const name = settings.get("name");

  return (
    <header className="sticky top-0 z-50 border-b border-DEFAULT bg-scrim backdrop-blur-header">
      <div className="mx-auto flex min-h-header-h max-w-container flex-wrap items-center gap-6 px-gutter py-2">
        {/* Omitted rather than rendered blank if the setting is missing. */}
        {name ? (
          <Link href={`/${locale}`} className="tap-target-44 text-meta font-semibold text-fg sm:text-ui">
            {name}
          </Link>
        ) : null}

        <Nav
          items={items}
          locale={locale}
          // Named so a screen-reader landmark list can tell this apart from
          // the onward-links block at the foot of the page. See migration 0047
          // and docs/accessibility-audit.md finding 4.
          ariaLabel={ui.t("nav_main")}
          className="flex flex-wrap items-center gap-5"
          linkClassName="tap-target-44 text-meta text-fg-muted transition-colors hover:text-fg sm:text-ui"
        />

        {/* margin-inline-start:auto — mirrors correctly in RTL. */}
        <div className="flex flex-wrap items-center gap-3 ms-auto">
          <ThemeToggle
            ariaLabel={ui.t("theme_toggle")}
            labels={{
              system: ui.t("theme_system"),
              light: ui.t("theme_light"),
              dark: ui.t("theme_dark"),
            }}
          />
          <LocaleSwitch
            locale={locale}
            ariaLabel={ui.t("language")}
            labels={{ en: ui.t("lang_en"), ar: ui.t("lang_ar") }}
          />
        </div>
      </div>
    </header>
  );
}
