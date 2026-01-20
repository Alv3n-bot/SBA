import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Menu,
  X,
  BookOpen,
  Play,
  FileText,
  Clock,
  Award,
  Home,
  ChevronDown,
  Send,
  Edit2,
  Lock,
  CreditCard,
  Zap,
  RotateCcw
} from 'lucide-react';

export default function CourseLearning() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [userData, setUserData] = useState(null);
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [quizStates, setQuizStates] = useState({});
  const [submissions, setSubmissions] = useState({});
  const [editingSubmission, setEditingSubmission] = useState(null);
  const [linkInput, setLinkInput] = useState('');
  const [activeTab, setActiveTab] = useState('content');
  const [peerWeekIndex, setPeerWeekIndex] = useState(0);
  const [assignmentsByWeek, setAssignmentsByWeek] = useState({});
  const [peerSubmissions, setPeerSubmissions] = useState({});
  const [reviews, setReviews] = useState({});
  const [quizScores, setQuizScores] = useState({});
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);

  useEffect(() => {
    loadCourseAndProgress();
  }, [courseId]);

  // Check subscription status
  const checkSubscription = (userData) => {
    if (!userData?.subscription?.endDate) return false;
    const endDate = userData.subscription.endDate.toDate
      ? userData.subscription.endDate.toDate()
      : new Date(userData.subscription.endDate);
    return endDate > new Date();
  };

  // Load course data and user progress
  const loadCourseAndProgress = async () => {
    setLoading(true);
    setError('');
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      // Load user data and check subscription
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        const isActive = checkSubscription(data);
        setHasActiveSubscription(isActive);
        setSubscriptionChecked(true);
        if (!isActive) {
          setLoading(false);
          return;
        }
      } else {
        setSubscriptionChecked(true);
        setHasActiveSubscription(false);
        setLoading(false);
        return;
      }

      // Load course
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      if (!courseDoc.exists()) {
        setError('Course not found');
        setLoading(false);
        return;
      }
      const courseData = courseDoc.data();
      setCourse(courseData);

      // Initialize expanded weeks
      const initialExpanded = {};
      courseData.weeks.forEach(week => {
        initialExpanded[week.id] = false;
      });
      setExpandedWeeks(initialExpanded);

      // Load or initialize progress
      const progressDoc = await getDoc(doc(db, 'progress', `${user.uid}_${courseId}`));
      let progressData;
      if (progressDoc.exists()) {
        progressData = progressDoc.data();
        setUserProgress(progressData);
      } else {
        progressData = {
          userId: user.uid,
          courseId: courseId,
          completedSections: [],
          quizScores: {},
          lastAccessedWeek: 0,
          lastAccessedSection: 0,
          startedAt: new Date(),
          lastAccessedAt: new Date()
        };
        await setDoc(doc(db, 'progress', `${user.uid}_${courseId}`), progressData);
        setUserProgress(progressData);
      }

      // Collect assignments and initialize states
      const assByWeek = {};
      const subs = {};
      const quizzes = {};
      const scores = progressData.quizScores || {};

      courseData.weeks.forEach(week => {
        assByWeek[week.id] = [];
        week.sections.forEach(section => {
          section.content.forEach(block => {
            if (block.type === 'assignment' && block.submissionType === 'link') {
              assByWeek[week.id].push(block.id);
              subs[block.id] = { link: '', submittedAt: null };
            } else if (block.type === 'quiz' && Array.isArray(block.questions)) {
              quizzes[block.id] = { 
                questions: block.questions.map(() => ({ selected: null, submitted: false })),
                score: scores[block.id] || null
              };
            }
          });
        });
      });

      setAssignmentsByWeek(assByWeek);
      setQuizStates(quizzes);
      setQuizScores(scores);

      // Fetch submissions
      for (const blockId in subs) {
        const subDoc = await getDoc(doc(db, 'submissions', `${user.uid}_${courseId}_${blockId}`));
        if (subDoc.exists()) {
          subs[blockId] = subDoc.data();
        }
      }
      setSubmissions(subs);

      // Fetch quiz submissions
      for (const blockId in quizzes) {
        const block = courseData.weeks.flatMap(w => w.sections).flatMap(s => s.content).find(b => b.id === blockId && b.type === 'quiz');
        if (block && Array.isArray(block.questions)) {
          for (let qIdx = 0; qIdx < block.questions.length; qIdx++) {
            const quizDoc = await getDoc(doc(db, 'quiz_submissions', `${user.uid}_${courseId}_${blockId}_${qIdx}`));
            if (quizDoc.exists()) {
              const data = quizDoc.data();
              quizzes[blockId].questions[qIdx] = { selected: data.answer, submitted: true };
            }
          }
        }
      }
      setQuizStates(quizzes);

      // Load peer submissions
      const peerSubs = {};
      for (const weekId in assByWeek) {
        peerSubs[weekId] = [];
        for (const blockId of assByWeek[weekId]) {
          const q = query(collection(db, 'submissions'), where('courseId', '==', courseId), where('blockId', '==', blockId));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.userId !== user.uid) {
              peerSubs[weekId].push({ ...data, submissionId: doc.id, blockId });
            }
          });
        }
      }
      setPeerSubmissions(peerSubs);

      // Load reviews
      const revs = {};
      for (const weekId in peerSubs) {
        for (const sub of peerSubs[weekId]) {
          const reviewDoc = await getDoc(doc(db, 'reviews', `${sub.submissionId}_${auth.currentUser.uid}`));
          if (reviewDoc.exists()) {
            revs[sub.submissionId] = reviewDoc.data();
          }
        }
      }
      setReviews(revs);

    } catch (err) {
      console.error('Error loading course:', err);
      setError('Error loading course: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if section is complete automatically based on quiz/assignment completion
  const checkSectionComplete = async (blockId) => {
    if (!course || !hasActiveSubscription) return;

    // Find the section containing this block
    let weekId = null;
    let sectionId = null;
    
    for (const week of course.weeks) {
      for (const section of week.sections) {
        if (section.content.some(b => b.id === blockId)) {
          weekId = week.id;
          sectionId = section.id;
          break;
        }
      }
      if (weekId) break;
    }

    if (!weekId || !sectionId) return;

    // Get the section
    const week = course.weeks.find(w => w.id === weekId);
    const section = week.sections.find(s => s.id === sectionId);

    // Check if all quizzes and assignments in this section are complete
    let allComplete = true;
    for (const block of section.content) {
      if (block.type === 'quiz' && Array.isArray(block.questions)) {
        const quizState = quizStates[block.id];
        if (!quizState || !quizState.questions.every(q => q.submitted)) {
          allComplete = false;
          break;
        }
      } else if (block.type === 'assignment' && block.submissionType === 'link') {
        const submission = submissions[block.id];
        if (!submission || !submission.link) {
          allComplete = false;
          break;
        }
      }
    }

    // If all complete, mark section as complete
    if (allComplete) {
      const sectionKey = `${weekId}_${sectionId}`;
      if (!userProgress.completedSections?.includes(sectionKey)) {
        const updatedSections = [...(userProgress.completedSections || []), sectionKey];
        const updatedProgress = {
          ...userProgress,
          completedSections: updatedSections,
          lastAccessedAt: new Date()
        };
        setUserProgress(updatedProgress);
        
        try {
          await updateDoc(doc(db, 'progress', `${auth.currentUser.uid}_${courseId}`), {
            completedSections: updatedSections,
            lastAccessedAt: new Date()
          });
        } catch (err) {
          console.error('Error updating section completion:', err);
        }
      }
    }
  };

  // Check if section is completed
  const isSectionCompleted = (weekId, sectionId) => {
    const sectionKey = `${weekId}_${sectionId}`;
    return userProgress.completedSections?.includes(sectionKey) || false;
  };

  // Toggle week expansion
  const toggleWeek = (weekId) => {
    setExpandedWeeks(prev => ({ ...prev, [weekId]: !prev[weekId] }));
  };

  // Navigation functions
  const goToNextSection = () => {
    if (!hasActiveSubscription) return;
    const currentWeek = course.weeks[currentWeekIndex];
    if (currentSectionIndex < currentWeek.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    } else if (currentWeekIndex < course.weeks.length - 1) {
      setCurrentWeekIndex(currentWeekIndex + 1);
      setCurrentSectionIndex(0);
    }
    window.scrollTo(0, 0);
  };

  const goToPreviousSection = () => {
    if (!hasActiveSubscription) return;
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    } else if (currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1);
      setCurrentSectionIndex(course.weeks[currentWeekIndex - 1].sections.length - 1);
    }
    window.scrollTo(0, 0);
  };

  // Get YouTube embed URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  // Quiz handlers
  const handleQuizSelect = (blockId, qIdx, answerIndex) => {
    if (!hasActiveSubscription) return;
    setQuizStates(prev => {
      const blockState = [...prev[blockId].questions];
      blockState[qIdx] = { ...blockState[qIdx], selected: answerIndex };
      return { ...prev, [blockId]: { ...prev[blockId], questions: blockState } };
    });
  };

  const handleSubmitQuiz = async (blockId) => {
    if (!hasActiveSubscription) return;
    const block = course.weeks.flatMap(w => w.sections).flatMap(s => s.content).find(b => b.id === blockId);
    if (!block || !Array.isArray(block.questions)) return;

    const questionsState = quizStates[blockId].questions;
    if (questionsState.some(q => q.selected === null)) return;

    let correctCount = 0;
    try {
      // Save each question submission
      for (let qIdx = 0; qIdx < block.questions.length; qIdx++) {
        const selected = questionsState[qIdx].selected;
        const correctAnswer = block.questions[qIdx].correctAnswer;
        const isCorrect = selected === correctAnswer;
        if (isCorrect) correctCount++;

        const subData = {
          answer: selected,
          correct: isCorrect,
          submittedAt: new Date()
        };
        await setDoc(doc(db, 'quiz_submissions', `${auth.currentUser.uid}_${courseId}_${blockId}_${qIdx}`), subData);

        setQuizStates(prev => {
          const blockState = [...prev[blockId].questions];
          blockState[qIdx] = { ...blockState[qIdx], submitted: true };
          return { ...prev, [blockId]: { ...prev[blockId], questions: blockState } };
        });
      }

      // Calculate score
      const score = Math.round((correctCount / block.questions.length) * 100);
      
      // Update quiz scores
      const updatedScores = { ...quizScores, [blockId]: score };
      setQuizScores(updatedScores);
      
      setQuizStates(prev => ({
        ...prev,
        [blockId]: { ...prev[blockId], score }
      }));

      // Update progress with quiz score
      const updatedProgress = { ...userProgress, quizScores: updatedScores };
      setUserProgress(updatedProgress);
      await updateDoc(doc(db, 'progress', `${auth.currentUser.uid}_${courseId}`), {
        quizScores: updatedScores,
        lastAccessedAt: new Date()
      });

      // Check if section is now complete
      await checkSectionComplete(blockId);

    } catch (err) {
      console.error('Error submitting quiz:', err);
    }
  };

  // Retry quiz
  const handleRetryQuiz = (blockId) => {
    if (!hasActiveSubscription) return;
    const block = course.weeks.flatMap(w => w.sections).flatMap(s => s.content).find(b => b.id === blockId);
    if (!block || !Array.isArray(block.questions)) return;

    setQuizStates(prev => ({
      ...prev,
      [blockId]: {
        questions: block.questions.map(() => ({ selected: null, submitted: false })),
        score: prev[blockId].score
      }
    }));
  };

  // Assignment handlers
  const handleSubmitLink = async (blockId) => {
    if (!hasActiveSubscription || !linkInput) return;
    const subData = {
      link: linkInput,
      submittedAt: new Date(),
      userId: auth.currentUser.uid,
      courseId,
      blockId
    };
    try {
      await setDoc(doc(db, 'submissions', `${auth.currentUser.uid}_${courseId}_${blockId}`), subData);
      setSubmissions(prev => ({ ...prev, [blockId]: subData }));
      setLinkInput('');
      setEditingSubmission(null);

      // Check if section is now complete
      await checkSectionComplete(blockId);

    } catch (err) {
      console.error('Error submitting link:', err);
    }
  };

  const startEditingSubmission = (blockId, currentLink) => {
    if (!hasActiveSubscription) return;
    setEditingSubmission(blockId);
    setLinkInput(currentLink);
  };

  // Peer review handler
  const handleSubmitReview = async (submissionId, grade, comment) => {
    if (!hasActiveSubscription) return;
    const reviewData = {
      grade,
      comment,
      reviewerId: auth.currentUser.uid,
      submissionId,
      reviewedAt: new Date()
    };
    try {
      await setDoc(doc(db, 'reviews', `${submissionId}_${auth.currentUser.uid}`), reviewData);
      setReviews(prev => ({ ...prev, [submissionId]: reviewData }));
    } catch (err) {
      console.error('Error submitting review:', err);
    }
  };

  // Component: Content Block Renderer
  const ContentBlock = ({ block }) => {
    if (!hasActiveSubscription) {
      return (
        <div className="relative">
          <div className="blur-sm pointer-events-none opacity-40">
            {renderBlockContent(block)}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-indigo-200">
              <Lock className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-gray-700 font-semibold text-sm">Subscribe to unlock</p>
            </div>
          </div>
        </div>
      );
    }
    return renderBlockContent(block);
  };

  // Render different block types
  const renderBlockContent = (block) => {
    switch (block.type) {
      case 'heading':
        const HeadingTag = `h${block.level || 2}`;
        return (
          <HeadingTag className={`font-bold text-gray-900 mb-3 ${
            block.level === 1 ? 'text-xl' :
            block.level === 2 ? 'text-lg' :
            block.level === 3 ? 'text-base' :
            'text-sm'
          }`}>
            {block.text}
          </HeadingTag>
        );
      
      case 'paragraph':
        return (
          <p className="text-gray-700 leading-relaxed mb-4 text-sm">
            {block.text}
          </p>
        );
      
      case 'video':
        const embedUrl = getYouTubeEmbedUrl(block.url);
        return (
          <div className="mb-6">
            {block.title && (
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Play className="w-4 h-4 text-red-600" />
                {block.title}
              </h4>
            )}
            {embedUrl ? (
              <div className="max-w-md mx-auto">
                <div className="aspect-video rounded-lg overflow-hidden shadow border border-gray-200">
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                  <p className="text-gray-500 text-xs">Invalid video URL</p>
                </div>
              </div>
            )}
            {block.description && (
              <p className="text-gray-600 mt-2 text-xs text-center">{block.description}</p>
            )}
          </div>
        );
      
      case 'list':
        const ListTag = block.ordered ? 'ol' : 'ul';
        return (
          <ListTag className={`mb-4 ml-6 space-y-1 ${block.ordered ? 'list-decimal' : 'list-disc'}`}>
            {(block.items || []).map((item, idx) => (
              <li key={idx} className="text-gray-700 text-sm leading-relaxed">
                {item}
              </li>
            ))}
          </ListTag>
        );
      
      case 'link':
        return (
          <a
            href={block.url}
            target={block.openNewTab ? '_blank' : '_self'}
            rel={block.openNewTab ? 'noopener noreferrer' : ''}
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm mb-4 hover:underline"
          >
            {block.text}
            {block.openNewTab && <span className="text-xs">↗</span>}
          </a>
        );
      
      case 'assignment':
        return <AssignmentBlock block={block} />;
      
      case 'quiz':
        return <QuizBlock block={block} />;
      
      case 'image':
        return (
          <div className="mb-6">
            <img
              src={block.url}
              alt={block.alt || ''}
              className="max-w-full rounded-lg shadow border border-gray-200"
            />
            {block.caption && (
              <p className="text-center text-gray-600 mt-2 italic text-xs">{block.caption}</p>
            )}
          </div>
        );
      
      case 'code':
        return (
          <div className="mb-6">
            <pre className="bg-gray-800 text-white p-3 rounded-lg overflow-x-auto font-mono text-xs">
              <code>{block.text}</code>
            </pre>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Component: Assignment Block
  const AssignmentBlock = ({ block }) => {
    const submission = submissions[block.id];
    const isEditing = editingSubmission === block.id;
    
    return (
      <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-900 mb-2">
              {block.title || 'Assignment'}
            </h4>
            <p className="text-gray-700 mb-2 leading-relaxed text-xs">{block.description}</p>
            <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
              {block.dueDate && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Due: {new Date(block.dueDate).toLocaleDateString()}
                </span>
              )}
              {block.points && (
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {block.points} points
                </span>
              )}
            </div>
            {block.submissionType === 'link' && (
              <div className="mt-3">
                {submission?.link ? (
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-700 text-xs">Submitted:</span>
                      <button
                        onClick={() => startEditingSubmission(block.id, submission.link)}
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-xs"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                    </div>
                    <a href={submission.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all text-xs">
                      {submission.link}
                    </a>
                    {submission.submittedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-600 mb-2 text-xs">Submit your work below</div>
                )}
                {(isEditing || !submission?.link) && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="url"
                      value={linkInput}
                      onChange={(e) => setLinkInput(e.target.value)}
                      placeholder="https://example.com/your-work"
                      className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => handleSubmitLink(block.id)}
                      disabled={!linkInput}
                      className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-xs"
                    >
                      <Send className="w-3 h-3" />
                      {isEditing ? 'Update' : 'Submit'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Component: Quiz Block
  const QuizBlock = ({ block }) => {
    if (!Array.isArray(block.questions) || block.questions.length === 0) {
      return <div className="text-gray-500 text-xs mb-4">No questions available</div>;
    }

    const questionsState = quizStates[block.id]?.questions || [];
    const quizScore = quizStates[block.id]?.score;
    const allSubmitted = questionsState.length > 0 && questionsState.every(q => q.submitted);
    const allAnswered = questionsState.length > 0 && questionsState.every(q => q.selected !== null);
    const canSubmit = !allSubmitted && allAnswered;
    const passed = quizScore !== null && quizScore !== undefined && quizScore >= 70;

    return (
      <div className="space-y-4 mb-6">
        {block.questions.map((q, qIdx) => {
          const state = questionsState[qIdx] || { selected: null, submitted: false };
          const selectedAnswer = state.selected;

          return (
            <div key={qIdx} className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                {q.question}
              </h4>
              <div className="space-y-2">
                {(q.options || []).map((option, idx) => (
                  <div
                    key={idx}
                    onClick={() => !allSubmitted && handleQuizSelect(block.id, qIdx, idx)}
                    className={`bg-white p-2 rounded border flex items-center gap-2 cursor-pointer transition-all text-xs ${
                      !allSubmitted && selectedAnswer === idx
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    } ${allSubmitted ? 'cursor-not-allowed opacity-75' : ''}`}
                  >
                    <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                      selectedAnswer === idx ? 'bg-blue-600 border-blue-600' : 'border-gray-400'
                    }`}></div>
                    <span className="text-gray-700">{option}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Quiz Results and Actions */}
        {allSubmitted && quizScore !== null && quizScore !== undefined && (
          <div className={`p-3 rounded-lg text-xs ${
            passed ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
          }`}>
            {passed ? (
              <div>
                <p className="font-bold text-green-800 mb-1">✓ Passed! You scored {quizScore}%</p>
                <p className="text-green-700">Great job! You can retry to improve your score.</p>
              </div>
            ) : (
              <div>
                <p className="font-bold text-orange-800 mb-1">Not passed yet. You scored {quizScore}%</p>
                <p className="text-orange-700">You need 70% to pass. Try again!</p>
              </div>
            )}
            <button
              onClick={() => handleRetryQuiz(block.id)}
              className="mt-2 flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs"
            >
              <RotateCcw className="w-3 h-3" />
              Retry Quiz
            </button>
          </div>
        )}

        {/* Submit Button */}
        {!allSubmitted && (
          <button
            onClick={() => handleSubmitQuiz(block.id)}
            disabled={!canSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Submit Quiz
          </button>
        )}
      </div>
    );
  };

  // Component: Sidebar
  const Sidebar = () => (
    <aside className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-80 bg-white border-r border-gray-200 z-30 transition-transform duration-300 flex flex-col shadow-lg`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-bold">Course Content</h2>
          <button
            onClick={() => setShowSidebar(false)}
            className="text-white hover:opacity-80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weeks List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {course.weeks.map((week, weekIdx) => (
          <div key={week.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <button
              onClick={() => toggleWeek(week.id)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-3 h-3 text-indigo-600" />
                <h3 className="font-semibold text-gray-900 text-xs">{week.title}</h3>
              </div>
              <ChevronDown className={`w-3 h-3 text-gray-600 transition-transform ${expandedWeeks[week.id] ? 'rotate-180' : ''}`} />
            </button>
            {expandedWeeks[week.id] && (
              <div className="space-y-0.5 p-1.5">
                {week.sections.map((section, sectionIdx) => {
                  const isActive = weekIdx === currentWeekIndex && sectionIdx === currentSectionIndex && activeTab === 'content';
                  const isCompleted = isSectionCompleted(week.id, section.id);
                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveTab('content');
                        setCurrentWeekIndex(weekIdx);
                        setCurrentSectionIndex(sectionIdx);
                        setShowSidebar(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded transition-all flex items-center gap-2 text-xs ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-900 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      )}
                      <span className="flex-1 truncate">{section.title}</span>
                    </button>
                  );
                })}
                <button
                  onClick={() => {
                    setActiveTab('peer');
                    setPeerWeekIndex(weekIdx);
                    setShowSidebar(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded transition-all flex items-center gap-2 text-xs ${
                    activeTab === 'peer' && peerWeekIndex === weekIdx
                      ? 'bg-indigo-100 text-indigo-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Circle className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="flex-1 truncate">Peer Review</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Back to Dashboard */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={() => navigate('/ehub')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all font-medium text-sm"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    </aside>
  );

  // Component: Peer Review View
  const PeerReviewView = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-lg font-bold mb-4">Peer Review: {course.weeks[peerWeekIndex].title}</h2>
      <p className="mb-4 text-gray-600 text-sm">Review your peers' submissions and provide constructive feedback.</p>
      {assignmentsByWeek[course.weeks[peerWeekIndex].id]?.length > 0 ? (
        assignmentsByWeek[course.weeks[peerWeekIndex].id].map(blockId => (
          <div key={blockId} className="mb-6 border-b pb-6">
            <h3 className="text-base font-semibold mb-3">
              Assignment: {course.weeks[peerWeekIndex].sections.flatMap(s => s.content.find(b => b.id === blockId)?.title || 'Untitled')}
            </h3>
            {peerSubmissions[course.weeks[peerWeekIndex].id]?.filter(sub => sub.blockId === blockId).map(sub => {
              const submissionId = sub.submissionId;
              const review = reviews[submissionId];
              return (
                <div key={submissionId} className="bg-gray-50 p-4 rounded-lg mb-3">
                  <p className="font-medium text-sm">
                    Submitted Link: <a href={sub.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">{sub.link}</a>
                  </p>
                  <p className="text-xs text-gray-500">Submitted by: Anonymous Peer</p>
                  {review ? (
                    <div className="mt-2">
                      <p className="text-green-600 text-sm">✓ Reviewed: Grade {review.grade}/10</p>
                      <p className="text-gray-600 text-sm">Comment: {review.comment}</p>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <label className="block text-xs font-medium mb-1">Grade (0-10)</label>
                      <input type="number" min="0" max="10" className="w-20 px-2 py-1 text-sm border rounded" id={`grade-${submissionId}`} />
                      <label className="block text-xs font-medium mt-2 mb-1">Comment</label>
                      <textarea className="w-full px-2 py-1 text-sm border rounded" id={`comment-${submissionId}`} rows="2"></textarea>
                      <button
                        onClick={() => {
                          const grade = parseInt(document.getElementById(`grade-${submissionId}`).value);
                          const comment = document.getElementById(`comment-${submissionId}`).value;
                          if (grade >= 0 && grade <= 10) {
                            handleSubmitReview(submissionId, grade, comment);
                          }
                        }}
                        className="mt-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                      >
                        Submit Review
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-sm">No assignments for peer review in this week.</p>
      )}
    </div>
  );

  // Component: Paywall Screen
  const PaywallScreen = () => (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(to bottom, #a5b4fc, #e0e7ff)'}}>
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white text-center">
          <Lock className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Unlock Full Access</h1>
          <p className="text-indigo-100">Subscribe to access all courses and features</p>
        </div>
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What You'll Get:</h2>
            <div className="space-y-3">
              {[
                'Full access to all course content',
                'Interactive quizzes and assignments',
                'Peer review and collaboration',
                'Track your progress and earn certificates',
                'Priority support from instructors'
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900">Monthly Plan</h3>
              <div className="text-right">
                <div className="text-3xl font-bold text-indigo-600">KES 1,700</div>
                <div className="text-sm text-gray-600">per month</div>
              </div>
            </div>
            <p className="text-gray-600 text-sm">Access all courses for 30 days</p>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900">3-Month Plan</h3>
              <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-bold">SAVE KES 100</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl font-bold text-purple-600">KES 5,000</div>
              <div className="text-sm text-gray-500">
                <span className="line-through">KES 5,100</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm">Access all courses for 90 days</p>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            Choose Your Plan
          </button>
          <button
            onClick={() => navigate('/ehub')}
            className="w-full mt-3 text-gray-600 hover:text-gray-900 font-medium py-2"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(to bottom, #a5b4fc, #e0e7ff)'}}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  // Show paywall if no subscription
  if (subscriptionChecked && !hasActiveSubscription) {
    return <PaywallScreen />;
  }

  // Error state
  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(to bottom, #a5b4fc, #e0e7ff)'}}>
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <p className="text-red-600 text-lg font-semibold mb-4">
            {error || 'Course not found'}
          </p>
          <button
            onClick={() => navigate('/ehub')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentWeek = course.weeks[currentWeekIndex];
  const currentSection = currentWeek?.sections[currentSectionIndex];
  const hasNext = currentSectionIndex < currentWeek?.sections.length - 1 || currentWeekIndex < course.weeks.length - 1;
  const hasPrevious = currentSectionIndex > 0 || currentWeekIndex > 0;

  return (
    <div className="min-h-screen flex flex-col" style={{background: 'linear-gradient(to bottom, #a5b4fc, #e0e7ff)'}}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base font-bold text-gray-900">{course.title}</h1>
                <p className="text-xs text-gray-500">
                  {activeTab === 'content' ? `${currentWeek?.title} - ${currentSection?.title}` : 'Peer Review'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Component */}
        <Sidebar />

        {/* Overlay for mobile only */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setShowSidebar(false)}
          ></div>
        )}

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${showSidebar ? 'ml-80' : 'ml-0'}`}>
          <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {activeTab === 'content' ? (
                <>
                  {currentSection?.content?.length > 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                      {currentSection.content.map((block) => (
                        <ContentBlock key={block.id} block={block} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                      <p className="text-gray-500 text-sm">No content available for this section yet.</p>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={goToPreviousSection}
                      disabled={!hasPrevious}
                      className="px-6 py-3 bg-white border-2 border-black text-gray-900 rounded-full font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <button
                      onClick={goToNextSection}
                      disabled={!hasNext}
                      className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <PeerReviewView />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}