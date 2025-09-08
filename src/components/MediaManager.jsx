import { useState } from 'react'
import MediaThumbnail from './MediaThumbnail'
import { getRandomMediaItems } from '../data/mockMedia'

const MediaManager = ({ media, onMediaChange, maxMedia = 20 }) => {
  const [selectedPreview, setSelectedPreview] = useState(0)
  
  const handleAddMedia = () => {
    // Add 1-3 random media items, respecting max limit
    const availableSlots = maxMedia - media.length
    if (availableSlots <= 0) return
    
    const newItems = Math.min(Math.floor(Math.random() * 3) + 1, availableSlots)
    const randomMedia = getRandomMediaItems(newItems)
    
    // Filter out any duplicates
    const existingIds = new Set(media.map(item => item.id))
    const uniqueNewMedia = randomMedia.filter(item => !existingIds.has(item.id))
    
    if (uniqueNewMedia.length > 0) {
      onMediaChange([...media, ...uniqueNewMedia])
    }
  }

  const handleDeleteMedia = (mediaId) => {
    const updatedMedia = media.filter(item => item.id !== mediaId)
    onMediaChange(updatedMedia)
    
    // Adjust selected preview if necessary
    if (selectedPreview >= updatedMedia.length && updatedMedia.length > 0) {
      setSelectedPreview(updatedMedia.length - 1)
    } else if (updatedMedia.length === 0) {
      setSelectedPreview(0)
    }
  }

  const handleThumbnailClick = (mediaId) => {
    const index = media.findIndex(item => item.id === mediaId)
    if (index !== -1) {
      setSelectedPreview(index)
    }
  }

  // Empty state
  if (media.length === 0) {
    return (
      <div 
        onClick={handleAddMedia}
        style={{
          flex: 1,
          border: '2px dashed #dee2e6',
          borderRadius: '8px',
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px'
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📁</div>
        <div style={{ fontWeight: '500', marginBottom: '4px' }}>
          Upload Media
        </div>
        <div style={{ fontSize: '14px', color: '#6c757d' }}>
          Drag & drop or click to upload
        </div>
      </div>
    )
  }

  // Media loaded state
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Large Preview */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '160px',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #dee2e6',
        backgroundColor: '#f8f9fa'
      }}>
        <img
          src={media[selectedPreview]?.url || media[selectedPreview]?.thumbnail}
          alt={media[selectedPreview]?.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          loading="lazy"
        />
        
        {/* Preview counter */}
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          backgroundColor: 'rgba(0,0,0,0.6)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          {selectedPreview + 1} / {media.length}
        </div>
      </div>

      {/* Thumbnail Carousel */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
        scrollbarWidth: 'thin'
      }}>
        {media.map((item, index) => (
          <MediaThumbnail
            key={item.id}
            media={item}
            size={60}
            onDelete={handleDeleteMedia}
            onClick={handleThumbnailClick}
            isSelected={index === selectedPreview}
            showDelete={true}
          />
        ))}
        
        {/* Add More Button */}
        {media.length < maxMedia && (
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
              fontSize: '24px',
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
          >
            +
          </button>
        )}
      </div>

      {/* Media Info */}
      <div style={{
        fontSize: '12px',
        color: '#6c757d',
        textAlign: 'center'
      }}>
        {media.length} of {maxMedia} media files selected
      </div>
    </div>
  )
}

export default MediaManager