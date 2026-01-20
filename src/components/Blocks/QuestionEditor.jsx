import React, { useState } from 'react'

const QuestionEditor = ({ question, questionNumber, onUpdate, onDelete }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '4px',
      marginBottom: '10px',
      backgroundColor: 'white'
    }}>
      {/* Question Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '10px',
          backgroundColor: '#f0f0f0',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: expanded ? '1px solid #ddd' : 'none'
        }}
      >
        <div style={{ fontSize: '14px' }}>
          <strong>Question {questionNumber}</strong> {expanded ? '▼' : '▶'}
          {question.question && (
            <div style={{ color: '#666', marginTop: '3px' }}>
              {question.question.substring(0, 50)}...
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          style={{
            padding: '5px 8px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Delete
        </button>
      </div>

      {/* Question Content */}
      {expanded && (
        <div style={{ padding: '15px' }}>
          {/* Question Text */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>
              Question Text *
            </label>
            <textarea
              value={question.question || ''}
              onChange={(e) => onUpdate({ question: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '13px',
                minHeight: '50px',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
              placeholder="Enter your question here..."
            />
          </div>

          {/* Points */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>
              Points
            </label>
            <input
              type="number"
              min="1"
              value={question.points || 1}
              onChange={(e) => onUpdate({ points: parseInt(e.target.value) || 1 })}
              style={{
                width: '80px',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '13px'
              }}
            />
          </div>

          {/* Options */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>
              Answer Options
            </label>
            {question.options && question.options.map((option, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <input
                  type="radio"
                  name={`correct_${question.id}`}
                  checked={question.correctAnswer === index}
                  onChange={() => onUpdate({ correctAnswer: index })}
                  style={{ cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={option || ''}
                  onChange={(e) => {
                    const updated = [...question.options]
                    updated[index] = e.target.value
                    onUpdate({ options: updated })
                  }}
                  style={{
                    flex: 1,
                    padding: '6px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                />
                {question.options.length > 2 && (
                  <button
                    onClick={() => {
                      const updated = question.options.filter((_, i) => i !== index)
                      onUpdate({ options: updated })
                    }}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={() => {
                onUpdate({ options: [...(question.options || []), ''] })
              }}
              style={{
                padding: '6px 10px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px',
                marginTop: '5px'
              }}
            >
              + Add Option
            </button>
          </div>

          {/* Explanation */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '13px' }}>
              Explanation (Optional)
            </label>
            <textarea
              value={question.explanation || ''}
              onChange={(e) => onUpdate({ explanation: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '13px',
                minHeight: '40px',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
              placeholder="Explain why this is the correct answer (shown to students after answering)"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default QuestionEditor