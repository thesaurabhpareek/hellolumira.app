export default function CheckinLoading() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#FAFAF8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '2rem' }}>
        <div
          style={{
            width: '2rem',
            height: '2rem',
            border: '3px solid #E5E7EB',
            borderTopColor: '#4A6741',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem',
          }}
        />
        <p style={{ fontSize: '0.9rem', color: '#6B7280' }}>
          Preparing your check-in...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
