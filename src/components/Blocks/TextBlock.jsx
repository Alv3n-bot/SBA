import React, { useState } from 'react'

const TextBlock = ({ block, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#f9f9f9'
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '15px',
          backgroundColor: '#e8f5e9',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: expanded ? '1px solid #ddd' : 'none'
        }}
      >
        <h4 style={{ margin: 0 }}>📝 TEXT BLOCK {expanded ? '▼' : '▶'}</h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={(e) => { e.stopPropagation(); onMoveUp() }} disabled={isFirst}
            style={{ padding: '6px 10px', backgroundColor: isFirst ? '#ccc' : '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>↑</button>
          <button onClick={(e) => { e.stopPropagation(); onMoveDown() }} disabled={isLast}
            style={{ padding: '6px 10px', backgroundColor: isLast ? '#ccc' : '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>↓</button>
          <button onClick={(e) => { e.stopPropagation(); onDelete() }}
            style={{ padding: '6px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
        </div>
      </div>
      {expanded && (
        <div style={{ padding: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Content</label>
          <textarea
            value={block.content || ''}
            onChange={(e) => onUpdate({ content: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              minHeight: '120px',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
            placeholder="Enter text content here..."
          />
        </div>
      )}
    </div>
  )
}

export default TextBlock