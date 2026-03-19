export default function TribesLoading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        backgroundColor: '#FAFAF8',
        padding: '1rem',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            width: '2rem',
            height: '2rem',
            border: '3px solid #E2E8F0',
            borderTopColor: '#3D8178',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem',
          }}
        />
        <p
          style={{
            fontSize: '0.9rem',
            color: '#718096',
          }}
        >
          Loading Tribes...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
