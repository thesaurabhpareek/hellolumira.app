// app/(app)/tribes/page.tsx — Tribes (Coming Soon)
export default function TribesPage() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--color-surface)',
        paddingBottom: '32px',
      }}
    >
      <div className="content-width mx-auto px-4 pt-6">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            padding: '2rem 1rem',
          }}
        >
          <span style={{ fontSize: '48px', marginBottom: '16px' }} role="img" aria-label="Seedling">
            🌱
          </span>
          <h1
            className="text-h1"
            style={{ color: 'var(--color-slate)', marginBottom: '12px' }}
          >
            Tribes
          </h1>
          <p
            className="text-body"
            style={{
              color: 'var(--color-muted)',
              maxWidth: '320px',
              lineHeight: 1.6,
              marginBottom: '24px',
            }}
          >
            Connect with parents on a similar journey. Share experiences,
            ask questions, and support each other — all in a safe,
            moderated space.
          </p>
          <div
            className="lumira-card"
            style={{
              width: '100%',
              maxWidth: '320px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--color-primary)',
                marginBottom: '4px',
              }}
            >
              Coming Soon
            </p>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--color-muted)',
                lineHeight: 1.5,
              }}
            >
              We&apos;re building Tribes with care. You&apos;ll be the first to know
              when it&apos;s ready.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
