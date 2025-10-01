import { useState, useEffect } from 'react'

const Toast = ({ message, type = 'success', duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => {
        setIsVisible(false)
        onClose()
      }, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const getToastStyles = () => {
    const baseStyles = {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '16px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      minWidth: '320px',
      transform: isExiting ? 'translateX(100%)' : 'translateX(0)',
      opacity: isExiting ? 0 : 1,
      transition: 'all 0.3s ease-in-out'
    }

    const typeStyles = {
      success: {
        backgroundColor: 'var(--bg-tertiary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-primary)'
      },
      error: {
        backgroundColor: 'var(--bg-tertiary)',
        color: 'var(--text-error)',
        border: '1px solid var(--border-primary)'
      },
      info: {
        backgroundColor: 'var(--bg-tertiary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-primary)'
      }
    }

    return { ...baseStyles, ...typeStyles[type] }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'info':
        return 'ℹ️'
      default:
        return '✅'
    }
  }

  return (
    <div style={getToastStyles()}>
      <span style={{ fontSize: '18px' }}>{getIcon()}</span>
      <span>{message}</span>
      <button
        onClick={() => {
          setIsExiting(true)
          setTimeout(() => {
            setIsVisible(false)
            onClose()
          }, 300)
        }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          color: 'inherit',
          opacity: 0.7,
          marginLeft: 'auto'
        }}
      >
        ✕
      </button>
    </div>
  )
}

export default Toast