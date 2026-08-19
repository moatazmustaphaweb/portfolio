import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the workspace root — a stray package-lock.json in the home dir would
  // otherwise make Next infer the wrong root.
  turbopack: {
    root: import.meta.dirname,
  },
  /*
   * Dev only. Next builds an allowlist of hosts permitted to request dev
   * resources (`/_next/hmr`, client chunks) from the host it was started on —
   * `localhost`. A browser pointed at http://127.0.0.1:3000 is a DIFFERENT
   * origin by that rule, so those requests are refused.
   *
   * What that looks like is the reason this is here. The page renders
   * perfectly, because the HTML is server-rendered and unaffected. The client
   * runtime never starts, so every interactive component is inert — a button
   * you can see, focus and click, that does nothing. There is NO error in the
   * browser console; there is not even React's own DevTools notice. The only
   * signal is a warning in the dev server's terminal.
   *
   * This has now cost three sessions and produced one bug report against a
   * feature that was working. "Use localhost" is a correct instruction and a
   * bad control: it has to be remembered every time, by everyone, forever, and
   * failing to is silent. Making the loopback address work is one line.
   *
   * This has no effect on production. It widens nothing beyond two spellings of
   * this machine talking to itself.
   */
  allowedDevOrigins: ["127.0.0.1"],
};

export default withNextIntl(nextConfig);
