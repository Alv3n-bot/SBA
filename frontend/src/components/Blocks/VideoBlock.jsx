import React, { useState } from 'react'

const VideoBlock = ({ block, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) => {
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
          backgroundColor: '#e3f2fd',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: expanded ? '1px solid #ddd' : 'none'
        }}
      >
        <h4 style={{ margin: 0 }}>🎥 VIDEO BLOCK {expanded ? '▼' : '▶'}</h4>
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
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Video Title</label>
            <input type="text" value={block.title || ''} onChange={(e) => onUpdate({ title: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
              placeholder="e.g., HTML Basics Tutorial" />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>YouTube/Video URL *</label>
            <input type="url" value={block.url || ''} onChange={(e) => onUpdate({ url: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
              placeholder="https://youtube.com/watch?v=..." />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description</label>
            <textarea value={block.description || ''} onChange={(e) => onUpdate({ description: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', minHeight: '60px', fontFamily: 'inherit', boxSizing: 'border-box' }}
              placeholder="Brief description of the video..." />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Duration (e.g., 15:30)</label>
            <input type="text" value={block.duration || ''} onChange={(e) => onUpdate({ duration: e.target.value })}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
              placeholder="15:30" />
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoBlock