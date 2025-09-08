import { useState } from 'react'
import { getPlatformById } from '../data/platforms'
import { getRandomMediaItems } from '../data/mockMedia'
import ChannelMediaGrid from './ChannelMediaGrid'

const CrossChannelEditor = ({ 
  selectedChannels, 
  activeTab, 
  setActiveTab, 
  tempChanges, 
  setTempChanges,
  onCancel, 
  onUpdate,
  onChannelMediaAdd,
  onChannelMediaRemove
}) => {
  
  const renderMediaView = () => {
    const masterMedia = tempChanges.media || []
    const channelMediaSelections = tempChanges.selectedMediaByChannel || {}

    return (
      <div style={{
        flex: 1,
        padding: '20px',
        overflow: 'auto'
      }}>
        <h3 style={{ 
          margin: '0 0 20px 0',
          fontSize: '16px',
          fontWeight: '600' 
        }}>
          Media by Channel
        </h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {selectedChannels.map((channel) => {
            const platform = getPlatformById(channel.id)
            const selectedMediaForChannel = channelMediaSelections[channel.id] || []
            
            return (
              <div key={channel.id} style={{
                border: '1px solid #e1e5e9',
                borderRadius: '8px',
                backgroundColor: 'white',
                overflow: 'hidden'
              }}>
                {/* Channel Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: '#f8f9fa',
                  borderBottom: '1px solid #e1e5e9'
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
                  <span style={{ fontWeight: '500', fontSize: '14px' }}>
                    {platform?.name} {channel.postType && `• ${channel.postType}`}
                  </span>
                  <div style={{ 
                    marginLeft: 'auto',
                    fontSize: '12px',
                    color: '#6c757d'
                  }}>
                    {selectedMediaForChannel.length} of {masterMedia.length} media selected
                  </div>
                </div>

                {/* Media Grid */}
                <div style={{ padding: '16px' }}>
                  <ChannelMediaGrid
                    channelId={channel.id}
                    masterMedia={masterMedia}
                    selectedMedia={selectedMediaForChannel}
                    onMediaAdd={(channelId, mediaItems) => {
                      // Handle adding media through temp changes
                      const updatedSelections = { ...channelMediaSelections }
                      updatedSelections[channelId] = [...(updatedSelections[channelId] || []), ...mediaItems]
                      
                      // Also add to master media if not present
                      const existingIds = new Set(masterMedia.map(item => item.id))
                      const newMasterMedia = [...masterMedia]
                      
                      mediaItems.forEach(item => {
                        if (!existingIds.has(item.id) && newMasterMedia.length < 20) {
                          newMasterMedia.push(item)
                          existingIds.add(item.id)
                        }
                      })
                      
                      setTempChanges(prev => ({
                        ...prev,
                        media: newMasterMedia,
                        selectedMediaByChannel: updatedSelections
                      }))
                    }}
                    onMediaRemove={(channelId, mediaId) => {
                      // Handle removing media through temp changes
                      const updatedSelections = { ...channelMediaSelections }
                      updatedSelections[channelId] = (updatedSelections[channelId] || []).filter(item => item.id !== mediaId)
                      
                      // Check if media is used by other channels
                      const isUsedElsewhere = Object.entries(updatedSelections).some(([otherChannelId, channelMedia]) => {
                        if (otherChannelId === channelId) return false
                        return channelMedia.some(item => item.id === mediaId)
                      })
                      
                      // Remove from master if not used elsewhere
                      const newMasterMedia = isUsedElsewhere 
                        ? masterMedia 
                        : masterMedia.filter(item => item.id !== mediaId)
                      
                      setTempChanges(prev => ({
                        ...prev,
                        media: newMasterMedia,
                        selectedMediaByChannel: updatedSelections
                      }))
                    }}
                    maxMedia={20}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderCaptionView = () => {
    const handleCaptionChange = (channelId, value) => {
      setTempChanges(prev => ({
        ...prev,
        channelCaptions: {
          ...prev.channelCaptions,
          [channelId]: value
        },
        captionsLinked: false // Editing makes captions separate
      }))
    }

    const handleApplyToAll = (sourceChannelId) => {
      const sourceCaption = tempChanges.channelCaptions?.[sourceChannelId] || ''
      const newChannelCaptions = {}
      
      selectedChannels.forEach(channel => {
        newChannelCaptions[channel.id] = sourceCaption
      })
      
      setTempChanges(prev => ({
        ...prev,
        channelCaptions: newChannelCaptions,
        captionsLinked: true // Apply to All reconnects to master
      }))
    }

    const getChannelCaption = (channelId) => {
      return tempChanges.channelCaptions?.[channelId] || tempChanges.caption || ''
    }

    return (
      <div style={{
        flex: 1,
        padding: '20px',
        overflow: 'auto'
      }}>
        <h3 style={{ 
          margin: '0 0 20px 0',
          fontSize: '16px',
          fontWeight: '600' 
        }}>
          Captions by Channel
        </h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {selectedChannels.map((channel, index) => {
            const platform = getPlatformById(channel.id)
            return (
              <div key={channel.id} style={{
                border: '1px solid #e1e5e9',
                borderRadius: '8px',
                backgroundColor: 'white',
                overflow: 'hidden'
              }}>
                {/* Channel Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: '#f8f9fa',
                  borderBottom: '1px solid #e1e5e9'
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
                  <span style={{ fontWeight: '500', fontSize: '14px' }}>
                    {platform?.name} {channel.postType && `• ${channel.postType}`}
                  </span>
                  <div style={{ 
                    marginLeft: 'auto',
                    fontSize: '12px',
                    color: '#6c757d'
                  }}>
                    {getChannelCaption(channel.id).length}/280 characters
                  </div>
                </div>

                {/* Caption Input */}
                <div style={{ padding: '16px' }}>
                  <textarea
                    placeholder={`Write caption for ${platform?.name}...`}
                    value={getChannelCaption(channel.id)}
                    onChange={(e) => handleCaptionChange(channel.id, e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '80px',
                      padding: '12px',
                      border: '1px solid #dee2e6',
                      borderRadius: '6px',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      fontSize: '14px',
                      marginBottom: '12px'
                    }}
                  />
                  
                  {/* Individual Apply to All Button */}
                  <button
                    onClick={() => handleApplyToAll(channel.id)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'transparent',
                      color: '#6c757d',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '400'
                    }}
                  >
                    Apply to All Channels
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderDateView = () => {
    return (
      <div style={{
        flex: 1,
        padding: '20px',
        overflow: 'auto'
      }}>
        <h3 style={{ 
          margin: '0 0 20px 0',
          fontSize: '16px',
          fontWeight: '600' 
        }}>
          Scheduling by Channel
        </h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {selectedChannels.map((channel, index) => {
            const platform = getPlatformById(channel.id)
            const isConnected = platform?.account
            
            return (
              <div key={channel.id} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                border: '1px solid #e1e5e9',
                borderRadius: '8px',
                backgroundColor: 'white'
              }}>
                {/* Platform Info */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: '150px',
                  marginRight: '20px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    backgroundColor: platform?.color || '#ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    fontSize: '16px'
                  }}>
                    {platform?.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: '500', fontSize: '14px' }}>
                      {platform?.name}
                    </div>
                    {channel.postType && (
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>
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
                  gap: '12px'
                }}>
                  <input
                    type="date"
                    style={{
                      padding: '8px',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                  
                  <input
                    type="time"
                    style={{
                      padding: '8px',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />

                  <select
                    style={{
                      padding: '8px',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      fontSize: '14px',
                      minWidth: '120px'
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
      </div>
    )
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
        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '24px'
        }}>
          {[
            { key: 'media', label: 'Media' },
            { key: 'caption', label: 'Caption' },
            { key: 'date', label: 'Date' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 0',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                color: activeTab === tab.key ? '#007bff' : '#6c757d',
                borderBottom: activeTab === tab.key ? '2px solid #007bff' : '2px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
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

      {/* Tab Content */}
      {activeTab === 'media' && renderMediaView()}
      {activeTab === 'caption' && renderCaptionView()}
      {activeTab === 'date' && renderDateView()}
    </div>
  )
}

export default CrossChannelEditor