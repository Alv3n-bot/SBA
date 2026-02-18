import { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import CourseBuilder from './CourseBuilder'; // Updated import path

export default function Teacher() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().role === 'teacher') {
          setTeacherData({ id: user.uid, ...userDoc.data() });
          setIsLoggedIn(true);
        } else {
          if (userDoc.exists()) setError('Unauthorized access.');
          await signOut(auth);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists() && userDoc.data().role === 'teacher') {
        setTeacherData({ id: userCredential.user.uid, ...userDoc.data() });
        setIsLoggedIn(true);
      } else {
        setError('You are not authorized as a teacher');
        await signOut(auth);
      }
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsLoggedIn(false);
    setTeacherData(null);
    setSelectedCourse(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900">Teacher Portal</h2>
            <p className="mt-2 text-sm text-slate-600">Sign in to manage your courses</p>
          </div>
          
          <div className="mt-8 space-y-6">
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email Address"
                className="block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="block w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {error && (
              <p className="text-red-500 text-sm text-center font-medium">{error}</p>
            )}
            
            <button
              onClick={handleLogin}
              className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 font-bold transition duration-200"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedCourse) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <nav className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
          <button 
            onClick={() => setSelectedCourse(null)}
            className="flex items-center text-slate-600 hover:text-indigo-600 font-medium transition"
          >
            <span className="mr-2">←</span> Back to Dashboard
          </button>
          <span className="font-semibold text-slate-800">Editing: {selectedCourse.title}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
          >
            Logout
          </button>
        </nav>
        <CourseBuilder courseId={selectedCourse.id} courseName={selectedCourse.title} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Teacher Dashboard</h1>
            <p className="text-slate-500">Welcome back, {teacherData?.firstName}!</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Your Assigned Courses</h3>
        
        {!teacherData?.assignedCourses || teacherData.assignedCourses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <p className="text-slate-500">No courses assigned yet. Please contact your administrator.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacherData.assignedCourses.map((course, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
                <div className="p-6">
                  <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4 text-xl">
                    📚
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">{course.title}</h4>
                  <p className="text-slate-500 text-sm mb-6">
                    Manage content, lessons, and course structure.
                  </p>
                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
                  >
                    Edit Course Content
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}