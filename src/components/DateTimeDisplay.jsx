import { useState } from 'react'
import DatePickerModal from './DatePickerModal'

const DateTimeDisplay = ({
  date = '',
  time = '11:30',
  onDateTimeChange,
  placeholder = 'Select date',
  style = {},
  onRemoveDate
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false)

  const formatDisplayText = () => {
    if (!date) return placeholder

    // Parse date components to avoid timezone issues
    const [year, month, day] = date.split('-').map(num => parseInt(num))
    const dateObj = new Date(year, month - 1, day)

    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
    const formattedDate = dateObj.toLocaleDateString('en-US', options)

    // Convert 24-hour time to 12-hour format
    const [hours, minutes] = time.split(':')
    const hour12 = parseInt(hours) % 12 || 12
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM'
    const formattedTime = `${hour12}:${minutes} ${ampm}`

    return `${formattedDate} at ${formattedTime}`
  }

  const handleDateTimeSelect = (selectedDate, selectedTime) => {
    onDateTimeChange(selectedDate, selectedTime)
  }

  const handleRemoveDate = (e) => {
    e.stopPropagation()
    if (onRemoveDate) {
      onRemoveDate()
    }
  }

  return (
    <>
      <div
        onClick={() => setShowDatePicker(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          backgroundColor: '#fff',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          minHeight: '20px',
          fontSize: '14px',
          color: date ? '#495057' : '#6c757d',
          position: 'relative',
          ...style
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = '#62759F'
          e.target.style.backgroundColor = '#f8f9fa'
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = '#dee2e6'
          e.target.style.backgroundColor = '#fff'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '8px' }}>📅</span>
          <span>{formatDisplayText()}</span>
        </div>

        {date && onRemoveDate && (
          <button
            onClick={handleRemoveDate}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#dc3545',
              fontSize: '14px',
              padding: '2px 4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Remove date"
          >
            ✕
          </button>
        )}
      </div>

      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={handleDateTimeSelect}
        initialDate={date}
        initialTime={time}
      />
    </>
  )
}

export default DateTimeDisplay