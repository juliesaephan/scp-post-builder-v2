import { useState } from 'react'
import './App.css'
import PostBuilderModal from './components/PostBuilderModal'
import Toast from './components/Toast'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const handlePostSaved = (status) => {
    const messages = {
      draft: 'Post saved as draft successfully!',
      scheduled: 'Post scheduled successfully!',
      published: 'Post published successfully!'
    }
    addToast(messages[status] || messages.draft, 'success')
  }

  return (
    <div style={{
      padding: '20px',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-secondary)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: 'var(--text-primary)'
    }}>
      <h1>SCP Post Builder Prototype</h1>
      <p>Bestie's Bakes Social Media Manager</p>

      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          padding: '12px 24px',
          backgroundColor: 'var(--button-bg-primary)',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Create New Post
      </button>

      {isModalOpen && (
        <PostBuilderModal 
          onClose={() => setIsModalOpen(false)} 
          onPostSaved={handlePostSaved}
        />
      )}

      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 10000
      }}>
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{
              marginBottom: '10px',
              transform: `translateY(${index * 60}px)`
            }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
