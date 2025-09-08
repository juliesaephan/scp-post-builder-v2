import { getPlatformById } from '../data/platforms'

const CaptionCounterGroup = ({ 
  selectedChannels, 
  caption, 
  channelCaptions, 
  captionsLinked 
}) => {
  if (selectedChannels.length === 0) return null

  // Group channels by their caption content
  const getChannelCaption = (channelId) => {
    if (captionsLinked) {
      return caption
    }
    return channelCaptions[channelId] || caption
  }

  // Create groups of channels with the same caption
  const captionGroups = {}
  selectedChannels.forEach(channel => {
    const channelCaption = getChannelCaption(channel.id)
    const key = captionsLinked ? 'connected' : channelCaption
    
    if (!captionGroups[key]) {
      captionGroups[key] = {
        caption: channelCaption,
        channels: [],
        isConnected: captionsLinked
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
      borderTop: '1px solid #e1e5e9',
      marginTop: '8px'
    }}>
      {Object.values(captionGroups).map((group, groupIndex) => (
        <div key={groupIndex} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          backgroundColor: group.isConnected ? '#f0f8ff' : '#f8f9fa',
          border: group.isConnected ? '1px solid #cce7ff' : '1px solid #e1e5e9',
          borderRadius: '20px',
          fontSize: '12px'
        }}>
          {/* Platform Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {group.channels.map((channel, index) => {
              const platform = getPlatformById(channel.id)
              return (
                <div
                  key={channel.id}
                  style={{
                    fontSize: '14px',
                    marginLeft: index > 0 ? '-2px' : '0'
                  }}
                >
                  {platform?.icon}
                </div>
              )
            })}
          </div>
          
          {/* Character Count */}
          <span style={{
            color: group.caption.length > 280 ? '#dc3545' : '#6c757d',
            fontWeight: '500'
          }}>
            {group.caption.length}/280
          </span>
          
          {/* Connection Status */}
          {group.isConnected && (
            <span style={{
              color: '#007bff',
              fontSize: '11px'
            }}>
              linked
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export default CaptionCounterGroup