import React from 'react'
import { getPlatformById } from '../data/platforms'

const CaptionCounterGroup = ({ 
  selectedChannels, 
  caption, 
  channelCaptions
}) => {
  if (selectedChannels.length === 0) return null

  // Group channels by their caption content (all captions are independent)
  const getChannelCaption = (channelId) => {
    return channelCaptions[channelId] || caption
  }

  // Create groups of channels with the same caption
  const captionGroups = {}
  selectedChannels.forEach(channel => {
    const channelCaption = getChannelCaption(channel.id)
    const key = channelCaption
    
    if (!captionGroups[key]) {
      captionGroups[key] = {
        caption: channelCaption,
        channels: []
      }
    }
    captionGroups[key].channels.push(channel)
  })

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      padding: '12px 0',
      borderTop: '1px solid var(--border-primary)',
      marginTop: '8px'
    }}>
      {Object.values(captionGroups).map((group, groupIndex) => (
        <div key={groupIndex} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-primary)',
          borderRadius: '20px',
          fontSize: '12px'
        }}>
          {/* Platform Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {group.channels.map((channel, index) => {
              const platform = getPlatformById(channel.id)
              const IconComponent = platform?.icon
              return (
                <div
                  key={channel.id}
                  style={{
                    fontSize: '14px',
                    marginLeft: index > 0 ? '-2px' : '0'
                  }}
                >
                  {IconComponent && <IconComponent size={14} color="var(--icon-color)" />}
                </div>
              )
            })}
          </div>

          {/* Character Count */}
          <span style={{
            color: group.caption.length > 280 ? 'var(--text-error)' : 'var(--text-secondary)',
            fontWeight: '500'
          }}>
            {group.caption.length}/280
          </span>

        </div>
      ))}
    </div>
  )
}

export default CaptionCounterGroup