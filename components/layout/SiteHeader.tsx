import Link from "next/link";

import { getNavigation } from "@/lib/content/navigation";
import { getSettings } from "@/lib/content/settings";
import { getUiStrings } from "@/lib/content/ui";
import type { Locale } from "@/lib/content/types";

import { LocaleSwitch } from "./LocaleSwitch";
import { MobileMenu } from "./MobileMenu";
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
 *
 * ── TWO LAYOUTS, ONE ROW (task `040240826`) ─────────────────────────────────
 *
 * Below `md` the four nav links collapse into a burger, in the order Moataz
 * specified: **burger · name · space · theme · language**. From `md` up the
 * header is exactly what it always was — wordmark, inline nav, then the two
 * controls pushed to the end.
 *
 * `MobileMenu` is `md:hidden` and `Nav` is `hidden md:flex`, so the two never
 * render together and neither is a restyled version of the other. The desktop
 * header keeps its original markup untouched.
 *
 * **`flex-wrap` is gone.** It was the safety net for a row that no longer
 * overflows: `028240826` and `029240826` cut the header's minimum content width
 * from ~562px to ~482px and both recorded that nothing further could be removed
 * without menu-izing the nav. This is that step — four links leave the row
 * entirely — so the row fits a 320px phone and wrapping is no longer the
 * failure it was protecting against. Keeping it would silently re-introduce the
 * two-line header the moment anything grew, which is exactly the bug that
 * started this.
 *
 * `relative` is load-bearing: the mobile panel is `absolute … top-full` and
 * positions against this element.
 */
export async function SiteHeader({ locale }: { locale: Locale }) {
  const [settings, ui, items] = await Promise.all([
    getSettings(locale),
    getUiStrings(locale),
    getNavigation("header", locale),
  ]);

  const name = settings.get("name");

  return (
    <header className="sticky top-0 z-50 border-b border-DEFAULT bg-scrim backdrop-blur-header relative">
      <div className="mx-auto flex min-h-header-h max-w-container items-center gap-3 px-gutter py-2 sm:gap-6">
        {/*
          FIRST on mobile, and absent on desktop. Carries the whole nav.
        */}
        <MobileMenu
          items={items}
          locale={locale}
          navLabel={ui.t("nav_main")}
          openLabel={ui.t("menu_open")}
          closeLabel={ui.t("menu_close")}
        />

        {/*
          Omitted rather than rendered blank if the setting is missing.

          `min-w-0 truncate` and NOT `shrink-0`. Measured with the nav collapsed:
          burger 28 + name 118 + controls 116, plus 48px of gutter and 24px of
          gaps, needs **334px**. That clears every real phone (360+) but
          overflows the 320px floor the definition of done names, and `shrink-0`
          would make that an overflow rather than a squeeze.
          Shrinkable, the name ellipsises in the last 14px instead of pushing
          the controls off the row — and above 334px it never shrinks at all, so
          nothing changes anywhere it currently fits.
        */}
        {name ? (
          <Link
            href={`/${locale}`}
            className="tap-target-44 min-w-0 truncate text-meta font-semibold text-fg sm:text-ui"
          >
            {name}
          </Link>
        ) : null}

        {/*
          Desktop only. `hidden md:flex` rather than a `md:`-prefixed layout on
          one shared element: the mobile copy lives in `MobileMenu`, and one of
          the two is always `display: none`, which already removes it from the
          accessibility tree.
        */}
        <Nav
          items={items}
          locale={locale}
          // Named so a screen-reader landmark list can tell this apart from
          // the onward-links block at the foot of the page. See migration 0047
          // and docs/accessibility-audit.md finding 4.
          ariaLabel={ui.t("nav_main")}
          className="hidden md:flex md:items-center md:gap-5"
          linkClassName="tap-target-44 text-meta text-fg-muted transition-colors hover:text-fg sm:text-ui"
        />

        {/*
          THE SPACE. `ms-auto` is margin-inline-start, so it pushes the two
          controls to the row's END and mirrors correctly in RTL with no
          direction check anywhere.
        */}
        <div className="ms-auto flex shrink-0 items-center gap-2 sm:gap-3">
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
