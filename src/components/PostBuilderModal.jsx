import { useState, useRef, useEffect } from 'react'
import ChannelBadge from './ChannelBadge'
import ChannelMenu from './ChannelMenu'
import PreviewCarousel from './PreviewCarousel'
import MediaManager from './MediaManager'
import CaptionCounterGroup from './CaptionCounterGroup'
import ChannelOptionsAccordion from './ChannelOptionsAccordion'
import SavePostMenu from './SavePostMenu'
import ConfirmationDialog from './ConfirmationDialog'
import DateTimeDisplay from './DateTimeDisplay'
import WarningModal from './WarningModal'
import TrashIcon from './icons/TrashIcon'
import PencilIcon from './icons/PencilIcon'
import { getPlatformById } from '../data/platforms'

const PostBuilderModal = ({ onClose, onPostSaved }) => {
  // Initialize showPreview based on screen size - hidden by default on mobile
  const [showPreview, setShowPreview] = useState(() => window.innerWidth >= 768)
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
  const [activeChannelTab, setActiveChannelTab] = useState(null) // Which channel tab is currently active
  const [hoveredChannelTab, setHoveredChannelTab] = useState(null) // Which channel tab is being hovered for delete
  const [unifiedBackupState, setUnifiedBackupState] = useState(null) // Backup of unified state for reverting
  const [separatedChannelData, setSeparatedChannelData] = useState({}) // Independent data for each separated channel

  // Individual channel Apply to All button state
  const [activeChannelId, setActiveChannelId] = useState(null) // Which channel is being typed in
  const [hoveredChannelId, setHoveredChannelId] = useState(null) // Which channel is being hovered
  const [appliedChannelId, setAppliedChannelId] = useState(null) // Which channel just applied (for feedback)

  // Channel options accordion state
  const [expandedAccordions, setExpandedAccordions] = useState({}) // Track which accordions are expanded
  const [channelOptions, setChannelOptions] = useState({}) // Store channel option values
  
  // Channel scheduling state
  const [channelScheduling, setChannelScheduling] = useState({}) // Store per-channel scheduling: { channelId: { date, time, type } }
  const [unifiedDate, setUnifiedDate] = useState('') // Unified date for all channels
  const [unifiedTime, setUnifiedTime] = useState('11:30') // Unified time for all channels
  
  // Save state
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  // Date scheduling interface
  const [showDateScheduling, setShowDateScheduling] = useState(false)
  const dateSchedulingRef = useRef(null)

  // Warning modals
  const [showCustomizeWarning, setShowCustomizeWarning] = useState(false)
  const [showRevertWarning, setShowRevertWarning] = useState(false)

  // Title editing
  const [postTitle, setPostTitle] = useState('New Post')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  
  const modalRef = useRef(null)
  const addButtonRef = useRef(null)
  const saveButtonRef = useRef(null)

  // Responsive breakpoints
  const [windowSize, setWindowSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight
  }))

  const isMobile = windowSize.width < 768
  const isTablet = windowSize.width >= 768 && windowSize.width < 1024
  const isDesktop = windowSize.width >= 1024

  // Responsive modal dimensions
  const modalWidth = isMobile ? windowSize.width :
                    isTablet ? Math.min(windowSize.width * 0.9, 900) :
                    showPreview ? 1120 : 720

  const modalHeight = isMobile ? windowSize.height :
                     isTablet ? windowSize.height * 0.9 :
                     646
  
  // Center the modal on initial load
  const [position, setPosition] = useState(() => ({
    x: (window.innerWidth - modalWidth) / 2,
    y: (window.innerHeight - modalHeight) / 2
  }))

  // Update window size on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Update position when preview toggle changes modal width (desktop only)
  useEffect(() => {
    if (isDesktop) {
      setPosition(prev => ({
        ...prev,
        x: (window.innerWidth - modalWidth) / 2
      }))
    }
  }, [modalWidth, isDesktop])

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

  // Handle click outside date scheduling interface
  useEffect(() => {
    if (showDateScheduling) {
      const handleClickOutside = (event) => {
        if (dateSchedulingRef.current && !dateSchedulingRef.current.contains(event.target)) {
          // Also check if click was on the trigger button
          const scheduleButton = event.target.closest('button')
          if (scheduleButton && scheduleButton.textContent.includes('📅')) {
            return // Don't close if clicking on the schedule button
          }
          setShowDateScheduling(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDateScheduling])

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
        // Add channel - different logic for unified vs separated modes
        if (channelsSeparated) {
          // SEPARATED MODE - Check if channel already has data, otherwise start empty
          setSeparatedChannelData(prevData => {
            if (!prevData[channelId]) {
              return {
                ...prevData,
                [channelId]: {
                  media: [], // Start with empty media for new channels
                  caption: '', // Start with empty caption for new channels
                  options: {},
                  scheduling: { date: '', time: '11:30', type: 'auto' }
                }
              }
            }
            return prevData // Keep existing data if channel already exists
          })
          // Set this channel as the active tab
          setActiveChannelTab(channelId)
        } else {
          // UNIFIED MODE - Handle caption adoption logic
          const isFirstChannel = prev.length === 0

          if (isFirstChannel && caption.trim()) {
            // First channel with pre-written caption - set as template for all future channels
            setInitialCaption(caption.trim())
            setChannelCaptions(prevCaptions => ({
              ...prevCaptions,
              [channelId]: caption.trim()
            }))
          } else if (!isFirstChannel && (caption.trim() || initialCaption) && !hasEditedCaptions) {
            // Additional channels before any editing - adopt the current caption or template
            const templateCaption = caption.trim() || initialCaption
            setChannelCaptions(prevCaptions => ({
              ...prevCaptions,
              [channelId]: templateCaption
            }))
            // Update template if caption exists and this is still adoption phase
            if (caption.trim() && !initialCaption) {
              setInitialCaption(caption.trim())
            }
          } else {
            // New channel after editing or no template - start blank
            setChannelCaptions(prevCaptions => ({
              ...prevCaptions,
              [channelId]: ''
            }))
          }

          // Apply unified date/time to new channel if available
          if (unifiedDate) {
            setChannelScheduling(prevScheduling => ({
              ...prevScheduling,
              [channelId]: {
                date: unifiedDate,
                time: unifiedTime,
                type: 'auto'
              }
            }))
          }
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
        // Add new channel with post type - handle caption adoption like in handleChannelToggle
        if (channelsSeparated) {
          // SEPARATED MODE - Check if channel already has data, otherwise start empty
          setSeparatedChannelData(prevData => {
            if (!prevData[channelId]) {
              return {
                ...prevData,
                [channelId]: {
                  media: [], // Start with empty media for new channels
                  caption: '', // Start with empty caption for new channels
                  options: {},
                  scheduling: { date: '', time: '11:30', type: 'auto' }
                }
              }
            }
            return prevData // Keep existing data if channel already exists
          })
          // Set this channel as the active tab
          setActiveChannelTab(channelId)
        } else {
          // UNIFIED MODE - Handle caption adoption logic (same as handleChannelToggle)
          const isFirstChannel = prev.length === 0

          if (isFirstChannel && caption.trim()) {
            // First channel with pre-written caption - set as template for all future channels
            setInitialCaption(caption.trim())
            setChannelCaptions(prevCaptions => ({
              ...prevCaptions,
              [channelId]: caption.trim()
            }))
          } else if (!isFirstChannel && (caption.trim() || initialCaption) && !hasEditedCaptions) {
            // Additional channels before any editing - adopt the current caption or template
            const templateCaption = caption.trim() || initialCaption
            setChannelCaptions(prevCaptions => ({
              ...prevCaptions,
              [channelId]: templateCaption
            }))
            // Update template if caption exists and this is still adoption phase
            if (caption.trim() && !initialCaption) {
              setInitialCaption(caption.trim())
            }
          } else {
            // New channel after editing or no template - start blank
            setChannelCaptions(prevCaptions => ({
              ...prevCaptions,
              [channelId]: ''
            }))
          }

          // Apply unified date/time to new channel if available
          if (unifiedDate) {
            setChannelScheduling(prevScheduling => ({
              ...prevScheduling,
              [channelId]: {
                date: unifiedDate,
                time: unifiedTime,
                type: 'auto'
              }
            }))
          }
        }

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

    // Parse date components to avoid timezone issues
    const [year, month, day] = date.split('-').map(num => parseInt(num))
    const [hours, minutes] = time.split(':').map(num => parseInt(num))

    // Create date object using local timezone
    const dateObj = new Date(year, month - 1, day, hours, minutes)

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
    if (channelsSeparated) {
      return selectedChannels
        .map(channel => ({
          ...channel,
          scheduling: separatedChannelData[channel.id]?.scheduling
        }))
        .filter(channel => channel.scheduling?.date) // Only require date, time defaults to 11:30
    } else {
      return selectedChannels
        .map(channel => ({
          ...channel,
          scheduling: channelScheduling[channel.id]
        }))
        .filter(channel => channel.scheduling?.date) // Only require date, time defaults to 11:30
    }
  }

  // Helper functions for date comparison and synchronization
  const areAllChannelDatesSame = () => {
    if (selectedChannels.length === 0) return true

    if (channelsSeparated) {
      // Check separatedChannelData
      const dates = selectedChannels.map(ch =>
        separatedChannelData[ch.id]?.scheduling?.date || ''
      )
      const times = selectedChannels.map(ch =>
        separatedChannelData[ch.id]?.scheduling?.time || '11:30'
      )
      return dates.every(date => date === dates[0]) && times.every(time => time === times[0])
    } else {
      // Check channelScheduling
      const dates = selectedChannels.map(ch =>
        channelScheduling[ch.id]?.date || ''
      )
      const times = selectedChannels.map(ch =>
        channelScheduling[ch.id]?.time || '11:30'
      )
      return dates.every(date => date === dates[0]) && times.every(time => time === times[0])
    }
  }

  const getCommonDate = () => {
    if (selectedChannels.length === 0) return ''

    if (channelsSeparated) {
      return separatedChannelData[selectedChannels[0]?.id]?.scheduling?.date || ''
    } else {
      return channelScheduling[selectedChannels[0]?.id]?.date || ''
    }
  }

  const getCommonTime = () => {
    if (selectedChannels.length === 0) return '11:30'

    if (channelsSeparated) {
      return separatedChannelData[selectedChannels[0]?.id]?.scheduling?.time || '11:30'
    } else {
      return channelScheduling[selectedChannels[0]?.id]?.time || '11:30'
    }
  }

  const hasAnyChannelDate = () => {
    if (channelsSeparated) {
      return selectedChannels.some(ch =>
        separatedChannelData[ch.id]?.scheduling?.date
      )
    } else {
      return selectedChannels.some(ch =>
        channelScheduling[ch.id]?.date
      )
    }
  }

  const getSchedulingButtonText = () => {
    if (channelsSeparated) {
      // In separated mode, use the same logic as individual channel date text
      return getIndividualChannelDateText()
    } else {
      // Unified mode - keep existing logic
      const scheduledChannels = getScheduledChannels()

      if (scheduledChannels.length === 0) {
        // Check if unified date is set even when no channels are scheduled
        if (unifiedDate) {
          return formatDateForDisplay(unifiedDate, unifiedTime)
        }
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

          // Parse dates safely without timezone issues
          const [channelYear, channelMonth, channelDay] = channel.scheduling.date.split('-').map(num => parseInt(num))
          const [channelHours, channelMinutes] = channelTime.split(':').map(num => parseInt(num))
          const channelDateTime = new Date(channelYear, channelMonth - 1, channelDay, channelHours, channelMinutes)

          const [earliestYear, earliestMonth, earliestDay] = earliest.date.split('-').map(num => parseInt(num))
          const [earliestHours, earliestMinutes] = earliestTime.split(':').map(num => parseInt(num))
          const earliestDateTime = new Date(earliestYear, earliestMonth - 1, earliestDay, earliestHours, earliestMinutes)

          return channelDateTime < earliestDateTime ? channel.scheduling : earliest
        }, scheduledChannels[0].scheduling)

        return `Earliest at ${formatDateForDisplay(earliest.date, earliest.time || '11:30')}`
      }
    }
  }

  const getIndividualChannelDateText = () => {
    if (selectedChannels.length === 0) {
      return 'Select date'
    }

    if (channelsSeparated) {
      // In separated mode, use the new helper functions
      if (areAllChannelDatesSame()) {
        const commonDate = getCommonDate()
        if (commonDate) {
          const commonTime = separatedChannelData[selectedChannels[0]?.id]?.scheduling?.time || '11:30'
          return formatDateForDisplay(commonDate, commonTime)
        } else {
          return 'Select date'
        }
      } else {
        return 'Custom dates'
      }
    } else {
      // Unified mode - use existing logic
      const scheduledChannels = getScheduledChannels()

      if (scheduledChannels.length === 0) {
        return 'Select date'
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
        return 'Custom times'
      }
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
    const activeChannelIds = new Set(selectedChannels.map(ch => ch.id))
    const updatedSelections = {}
    let hasChanges = false

    selectedChannels.forEach(channel => {
      const isCustomized = customizedChannels[channel.id]
      const existingMedia = selectedMediaByChannel[channel.id]

      if (!existingMedia) {
        // New channel - inherit master media UNLESS customized OR separated
        updatedSelections[channel.id] = (isCustomized || channelsSeparated) ? [] : [...media]
        hasChanges = true
      } else if (!isCustomized && !channelsSeparated) {
        // Existing non-customized channel in unified mode - sync with master media
        updatedSelections[channel.id] = [...media]
        hasChanges = true
      } else {
        // Customized or separated channel - keep existing media
        updatedSelections[channel.id] = existingMedia
      }
    })

    // Clean up selections for removed channels
    const cleanedCustomizations = {}
    Object.entries(customizedChannels).forEach(([channelId, isCustomized]) => {
      if (activeChannelIds.has(channelId)) {
        cleanedCustomizations[channelId] = isCustomized
      }
    })

    if (hasChanges || Object.keys(updatedSelections).length !== Object.keys(selectedMediaByChannel).length) {
      setSelectedMediaByChannel(updatedSelections)
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
    if (!channelsSeparated) {
      // Show warning before separating channels
      setShowCustomizeWarning(true)
    } else {
      // REVERTING TO UNIFIED - Show confirmation dialog
      const hasIndividualEdits = Object.keys(separatedChannelData).length > 0
      if (hasIndividualEdits) {
        setShowRevertWarning(true)
      } else {
        // No edits, just revert
        setChannelsSeparated(false)
        setActiveChannelTab(null)
      }
    }
  }

  const handleConfirmCustomize = () => {
    // SEPARATING CHANNELS - Create backup and separate data
    setShowCustomizeWarning(false)

    // Create backup of unified state
    const backupState = {
      media: [...media],
      channelCaptions: {...channelCaptions},
      selectedMediaByChannel: {...selectedMediaByChannel},
      customizedChannels: {...customizedChannels}
    }
    setUnifiedBackupState(backupState)

    // Create independent data for each channel
    const separatedData = {}
    selectedChannels.forEach(channel => {
      separatedData[channel.id] = {
        media: [...media], // Each channel gets independent copy of current media
        caption: channelCaptions[channel.id] || caption || '', // Each channel gets its current caption or unified caption
        options: channelOptions[channel.id] || {},
        scheduling: channelScheduling[channel.id] || { date: '', time: '11:30', type: 'auto' }
      }
    })
    setSeparatedChannelData(separatedData)

    // Set first channel as active tab
    setActiveChannelTab(selectedChannels[0]?.id || null)
    setChannelsSeparated(true)
  }

  const handleConfirmRevert = () => {
    setShowRevertWarning(false)

    // Restore unified state from backup
    if (unifiedBackupState) {
      setMedia(unifiedBackupState.media)
      setChannelCaptions(unifiedBackupState.channelCaptions)
      setSelectedMediaByChannel(unifiedBackupState.selectedMediaByChannel)
      setCustomizedChannels(unifiedBackupState.customizedChannels)
    }

    // Clear separated state
    setSeparatedChannelData({})
    setUnifiedBackupState(null)
    setActiveChannelTab(null)
    setChannelsSeparated(false)
  }

  // Title editing handlers
  const handleTitleEdit = () => {
    setIsEditingTitle(true)
  }

  const handleTitleSave = () => {
    setIsEditingTitle(false)
  }

  const handleTitleCancel = () => {
    setIsEditingTitle(false)
    // Could optionally reset title to previous value here
  }

  const handleTitleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleTitleSave()
    } else if (e.key === 'Escape') {
      handleTitleCancel()
    }
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
    setChannelScheduling(prev => {
      // Create a completely new state object to avoid any reference issues
      const newScheduling = {}

      // Copy all existing channel scheduling, ensuring each channel has its own object
      Object.keys(prev).forEach(existingChannelId => {
        newScheduling[existingChannelId] = {
          date: prev[existingChannelId]?.date || '',
          time: prev[existingChannelId]?.time || '11:30',
          type: prev[existingChannelId]?.type || 'auto'
        }
      })

      // Ensure the target channel exists and update only its specific field
      if (!newScheduling[channelId]) {
        newScheduling[channelId] = {
          date: '',
          time: '11:30',
          type: 'auto'
        }
      }

      // Update only the specific field for the specific channel
      newScheduling[channelId] = {
        ...newScheduling[channelId],
        [field]: value
      }

      return newScheduling
    })
  }

  const handleUnifiedDateTimeChange = (date, time) => {
    setUnifiedDate(date)
    setUnifiedTime(time)
  }

  const handleApplyToAllChannels = () => {
    if (!unifiedDate) return

    if (channelsSeparated) {
      // Update separatedChannelData for all channels
      setSeparatedChannelData(prev => {
        const updated = { ...prev }
        selectedChannels.forEach(channel => {
          updated[channel.id] = {
            ...updated[channel.id],
            scheduling: {
              ...updated[channel.id]?.scheduling,
              date: unifiedDate,
              time: unifiedTime,
              type: updated[channel.id]?.scheduling?.type || 'auto'
            }
          }
        })
        return updated
      })
    } else {
      // Update channelScheduling for unified mode
      const newScheduling = { ...channelScheduling }
      selectedChannels.forEach(channel => {
        newScheduling[channel.id] = {
          ...newScheduling[channel.id],
          date: unifiedDate,
          time: unifiedTime
        }
      })
      setChannelScheduling(newScheduling)
    }
  }

  const handleRemoveUnifiedDate = () => {
    setUnifiedDate('')
    setUnifiedTime('11:30')
  }

  const handleRemoveChannelDate = (channelId) => {
    setChannelScheduling(prev => ({
      ...prev,
      [channelId]: {
        ...prev[channelId],
        date: '',
        time: '11:30'
      }
    }))
  }

  // Handlers for separated channel data
  const handleSeparatedChannelMediaChange = (channelId, newMedia) => {
    setSeparatedChannelData(prev => ({
      ...prev,
      [channelId]: {
        ...prev[channelId],
        media: newMedia
      }
    }))
  }

  const handleSeparatedChannelCaptionChange = (channelId, newCaption) => {
    setSeparatedChannelData(prev => ({
      ...prev,
      [channelId]: {
        ...prev[channelId],
        caption: newCaption
      }
    }))
  }

  const handleSeparatedChannelSchedulingChange = (channelId, field, value) => {
    setSeparatedChannelData(prev => ({
      ...prev,
      [channelId]: {
        ...prev[channelId],
        scheduling: {
          ...prev[channelId]?.scheduling,
          [field]: value
        }
      }
    }))
  }

  const handleRemoveSeparatedChannelDate = (channelId) => {
    setSeparatedChannelData(prev => ({
      ...prev,
      [channelId]: {
        ...prev[channelId],
        scheduling: {
          ...prev[channelId]?.scheduling,
          date: '',
          time: '11:30'
        }
      }
    }))
  }

  const handleDeleteChannelTab = (channelId) => {
    // Remove channel from selectedChannels
    const updatedChannels = selectedChannels.filter(channel => channel.id !== channelId)
    setSelectedChannels(updatedChannels)

    // Remove channel data from separatedChannelData
    setSeparatedChannelData(prev => {
      const { [channelId]: removed, ...rest } = prev
      return rest
    })

    // Handle active tab switching
    if (activeChannelTab === channelId) {
      // If we deleted the active tab, switch to first remaining channel
      const nextActiveChannel = updatedChannels[0]
      setActiveChannelTab(nextActiveChannel?.id || null)
    }

    // If no channels remain, exit separated mode
    if (updatedChannels.length === 0) {
      setChannelsSeparated(false)
      setActiveChannelTab(null)
      setSeparatedChannelData({})
    }
  }


  const hasUnsavedChanges = () => {
    return caption.trim() || media.length > 0
  }

  const validateChannelRequirements = (channel) => {
    const platform = getPlatformById(channel.id)

    // Get channel-specific content - prioritize current state
    let channelMedia
    if (channelsSeparated && separatedChannelData[channel.id]?.media) {
      // In separated mode with channel-specific media
      channelMedia = separatedChannelData[channel.id].media
    } else if (selectedMediaByChannel[channel.id]) {
      // Channel has customized media selection
      channelMedia = selectedMediaByChannel[channel.id]
    } else {
      // Use master media
      channelMedia = media || []
    }

    const channelCaption = channelsSeparated && separatedChannelData[channel.id]
      ? separatedChannelData[channel.id].caption || ''
      : channelCaptions[channel.id] || caption

    const videoCount = channelMedia.filter(item => item.type === 'video').length
    const photoCount = channelMedia.filter(item => item.type === 'image').length
    const totalMediaCount = channelMedia.length

    // Helper function to create media description
    const getMediaDescription = () => {
      const parts = []
      if (photoCount > 0) parts.push(`${photoCount} photo${photoCount > 1 ? 's' : ''}`)
      if (videoCount > 0) parts.push(`${videoCount} video${videoCount > 1 ? 's' : ''}`)
      return parts.join(' and ')
    }

    switch (channel.id) {
      case 'instagram':
      case 'facebook':
        if (channel.postType === 'Post') {
          // Instagram/Facebook Post: 1-20 media (mixed photos/videos OK)
          if (totalMediaCount === 0) {
            return `Add at least 1 photo or video for ${platform?.name}`
          }
          if (totalMediaCount > 20) {
            return `${platform?.name} can only have up to 20 media items (you have ${totalMediaCount}). Remove extras or edit each platform separately`
          }
        } else if (channel.postType === 'Reel' || channel.postType === 'Story') {
          // Instagram/Facebook Reel/Story: Exactly 1 video
          if (videoCount === 0) {
            return `${platform?.name} ${channel.postType}s need a video to post`
          }
          if (videoCount > 1) {
            return `${platform?.name} ${channel.postType}s can only have 1 video (you have ${videoCount}). Remove extras or edit each platform separately`
          }
          if (photoCount > 0) {
            return `${platform?.name} ${channel.postType}s only accept videos, not photos. Remove photos or edit each platform separately`
          }
        }
        break

      case 'tiktok':
        // TikTok: Exactly 1 video (no photos allowed)
        if (videoCount === 0) {
          return 'TikTok needs a video to post'
        }
        if (videoCount > 1) {
          return `TikTok can only post 1 video (you have ${videoCount}). Remove extras or edit each platform separately`
        }
        if (photoCount > 0) {
          return `TikTok only accepts videos, not photos. Remove photos or edit each platform separately`
        }
        break

      case 'threads':
      case 'x':
        // Threads/X: 0-20 media OR caption
        if (totalMediaCount === 0 && !channelCaption.trim()) {
          return `Add a caption or media for ${platform?.name}`
        }
        if (totalMediaCount > 20) {
          return `${platform?.name} can only have up to 20 media items (you have ${totalMediaCount}). Remove extras or edit each platform separately`
        }
        break

      case 'youtube':
        // YouTube: Exactly 1 video (no photos allowed)
        if (videoCount === 0) {
          return `YouTube needs a video to post`
        }
        if (videoCount > 1) {
          return `YouTube can only post 1 video (you have ${videoCount}). Remove extras or edit each platform separately`
        }
        if (photoCount > 0) {
          return `YouTube only accepts videos, not photos. Remove photos or edit each platform separately`
        }
        break

      case 'pinterest':
        // Pinterest: 1-20 media
        if (totalMediaCount === 0) {
          return 'Add at least 1 image or video for Pinterest'
        }
        if (totalMediaCount > 20) {
          return `Pinterest can only have up to 20 media items (you have ${totalMediaCount}). Remove extras or edit each platform separately`
        }
        break

      case 'linkedin':
        // LinkedIn: 0-20 media OR caption
        if (totalMediaCount === 0 && !channelCaption.trim()) {
          return 'Add a caption or media for LinkedIn'
        }
        if (totalMediaCount > 20) {
          return `LinkedIn can only have up to 20 media items (you have ${totalMediaCount}). Remove extras or edit each platform separately`
        }
        break
    }

    return null
  }

  const getChannelWarnings = () => {
    const warnings = []

    selectedChannels.forEach(channel => {
      const warning = validateChannelRequirements(channel)
      if (warning) {
        warnings.push({
          channelId: channel.id,
          message: warning
        })
      }
    })

    return warnings
  }

  const validatePost = () => {
    if (selectedChannels.length === 0) {
      return 'Please select at least one channel before saving.'
    }

    // Check channel-specific requirements
    const warnings = getChannelWarnings()
    if (warnings.length > 0) {
      return warnings[0].message
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
      channels: selectedChannels.map(channel => {
        // Use separated channel data if channels are separated, otherwise use unified data
        if (channelsSeparated && separatedChannelData[channel.id]) {
          const channelData = separatedChannelData[channel.id]
          return {
            id: channel.id,
            postType: channel.postType,
            caption: channelData.caption || '',
            media: channelData.media || [],
            options: channelData.options || {},
            scheduling: channelData.scheduling || {}
          }
        } else {
          return {
            id: channel.id,
            postType: channel.postType,
            caption: channelCaptions[channel.id] || caption,
            media: selectedMediaByChannel[channel.id] || media,
            options: channelOptions[channel.id] || {},
            scheduling: channelScheduling[channel.id] || {}
          }
        }
      }),
      createdAt: new Date().toISOString(),
      status
    }
  }

  const handleSaveAsDraft = async () => {
    const validationError = validatePost()
    if (validationError) {
      return // Just return early, warnings are shown at top
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
    // Don't show errors since we have validation warnings at the top
    const validationError = validatePost()
    if (validationError) {
      return // Just return early, no error display
    }

    // Check if any channels have scheduling dates
    const scheduledChannels = selectedChannels.filter(channel =>
      channelScheduling[channel.id]?.date
    )

    if (scheduledChannels.length === 0) {
      return // Just return early, no error display
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
      return // Just return early, warnings are shown at top
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
      
      {/* Overlay - only show on tablet/desktop */}
      {!isMobile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'var(--modal-overlay)',
            zIndex: 999
          }}
        />
      )}

      {/* Modal */}
      <div
        ref={modalRef}
        style={isMobile ? {
          // Mobile: Full screen
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 0,
          boxShadow: 'none',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        } : isTablet ? {
          // Tablet: Large centered modal
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: modalWidth,
          height: modalHeight,
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        } : {
          // Desktop: Current draggable modal
          position: 'fixed',
          left: position.x,
          top: position.y,
          width: modalWidth,
          height: modalHeight,
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onMouseDown={isDesktop ? handleMouseDown : undefined}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          {/* Drag Handle - only show on desktop */}
          {isDesktop && (
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
                  backgroundColor: 'var(--text-secondary)',
                  borderRadius: '50%'
                }} />
              ))}
            </div>
          )}

          {/* Title */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: 1
          }}>
            {isEditingTitle ? (
              <input
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                onKeyDown={handleTitleKeyPress}
                onBlur={handleTitleSave}
                autoFocus
                style={{
                  fontWeight: '600',
                  fontSize: '16px',
                  border: '2px solid #62759F',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  backgroundColor: 'var(--bg-primary)',
                  outline: 'none',
                  minWidth: '150px'
                }}
              />
            ) : (
              <span
                style={{
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s ease'
                }}
                onClick={handleTitleEdit}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--bg-secondary)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                }}
                title="Click to edit title"
              >
                {postTitle}
              </span>
            )}

            <button
              onClick={handleTitleEdit}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                opacity: isEditingTitle ? 0.5 : 1,
                transition: 'opacity 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              disabled={isEditingTitle}
              title="Edit title"
            >
              <PencilIcon size={14} color="var(--icon-color)" />
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
                padding: isMobile ? '6px 10px' : '8px 12px',
                backgroundColor: showPreview ? 'var(--bg-tertiary)' : '#62759F',
                color: showPreview ? 'var(--text-primary)' : 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: isMobile ? '12px' : '14px'
              }}
            >
              {isMobile
                ? (showPreview ? 'Hide Preview' : 'Show Preview')
                : (showPreview ? 'Hide Post Preview' : 'Show Post Preview')
              }
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
          overflow: 'hidden',
          flexDirection: isMobile && showPreview ? 'column' : 'row'
        }}>
          {/* Left Panel */}
          <div style={{
            width: isMobile
              ? '100%'
              : (showPreview ? '60%' : '100%'),
            height: isMobile && showPreview ? '60%' : 'auto',
            borderRight: showPreview && !isMobile ? '1px solid var(--border-primary)' : 'none',
            borderBottom: showPreview && isMobile ? '1px solid var(--border-primary)' : 'none',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: isMobile ? 'auto' : 'visible'
          }}>
            {/* Channel Warnings */}
            {selectedChannels.length > 0 && (() => {
              const warnings = getChannelWarnings()
              if (warnings.length === 0) return null

              return (
                <div style={{
                  backgroundColor: 'var(--bg-warning)',
                  borderBottom: '1px solid var(--border-warning)',
                  padding: '12px 20px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}>
                    <div style={{
                      fontSize: '16px',
                      lineHeight: '1',
                      marginTop: '2px'
                    }}>
                      ⚠️
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'var(--text-warning)',
                        marginBottom: '4px'
                      }}>
                        Content Requirements Missing
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: 'var(--text-warning)',
                        lineHeight: '1.4'
                      }}>
                        {warnings.length === 1 ? (
                          warnings[0].message
                        ) : (
                          <>
                            {warnings.length} channels need attention:
                            <ul style={{
                              margin: '4px 0 0 0',
                              paddingLeft: '16px',
                              listStyle: 'disc'
                            }}>
                              {warnings.map((warning, index) => {
                                const platform = getPlatformById(warning.channelId)
                                return (
                                  <li key={index} style={{ marginBottom: '2px' }}>
                                    <strong>{platform?.name}:</strong> {warning.message.replace(`${platform?.name} `, '')}
                                  </li>
                                )
                              })}
                            </ul>
                          </>
                        )}

                        {/* Customize by channel link - only show when channels aren't separated */}
                        {!channelsSeparated && selectedChannels.length > 1 && (
                          <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-warning)' }}>
                            <button
                              onClick={handleCustomizeClick}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-warning)',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                padding: 0
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.color = 'var(--text-warning-dark)'
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.color = 'var(--text-warning)'
                              }}
                            >
                              Need different media for each channel? Customize by channel →
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Post Creation Mode */}
                <div style={{
                  flex: 1,
                  overflow: 'auto',
                  padding: '20px',
                  paddingBottom: '10px'
                }}>

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
                            border: '1px solid var(--border-primary)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            backgroundColor: 'var(--bg-primary)'
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
                                color: caption.length > 280 ? 'var(--text-error)' : 'var(--text-secondary)',
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
                                const IconComponent = platform?.icon
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
                                      color: 'var(--text-primary)'
                                    }}>
                                      {IconComponent && <IconComponent size={14} color="var(--icon-color)" />}
                                      <span>{platform?.name}</span>
                                      {channel.postType && (
                                        <span style={{
                                          color: 'var(--text-secondary)',
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
                                          border: '1px solid var(--border-primary)',
                                          borderRadius: '6px',
                                          resize: 'none',
                                          fontFamily: 'inherit',
                                          fontSize: '13px',
                                          outline: 'none',
                                          backgroundColor: 'var(--bg-primary)'
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
                                            backgroundColor: appliedChannelId === channel.id ? '#3c3c3c' : '#62759F',
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
                                        color: channelCaption.length > 280 ? 'var(--text-error)' : 'var(--text-secondary)',
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
                    /* CUSTOMIZED VIEW - Tab-Based Individual Channel Editor */
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      marginBottom: '20px'
                    }}>
                      {/* Channel Tabs */}
                      <div style={{
                        display: 'flex',
                        borderBottom: '1px solid var(--border-primary)',
                        marginBottom: '20px',
                        position: 'relative',
                        overflowX: 'auto',
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'var(--border-primary) transparent'
                      }}>
                        {selectedChannels.map((channel) => {
                          const platform = getPlatformById(channel.id)
                          const IconComponent = platform?.icon
                          const isActive = activeChannelTab === channel.id
                          const isHovered = hoveredChannelTab === channel.id

                          return (
                            <button
                              key={channel.id}
                              onClick={() => setActiveChannelTab(channel.id)}
                              onMouseEnter={() => setHoveredChannelTab(channel.id)}
                              onMouseLeave={() => setHoveredChannelTab(null)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 16px',
                                backgroundColor: isActive ? 'var(--bg-secondary)' : 'transparent',
                                border: 'none',
                                borderBottom: isActive ? '2px solid #62759F' : '2px solid transparent',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: isActive ? '600' : '500',
                                color: isActive ? '#62759F' : 'var(--text-primary)',
                                transition: 'all 0.2s ease',
                                position: 'relative',
                                minWidth: 'fit-content',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {IconComponent && <IconComponent size={16} color={isActive ? '#62759F' : 'var(--icon-color)'} />}
                              <span>{platform?.name}</span>
                              {channel.postType && (
                                <span style={{
                                  fontSize: '12px',
                                  color: 'var(--text-secondary)',
                                  fontWeight: '400'
                                }}>
                                  • {channel.postType}
                                </span>
                              )}

                              {/* Delete Icon on Hover */}
                              {isHovered && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteChannelTab(channel.id)
                                  }}
                                  style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--text-error)',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    lineHeight: '1'
                                  }}
                                  title="Delete channel"
                                >
                                  ×
                                </button>
                              )}
                            </button>
                          )
                        })}

                        {/* Plus Tab for Adding Channels */}
                        <button
                          ref={addButtonRef}
                          onClick={() => setShowChannelMenu(!showChannelMenu)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 16px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderBottom: '2px solid transparent',
                            cursor: 'pointer',
                            fontSize: '18px',
                            fontWeight: '500',
                            color: '#62759F',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          +
                        </button>
                      </div>

                      {/* Channel Selection Menu for Separated Mode */}
                      {showChannelMenu && (
                        <ChannelMenu
                          selectedChannels={selectedChannels}
                          onChannelToggle={handleChannelToggle}
                          onPostTypeSelect={handlePostTypeSelect}
                          onClose={() => setShowChannelMenu(false)}
                          buttonRef={addButtonRef}
                          positionBelow={true}
                        />
                      )}

                      {/* Active Channel Content */}
                      {activeChannelTab && separatedChannelData[activeChannelTab] && (
                        <div>
                          {/* Media and Caption Row */}
                          <div style={{
                            display: 'flex',
                            gap: '16px',
                            marginBottom: '20px'
                          }}>
                            {/* Channel Media Manager */}
                            <MediaManager
                              media={separatedChannelData[activeChannelTab].media || []}
                              onMediaChange={(newMedia) => handleSeparatedChannelMediaChange(activeChannelTab, newMedia)}
                              maxMedia={20}
                            />

                            {/* Channel Caption Editor */}
                            <div style={{
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column'
                            }}>
                              <div
                                style={{
                                  position: 'relative',
                                  height: '280px',
                                  border: '1px solid var(--border-primary)',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  backgroundColor: 'var(--bg-primary)'
                                }}
                              >
                                <textarea
                                  placeholder={`Write caption for ${getPlatformById(activeChannelTab)?.name}...`}
                                  value={separatedChannelData[activeChannelTab].caption || ''}
                                  onChange={(e) => handleSeparatedChannelCaptionChange(activeChannelTab, e.target.value)}
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
                                {/* Character Counter */}
                                <div style={{
                                  position: 'absolute',
                                  bottom: '8px',
                                  right: '12px',
                                  fontSize: '11px',
                                  color: (separatedChannelData[activeChannelTab].caption || '').length > 280 ? 'var(--text-error)' : 'var(--text-secondary)',
                                  fontWeight: '500'
                                }}>
                                  {(separatedChannelData[activeChannelTab].caption || '').length}/280
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Channel Options for Active Channel */}
                          {(() => {
                            const platform = getPlatformById(activeChannelTab)
                            if (platform?.options && platform.options.length > 0) {
                              return (
                                <div style={{ marginBottom: '20px' }}>
                                  <ChannelOptionsAccordion
                                    platform={platform}
                                    isExpanded={expandedAccordions[activeChannelTab] || false}
                                    onToggle={() => handleAccordionToggle(activeChannelTab)}
                                    optionValues={channelOptions[activeChannelTab] || {}}
                                    onOptionChange={(optionId, value) =>
                                      handleChannelOptionChange(activeChannelTab, optionId, value)
                                    }
                                    disabled={false}
                                  />
                                </div>
                              )
                            }
                            return null
                          })()}

                          {/* Date/Time and Posting Options for Active Channel */}
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            padding: '16px',
                            border: '1px solid var(--border-primary)',
                            borderRadius: '8px',
                            backgroundColor: 'var(--bg-primary)'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px'
                            }}>
                              <DateTimeDisplay
                                date={channelsSeparated ? separatedChannelData[activeChannelTab]?.scheduling?.date || '' : channelScheduling[activeChannelTab]?.date || ''}
                                time={channelsSeparated ? separatedChannelData[activeChannelTab]?.scheduling?.time || '11:30' : channelScheduling[activeChannelTab]?.time || '11:30'}
                                onDateTimeChange={(date, time) => {
                                  if (channelsSeparated) {
                                    handleSeparatedChannelSchedulingChange(activeChannelTab, 'date', date)
                                    handleSeparatedChannelSchedulingChange(activeChannelTab, 'time', time)
                                  } else {
                                    handleChannelSchedulingChange(activeChannelTab, 'date', date)
                                    handleChannelSchedulingChange(activeChannelTab, 'time', time)
                                  }
                                }}
                                onRemoveDate={() => channelsSeparated ? handleRemoveSeparatedChannelDate(activeChannelTab) : handleRemoveChannelDate(activeChannelTab)}
                                placeholder="Select date"
                                style={{ flex: 1 }}
                              />

                              <select
                                value={channelsSeparated ? separatedChannelData[activeChannelTab]?.scheduling?.type || 'auto' : channelScheduling[activeChannelTab]?.type || 'auto'}
                                onChange={(e) => channelsSeparated ? handleSeparatedChannelSchedulingChange(activeChannelTab, 'type', e.target.value) : handleChannelSchedulingChange(activeChannelTab, 'type', e.target.value)}
                                style={{
                                  padding: '8px 12px',
                                  border: '1px solid var(--border-primary)',
                                  borderRadius: '6px',
                                  fontSize: '14px',
                                  minWidth: '120px',
                                  backgroundColor: 'var(--bg-primary)'
                                }}
                              >
                                <option value="auto">Auto-post</option>
                                <option value="reminder">Reminder</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Social Channel Selector - Only show in unified mode */}
                  {!channelsSeparated && (
                    <div style={{
                      marginBottom: '20px',
                      position: 'relative'
                    }}>
                    {selectedChannels.length === 0 ? (
                      // Empty State
                      <div style={{
                        border: '1px solid var(--border-primary)',
                        borderRadius: '8px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{
                          color: 'var(--text-secondary)',
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
                            backgroundColor: '#62759F',
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
                        border: '1px solid var(--border-primary)',
                        borderRadius: '8px',
                        padding: '12px'
                      }}>
                        {/* Channel Badges and Plus Button */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '12px'
                        }}>
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                            alignItems: 'center',
                            flex: 1
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

                          <button
                            ref={addButtonRef}
                            onClick={() => setShowChannelMenu(!showChannelMenu)}
                            style={{
                              height: '36px',
                              width: '36px',
                              backgroundColor: '#62759F',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
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
                  )}

                  {/* Channel Options Accordions - Show in order channels were selected */}
                  {selectedChannels.length > 0 && !channelsSeparated && (
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
                    backgroundColor: 'var(--bg-error)',
                    borderTop: '1px solid var(--border-primary)',
                    color: 'var(--text-error)',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    ❌ {saveError}
                  </div>
                )}

                {/* Sticky Footer */}
                <div style={{
                    display: 'flex',
                    alignItems: isMobile ? 'stretch' : 'center',
                    justifyContent: 'space-between',
                    flexDirection: isMobile ? 'column' : 'row',
                    padding: isMobile ? '12px 16px' : '16px 20px',
                    borderTop: '1px solid var(--border-primary)',
                    backgroundColor: 'var(--bg-primary)',
                    flexShrink: 0,
                    gap: isMobile ? '12px' : '0'
                  }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '8px' : '12px',
                    flexWrap: isMobile ? 'wrap' : 'nowrap'
                  }}>
                    <button
                      onClick={handleCloseRequest}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-error)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px'
                      }}
                    >
                      <TrashIcon size={18} color="var(--text-error)" />
                    </button>

                    <button
                      onClick={() => setShowDateScheduling(!showDateScheduling)}
                      style={{
                        padding: isMobile ? '6px 10px' : '8px 12px',
                        backgroundColor: showDateScheduling ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: isMobile ? '12px' : '14px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: isMobile ? '140px' : 'none'
                      }}
                    >
                      📅 {getSchedulingButtonText()}
                    </button>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '8px' : '12px',
                    flexWrap: isMobile ? 'wrap' : 'nowrap',
                    justifyContent: isMobile ? 'stretch' : 'flex-end'
                  }}>
                    {selectedChannels.length > 1 && (
                      <button
                        onClick={handleCustomizeClick}
                        style={{
                          padding: isMobile ? '6px 10px' : '8px 12px',
                          fontSize: isMobile ? '12px' : '14px',
                          backgroundColor: 'transparent',
                          color: 'var(--text-secondary)',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '400',
                          textDecoration: channelsSeparated ? 'none' : 'none',
                          flex: isMobile ? '1' : 'none',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.textDecoration = 'underline'
                          e.target.style.color = 'var(--text-primary)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.textDecoration = 'none'
                          e.target.style.color = 'var(--text-secondary)'
                        }}
                      >
                        {channelsSeparated
                          ? (isMobile ? 'Revert to Unified' : 'Revert to Unified Post')
                          : (isMobile ? 'Customize Channels' : 'Customize for each channel')
                        }
                      </button>
                    )}

                    <button
                      ref={saveButtonRef}
                      onClick={() => setShowSavePostMenu(!showSavePostMenu)}
                      disabled={isSaving}
                      style={{
                        padding: isMobile ? '12px 16px' : '10px 20px',
                        backgroundColor: isSaving ? 'var(--text-secondary)' : '#3c3c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flex: isMobile ? '1' : 'none',
                        minWidth: isMobile ? '120px' : 'auto'
                      }}
                    >
                      {isSaving && <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid var(--bg-primary)',
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
                      hasScheduledChannels={selectedChannels.length > 0 && getScheduledChannels().length === selectedChannels.length}
                      isLoading={isSaving}
                      hasValidationErrors={getChannelWarnings().length > 0}
                    />
                  )}

                  {/* Date Scheduling Interface */}
                  {showDateScheduling && (
                    <div
                      ref={dateSchedulingRef}
                      style={{
                        position: 'absolute',
                        bottom: '70px',
                        right: '20px',
                        left: '20px',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-primary)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        zIndex: 1000,
                        maxHeight: '300px',
                        overflowY: 'auto'
                      }}>
                      <div style={{
                        padding: '16px',
                        borderBottom: '1px solid var(--border-primary)',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'var(--text-primary)'
                      }}>
                        Schedule Posts by Channel
                      </div>

                      {/* Unified Date/Time Selector */}
                      <div style={{
                        padding: '16px',
                        borderBottom: '1px solid var(--border-primary)',
                        backgroundColor: 'var(--bg-secondary)'
                      }}>
                        <div style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          marginBottom: '12px'
                        }}>
                          Set date and time for all channels
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <DateTimeDisplay
                            date={unifiedDate}
                            time={unifiedTime}
                            onDateTimeChange={handleUnifiedDateTimeChange}
                            onRemoveDate={handleRemoveUnifiedDate}
                            placeholder="Select date for all"
                            style={{ flex: 1 }}
                          />
                          <button
                            onClick={handleApplyToAllChannels}
                            disabled={!unifiedDate}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: unifiedDate ? '#62759F' : 'var(--bg-tertiary)',
                              color: unifiedDate ? 'white' : 'var(--text-secondary)',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: unifiedDate ? 'pointer' : 'not-allowed',
                              fontSize: '12px',
                              fontWeight: '500',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            Save for all
                          </button>
                        </div>
                      </div>

                      <div style={{ padding: '16px' }}>
                        {selectedChannels.length === 0 ? (
                          <div style={{
                            textAlign: 'center',
                            color: 'var(--text-secondary)',
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
                              const IconComponent = platform?.icon
                              const isConnected = platform?.account

                              return (
                                <div key={channel.id} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  padding: '12px',
                                  border: '1px solid var(--border-primary)',
                                  borderRadius: '6px',
                                  backgroundColor: 'var(--bg-secondary)'
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
                                      {IconComponent && <IconComponent size={12} color="white" />}
                                    </div>
                                    <div>
                                      <div style={{ fontWeight: '500', fontSize: '13px' }}>
                                        {platform?.name}
                                      </div>
                                      {channel.postType && (
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
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
                                    <DateTimeDisplay
                                      date={channelsSeparated ? separatedChannelData[channel.id]?.scheduling?.date || '' : channelScheduling[channel.id]?.date || ''}
                                      time={channelsSeparated ? separatedChannelData[channel.id]?.scheduling?.time || '11:30' : channelScheduling[channel.id]?.time || '11:30'}
                                      onDateTimeChange={(date, time) => {
                                        if (channelsSeparated) {
                                          handleSeparatedChannelSchedulingChange(channel.id, 'date', date)
                                          handleSeparatedChannelSchedulingChange(channel.id, 'time', time)
                                        } else {
                                          handleChannelSchedulingChange(channel.id, 'date', date)
                                          handleChannelSchedulingChange(channel.id, 'time', time)
                                        }
                                      }}
                                      onRemoveDate={() => channelsSeparated ? handleRemoveSeparatedChannelDate(channel.id) : handleRemoveChannelDate(channel.id)}
                                      placeholder="Select date"
                                      style={{
                                        flex: 1,
                                        fontSize: '12px',
                                        padding: '6px 12px',
                                        minHeight: '16px'
                                      }}
                                    />

                                    <select
                                      value={channelsSeparated ? separatedChannelData[channel.id]?.scheduling?.type || 'auto' : channelScheduling[channel.id]?.type || 'auto'}
                                      onChange={(e) => channelsSeparated ? handleSeparatedChannelSchedulingChange(channel.id, 'type', e.target.value) : handleChannelSchedulingChange(channel.id, 'type', e.target.value)}
                                      style={{
                                        padding: '6px',
                                        border: '1px solid var(--border-primary)',
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
              width: isMobile ? '100%' : '40%',
              height: isMobile ? '40%' : 'auto',
              backgroundColor: 'var(--bg-secondary)',
              overflow: 'auto'
            }}>
              <PreviewCarousel
                selectedChannels={selectedChannels}
                caption={caption}
                media={media}
                separatedMode={channelsSeparated}
                separatedChannelData={separatedChannelData}
              />
            </div>
          )}
        </div>
      </div>

      {/* Warning Modals */}
      <WarningModal
        isOpen={showCustomizeWarning}
        onClose={() => setShowCustomizeWarning(false)}
        onConfirm={handleConfirmCustomize}
        title="Customize Channels"
        message="You're about to separate your channels for individual customization. Once separated, content changes will no longer sync between channels. You'll be able to customize captions, media, and settings for each channel independently."
        confirmText="Continue"
        confirmButtonColor="#62759F"
      />

      <WarningModal
        isOpen={showRevertWarning}
        onClose={() => setShowRevertWarning(false)}
        onConfirm={handleConfirmRevert}
        title="Revert to Unified Post"
        message="Are you sure you want to revert to unified posting? This will discard all individual channel customizations and merge everything back into a single unified post."
        confirmText="Revert to Unified"
        confirmButtonColor="var(--text-error)"
      />

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