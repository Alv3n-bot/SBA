import React, { useState } from 'react'

const AssignmentBlock = ({
  block,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}) => {
  const [expanded, setExpanded] = useState(false)

  const submissionTypes = [
    { value: 'text', label: 'Text Submission' },
    { value: 'file', label: 'File Upload' },
    { value: 'link', label: 'URL Link' },
    { value: 'code', label: 'Code Submission' }
  ]

  const gradingMethods = [
    { value: 'teacher', label: 'Teacher (Manual grading)' },
    { value: 'ai', label: 'AI-Assisted (Fast, consistent)' },
    { value: 'peer', label: 'Peer Review (Students grade each other)' },
    { value: 'hybrid', label: 'Hybrid (AI + Peer review)' }
  ]

  const fileTypeOptions = [
    '.pdf', '.docx', '.pptx', '.xlsx', '.txt',
    '.html', '.css', '.js', '.zip', '.mp4'
  ]

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
          backgroundColor: '#fff3cd',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: expanded ? '1px solid #ddd' : 'none'
        }}
      >
        <div>
          <h4 style={{ margin: 0, fontSize: '16px' }}>
            📋 ASSIGNMENT BLOCK {expanded ? '▼' : '▶'}
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
          {/* Title */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Assignment Title *
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
              placeholder="e.g., Build Your First HTML Page"
            />
          </div>

          {/* Instructions */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Instructions *
            </label>
            <textarea
              value={block.instructions || ''}
              onChange={(e) => onUpdate({ instructions: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                minHeight: '100px',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
              placeholder="Detailed instructions for the assignment..."
            />
          </div>

          {/* Points & Due Date */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Points
              </label>
              <input
                type="number"
                min="0"
                value={block.points || 100}
                onChange={(e) => onUpdate({ points: parseInt(e.target.value) || 0 })}
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
                Due Date
              </label>
              <input
                type="date"
                value={block.dueDate || ''}
                onChange={(e) => onUpdate({ dueDate: e.target.value })}
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

          <hr style={{ margin: '15px 0', borderColor: '#ddd' }} />

          {/* Submission Type */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Submission Type
            </label>
            <select
              value={block.submissionType || 'file'}
              onChange={(e) => onUpdate({ submissionType: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              {submissionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload Options */}
          {block.submissionType === 'file' && (
            <div style={{
              marginBottom: '15px',
              padding: '10px',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>
                  Allowed File Types (comma-separated)
                </label>
                <input
                  type="text"
                  value={(block.allowedFileTypes || []).join(', ')}
                  onChange={(e) => onUpdate({
                    allowedFileTypes: e.target.value.split(',').map(t => t.trim())
                  })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g., .pdf, .docx, .html"
                />
                <small style={{ color: '#666', display: 'block', marginTop: '3px' }}>
                  Common types: {fileTypeOptions.join(', ')}
                </small>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>
                  Max File Size (MB)
                </label>
                <input
                  type="number"
                  min="1"
                  value={block.maxFileSize || 10}
                  onChange={(e) => onUpdate({ maxFileSize: parseInt(e.target.value) || 10 })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}

          <hr style={{ margin: '15px 0', borderColor: '#ddd' }} />

          {/* Grading Method */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Grading Method
            </label>
            {gradingMethods.map(method => (
              <label
                key={method.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <input
                  type="radio"
                  name="gradingMethod"
                  value={method.value}
                  checked={block.gradingMethod === method.value}
                  onChange={(e) => onUpdate({ gradingMethod: e.target.value })}
                />
                {method.label}
              </label>
            ))}
          </div>

          {/* Grading Rubric */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Grading Rubric (breakdown criteria & points)
            </label>
            <textarea
              value={block.rubric || ''}
              onChange={(e) => onUpdate({ rubric: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '13px',
                minHeight: '80px',
                fontFamily: 'monospace',
                boxSizing: 'border-box'
              }}
              placeholder="Example:&#10;Code Quality: 30 points&#10;Functionality: 40 points&#10;Creativity: 30 points"
            />
          </div>

          {/* AI Grading Prompt */}
          {(block.gradingMethod === 'ai' || block.gradingMethod === 'hybrid') && (
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>
                AI Grading Instructions
              </label>
              <textarea
                value={block.aiGradingPrompt || ''}
                onChange={(e) => onUpdate({ aiGradingPrompt: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '13px',
                  minHeight: '60px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
                placeholder="Tell AI how to grade this assignment. Include specific criteria..."
              />
            </div>
          )}

          {/* Peer Review Options */}
          {(block.gradingMethod === 'peer' || block.gradingMethod === 'hybrid') && (
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>
                Number of Peer Reviews Required
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={block.peerReviewCount || 3}
                onChange={(e) => onUpdate({ peerReviewCount: parseInt(e.target.value) || 3 })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <hr style={{ margin: '15px 0', borderColor: '#ddd' }} />

          {/* Late Submission Settings */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={block.allowLateSubmission !== false}
                onChange={(e) => onUpdate({ allowLateSubmission: e.target.checked })}
              />
              <span style={{ fontWeight: 'bold' }}>Allow Late Submissions</span>
            </label>

            {block.allowLateSubmission !== false && (
              <div style={{
                paddingLeft: '24px',
                padding: '8px',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px'
              }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>
                  Penalty per Day (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={block.latePenalty || 10}
                  onChange={(e) => onUpdate({ latePenalty: parseInt(e.target.value) || 10 })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AssignmentBlock