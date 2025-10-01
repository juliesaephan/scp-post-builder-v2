const ConfirmationDialog = ({ onSaveAsDraft, onDiscardChanges, onCancel, isLoading }) => {
  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--modal-overlay)',
          zIndex: 10001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={onCancel}
      >
        {/* Dialog */}
        <div
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '12px',
            padding: '24px',
            width: '400px',
            maxWidth: '90vw',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            zIndex: 10002
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '24px' }}>💾</div>
            <h3 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              Save Changes?
            </h3>
          </div>

          {/* Message */}
          <p style={{
            margin: '0 0 24px 0',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            You have unsaved changes. What would you like to do?
          </p>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={onCancel}
              disabled={isLoading}
              style={{
                padding: '10px 16px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-secondary)',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              Cancel
            </button>

            <button
              onClick={onDiscardChanges}
              disabled={isLoading}
              style={{
                padding: '10px 16px',
                backgroundColor: '#dc3545',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                color: 'white',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              Discard Changes
            </button>

            <button
              onClick={onSaveAsDraft}
              disabled={isLoading}
              style={{
                padding: '10px 16px',
                backgroundColor: 'var(--button-bg-primary)',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                color: 'white',
                opacity: isLoading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isLoading && (
                <div style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid #ffffff',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
              Save as Draft
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default ConfirmationDialog