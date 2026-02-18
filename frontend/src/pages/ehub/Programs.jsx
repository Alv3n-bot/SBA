import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { auth } from '../../firebase';
import { canEnrollInCourse, enrollInCourse } from '../../utils/enrollmentUtils';
import {
  ArrowRight,
  Code,
  Layout,
  Server,
  Briefcase,
  Smartphone,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
  Award,
  Users,
  TrendingUp,
  X,
  ChevronRight,
  BookOpen,
  Plus,
  Filter,
  PlayCircle,
} from 'lucide-react';
import fullStackImg from '../../assets/programs/full-stack.jpg';
import dataScienceImg from '../../assets/programs/data-science.jpg';
import aiMlImg from '../../assets/programs/ai-ml.jpg';
import cybersecurityImg from '../../assets/programs/cybersecurity.jpg';
import uxUiDesignImg from '../../assets/programs/ux-ui-design.jpg';

// ---------------------------------------------------------------------------
// Static course data (move to a separate constants file if it grows)
// ---------------------------------------------------------------------------
const COURSES = [
  {
    id: 'full-stack',
    title: 'Full-Stack Development',
    description: 'Master web development with React, Node.js, and MongoDB',
    image: fullStackImg,
    icon: Briefcase,
    path: '/course/full-stack',
    learnPath: '/learn/full-stack',
    duration: '24 Weeks',
    level: 'Beginner',
    students: '500+',
    isOpen: true,
    startDate: 'March 2, 2026',
    spots: '12 spots remaining',
  },
  {
    id: 'data-science',
    title: 'Data Science & Analytics',
    description: 'Learn Python, SQL, and data visualization for analytics',
    image: dataScienceImg,
    icon: Layout,
    path: '/course/data-science',
    learnPath: '/learn/data-science',
    duration: '20 Weeks',
    level: 'Beginner',
    students: '500+',
    isOpen: true,
    startDate: 'March 2, 2026',
    spots: '8 spots remaining',
  },
  {
    id: 'ai-ml',
    title: 'AI & Machine Learning',
    description: 'Build ML models and AI solutions with Python',
    image: aiMlImg,
    icon: Server,
    path: '/course/ai-ml',
    learnPath: '/learn/ai-ml',
    duration: '24 Weeks',
    level: 'Intermediate',
    students: '300+',
    isOpen: false,
    startDate: 'May 1, 2026',
    spots: 'Waitlist open',
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    description: 'Network security, ethical hacking, and threat analysis',
    image: cybersecurityImg,
    icon: Code,
    path: '/course/cybersecurity',
    learnPath: '/learn/cybersecurity',
    duration: '18 Weeks',
    level: 'Beginner',
    students: '250+',
    isOpen: true,
    startDate: 'March 2, 2026',
    spots: '15 spots remaining',
  },
  {
    id: 'ux-ui-design',
    title: 'UX/UI Design',
    description: 'Design user-centered interfaces and prototypes',
    image: uxUiDesignImg,
    icon: Smartphone,
    path: '/course/ux-ui-design',
    learnPath: '/learn/ux-ui-design',
    duration: '16 Weeks',
    level: 'All Levels',
    students: '350+',
    isOpen: true,
    startDate: 'March 2, 2026',
    spots: '20 spots remaining',
  },
];

const MAX_ENROLLMENTS = 2;

// ---------------------------------------------------------------------------
// CourseCard
// ---------------------------------------------------------------------------
function CourseCard({ course, isEnrolled, isEnrolling, onEnrollClick }) {
  const Icon = course.icon;

  // ── ENROLLED CARD ────────────────────────────────────────────────────────
  if (isEnrolled) {
    return (
      <article className="group bg-white rounded-2xl overflow-hidden border-2 border-black flex flex-col">
        {/* Hero image — no overlay badges needed */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={course.image}
            alt={`${course.title} program`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          {/* Enrolled badge — only badge shown */}
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1.5 rounded-full font-bold text-xs bg-black text-white flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Enrolled
            </span>
          </div>

          {/* Program icon */}
          <div className="absolute bottom-4 left-4 bg-white p-3 rounded-xl shadow-lg">
            <Icon className="w-6 h-6 text-black" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow bg-white">
          <h2 className="text-xl font-bold text-black mb-2">{course.title}</h2>
          <p className="text-sm text-gray-600 mb-4 flex-grow">{course.description}</p>

          {/* Meta — duration, level, students only (no spots/open status) */}
          <div className="flex items-center justify-between text-xs mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Clock className="w-3.5 h-3.5" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Award className="w-3.5 h-3.5" />
              <span>{course.level}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Users className="w-3.5 h-3.5" />
              <span>{course.students}</span>
            </div>
          </div>

          {/* Single full-width CTA */}
          <button
            onClick={(e) => onEnrollClick(course, e)}
            className="w-full px-4 py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm bg-black text-white hover:bg-gray-900"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Continue Learning</span>
          </button>

          {/* Subtle curriculum link */}
          <a
            href={course.path}
            className="mt-3 w-full px-4 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-black transition-colors text-center no-underline"
          >
            View Curriculum →
          </a>
        </div>
      </article>
    );
  }

  // ── UNENROLLED CARD ──────────────────────────────────────────────────────
  return (
    <article className="group bg-white rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-black transition-all duration-300 flex flex-col">
      {/* Hero image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={course.image}
          alt={`${course.title} program`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Open / Closed status badge */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1.5 rounded-full font-bold text-xs uppercase tracking-wide ${
            course.isOpen ? 'bg-white text-black' : 'bg-black text-white'
          }`}>
            {course.isOpen ? '● Open' : '○ Closed'}
          </span>
        </div>

        {/* Program icon */}
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-xl shadow-lg">
          <Icon className="w-6 h-6 text-black" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow bg-white">
        <h2 className="text-xl font-bold text-black mb-2">{course.title}</h2>
        <p className="text-sm text-gray-600 mb-4 flex-grow">{course.description}</p>

        {/* Meta — includes spots for open courses */}
        <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Clock className="w-3.5 h-3.5" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Award className="w-3.5 h-3.5" />
              <span>{course.level}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Users className="w-3.5 h-3.5" />
              <span>{course.students}</span>
            </div>
            {course.isOpen && (
              <div className="flex items-center gap-1.5 text-black font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{course.spots}</span>
              </div>
            )}
          </div>
        </div>

        {/* CTAs */}
        <div className="space-y-2">
          <button
            onClick={(e) => onEnrollClick(course, e)}
            disabled={isEnrolling}
            className={`w-full px-4 py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
              !course.isOpen
                ? 'bg-gray-900 text-white hover:bg-black'
                : isEnrolling
                ? 'bg-black text-white opacity-75 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-900'
            }`}
          >
            {isEnrolling && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isEnrolling ? 'Processing...' : course.isOpen ? 'Apply Now' : 'Join Waitlist'}</span>
            {!isEnrolling && <ChevronRight className="w-4 h-4" />}
          </button>

          <a
            href={course.path}
            className="w-full px-4 py-3 rounded-lg font-semibold border-2 border-gray-200 text-black hover:border-black transition-all duration-300 flex items-center justify-center gap-2 text-sm no-underline"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Cohort start date nudge */}
        {course.isOpen && (
          <p className="mt-3 text-xs text-gray-500 text-center">
            Next cohort starts {course.startDate}
          </p>
        )}
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Section divider with label + count
// ---------------------------------------------------------------------------
function SectionRule({ label, count }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="text-xs font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs font-semibold text-gray-400">{count}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Programs
// ---------------------------------------------------------------------------
function Programs() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrolling, setEnrolling] = useState(null);
  const [showAllCourses, setShowAllCourses] = useState(false);

  // Modal state
  const [showMaxCoursesModal, setShowMaxCoursesModal] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [assessmentData, setAssessmentData] = useState({
    whyJoin: '',
    experienceLevel: '',
    learningGoals: '',
    weeklyCommitment: '',
  });

  // ── Auth + enrollment sync ────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const eligibility = await canEnrollInCourse(currentUser.uid, COURSES[0].id);
        setEnrolledCourses(eligibility.enrolledCourses || []);
      }
    });
    return () => unsubscribe();
  }, []);

  // ── Derived data ─────────────────────────────────────────────────────────
  const myCourses = COURSES.filter((c) => enrolledCourses.includes(c.id));
  const otherCourses = COURSES.filter((c) => !enrolledCourses.includes(c.id));
  const hasEnrolled = myCourses.length > 0;
  const slotsRemaining = MAX_ENROLLMENTS - myCourses.length;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleEnrollClick = async (course, e) => {
    e.preventDefault();

    if (!user) {
      navigate('/ehub');
      return;
    }

    // Already enrolled → go straight to learning
    if (enrolledCourses.includes(course.id)) {
      navigate(course.learnPath);
      return;
    }

    // Closed course → go to details/waitlist page
    if (!course.isOpen) {
      navigate(course.path);
      return;
    }

    // Check eligibility
    const eligibility = await canEnrollInCourse(user.uid, course.id);
    if (!eligibility.canEnroll) {
      if (eligibility.reason === 'max_courses_reached') setShowMaxCoursesModal(true);
      return;
    }

    setSelectedCourse(course);
    setShowWelcomeScreen(true);
  };

  const handleStartAssessment = () => {
    setShowWelcomeScreen(false);
    setShowAssessmentModal(true);
  };

  const handleAssessmentSubmit = async (e) => {
    e.preventDefault();

    const { whyJoin, experienceLevel, learningGoals, weeklyCommitment } = assessmentData;
    if (!whyJoin || !experienceLevel || !learningGoals || !weeklyCommitment) return;

    setShowAssessmentModal(false);
    setEnrolling(selectedCourse.id);

    const result = await enrollInCourse(user.uid, selectedCourse.id);

    if (result.success) {
      setEnrolledCourses((prev) => [...prev, selectedCourse.id]);
      setAssessmentData({ whyJoin: '', experienceLevel: '', learningGoals: '', weeklyCommitment: '' });
      setTimeout(() => navigate('/ehub'), 1500);
    }

    setEnrolling(null);
  };

  // ── SEO structured data ───────────────────────────────────────────────────
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: COURSES.map((course, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Course',
        name: course.title,
        description: course.description,
        provider: { '@type': 'Organization', name: 'SBA Programs', sameAs: 'https://yoursite.com' },
        courseMode: 'online',
        educationalLevel: course.level,
        timeRequired: course.duration,
      },
    })),
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Helmet>
        <title>Elite Tech Programs | SBA - Apply Today</title>
        <meta
          name="description"
          content="Join an exclusive cohort of ambitious learners. Rigorous, project-based programs in Full-Stack, Data Science, AI/ML, Cybersecurity & UX/UI. Limited spots available."
        />
        <link rel="canonical" href="https://yoursite.com/programs" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <article className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* ================================================================
              ENROLLED USER VIEW
          ================================================================ */}
          {hasEnrolled ? (
            <>
              {/* Header */}
              <header className="flex items-start justify-between flex-wrap gap-6 mb-12">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">My Programs</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black leading-tight">
                    Continue Learning
                  </h1>
                  <p className="mt-2 text-gray-500 text-sm">
                    {myCourses.length} of {MAX_ENROLLMENTS} program slots active.
                  </p>
                </div>

                <button
                  onClick={() => setShowAllCourses((v) => !v)}
                  className={`self-start flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all duration-200 ${
                    showAllCourses
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-300 hover:border-black'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  {showAllCourses ? 'Showing All Programs' : 'Browse All Programs'}
                </button>
              </header>

              {/* ── MY COURSES ONLY ── */}
              {!showAllCourses && (
                <>
                  <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                    {myCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        isEnrolled
                        isEnrolling={enrolling === course.id}
                        onEnrollClick={handleEnrollClick}
                      />
                    ))}

                    {/* Add another slot — only if under the limit */}
                    {slotsRemaining > 0 && (
                      <button
                        onClick={() => setShowAllCourses(true)}
                        className="group rounded-2xl border-2 border-dashed border-gray-300 hover:border-black transition-all duration-300 flex flex-col items-center justify-center gap-4 p-10 min-h-[380px] bg-white"
                      >
                        <div className="w-14 h-14 rounded-full bg-gray-100 group-hover:bg-black transition-all duration-300 flex items-center justify-center">
                          <Plus className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <div className="text-center">
                          <p className="text-base font-bold text-black mb-1">Add Another Program</p>
                          <p className="text-sm text-gray-500">
                            {slotsRemaining} slot{slotsRemaining !== 1 ? 's' : ''} remaining
                          </p>
                        </div>
                      </button>
                    )}
                  </section>

                  <div className="text-center">
                    <button
                      onClick={() => setShowAllCourses(true)}
                      className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-black transition-colors font-semibold"
                    >
                      <span>Explore all {COURSES.length} programs</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}

              {/* ── ALL PROGRAMS (grouped) ── */}
              {showAllCourses && (
                <div className="space-y-14">
                  <div>
                    <SectionRule label="Enrolled" count={myCourses.length} />
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {myCourses.map((course) => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          isEnrolled
                          isEnrolling={enrolling === course.id}
                          onEnrollClick={handleEnrollClick}
                        />
                      ))}
                    </div>
                  </div>

                  {otherCourses.length > 0 && (
                    <div>
                      <SectionRule label="Available to Enroll" count={otherCourses.length} />
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {otherCourses.map((course) => (
                          <CourseCard
                            key={course.id}
                            course={course}
                            isEnrolled={false}
                            isEnrolling={enrolling === course.id}
                            onEnrollClick={handleEnrollClick}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (

          /* ================================================================
              UNENROLLED / BROWSE VIEW
          ================================================================ */
            <>
              <header className="text-center mb-16 max-w-3xl mx-auto">
                <div className="inline-block mb-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-bold tracking-wider uppercase rounded-full">
                    <Award className="w-3.5 h-3.5" />
                    Elite Programs
                  </div>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-6 leading-tight">
                  Transform Your Career
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Join an exclusive cohort of ambitious professionals. Rigorous curriculum,
                  hands-on projects, and career support that gets results.
                </p>
              </header>

              <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {COURSES.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={false}
                    isEnrolling={enrolling === course.id}
                    onEnrollClick={handleEnrollClick}
                  />
                ))}
              </section>
            </>
          )}

          {/* Stats bar — always shown */}
          <section className="bg-black text-white rounded-2xl p-12 text-center mt-16">
            <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div>
                <div className="text-4xl font-bold mb-2">95%</div>
                <div className="text-sm text-gray-400 uppercase tracking-wide">Job Placement Rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">1,800+</div>
                <div className="text-sm text-gray-400 uppercase tracking-wide">Alumni Network</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">$85K</div>
                <div className="text-sm text-gray-400 uppercase tracking-wide">Avg. Starting Salary</div>
              </div>
            </div>
          </section>
        </div>
      </article>

      {/* ================================================================
          MODALS
      ================================================================ */}

      {/* Welcome / requirements screen */}
      {showWelcomeScreen && selectedCourse && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowWelcomeScreen(false)}
            />
            <div className="relative bg-white rounded-3xl p-12 max-w-2xl w-full shadow-2xl">
              <button
                onClick={() => setShowWelcomeScreen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-8">
                <div className="inline-block mb-4">
                  <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center">
                    <selectedCourse.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-black mb-3">
                  Application for {selectedCourse.title}
                </h2>
                <p className="text-gray-600 text-lg">
                  You're one step away from joining an elite cohort
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-8 mb-8">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Program Requirements
                </h3>
                <ul className="space-y-3">
                  {[
                    { label: 'Time Commitment', value: `10-15 hours per week for ${selectedCourse.duration}` },
                    { label: 'Dedication', value: 'Active participation in cohort activities and projects' },
                    { label: 'Equipment', value: 'Laptop with reliable internet connection' },
                    { label: 'Mindset', value: 'Growth mindset and willingness to collaborate' },
                  ].map(({ label, value }) => (
                    <li key={label} className="flex items-start gap-3 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0" />
                      <span>
                        <strong>{label}:</strong> {value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-2 border-black rounded-2xl p-8 mb-8">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  What to Expect
                </h3>
                <ul className="space-y-3">
                  {[
                    'Rigorous, project-based curriculum designed by industry experts',
                    '1-on-1 mentorship and weekly office hours',
                    'Portfolio-ready projects and capstone presentation',
                    'Career support including resume review and interview prep',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-black" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowWelcomeScreen(false)}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-black rounded-xl font-bold hover:border-black transition-all"
                >
                  Not Now
                </button>
                <button
                  onClick={handleStartAssessment}
                  className="flex-1 px-6 py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-all flex items-center justify-center gap-2"
                >
                  <span>Start Application</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assessment / application form */}
      {showAssessmentModal && selectedCourse && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowAssessmentModal(false)}
            />
            <div className="relative bg-white rounded-3xl p-12 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowAssessmentModal(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-8">
                <h2 className="text-3xl font-bold text-black mb-3">Application Assessment</h2>
                <p className="text-gray-600">
                  Help us understand your background and goals. There are no wrong answers—we want to know the real you.
                </p>
              </div>

              <form onSubmit={handleAssessmentSubmit} className="space-y-8">
                {/* Q1 */}
                <div>
                  <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wide">
                    1. Why do you want to join {selectedCourse.title}? *
                  </label>
                  <textarea
                    value={assessmentData.whyJoin}
                    onChange={(e) => setAssessmentData({ ...assessmentData, whyJoin: e.target.value })}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:border-black focus:outline-none resize-none text-gray-900"
                    rows={4}
                    placeholder="Share your motivation, career goals, or what excites you about this program..."
                    required
                  />
                </div>

                {/* Q2 */}
                <div>
                  <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wide">
                    2. What's your current experience level? *
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'beginner', label: 'Complete Beginner', desc: 'New to this field' },
                      { value: 'some', label: 'Some Experience', desc: '1-2 projects or courses' },
                      { value: 'intermediate', label: 'Intermediate', desc: 'Multiple projects, comfortable with basics' },
                      { value: 'advanced', label: 'Advanced', desc: 'Professional experience or extensive projects' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          assessmentData.experienceLevel === option.value
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 hover:border-black'
                        }`}
                      >
                        <input
                          type="radio"
                          name="experienceLevel"
                          value={option.value}
                          checked={assessmentData.experienceLevel === option.value}
                          onChange={(e) => setAssessmentData({ ...assessmentData, experienceLevel: e.target.value })}
                          className="mt-1 w-5 h-5"
                          required
                        />
                        <div className="flex-1">
                          <div className="font-bold text-sm mb-1">{option.label}</div>
                          <div className={`text-xs ${assessmentData.experienceLevel === option.value ? 'text-gray-300' : 'text-gray-500'}`}>
                            {option.desc}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Q3 */}
                <div>
                  <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wide">
                    3. What are your primary learning goals? *
                  </label>
                  <textarea
                    value={assessmentData.learningGoals}
                    onChange={(e) => setAssessmentData({ ...assessmentData, learningGoals: e.target.value })}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:border-black focus:outline-none resize-none text-gray-900"
                    rows={4}
                    placeholder="E.g., Career change, skill upgrade, build specific projects, start freelancing, etc."
                    required
                  />
                </div>

                {/* Q4 */}
                <div>
                  <label className="block text-sm font-bold text-black mb-3 uppercase tracking-wide">
                    4. Can you commit 10-15 hours per week? *
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'yes', label: 'Yes, I can commit 10-15 hours/week' },
                      { value: 'flexible', label: 'I have a flexible schedule and will make it work' },
                      { value: 'challenging', label: "It will be challenging but I'm committed" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          assessmentData.weeklyCommitment === option.value
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 hover:border-black'
                        }`}
                      >
                        <input
                          type="radio"
                          name="weeklyCommitment"
                          value={option.value}
                          checked={assessmentData.weeklyCommitment === option.value}
                          onChange={(e) => setAssessmentData({ ...assessmentData, weeklyCommitment: e.target.value })}
                          className="w-5 h-5"
                          required
                        />
                        <span className="font-semibold text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAssessmentModal(false)}
                    className="flex-1 px-8 py-4 border-2 border-gray-300 text-black rounded-xl font-bold hover:border-black transition-all"
                  >
                    Go Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-8 py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Submit Application</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Max enrollments reached */}
      {showMaxCoursesModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowMaxCoursesModal(false)}
            />
            <div className="relative bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-black mb-2">Maximum Enrollment Reached</h3>
                  <p className="text-gray-600 mb-4">
                    You can enroll in up to {MAX_ENROLLMENTS} programs simultaneously. Currently enrolled:
                  </p>
                  <ul className="space-y-2 mb-4">
                    {enrolledCourses.map((id) => {
                      const course = COURSES.find((c) => c.id === id);
                      return (
                        <li key={id} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-black" />
                          {course?.title ?? id}
                        </li>
                      );
                    })}
                  </ul>
                  <p className="text-sm text-gray-500">Complete or drop a program to enroll in another.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMaxCoursesModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-black rounded-xl font-bold hover:border-black transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => { setShowMaxCoursesModal(false); navigate('/ehub'); }}
                  className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-900 transition-all"
                >
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Programs;