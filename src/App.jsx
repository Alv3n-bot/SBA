// src/App.jsx - COMPLETE WITH PROTECTED ROUTES
import { useState, useEffect } from 'react';
import "quill/dist/quill.snow.css";
import { Routes, Route } from 'react-router-dom';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Admin from './pages/admin/Admin';
import Tutor from './pages/tutor/Tutor';
import LandingPage from './pages/landing-page/landing-page';
import Auth from './pages/auth/auth';
import EHub from './pages/ehub/ehub';
import Blog from './pages/blogs/Blog';
import Dashboard from './pages/ehub/Dashboard';
import CourseDetails from './components/courses/CourseDetails';
import CourseLearning from './pages/learning/CourseLearning';

// Peer Review Components
import PeerReviewDashboard from './pages/learning/components/PeerReviewDashboard';
import ReviewLinkPage from './pages/learning/components/ReviewLinkPage';
import ViewFeedbackPage from './pages/learning/components/ViewFeedbackPage';

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f7fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #4f46e5',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ fontSize: '18px', color: '#2d3748' }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage user={user} userData={userData} />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<Blog />} />
      
      {/* Admin/Tutor Routes */}
      <Route path="/admin" element={<Admin />} />
      <Route path="/tutor" element={<Tutor />} />
      
      {/* Dashboard Routes */}
      <Route path="/ehub" element={<EHub />} />
      <Route path="/dashboard" element={<Dashboard />} />
      
      {/* Course Routes */}
      <Route path="/course/:courseId" element={<CourseDetails />} />
      <Route path="/learn/:courseId" element={<CourseLearning />} />
      
      {/* PEER REVIEW ROUTES - PROTECTED */}
      <Route 
        path="/peer-reviews" 
        element={
          <ProtectedRoute>
            <PeerReviewDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/review/:submissionId" 
        element={
          <ProtectedRoute>
            <ReviewLinkPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/assignments/:assignmentId/feedback" 
        element={
          <ProtectedRoute>
            <ViewFeedbackPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;