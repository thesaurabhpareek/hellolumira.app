export default function ShareLoading() {
  return (
    <div
      style={{
        minHeight: '100%',
        background: '#FAFAF8',
        paddingBottom: '24px',
      }}
    >
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Title skeleton */}
        <div
          style={{
            height: '28px',
            width: '45%',
            borderRadius: '8px',
            background: '#F0F0EE',
            marginBottom: '24px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />

        {/* Illustration card skeleton */}
        <div
          style={{
            height: '160px',
            borderRadius: '14px',
            background: '#F0F0EE',
            marginBottom: '24px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />

        {/* Link field skeleton */}
        <div
          style={{
            height: '48px',
            borderRadius: '14px',
            background: '#F0F0EE',
            marginBottom: '24px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />

        {/* Button skeletons */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: '48px',
              borderRadius: '14px',
              background: '#F0F0EE',
              marginBottom: '10px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        ))}

        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      </div>
    </div>
  )
}
