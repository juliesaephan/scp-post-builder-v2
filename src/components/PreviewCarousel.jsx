import React, { useState, useEffect } from 'react'
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
            return (
              <button
                key={preview.id}
                onClick={() => handleTabClick(index)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: 'red',
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
                {(() => {
                  const platformId = preview.platform?.id
                  switch (platformId) {
                    case 'instagram':
                      return (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M8.01786 3.875C5.73214 3.875 3.91071 5.73214 3.91071 7.98214C3.91071 10.2679 5.73214 12.0893 8.01786 12.0893C10.2679 12.0893 12.125 10.2679 12.125 7.98214C12.125 5.73214 10.2679 3.875 8.01786 3.875ZM8.01786 10.6607C6.55357 10.6607 5.33929 9.48214 5.33929 7.98214C5.33929 6.51786 6.51786 5.33929 8.01786 5.33929C9.48214 5.33929 10.6607 6.51786 10.6607 7.98214C10.6607 9.48214 9.48214 10.6607 8.01786 10.6607ZM13.2321 3.73214C13.2321 3.19643 12.8036 2.76786 12.2679 2.76786C11.7321 2.76786 11.3036 3.19643 11.3036 3.73214C11.3036 4.26786 11.7321 4.69643 12.2679 4.69643C12.8036 4.69643 13.2321 4.26786 13.2321 3.73214ZM15.9464 4.69643C15.875 3.41071 15.5893 2.26786 14.6607 1.33929C13.7321 0.410714 12.5893 0.125 11.3036 0.0535714C9.98214 -0.0178571 6.01786 -0.0178571 4.69643 0.0535714C3.41071 0.125 2.30357 0.410714 1.33929 1.33929C0.410714 2.26786 0.125 3.41071 0.0535714 4.69643C-0.0178571 6.01786 -0.0178571 9.98214 0.0535714 11.3036C0.125 12.5893 0.410714 13.6964 1.33929 14.6607C2.30357 15.5893 3.41071 15.875 4.69643 15.9464C6.01786 16.0179 9.98214 16.0179 11.3036 15.9464C12.5893 15.875 13.7321 15.5893 14.6607 14.6607C15.5893 13.6964 15.875 12.5893 15.9464 11.3036C16.0179 9.98214 16.0179 6.01786 15.9464 4.69643ZM14.2321 12.6964C13.9821 13.4107 13.4107 13.9464 12.7321 14.2321C11.6607 14.6607 9.16072 14.5536 8.01786 14.5536C6.83929 14.5536 4.33929 14.6607 3.30357 14.2321C2.58929 13.9464 2.05357 13.4107 1.76786 12.6964C1.33929 11.6607 1.44643 9.16072 1.44643 7.98214C1.44643 6.83929 1.33929 4.33929 1.76786 3.26786C2.05357 2.58929 2.58929 2.05357 3.30357 1.76786C4.33929 1.33929 6.83929 1.44643 8.01786 1.44643C9.16072 1.44643 11.6607 1.33929 12.7321 1.76786C13.4107 2.01786 13.9464 2.58929 14.2321 3.26786C14.6607 4.33929 14.5536 6.83929 14.5536 7.98214C14.5536 9.16072 14.6607 11.6607 14.2321 12.6964Z" fill="white"/>
                        </svg>
                      )
                    case 'facebook':
                      return (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 11.993 2.92547 15.3027 6.75 15.9028V10.3125H4.71875V8H6.75V6.2375C6.75 4.2325 7.94438 3.125 9.77172 3.125C10.6467 3.125 11.5625 3.28125 11.5625 3.28125V5.25H10.5538C9.56 5.25 9.25 5.86672 9.25 6.5V8H11.4688L11.1141 10.3125H9.25V15.9028C13.0745 15.3027 16 11.993 16 8Z" fill="white"/>
                        </svg>
                      )
                    case 'tiktok':
                      return (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path fillRule="evenodd" clipRule="evenodd" d="M11.2802 0C11.5432 2.27047 12.8054 3.62412 15 3.76812V6.32181C13.7282 6.44661 12.6142 6.029 11.3185 5.24177V10.0179C11.3185 16.0853 4.72994 17.9814 2.08115 13.6324C0.379038 10.834 1.42134 5.92339 6.88149 5.72659V8.41947C6.46553 8.48668 6.02087 8.59228 5.61447 8.73148C4.40004 9.1443 3.71155 9.91712 3.90279 11.2804C4.27095 13.8917 9.0426 14.6645 8.64576 9.56191V0.00480016H11.2802V0Z" fill="white"/>
                        </svg>
                      )
                    case 'x':
                      return (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M9.52217 6.77491L15.4785 0H14.0671L8.89516 5.88256L4.76437 0H0L6.24656 8.89547L0 16H1.41155L6.87321 9.78782L11.2356 16H16L9.52183 6.77491H9.52217ZM7.58887 8.97384L6.95596 8.08805L1.92015 1.03974H4.0882L8.15216 6.72795L8.78507 7.61374L14.0677 15.0075H11.8997L7.58887 8.97418V8.97384Z" fill="white"/>
                        </svg>
                      )
                    case 'threads':
                      return (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M6.81 3.5C5.23 3.5 4.15 4.58 4.15 6.16V8.06C4.15 9.64 5.23 10.72 6.81 10.72H9.85C9.85 10.72 9.85 10.72 9.85 10.72C11.43 10.72 12.51 9.64 12.51 8.06V6.16C12.51 4.58 11.43 3.5 9.85 3.5H6.81ZM6.81 2.5H9.85C11.98 2.5 13.51 4.03 13.51 6.16V8.06C13.51 10.19 11.98 11.72 9.85 11.72H6.81C4.68 11.72 3.15 10.19 3.15 8.06V6.16C3.15 4.03 4.68 2.5 6.81 2.5Z" fill="white"/>
                          <path d="M8.33 6.5C7.91 6.5 7.58 6.83 7.58 7.25C7.58 7.67 7.91 8 8.33 8C8.75 8 9.08 7.67 9.08 7.25C9.08 6.83 8.75 6.5 8.33 6.5ZM6.58 7.25C6.58 6.28 7.36 5.5 8.33 5.5C9.3 5.5 10.08 6.28 10.08 7.25C10.08 8.22 9.3 9 8.33 9C7.36 9 6.58 8.22 6.58 7.25Z" fill="white"/>
                        </svg>
                      )
                    case 'youtube':
                      return (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M12.6771 2.66667H3.32286C1.4879 2.66667 0 4.11227 0 5.89508V10.4383C0 12.2214 1.4879 13.6667 3.32286 13.6667H12.6771C14.5125 13.6667 16 12.2211 16 10.4383V5.89508C16 4.11193 14.5121 2.66667 12.6771 2.66667ZM10.4298 8.38771L6.05466 10.415C5.93805 10.4689 5.80338 10.3863 5.80338 10.2609V6.07953C5.80338 5.9524 5.94152 5.86979 6.05848 5.92745L10.4337 8.08152C10.5638 8.14559 10.5614 8.32667 10.4298 8.38771Z" fill="white"/>
                        </svg>
                      )
                    case 'linkedin':
                      return (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M4.25727 2.64267C4.25451 2.96418 4.15665 3.27767 3.97601 3.54366C3.79538 3.80964 3.54006 4.01621 3.24223 4.13734C2.9444 4.25847 2.61738 4.28873 2.30238 4.22431C1.98737 4.1599 1.69848 4.00369 1.47211 3.77537C1.24573 3.54705 1.092 3.25683 1.03029 2.94129C0.96857 2.62575 1.00163 2.299 1.1253 2.00221C1.24897 1.70543 1.45772 1.45189 1.72524 1.27354C1.99276 1.09519 2.30709 1.00001 2.62861 1C3.06228 1.00229 3.47732 1.17654 3.78266 1.48451C4.088 1.79247 4.25869 2.20899 4.25727 2.64267ZM4.01927 5.448H1.26661V14.3433H4.01927V5.448ZM8.41927 5.448H5.78061V14.3433H8.41927V9.67667C8.41927 8.424 8.99527 7.68133 10.0953 7.68133C11.1093 7.68133 11.5953 8.39533 11.5953 9.67667V14.3433H14.3333V8.71C14.3333 6.32867 12.9859 5.17667 11.0953 5.17667C10.5593 5.16962 10.0306 5.30149 9.5607 5.55945C9.09081 5.81742 8.69573 6.19267 8.41394 6.64867V5.44867L8.41927 5.448Z" fill="white"/>
                        </svg>
                      )
                    case 'pinterest':
                      return (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.38 14.99 5.3 14.03 5.46 13.38L6.07 10.65C6.07 10.65 5.9 10.31 5.9 9.78C5.9 8.95 6.39 8.33 7 8.33C7.5 8.33 7.74 8.7 7.74 9.15C7.74 9.65 7.44 10.38 7.28 11.06C7.15 11.63 7.57 12.1 8.13 12.1C9.16 12.1 9.94 11.08 9.94 9.59C9.94 8.27 9.05 7.4 8.02 7.4C6.78 7.4 6.05 8.32 6.05 9.29C6.05 9.72 6.22 10.19 6.44 10.45C6.48 10.5 6.49 10.55 6.47 10.61L6.34 11.12C6.32 11.22 6.26 11.25 6.16 11.2C5.47 10.87 5.05 9.89 5.05 9.26C5.05 7.75 6.13 6.37 8.15 6.37C9.76 6.37 11.01 7.5 11.01 9.56C11.01 11.71 9.92 13.48 8.31 13.48C7.73 13.48 7.18 13.18 6.99 12.82L6.65 14.2C6.5 14.81 6.09 15.56 5.82 16C6.52 16.18 7.25 16.27 8 16.27C12.42 16.27 16 12.69 16 8.27C16 3.85 12.42 0.27 8 0.27" fill="white"/>
                        </svg>
                      )
                    default:
                      return <span style={{ fontSize: '12px', color: 'white' }}>{preview.platform?.name?.[0] || '?'}</span>
                  }
                })()}
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