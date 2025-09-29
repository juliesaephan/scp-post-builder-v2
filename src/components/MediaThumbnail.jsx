import { useState } from 'react'

const MediaThumbnail = ({ 
  media, 
  size = 80, 
  onDelete, 
  showDelete = true,
  onClick,
  isSelected = false,
  className = ''
}) => {
  const [showDeleteButton, setShowDeleteButton] = useState(false)

  const handleDelete = (e) => {
    e.stopPropagation()
    if (onDelete) onDelete(media.id)
  }

  const handleClick = () => {
    if (onClick) onClick(media.id)
  }

  return (
    <div 
      className={className}
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        border: isSelected ? '2px solid #62759F' : '1px solid #dee2e6',
        flexShrink: 0
      }}
      onMouseEnter={() => setShowDeleteButton(true)}
      onMouseLeave={() => setShowDeleteButton(false)}
      onClick={handleClick}
    >
      <img
        src={media.thumbnail || media.url}
        alt={media.name}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        loading="lazy"
      />

      {/* Media Type Indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '4px',
          left: '4px',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          lineHeight: '1'
        }}
        title={media.type === 'video' ? 'Video' : 'Photo'}
      >
        {media.type === 'video' ? '🎬' : '📷'}
      </div>

      {showDelete && showDeleteButton && (
        <button
          onClick={handleDelete}
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}

export default MediaThumbnail