import React from 'react'

const BlockMenu = ({ onSelectBlock, onClose }) => {
  const blockTypes = [
    { type: 'text', icon: '📝', label: 'Text' },
    { type: 'video', icon: '🎥', label: 'Video' },
    { type: 'file', icon: '📄', label: 'File/Resource' },
    { type: 'quiz', icon: '✅', label: 'Quiz' },
    { type: 'assignment', icon: '📋', label: 'Assignment' },
    { type: 'exam', icon: '🧪', label: 'Exam' }
  ]

  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: '5px',
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '4px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
      minWidth: '200px',
      zIndex: 100
    }}>
      {blockTypes.map(item => (
        <button
          key={item.type}
          onClick={() => {
            onSelectBlock(item.type)
            onClose()
          }}
          style={{
            display: 'block',
            width: '100%',
            padding: '12px 15px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            textAlign: 'left',
            fontSize: '14px',
            borderBottom: '1px solid #eee',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          {item.icon} {item.label}
        </button>
      ))}
    </div>
  )
}

export default BlockMenu