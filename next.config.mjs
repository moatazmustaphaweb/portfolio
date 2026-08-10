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
};

export default withNextIntl(nextConfig);
