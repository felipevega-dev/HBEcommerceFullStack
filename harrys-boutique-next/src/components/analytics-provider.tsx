'use client'

import Script from 'next/script'

const measurementId = process.env.NEXT_PUBLIC_GA_ID

export function AnalyticsProvider() {
  if (!measurementId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-bootstrap" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} window.gtag = gtag; gtag('js', new Date()); gtag('config', '${measurementId}', { send_page_view: true });`}
      </Script>
    </>
  )
}
