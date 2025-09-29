import { useState, useEffect } from 'react'
import { getPlatformById } from '../data/platforms'
import PostPreview from './PostPreview'

const PreviewCarousel = ({ 
  selectedChannels, 
  caption, 
  media,
  // Individual channel mode props
  individualChannelMode = false,
  editingChannelId = null,
  tempChanges = {} 
}) => {
  const [activePreviewIndex, setActivePreviewIndex] = useState(0)
  const [previewData, setPreviewData] = useState([])
  const [extendedData, setExtendedData] = useState([])
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Generate preview data when channels or content changes
  useEffect(() => {
    let data
    
    if (individualChannelMode && editingChannelId) {
      // Filter to just the channel being edited
      const channel = selectedChannels.find(c => c.id === editingChannelId)
      if (channel) {
        const platform = getPlatformById(channel.id)
        const customizations = tempChanges.customizedChannels?.[editingChannelId] || {}
        
        // Get media - use channel-specific if customized, otherwise master
        let channelMedia = media || []
        if (customizations.media && tempChanges.selectedMediaByChannel?.[editingChannelId]) {
          channelMedia = tempChanges.selectedMediaByChannel[editingChannelId]
        } else if (tempChanges.channelMedia) {
          channelMedia = tempChanges.channelMedia
        }
        
        // Get caption - use channel-specific if customized, otherwise master
        let channelCaption = caption || ''
        if (customizations.caption && tempChanges.channelCaptions?.[editingChannelId]) {
          channelCaption = tempChanges.channelCaptions[editingChannelId]
        } else if (tempChanges.caption) {
          channelCaption = tempChanges.caption
        }
        
        data = [{
          id: channel.id,
          platform: platform,
          postType: channel.postType,
          content: {
            caption: channelCaption,
            media: channelMedia,
            account: platform?.account || "Bestie's Bakes"
          }
        }]
      } else {
        data = []
      }
    } else {
      // Normal mode - show all selected channels
      data = selectedChannels.map(channel => {
        const platform = getPlatformById(channel.id)
        return {
          id: channel.id,
          platform: platform,
          postType: channel.postType,
          content: {
            caption: caption || '',
            media: media || [],
            account: platform?.account || "Bestie's Bakes"
          }
        }
      })
    }
    
    setPreviewData(data)
    
    // Create extended data for infinite loop effect
    if (data.length > 1) {
      const extended = [
        data[data.length - 1], // Last item at beginning
        ...data,
        data[0] // First item at end
      ]
      setExtendedData(extended)
    } else {
      setExtendedData(data)
    }
    
    // Reset active index if it's out of bounds
    if (activePreviewIndex >= data.length && data.length > 0) {
      setActivePreviewIndex(0)
    }
  }, [selectedChannels, caption, media, activePreviewIndex, individualChannelMode, editingChannelId, tempChanges])

  const handleTabClick = (index) => {
    setActivePreviewIndex(index)
  }

  const handlePreviewClick = (index) => {
    if (index !== activePreviewIndex) {
      setActivePreviewIndex(index)
    }
  }

  const handlePrevious = () => {
    if (previewData.length <= 1) return
    
    setIsTransitioning(true)
    if (activePreviewIndex === 0) {
      // Going from first to last - use extended data for smooth transition
      setActivePreviewIndex(previewData.length - 1)
    } else {
      setActivePreviewIndex(activePreviewIndex - 1)
    }
    
    setTimeout(() => setIsTransitioning(false), 300)
  }

  const handleNext = () => {
    if (previewData.length <= 1) return
    
    setIsTransitioning(true)
    if (activePreviewIndex === previewData.length - 1) {
      // Going from last to first - use extended data for smooth transition
      setActivePreviewIndex(0)
    } else {
      setActivePreviewIndex(activePreviewIndex + 1)
    }
    
    setTimeout(() => setIsTransitioning(false), 300)
  }

  if (selectedChannels.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#6c757d',
        fontSize: '14px',
        textAlign: 'center'
      }}>
        Select channels and add content to see preview
      </div>
    )
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Channel Tab Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '1px solid #e1e5e9',
        gap: '8px',
        overflowX: 'auto'
      }}>
        {/* Previous Arrow */}
        {previewData.length > 1 && (
          <button
            onClick={handlePrevious}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              fontSize: '16px',
              color: '#6c757d'
            }}
          >
            ‹
          </button>
        )}

        {/* Channel Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flex: 1,
          justifyContent: 'center'
        }}>
          {previewData.map((preview, index) => {
            const IconComponent = preview.platform.icon
            return (
              <button
                key={preview.id}
                onClick={() => handleTabClick(index)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: preview.platform.color,
                  color: 'white',
                  border: activePreviewIndex === index ? '2px solid #007bff' : '2px solid transparent',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: activePreviewIndex === index ? 1 : 0.7,
                  transition: 'all 0.2s ease'
                }}
              >
                <IconComponent size={16} color="white" />
              </button>
            )
          })}
        </div>

        {/* Next Arrow */}
        {previewData.length > 1 && (
          <button
            onClick={handleNext}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              fontSize: '16px',
              color: '#6c757d'
            }}
          >
            ›
          </button>
        )}
      </div>

      {/* Preview Carousel */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {previewData.length === 1 ? (
          // Single preview - center it
          <div style={{
            width: '400px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <PostPreview
              platform={previewData[0].platform}
              postType={previewData[0].postType}
              content={previewData[0].content}
              isActive={true}
            />
          </div>
        ) : (
          // Multiple previews - show 3 at a time (center + sides)
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            position: 'relative'
          }}>
            {/* Previous Preview */}
            {previewData.length > 1 && (() => {
              const prevIndex = activePreviewIndex === 0 ? previewData.length - 1 : activePreviewIndex - 1
              const prevPreview = previewData[prevIndex]
              
              return prevPreview ? (
                <div
                  onClick={() => handlePreviewClick(prevIndex)}
                  style={{
                    width: '200px',
                    height: '70%',
                    opacity: 0.3,
                    transform: 'scale(0.7)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <PostPreview
                    platform={prevPreview.platform}
                    postType={prevPreview.postType}
                    content={prevPreview.content}
                    isActive={false}
                  />
                </div>
              ) : null
            })()}

            {/* Active Preview - Now truly 3x larger than sides (600px vs 200px) */}
            {previewData[activePreviewIndex] && (
              <div style={{
                width: '600px',
                height: '95%',
                opacity: 1,
                transform: 'scale(1)',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 20px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                borderRadius: '12px',
                backgroundColor: 'transparent',
                transition: 'all 0.3s ease'
              }}>
                <PostPreview
                  platform={previewData[activePreviewIndex].platform}
                  postType={previewData[activePreviewIndex].postType}
                  content={previewData[activePreviewIndex].content}
                  isActive={true}
                />
              </div>
            )}

            {/* Next Preview */}
            {previewData.length > 1 && (() => {
              const nextIndex = activePreviewIndex === previewData.length - 1 ? 0 : activePreviewIndex + 1
              const nextPreview = previewData[nextIndex]
              
              return nextPreview ? (
                <div
                  onClick={() => handlePreviewClick(nextIndex)}
                  style={{
                    width: '200px',
                    height: '70%',
                    opacity: 0.3,
                    transform: 'scale(0.7)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <PostPreview
                    platform={nextPreview.platform}
                    postType={nextPreview.postType}
                    content={nextPreview.content}
                    isActive={false}
                  />
                </div>
              ) : null
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

export default PreviewCarousel