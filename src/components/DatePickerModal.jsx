import { useState, useEffect } from 'react'

const DatePickerModal = ({ isOpen, onClose, onSelect, initialDate = '', initialTime = '11:30' }) => {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('11:30')
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(initialDate)
      setSelectedTime(initialTime)
      // Reset to current month/year when opening if no initial date
      if (!initialDate) {
        const today = new Date()
        setCurrentMonth(today.getMonth())
        setCurrentYear(today.getFullYear())
      } else {
        // Set to the month/year of the initial date
        const initialDateObj = new Date(initialDate)
        setCurrentMonth(initialDateObj.getMonth())
        setCurrentYear(initialDateObj.getFullYear())
      }
    }
  }, [isOpen, initialDate, initialTime])

  if (!isOpen) return null

  const handleSelect = () => {
    onSelect(selectedDate, selectedTime)
    onClose()
  }

  const handleBackdropClick = () => {
    onClose()  // Always just close when clicking outside
  }

  const today = new Date()
  const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // Month navigation functions
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  // Generate calendar for selected month/year
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
      const dayDate = new Date(currentYear, currentMonth, day)
      const isSelected = selectedDate === dateString
      const isToday = dateString === todayDateString
      const isPast = dayDate < today && !isToday
      const isFuture = dayDate > today
      const isClickable = !isPast

      let backgroundColor = 'transparent'
      let color = '#495057'
      let cursor = 'pointer'
      let hoverColor = '#f8f9fa'

      if (isSelected) {
        backgroundColor = '#007bff'
        color = 'white'
      } else if (isToday) {
        backgroundColor = '#28a745'
        color = 'white'
      } else if (isPast) {
        color = '#adb5bd'
        cursor = 'not-allowed'
        hoverColor = 'transparent'
      } else if (isFuture) {
        color = '#495057'
        hoverColor = '#e3f2fd'
      }

      currentWeek.push(
        <div
          key={day}
          className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${isPast ? 'past' : ''} ${isFuture ? 'future' : ''}`}
          onClick={() => {
            if (isClickable) {
              setSelectedDate(dateString)
            }
          }}
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: cursor,
            borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: backgroundColor,
            color: color,
            fontWeight: isToday ? '700' : isSelected ? '600' : '400',
            transition: 'all 0.2s ease',
            border: isToday && !isSelected ? '2px solid #28a745' : '2px solid transparent',
            opacity: isPast ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (!isSelected && isClickable) {
              e.target.style.backgroundColor = hoverColor
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected && isClickable) {
              e.target.style.backgroundColor = backgroundColor
            }
          }}
          title={
            isToday ? 'Today' :
            isPast ? 'Past date (cannot select)' :
            'Available date'
          }
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
    <div
      style={{
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
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          width: '320px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <button
            onClick={goToPreviousMonth}
            style={{
              background: 'none',
              border: '1px solid #dee2e6',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#495057',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f8f9fa'
              e.target.style.borderColor = '#adb5bd'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.borderColor = '#dee2e6'
            }}
            title="Previous month"
          >
            ‹
          </button>

          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#495057',
            minWidth: '180px',
            textAlign: 'center'
          }}>
            {monthNames[currentMonth]} {currentYear}
          </h3>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={goToNextMonth}
              style={{
                background: 'none',
                border: '1px solid #dee2e6',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontSize: '16px',
                color: '#495057',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f8f9fa'
                e.target.style.borderColor = '#adb5bd'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent'
                e.target.style.borderColor = '#dee2e6'
              }}
              title="Next month"
            >
              ›
            </button>

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
              title="Close"
            >
              ✕
            </button>
          </div>
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