import { useEffect } from 'react'

const MediaTypeModal = ({
  isOpen,
  onClose,
  onSelectType,
  title = "Choose Media Type",
  description = "What type of media would you like to add?"
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleSelectPhotos = () => {
    onSelectType('photo')
    onClose()
  }

  const handleSelectVideos = () => {
    onSelectType('video')
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--modal-overlay)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10001,
        backdropFilter: 'blur(4px)'
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '16px',
          padding: '32px',
          width: '90%',
          maxWidth: '480px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          animation: 'modalSlideIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(-10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}</style>

        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            lineHeight: '1.2',
            marginBottom: '8px'
          }}>
            {title}
          </h2>
          <p style={{
            margin: 0,
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.4'
          }}>
            {description}
          </p>
        </div>

        {/* Media Type Options */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Photos Option */}
          <button
            onClick={handleSelectPhotos}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 16px',
              backgroundColor: 'var(--bg-secondary)',
              border: '2px solid var(--border-secondary)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--bg-tertiary)'
              e.target.style.borderColor = '#62759F'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--bg-secondary)'
              e.target.style.borderColor = 'var(--border-secondary)'
              e.target.style.transform = 'translateY(0)'
            }}
          >
            <div style={{
              fontSize: '48px',
              marginBottom: '12px',
              lineHeight: '1'
            }}>
              📷
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '4px'
            }}>
              Photos
            </div>
            <div style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.3'
            }}>
              Add image content for your posts
            </div>
          </button>

          {/* Videos Option */}
          <button
            onClick={handleSelectVideos}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 16px',
              backgroundColor: 'var(--bg-secondary)',
              border: '2px solid var(--border-secondary)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--bg-tertiary)'
              e.target.style.borderColor = '#62759F'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'var(--bg-secondary)'
              e.target.style.borderColor = 'var(--border-secondary)'
              e.target.style.transform = 'translateY(0)'
            }}
          >
            <div style={{
              fontSize: '48px',
              marginBottom: '12px',
              lineHeight: '1'
            }}>
              🎬
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '4px'
            }}>
              Videos
            </div>
            <div style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: '1.3'
            }}>
              Add video content for your posts
            </div>
          </button>
        </div>

        {/* Cancel Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              border: '2px solid var(--border-primary)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--bg-secondary)'
              e.target.style.borderColor = 'var(--border-secondary)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.borderColor = 'var(--border-primary)'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default MediaTypeModal