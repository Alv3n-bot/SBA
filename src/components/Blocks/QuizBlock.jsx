import React, { useState } from 'react'
import QuestionEditor from './QuestionEditor'

const QuizBlock = ({
  block,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}) => {
  const [expanded, setExpanded] = useState(false)
  const [showNewQuestion, setShowNewQuestion] = useState(false)

  const handleAddQuestion = () => {
    const newQuestion = {
      id: `q_${Date.now()}`,
      question: '',
      type: 'multiple-choice',
      points: 1,
      options: ['', '', '', ''],
      correctAnswer: null,
      explanation: ''
    }
    onUpdate({
      questions: [...(block.questions || []), newQuestion]
    })
    setShowNewQuestion(false)
  }

  const handleUpdateQuestion = (questionId, updates) => {
    const updatedQuestions = block.questions.map(q =>
      q.id === questionId ? { ...q, ...updates } : q
    )
    onUpdate({ questions: updatedQuestions })
  }

  const handleDeleteQuestion = (questionId) => {
    if (window.confirm('Delete this question?')) {
      onUpdate({
        questions: block.questions.filter(q => q.id !== questionId)
      })
    }
  }

  const totalPoints = block.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: '#f9f9f9'
    }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '15px',
          backgroundColor: '#e7f3ff',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: expanded ? '1px solid #ddd' : 'none'
        }}
      >
        <div>
          <h4 style={{ margin: 0, fontSize: '16px' }}>
            ✅ QUIZ BLOCK {expanded ? '▼' : '▶'}
          </h4>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMoveUp()
            }}
            disabled={isFirst}
            style={{
              padding: '6px 10px',
              backgroundColor: isFirst ? '#ccc' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ↑
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMoveDown()
            }}
            disabled={isLast}
            style={{
              padding: '6px 10px',
              backgroundColor: isLast ? '#ccc' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ↓
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            style={{
              padding: '6px 10px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div style={{ padding: '20px' }}>
          {/* Quiz Title */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Quiz Title *
            </label>
            <input
              type="text"
              value={block.title || ''}
              onChange={(e) => onUpdate({ title: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="e.g., HTML Fundamentals Quiz"
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Description
            </label>
            <textarea
              value={block.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                minHeight: '60px',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
              placeholder="Optional description for the quiz"
            />
          </div>

          {/* Settings Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Passing Score (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={block.passingScore || 70}
                onChange={(e) => onUpdate({ passingScore: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Time Limit (minutes, optional)
              </label>
              <input
                type="number"
                min="0"
                value={block.timeLimit || ''}
                onChange={(e) => onUpdate({ timeLimit: e.target.value ? parseInt(e.target.value) : null })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={block.shuffleQuestions || false}
                onChange={(e) => onUpdate({ shuffleQuestions: e.target.checked })}
              />
              <span>Shuffle questions</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={block.shuffleOptions !== false}
                onChange={(e) => onUpdate({ shuffleOptions: e.target.checked })}
              />
              <span>Shuffle answer options</span>
            </label>
          </div>

          <hr style={{ margin: '15px 0', borderColor: '#ddd' }} />

          {/* Questions Section */}
          <h4 style={{ marginTop: '15px', marginBottom: '15px' }}>Questions ({block.questions?.length || 0})</h4>

          {block.questions && block.questions.map((question, index) => (
            <QuestionEditor
              key={question.id}
              question={question}
              questionNumber={index + 1}
              onUpdate={(updates) => handleUpdateQuestion(question.id, updates)}
              onDelete={() => handleDeleteQuestion(question.id)}
            />
          ))}

          {/* Add Question Button */}
          {!showNewQuestion ? (
            <button
              onClick={() => setShowNewQuestion(true)}
              style={{
                padding: '10px 15px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                marginTop: '10px'
              }}
            >
              + Add Question
            </button>
          ) : (
            <div style={{
              border: '1px solid #28a745',
              borderRadius: '4px',
              padding: '10px',
              backgroundColor: '#f0f8f5',
              marginTop: '10px'
            }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Add a new question:</p>
              <button
                onClick={handleAddQuestion}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginRight: '8px'
                }}
              >
                Create Question
              </button>
              <button
                onClick={() => setShowNewQuestion(false)}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Total Points */}
          <div style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#e8f5e9',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}>
            Total Points: {totalPoints}
          </div>
        </div>
      )}
    </div>
  )
}

export default QuizBlock