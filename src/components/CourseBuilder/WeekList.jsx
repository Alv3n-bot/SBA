import React from 'react'
import WeekCard from './WeekCard'

const WeekList = ({ weeks, onEdit, onPreview, onDelete, onMove, disabled }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {weeks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No weeks yet. Click "Add New Week" to get started.
        </div>
      ) : (
        weeks.map((week, index) => (
          <WeekCard
            key={week.id}
            week={week}
            index={index}
            totalWeeks={weeks.length}
            onEdit={() => onEdit(week)}
            onPreview={() => onPreview(week)}
            onDelete={() => onDelete(week.id)}
            onMoveUp={() => onMove(week.id, 'up')}
            onMoveDown={() => onMove(week.id, 'down')}
            disabled={disabled}
          />
        ))
      )}
    </div>
  )
}

export default WeekList