import { useState } from 'react'
import { getPlatformById } from '../data/platforms'
import MediaManager from './MediaManager'
import ChannelOptionsAccordion from './ChannelOptionsAccordion'

const IndividualChannelEditor = ({ 
  editingChannelId,
  tempChanges, 
  setTempChanges,
  channelScheduling,
  onChannelSchedulingChange,
  onCancel, 
  onUpdate 
}) => {
  const [accordionExpanded, setAccordionExpanded] = useState(false)
  const [channelOptions, setChannelOptions] = useState({})
  
  const platform = getPlatformById(editingChannelId)
  
  const handleMediaChange = (newMedia) => {
    // Mark channel as customized for media ONLY and update temp changes
    setTempChanges(prev => {
      const currentMasterMedia = prev.media || []
      const currentSelectedMediaByChannel = prev.selectedMediaByChannel || {}
      
      // BIDIRECTIONAL SYNC: Add to master media if not present
      const existingIds = new Set(currentMasterMedia.map(item => item.id))
      let updatedMasterMedia = [...currentMasterMedia]
      
      newMedia.forEach(item => {
        if (!existingIds.has(item.id) && updatedMasterMedia.length < 20) {
          updatedMasterMedia.push(item)
          existingIds.add(item.id)
        }
      })
      
      // SMART CLEANUP: Check for deleted media that should be removed from master
      const newMediaIds = new Set(newMedia.map(item => item.id))
      const deletedFromThisChannel = currentMasterMedia.filter(item => 
        (prev.channelMedia || []).some(oldItem => oldItem.id === item.id) && 
        !newMediaIds.has(item.id)
      )
      
      // For each deleted media, check if it exists in any other channel
      deletedFromThisChannel.forEach(deletedItem => {
        const mediaExistsInOtherChannels = Object.entries(currentSelectedMediaByChannel).some(([otherChannelId, otherChannelMedia]) => {
          if (otherChannelId === editingChannelId) return false // Skip current channel
          return otherChannelMedia.some(item => item.id === deletedItem.id)
        })
        
        // Check if non-customized channels would inherit this media
        const updatedCustomizations = {
          ...prev.customizedChannels,
          [editingChannelId]: { 
            ...prev.customizedChannels?.[editingChannelId], 
            media: true 
          }
        }
        
        // Note: We can't access selectedChannels here, so we'll be conservative
        // and only remove if we're sure it doesn't exist anywhere else
        if (!mediaExistsInOtherChannels) {
          updatedMasterMedia = updatedMasterMedia.filter(item => item.id !== deletedItem.id)
        }
      })
      
      return {
        ...prev,
        channelMedia: newMedia,
        media: updatedMasterMedia,
        selectedMediaByChannel: {
          ...currentSelectedMediaByChannel,
          [editingChannelId]: newMedia
        },
        customizedChannels: {
          ...prev.customizedChannels,
          [editingChannelId]: { 
            ...prev.customizedChannels?.[editingChannelId], 
            media: true 
          }
        }
      }
    })
  }

  const handleCaptionChange = (e) => {
    const newCaption = e.target.value
    // Mark channel as customized for caption ONLY
    setTempChanges(prev => ({
      ...prev,
      channelCaption: newCaption,
      channelCaptions: {
        ...prev.channelCaptions,
        [editingChannelId]: newCaption
      },
      customizedChannels: {
        ...prev.customizedChannels,
        [editingChannelId]: { 
          ...prev.customizedChannels?.[editingChannelId], 
          caption: true 
        }
      }
    }))
  }


  const handleDateChange = (field, value) => {
    // Use direct channel scheduling change handler
    onChannelSchedulingChange(editingChannelId, field, value)
  }

  // Channel options handlers
  const handleAccordionToggle = () => {
    setAccordionExpanded(prev => !prev)
  }

  const handleChannelOptionChange = (optionId, value) => {
    setChannelOptions(prev => ({
      ...prev,
      [optionId]: value
    }))
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* Secondary Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        borderBottom: '1px solid #e1e5e9',
        backgroundColor: '#f8f9fa'
      }}>
        {/* Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '14px', color: '#6c757d' }}>Customizing</span>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '4px',
            backgroundColor: platform?.color || '#ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px'
          }}>
            {platform?.icon}
          </div>
          <span style={{ fontWeight: '500', fontSize: '14px' }}>
            {platform?.name}
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={onUpdate}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Update
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ 
        padding: '20px', 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        overflow: 'auto'
      }}>
        {/* Media Section */}
        <div style={{
          display: 'flex',
          gap: '16px'
        }}>
          {/* Media Manager - Same width as main view */}
          <MediaManager
            media={tempChanges.channelMedia || []}
            onMediaChange={handleMediaChange}
            maxMedia={20}
          />

          {/* Caption Editor - Same width as main view */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <textarea 
              placeholder={`Write your caption for ${platform?.name}...`}
              value={tempChanges.channelCaptions?.[editingChannelId] || tempChanges.caption || ''}
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
            <div style={{
              fontSize: '12px',
              color: '#6c757d',
              marginTop: '4px',
              textAlign: 'right'
            }}>
              {(tempChanges.channelCaptions?.[editingChannelId] || tempChanges.caption || '').length}/280 characters
            </div>
          </div>
        </div>

        {/* Channel-Specific Options */}
        {platform?.options && platform.options.length > 0 && (
          <ChannelOptionsAccordion
            platform={platform}
            isExpanded={accordionExpanded}
            onToggle={handleAccordionToggle}
            optionValues={channelOptions}
            onOptionChange={handleChannelOptionChange}
            disabled={true}
          />
        )}
        
        {/* Date/Scheduling Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          border: '1px solid #e1e5e9',
          borderRadius: '8px',
          backgroundColor: 'white'
        }}>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>Post on</span>
          
          <input
            type="date"
            value={channelScheduling[editingChannelId]?.date || ''}
            onChange={(e) => handleDateChange('date', e.target.value)}
            style={{
              padding: '8px',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          
          <input
            type="time"
            value={channelScheduling[editingChannelId]?.time || '11:30'}
            onChange={(e) => handleDateChange('time', e.target.value)}
            style={{
              padding: '8px',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />

          <select
            value={channelScheduling[editingChannelId]?.type || 'auto'}
            onChange={(e) => handleDateChange('type', e.target.value)}
            style={{
              padding: '8px',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '14px',
              minWidth: '120px'
            }}
          >
            <option value="auto">Auto-post</option>
            <option value="reminder">Reminder</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default IndividualChannelEditor