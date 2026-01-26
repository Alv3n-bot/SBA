import { useState, useEffect } from 'react'
import "quill/dist/quill.snow.css";
import { Routes, Route } from 'react-router-dom'
import { auth, db } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import Academy from './pages/academy/Academy'
import Admin from './pages/admin/Admin'
import Tutor from './pages/tutor/Tutor'
import LandingPage from './pages/landing-page/landing-page'
import Auth from './pages/auth/auth'
import Enroll from './pages/academy/CourseEnrollment'
import EHub from './pages/ehub/ehub'

import Dashboard from './pages/ehub/Dashboard';
import CourseDetails from './components/courses/CourseDetails';
import CourseLearning from './pages/learning/CourseLearning';

function App() {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
        if (userDoc.exists()) {
          setUserData(userDoc.data())
        }
      } else {
        setUserData(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  if (loading) {
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
    <Routes>
      <Route path="/" element={<LandingPage user={user} userData={userData} />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/enroll" element={<Enroll />} />
      <Route path="/academy" element={<Academy />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/tutor" element={<Tutor />} />
      <Route path="/ehub" element={<EHub />} />
       
      <Route path="/dashboard" element={<Dashboard />} />
      
        <Route path="/learn/:courseId" element={<CourseLearning />} />
        <Route path="/course/:courseId" element={<CourseDetails />} />
    </Routes>
  )
}

export default App