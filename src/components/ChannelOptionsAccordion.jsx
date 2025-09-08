import { useState } from 'react'

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
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: disabled ? '#f8f9fa' : 'white',
              color: disabled ? '#6c757d' : 'inherit'
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
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: disabled ? '#f8f9fa' : 'white',
              color: disabled ? '#6c757d' : 'inherit'
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
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: disabled ? '#f8f9fa' : 'white',
              color: disabled ? '#6c757d' : 'inherit'
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
          color: disabled ? '#6c757d' : 'inherit'
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
  if (!platform.options || platform.options.length === 0) {
    return null
  }

  return (
    <div style={{
      border: '3px solid #ff0000', // TEMP: Make it very visible
      borderRadius: '8px',
      backgroundColor: '#ffebee', // TEMP: Light red background
      marginBottom: '16px',
      overflow: 'hidden',
      minHeight: '60px' // TEMP: Ensure it takes up space
    }}>
      {/* Accordion Header */}
      <div 
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          backgroundColor: '#f8f9fa',
          cursor: 'pointer',
          borderBottom: isExpanded ? '1px solid #e1e5e9' : 'none'
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
            {platform.icon}
          </div>
          <span style={{ 
            fontWeight: '500', 
            fontSize: '14px' 
          }}>
            {platform.name} options
          </span>
        </div>
        
        <span style={{
          fontSize: '12px',
          color: '#6c757d',
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