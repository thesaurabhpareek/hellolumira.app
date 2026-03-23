export default function HelpLoading() {
  return (
    <div
      style={{
        minHeight: '100%',
        background: 'var(--color-surface)',
        paddingBottom: '24px',
      }}
    >
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Title skeleton */}
        <div
          style={{
            height: '28px',
            width: '55%',
            borderRadius: '8px',
            background: 'var(--color-skeleton)',
            marginBottom: '20px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />

        {/* Search bar skeleton */}
        <div
          style={{
            height: '48px',
            borderRadius: '14px',
            background: 'var(--color-skeleton)',
            marginBottom: '24px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />

        {/* Section label skeleton */}
        <div
          style={{
            height: '14px',
            width: '40%',
            borderRadius: '6px',
            background: 'var(--color-skeleton)',
            marginBottom: '12px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />

        {/* Quick link skeletons */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              height: '48px',
              borderRadius: '0',
              background: 'var(--color-skeleton)',
              marginBottom: '1px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        ))}

        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      </div>
    </div>
  )
}
