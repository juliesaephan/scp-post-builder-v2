import React from 'react'

const PostPreview = ({ platform, postType, content, isActive }) => {
  const { caption, media, account } = content || {}

  const InstagramPreview = () => (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      borderRadius: '12px',
      border: '1px solid var(--border-primary)',
      maxWidth: '300px',
      margin: '0 auto',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-secondary)'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '12px'
        }}>
          🧁
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>{account}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>2h</div>
        </div>
      </div>

      {/* Image */}
      <div style={{
        aspectRatio: '1',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999',
        fontSize: '14px',
        backgroundImage: media && media.length > 0 && media[0].url ? 
          `url(${media[0].url})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {media && media.length > 0 ? (
          media[0].url ? null : <div style={{ fontSize: '48px' }}>📷</div>
        ) : (
          'No image uploaded'
        )}
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 16px 8px',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span style={{ fontSize: '24px', cursor: 'pointer' }}>❤️</span>
          <span style={{ fontSize: '24px', cursor: 'pointer' }}>💬</span>
          <span style={{ fontSize: '24px', cursor: 'pointer' }}>📤</span>
        </div>
        <span style={{ fontSize: '24px', cursor: 'pointer' }}>🔖</span>
      </div>

      {/* Caption */}
      {caption && (
        <div style={{
          padding: '0 16px 16px',
          fontSize: '14px',
          lineHeight: '18px'
        }}>
          <span style={{ fontWeight: '600', marginRight: '6px' }}>{account}</span>
          {caption}
        </div>
      )}
    </div>
  )

  const LinkedInPreview = () => (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      borderRadius: '8px',
      border: '1px solid var(--border-primary)',
      maxWidth: '350px',
      margin: '0 auto',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '1px solid var(--border-secondary)'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '4px',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '12px',
          fontSize: '20px'
        }}>
          🧁
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {account}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            1,234 followers
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            2h • 🌍
          </div>
        </div>
        <div style={{ fontSize: '20px', color: 'var(--text-secondary)' }}>⋯</div>
      </div>

      {/* Content */}
      {caption && (
        <div style={{
          padding: '16px',
          fontSize: '14px',
          lineHeight: '20px',
          color: 'var(--text-primary)'
        }}>
          {caption}
        </div>
      )}

      {/* Image */}
      {media && media.length > 0 && (
        <div style={{
          aspectRatio: '16/9',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '48px',
          backgroundImage: media[0].url ? `url(${media[0].url})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          {!media[0].url && '📷'}
        </div>
      )}

      {/* Engagement */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border-secondary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            👍 Like
          </button>
          <button style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            💬 Comment
          </button>
          <button style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            🔄 Share
          </button>
          <button style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            📩 Send
          </button>
        </div>
      </div>
    </div>
  )

  const TwitterPreview = () => (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      borderRadius: '16px',
      border: '1px solid var(--border-primary)',
      maxWidth: '350px',
      margin: '0 auto',
      padding: '16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '12px'
        }}>
          🧁
        </div>
        <div>
          <div style={{
            fontSize: '15px',
            fontWeight: '700',
            color: 'var(--text-primary)'
          }}>
            {account}
          </div>
          <div style={{
            fontSize: '15px',
            color: 'var(--text-secondary)'
          }}>
            @bestiesbakes
          </div>
        </div>
      </div>

      {/* Content */}
      {caption && (
        <div style={{
          fontSize: '15px',
          lineHeight: '20px',
          color: 'var(--text-primary)',
          marginBottom: media && media.length > 0 ? '12px' : '16px'
        }}>
          {caption}
        </div>
      )}

      {/* Image */}
      {media && media.length > 0 && (
        <div style={{
          aspectRatio: '16/9',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '48px',
          marginBottom: '16px',
          backgroundImage: media[0].url ? `url(${media[0].url})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          {!media[0].url && '📷'}
        </div>
      )}

      {/* Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'var(--text-secondary)',
        fontSize: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          💬 <span>Reply</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          🔄 <span>Repost</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          ❤️ <span>Like</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          📊 <span>View</span>
        </div>
      </div>
    </div>
  )

  const TikTokPreview = () => (
    <div style={{
      backgroundColor: '#000',
      borderRadius: '12px',
      width: '220px',
      height: '390px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Main Content Area */}
      <div style={{
        flex: 1,
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: media && media.length > 0 && media[0].url ?
          `url(${media[0].url})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        {media && media.length > 0 ? (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px'
          }}>
            ▶️
          </div>
        ) : (
          <div style={{
            color: 'white',
            fontSize: '14px',
            textAlign: 'center',
            padding: '20px'
          }}>
            Add video to see TikTok preview
          </div>
        )}
      </div>

      {/* Side Actions */}
      <div style={{
        position: 'absolute',
        right: '12px',
        bottom: '80px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'center'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid white'
        }}>
          🧁
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          color: 'white'
        }}>
          <div style={{ fontSize: '20px' }}>❤️</div>
          <div style={{ fontSize: '10px' }}>1.2K</div>
        </div>
      </div>

      {/* Bottom Info */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        right: '80px',
        color: 'white'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '4px'
        }}>
          @{account || 'bestiesbakes'}
        </div>
        {caption && (
          <div style={{
            fontSize: '13px',
            lineHeight: '16px',
            marginBottom: '8px'
          }}>
            {caption.length > 60 ? `${caption.substring(0, 60)}...` : caption}
          </div>
        )}
      </div>
    </div>
  )

  const GenericPreview = () => {
    const IconComponent = platform?.icon
    return (
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '12px',
        border: '1px solid var(--border-primary)',
        maxWidth: '300px',
        margin: '0 auto',
        padding: '16px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '32px',
          marginBottom: '12px'
        }}>
          {IconComponent && <IconComponent size={32} color={platform?.color || '#666'} />}
        </div>
      <div style={{
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '8px'
      }}>
        {platform?.name} {postType && `• ${postType}`}
      </div>
      {caption ? (
        <div style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: '18px'
        }}>
          {caption.length > 100 ? `${caption.substring(0, 100)}...` : caption}
        </div>
      ) : (
        <div style={{
          fontSize: '14px',
          color: '#999',
          fontStyle: 'italic'
        }}>
          Add caption to see preview
        </div>
      )}
      </div>
    )
  }

  // Choose the appropriate preview based on platform
  const renderPreview = () => {
    if (!platform) return <GenericPreview />

    switch (platform.id) {
      case 'instagram':
        return <InstagramPreview />
      case 'linkedin':
        return <LinkedInPreview />
      case 'x':
        return <TwitterPreview />
      case 'tiktok':
        return <TikTokPreview />
      default:
        return <GenericPreview />
    }
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {renderPreview()}
    </div>
  )
}

export default PostPreview