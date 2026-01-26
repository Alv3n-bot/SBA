import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import logo192 from '../../assets/favicon_io/android-chrome-192x192.png';
import courseData from '../../data/ courseData.json';
import { canEnrollInCourse, enrollInCourse, unenrollFromCourse } from '../../utils/enrollmentUtils';
import { 
  Clock, 
  Award, 
  CheckCircle, 
  Users, 
  BookOpen, 
  Star,
  ArrowRight,
  ChevronDown,
  AlertCircle,
  Loader2,
  XCircle
} from 'lucide-react';

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [expandedModule, setExpandedModule] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [unenrolling, setUnenrolling] = useState(false);
  const [error, setError] = useState(null);
  const [showMaxCoursesModal, setShowMaxCoursesModal] = useState(false);
  const [showUnenrollModal, setShowUnenrollModal] = useState(false);
  
  const course = courseData[courseId];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Check enrollment status
        const eligibility = await canEnrollInCourse(currentUser.uid, courseId);
        if (eligibility.reason === 'already_enrolled') {
          setIsEnrolled(true);
        }
        setEnrolledCourses(eligibility.enrolledCourses || []);
      }
    });
    return () => unsubscribe();
  }, [courseId]);

  // If course doesn't exist, show 404
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-8">The course you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handleEnroll = async () => {
    setError(null);

    // If not logged in, redirect to EHub login
    if (!user) {
      navigate('/ehub');
      return;
    }

    // If course is closed, don't allow enrollment
    if (!course.isOpen) {
      setError('This course is currently closed for enrollment.');
      return;
    }

    // If already enrolled, go to learning page
    if (isEnrolled) {
      navigate(`/learn/${courseId}`);
      return;
    }

    // Check enrollment eligibility
    const eligibility = await canEnrollInCourse(user.uid, courseId);

    if (!eligibility.canEnroll) {
      if (eligibility.reason === 'max_courses_reached') {
        setShowMaxCoursesModal(true);
        return;
      }
      setError('Unable to enroll. Please try again.');
      return;
    }

    // Enroll the user
    setEnrolling(true);
    const result = await enrollInCourse(user.uid, courseId);

    if (result.success) {
      setIsEnrolled(true);
      // Show success message briefly then redirect
      setTimeout(() => {
        navigate('/ehub');
      }, 1500);
    } else {
      setError('Enrollment failed. Please try again.');
    }
    setEnrolling(false);
  };

  const handleUnenroll = async () => {
    if (!user) return;

    setUnenrolling(true);
    setError(null);

    const result = await unenrollFromCourse(user.uid, courseId);

    if (result.success) {
      setIsEnrolled(false);
      setShowUnenrollModal(false);
      // Show success message briefly
      setTimeout(() => {
        navigate('/ehub');
      }, 1000);
    } else {
      setError('Failed to unenroll. Please try again.');
      setShowUnenrollModal(false);
    }
    setUnenrolling(false);
  };

  const getEnrollButtonText = () => {
    if (!user) return course.isOpen ? 'Login to Enroll' : 'Login to Join Waitlist';
    if (isEnrolled) return 'Go to Course';
    if (!course.isOpen) return 'Join Waitlist';
    if (enrolling) return 'Enrolling...';
    return 'Enroll Now';
  };

  const getEnrollButtonClass = () => {
    const baseClass = "px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2";
    
    if (isEnrolled) {
      return `${baseClass} bg-green-600 text-white hover:bg-green-700`;
    }
    
    if (!course.isOpen) {
      return `${baseClass} bg-gray-800 text-white hover:bg-gray-700`;
    }
    
    return `${baseClass} bg-black text-white hover:bg-gray-800 ${enrolling ? 'opacity-75 cursor-not-allowed' : ''}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo192} alt="Logo" className="w-10 h-10" />
              <button 
                onClick={() => navigate(user ? '/ehub' : '/')} 
                className="text-gray-600 hover:text-gray-900 font-semibold"
              >
                ← Back to {user ? 'Dashboard' : 'Home'}
              </button>
            </div>
            {!user && (
              <button
                onClick={() => navigate('/ehub')}
                className="bg-black text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-800"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div>
              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm mb-4 ${
                course.isOpen 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-800 text-white'
              }`}>
                {course.isOpen ? '✓ Open for Enrollment' : '🔒 Enrollment Closed'}
              </div>

              {/* Enrolled Badge */}
              {isEnrolled && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm mb-4 ml-2 bg-green-100 text-green-800">
                  ✓ You're Enrolled
                </div>
              )}

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>
              <p className="text-xl text-gray-700 mb-6">
                {course.subtitle}
              </p>

              {/* Course Meta */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700 font-medium">{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700 font-medium">{course.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700 font-medium">{course.price}</span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {isEnrolled && enrolling === false && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-green-800 text-sm">Successfully enrolled! Redirecting to dashboard...</p>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleEnroll}
                  disabled={enrolling || (!course.isOpen && user)}
                  className={getEnrollButtonClass()}
                >
                  {enrolling && <Loader2 className="w-5 h-5 animate-spin" />}
                  {getEnrollButtonText()}
                  {!enrolling && <ArrowRight className="w-5 h-5" />}
                </button>
                
                {/* Unenroll Button - Only show if enrolled */}
                {isEnrolled && user && (
                  <button
                    onClick={() => setShowUnenrollModal(true)}
                    className="px-8 py-4 border-2 border-red-600 text-red-600 rounded-full font-bold text-lg hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Drop Course
                  </button>
                )}
                
                {/* Download Syllabus - Only show if not enrolled */}
                {!isEnrolled && (
                  <button className="px-8 py-4 border-2 border-gray-900 text-gray-900 rounded-full font-bold text-lg hover:bg-gray-900 hover:text-white transition-all">
                    Download Syllabus
                  </button>
                )}
              </div>

              {course.isOpen && !isEnrolled && (
                <p className="mt-4 text-sm text-gray-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Next cohort starts {course.startDate}
                </p>
              )}
            </div>

            {/* Right Video */}
            <div className="order-first lg:order-last">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${course.videoId}`}
                  title={`${course.title} Introduction`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Max Courses Modal */}
      {showMaxCoursesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Maximum Courses Reached
                </h3>
                <p className="text-gray-600 mb-4">
                  You can only enroll in 2 courses at a time. You're currently enrolled in:
                </p>
                <ul className="space-y-2 mb-4">
                  {enrolledCourses.map((id) => {
                    const enrolledCourse = courseData[id];
                    return (
                      <li key={id} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        {enrolledCourse?.title || id}
                      </li>
                    );
                  })}
                </ul>
                <p className="text-gray-600 text-sm">
                  To enroll in this course, please complete or unenroll from one of your current courses.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowMaxCoursesModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowMaxCoursesModal(false);
                  navigate('/ehub');
                }}
                className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unenroll Confirmation Modal */}
      {showUnenrollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Drop This Course?
                </h3>
                <p className="text-gray-600 mb-2">
                  Are you sure you want to unenroll from <span className="font-semibold">{course.title}</span>?
                </p>
                <p className="text-sm text-gray-500">
                  Your progress will be saved, and you can re-enroll anytime if the course is still open.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUnenrollModal(false)}
                disabled={unenrolling}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUnenroll}
                disabled={unenrolling}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 flex items-center justify-center gap-2"
              >
                {unenrolling && <Loader2 className="w-4 h-4 animate-spin" />}
                {unenrolling ? 'Dropping...' : 'Yes, Drop Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* What You'll Learn */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
            What You'll Learn
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {course.whatYouWillLearn.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <span className="text-gray-700 text-lg">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Description */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Course Overview
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {course.description}
            </p>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
            Curriculum
          </h2>
          <div className="space-y-4 max-w-4xl">
            {course.curriculum.map((module, index) => (
              <div 
                key={index} 
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedModule(expandedModule === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 text-left">
                      {module.module}
                    </h3>
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-600 transition-transform ${
                      expandedModule === index ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {expandedModule === index && (
                  <div className="px-6 pb-6 bg-gray-50">
                    <ul className="space-y-2">
                      {module.topics.map((topic, topicIndex) => (
                        <li key={topicIndex} className="flex items-center gap-2 text-gray-700">
                          <div className="w-2 h-2 bg-black rounded-full"></div>
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
            What's Included
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {course.features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-lg border border-gray-200 flex items-start gap-3"
              >
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructor */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
            Meet Your Instructor
          </h2>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-gray-50 p-8 rounded-2xl max-w-3xl">
            <img 
              src={course.instructor.image} 
              alt={course.instructor.name}
              className="w-32 h-32 rounded-full object-cover"
            />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {course.instructor.name}
              </h3>
              <p className="text-lg text-gray-600 mb-3">
                {course.instructor.title}
              </p>
              <p className="text-gray-700">
                {course.instructor.bio}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Prerequisites */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Prerequisites
          </h2>
          <div className="bg-white p-8 rounded-2xl border border-gray-200 max-w-3xl">
            <p className="text-lg text-gray-700">
              {course.prerequisites}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Join thousands of students building their tech careers
          </p>
          <button
            onClick={handleEnroll}
            disabled={enrolling || (!course.isOpen && user)}
            className={getEnrollButtonClass()}
          >
            {enrolling && <Loader2 className="w-5 h-5 animate-spin" />}
            {getEnrollButtonText()}
            {!enrolling && <ArrowRight className="w-6 h-6" />}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-gray-600 text-sm">
          <div className="flex gap-6 mb-4 md:mb-0">
            <a href="#" className="hover:text-gray-900">Terms of Service</a>
            <a href="#" className="hover:text-gray-900">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900">Contact</a>
          </div>
          <p>© 2026 SBA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}