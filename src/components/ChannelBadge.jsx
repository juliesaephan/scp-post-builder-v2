
import React, { useState } from 'react'
import { getPlatformById } from '../data/platforms'

const ChannelBadge = ({ channelId, postType, onRemove }) => {
  const [isHovered, setIsHovered] = useState(false)
  const platform = getPlatformById(channelId)
  const IconComponent = platform?.icon
  
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
        paddingRight: '40px', // Fixed padding to accommodate X button
        backgroundColor: platform.color,
        color: 'white',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        position: 'relative',
        cursor: isHovered ? 'pointer' : 'default',
        minWidth: 'fit-content'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {IconComponent && <IconComponent size={16} color="white" />}
      <span>{displayText}</span>

      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove?.(channelId)
        }}
        style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          borderRadius: '4px',
          padding: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          color: 'white',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.2s ease',
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Remove channel"
      >
        ✕
      </button>
    </div>
  )
}

export default ChannelBadge