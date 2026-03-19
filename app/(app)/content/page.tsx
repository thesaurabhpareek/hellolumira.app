// app/(app)/content/page.tsx — Content (Coming Soon)
export default function ContentPage() {
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
          <span style={{ fontSize: '48px', marginBottom: '16px' }} role="img" aria-label="Books">
            📚
          </span>
          <h1
            className="text-h1"
            style={{ color: 'var(--color-slate)', marginBottom: '12px' }}
          >
            Content
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
            Expert-reviewed articles, guides, and resources tailored to
            your stage — from pregnancy through toddlerhood.
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
              Our content library is being curated by real experts.
              Stay tuned.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
