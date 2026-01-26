import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import logo192 from '../../assets/favicon_io/android-chrome-192x192.png';
import { Clock, BookOpen, Award, CheckCircle, X, ChevronRight } from 'lucide-react';

export default function TechCareer() {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollStep, setEnrollStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({
    timeCommitment: '',
    goal: '',
    experience: '',
    commitment: ''
  });
  const courseId = 'tech-career';
  const videoId = 'ua-CiDNNj30';

  useEffect(() => {
    checkEnrollment();
  }, []);

  const checkEnrollment = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setIsEnrolled(userData.enrolledCourses?.includes(courseId) || false);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = () => {
    if (isEnrolled) {
      alert('You are already enrolled in this course!');
    } else {
      setShowEnrollModal(true);
      setEnrollStep(1);
    }
  };

  const handleNext = () => {
    if (enrollStep === 2) {
      const weakAnswers =
        answers.timeCommitment === 'less5' ||
        answers.commitment === 'notsure' ||
        answers.experience === 'none';
      if (weakAnswers) {
        setShowWarning(true);
      } else {
        setEnrollStep(3);
      }
    } else {
      setEnrollStep(enrollStep + 1);
    }
  };

  const handleBack = () => {
    setShowWarning(false);
    setEnrollStep(enrollStep - 1);
  };

  const continueAnyway = () => {
    setShowWarning(false);
    setEnrollStep(3);
  };

  const handleConfirmEnroll = async () => {
    try {
      setEnrolling(true);
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        enrolledCourses: arrayUnion(courseId)
      });
      setIsEnrolled(true);
      setShowEnrollModal(false);
      setEnrollStep(1);
      setAnswers({
        timeCommitment: '',
        goal: '',
        experience: '',
        commitment: ''
      });
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('Failed to enroll. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(to bottom, #a5b4fc, #e0e7ff)'}}>
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(to bottom, #a5b4fc, #e0e7ff)'}}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo192} alt="Logo" className="w-10 h-10" />
              <button onClick={() => navigate('/ehub')} className="text-gray-600 hover:text-gray-900">
                ← Back to EHub
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Section */}
      <section className="min-h-[calc(120vh-4rem-8rem)] flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="bg-white rounded-3xl p-8 md:p-20 flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 text-gray-900">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">Data Science</h1>
              <h2 className="text-3xl font-bold mb-4">This program Includes:</h2>
              <ul className="space-y-4 text-xl">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  3 months ALX Foundations leadership and skills development
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  Data science basics – data visualisation, data modelling, and database management
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  Master complex topics like natural language processing and machine learning
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  How to use data science skills in practical, real-world scenarios
                </li>
              </ul>
              <button
                onClick={handleEnrollClick}
                className="mt-8 bg-black text-white px-8 py-4 rounded font-medium"
              >
                {isEnrolled ? '✓ Enrolled - Start Learning' : 'Enroll Now'}
              </button>
            </div>
            <div className="md:w-1/2">
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="Data Science Introduction"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {enrollStep === 1 && (
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Course Overview</h3>
                  <button onClick={() => setShowEnrollModal(false)}>
                    <X className="w-6 h-6 text-gray-600 hover:text-gray-900" />
                  </button>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Time Commitment</h4>
                    <p className="text-gray-600">8-12 hours per week for 3 months</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">What's Included</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        3 months ALX Foundations leadership and skills development
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Data science basics – data visualisation, data modelling, and database management
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Master complex topics like natural language processing and machine learning
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        How to use data science skills in practical, real-world scenarios
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Prerequisites</h4>
                    <p className="text-gray-600">Basic computer skills and mathematics - suitable for beginners</p>
                  </div>
                </div>
                <button
                  onClick={handleNext}
                  className="w-full mt-8 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                >
                  Continue to Assessment
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
            {enrollStep === 2 && !showWarning && (
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Readiness Assessment</h3>
                  <button onClick={() => setShowEnrollModal(false)}>
                    <X className="w-6 h-6 text-gray-600 hover:text-gray-900" />
                  </button>
                </div>
                <p className="text-gray-600 mb-8">Help us understand your learning goals and availability</p>
                <div className="space-y-6">
                  <div>
                    <label className="block font-semibold text-gray-900 mb-3">
                      1. How much time can you dedicate weekly?
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'less5', label: 'Less than 5 hours' },
                        { value: '5-10', label: '8-12 hours (Recommended)' },
                        { value: 'more10', label: 'More than 12 hours' }
                      ].map(option => (
                        <label key={option.value} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="timeCommitment"
                            value={option.value}
                            checked={answers.timeCommitment === option.value}
                            onChange={(e) => setAnswers({...answers, timeCommitment: e.target.value})}
                            className="w-4 h-4"
                          />
                          <span className="text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-900 mb-3">
                      2. What's your primary goal?
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'career', label: 'Career advancement' },
                        { value: 'skill', label: 'Skill development' },
                        { value: 'interest', label: 'Personal interest' }
                      ].map(option => (
                        <label key={option.value} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="goal"
                            value={option.value}
                            checked={answers.goal === option.value}
                            onChange={(e) => setAnswers({...answers, goal: e.target.value})}
                            className="w-4 h-4"
                          />
                          <span className="text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-900 mb-3">
                      3. Your experience level with data or programming?
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'none', label: 'Complete beginner' },
                        { value: 'some', label: 'Some basic knowledge' },
                        { value: 'experienced', label: 'Comfortable with basics' }
                      ].map(option => (
                        <label key={option.value} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="experience"
                            value={option.value}
                            checked={answers.experience === option.value}
                            onChange={(e) => setAnswers({...answers, experience: e.target.value})}
                            className="w-4 h-4"
                          />
                          <span className="text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-900 mb-3">
                      4. Can you commit to completing this course?
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'yes', label: 'Yes, definitely' },
                        { value: 'maybe', label: 'Probably' },
                        { value: 'notsure', label: 'Not sure yet' }
                      ].map(option => (
                        <label key={option.value} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="commitment"
                            value={option.value}
                            checked={answers.commitment === option.value}
                            onChange={(e) => setAnswers({...answers, commitment: e.target.value})}
                            className="w-4 h-4"
                          />
                          <span className="text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={handleBack}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!answers.timeCommitment || !answers.goal || !answers.experience || !answers.commitment}
                    className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
            {showWarning && (
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-orange-600">⚠️ Important Notice</h3>
                  <button onClick={() => setShowEnrollModal(false)}>
                    <X className="w-6 h-6 text-gray-600 hover:text-gray-900" />
                  </button>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
                  <p className="text-gray-800 mb-4">
                    Based on your responses, we noticed you might face challenges with this course's time commitment or requirements.
                  </p>
                  <p className="text-gray-800 font-medium">
                    Data science requires consistent practice and basic math skills. We recommend ensuring you have adequate time before enrolling.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleBack}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-all"
                  >
                    Review My Answers
                  </button>
                  <button
                    onClick={continueAnyway}
                    className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-all"
                  >
                    Continue Anyway
                  </button>
                </div>
              </div>
            )}
            {enrollStep === 3 && (
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Confirm Enrollment</h3>
                  <button onClick={() => setShowEnrollModal(false)}>
                    <X className="w-6 h-6 text-gray-600 hover:text-gray-900" />
                  </button>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <p className="text-gray-800 font-medium mb-4">
                    🎉 You're ready to enroll in Data Science!
                  </p>
                  <p className="text-gray-700">
                    You'll get immediate access to all course materials and can start analyzing data right away.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Your Commitment:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Weekly time: {
                      answers.timeCommitment === 'less5' ? 'Less than 5 hours' :
                      answers.timeCommitment === '5-10' ? '8-12 hours' :
                      'More than 12 hours'
                    }</li>
                    <li>• Goal: {
                      answers.goal === 'career' ? 'Career advancement' :
                      answers.goal === 'skill' ? 'Skill development' :
                      'Personal interest'
                    }</li>
                    <li>• Experience: {
                      answers.experience === 'none' ? 'Complete beginner' :
                      answers.experience === 'some' ? 'Some basic knowledge' :
                      'Comfortable with basics'
                    }</li>
                  </ul>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleBack}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmEnroll}
                    disabled={enrolling}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {enrolling ? 'Enrolling...' : 'Confirm & Enroll'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-gray-600 text-sm">
          <div className="flex gap-4 mb-4 md:mb-0">
            <a href="#" className="hover:text-gray-900">Terms of Service</a>
            <a href="#" className="hover:text-gray-900">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900">FAQ</a>
          </div>
          <div className="flex gap-4">
            {/* Add social icons if needed */}
          </div>
        </div>
      </footer>
    </div>
  );
}