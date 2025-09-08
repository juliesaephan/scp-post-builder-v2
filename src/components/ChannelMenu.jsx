import { useState, useRef, useEffect } from 'react'
import { platforms } from '../data/platforms'

const ChannelMenu = ({ selectedChannels, onChannelToggle, onPostTypeSelect, onClose, buttonRef }) => {
  const [activeSubmenu, setActiveSubmenu] = useState(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0, left: 0 })
  const menuRef = useRef(null)
  const submenuRef = useRef(null)

  // Calculate menu position based on button position
  useEffect(() => {
    if (buttonRef?.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect()
      const menuWidth = 280
      const menuHeight = 400
      
      // Position menu above and aligned to right edge of button
      setMenuPosition({
        top: buttonRect.top - menuHeight - 8,
        left: buttonRect.right - menuWidth
      })
    }
  }, [buttonRef])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the main menu
      const clickedOutsideMenu = menuRef.current && !menuRef.current.contains(event.target)
      
      // Check if the click is outside the submenu (if it exists)
      const clickedOutsideSubmenu = !submenuRef.current || !submenuRef.current.contains(event.target)
      
      // Also check if the click was on the trigger button to avoid closing when opening
      const clickedOnButton = buttonRef?.current && buttonRef.current.contains(event.target)
      
      if (clickedOutsideMenu && clickedOutsideSubmenu && !clickedOnButton) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose, buttonRef])

  const isChannelSelected = (platformId) => {
    return selectedChannels.some(channel => channel.id === platformId)
  }

  const getSelectedPostType = (platformId) => {
    const channel = selectedChannels.find(channel => channel.id === platformId)
    return channel?.postType || null
  }

  const handleChannelClick = (platform, event) => {
    if (platform.types && platform.types.length > 0) {
      // Multi-type platform - open submenu
      const isOpening = activeSubmenu !== platform.id
      setActiveSubmenu(activeSubmenu === platform.id ? null : platform.id)
      
      if (isOpening && event?.currentTarget) {
        // Calculate submenu position
        const itemRect = event.currentTarget.getBoundingClientRect()
        const submenuWidth = 160
        const submenuHeight = 120
        
        // Position submenu to the left of the menu to avoid horizontal scroll
        setSubmenuPosition({
          top: itemRect.top,
          left: menuPosition.left - submenuWidth - 8
        })
      }
    } else {
      // Single-type platform - toggle directly
      onChannelToggle(platform.id, null)
      setActiveSubmenu(null)
    }
  }

  const handlePostTypeSelect = (platformId, postType) => {
    onPostTypeSelect(platformId, postType)
    // Keep submenu open as specified
  }

  const renderPlatformItem = (platform, isConnected) => {
    const selected = isChannelSelected(platform.id)
    const selectedType = getSelectedPostType(platform.id)
    const hasTypes = platform.types && platform.types.length > 0
    const showSubmenu = activeSubmenu === platform.id

    return (
      <div key={platform.id} style={{ position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            cursor: 'pointer',
            backgroundColor: showSubmenu ? '#f8f9fa' : 'transparent',
            borderRadius: '4px'
          }}
          onClick={(e) => handleChannelClick(platform, e)}
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={() => {}}
            style={{
              marginRight: '12px',
              cursor: 'pointer'
            }}
            onClick={(e) => {
              e.stopPropagation()
              if (!hasTypes) {
                onChannelToggle(platform.id, null)
              }
            }}
          />
          
          {/* Profile Picture with Social Icon Badge */}
          <div style={{ 
            position: 'relative', 
            marginRight: '12px',
            width: '32px',
            height: '32px'
          }}>
            {/* Mock Profile Picture */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              border: '2px solid #e1e5e9'
            }}>
              🧁
            </div>
            
            {/* Social Platform Badge */}
            <div style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: platform.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              border: '2px solid white',
              boxSizing: 'border-box'
            }}>
              {platform.icon}
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '500', fontSize: '14px' }}>
              {platform.name}
            </div>
            {selected && selectedType && (
              <div style={{ fontSize: '12px', color: '#6c757d' }}>
                {selectedType}
              </div>
            )}
          </div>
          
          {hasTypes && (
            <div style={{ 
              fontSize: '12px', 
              color: '#6c757d',
              transform: showSubmenu ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s'
            }}>
              ›
            </div>
          )}
        </div>

        {/* Submenu */}
        {showSubmenu && hasTypes && (
          <div
            ref={submenuRef}
            style={{
              position: 'fixed',
              top: submenuPosition.top,
              left: submenuPosition.left,
              width: '160px',
              backgroundColor: 'white',
              border: '1px solid #e1e5e9',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              zIndex: 10000,
              padding: '8px'
            }}
          >
            <div style={{
              fontSize: '12px',
              color: '#6c757d',
              padding: '8px 12px',
              fontWeight: '500'
            }}>
              Post Type
            </div>
            
            {platform.types.map(type => (
              <label
                key={type}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <input
                  type="radio"
                  name={`${platform.id}-type`}
                  checked={selectedType === type}
                  onChange={() => handlePostTypeSelect(platform.id, type)}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontSize: '14px' }}>{type}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: menuPosition.top,
        left: menuPosition.left,
        width: '280px',
        maxHeight: '400px',
        backgroundColor: 'white',
        border: '1px solid #e1e5e9',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        zIndex: 9999,
        overflow: 'auto'
      }}
    >
      {/* Connected Channels Section */}
      <div style={{ padding: '16px' }}>
        <div style={{
          fontSize: '12px',
          color: '#6c757d',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px'
        }}>
          My linked channels
        </div>
        
        {platforms.connected.map(platform => 
          renderPlatformItem(platform, true)
        )}
      </div>

      {/* Divider */}
      <div style={{
        height: '1px',
        backgroundColor: '#e1e5e9',
        margin: '0 16px'
      }} />

      {/* Unconnected Channels Section */}
      <div style={{ padding: '16px' }}>
        <div style={{
          fontSize: '12px',
          color: '#6c757d',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px'
        }}>
          More channels (Reminder only)
        </div>
        
        {platforms.unconnected.map(platform => 
          renderPlatformItem(platform, false)
        )}
      </div>
    </div>
  )
}

export default ChannelMenu