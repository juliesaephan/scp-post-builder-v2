import { useState, useEffect } from 'react'

const DatePickerModal = ({ isOpen, onClose, onSelect, initialDate = '', initialTime = '11:30' }) => {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('11:30')

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(initialDate)
      setSelectedTime(initialTime)
    }
  }, [isOpen, initialDate, initialTime])

  if (!isOpen) return null

  const handleSelect = () => {
    onSelect(selectedDate, selectedTime)
    onClose()
  }

  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()

  // Generate calendar for current month
  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
  const firstDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const renderCalendar = () => {
    const weeks = []
    let currentWeek = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const isSelected = selectedDate === dateString
      const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()

      currentWeek.push(
        <div
          key={day}
          className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
          onClick={() => setSelectedDate(dateString)}
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: isSelected ? '#007bff' : 'transparent',
            color: isSelected ? 'white' : isToday ? '#007bff' : '#495057',
            fontWeight: isToday ? '600' : '400',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!isSelected) {
              e.target.style.backgroundColor = '#f8f9fa'
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              e.target.style.backgroundColor = 'transparent'
            }
          }}
        >
          {day}
        </div>
      )

      if (currentWeek.length === 7) {
        weeks.push(
          <div key={`week-${weeks.length}`} style={{ display: 'flex', gap: '4px' }}>
            {currentWeek}
          </div>
        )
        currentWeek = []
      }
    }

    // Add remaining week if not complete
    if (currentWeek.length > 0) {
      weeks.push(
        <div key={`week-${weeks.length}`} style={{ display: 'flex', gap: '4px' }}>
          {currentWeek}
        </div>
      )
    }

    return weeks
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '320px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#495057'
          }}>
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '4px',
              color: '#6c757d'
            }}
          >
            ✕
          </button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
          {dayNames.map(day => (
            <div key={day} style={{
              width: '40px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600',
              color: '#6c757d'
            }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px' }}>
          {renderCalendar()}
        </div>

        {/* Time selector */}
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#495057',
            marginBottom: '8px'
          }}>
            Time
          </label>
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          />
        </div>

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#6c757d',
              border: '1px solid #dee2e6',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedDate}
            style={{
              padding: '8px 16px',
              backgroundColor: selectedDate ? '#007bff' : '#e9ecef',
              color: selectedDate ? 'white' : '#6c757d',
              border: 'none',
              borderRadius: '6px',
              cursor: selectedDate ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  )
}

export default DatePickerModal