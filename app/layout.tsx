import type { Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

/*
 * Geist for everything, Geist Mono for metadata only (kickers, labels, role
 * lines, column headers). Self-hosted by next/font — no external stylesheet,
 * no layout shift. See docs/design/tokens.md.
 *
 * Arabic currently falls back to Geist via --font-arabic, an explicit interim
 * (decision 020). That token is defined separately in globals.css so selecting
 * a real Arabic face later is a one-line change here and there.
 */
const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-geist-mono",
  display: "swap",
});

/*
 * No `metadata` export yet, and that is deliberate. Title, description and
 * OG image are human-readable strings, so per rule 1 they come from the
 * `settings` table — via generateMetadata() once the query layer (0.5) exists.
 * Hardcoding them here now would be exactly the thing the rule forbids.
 */

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
};

/*
 * Runs before first paint. Applies data-theme only for an explicit stored
 * choice (so the CSS media query keeps handling the OS default), and creates
 * the theme-color meta so mobile browser chrome matches from the first frame.
 * Dark is the default: light is used only when the OS asks for it.
 *
 * theme-color is set here rather than in the viewport export because a manual
 * choice must be able to override the OS — declaring it both ways leaves Next
 * re-inserting a conflicting meta after hydration.
 */
const THEME_INIT = `(function(){try{var t=localStorage.getItem('theme');var explicit=(t==='light'||t==='dark');if(explicit)document.documentElement.setAttribute('data-theme',t);var light=explicit?(t==='light'):window.matchMedia('(prefers-color-scheme: light)').matches;var m=document.createElement('meta');m.name='theme-color';m.content=light?'#ffffff':'#000000';document.head.appendChild(m);}catch(e){}})();`;

/*
 * lang and dir are hardcoded here only because [locale] routing does not exist
 * yet (task 0.7). Once it does, this becomes app/[locale]/layout.tsx and both
 * are derived from the locale segment.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT}
        </Script>
        {children}
      </body>
    </html>
  );
}
