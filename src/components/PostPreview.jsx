import React from 'react'

const PostPreview = ({ platform, postType, content, isActive }) => {
  const { caption, media, account } = content || {}

  const InstagramPreview = () => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #dbdbdb',
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
        borderBottom: '1px solid #efefef'
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
          <div style={{ fontSize: '12px', color: '#8e8e8e' }}>2h</div>
        </div>
      </div>

      {/* Image */}
      <div style={{
        aspectRatio: '1',
        backgroundColor: '#f5f5f5',
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
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #d0d0d0',
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
        borderBottom: '1px solid #efefef'
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
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#000' }}>
            {account}
          </div>
          <div style={{ fontSize: '12px', color: '#666666' }}>
            1,234 followers
          </div>
          <div style={{ fontSize: '12px', color: '#666666' }}>
            2h • 🌍
          </div>
        </div>
        <div style={{ fontSize: '20px', color: '#666666' }}>⋯</div>
      </div>

      {/* Content */}
      {caption && (
        <div style={{
          padding: '16px',
          fontSize: '14px',
          lineHeight: '20px',
          color: '#000'
        }}>
          {caption}
        </div>
      )}

      {/* Image */}
      {media && media.length > 0 && (
        <div style={{
          aspectRatio: '16/9',
          backgroundColor: '#f5f5f5',
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
        borderTop: '1px solid #efefef',
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
            color: '#666666',
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
            color: '#666666',
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
            color: '#666666',
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
            color: '#666666',
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
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #cfd9de',
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
            color: '#0f1419'
          }}>
            {account}
          </div>
          <div style={{ 
            fontSize: '15px', 
            color: '#536471'
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
          color: '#0f1419',
          marginBottom: media && media.length > 0 ? '12px' : '16px'
        }}>
          {caption}
        </div>
      )}

      {/* Image */}
      {media && media.length > 0 && (
        <div style={{
          aspectRatio: '16/9',
          backgroundColor: '#f5f5f5',
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
        color: '#536471',
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

  const GenericPreview = () => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e1e5e9',
      maxWidth: '300px',
      margin: '0 auto',
      padding: '16px',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '32px',
        marginBottom: '12px'
      }}>
        <platform.icon size={32} color={platform?.color || '#666'} />
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
          color: '#6c757d',
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