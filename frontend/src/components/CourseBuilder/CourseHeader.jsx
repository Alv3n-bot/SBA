import React from 'react'

const CourseHeader = ({ course, onPublish, disabled }) => {
  if (!course) return null

  return (
    <div style={{
      borderBottom: '2px solid #007bff',
      paddingBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>
            {course.title}
          </h1>
          <p style={{ margin: '0', color: '#666' }}>
            Status: <strong>{course.status === 'published' ? '✓ Published' : 'Draft'}</strong>
          </p>
        </div>

        {course.status === 'draft' && (
          <button
            onClick={onPublish}
            disabled={disabled}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Publish Course
          </button>
        )}
      </div>
    </div>
  )
}

export default CourseHeader