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


  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      overflowX: 'auto',
      paddingBottom: '4px',
      scrollbarWidth: 'thin',
      minHeight: '70px',
      width: '100%',
      minWidth: 0 // Prevents flex expansion
    }}>
      {/* Show only selected media for this channel */}
      {selectedMedia.map((item) => (
        <MediaThumbnail
          key={item.id}
          media={item}
          size={60}
          onDelete={handleRemoveMedia}
          showDelete={true}
        />
      ))}
      
      {/* Add More Button */}
      <button
        onClick={handleAddMedia}
        style={{
          width: 60,
          height: 60,
          border: '2px dashed #62759F',
          borderRadius: '8px',
          backgroundColor: '#f8f9fb',
          color: '#62759F',
          cursor: 'pointer',
          fontSize: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#62759F'
          e.target.style.color = 'white'
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#f8f9fb'
          e.target.style.color = '#62759F'
        }}
        title="Add media to this channel"
      >
        +
      </button>
      
      {/* Empty state when no media selected for this channel */}
      {selectedMedia.length === 0 && (
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
          Click + to add media to this channel
        </div>
      )}
    </div>
  )
}

export default ChannelMediaGrid