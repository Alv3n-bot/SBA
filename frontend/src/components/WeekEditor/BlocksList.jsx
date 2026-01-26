import React from 'react'
import TextBlock from '../Blocks/TextBlock'
import VideoBlock from '../Blocks/VideoBlock'
import FileBlock from '../Blocks/FileBlock'
import QuizBlock from '../Blocks/QuizBlock'
import AssignmentBlock from '../Blocks/AssignmentBlock'
import ExamBlock from '../Blocks/ExamBlock'

const BlocksList = ({
  blocks,
  courseId,
  weekId,
  onUpdateBlock,
  onDeleteBlock,
  onMoveBlock
}) => {
  const renderBlock = (block) => {
    const commonProps = {
      block,
      onUpdate: (updates) => onUpdateBlock(block.id, updates),
      onDelete: () => onDeleteBlock(block.id),
      onMoveUp: () => onMoveBlock(block.id, 'up'),
      onMoveDown: () => onMoveBlock(block.id, 'down'),
      isFirst: blocks[0]?.id === block.id,
      isLast: blocks[blocks.length - 1]?.id === block.id
    }

    switch (block.type) {
      case 'text':
        return <TextBlock key={block.id} {...commonProps} />
      case 'video':
        return <VideoBlock key={block.id} {...commonProps} />
      case 'file':
        return <FileBlock key={block.id} {...commonProps} />
      case 'quiz':
        return <QuizBlock key={block.id} {...commonProps} />
      case 'assignment':
        return <AssignmentBlock key={block.id} {...commonProps} />
      case 'exam':
        return <ExamBlock key={block.id} {...commonProps} />
      default:
        return null
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {blocks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
          No content blocks yet. Add one to get started.
        </div>
      ) : (
        blocks.map(block => renderBlock(block))
      )}
    </div>
  )
}

export default BlocksList