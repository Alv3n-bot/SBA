import { useState, useEffect } from 'react'
import { auth, db } from '../../firebase'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore'

export default function Academy() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [studentData, setStudentData] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [isLoadingCourses, setIsLoadingCourses] = useState(false)

  useEffect(() => {
    const checkStudent = async () => {
      const user = auth.currentUser
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists() && userDoc.data().role === 'student') {
          setIsLoggedIn(true)
          setStudentData(userDoc.data())
          loadCourses(userDoc.data().enrolledCourses)
        }
      }
    }
    checkStudent()
  }, [])

  const loadCourses = async (enrolledCourses) => {
    if (!enrolledCourses || enrolledCourses.length === 0) {
      setCourses([])
      return
    }

    setIsLoadingCourses(true)
    try {
      const coursePromises = enrolledCourses.map(async (courseName) => {
        const courseId = courseName.toLowerCase().replace(/\s+/g, '-')
        const courseDoc = await getDoc(doc(db, 'courses', courseId))
        if (courseDoc.exists()) {
          return { id: courseId, name: courseName, ...courseDoc.data() }
        }
        return { id: courseId, name: courseName, content: null }
      })

      const loadedCourses = await Promise.all(coursePromises)
      setCourses(loadedCourses)
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setIsLoadingCourses(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists() && userDoc.data().role === 'student') {
        setIsLoggedIn(true)
        setStudentData(userDoc.data())
        loadCourses(userDoc.data().enrolledCourses)
      } else {
        setError('You are not authorized as a student')
        await signOut(auth)
      }
    } catch (err) {
      setError('Invalid credentials')
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    setIsLoggedIn(false)
    setStudentData(null)
    setCourses([])
    setSelectedCourse(null)
  }

  if (!isLoggedIn) {
    return (
      <div style={{ padding: '40px', maxWidth: '400px', margin: '0 auto' }}>
        <h2>Student Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              boxSizing: 'border-box'
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
        </form>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </div>
    )
  }

  // Course Viewer
  if (selectedCourse) {
    return (
      <div style={{ padding: '20px' }}>
        <button
          onClick={() => setSelectedCourse(null)}
          style={{
            marginBottom: '20px',
            padding: '10px 20px',
            backgroundColor: '#999',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          ← Back to My Courses
        </button>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '30px',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <h1 style={{ marginBottom: '10px' }}>{selectedCourse.title || selectedCourse.name}</h1>
          
          {selectedCourse.description && (
            <p style={{ 
              color: '#666', 
              fontSize: '16px', 
              marginBottom: '30px',
              paddingBottom: '20px',
              borderBottom: '1px solid #eee'
            }}>
              {selectedCourse.description}
            </p>
          )}

          {selectedCourse.content ? (
            <div 
              className="ql-editor"
              style={{ 
                padding: 0,
                fontSize: '16px',
                lineHeight: '1.6'
              }}
              dangerouslySetInnerHTML={{ __html: selectedCourse.content }}
            />
          ) : (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px'
            }}>
              <p style={{ fontSize: '18px', color: '#666' }}>
                📚 Course content is not available yet.
              </p>
              <p style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>
                Your instructor is still preparing this course.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Student Dashboard
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px' 
      }}>
        <div>
          <h1>Student Dashboard</h1>
          <p>Welcome, {studentData?.firstName} {studentData?.lastName}!</p>
          <p style={{ color: '#666' }}>Email: {studentData?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      <h3>My Enrolled Courses:</h3>
      
      {isLoadingCourses ? (
        <p>Loading courses...</p>
      ) : courses.length > 0 ? (
        <div style={{ display: 'grid', gap: '15px' }}>
          {courses.map((course) => (
            <div
              key={course.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <h4>📚 {course.title || course.name}</h4>
              {course.description && (
                <p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>
                  {course.description}
                </p>
              )}
              <button
                onClick={() => setSelectedCourse(course)}
                style={{
                  marginTop: '10px',
                  padding: '10px 20px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                {course.content ? '📖 View Course' : '📚 Course Not Ready'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#f9f9f9', 
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}>
          <p style={{ fontSize: '16px', color: '#666' }}>
            You are not enrolled in any courses yet.
          </p>
        </div>
      )}
    </div>
  )
}