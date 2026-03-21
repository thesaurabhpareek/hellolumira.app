// app/not-found.tsx — Custom branded 404 page
import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'var(--color-surface)',
        textAlign: 'center',
      }}
    >
      {/* Logo */}
      <span
        style={{
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--color-primary)',
          letterSpacing: '-0.5px',
          marginBottom: '32px',
        }}
      >
        Lumira
      </span>

      {/* Illustration */}
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'var(--color-green-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          fontSize: '36px',
        }}
      >
        <span role="img" aria-label="Lost">🌱</span>
      </div>

      <h1
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--color-slate)',
          marginBottom: '8px',
        }}
      >
        Page not found
      </h1>

      <p
        style={{
          fontSize: '15px',
          color: 'var(--color-muted)',
          marginBottom: '32px',
          maxWidth: '360px',
          lineHeight: 1.5,
        }}
      >
        This page doesn&apos;t exist or may have been moved. Let&apos;s get you back on track.
      </p>

      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '48px',
          padding: '0 32px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-primary)',
          color: 'white',
          fontSize: '15px',
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'opacity 0.15s ease',
        }}
      >
        Go to Lumira
      </Link>

      <Link
        href="/login"
        style={{
          marginTop: '12px',
          fontSize: '14px',
          color: 'var(--color-primary)',
          textDecoration: 'underline',
        }}
      >
        Sign in
      </Link>
    </div>
  )
}
