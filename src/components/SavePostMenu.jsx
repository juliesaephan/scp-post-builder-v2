import { useState, useRef, useEffect } from 'react'

const SavePostMenu = ({
  onSaveAsDraft,
  onSchedule,
  onPostNow,
  onClose,
  buttonRef,
  schedulingButtonText,
  hasScheduledChannels,
  isLoading,
  hasValidationErrors = false
}) => {
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const menuRef = useRef(null)

  // Calculate menu position based on button position
  useEffect(() => {
    if (buttonRef?.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect()
      const menuWidth = 240
      const menuHeight = 180
      
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
      const clickedOutsideMenu = menuRef.current && !menuRef.current.contains(event.target)
      const clickedOnButton = buttonRef?.current && buttonRef.current.contains(event.target)
      
      if (clickedOutsideMenu && !clickedOnButton) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose, buttonRef])

  const handleOptionClick = (action, requiresValidation = false) => {
    if (isLoading) return
    if (requiresValidation && hasValidationErrors) return
    action()
  }

  const getScheduleSecondaryText = () => {
    if (hasValidationErrors) {
      return 'Fix content requirements first'
    }
    if (!hasScheduledChannels) {
      return 'Select date for all channels'
    }
    // Don't show the date in the schedule button - just indicate it's ready
    return 'Posts scheduled'
  }

  // Determine if schedule button should be disabled
  const isScheduleDisabled = isLoading || hasValidationErrors || !hasScheduledChannels

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: menuPosition.top,
        left: menuPosition.left,
        width: '240px',
        backgroundColor: 'white',
        border: '1px solid #e1e5e9',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        zIndex: 9999,
        overflow: 'hidden'
      }}
    >
      {/* Save as Draft */}
      <div
        onClick={() => handleOptionClick(onSaveAsDraft)}
        style={{
          padding: '16px 20px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          borderBottom: '1px solid #f8f9fa',
          opacity: isLoading ? 0.6 : 1,
          backgroundColor: 'transparent',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          if (!isLoading) e.target.style.backgroundColor = '#f8f9fa'
        }}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ fontSize: '20px' }}>📝</div>
          <div>
            <div style={{ 
              fontWeight: '500', 
              fontSize: '14px',
              color: '#495057'
            }}>
              Save as Draft
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#6c757d',
              marginTop: '2px'
            }}>
              Save without publishing
            </div>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div
        onClick={() => handleOptionClick(onSchedule, true)}
        style={{
          padding: '16px 20px',
          cursor: isScheduleDisabled ? 'not-allowed' : 'pointer',
          borderBottom: '1px solid #f8f9fa',
          opacity: isScheduleDisabled ? 0.6 : 1,
          backgroundColor: 'transparent',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          if (!isScheduleDisabled) e.target.style.backgroundColor = '#f8f9fa'
        }}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ fontSize: '20px' }}>📅</div>
          <div>
            <div style={{ 
              fontWeight: '500', 
              fontSize: '14px',
              color: '#495057'
            }}>
              Schedule
            </div>
            <div style={{
              fontSize: '12px',
              color: hasValidationErrors ? '#dc3545' : (hasScheduledChannels ? '#6c757d' : '#dc3545'),
              marginTop: '2px'
            }}>
              {getScheduleSecondaryText()}
            </div>
          </div>
        </div>
      </div>

      {/* Post Now */}
      <div
        onClick={() => handleOptionClick(onPostNow)}
        style={{
          padding: '16px 20px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.6 : 1,
          backgroundColor: 'transparent',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          if (!isLoading) e.target.style.backgroundColor = '#f8f9fa'
        }}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ fontSize: '20px' }}>🚀</div>
          <div>
            <div style={{ 
              fontWeight: '500', 
              fontSize: '14px',
              color: '#495057'
            }}>
              Post Now
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#6c757d',
              marginTop: '2px'
            }}>
              Publish immediately
            </div>
          </div>
        </div>
      </div>

      {/* Loading indicator overlay */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #e1e5e9',
            borderTopColor: '#62759F',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      )}
    </div>
  )
}

export default SavePostMenu