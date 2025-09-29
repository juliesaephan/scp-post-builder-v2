import { useState } from 'react'
import MediaThumbnail from './MediaThumbnail'
import { getRandomMediaItems } from '../data/mockMedia'

const MediaManager = ({ media, onMediaChange, maxMedia = 20 }) => {
  const [selectedPreview, setSelectedPreview] = useState(0)
  const [carouselStart, setCarouselStart] = useState(0)
  
  // Carousel configuration
  const maxVisibleThumbnails = 4 // Maximum thumbnails visible at once
  const thumbnailSize = 60
  const gap = 8
  
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

  // Carousel navigation functions
  const canScrollLeft = carouselStart > 0
  const canScrollRight = carouselStart + maxVisibleThumbnails < media.length

  const handleCarouselLeft = () => {
    if (canScrollLeft) {
      setCarouselStart(Math.max(0, carouselStart - 1))
    }
  }

  const handleCarouselRight = () => {
    if (canScrollRight) {
      setCarouselStart(Math.min(media.length - maxVisibleThumbnails, carouselStart + 1))
    }
  }

  // Get visible thumbnails for current carousel window
  const visibleThumbnails = media.slice(carouselStart, carouselStart + maxVisibleThumbnails)

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

      {/* Windowed Thumbnail Carousel */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        position: 'relative'
      }}>
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={handleCarouselLeft}
            style={{
              position: 'absolute',
              left: '-8px',
              zIndex: 2,
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ‹
          </button>
        )}

        {/* Carousel Window - Fixed Width Container */}
        <div style={{
          width: `${maxVisibleThumbnails * (thumbnailSize + gap) - gap}px`, // Fixed width calculation
          overflow: 'hidden', // Critical: prevents expansion
          display: 'flex',
          gap: `${gap}px`,
          paddingBottom: '4px'
        }}>
          {visibleThumbnails.map((item) => {
            const originalIndex = media.findIndex(mediaItem => mediaItem.id === item.id)
            return (
              <MediaThumbnail
                key={item.id}
                media={item}
                size={thumbnailSize}
                onDelete={handleDeleteMedia}
                onClick={handleThumbnailClick}
                isSelected={originalIndex === selectedPreview}
                showDelete={true}
              />
            )
          })}
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={handleCarouselRight}
            style={{
              position: 'absolute',
              right: '68px', // Position before add button
              zIndex: 2,
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ›
          </button>
        )}

        {/* Add More Button - Outside Carousel */}
        {media.length < maxMedia && (
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
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '12px',
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