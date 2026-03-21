// app/layout.tsx — Root layout for hellolumira.app
// v1.2 — next/font/google replaces inline fontFamily (self-hosted, no render-block)
import type React from 'react'
import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
})

export const metadata: Metadata = {
  title: 'Lumira — Your AI parenting companion',
  description: 'A calm guide beside you, from the moment you find out. Weekly guides, daily check-ins, and gentle pattern detection — from pregnancy through your baby\'s first year.',
  metadataBase: new URL('https://hellolumira.app'),
  openGraph: {
    title: 'Lumira — Your AI parenting companion',
    description: 'A calm guide beside you, from the moment you find out.',
    url: 'https://hellolumira.app',
    siteName: 'Lumira',
    images: [
      {
        url: 'https://hellolumira.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lumira — Your AI parenting companion',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lumira — Your AI parenting companion',
    description: 'A calm guide beside you, from the moment you find out.',
    images: ['https://hellolumira.app/og-image.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Lumira',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  themeColor: '#3D8178',
  width: 'device-width',
  initialScale: 1,
  // maximumScale and userScalable intentionally omitted — WCAG 1.4.4 requires
  // users to be able to resize text up to 200%. Pinch-to-zoom must remain enabled.
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Lumira',
              url: 'https://hellolumira.app',
              description: 'An AI parenting companion from pregnancy through your baby\'s first year.',
              applicationCategory: 'HealthApplication',
              operatingSystem: 'Web',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
              audience: {
                '@type': 'Audience',
                audienceType: 'Expecting and new parents',
              },
            })
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
