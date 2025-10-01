import React, { useState } from 'react'

const ChannelOptionField = ({ option, value, onChange, disabled = true }) => {
  const renderField = () => {
    switch (option.type) {
      case 'text':
      case 'url':
        return (
          <input
            type={option.type === 'url' ? 'url' : 'text'}
            value={value || ''}
            onChange={(e) => onChange(option.id, e.target.value)}
            placeholder={option.placeholder}
            disabled={disabled}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--border-secondary)',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: disabled ? 'var(--bg-secondary)' : 'var(--bg-primary)',
              color: disabled ? 'var(--text-secondary)' : 'var(--text-primary)'
            }}
          />
        )

      case 'toggle':
        return (
          <label style={{
            display: 'flex',
            alignItems: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1
          }}>
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(option.id, e.target.checked)}
              disabled={disabled}
              style={{
                marginRight: '8px'
              }}
            />
            <span style={{ fontSize: '14px' }}>Enable</span>
          </label>
        )
      
      case 'dropdown':
        return (
          <select
            value={value || option.defaultValue || ''}
            onChange={(e) => onChange(option.id, e.target.value)}
            disabled={disabled}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--border-secondary)',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: disabled ? 'var(--bg-secondary)' : 'var(--bg-primary)',
              color: disabled ? 'var(--text-secondary)' : 'var(--text-primary)'
            }}
          >
            {option.placeholder && (
              <option value="">{option.placeholder}</option>
            )}
            {option.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )
      
      case 'users':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(option.id, e.target.value)}
            placeholder={option.placeholder}
            disabled={disabled}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--border-secondary)',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: disabled ? 'var(--bg-secondary)' : 'var(--bg-primary)',
              color: disabled ? 'var(--text-secondary)' : 'var(--text-primary)'
            }}
          />
        )

      default:
        return null
    }
  }

  return (
    <div style={{
      marginBottom: '16px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '6px'
      }}>
        <span style={{ 
          fontSize: '16px', 
          marginRight: '8px' 
        }}>
          {option.icon}
        </span>
        <label style={{
          fontSize: '14px',
          fontWeight: '500',
          color: disabled ? 'var(--text-secondary)' : 'var(--text-primary)'
        }}>
          {option.label}
        </label>
      </div>
      {renderField()}
    </div>
  )
}

const ChannelOptionsAccordion = ({
  platform,
  isExpanded = false,
  onToggle,
  optionValues = {},
  onOptionChange,
  disabled = true
}) => {
  const IconComponent = platform?.icon

  if (!platform.options || platform.options.length === 0) {
    return null
  }

  return (
    <div style={{
      border: '1px solid var(--border-primary)',
      borderRadius: '8px',
      backgroundColor: 'var(--bg-primary)',
      marginBottom: '16px',
      overflow: 'hidden'
    }}>
      {/* Accordion Header */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          backgroundColor: 'var(--bg-secondary)',
          cursor: 'pointer',
          borderBottom: isExpanded ? '1px solid var(--border-primary)' : 'none'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '4px',
            backgroundColor: platform.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px'
          }}>
            {IconComponent && <IconComponent size={10} color="white" />}
          </div>
          <span style={{
            fontWeight: '500',
            fontSize: '14px',
            color: 'var(--text-primary)'
          }}>
            {platform.name} options
          </span>
        </div>

        <span style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}>
          ▼
        </span>
      </div>

      {/* Accordion Content */}
      {isExpanded && (
        <div style={{
          padding: '16px'
        }}>
          {platform.options.map(option => (
            <ChannelOptionField
              key={option.id}
              option={option}
              value={optionValues[option.id]}
              onChange={onOptionChange}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ChannelOptionsAccordion