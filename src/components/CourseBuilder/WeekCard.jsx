import React from 'react'

const WeekCard = ({
  week,
  index,
  totalWeeks,
  onEdit,
  onPreview,
  onDelete,
  onMoveUp,
  onMoveDown,
  disabled
}) => {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      backgroundColor: '#f9f9f9',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>
            📚 Week {week.weekNumber}: {week.title}
          </h3>
          {week.description && (
            <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
              {week.description}
            </p>
          )}
          <p style={{ margin: '5px 0', color: '#999', fontSize: '13px' }}>
            {week.blocks?.length || 0} content blocks
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onEdit}
            disabled={disabled}
            style={{
              padding: '8px 12px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Edit
          </button>

          <button
            onClick={onPreview}
            disabled={disabled}
            style={{
              padding: '8px 12px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Preview
          </button>

          <button
            onClick={onMoveUp}
            disabled={disabled || index === 0}
            style={{
              padding: '8px 10px',
              backgroundColor: index === 0 ? '#ccc' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: index === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            ↑
          </button>

          <button
            onClick={onMoveDown}
            disabled={disabled || index === totalWeeks - 1}
            style={{
              padding: '8px 10px',
              backgroundColor: index === totalWeeks - 1 ? '#ccc' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: index === totalWeeks - 1 ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            ↓
          </button>

          <button
            onClick={onDelete}
            disabled={disabled}
            style={{
              padding: '8px 12px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default WeekCard