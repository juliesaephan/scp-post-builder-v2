import { useState } from 'react'
import './App.css'
import PostBuilderModal from './components/PostBuilderModal'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div style={{ 
      padding: '20px', 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1>SCP Post Builder Prototype</h1>
      <p>Bestie's Bakes Social Media Manager</p>
      
      <button 
        onClick={() => setIsModalOpen(true)}
        style={{
          padding: '12px 24px',
          backgroundColor: '#007bff',
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
        <PostBuilderModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  )
}

export default App
