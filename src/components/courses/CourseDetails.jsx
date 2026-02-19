import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { auth } from '../../firebase';
import logo192 from '../../assets/favicon_io/android-chrome-192x192.png';
import courseData from '../../data/courseData.json';
import { canEnrollInCourse, enrollInCourse, unenrollFromCourse } from '../../utils/enrollmentUtils';
import {
  Clock,
  Award,
  CheckCircle,
  Users,
  BookOpen,
  ArrowRight,
  ChevronDown,
  AlertCircle,
  Loader2,
  XCircle,
  X,
  ChevronRight,
  Shield,
  TrendingUp,
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
  const [successMsg, setSuccessMsg] = useState(null);
  const [showMaxCoursesModal, setShowMaxCoursesModal] = useState(false);
  const [showUnenrollModal, setShowUnenrollModal] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [assignedCohort, setAssignedCohort] = useState(null);
  const [assessmentData, setAssessmentData] = useState({
    whyJoin: '', experienceLevel: '', learningGoals: '', weeklyCommitment: ''
  });

  const course = courseData[courseId];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const eligibility = await canEnrollInCourse(currentUser.uid, courseId);
        if (eligibility.reason === 'already_enrolled') setIsEnrolled(true);
        setEnrolledCourses(eligibility.enrolledCourses || []);
      }
    });
    return () => unsubscribe();
  }, [courseId]);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">404</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Course Not Found</h1>
          <p className="text-gray-500 mb-8">The program you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/')} className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleEnrollClick = async () => {
    setError(null);
    if (!user) { navigate('/ehub'); return; }
    if (isEnrolled) { navigate(`/learn/${courseId}`); return; }
    if (!course.isOpen) {
      setError('This program is currently closed for enrollment. Join the waitlist to be notified when it opens.');
      return;
    }
    const eligibility = await canEnrollInCourse(user.uid, courseId);
    if (!eligibility.canEnroll) {
      if (eligibility.reason === 'max_courses_reached') { setShowMaxCoursesModal(true); return; }
      setError('Unable to enroll at this time. Please try again.');
      return;
    }
    setShowWelcomeScreen(true);
  };

  const handleAssessmentSubmit = async (e) => {
    e.preventDefault();
    if (!assessmentData.whyJoin || !assessmentData.experienceLevel ||
        !assessmentData.learningGoals || !assessmentData.weeklyCommitment) {
      setError('Please answer all questions before submitting.');
      return;
    }
    setShowAssessmentModal(false);
    setError(null);
    setEnrolling(true);
    const result = await enrollInCourse(user.uid, courseId);
    if (result.success) {
      setIsEnrolled(true);
      setAssignedCohort(result.cohort);
      setSuccessMsg('Successfully enrolled! Redirecting to your dashboard…');
      setAssessmentData({ whyJoin: '', experienceLevel: '', learningGoals: '', weeklyCommitment: '' });
      setTimeout(() => navigate('/ehub'), 2500);
    } else {
      setError('Enrollment failed. Please try again.');
    }
    setEnrolling(false);
  };

  const handleUnenroll = async () => {
    if (!user) return;
    setUnenrolling(true);
    const result = await unenrollFromCourse(user.uid, courseId);
    if (result.success) {
      setIsEnrolled(false);
      setAssignedCohort(null);
      setShowUnenrollModal(false);
      setSuccessMsg('Successfully dropped. Redirecting…');
      setTimeout(() => navigate('/ehub'), 1200);
    } else {
      setError('Failed to drop this course. Please try again.');
      setShowUnenrollModal(false);
    }
    setUnenrolling(false);
  };

  const enrollBtnLabel = () => {
    if (!user) return course.isOpen ? 'Sign In to Enroll' : 'Sign In to Join Waitlist';
    if (enrolling) return 'Processing…';
    if (isEnrolled) return 'Continue Learning';
    return course.isOpen ? 'Enroll Now' : 'Join Waitlist';
  };

  // ── SEO structured data ────────────────────────────────────────────────────
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    provider: { '@type': 'EducationalOrganization', name: 'SBA Tech School', url: 'https://sbatechschool.com' },
    courseMode: 'online',
    educationalLevel: course.level,
    timeRequired: course.duration,
    url: `https://sbatechschool.com/course/${courseId}`,
    offers: {
      '@type': 'Offer', price: course.price, priceCurrency: 'USD',
      availability: course.isOpen ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      validFrom: course.startDate,
    },
    ...(course.instructor && {
      instructor: { '@type': 'Person', name: course.instructor.name, jobTitle: course.instructor.title }
    }),
  };

  return (
    <>
      <Helmet>
        <title>{course.title} | SBA Tech School</title>
        <meta name="description" content={`${course.subtitle} — ${course.duration}, ${course.level}. ${course.description?.slice(0, 145)}…`} />
        <link rel="canonical" href={`https://sbatechschool.com/course/${courseId}`} />
        <meta property="og:title" content={`${course.title} | SBA Tech School`} />
        <meta property="og:description" content={course.subtitle} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">

        {/* ── HEADER ── */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo192} alt="SBA Tech School" className="w-9 h-9" />
              <button
                onClick={() => navigate(user ? '/ehub' : '/')}
                className="text-sm text-gray-500 hover:text-gray-900 font-semibold transition-colors"
              >
                ← Back to {user ? 'Dashboard' : 'Home'}
              </button>
            </div>
            <div className="flex items-center gap-3">
              {isEnrolled && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" /> Enrolled
                </span>
              )}
              {!user && (
                <button
                  onClick={() => navigate('/ehub')}
                  className="px-5 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ── HERO ── */}
        <section className="bg-gray-900 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

              {/* Left */}
              <div>
                {/* Status badges */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                    course.isOpen ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {course.isOpen ? <><CheckCircle className="w-3.5 h-3.5" /> Open for Enrollment</> : '🔒 Enrollment Closed'}
                  </span>
                  {isEnrolled && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                      <CheckCircle className="w-3.5 h-3.5" /> You're Enrolled
                    </span>
                  )}
                </div>

                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
                  {course.title}
                </h1>
                <p className="text-lg text-gray-400 mb-7 leading-relaxed">
                  {course.subtitle}
                </p>

                {/* Meta */}
                <div className="flex flex-wrap gap-5 mb-7">
                  {[
                    { icon: Clock, label: course.duration },
                    { icon: Award, label: course.level },
                    { icon: BookOpen, label: course.price },
                    { icon: Users, label: `${course.students} students` },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-gray-300">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Cohort info */}
                {isEnrolled && assignedCohort && (
                  <div className="mb-5 p-4 bg-gray-800 border border-gray-700 rounded-xl">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Your Cohort</p>
                    <p className="text-white font-bold">{assignedCohort.name}</p>
                    <p className="text-gray-400 text-sm mt-0.5">
                      {new Date(assignedCohort.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      {' — '}
                      {new Date(assignedCohort.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                )}

                {/* Alerts */}
                {error && (
                  <div className="mb-4 p-3.5 bg-red-900/40 border border-red-700 rounded-lg flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}
                {successMsg && (
                  <div className="mb-4 p-3.5 bg-green-900/40 border border-green-700 rounded-lg flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-green-300 text-sm font-medium">{successMsg}</p>
                  </div>
                )}

                {/* CTAs */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleEnrollClick}
                    disabled={enrolling}
                    className={`px-7 py-3.5 rounded-xl font-bold text-base transition-all flex items-center gap-2 ${
                      isEnrolled
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-white text-black hover:bg-gray-100'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {enrolling && <Loader2 className="w-4 h-4 animate-spin" />}
                    {!enrolling && isEnrolled && <CheckCircle className="w-4 h-4" />}
                    {enrollBtnLabel()}
                    {!enrolling && <ArrowRight className="w-4 h-4" />}
                  </button>

                  {isEnrolled && user && (
                    <button
                      onClick={() => setShowUnenrollModal(true)}
                      className="px-7 py-3.5 border-2 border-red-500 text-red-400 rounded-xl font-bold text-base hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Drop Course
                    </button>
                  )}
                </div>

                {course.isOpen && !isEnrolled && (
                  <p className="mt-3 text-sm text-gray-500 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    Next cohort starts <span className="text-gray-300 font-semibold ml-1">{course.startDate}</span>
                  </p>
                )}
              </div>

              {/* Right — video */}
              <div className="order-first lg:order-last">
                <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                  <iframe
                    width="100%" height="100%"
                    src={`https://www.youtube.com/embed/${course.videoId}`}
                    title={`${course.title} — Program Overview`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── BODY ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid lg:grid-cols-3 gap-10 items-start">

            {/* ── MAIN CONTENT (2/3 width) ── */}
            <div className="lg:col-span-2 space-y-12">

              {/* What You'll Learn */}
              <section aria-labelledby="learn-heading">
                <h2 id="learn-heading" className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                  What You'll Learn
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.whatYouWillLearn?.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Overview */}
              <section aria-labelledby="overview-heading">
                <h2 id="overview-heading" className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                  Course Overview
                </h2>
                <p className="text-gray-700 leading-relaxed text-base">
                  {course.description}
                </p>
              </section>

              {/* Curriculum */}
              <section aria-labelledby="curriculum-heading">
                <h2 id="curriculum-heading" className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                  Curriculum
                </h2>
                <div className="space-y-3 max-w-3xl">
                  {course.curriculum?.map((module, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                      <button
                        onClick={() => setExpandedModule(expandedModule === i ? null : i)}
                        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors text-left"
                        aria-expanded={expandedModule === i}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${
                            expandedModule === i ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {i + 1}
                          </span>
                          <span className="font-semibold text-gray-900 text-sm sm:text-base">{module.module}</span>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${expandedModule === i ? 'rotate-180' : ''}`} />
                      </button>
                      {expandedModule === i && (
                        <div className="px-5 pb-5 bg-gray-50">
                          <ul className="space-y-2.5">
                            {module.topics?.map((topic, j) => (
                              <li key={j} className="flex items-center gap-2.5 text-sm text-gray-700">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                                {topic}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* What's Included */}
              <section aria-labelledby="features-heading">
                <h2 id="features-heading" className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                  What's Included
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.features?.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-200">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Instructor */}
              {course.instructor && (
                <section aria-labelledby="instructor-heading">
                  <h2 id="instructor-heading" className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                    Meet Your Instructor
                  </h2>
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row gap-5 max-w-2xl">
                    <img
                      src={course.instructor.image}
                      alt={course.instructor.name}
                      className="w-20 h-20 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-200"
                    />
                    <div>
                      <p className="text-lg font-bold text-gray-900 mb-0.5">{course.instructor.name}</p>
                      <p className="text-sm text-gray-500 mb-3">{course.instructor.title}</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{course.instructor.bio}</p>
                    </div>
                  </div>
                </section>
              )}

              {/* Prerequisites */}
              {course.prerequisites && (
                <section aria-labelledby="prereq-heading">
                  <h2 id="prereq-heading" className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                    Prerequisites
                  </h2>
                  <div className="bg-white rounded-xl border-l-4 border-l-gray-900 border border-gray-200 p-6 max-w-2xl">
                    <p className="text-gray-700 leading-relaxed">{course.prerequisites}</p>
                  </div>
                </section>
              )}
            </div>

            {/* ── SIDEBAR — sticky enroll card ── */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
                <div className="h-1 bg-gradient-to-r from-black to-gray-500" />
                <div className="p-6">

                  {/* Price */}
                  <div className="mb-5">
                    <p className="text-3xl font-bold text-gray-900 mb-1">{course.price}</p>
                    <p className="text-sm text-gray-500">
                      {course.isOpen
                        ? <>Cohort starts <span className="font-semibold text-gray-900">{course.startDate}</span></>
                        : 'Check back for upcoming dates'
                      }
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3 mb-5 pb-5 border-b border-gray-100">
                    {[
                      { icon: Clock, label: 'Duration', value: course.duration },
                      { icon: Award, label: 'Level', value: course.level },
                      { icon: Users, label: 'Students', value: course.students },
                      { icon: BookOpen, label: 'Format', value: 'Cohort-based, online' },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Icon className="w-3.5 h-3.5" />
                          <span className="text-xs">{label}</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Sidebar alerts */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700">{error}</p>
                    </div>
                  )}
                  {successMsg && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-green-800 font-medium">{successMsg}</p>
                    </div>
                  )}

                  {/* CTA buttons */}
                  <div className="space-y-2.5">
                    <button
                      onClick={handleEnrollClick}
                      disabled={enrolling}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        isEnrolled
                          ? 'bg-white border-2 border-black text-black hover:bg-black hover:text-white'
                          : 'bg-black text-white hover:bg-gray-800'
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      {enrolling && <Loader2 className="w-4 h-4 animate-spin" />}
                      {!enrolling && isEnrolled && <CheckCircle className="w-4 h-4" />}
                      {enrollBtnLabel()}
                      {!enrolling && <ChevronRight className="w-4 h-4" />}
                    </button>

                    {isEnrolled && user && (
                      <button
                        onClick={() => setShowUnenrollModal(true)}
                        className="w-full py-2.5 border border-red-300 text-red-500 rounded-xl text-xs font-semibold hover:bg-red-50 hover:border-red-500 transition-all flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Drop this course
                      </button>
                    )}

                    <a
                      href="mailto:admissions@sbatechschool.com"
                      className="w-full py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:border-gray-400 hover:text-gray-900 transition-all flex items-center justify-center gap-1.5 no-underline"
                    >
                      Contact Admissions
                    </a>
                  </div>

                  {/* Trust signals */}
                  <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
                    {[
                      { icon: Shield, text: '95% job placement rate' },
                      { icon: TrendingUp, text: '$85K avg. starting salary' },
                      { icon: Users, text: '1,800+ alumni network' },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-xs text-gray-500">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* ── BOTTOM CTA ── */}
          <div className="mt-16 bg-gray-900 rounded-2xl px-8 py-10 sm:px-12 sm:py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                {course.isOpen ? 'Spring 2026 · Now Enrolling' : 'Waitlist Open'}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Ready to get started?</h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                {course.isOpen
                  ? `Seats are limited. Apply today and we'll review your application within 24 hours.`
                  : `Join the waitlist to be first notified when the next cohort opens.`
                }
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0 flex-wrap">
              <button
                onClick={handleEnrollClick}
                disabled={enrolling}
                className="px-7 py-3.5 bg-white text-black font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {isEnrolled ? 'Continue Learning' : course.isOpen ? 'Apply Now' : 'Join Waitlist'}
                <ArrowRight className="w-4 h-4" />
              </button>
              <a href="/programs" className="px-7 py-3.5 border border-gray-700 text-gray-400 font-semibold text-sm rounded-xl hover:border-gray-400 hover:text-gray-200 transition-colors no-underline flex items-center gap-2">
                All Programs
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          MODALS — all original logic, cleaned UI
      ══════════════════════════════════════ */}

      {/* Welcome Screen */}
      {showWelcomeScreen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowWelcomeScreen(false)} />
            <div className="relative bg-white rounded-2xl p-10 max-w-xl w-full shadow-2xl">
              <button onClick={() => setShowWelcomeScreen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-black transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="text-center mb-7">
                <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Application for {course.title}</h2>
                <p className="text-gray-500 text-sm">Review the requirements before beginning your application.</p>
              </div>

              {/* 2×2 quick stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: 'Time / Week', value: '10–15 hours' },
                  { label: 'Duration', value: course.duration },
                  { label: 'Format', value: 'Cohort-based' },
                  { label: 'Starts', value: course.startDate },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3.5 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="text-sm font-bold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-200">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">What You'll Get</p>
                {[
                  'Rigorous, project-based curriculum by industry experts',
                  '1-on-1 mentorship and weekly office hours',
                  'Portfolio-ready capstone project',
                  'Career support — resume review & interview prep',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2.5 mb-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowWelcomeScreen(false)} className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:border-gray-400 transition-all text-sm">
                  Not Now
                </button>
                <button onClick={() => { setShowWelcomeScreen(false); setShowAssessmentModal(true); }}
                  className="flex-2 flex-grow py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all text-sm flex items-center justify-center gap-2">
                  Start Application <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assessment */}
      {showAssessmentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAssessmentModal(false)} />
            <div className="relative bg-white rounded-2xl p-8 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Application Assessment</h3>
                  <p className="text-sm text-gray-500">No wrong answers — help us understand your goals.</p>
                </div>
                <button onClick={() => setShowAssessmentModal(false)} className="text-gray-400 hover:text-black transition-colors ml-4">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssessmentSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    1. Why do you want to join this program? *
                  </label>
                  <textarea
                    value={assessmentData.whyJoin}
                    onChange={e => setAssessmentData(p => ({ ...p, whyJoin: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-black focus:outline-none resize-none text-sm text-gray-900"
                    rows={3} placeholder="Share your motivation and career goals…" required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    2. Current experience level *
                  </label>
                  <div className="space-y-2">
                    {[
                      { v: 'beginner', l: 'Complete Beginner', d: 'New to this field' },
                      { v: 'some', l: 'Some Experience', d: '1–2 projects or courses' },
                      { v: 'intermediate', l: 'Intermediate', d: 'Multiple projects, comfortable with basics' },
                      { v: 'advanced', l: 'Advanced', d: 'Professional or extensive self-directed work' },
                    ].map(opt => (
                      <label key={opt.v} className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${
                        assessmentData.experienceLevel === opt.v ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'
                      }`}>
                        <input type="radio" name="exp" value={opt.v}
                          checked={assessmentData.experienceLevel === opt.v}
                          onChange={e => setAssessmentData(p => ({ ...p, experienceLevel: e.target.value }))}
                          className="mt-0.5 w-4 h-4" required
                        />
                        <div>
                          <p className="font-bold text-sm">{opt.l}</p>
                          <p className={`text-xs mt-0.5 ${assessmentData.experienceLevel === opt.v ? 'text-gray-300' : 'text-gray-500'}`}>{opt.d}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    3. Primary learning goals *
                  </label>
                  <textarea
                    value={assessmentData.learningGoals}
                    onChange={e => setAssessmentData(p => ({ ...p, learningGoals: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-black focus:outline-none resize-none text-sm text-gray-900"
                    rows={3} placeholder="Career change, skill upgrade, build projects, etc." required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    4. Can you commit 10–15 hours per week? *
                  </label>
                  <div className="space-y-2">
                    {[
                      { v: 'yes', l: 'Yes, fully committed to 10–15 hrs/week' },
                      { v: 'flexible', l: "My schedule is flexible — I'll make it work" },
                      { v: 'challenging', l: "It'll be a stretch, but I'm committed" },
                    ].map(opt => (
                      <label key={opt.v} className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${
                        assessmentData.weeklyCommitment === opt.v ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'
                      }`}>
                        <input type="radio" name="commit" value={opt.v}
                          checked={assessmentData.weeklyCommitment === opt.v}
                          onChange={e => setAssessmentData(p => ({ ...p, weeklyCommitment: e.target.value }))}
                          className="w-4 h-4" required
                        />
                        <span className="font-semibold text-sm">{opt.l}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowAssessmentModal(false); setShowWelcomeScreen(true); }}
                    className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:border-gray-400 transition-all text-sm">
                    ← Back
                  </button>
                  <button type="submit"
                    className="flex-grow py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all text-sm flex items-center justify-center gap-2">
                    Submit & Enroll <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Max Courses */}
      {showMaxCoursesModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowMaxCoursesModal(false)} />
            <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-11 h-11 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Maximum Courses Reached</h3>
                  <p className="text-sm text-gray-600 mb-3">You can only be enrolled in 2 courses at a time. Currently enrolled:</p>
                  <div className="space-y-1.5 mb-3">
                    {enrolledCourses.map(id => {
                      const c = courseData[id];
                      return (
                        <div key={id} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          {c?.title || id}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500">Complete or drop a course to enroll in a new one.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowMaxCoursesModal(false)} className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:border-gray-400 transition-all">
                  Close
                </button>
                <button onClick={() => { setShowMaxCoursesModal(false); navigate('/ehub'); }}
                  className="flex-1 py-2.5 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all">
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unenroll Confirm */}
      {showUnenrollModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowUnenrollModal(false)} />
            <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Drop this course?</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    You're about to drop <strong>{course.title}</strong>.
                  </p>
                  <p className="text-xs text-gray-500">Your progress will be saved. You can re-enroll if the course is still open.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowUnenrollModal(false)} disabled={unenrolling}
                  className="flex-1 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:border-gray-400 transition-all">
                  Cancel
                </button>
                <button onClick={handleUnenroll} disabled={unenrolling}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  {unenrolling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {unenrolling ? 'Dropping…' : 'Yes, Drop Course'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}