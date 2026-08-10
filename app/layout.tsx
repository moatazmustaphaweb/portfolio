import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";

/*
 * Display + body typeface. The design system specifies a single family —
 * Space Grotesk (geometric grotesque) — used for everything from 56px display
 * down to 11px badges, at weights 400/500/600/700 (no thin/light weights).
 * next/font self-hosts it and exposes --font-space-grotesk, which the Tailwind
 * `font-sans` token and globals.css --font-sans both consume.
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Moataz — Portfolio",
  description: "Portfolio built on a Neubrutalist design system.",
};

/*
 * Device integration:
 * - width=device-width viewport (mobile scaling)
 * - colorScheme: native controls/scrollbars render correctly for both themes
 * theme-color (the mobile browser UI chrome colour) is intentionally NOT declared
 * here — it's managed imperatively by the script below + ThemeToggle so a manual
 * choice can override the OS. Declaring it here too would leave Next re-inserting
 * duplicate/conflicting metas after hydration.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
};

/*
 * Runs before first paint. Resolves the active theme (explicit stored choice,
 * else the OS preference), applies data-theme for an explicit choice (no flash),
 * and creates the single theme-color meta so the mobile browser chrome matches
 * the page from the very first frame. ThemeToggle keeps it in sync afterwards.
 */
const THEME_INIT = `(function(){try{var t=localStorage.getItem('theme');var explicit=(t==='light'||t==='dark');if(explicit)document.documentElement.setAttribute('data-theme',t);var dark=explicit?(t==='dark'):window.matchMedia('(prefers-color-scheme: dark)').matches;var m=document.createElement('meta');m.name='theme-color';m.content=dark?'#141414':'#F0F0F0';document.head.appendChild(m);}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={spaceGrotesk.variable}
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
