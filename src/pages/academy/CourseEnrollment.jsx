import { useState, useEffect } from 'react'
import { auth, db } from '../../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

export default function CourseEnrollment() {
  const [studentData, setStudentData] = useState(null)
  const [selectedCourses, setSelectedCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const navigate = useNavigate()

  const availableCourses = [
    "Professional Foundations",
    "Front End Web Development",
    "Backend Web Development",
    "Tech Career & Freelancing",
    "Mobile App Development"
  ]

  useEffect(() => {
    const loadStudentData = async () => {
      const user = auth.currentUser
      
      if (!user) {
        navigate('/login')
        return
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        
        if (userDoc.exists()) {
          const data = userDoc.data()
          
          if (data.role !== 'student') {
            alert('This page is only for students')
            navigate('/')
            return
          }

          setStudentData(data)
          
          // Load already enrolled courses
          if (data.enrolledCourses && data.enrolledCourses.length > 0) {
            setSelectedCourses(data.enrolledCourses)
          }
        } else {
          alert('User data not found')
          navigate('/login')
        }
      } catch (error) {
        console.error('Error loading student data:', error)
        alert('Error loading your information')
      } finally {
        setIsLoading(false)
      }
    }

    loadStudentData()
  }, [navigate])

  const handleCourseToggle = (course) => {
    if (selectedCourses.includes(course)) {
      // Remove course
      setSelectedCourses(selectedCourses.filter(c => c !== course))
    } else {
      // Add course (max 2)
      if (selectedCourses.length >= 2) {
        alert('You can only enroll in a maximum of 2 courses at a time')
        return
      }
      setSelectedCourses([...selectedCourses, course])
    }
  }

  const handleEnroll = async () => {
    if (selectedCourses.length === 0) {
      alert('Please select at least one course')
      return
    }

    setIsSaving(true)

    try {
      const user = auth.currentUser
      
      await setDoc(doc(db, 'users', user.uid), {
        enrolledCourses: selectedCourses,
        enrollmentDate: new Date()
      }, { merge: true })

      alert('✅ Successfully enrolled in courses!')
      navigate('/academy')
    } catch (error) {
      console.error('Error enrolling:', error)
      alert('❌ Error enrolling in courses. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f7fafc'
      }}>
        <p style={{ fontSize: '18px', color: '#2d3748' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f7fafc',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        padding: '40px'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ 
            color: '#1a202c',
            fontSize: '32px',
            marginBottom: '8px',
            fontWeight: '700'
          }}>
            📚 Course Enrollment
          </h1>
          <p style={{ 
            color: '#718096',
            fontSize: '16px',
            marginBottom: '16px'
          }}>
            Welcome, {studentData?.firstName} {studentData?.lastName}!
          </p>
          <p style={{ 
            color: '#4a5568',
            fontSize: '14px',
            backgroundColor: '#edf2f7',
            padding: '12px',
            borderRadius: '8px',
            display: 'inline-block'
          }}>
            ℹ️ You can enroll in up to <strong>2 courses</strong> at a time
          </p>
        </div>

        {/* Course Selection */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ 
            color: '#2d3748',
            fontSize: '20px',
            marginBottom: '16px',
            fontWeight: '600'
          }}>
            Select Your Courses ({selectedCourses.length}/2)
          </h2>

          <div style={{ 
            display: 'grid',
            gap: '16px'
          }}>
            {availableCourses.map((course) => {
              const isSelected = selectedCourses.includes(course)
              const isDisabled = !isSelected && selectedCourses.length >= 2

              return (
                <div
                  key={course}
                  onClick={() => !isDisabled && handleCourseToggle(course)}
                  style={{
                    padding: '20px',
                    border: `2px solid ${isSelected ? '#4299e1' : '#e2e8f0'}`,
                    backgroundColor: isSelected ? '#ebf8ff' : isDisabled ? '#f7fafc' : 'white',
                    borderRadius: '12px',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: isDisabled ? 0.5 : 1,
                    position: 'relative'
                  }}
                >
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        color: '#1a202c',
                        fontSize: '18px',
                        fontWeight: '600',
                        marginBottom: '4px'
                      }}>
                        {course}
                      </h3>
                      <p style={{ 
                        color: '#718096',
                        fontSize: '14px',
                        margin: 0
                      }}>
                        {getCourseDescription(course)}
                      </p>
                    </div>
                    
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: `2px solid ${isSelected ? '#4299e1' : '#cbd5e0'}`,
                      backgroundColor: isSelected ? '#4299e1' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: '16px',
                      flexShrink: 0
                    }}>
                      {isSelected && (
                        <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                          ✓
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected Courses Summary */}
        {selectedCourses.length > 0 && (
          <div style={{
            backgroundColor: '#f0fff4',
            border: '1px solid #9ae6b4',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <h3 style={{ 
              color: '#22543d',
              fontSize: '16px',
              marginBottom: '12px',
              fontWeight: '600'
            }}>
              ✅ Selected Courses:
            </h3>
            <ul style={{ 
              margin: 0,
              paddingLeft: '20px',
              color: '#276749'
            }}>
              {selectedCourses.map(course => (
                <li key={course} style={{ marginBottom: '8px', fontSize: '14px' }}>
                  {course}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Enroll Button */}
        <button
          onClick={handleEnroll}
          disabled={isSaving || selectedCourses.length === 0}
          style={{
            width: '100%',
            padding: '16px 32px',
            backgroundColor: selectedCourses.length === 0 ? '#cbd5e0' : '#48bb78',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '700',
            cursor: selectedCourses.length === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: selectedCourses.length > 0 ? '0 4px 6px rgba(72, 187, 120, 0.3)' : 'none'
          }}
          onMouseOver={(e) => {
            if (selectedCourses.length > 0 && !isSaving) {
              e.target.style.backgroundColor = '#38a169'
            }
          }}
          onMouseOut={(e) => {
            if (selectedCourses.length > 0 && !isSaving) {
              e.target.style.backgroundColor = '#48bb78'
            }
          }}
        >
          {isSaving ? '⏳ Enrolling...' : '🎓 Enroll Now'}
        </button>

        {/* Additional Info */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#fff5f5',
          border: '1px solid #feb2b2',
          borderRadius: '8px'
        }}>
          <p style={{ 
            color: '#742a2a',
            fontSize: '13px',
            margin: 0,
            lineHeight: '1.6'
          }}>
            <strong>⚠️ Important:</strong> Once enrolled, your courses can only be modified by your assigned teacher. 
            Make sure to choose courses that align with your learning goals.
          </p>
        </div>
      </div>
    </div>
  )
}

function getCourseDescription(course) {
  const descriptions = {
    "Professional Foundations": "Build essential workplace and business skills",
    "Front End Web Development": "Learn HTML, CSS, JavaScript & React",
    "Backend Web Development": "Master server-side programming & databases",
    "Tech Career & Freelancing": "Launch your tech career or freelance business",
    "Mobile App Development": "Create iOS & Android mobile applications"
  }
  return descriptions[course] || "Course description"
}