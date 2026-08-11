import Script from "next/script";

/**
 * Google Analytics — STUBBED, and not only because the property ID is missing.
 *
 * ⚠️ READ BEFORE ENABLING. GA4 sits awkwardly with this site's stated privacy
 * posture, and the posture is load-bearing: `/how-this-site-works` (Layer 2)
 * publishes it, and decision 001 rests on the site being honest about what it
 * collects.
 *
 * What GA4 does that the Supabase event store deliberately does not:
 *   - sets cookies (`_ga`, `_ga_*`) that persist across visits — a cross-visit
 *     identifier, which sessionStorage was chosen specifically to avoid
 *   - processes the visitor's IP address for geolocation before discarding it
 *   - collects a full User-Agent and derived client hints
 *   - may enable Google Signals and cross-site advertising features depending
 *     on property configuration
 *
 * None of that is compatible with claiming "anonymous session IDs only, no IP,
 * no fingerprinting" without qualification. Three honest options:
 *
 *   A. Don't run GA. The Supabase store already answers the questions that
 *      matter, and it is the one Layer 2 depends on. Recommended.
 *   B. Run GA with Google Signals and ad personalisation disabled, and state
 *      plainly on /how-this-site-works that GA sets cookies and processes IPs.
 *      Likely requires a consent banner in the EU/UK.
 *   C. Use a cookieless aggregate analytics service instead.
 *
 * This component renders nothing until NEXT_PUBLIC_GA_ID is set, so the
 * decision stays open and nothing is collected by accident in the meantime.
 */
export function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}',{anonymize_ip:true,allow_google_signals:false,allow_ad_personalization_signals:false});`}
      </Script>
    </>
  );
}
