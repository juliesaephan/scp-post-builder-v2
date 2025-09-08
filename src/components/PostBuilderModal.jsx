import { useState, useRef, useEffect } from 'react'
import ChannelBadge from './ChannelBadge'
import ChannelMenu from './ChannelMenu'
import PreviewCarousel from './PreviewCarousel'
import CrossChannelEditor from './CrossChannelEditor'
import IndividualChannelEditor from './IndividualChannelEditor'
import MediaManager from './MediaManager'
import CaptionCounterGroup from './CaptionCounterGroup'
import ChannelOptionsAccordion from './ChannelOptionsAccordion'
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
  const [customizedChannels, setCustomizedChannels] = useState({}) // Track which channels have been customized
  
  // Caption relationship state
  const [channelCaptions, setChannelCaptions] = useState({}) // Individual channel captions
  const [captionsLinked, setCaptionsLinked] = useState(true) // Whether captions are connected to main
  
  const [crossChannelMode, setCrossChannelMode] = useState(false)
  const [individualChannelMode, setIndividualChannelMode] = useState(false) // Individual channel editing mode
  const [editingChannelId, setEditingChannelId] = useState(null) // Which channel is being edited individually
  const [activeTab, setActiveTab] = useState('media') // 'media', 'caption', 'date'
  const [tempChanges, setTempChanges] = useState({}) // Store temporary changes before update
  
  // Channel options accordion state
  const [expandedAccordions, setExpandedAccordions] = useState({}) // Track which accordions are expanded
  const [channelOptions, setChannelOptions] = useState({}) // Store channel option values
  
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
    // Clean up accordion state for removed channel
    setExpandedAccordions(prev => {
      const updated = { ...prev }
      delete updated[channelId]
      return updated
    })
    setChannelOptions(prev => {
      const updated = { ...prev }
      delete updated[channelId]
      return updated
    })
  }

  // Channel options accordion handlers
  const handleAccordionToggle = (channelId) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [channelId]: !prev[channelId]
    }))
  }

  const handleChannelOptionChange = (channelId, optionId, value) => {
    setChannelOptions(prev => ({
      ...prev,
      [channelId]: {
        ...prev[channelId],
        [optionId]: value
      }
    }))
  }

  const handleChannelEdit = (channelId) => {
    setEditingChannelId(channelId)
    setIndividualChannelMode(true)
    setActiveTab('media') // Start with media tab
    
    // Preserve existing temp changes and only add missing individual channel data
    const channelMedia = selectedMediaByChannel[channelId] || []
    const isChannelCustomized = customizedChannels[channelId]
    
    setTempChanges(prev => ({
      // Keep existing temp changes if any
      caption: prev.caption !== undefined ? prev.caption : caption,
      media: prev.media !== undefined ? prev.media : media,
      selectedMediaByChannel: prev.selectedMediaByChannel !== undefined ? prev.selectedMediaByChannel : selectedMediaByChannel,
      customizedChannels: prev.customizedChannels !== undefined ? prev.customizedChannels : customizedChannels,
      channelCaptions: prev.channelCaptions !== undefined ? prev.channelCaptions : channelCaptions,
      captionsLinked: prev.captionsLinked !== undefined ? prev.captionsLinked : captionsLinked,
      // Individual channel specific data
      editingChannelId: channelId,
      channelCaption: prev.channelCaptions?.[channelId] || channelCaptions[channelId] || caption,
      channelMedia: isChannelCustomized ? channelMedia : [...(prev.media || media)], // Show inherited or customized media
      channelScheduling: prev.channelScheduling || {},
      individualMode: true
    }))
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
    // Mark channel as customized
    setCustomizedChannels(prev => ({ ...prev, [channelId]: true }))
    
    // Add media to master library if not already present (BIDIRECTIONAL SYNC)
    const existingIds = new Set(media.map(item => item.id))
    const newMasterMedia = [...media]
    
    mediaItems.forEach(item => {
      if (!existingIds.has(item.id) && newMasterMedia.length < 20) {
        newMasterMedia.push(item)
        existingIds.add(item.id)
      }
    })
    
    // Update master media (syncs to main view)
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
    // Mark channel as customized
    setCustomizedChannels(prev => ({ ...prev, [channelId]: true }))
    
    // Remove from channel selection
    const updatedSelections = {
      ...selectedMediaByChannel,
      [channelId]: (selectedMediaByChannel[channelId] || []).filter(item => item.id !== mediaId)
    }
    setSelectedMediaByChannel(updatedSelections)
    
    // SMART CLEANUP: Check if media exists in any other channel
    const mediaExistsElsewhere = Object.entries(updatedSelections).some(([otherChannelId, otherChannelMedia]) => {
      if (otherChannelId === channelId) return false // Skip the channel we just removed from
      return otherChannelMedia.some(item => item.id === mediaId)
    })
    
    // Also check if non-customized channels would inherit this media from master
    const nonCustomizedChannelsExist = selectedChannels.some(channel => 
      !customizedChannels[channel.id] && channel.id !== channelId
    )
    
    // If media doesn't exist in any customized channel AND there are no non-customized channels,
    // remove from master media as well
    if (!mediaExistsElsewhere && !nonCustomizedChannelsExist) {
      setMedia(prev => prev.filter(item => item.id !== mediaId))
    }
  }

  // Initialize channel media selections with master inheritance
  useEffect(() => {
    selectedChannels.forEach(channel => {
      if (!selectedMediaByChannel[channel.id]) {
        // New channels inherit master media UNLESS they are customized
        setSelectedMediaByChannel(prev => ({
          ...prev,
          [channel.id]: customizedChannels[channel.id] ? [] : [...media]
        }))
      }
    })
    
    // Clean up selections for removed channels
    const activeChannelIds = new Set(selectedChannels.map(ch => ch.id))
    const cleanedSelections = {}
    const cleanedCustomizations = {}
    
    Object.entries(selectedMediaByChannel).forEach(([channelId, channelMedia]) => {
      if (activeChannelIds.has(channelId)) {
        cleanedSelections[channelId] = channelMedia
      }
    })
    
    Object.entries(customizedChannels).forEach(([channelId, isCustomized]) => {
      if (activeChannelIds.has(channelId)) {
        cleanedCustomizations[channelId] = isCustomized
      }
    })
    
    if (Object.keys(cleanedSelections).length !== Object.keys(selectedMediaByChannel).length) {
      setSelectedMediaByChannel(cleanedSelections)
    }
    
    if (Object.keys(cleanedCustomizations).length !== Object.keys(customizedChannels).length) {
      setCustomizedChannels(cleanedCustomizations)
    }
  }, [selectedChannels, media, customizedChannels])

  // Initialize channel captions with main caption inheritance (ONLY for truly new channels)
  useEffect(() => {
    let needsUpdate = false
    const newChannelCaptions = { ...channelCaptions }
    
    selectedChannels.forEach(channel => {
      // ONLY initialize captions for truly NEW channels that don't exist yet
      // Don't overwrite existing disconnected captions
      if (!channelCaptions.hasOwnProperty(channel.id)) {
        newChannelCaptions[channel.id] = caption
        needsUpdate = true
      }
    })

    // Clean up captions for removed channels
    const activeChannelIds = new Set(selectedChannels.map(ch => ch.id))
    Object.keys(channelCaptions).forEach(channelId => {
      if (!activeChannelIds.has(channelId)) {
        delete newChannelCaptions[channelId]
        needsUpdate = true
      }
    })
    
    if (needsUpdate) {
      setChannelCaptions(newChannelCaptions)
    }
  }, [selectedChannels]) // Remove caption and captionsLinked dependencies that cause overwrites

  const handleCaptionChange = (e) => {
    const newCaption = e.target.value
    setCaption(newCaption)
    
    // Update connected channel captions
    if (captionsLinked) {
      const updatedChannelCaptions = {}
      selectedChannels.forEach(channel => {
        updatedChannelCaptions[channel.id] = newCaption
      })
      setChannelCaptions(updatedChannelCaptions)
    }
  }

  const handleCustomizeClick = () => {
    setCrossChannelMode(true)
    setActiveTab('media')
    
    // Preserve existing temp changes and only add missing cross-channel data
    setTempChanges(prev => {
      // Build complete channel captions preserving individual edits
      const completeChannelCaptions = {}
      
      selectedChannels.forEach(channel => {
        // Priority order: 1) Individual edits from temp changes, 2) Current channel state, 3) Main caption
        completeChannelCaptions[channel.id] = 
          prev.channelCaptions?.[channel.id] ||  // Preserve individual edits first
          channelCaptions[channel.id] ||         // Then current channel state
          caption                                // Finally main caption as fallback
      })
      
      return {
        // Keep existing temp changes if any
        caption: prev.caption !== undefined ? prev.caption : caption,
        media: prev.media !== undefined ? prev.media : media,
        selectedMediaByChannel: prev.selectedMediaByChannel !== undefined ? prev.selectedMediaByChannel : selectedMediaByChannel,
        customizedChannels: prev.customizedChannels !== undefined ? prev.customizedChannels : customizedChannels,
        channelCaptions: completeChannelCaptions, // Always use complete set that preserves individual edits
        captionsLinked: prev.captionsLinked !== undefined ? prev.captionsLinked : captionsLinked,
        // Cross-channel specific data
        channels: selectedChannels,
      }
    })
  }

  const handleCancelCrossChannel = () => {
    setCrossChannelMode(false)
    setTempChanges({})
  }

  const handleCancelIndividualChannel = () => {
    setIndividualChannelMode(false)
    setEditingChannelId(null)
    setTempChanges({})
  }

  const handleUpdateCrossChannel = () => {
    // Apply temp changes to actual state
    if (tempChanges.media !== undefined) setMedia(tempChanges.media)
    if (tempChanges.selectedMediaByChannel !== undefined) setSelectedMediaByChannel(tempChanges.selectedMediaByChannel)
    if (tempChanges.customizedChannels !== undefined) setCustomizedChannels(tempChanges.customizedChannels)
    if (tempChanges.channels !== undefined) setSelectedChannels(tempChanges.channels)
    
    // Handle captions - Apply channel captions and linking status (DO NOT update main caption)
    if (tempChanges.channelCaptions !== undefined) {
      setChannelCaptions(tempChanges.channelCaptions)
    }
    if (tempChanges.captionsLinked !== undefined) {
      setCaptionsLinked(tempChanges.captionsLinked)
      
      // If captions are being re-linked, update main caption from "Apply to All"
      if (tempChanges.captionsLinked && tempChanges.channelCaptions) {
        const firstChannelId = Object.keys(tempChanges.channelCaptions)[0]
        if (firstChannelId) {
          setCaption(tempChanges.channelCaptions[firstChannelId] || '')
        }
      }
    }
    
    setCrossChannelMode(false)
    setTempChanges({})
  }

  const handleUpdateIndividualChannel = () => {
    // Apply temp changes to actual state for individual channel
    if (tempChanges.media !== undefined) setMedia(tempChanges.media)
    if (tempChanges.selectedMediaByChannel !== undefined) setSelectedMediaByChannel(tempChanges.selectedMediaByChannel)
    if (tempChanges.customizedChannels !== undefined) setCustomizedChannels(tempChanges.customizedChannels)
    
    // Apply individual channel captions (DO NOT update main caption)
    if (tempChanges.channelCaptions !== undefined) {
      setChannelCaptions(tempChanges.channelCaptions)
    }
    
    // Mark captions as disconnected if individual channel was edited
    if (tempChanges.channelCaptions !== undefined) {
      setCaptionsLinked(false)
    }
    
    setIndividualChannelMode(false)
    setEditingChannelId(null)
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
              // Cross-Channel Editing Mode
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
            ) : individualChannelMode ? (
              // Individual Channel Editing Mode
              <IndividualChannelEditor
                editingChannelId={editingChannelId}
                tempChanges={tempChanges}
                setTempChanges={setTempChanges}
                onCancel={handleCancelIndividualChannel}
                onUpdate={handleUpdateIndividualChannel}
              />
            ) : (
              // Normal Post Creation Mode
              <>
                <div style={{ 
                  flex: 1, 
                  overflow: 'auto',
                  padding: '20px',
                  paddingBottom: '10px'
                }}>
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
                      
                      {/* Caption Character Counters */}
                      <CaptionCounterGroup 
                        selectedChannels={selectedChannels}
                        caption={caption}
                        channelCaptions={channelCaptions}
                        captionsLinked={captionsLinked}
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

                  {/* Channel Options Accordions - Show in order channels were selected */}
                  {selectedChannels.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      {selectedChannels
                        .filter(channel => {
                          const platform = getPlatformById(channel.id)
                          return platform?.options && platform.options.length > 0
                        })
                        .map(channel => {
                          const platform = getPlatformById(channel.id)
                          return (
                            <ChannelOptionsAccordion
                              key={channel.id}
                              platform={platform}
                              isExpanded={expandedAccordions[channel.id] || false}
                              onToggle={() => handleAccordionToggle(channel.id)}
                              optionValues={channelOptions[channel.id] || {}}
                              onOptionChange={(optionId, value) => 
                                handleChannelOptionChange(channel.id, optionId, value)
                              }
                              disabled={true}
                            />
                          )
                        })}
                    </div>
                  )}
                </div>

                {/* Sticky Footer - Only show in normal mode */}
                {!individualChannelMode && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderTop: '1px solid #e1e5e9',
                    backgroundColor: 'white',
                    flexShrink: 0
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
                )}
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
                individualChannelMode={individualChannelMode}
                editingChannelId={editingChannelId}
                tempChanges={tempChanges}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default PostBuilderModal