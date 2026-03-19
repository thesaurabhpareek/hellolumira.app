// app/(app)/profile/DeleteAccountLink.tsx — Delete account text link
'use client'

export default function DeleteAccountLink() {
  return (
    <div style={{ textAlign: 'center', marginTop: '16px' }}>
      <button
        onClick={() => {
          if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            // TODO: implement account deletion flow
            window.location.href = '/settings/privacy'
          }
        }}
        style={{
          background: 'none',
          border: 'none',
          color: '#E53E3E',
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
          padding: '12px',
          minHeight: '48px',
          textDecoration: 'underline',
        }}
      >
        Delete my account
      </button>
    </div>
  )
}
