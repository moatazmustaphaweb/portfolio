"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

import { CONSENT_EVENT, readConsent } from "./ConsentBanner";

/**
 * Google Analytics — loads ONLY after explicit consent (decision 030).
 *
 * The gate is that the <Script> tags are not rendered at all until consent is
 * granted. That is stronger than GA's own Consent Mode, which loads the script
 * and then asks it to behave: here, before an accept, there is no request to
 * Google, no gtag, and no cookie, because there is no script on the page.
 *
 * It reacts to the CONSENT_EVENT so accepting takes effect immediately rather
 * than on the next navigation.
 *
 * ⚠️ This component gates GA only. The site's own Supabase analytics are
 * unconditional and must stay that way — they are anonymous, session-scoped,
 * store no IP and set no cookie, so there is nothing to consent to. Someone who
 * declines here is still counted in our own store, with geography.
 */
export function GoogleAnalytics({ id }: { id?: string }) {
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    if (!id) return;

    setGranted(readConsent() === "granted");

    const onChange = (event: Event) => {
      const choice = (event as CustomEvent<string>).detail;
      setGranted(choice === "granted");
    };

    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, [id]);

  if (!id || !granted) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {/*
          Signals and ad personalisation off. GA still sets its own cookies and
          processes IPs for geolocation — that is inherent to GA4 and is exactly
          what the consent banner exists to ask about. It is disclosed in plain
          language on /how-this-site-works rather than buried here.
        */}
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}',{allow_google_signals:false,allow_ad_personalization_signals:false});`}
      </Script>
    </>
  );
}
