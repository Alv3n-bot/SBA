import React, { useState } from 'react'
import { updateWeek } from '../../services/courseService'
import WeekDetailsForm from './WeekDetailsForm'
import BlocksList from './BlocksList'
import BlockMenu from '../Blocks/BlockMenu'

const WeekEditor = ({ week, courseId, onSave, onCancel }) => {
  const [title, setTitle] = useState(week.title)
  const [description, setDescription] = useState(week.description || '')
  const [learningObjectives, setLearningObjectives] = useState(week.learningObjectives || [])
  const [blocks, setBlocks] = useState(week.blocks || [])
  const [showBlockMenu, setShowBlockMenu] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleAddBlock = (blockType) => {
    const newBlock = {
      id: `block_${Date.now()}`,
      type: blockType,
      order: blocks.length + 1,
      createdAt: new Date().toISOString(),
      // Type-specific default fields
      ...(blockType === 'text' && { content: '' }),
      ...(blockType === 'video' && { title: '', url: '', description: '', duration: '' }),
      ...(blockType === 'file' && { title: '', url: '', description: '', fileType: '', fileSize: '' }),
      ...(blockType === 'quiz' && {
        title: '',
        description: '',
        passingScore: 70,
        timeLimit: null,
        shuffleQuestions: false,
        shuffleOptions: true,
        questions: [],
        totalPoints: 0
      }),
      ...(blockType === 'assignment' && {
        title: '',
        instructions: '',
        points: 100,
        dueDate: '',
        submissionType: 'file',
        allowedFileTypes: ['.pdf', '.docx'],
        maxFileSize: 10,
        gradingMethod: 'teacher',
        rubric: '',
        aiGradingPrompt: '',
        peerReviewCount: 3,
        allowLateSubmission: true,
        latePenalty: 10
      }),
      ...(blockType === 'exam' && {
        title: '',
        description: '',
        examType: 'mixed',
        passingScore: 75,
        timeLimit: 60,
        availableFrom: '',
        availableTo: '',
        attempts: 2,
        shuffleQuestions: true,
        questions: [],
        totalPoints: 0
      })
    }
    setBlocks([...blocks, newBlock])
    setShowBlockMenu(false)
  }

  const handleUpdateBlock = (blockId, updates) => {
    setBlocks(blocks.map(b => b.id === blockId ? { ...b, ...updates } : b))
  }

  const handleDeleteBlock = (blockId) => {
    if (window.confirm('Delete this block?')) {
      setBlocks(blocks.filter(b => b.id !== blockId))
    }
  }

  const handleMoveBlock = (blockId, direction) => {
    const currentIndex = blocks.findIndex(b => b.id === blockId)
    
    if (direction === 'up' && currentIndex === 0) return
    if (direction === 'down' && currentIndex === blocks.length - 1) return

    const newBlocks = [...blocks]
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    [newBlocks[currentIndex], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[currentIndex]]
    
    // Update order numbers
    newBlocks.forEach((block, index) => {
      block.order = index + 1
    })
    
    setBlocks(newBlocks)
  }

  const handleAddObjective = () => {
    setLearningObjectives([...learningObjectives, ''])
  }

  const handleUpdateObjective = (index, value) => {
    const updated = [...learningObjectives]
    updated[index] = value
    setLearningObjectives(updated)
  }

  const handleRemoveObjective = (index) => {
    setLearningObjectives(learningObjectives.filter((_, i) => i !== index))
  }

  const validateWeek = () => {
    const errors = []
    
    if (!title.trim()) {
      errors.push('Week title is required')
    }
    
    blocks.forEach((block, index) => {
      if (block.type === 'text' && !block.content?.trim()) {
        errors.push(`Text block ${index + 1} is empty`)
      }
      
      if (block.type === 'video' && !block.url?.trim()) {
        errors.push(`Video block ${index + 1} has no URL`)
      }
      
      if (block.type === 'quiz') {
        if (!block.questions || block.questions.length === 0) {
          errors.push(`Quiz "${block.title || 'Untitled'}" has no questions`)
        }
        
        block.questions?.forEach((q, qIndex) => {
          if (!q.question?.trim()) {
            errors.push(`Quiz "${block.title}" - Question ${qIndex + 1} is empty`)
          }
          if (!q.options || q.options.filter(o => o?.trim()).length < 2) {
            errors.push(`Quiz "${block.title}" - Question ${qIndex + 1} needs at least 2 options`)
          }
          if (q.correctAnswer === null || q.correctAnswer === undefined) {
            errors.push(`Quiz "${block.title}" - Question ${qIndex + 1} has no correct answer`)
          }
        })
      }
      
      if (block.type === 'assignment') {
        if (!block.title?.trim()) {
          errors.push(`Assignment ${index + 1} needs a title`)
        }
        if (!block.instructions?.trim()) {
          errors.push(`Assignment "${block.title}" needs instructions`)
        }
      }
    })
    
    return errors
  }

  const handleSave = async () => {
    const errors = validateWeek()
    if (errors.length > 0) {
      setError('Please fix these errors:\n\n' + errors.join('\n'))
      return
    }

    try {
      setSaving(true)
      setError(null)
      
      // Calculate total points for quizzes/exams
      const updatedBlocks = blocks.map(block => {
        if (block.type === 'quiz' || block.type === 'exam') {
          const totalPoints = block.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0
          return { ...block, totalPoints }
        }
        return block
      })

      await updateWeek(courseId, week.id, {
        title,
        description,
        learningObjectives: learningObjectives.filter(o => o.trim()),
        blocks: updatedBlocks
      })

      alert('Week saved successfully!')
      onSave()
    } catch (err) {
      setError('Failed to save week: ' + err.message)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'white',
      overflowY: 'auto',
      zIndex: 1000
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #ddd',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: 0 }}>Edit Week {week.weekNumber}</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            style={{
              padding: '10px 20px',
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
      </div>

      {/* Content */}
      <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            color: '#721c24',
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '20px',
            whiteSpace: 'pre-wrap'
          }}>
            {error}
          </div>
        )}

        <WeekDetailsForm
          title={title}
          description={description}
          learningObjectives={learningObjectives}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onObjectiveAdd={handleAddObjective}
          onObjectiveUpdate={handleUpdateObjective}
          onObjectiveRemove={handleRemoveObjective}
        />

        <div style={{ marginTop: '40px' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>Content Blocks</h3>

          <BlocksList
            blocks={blocks}
            courseId={courseId}
            weekId={week.id}
            onUpdateBlock={handleUpdateBlock}
            onDeleteBlock={handleDeleteBlock}
            onMoveBlock={handleMoveBlock}
          />

          <div style={{ marginTop: '20px', position: 'relative' }}>
            <button
              onClick={() => setShowBlockMenu(!showBlockMenu)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              + Add Content Block ▼
            </button>

            {showBlockMenu && (
              <BlockMenu
                onSelectBlock={handleAddBlock}
                onClose={() => setShowBlockMenu(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeekEditor