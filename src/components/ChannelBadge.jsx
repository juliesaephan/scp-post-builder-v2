import { useState } from 'react'
import { getPlatformById } from '../data/platforms'

const ChannelBadge = ({ channelId, postType, onEdit, onRemove }) => {
  const [isHovered, setIsHovered] = useState(false)
  const platform = getPlatformById(channelId)
  
  if (!platform) return null

  const displayText = postType 
    ? `${platform.name} • ${postType}` 
    : platform.name

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        backgroundColor: platform.color,
        color: 'white',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        position: 'relative',
        cursor: isHovered ? 'pointer' : 'default'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={{ fontSize: '16px' }}>{platform.icon}</span>
      <span>{displayText}</span>
      
      {isHovered && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginLeft: '8px'
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.(channelId)
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '4px',
              padding: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              color: 'white'
            }}
            title="Edit channel"
          >
            ✏️
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove?.(channelId)
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '4px',
              padding: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              color: 'white'
            }}
            title="Remove channel"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

export default ChannelBadge