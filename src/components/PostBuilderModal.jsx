import { useState, useRef, useEffect } from 'react'
import ChannelBadge from './ChannelBadge'
import ChannelMenu from './ChannelMenu'
import PreviewCarousel from './PreviewCarousel'
import MediaManager from './MediaManager'
import CaptionCounterGroup from './CaptionCounterGroup'
import ChannelOptionsAccordion from './ChannelOptionsAccordion'
import SavePostMenu from './SavePostMenu'
import ConfirmationDialog from './ConfirmationDialog'
import { getPlatformById } from '../data/platforms'

const PostBuilderModal = ({ onClose, onPostSaved }) => {
  const [showPreview, setShowPreview] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [selectedChannels, setSelectedChannels] = useState([])
  const [showChannelMenu, setShowChannelMenu] = useState(false)
  const [showSavePostMenu, setShowSavePostMenu] = useState(false)
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)
  const [caption, setCaption] = useState('')
  const [media, setMedia] = useState([]) // Master media library
  const [selectedMediaByChannel, setSelectedMediaByChannel] = useState({}) // Channel-specific media selections
  const [customizedChannels, setCustomizedChannels] = useState({}) // Track which channels have been customized

  // Caption relationship state
  const [channelCaptions, setChannelCaptions] = useState({}) // Individual channel captions
  const [hasEditedCaptions, setHasEditedCaptions] = useState(false) // Track if user has edited any channel captions after selection
  const [initialCaption, setInitialCaption] = useState('') // Store the initial caption for template adoption
  
  
  // Channel separation state
  const [channelsSeparated, setChannelsSeparated] = useState(false) // Global state for channel separation

  // Individual channel Apply to All button state
  const [activeChannelId, setActiveChannelId] = useState(null) // Which channel is being typed in
  const [hoveredChannelId, setHoveredChannelId] = useState(null) // Which channel is being hovered
  const [appliedChannelId, setAppliedChannelId] = useState(null) // Which channel just applied (for feedback)

  // Channel options accordion state
  const [expandedAccordions, setExpandedAccordions] = useState({}) // Track which accordions are expanded
  const [channelOptions, setChannelOptions] = useState({}) // Store channel option values
  
  // Channel scheduling state
  const [channelScheduling, setChannelScheduling] = useState({}) // Store per-channel scheduling: { channelId: { date, time, type } }
  
  // Save state
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  // Date scheduling interface
  const [showDateScheduling, setShowDateScheduling] = useState(false)
  
  const modalRef = useRef(null)
  const addButtonRef = useRef(null)
  const saveButtonRef = useRef(null)
  
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
        // Remove channel - clean up its caption
        const updatedChannels = prev.filter((_, index) => index !== existingIndex)

        setChannelCaptions(prevCaptions => {
          const updated = { ...prevCaptions }
          delete updated[channelId]
          return updated
        })

        // If removing the last channel, reset caption adoption state
        if (updatedChannels.length === 0) {
          setHasEditedCaptions(false)
          setInitialCaption('')
        }

        return updatedChannels
      } else {
        // Add channel - handle caption adoption logic
        const isFirstChannel = prev.length === 0
        const templateCaption = isFirstChannel ? caption.trim() : initialCaption

        if (isFirstChannel && caption.trim()) {
          // First channel with pre-written caption - always update template and adopt
          setInitialCaption(caption.trim())
          setChannelCaptions(prevCaptions => ({
            ...prevCaptions,
            [channelId]: caption.trim()
          }))
        } else if (!isFirstChannel && templateCaption && !hasEditedCaptions) {
          // Additional channels before any editing - adopt template
          setChannelCaptions(prevCaptions => ({
            ...prevCaptions,
            [channelId]: templateCaption
          }))
        } else {
          // New channel after editing or no template - start blank
          setChannelCaptions(prevCaptions => ({
            ...prevCaptions,
            [channelId]: ''
          }))
        }

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

  // Date scheduling helpers and handlers
  const formatDateForDisplay = (date, time) => {
    if (!date || !time) return null
    const dateObj = new Date(`${date}T${time}`)
    return dateObj.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getScheduledChannels = () => {
    return selectedChannels
      .map(channel => ({
        ...channel,
        scheduling: channelScheduling[channel.id]
      }))
      .filter(channel => channel.scheduling?.date) // Only require date, time defaults to 11:30
  }

  const getSchedulingButtonText = () => {
    const scheduledChannels = getScheduledChannels()

    if (scheduledChannels.length === 0) {
      return 'Select Date'
    }

    // Check if all scheduled channels have the same date and time
    const firstScheduling = scheduledChannels[0].scheduling
    const allSame = scheduledChannels.every(channel => 
      channel.scheduling.date === firstScheduling.date && 
      (channel.scheduling.time || '11:30') === (firstScheduling.time || '11:30')
    )

    if (allSame) {
      return formatDateForDisplay(firstScheduling.date, firstScheduling.time || '11:30')
    } else {
      // Find earliest date/time
      const earliest = scheduledChannels.reduce((earliest, channel) => {
        const channelTime = channel.scheduling.time || '11:30'
        const earliestTime = earliest.time || '11:30'
        const channelDateTime = new Date(`${channel.scheduling.date}T${channelTime}`)
        const earliestDateTime = new Date(`${earliest.date}T${earliestTime}`)
        return channelDateTime < earliestDateTime ? channel.scheduling : earliest
      }, scheduledChannels[0].scheduling)

      return `Earliest at ${formatDateForDisplay(earliest.date, earliest.time || '11:30')}`
    }
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


  // Initialize channel media selections with master inheritance
  useEffect(() => {
    selectedChannels.forEach(channel => {
      if (!selectedMediaByChannel[channel.id]) {
        // New channels inherit master media UNLESS they are customized OR channels are separated
        setSelectedMediaByChannel(prev => ({
          ...prev,
          [channel.id]: (customizedChannels[channel.id] || channelsSeparated) ? [] : [...media]
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
  }, [selectedChannels, media, customizedChannels, channelsSeparated])


  const handleCaptionChange = (e) => {
    const newCaption = e.target.value
    setCaption(newCaption)
    // Channel captions are now always independent - no auto-sync
  }

  const handleChannelCaptionChange = (channelId, newCaption) => {
    setChannelCaptions(prev => ({
      ...prev,
      [channelId]: newCaption
    }))
    // Mark that captions have been edited after channel selection
    if (selectedChannels.length > 0) {
      setHasEditedCaptions(true)
    }
  }

  const handleCustomizeClick = () => {
    setChannelsSeparated(!channelsSeparated)
  }

  const handleApplyToAll = (sourceChannelId) => {
    // Get the caption from the source channel
    const sourceCaption = channelCaptions[sourceChannelId] || ''

    // Apply it to all channels
    const updatedChannelCaptions = {}
    selectedChannels.forEach(channel => {
      updatedChannelCaptions[channel.id] = sourceCaption
    })
    setChannelCaptions(updatedChannelCaptions)

    // Mark captions as edited to stop template adoption for future channels
    setHasEditedCaptions(true)

    // Show feedback for this specific channel
    setAppliedChannelId(sourceChannelId)

    // Reset feedback after 2 seconds
    setTimeout(() => {
      setAppliedChannelId(null)
    }, 2000)
  }

  const handleChannelSchedulingChange = (channelId, field, value) => {
    setChannelScheduling(prev => ({
      ...prev,
      [channelId]: {
        ...prev[channelId],
        [field]: value
      }
    }))
  }


  const hasUnsavedChanges = () => {
    return caption.trim() || media.length > 0
  }

  const validatePost = () => {
    if (selectedChannels.length === 0) {
      return 'Please select at least one channel before saving.'
    }
    
    if (!caption.trim() && !media.length) {
      return 'Please add either a caption or media before saving.'
    }
    
    return null
  }

  const collectPostData = (status) => {
    return {
      id: Date.now().toString(), // Generate unique ID
      caption,
      media: media.map(item => ({
        id: item.id,
        url: item.url,
        type: item.type,
        name: item.name
      })),
      channels: selectedChannels.map(channel => ({
        id: channel.id,
        postType: channel.postType,
        caption: channelCaptions[channel.id] || caption,
        media: selectedMediaByChannel[channel.id] || media,
        options: channelOptions[channel.id] || {},
        scheduling: channelScheduling[channel.id] || {}
      })),
      createdAt: new Date().toISOString(),
      status
    }
  }

  const handleSaveAsDraft = async () => {
    const validationError = validatePost()
    if (validationError) {
      setSaveError(validationError)
      return
    }
    
    setIsSaving(true)
    setShowSavePostMenu(false)
    
    try {
      const postData = collectPostData('draft')
      console.log('Saving as draft:', postData)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Close modal and show success toast
      onClose()
      onPostSaved?.('draft')
      
    } catch (error) {
      setSaveError('Failed to save draft. Please try again.')
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSchedule = async () => {
    const validationError = validatePost()
    if (validationError) {
      setSaveError(validationError)
      return
    }

    // Check if any channels have scheduling dates
    const scheduledChannels = selectedChannels.filter(channel => 
      channelScheduling[channel.id]?.date
    )

    if (scheduledChannels.length === 0) {
      setSaveError('Please select a date for at least one channel before scheduling.')
      return
    }
    
    setIsSaving(true)
    setShowSavePostMenu(false)
    
    try {
      const postData = collectPostData('scheduled')
      console.log('Scheduling post:', postData)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Close modal and show success toast
      onClose()
      onPostSaved?.('scheduled')
      
    } catch (error) {
      setSaveError('Failed to schedule post. Please try again.')
      console.error('Schedule error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePostNow = async () => {
    const validationError = validatePost()
    if (validationError) {
      setSaveError(validationError)
      return
    }
    
    setIsSaving(true)
    setShowSavePostMenu(false)
    
    try {
      const postData = collectPostData('published')
      console.log('Publishing post now:', postData)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Close modal and show success toast
      onClose()
      onPostSaved?.('published')
      
    } catch (error) {
      setSaveError('Failed to publish post. Please try again.')
      console.error('Publish error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCloseRequest = () => {
    if (hasUnsavedChanges()) {
      setShowConfirmationDialog(true)
    } else {
      onClose()
    }
  }

  const handleConfirmSaveAsDraft = async () => {
    setShowConfirmationDialog(false)
    await handleSaveAsDraft()
  }

  const handleConfirmDiscardChanges = () => {
    setShowConfirmationDialog(false)
    onClose()
  }

  const handleConfirmCancel = () => {
    setShowConfirmationDialog(false)
  }

  return (
    <>
      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
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
            handleCloseRequest()
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
              onClick={handleCloseRequest}
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
            {/* Post Creation Mode */}
                <div style={{ 
                  flex: 1, 
                  overflow: 'auto',
                  padding: '20px',
                  paddingBottom: '10px'
                }}>
                  {/* Post Content Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid #e1e5e9'
                  }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#495057'
                    }}>
                      Post Content
                    </h3>

                    {selectedChannels.length > 1 && (
                      <button
                        onClick={handleCustomizeClick}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          backgroundColor: channelsSeparated ? '#007bff' : '#f8f9fa',
                          color: channelsSeparated ? 'white' : '#495057',
                          border: '1px solid #dee2e6',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        {channelsSeparated ? 'Unified View' : 'Customize Channels'}
                      </button>
                    )}
                  </div>

                  {/* Conditional Rendering: Unified vs Customized View */}
                  {!channelsSeparated ? (
                    /* UNIFIED VIEW - Media Uploader + Caption Editor */
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

                      {/* Caption Editor - Rebuilt with Integrated Counters */}
                      <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        {/* Caption Container */}
                        <div
                          style={{
                            position: 'relative',
                            height: '280px', // Increased height for individual Apply to All buttons
                            border: '1px solid #dee2e6',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            backgroundColor: '#fff'
                          }}
                        >

                          {selectedChannels.length === 0 ? (
                            /* Single Caption Field - Before Channel Selection */
                            <div style={{ position: 'relative', height: '100%' }}>
                              <textarea
                                placeholder="Write your caption..."
                                value={caption}
                                onChange={handleCaptionChange}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  padding: '12px',
                                  paddingBottom: '40px', // Space for character counter
                                  border: 'none',
                                  resize: 'none',
                                  fontFamily: 'inherit',
                                  fontSize: '14px',
                                  outline: 'none',
                                  backgroundColor: 'transparent'
                                }}
                              />
                              {/* Single Caption Character Counter */}
                              <div style={{
                                position: 'absolute',
                                bottom: '8px',
                                right: '12px',
                                fontSize: '11px',
                                color: caption.length > 280 ? '#dc3545' : '#6c757d',
                                fontWeight: '500'
                              }}>
                                {caption.length}/280
                              </div>
                            </div>
                          ) : (
                            /* Individual Channel Caption Fields - After Channel Selection */
                            <div style={{
                              height: '100%',
                              overflowY: 'auto',
                              padding: '12px'
                            }}>
                              {selectedChannels.map((channel, index) => {
                                const platform = getPlatformById(channel.id)
                                const isLastChannel = index === selectedChannels.length - 1
                                const channelCaption = channelCaptions[channel.id] || ''

                                return (
                                  <div
                                    key={channel.id}
                                    style={{
                                      marginBottom: isLastChannel ? '0' : '16px'
                                    }}
                                    onMouseEnter={() => setHoveredChannelId(channel.id)}
                                    onMouseLeave={() => setHoveredChannelId(null)}
                                  >
                                    {/* Channel Label */}
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      marginBottom: '6px',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                      color: '#495057'
                                    }}>
                                      <span style={{ fontSize: '14px' }}>{platform?.icon}</span>
                                      <span>{platform?.name}</span>
                                      {channel.postType && (
                                        <span style={{
                                          color: '#6c757d',
                                          fontWeight: '400'
                                        }}>
                                          • {channel.postType}
                                        </span>
                                      )}
                                    </div>

                                    {/* Channel Caption Field with Integrated Counter and Apply Button */}
                                    <div style={{ position: 'relative' }}>
                                      <textarea
                                        placeholder={`Write caption for ${platform?.name}...`}
                                        value={channelCaption}
                                        onChange={(e) => handleChannelCaptionChange(channel.id, e.target.value)}
                                        onFocus={() => setActiveChannelId(channel.id)}
                                        onBlur={() => {
                                          setTimeout(() => setActiveChannelId(null), 200)
                                        }}
                                        style={{
                                          width: '100%',
                                          height: '70px',
                                          padding: '8px',
                                          paddingTop: '28px', // Space for Apply to All button
                                          paddingBottom: '24px', // Space for character counter
                                          border: '1px solid #e1e5e9',
                                          borderRadius: '6px',
                                          resize: 'none',
                                          fontFamily: 'inherit',
                                          fontSize: '13px',
                                          outline: 'none',
                                          backgroundColor: '#fff'
                                        }}
                                      />

                                      {/* Individual Apply to All Button */}
                                      {selectedChannels.length > 1 &&
                                       (activeChannelId === channel.id || hoveredChannelId === channel.id) &&
                                       channelCaption.trim() && (
                                        <button
                                          onClick={() => handleApplyToAll(channel.id)}
                                          disabled={appliedChannelId === channel.id}
                                          style={{
                                            position: 'absolute',
                                            top: '6px',
                                            right: '6px',
                                            padding: '4px 8px',
                                            fontSize: '10px',
                                            backgroundColor: appliedChannelId === channel.id ? '#28a745' : '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: appliedChannelId === channel.id ? 'default' : 'pointer',
                                            zIndex: 10,
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                            transition: 'all 0.2s ease-in-out'
                                          }}
                                        >
                                          {appliedChannelId === channel.id ? '✓ Applied!' : 'Apply to All'}
                                        </button>
                                      )}

                                      {/* Individual Character Counter */}
                                      <div style={{
                                        position: 'absolute',
                                        bottom: '4px',
                                        right: '8px',
                                        fontSize: '10px',
                                        color: channelCaption.length > 280 ? '#dc3545' : '#6c757d',
                                        fontWeight: '500'
                                      }}>
                                        {channelCaption.length}/280
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>

                        {/* Only show CaptionCounterGroup in single caption mode */}
                        {selectedChannels.length === 0 && (
                          <CaptionCounterGroup
                            selectedChannels={selectedChannels}
                            caption={caption}
                            channelCaptions={channelCaptions}
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    /* CUSTOMIZED VIEW - Individual Channel Sections */
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px',
                      marginBottom: '20px'
                    }}>
                      {selectedChannels.map((channel) => {
                        const platform = getPlatformById(channel.id)
                        const channelCaption = channelCaptions[channel.id] || ''
                        const channelMedia = selectedMediaByChannel[channel.id] || []

                        return (
                          <div
                            key={channel.id}
                            style={{
                              border: '2px solid #e1e5e9',
                              borderRadius: '12px',
                              padding: '16px',
                              backgroundColor: '#fff'
                            }}
                          >
                            {/* Channel Header */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '16px',
                              paddingBottom: '12px',
                              borderBottom: '1px solid #e1e5e9'
                            }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                backgroundColor: platform?.color || '#ccc',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px'
                              }}>
                                {platform?.icon}
                              </div>
                              <div>
                                <div style={{ fontWeight: '600', fontSize: '16px', color: '#495057' }}>
                                  {platform?.name}
                                </div>
                                {channel.postType && (
                                  <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                    {channel.postType}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Media and Caption Section */}
                            <div style={{
                              display: 'flex',
                              gap: '16px'
                            }}>
                              {/* Channel Media Manager */}
                              <div style={{ flex: 1 }}>
                                <h4 style={{
                                  margin: '0 0 12px 0',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  color: '#495057'
                                }}>
                                  Media
                                </h4>
                                <div style={{
                                  border: '1px solid #dee2e6',
                                  borderRadius: '8px',
                                  padding: '12px',
                                  minHeight: '120px',
                                  backgroundColor: '#f8f9fa'
                                }}>
                                  <div style={{
                                    fontSize: '12px',
                                    color: '#6c757d',
                                    textAlign: 'center',
                                    padding: '20px'
                                  }}>
                                    {channelMedia.length} media items selected
                                    <br />
                                    <small>Individual media management coming soon</small>
                                  </div>
                                </div>
                              </div>

                              {/* Channel Caption */}
                              <div style={{ flex: 1 }}>
                                <h4 style={{
                                  margin: '0 0 12px 0',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  color: '#495057'
                                }}>
                                  Caption
                                </h4>
                                <div style={{ position: 'relative' }}>
                                  <textarea
                                    placeholder={`Write caption for ${platform?.name}...`}
                                    value={channelCaption}
                                    onChange={(e) => handleChannelCaptionChange(channel.id, e.target.value)}
                                    onFocus={() => setActiveChannelId(channel.id)}
                                    onBlur={() => {
                                      setTimeout(() => setActiveChannelId(null), 200)
                                    }}
                                    onMouseEnter={() => setHoveredChannelId(channel.id)}
                                    onMouseLeave={() => setHoveredChannelId(null)}
                                    style={{
                                      width: '100%',
                                      height: '120px',
                                      padding: '12px',
                                      paddingTop: '32px', // Space for Apply to All button
                                      paddingBottom: '24px', // Space for character counter
                                      border: '1px solid #dee2e6',
                                      borderRadius: '8px',
                                      resize: 'none',
                                      fontFamily: 'inherit',
                                      fontSize: '14px',
                                      outline: 'none',
                                      backgroundColor: '#fff'
                                    }}
                                  />

                                  {/* Individual Apply to All Button */}
                                  {selectedChannels.length > 1 &&
                                   (activeChannelId === channel.id || hoveredChannelId === channel.id) &&
                                   channelCaption.trim() && (
                                    <button
                                      onClick={() => handleApplyToAll(channel.id)}
                                      disabled={appliedChannelId === channel.id}
                                      style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        padding: '6px 10px',
                                        fontSize: '11px',
                                        backgroundColor: appliedChannelId === channel.id ? '#28a745' : '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: appliedChannelId === channel.id ? 'default' : 'pointer',
                                        zIndex: 10,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        transition: 'all 0.2s ease-in-out'
                                      }}
                                    >
                                      {appliedChannelId === channel.id ? '✓ Applied!' : 'Apply to All'}
                                    </button>
                                  )}

                                  {/* Individual Character Counter */}
                                  <div style={{
                                    position: 'absolute',
                                    bottom: '6px',
                                    right: '12px',
                                    fontSize: '11px',
                                    color: channelCaption.length > 280 ? '#dc3545' : '#6c757d',
                                    fontWeight: '500'
                                  }}>
                                    {channelCaption.length}/280
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

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
                              onRemove={handleChannelRemove}
                            />
                          ))}
                        </div>
                        
                        {/* Controls */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end'
                        }}>
                          <button
                            ref={addButtonRef}
                            onClick={() => setShowChannelMenu(!showChannelMenu)}
                            style={{
                              height: '36px',
                              width: '36px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
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

                {/* Error Messages - Only show errors, success will be toast */}
                {saveError && (
                  <div style={{
                    padding: '12px 20px',
                    backgroundColor: '#f8d7da',
                    borderTop: '1px solid #e1e5e9',
                    color: '#721c24',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    ❌ {saveError}
                  </div>
                )}

                {/* Sticky Footer */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderTop: '1px solid #e1e5e9',
                    backgroundColor: 'white',
                    flexShrink: 0
                  }}>
                  <button 
                    onClick={handleCloseRequest}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '18px',
                      color: '#dc3545'
                    }}
                  >
                    🗑️
                  </button>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <button
                      onClick={() => setShowDateScheduling(!showDateScheduling)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: showDateScheduling ? '#e9ecef' : '#f8f9fa',
                        border: '1px solid #dee2e6',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      📅 {getSchedulingButtonText()}
                    </button>

                    <button 
                      ref={saveButtonRef}
                      onClick={() => setShowSavePostMenu(!showSavePostMenu)}
                      disabled={isSaving}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: isSaving ? '#6c757d' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {isSaving && <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #ffffff',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />}
                      {isSaving ? 'Saving...' : 'Save Post'}
                      {!isSaving && (
                        <span style={{
                          fontSize: '12px',
                          transform: showSavePostMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }}>
                          ▼
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Save Post Menu */}
                  {showSavePostMenu && (
                    <SavePostMenu
                      onSaveAsDraft={handleSaveAsDraft}
                      onSchedule={handleSchedule}
                      onPostNow={handlePostNow}
                      onClose={() => setShowSavePostMenu(false)}
                      buttonRef={saveButtonRef}
                      schedulingButtonText={getSchedulingButtonText()}
                      hasScheduledChannels={getScheduledChannels().length > 0}
                      isLoading={isSaving}
                    />
                  )}

                  {/* Date Scheduling Interface */}
                  {showDateScheduling && (
                    <div style={{
                      position: 'absolute',
                      bottom: '70px',
                      right: '20px',
                      left: '20px',
                      backgroundColor: 'white',
                      border: '1px solid #dee2e6',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      zIndex: 1000,
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}>
                      <div style={{
                        padding: '16px',
                        borderBottom: '1px solid #e1e5e9',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#495057'
                      }}>
                        Schedule Posts by Channel
                      </div>

                      <div style={{ padding: '16px' }}>
                        {selectedChannels.length === 0 ? (
                          <div style={{
                            textAlign: 'center',
                            color: '#6c757d',
                            fontSize: '14px',
                            padding: '20px'
                          }}>
                            Select channels to schedule posts
                          </div>
                        ) : (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                          }}>
                            {selectedChannels.map((channel) => {
                              const platform = getPlatformById(channel.id)
                              const isConnected = platform?.account

                              return (
                                <div key={channel.id} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  padding: '12px',
                                  border: '1px solid #e1e5e9',
                                  borderRadius: '6px',
                                  backgroundColor: '#f8f9fa'
                                }}>
                                  {/* Platform Info */}
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    minWidth: '120px'
                                  }}>
                                    <div style={{
                                      width: '24px',
                                      height: '24px',
                                      borderRadius: '4px',
                                      backgroundColor: platform?.color || '#ccc',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      marginRight: '8px',
                                      fontSize: '12px'
                                    }}>
                                      {platform?.icon}
                                    </div>
                                    <div>
                                      <div style={{ fontWeight: '500', fontSize: '13px' }}>
                                        {platform?.name}
                                      </div>
                                      {channel.postType && (
                                        <div style={{ fontSize: '11px', color: '#6c757d' }}>
                                          {channel.postType}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Date/Time Controls */}
                                  <div style={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                  }}>
                                    <input
                                      type="date"
                                      value={channelScheduling[channel.id]?.date || ''}
                                      onChange={(e) => handleChannelSchedulingChange(channel.id, 'date', e.target.value)}
                                      style={{
                                        padding: '6px',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        flex: 1
                                      }}
                                    />

                                    <input
                                      type="time"
                                      value={channelScheduling[channel.id]?.time || '11:30'}
                                      onChange={(e) => handleChannelSchedulingChange(channel.id, 'time', e.target.value)}
                                      style={{
                                        padding: '6px',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        width: '80px'
                                      }}
                                    />

                                    <select
                                      value={channelScheduling[channel.id]?.type || 'auto'}
                                      onChange={(e) => handleChannelSchedulingChange(channel.id, 'type', e.target.value)}
                                      style={{
                                        padding: '6px',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        width: '100px'
                                      }}
                                    >
                                      {isConnected ? (
                                        <>
                                          <option value="auto">Auto-post</option>
                                          <option value="reminder">Reminder</option>
                                        </>
                                      ) : (
                                        <option value="reminder">Reminder only</option>
                                      )}
                                    </select>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
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

      {/* Confirmation Dialog */}
      {showConfirmationDialog && (
        <ConfirmationDialog
          onSaveAsDraft={handleConfirmSaveAsDraft}
          onDiscardChanges={handleConfirmDiscardChanges}
          onCancel={handleConfirmCancel}
          isLoading={isSaving}
        />
      )}
    </>
  )
}

export default PostBuilderModal