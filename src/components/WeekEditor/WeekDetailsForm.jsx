import React from 'react'

const WeekDetailsForm = ({
  title,
  description,
  learningObjectives,
  onTitleChange,
  onDescriptionChange,
  onObjectiveAdd,
  onObjectiveUpdate,
  onObjectiveRemove
}) => {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Week Details</h3>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Week Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
          placeholder="e.g., Introduction to HTML"
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            minHeight: '80px',
            fontFamily: 'inherit',
            boxSizing: 'border-box'
          }}
          placeholder="Brief description of what students will learn this week..."
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          Learning Objectives
        </label>
        {learningObjectives.map((objective, index) => (
          <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
            <input
              type="text"
              value={objective}
              onChange={(e) => onObjectiveUpdate(index, e.target.value)}
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="e.g., Understand HTML structure"
            />
            <button
              onClick={() => onObjectiveRemove(index)}
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
              ×
            </button>
          </div>
        ))}
        <button
          onClick={onObjectiveAdd}
          style={{
            padding: '8px 15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            marginTop: '5px'
          }}
        >
          + Add Objective
        </button>
      </div>
    </div>
  )
}

export default WeekDetailsForm