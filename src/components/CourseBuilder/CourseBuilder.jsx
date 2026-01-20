import React, { useState, useEffect } from 'react'
import {
  fetchWeeks,
  fetchCourse,
  createWeek,
  deleteWeek,
  reorderWeeks,
  publishCourse
} from '../../services/courseService'
import CourseHeader from './CourseHeader'
import WeekList from './WeekList'
import WeekEditor from '../WeekEditor/WeekEditor'
import StudentPreview from '../Preview/StudentPreview'

const CourseBuilder = ({ courseId, teacherId }) => {
  const [courseData, setCourseData] = useState(null)
  const [weeks, setWeeks] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingWeek, setEditingWeek] = useState(null)
  const [previewWeek, setPreviewWeek] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Load course and weeks
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const course = await fetchCourse(courseId)
        setCourseData(course)
        
        const weeksData = await fetchWeeks(courseId)
        setWeeks(weeksData)
      } catch (err) {
        setError('Failed to load course data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [courseId])

  const handleAddNewWeek = async () => {
    try {
      setSaving(true)
      const nextWeekNumber = weeks.length + 1
      const weekId = await createWeek(courseId, {
        weekNumber: nextWeekNumber,
        title: `Week ${nextWeekNumber}`,
        description: '',
        learningObjectives: []
      })
      
      // Refresh weeks
      const updatedWeeks = await fetchWeeks(courseId)
      setWeeks(updatedWeeks)
      
      // Open new week for editing
      const newWeek = updatedWeeks.find(w => w.id === weekId)
      setEditingWeek(newWeek)
    } catch (err) {
      setError('Failed to create week')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteWeek = async (weekId) => {
    if (!window.confirm('Are you sure you want to delete this week?')) return

    try {
      setSaving(true)
      await deleteWeek(courseId, weekId)
      setWeeks(weeks.filter(w => w.id !== weekId))
    } catch (err) {
      setError('Failed to delete week')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleMoveWeek = async (weekId, direction) => {
    const currentIndex = weeks.findIndex(w => w.id === weekId)
    
    if (direction === 'up' && currentIndex === 0) return
    if (direction === 'down' && currentIndex === weeks.length - 1) return

    try {
      setSaving(true)
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      const week1 = weeks[currentIndex]
      const week2 = weeks[targetIndex]

      await reorderWeeks(
        courseId,
        week1.id,
        week2.id,
        week2.weekNumber,
        week1.weekNumber
      )

      // Refresh weeks
      const updatedWeeks = await fetchWeeks(courseId)
      setWeeks(updatedWeeks)
    } catch (err) {
      setError('Failed to reorder weeks')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handlePublishCourse = async () => {
    if (weeks.length === 0) {
      alert('Please add at least one week before publishing')
      return
    }

    if (!window.confirm('Publish this course? Students will be able to access it.')) return

    try {
      setSaving(true)
      await publishCourse(courseId)
      const updatedCourse = await fetchCourse(courseId)
      setCourseData(updatedCourse)
      alert('Course published successfully!')
    } catch (err) {
      setError('Failed to publish course')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading course...</div>
  }

  if (editingWeek) {
    return (
      <WeekEditor
        week={editingWeek}
        courseId={courseId}
        onSave={() => {
          setEditingWeek(null)
          fetchWeeks(courseId).then(setWeeks)
        }}
        onCancel={() => setEditingWeek(null)}
      />
    )
  }

  if (previewWeek) {
    return (
      <StudentPreview
        week={previewWeek}
        onBack={() => setPreviewWeek(null)}
      />
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: '#c33',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
          <button onClick={() => setError(null)} style={{ float: 'right' }}>×</button>
        </div>
      )}

      <CourseHeader
        course={courseData}
        onPublish={handlePublishCourse}
        disabled={saving}
      />

      <div style={{ marginTop: '30px', marginBottom: '20px' }}>
        <button
          onClick={handleAddNewWeek}
          disabled={saving}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          + Add New Week
        </button>
      </div>

      <WeekList
        weeks={weeks}
        onEdit={(week) => setEditingWeek(week)}
        onPreview={(week) => setPreviewWeek(week)}
        onDelete={handleDeleteWeek}
        onMove={handleMoveWeek}
        disabled={saving}
      />
    </div>
  )
}

export default CourseBuilder