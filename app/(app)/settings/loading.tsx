export default function SettingsLoading() {
  return (
    <div
      style={{
        minHeight: '100%',
        background: '#FAFAF8',
        paddingBottom: '32px',
      }}
    >
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Title skeleton */}
        <div
          style={{
            height: '28px',
            width: '35%',
            borderRadius: '8px',
            background: '#F0F0EE',
            marginBottom: '24px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />

        {/* Settings section skeletons */}
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              height: '64px',
              borderRadius: '12px',
              background: '#F0F0EE',
              marginBottom: '12px',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}

        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      </div>
    </div>
  )
}
