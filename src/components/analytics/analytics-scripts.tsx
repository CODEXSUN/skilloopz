"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import type { AnalyticsConfig } from "@/lib/analytics";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    mixpanel?: { init: (token: string, config?: Record<string, unknown>) => void; track: (event: string, data?: Record<string, unknown>) => void };
  }
}

export function AnalyticsScripts({ config: initial }: { config: AnalyticsConfig }) {
  const [config, setConfig] = useState(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/admin/analytics/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setConfig(data);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (!config.enabled) return null;

  return (
    <>
      {config.ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${config.ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${config.ga4Id}');
            `}
          </Script>
        </>
      )}
      {config.mixpanelToken && (
        <Script id="mixpanel-init" strategy="afterInteractive">
          {`
            (function(f,b){if(!b.__SV){var e,g,i,h;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function g(a,d){var b=d.split(".");2==b.length&&(a=a[b[0]],d=b[1]);a[d]=function(){a.push([d].concat(Array.prototype.slice.call(arguments,0)));}}var a=b;"undefined"!==typeof c? a=b[c]=[]:c="mixpanel";a.people=a.people||[];a.toString=function(){return"mixpanel";};a.people.toString=function(){return"mixpanel people";};a._i.push([e,f,c]);};b.__SV=1.2;})(document,window.mixpanel||[]);
            mixpanel.init('${config.mixpanelToken}', {debug: false, track_pageview: true});
          `}
        </Script>
      )}
    </>
  );
}
