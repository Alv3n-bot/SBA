import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase';
import { canEnrollInCourse, enrollInCourse } from '../../../utils/enrollmentUtils';
import { ArrowRight, Code, Layout, Server, Briefcase, Smartphone, Clock, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

function Programs() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrolling, setEnrolling] = useState(null);
  const [showMaxCoursesModal, setShowMaxCoursesModal] = useState(false);

  const courses = [
  {
    id: 'full-stack',
    title: 'Full-Stack Development Software Engineering',
    description:
      'Become a job-ready software engineer by learning full-stack web development. Master HTML, CSS, JavaScript, React, Node.js, databases, APIs, and Git while building real-world projects and a professional portfolio.',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    icon: Briefcase,
    path: '/course/full-stack',
    duration: '24 Weeks',
    level: 'Beginner to Intermediate',
    students: '500+',
    isOpen: true,
    startDate: 'March 2, 2026'
  },
  {
    id: 'data-science',
    title: 'Data Science & Analytics',
    description:
      'Learn data analysis, Python, SQL, statistics, and data visualization to launch a career in data analytics or junior data science. Work with real datasets and build data-driven projects used in real businesses.',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    icon: Layout,
    path: '/course/data-science',
    duration: '20 Weeks',
    level: 'Beginner',
    students: '400+',
    isOpen: true,
    startDate: 'March 2, 2026'
  },
  {
    id: 'ai-ml',
    title: 'Artificial Intelligence & Machine Learning',
    description:
      'Build a strong foundation in artificial intelligence and machine learning. Learn Python, data preprocessing, machine learning models, and applied AI techniques while developing practical, portfolio-ready AI projects.',
    image:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    icon: Server,
    path: '/course/ai-ml',
    duration: '24 Weeks',
    level: 'Intermediate',
    students: '300+',
    isOpen: true,
    startDate: 'March 2, 2026'
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    description:
      'Start a career in cybersecurity by learning network security, ethical hacking, threat analysis, and defensive security practices. Gain hands-on experience through labs, simulations, and real-world security scenarios.',
    image:
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    icon: Code,
    path: '/course/cybersecurity',
    duration: '18 Weeks',
    level: 'Beginner',
    students: '250+',
    isOpen: true,
    startDate: 'March 2, 2026'
  },
  {
    id: 'ux-ui-design',
    title: 'UX/UI & Product Design Bootcamp',
    description:
      'Learn user experience and interface design principles, wireframing, prototyping, and product thinking. Build visually strong, user-centered designs and a professional UX/UI portfolio.',
    image:
      'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=1200&q=80',
    icon: Smartphone,
    path: '/course/ux-ui-design',
    duration: '16 Weeks',
    level: 'All Levels',
    students: '350+',
    isOpen: true,
    startDate: 'March 2, 2026'
  }
];


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch all enrollment statuses
        const eligibility = await canEnrollInCourse(currentUser.uid, courses[0].id);
        setEnrolledCourses(eligibility.enrolledCourses || []);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleEnrollClick = async (course, e) => {
    e.preventDefault();
    // If not logged in, redirect to EHub login
    if (!user) {
      navigate('/ehub');
      return;
    }
    // If course is closed, just show message or redirect
    if (!course.isOpen) {
      navigate(course.path);
      return;
    }
    // Check if already enrolled - go to learning page
    if (enrolledCourses.includes(course.id)) {
      navigate(`/learn/${course.id}`);
      return;
    }
    // Check enrollment eligibility
    const eligibility = await canEnrollInCourse(user.uid, course.id);
    if (!eligibility.canEnroll) {
      if (eligibility.reason === 'max_courses_reached') {
        setShowMaxCoursesModal(true);
        return;
      }
      return;
    }
    // Enroll the user
    setEnrolling(course.id);
    const result = await enrollInCourse(user.uid, course.id);
    if (result.success) {
      // Update local state
      setEnrolledCourses(prev => [...prev, course.id]);
      // Redirect to EHub dashboard
      setTimeout(() => {
        navigate('/ehub');
      }, 500);
    }
    setEnrolling(null);
  };

  const getEnrollButtonText = (course) => {
    if (!user) {
      return course.isOpen ? 'Login to Enroll' : 'Apply for Next Cohort';
    }
    if (enrolling === course.id) {
      return 'Enrolling...';
    }
    if (enrolledCourses.includes(course.id)) {
      return 'Continue Learning';
    }
    return course.isOpen ? 'Enroll Now' : 'Apply for Next Cohort';
  };

  const getEnrollButtonClass = (course) => {
    const baseClass = "flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-center no-underline text-sm";
    if (enrolledCourses.includes(course.id)) {
      return `${baseClass} bg-green-600 text-white hover:bg-green-700`;
    }
    if (!course.isOpen) {
      return `${baseClass} bg-gray-800 text-white hover:bg-gray-700`;
    }
    if (enrolling === course.id) {
      return `${baseClass} bg-black text-white opacity-75 cursor-not-allowed`;
    }
    return `${baseClass} bg-black text-white hover:bg-gray-800`;
  };

  return (
    <section id="courses" className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Our Programs
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Industry-expert designed courses to accelerate your tech career. Choose your path and start learning today.
          </p>
        </div>
        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {courses.map((course) => {
            const Icon = course.icon;
            const isEnrolled = enrolledCourses.includes(course.id);
            const isEnrollingThis = enrolling === course.id;
            return (
              <div
                key={course.id}
                className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-black flex flex-col"
              >
                {/* Image Container */}
                <div className="relative h-48 sm:h-52 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Status Badge */}
                  <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full font-bold text-xs ${
                    course.isOpen
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-800 text-white'
                  }`}>
                    {course.isOpen ? 'Open' : 'Closed'}
                  </div>
                  {/* Enrolled Badge */}
                  {isEnrolled && (
                    <div className="absolute top-4 left-20 px-3 py-1.5 rounded-full font-bold text-xs bg-green-100 text-green-800">
                      ✓ Enrolled
                    </div>
                  )}
                  {/* Icon Badge */}
                  <div className="absolute top-4 right-4 bg-white p-2.5 rounded-full shadow-lg transform translate-y-0 group-hover:-translate-y-1 transition-transform duration-300">
                    <Icon className="w-5 h-5 text-black" />
                  </div>
                </div>
                {/* Content */}
                <div className="p-5 sm:p-6 flex flex-col flex-grow">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 group-hover:text-black transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
                    {course.description}
                  </p>
                  {/* Course Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{course.duration}</span>
                    </div>
                    {course.isOpen && (
                      <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        <span>Starts {course.startDate}</span>
                      </div>
                    )}
                    {!course.isOpen && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Next cohort: {course.startDate}</span>
                      </div>
                    )}
                  </div>
                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                    <button
                      onClick={(e) => handleEnrollClick(course, e)}
                      disabled={isEnrollingThis}
                      className={getEnrollButtonClass(course)}
                    >
                      {isEnrollingThis && <Loader2 className="w-4 h-4 animate-spin" />}
                      {!isEnrollingThis && isEnrolled && <CheckCircle className="w-4 h-4" />}
                      <span>{getEnrollButtonText(course)}</span>
                    </button>
                    <a
                      href={course.path}
                      className="flex-1 px-4 py-2.5 rounded-lg font-semibold border-2 border-gray-300 text-gray-700 hover:border-black hover:text-black transition-all duration-300 flex items-center justify-center gap-2 text-center no-underline"
                    >
                      <span className="text-sm">View Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Bottom CTA */}
      </div>
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
                    const enrolledCourse = courses.find(c => c.id === id);
                    return (
                      <li key={id} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        {enrolledCourse?.title || id}
                      </li>
                    );
                  })}
                </ul>
                <p className="text-gray-600 text-sm">
                  To enroll in another course, please complete or unenroll from one of your current courses.
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
    </section>
  );
}

export default Programs;