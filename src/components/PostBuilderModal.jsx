import { useState, useRef, useEffect } from 'react'
import ChannelBadge from './ChannelBadge'
import ChannelMenu from './ChannelMenu'
import PreviewCarousel from './PreviewCarousel'
import CrossChannelEditor from './CrossChannelEditor'
import MediaManager from './MediaManager'
import { getRandomMediaItems } from '../data/mockMedia'

const PostBuilderModal = ({ onClose }) => {
  const [showPreview, setShowPreview] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [selectedChannels, setSelectedChannels] = useState([])
  const [showChannelMenu, setShowChannelMenu] = useState(false)
  const [caption, setCaption] = useState('')
  const [media, setMedia] = useState([]) // Master media library
  const [selectedMediaByChannel, setSelectedMediaByChannel] = useState({}) // Channel-specific media selections
  const [crossChannelMode, setCrossChannelMode] = useState(false)
  const [activeTab, setActiveTab] = useState('media') // 'media', 'caption', 'date'
  const [tempChanges, setTempChanges] = useState({}) // Store temporary changes before update
  const modalRef = useRef(null)
  const addButtonRef = useRef(null)
  
  const modalWidth = showPreview ? 1120 : 720
  const modalHeight = 550
  
  // Center the modal on initial load
  const [position, setPosition] = useState(() => ({
    x: (window.innerWidth - modalWidth) / 2,
    y: (window.innerHeight - modalHeight) / 2
  }))

  // Update position when preview toggle changes modal width
  useEffect(() => {
    setPosition(prev => ({
      ...prev,
      x: (window.innerWidth - modalWidth) / 2
    }))
  }, [modalWidth])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleMouseDown = (e) => {
    if (e.target.closest('.drag-handle')) {
      setIsDragging(true)
      const rect = modalRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Properly manage drag event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset])

  // Channel management functions
  const handleChannelToggle = (channelId, postType) => {
    setSelectedChannels(prev => {
      const existingIndex = prev.findIndex(channel => channel.id === channelId)
      
      if (existingIndex >= 0) {
        // Remove channel
        return prev.filter((_, index) => index !== existingIndex)
      } else {
        // Add channel
        return [...prev, { id: channelId, postType }]
      }
    })
  }

  const handlePostTypeSelect = (channelId, postType) => {
    setSelectedChannels(prev => {
      const existingIndex = prev.findIndex(channel => channel.id === channelId)
      
      if (existingIndex >= 0) {
        // Update existing channel
        const updated = [...prev]
        updated[existingIndex] = { id: channelId, postType }
        return updated
      } else {
        // Add new channel with post type
        return [...prev, { id: channelId, postType }]
      }
    })
  }

  const handleChannelRemove = (channelId) => {
    setSelectedChannels(prev => prev.filter(channel => channel.id !== channelId))
  }

  const handleChannelEdit = (channelId) => {
    // TODO: Implement individual channel editing
    console.log('Edit channel:', channelId)
  }

  // Smart media management functions
  const handleMasterMediaChange = (newMediaArray) => {
    setMedia(newMediaArray)
    
    // Update all channel selections to remove deleted media
    const newMediaIds = new Set(newMediaArray.map(item => item.id))
    const updatedChannelSelections = {}
    
    Object.entries(selectedMediaByChannel).forEach(([channelId, channelMedia]) => {
      updatedChannelSelections[channelId] = channelMedia.filter(item => newMediaIds.has(item.id))
    })
    
    setSelectedMediaByChannel(updatedChannelSelections)
  }

  const handleChannelMediaAdd = (channelId, mediaItems) => {
    // Add media to master library if not already present
    const existingIds = new Set(media.map(item => item.id))
    const newMasterMedia = [...media]
    
    mediaItems.forEach(item => {
      if (!existingIds.has(item.id) && newMasterMedia.length < 20) {
        newMasterMedia.push(item)
        existingIds.add(item.id)
      }
    })
    
    // Update master media
    setMedia(newMasterMedia)
    
    // Add to channel selection
    setSelectedMediaByChannel(prev => ({
      ...prev,
      [channelId]: [...(prev[channelId] || []), ...mediaItems.filter(item => 
        !(prev[channelId] || []).some(existing => existing.id === item.id)
      )]
    }))
  }

  const handleChannelMediaRemove = (channelId, mediaId) => {
    // Remove from channel selection
    setSelectedMediaByChannel(prev => ({
      ...prev,
      [channelId]: (prev[channelId] || []).filter(item => item.id !== mediaId)
    }))
    
    // Check if this media is used by any other channel
    const isUsedElsewhere = Object.entries(selectedMediaByChannel).some(([otherChannelId, channelMedia]) => {
      if (otherChannelId === channelId) return false
      return channelMedia.some(item => item.id === mediaId)
    })
    
    // If not used anywhere else, remove from master media
    if (!isUsedElsewhere) {
      setMedia(prev => prev.filter(item => item.id !== mediaId))
    }
  }

  // Initialize channel media selections when channels are added
  useEffect(() => {
    selectedChannels.forEach(channel => {
      if (!selectedMediaByChannel[channel.id]) {
        setSelectedMediaByChannel(prev => ({
          ...prev,
          [channel.id]: [...media] // Start with all master media selected
        }))
      }
    })
    
    // Clean up selections for removed channels
    const activeChannelIds = new Set(selectedChannels.map(ch => ch.id))
    const cleanedSelections = {}
    Object.entries(selectedMediaByChannel).forEach(([channelId, channelMedia]) => {
      if (activeChannelIds.has(channelId)) {
        cleanedSelections[channelId] = channelMedia
      }
    })
    
    if (Object.keys(cleanedSelections).length !== Object.keys(selectedMediaByChannel).length) {
      setSelectedMediaByChannel(cleanedSelections)
    }
  }, [selectedChannels, media])

  const handleCaptionChange = (e) => {
    setCaption(e.target.value)
  }

  const handleCustomizeClick = () => {
    setCrossChannelMode(true)
    setActiveTab('media')
    
    // Initialize individual channel captions with current shared caption
    const channelCaptions = {}
    selectedChannels.forEach(channel => {
      channelCaptions[channel.id] = caption
    })
    
    // Initialize temp changes with current state
    setTempChanges({
      caption: caption,
      media: media,
      selectedMediaByChannel: selectedMediaByChannel,
      channels: selectedChannels,
      channelCaptions: channelCaptions,
      captionsLinked: true // Start with captions linked
    })
  }

  const handleCancelCrossChannel = () => {
    setCrossChannelMode(false)
    setTempChanges({})
  }

  const handleUpdateCrossChannel = () => {
    // Apply temp changes to actual state
    if (tempChanges.media !== undefined) setMedia(tempChanges.media)
    if (tempChanges.selectedMediaByChannel !== undefined) setSelectedMediaByChannel(tempChanges.selectedMediaByChannel)
    if (tempChanges.channels !== undefined) setSelectedChannels(tempChanges.channels)
    
    // Handle captions - if they're linked, use any channel's caption as the master
    // If they're separate, we keep the individual captions (for now using first channel's caption as master)
    if (tempChanges.channelCaptions && Object.keys(tempChanges.channelCaptions).length > 0) {
      if (tempChanges.captionsLinked) {
        // Use any channel's caption since they're all the same
        const firstChannelId = Object.keys(tempChanges.channelCaptions)[0]
        setCaption(tempChanges.channelCaptions[firstChannelId] || '')
      } else {
        // For now, use the first channel's caption as the main caption
        // In a full implementation, you might want to store individual captions separately
        const firstChannelId = Object.keys(tempChanges.channelCaptions)[0]
        setCaption(tempChanges.channelCaptions[firstChannelId] || '')
      }
    } else if (tempChanges.caption !== undefined) {
      setCaption(tempChanges.caption)
    }
    
    setCrossChannelMode(false)
    setTempChanges({})
  }

  return (
    <>
      {/* Overlay */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose()
          }
        }}
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          width: modalWidth,
          height: modalHeight,
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid #e1e5e9',
          backgroundColor: '#f8f9fa'
        }}>
          {/* Drag Handle */}
          <div className="drag-handle" style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridTemplateRows: 'repeat(3, 1fr)',
            gap: '2px',
            width: '12px',
            height: '12px',
            marginRight: '12px'
          }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                width: '4px',
                height: '4px',
                backgroundColor: '#6c757d',
                borderRadius: '50%'
              }} />
            ))}
          </div>

          {/* Title */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: 1
          }}>
            <span style={{ fontWeight: '600', fontSize: '16px' }}>New Post</span>
            <button style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px'
            }}>
              ✏️
            </button>
          </div>

          {/* Right Side Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <button 
              onClick={() => setShowPreview(!showPreview)}
              style={{
                padding: '8px 12px',
                backgroundColor: showPreview ? '#e9ecef' : '#007bff',
                color: showPreview ? '#495057' : 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {showPreview ? 'Hide Post Preview' : 'Show Post Preview'}
            </button>
            
            <button 
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px 8px',
                borderRadius: '4px'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden'
        }}>
          {/* Left Panel */}
          <div style={{
            width: showPreview ? '60%' : '100%',
            borderRight: showPreview ? '1px solid #e1e5e9' : 'none',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}>
            {crossChannelMode ? (
              /* Cross-Channel Editing Mode */
              <CrossChannelEditor
                selectedChannels={selectedChannels}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tempChanges={tempChanges}
                setTempChanges={setTempChanges}
                onCancel={handleCancelCrossChannel}
                onUpdate={handleUpdateCrossChannel}
                onChannelMediaAdd={handleChannelMediaAdd}
                onChannelMediaRemove={handleChannelMediaRemove}
              />
            ) : (
              /* Normal Post Creation Mode */
              <>
                <div style={{ padding: '20px', flex: 1 }}>
                  {/* Media Uploader + Caption Editor */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    {/* Media Manager */}
                    <MediaManager
                      media={media}
                      onMediaChange={handleMasterMediaChange}
                      maxMedia={20}
                    />

                    {/* Caption Editor */}
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <textarea 
                        placeholder="Write your caption..."
                        value={caption}
                        onChange={handleCaptionChange}
                        style={{
                          flex: 1,
                          padding: '12px',
                          border: '1px solid #dee2e6',
                          borderRadius: '8px',
                          resize: 'none',
                          fontFamily: 'inherit',
                          fontSize: '14px',
                          minHeight: '120px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Social Channel Selector */}
                  <div style={{
                    marginBottom: '20px',
                    position: 'relative'
                  }}>
                    {selectedChannels.length === 0 ? (
                      // Empty State
                      <div style={{
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{
                          color: '#6c757d',
                          fontSize: '14px'
                        }}>
                          Click the "+" to add your channels.
                        </span>
                        
                        <button 
                          ref={addButtonRef}
                          onClick={() => setShowChannelMenu(!showChannelMenu)}
                          style={{
                            height: '40px',
                            width: '40px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      // Selected Channels State
                      <div style={{
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        padding: '12px'
                      }}>
                        {/* Channel Badges */}
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          marginBottom: '12px'
                        }}>
                          {selectedChannels.map(channel => (
                            <ChannelBadge
                              key={channel.id}
                              channelId={channel.id}
                              postType={channel.postType}
                              onEdit={handleChannelEdit}
                              onRemove={handleChannelRemove}
                            />
                          ))}
                        </div>
                        
                        {/* Controls */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0',
                          justifyContent: 'flex-end'
                        }}>
                          <button 
                            onClick={handleCustomizeClick}
                            style={{
                              height: '36px',
                              padding: '8px 16px',
                              backgroundColor: '#f8f9fa',
                              color: '#495057',
                              border: '1px solid #dee2e6',
                              borderRadius: '6px 0 0 6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              borderRight: 'none'
                            }}
                          >
                            Customize
                          </button>
                          
                          <button 
                            ref={addButtonRef}
                            onClick={() => setShowChannelMenu(!showChannelMenu)}
                            style={{
                              height: '36px',
                              width: '36px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0 6px 6px 0',
                              cursor: 'pointer',
                              fontSize: '18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Channel Selection Menu */}
                    {showChannelMenu && (
                      <ChannelMenu
                        selectedChannels={selectedChannels}
                        onChannelToggle={handleChannelToggle}
                        onPostTypeSelect={handlePostTypeSelect}
                        onClose={() => setShowChannelMenu(false)}
                        buttonRef={addButtonRef}
                      />
                    )}
                  </div>
                </div>

                {/* Sticky Footer - Only show in normal mode */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderTop: '1px solid #e1e5e9'
                }}>
                  <button style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                    color: '#dc3545'
                  }}>
                    🗑️
                  </button>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <button style={{
                      padding: '8px 12px',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #dee2e6',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}>
                      📅 Select Date
                    </button>

                    <button style={{
                      padding: '10px 20px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}>
                      Save Post
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Panel - Preview Carousel */}
          {showPreview && (
            <div style={{
              width: '40%',
              backgroundColor: '#f8f9fa'
            }}>
              <PreviewCarousel
                selectedChannels={selectedChannels}
                caption={caption}
                media={media}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default PostBuilderModal