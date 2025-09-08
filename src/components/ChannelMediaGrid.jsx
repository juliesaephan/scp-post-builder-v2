import MediaThumbnail from './MediaThumbnail'
import { getRandomMediaItems } from '../data/mockMedia'

const ChannelMediaGrid = ({ 
  channelId,
  masterMedia = [],
  selectedMedia = [],
  onMediaAdd,
  onMediaRemove,
  maxMedia = 20
}) => {
  
  const handleAddMedia = () => {
    // Add media to this specific channel
    const availableSlots = maxMedia - masterMedia.length
    if (availableSlots <= 0) return
    
    const newItems = Math.min(Math.floor(Math.random() * 2) + 1, availableSlots)
    const randomMedia = getRandomMediaItems(newItems)
    
    // Filter out any duplicates from master media
    const existingIds = new Set(masterMedia.map(item => item.id))
    const uniqueNewMedia = randomMedia.filter(item => !existingIds.has(item.id))
    
    if (uniqueNewMedia.length > 0 && onMediaAdd) {
      onMediaAdd(channelId, uniqueNewMedia)
    }
  }

  const handleRemoveMedia = (mediaId) => {
    if (onMediaRemove) {
      onMediaRemove(channelId, mediaId)
    }
  }

  const handleToggleMedia = (mediaId) => {
    // Toggle selection of this media for this channel
    const isCurrentlySelected = selectedMedia.some(item => item.id === mediaId)
    
    if (isCurrentlySelected) {
      handleRemoveMedia(mediaId)
    } else {
      const mediaItem = masterMedia.find(item => item.id === mediaId)
      if (mediaItem && onMediaAdd) {
        onMediaAdd(channelId, [mediaItem])
      }
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      overflowX: 'auto',
      paddingBottom: '4px',
      scrollbarWidth: 'thin',
      minHeight: '70px'
    }}>
      {/* Show all master media, highlight selected ones */}
      {masterMedia.map((item) => {
        const isSelected = selectedMedia.some(selected => selected.id === item.id)
        
        return (
          <MediaThumbnail
            key={item.id}
            media={item}
            size={60}
            onDelete={isSelected ? handleRemoveMedia : null}
            onClick={handleToggleMedia}
            isSelected={isSelected}
            showDelete={isSelected}
          />
        )
      })}
      
      {/* Add More Button */}
      {masterMedia.length < maxMedia && (
        <button
          onClick={handleAddMedia}
          style={{
            width: 60,
            height: 60,
            border: '2px dashed #007bff',
            borderRadius: '8px',
            backgroundColor: '#f8f9fb',
            color: '#007bff',
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#007bff'
            e.target.style.color = 'white'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#f8f9fb'
            e.target.style.color = '#007bff'
          }}
          title={`Add media to channel (${masterMedia.length}/${maxMedia})`}
        >
          +
        </button>
      )}
      
      {/* Empty state when no master media */}
      {masterMedia.length === 0 && (
        <div
          onClick={handleAddMedia}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '200px',
            height: '60px',
            border: '2px dashed #dee2e6',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            color: '#6c757d',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Click + to add media
        </div>
      )}
    </div>
  )
}

export default ChannelMediaGrid