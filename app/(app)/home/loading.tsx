export default function HomeLoading() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#FAFAF8',
        paddingBottom: '100px',
      }}
    >
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Stage badge skeleton */}
        <div
          style={{
            height: '52px',
            borderRadius: '12px',
            background: '#F0F0EE',
            marginBottom: '16px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />

        {/* Greeting skeleton */}
        <div
          style={{
            height: '28px',
            width: '60%',
            borderRadius: '8px',
            background: '#F0F0EE',
            marginBottom: '24px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />

        {/* Weekly guide card skeleton */}
        <div
          style={{
            height: '160px',
            borderRadius: '16px',
            background: '#F0F0EE',
            marginBottom: '16px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />

        {/* Action buttons skeleton */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div
            style={{
              flex: 1,
              height: '52px',
              borderRadius: '12px',
              background: '#F0F0EE',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              flex: 1,
              height: '52px',
              borderRadius: '12px',
              background: '#F0F0EE',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>

        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      </div>
    </div>
  )
}
