// app/layout.tsx — Root layout for hellolumira.app
// v1.1 — Added full OG/PWA metadata, viewport export, favicon config
import type { Metadata, Viewport } from 'next'
import './globals.css'

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
        url: '/og-image.png',
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
    images: ['/og-image.png'],
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
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
