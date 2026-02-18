import { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs, query, where, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import AdminLogin from './AdminLogin';
import AdminHeader from './AdminHeader';
import { 
  Users, BookOpen, CreditCard, LayoutDashboard, Bell, Trash2, 
  Plus, X, Check, Loader2, TrendingUp, Calendar, DollarSign,
  Award, Search, Filter, Menu, ChevronRight
} from 'lucide-react';

export default function Admin() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Teacher creation
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [teacherFirstName, setTeacherFirstName] = useState('');
  const [teacherLastName, setTeacherLastName] = useState('');
  const [assignedCourses, setAssignedCourses] = useState([]);
  
  // Course creation
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  
  // Notification creation
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('info');
  const [notifTarget, setNotifTarget] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState('');
  
  // Admin credentials for re-login
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        setIsAdminLoggedIn(true);
        setAdminData(userDoc.data());
        await fetchAllData();
      }
    }
    setLoading(false);
  };

  const fetchAllData = async () => {
    await Promise.all([
      fetchTeachers(),
      fetchStudents(),
      fetchCourses(),
      fetchPayments()
    ]);
  };

  const fetchTeachers = async () => {
    const q = query(collection(db, 'users'), where('role', '==', 'teacher'));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTeachers(list);
  };

  const fetchStudents = async () => {
    const q = query(collection(db, 'users'), where('role', '==', 'student'));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setStudents(list);
  };

  const fetchCourses = async () => {
    const snapshot = await getDocs(collection(db, 'courses'));
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCourses(list);
  };

  const fetchPayments = async () => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const allPayments = [];
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      if (userData.payments && Array.isArray(userData.payments)) {
        userData.payments.forEach(payment => {
          allPayments.push({
            ...payment,
            userId: doc.id,
            userName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email
          });
        });
      }
    });
    
    setPayments(allPayments);
  };

  const handleAdminLogin = async (user) => {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists() && userDoc.data().role === 'admin') {
      setIsAdminLoggedIn(true);
      setAdminData(userDoc.data());
      await fetchAllData();
    } else {
      setError('You are not authorized as admin');
      await signOut(auth);
    }
  };

  const createCourse = async () => {
    setError('');
    setSuccess('');

    if (!newCourseTitle.trim()) {
      setError('Course title is required');
      return;
    }

    try {
      const courseId = `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const courseData = {
        id: courseId,
        title: newCourseTitle,
        description: newCourseDescription,
        createdBy: auth.currentUser.uid,
        createdAt: new Date(),
        weeks: []
      };

      await setDoc(doc(db, 'courses', courseId), courseData);
      setSuccess('Course created successfully!');
      setNewCourseTitle('');
      setNewCourseDescription('');
      await fetchCourses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      await deleteDoc(doc(db, 'courses', courseId));
      setSuccess('Course deleted successfully!');
      await fetchCourses();
      await fetchTeachers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error deleting course: ' + err.message);
    }
  };

  const createTeacher = async () => {
    setError('');
    setSuccess('');

    if (!teacherFirstName || !teacherLastName || !teacherEmail || !teacherPassword) {
      setError('All fields are required');
      return;
    }

    if (assignedCourses.length === 0) {
      setError('Please assign at least one course');
      return;
    }

    if (!adminEmail || !adminPassword) {
      const email = prompt('Enter your admin email:');
      const password = prompt('Enter your admin password:');
      
      if (!email || !password) {
        setError('Admin credentials required');
        return;
      }
      
      setAdminEmail(email);
      setAdminPassword(password);
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, teacherEmail, teacherPassword);
      const teacher = userCredential.user;

      await setDoc(doc(db, 'users', teacher.uid), {
        firstName: teacherFirstName,
        lastName: teacherLastName,
        email: teacherEmail,
        role: 'teacher',
        assignedCourses: assignedCourses,
        createdAt: new Date(),
        createdBy: adminData.email
      });

      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      
      setSuccess('Teacher created successfully!');
      setTeacherEmail('');
      setTeacherPassword('');
      setTeacherFirstName('');
      setTeacherLastName('');
      setAssignedCourses([]);
      
      await fetchTeachers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const createNotification = async () => {
    setError('');
    setSuccess('');

    if (!notifTitle || !notifMessage) {
      setError('Title and message are required');
      return;
    }

    if (notifTarget === 'specific' && !selectedUserId) {
      setError('Please select a user');
      return;
    }

    try {
      await addDoc(collection(db, 'notifications'), {
        title: notifTitle,
        message: notifMessage,
        type: notifType,
        userId: notifTarget === 'all' ? 'all' : selectedUserId,
        read: false,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.uid
      });

      setSuccess('Notification sent successfully!');
      setNotifTitle('');
      setNotifMessage('');
      setNotifType('info');
      setNotifTarget('all');
      setSelectedUserId('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error creating notification: ' + err.message);
    }
  };

  const toggleCourseAssignment = (courseId, courseTitle) => {
    const courseObj = { id: courseId, title: courseTitle };
    const isAssigned = assignedCourses.some(c => c.id === courseId);
    
    if (isAssigned) {
      setAssignedCourses(assignedCourses.filter(c => c.id !== courseId));
    } else {
      setAssignedCourses([...assignedCourses, courseObj]);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsAdminLoggedIn(false);
    setAdminData(null);
  };

  // Analytics calculations
  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const activeSubscriptions = students.filter(s => {
    if (!s.subscription?.endDate) return false;
    const endDate = s.subscription.endDate.toDate ? s.subscription.endDate.toDate() : new Date(s.subscription.endDate);
    return endDate > new Date();
  }).length;

  const getStudentsPerCourse = () => {
    const courseStats = {};
    courses.forEach(course => {
      courseStats[course.id] = {
        title: course.title,
        count: students.filter(s => s.enrolledCourses?.includes(course.id)).length
      };
    });
    return courseStats;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-black" />
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return <AdminLogin onAdminLogin={handleAdminLogin} />;
  }

  const filteredStudents = students.filter(s => 
    s.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'teachers', label: 'Teachers', icon: Award },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payments', label: 'Payments', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader adminData={adminData} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-800 rounded-xl flex items-center justify-between">
            <span className="font-medium text-sm">{error}</span>
            <button onClick={() => setError('')}><X className="w-5 h-5" /></button>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 text-green-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span className="font-medium text-sm">{success}</span>
            </div>
            <button onClick={() => setSuccess('')}><X className="w-5 h-5" /></button>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-semibold"
        >
          <Menu className="w-5 h-5" />
          Menu
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Desktop */}
          <nav className="hidden lg:block w-64 bg-white rounded-2xl p-4 border-2 border-gray-200 h-fit sticky top-24">
            <div className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-black text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-5 h-5" /> {tab.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Mobile Sidebar */}
          {isMobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="absolute left-0 top-0 bottom-0 w-64 bg-white p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Menu</h3>
                  <button onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-2">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        activeTab === tab.id 
                          ? 'bg-black text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" /> {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-black">Dashboard Overview</h2>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-black transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Total Students</p>
                        <p className="text-3xl font-bold text-black mt-2">{students.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-black transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Total Courses</p>
                        <p className="text-3xl font-bold text-black mt-2">{courses.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-black transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Active Plans</p>
                        <p className="text-3xl font-bold text-black mt-2">{activeSubscriptions}</p>
                      </div>
                      <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-black transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                        <p className="text-2xl sm:text-3xl font-bold text-black mt-2">KES {totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Enrollment Stats */}
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
                  <h3 className="text-xl font-bold text-black mb-4">Students per Course</h3>
                  <div className="space-y-3">
                    {Object.entries(getStudentsPerCourse()).map(([id, data]) => (
                      <div key={id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-black">{data.title}</p>
                            <p className="text-sm text-gray-600">{data.count} students enrolled</p>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-black">{data.count}</div>
                      </div>
                    ))}
                    {courses.length === 0 && (
                      <p className="text-gray-500 text-center py-8">No courses created yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-black">Students</h2>
                  <div className="relative w-full sm:w-auto">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-64 pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-black">Student</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-black">Email</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-black">Courses</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-black">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredStudents.map((student) => {
                          const isActive = student.subscription?.endDate && 
                            (student.subscription.endDate.toDate ? student.subscription.endDate.toDate() : new Date(student.subscription.endDate)) > new Date();
                          
                          return (
                            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-semibold text-sm">
                                    {student.firstName?.[0]}{student.lastName?.[0]}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-black">
                                      {student.firstName} {student.lastName}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                              <td className="px-6 py-4">
                                <span className="px-3 py-1 bg-gray-100 text-black text-sm font-semibold rounded-full">
                                  {student.enrolledCourses?.length || 0} courses
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                  isActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden divide-y divide-gray-200">
                    {filteredStudents.map((student) => {
                      const isActive = student.subscription?.endDate && 
                        (student.subscription.endDate.toDate ? student.subscription.endDate.toDate() : new Date(student.subscription.endDate)) > new Date();
                      
                      return (
                        <div key={student.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center font-semibold flex-shrink-0">
                              {student.firstName?.[0]}{student.lastName?.[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-black truncate">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-sm text-gray-600 truncate">{student.email}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-1 bg-gray-100 text-black text-xs font-semibold rounded-full">
                                  {student.enrolledCourses?.length || 0} courses
                                </span>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                  isActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredStudents.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No students found</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === 'courses' && (
              <div className="space-y-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-black">Course Management</h2>
                
                {/* Create Course Form */}
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
                  <h3 className="text-xl font-bold text-black mb-4">Create New Course</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Course Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Professional Foundations"
                        value={newCourseTitle}
                        onChange={(e) => setNewCourseTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        placeholder="Brief description of the course"
                        value={newCourseDescription}
                        onChange={(e) => setNewCourseDescription(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        rows={3}
                      />
                    </div>
                    
                    <button 
                      onClick={createCourse}
                      className="w-full sm:w-auto bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Create Course
                    </button>
                  </div>
                </div>

                {/* Existing Courses */}
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
                  <h3 className="text-xl font-bold text-black mb-4">Existing Courses</h3>
                  {courses.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No courses created yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {courses.map((course) => {
                        const enrolledCount = students.filter(s => s.enrolledCourses?.includes(course.id)).length;
                        return (
                          <div 
                            key={course.id}
                            className="p-4 sm:p-5 border-2 border-gray-200 rounded-xl hover:border-black transition-all"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                              <div className="flex items-start gap-3 sm:gap-4 flex-1">
                                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                                  <BookOpen className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-black text-lg">{course.title}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3">
                                    <span className="text-sm text-gray-500">
                                      <span className="font-semibold text-black">{enrolledCount}</span> students
                                    </span>
                                    <span className="text-xs text-gray-400 font-mono truncate">ID: {course.id}</span>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => deleteCourse(course.id)}
                                className="w-full sm:w-auto p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                              >
                                <Trash2 className="w-5 h-5" />
                                <span className="sm:hidden">Delete</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Teachers Tab */}
            {activeTab === 'teachers' && (
              <div className="space-y-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-black">Teacher Management</h2>
                
                {/* Create Teacher Form */}
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
                  <h3 className="text-xl font-bold text-black mb-4">Create Teacher Account</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={teacherFirstName}
                          onChange={(e) => setTeacherFirstName(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={teacherLastName}
                          onChange={(e) => setTeacherLastName(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={teacherEmail}
                        onChange={(e) => setTeacherEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        type="password"
                        value={teacherPassword}
                        onChange={(e) => setTeacherPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Assign Courses
                      </label>
                      <div className="space-y-2 max-h-48 overflow-y-auto border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                        {courses.length === 0 ? (
                          <p className="text-sm text-gray-500">No courses available</p>
                        ) : (
                          courses.map((course) => (
                            <label 
                              key={course.id}
                              className="flex items-center space-x-3 p-3 hover:bg-white rounded-lg cursor-pointer transition-all"
                            >
                              <input
                                type="checkbox"
                                checked={assignedCourses.some(c => c.id === course.id)}
                                onChange={() => toggleCourseAssignment(course.id, course.title)}
                                className="w-5 h-5 text-black rounded focus:ring-black"
                              />
                              <span className="text-sm font-medium text-black">{course.title}</span>
                            </label>
                          ))
                        )}
                      </div>
                      {assignedCourses.length > 0 && (
                        <p className="text-sm text-gray-600 mt-2">
                          Selected: {assignedCourses.map(c => c.title).join(', ')}
                        </p>
                      )}
                    </div>
                    
                    <button 
                      onClick={createTeacher}
                      className="w-full sm:w-auto bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Create Teacher
                    </button>
                  </div>
                </div>

                {/* Teachers List */}
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
                  <h3 className="text-xl font-bold text-black mb-4">Teachers List</h3>
                  {teachers.length === 0 ? (
                    <div className="text-center py-12">
                      <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No teachers created yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {teachers.map((teacher) => (
                        <div 
                          key={teacher.id}
                          className="p-4 sm:p-5 border-2 border-gray-200 rounded-xl hover:border-black transition-all"
                        >
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                              <Award className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-black text-lg">
                                {teacher.firstName} {teacher.lastName}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1 truncate">{teacher.email}</p>
                              <div className="mt-3">
                                <p className="text-sm font-semibold text-gray-700 mb-2">Assigned Courses:</p>
                                {teacher.assignedCourses && teacher.assignedCourses.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {teacher.assignedCourses.map((course, idx) => (
                                      <span 
                                        key={idx}
                                        className="px-3 py-1 bg-gray-100 text-black text-sm font-semibold rounded-full"
                                      >
                                        {course.title}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500 italic">No courses assigned</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-black">Send Notifications</h2>
                
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
                  <h3 className="text-xl font-bold text-black mb-4">Create Notification</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        placeholder="Notification title"
                        value={notifTitle}
                        onChange={(e) => setNotifTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Message
                      </label>
                      <textarea
                        placeholder="Notification message"
                        value={notifMessage}
                        onChange={(e) => setNotifMessage(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Type
                        </label>
                        <select
                          value={notifType}
                          onChange={(e) => setNotifType(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        >
                          <option value="info">Info</option>
                          <option value="success">Success</option>
                          <option value="warning">Warning</option>
                          <option value="error">Error</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Target
                        </label>
                        <select
                          value={notifTarget}
                          onChange={(e) => setNotifTarget(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        >
                          <option value="all">All Users</option>
                          <option value="specific">Specific User</option>
                        </select>
                      </div>
                    </div>

                    {notifTarget === 'specific' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Select User
                        </label>
                        <select
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        >
                          <option value="">-- Select a user --</option>
                          {students.map(student => (
                            <option key={student.id} value={student.id}>
                              {student.firstName} {student.lastName} ({student.email})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <button 
                      onClick={createNotification}
                      className="w-full sm:w-auto bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                    >
                      <Bell className="w-5 h-5" />
                      Send Notification
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-black">Payment History</h2>
                
                <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
                  {payments.length === 0 ? (
                    <div className="text-center py-12">
                      <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No payments recorded yet</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b-2 border-gray-200">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-black">Date</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-black">Student</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-black">Plan</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-black">Amount</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-black">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {payments.slice().reverse().map((payment, idx) => {
                              const date = payment.date?.toDate ? payment.date.toDate() : new Date(payment.date);
                              return (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-4 text-sm text-black">
                                    {date.toLocaleDateString('en-US', { 
                                      year: 'numeric', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    })}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-black font-medium">
                                    {payment.userName}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-600">
                                    {payment.plan || payment.planId}
                                  </td>
                                  <td className="px-6 py-4 text-sm font-bold text-black">
                                    {payment.currency} {payment.amount}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                      payment.status === 'success' 
                                        ? 'bg-black text-white' 
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {payment.status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards */}
                      <div className="md:hidden divide-y divide-gray-200">
                        {payments.slice().reverse().map((payment, idx) => {
                          const date = payment.date?.toDate ? payment.date.toDate() : new Date(payment.date);
                          return (
                            <div key={idx} className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-bold text-black">{payment.userName}</p>
                                  <p className="text-sm text-gray-600">{payment.plan || payment.planId}</p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                  payment.status === 'success' 
                                    ? 'bg-black text-white' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {payment.status}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-sm text-gray-500">
                                  {date.toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </p>
                                <p className="font-bold text-black">
                                  {payment.currency} {payment.amount}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Revenue Summary */}
                {payments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
                      <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                      <p className="text-2xl sm:text-3xl font-bold text-black mt-2">
                        KES {totalRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
                      <p className="text-sm text-gray-600 font-medium">Total Transactions</p>
                      <p className="text-2xl sm:text-3xl font-bold text-black mt-2">
                        {payments.length}
                      </p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
                      <p className="text-sm text-gray-600 font-medium">Active Plans</p>
                      <p className="text-2xl sm:text-3xl font-bold text-black mt-2">
                        {activeSubscriptions}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}