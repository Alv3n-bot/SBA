import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs,
  serverTimestamp, addDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../../firebase';
import { FileText } from 'lucide-react';

// Component imports
import CourseSidebar from './components/CourseSidebar';
import CourseHeader from './components/CourseHeader';
import ContentRenderer from './components/ContentRenderer';
import NavigationButtons from './components/NavigationButtons';
import PaywallScreen from './components/PaywallScreen';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import Settings from '../ehub/Settings';
import Notifications from '../ehub/Notifications';
import MarkCompleteButton from './components/MarkCompleteButton';
import { ToastContainer } from './components/Toast';

// Utilities
import { useToast } from './hooks/useToast';
import { courseCache, progressCache, submissionsCache, quizResultsCache } from './utils/cache';
import { MESSAGES, FIREBASE_CONFIG, KEYBOARD_SHORTCUTS } from './config/constants';

export default function CourseLearning() {
  const { courseId } = useParams();
  const { toasts, removeToast, showSuccess, showError, showWarning } = useToast();
  
  // Core State
  const [course, setCourse] = useState(null);
  const [userData, setUserData] = useState(null);
  const [cohort, setCohort] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Navigation State
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState({});
  
  // Progress State
  const [userProgress, setUserProgress] = useState(null);
  const [completedSections, setCompletedSections] = useState(new Set());
  
  // Quiz State
  const [quizResults, setQuizResults] = useState({});
  
  // Assignment State
  const [submissions, setSubmissions] = useState({});
  const [uploadingFile, setUploadingFile] = useState(null);
  
  // Code Checking State - NEW
  const [codeSubmissions, setCodeSubmissions] = useState({});
  
  // Subscription State
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);

  // Modal States
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    initializeLearning();
  }, [courseId]);

  // ==================== KEYBOARD NAVIGATION ====================
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      // Don't trigger if modals are open
      if (showSettings || showNotifications) {
        if (e.key === KEYBOARD_SHORTCUTS.CLOSE_MODAL) {
          setShowSettings(false);
          setShowNotifications(false);
        }
        return;
      }

      switch (e.key) {
        case KEYBOARD_SHORTCUTS.NEXT_SECTION:
          e.preventDefault();
          goToNextSection();
          break;
        case KEYBOARD_SHORTCUTS.PREVIOUS_SECTION:
          e.preventDefault();
          goToPreviousSection();
          break;
        case KEYBOARD_SHORTCUTS.TOGGLE_SIDEBAR:
          e.preventDefault();
          setShowSidebar(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showSettings, showNotifications, currentWeekIndex, currentSectionIndex, course]);

  const initializeLearning = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        window.location.href = '/login';
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        setError(MESSAGES.ERROR.USER_NOT_FOUND);
        setSubscriptionChecked(true);
        setLoading(false);
        return;
      }

      const userDataResult = userDoc.data();
      setUserData(userDataResult);

      const isActive = checkSubscription(userDataResult);
      setHasActiveSubscription(isActive);
      setSubscriptionChecked(true);

      if (!isActive) {
        setLoading(false);
        return;
      }

      // Try to load course from cache first
      let courseData = courseCache.get(courseId);
      
      if (!courseData) {
        // If not in cache, fetch from Firebase
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        if (!courseDoc.exists()) {
          setError(MESSAGES.ERROR.COURSE_NOT_FOUND);
          setLoading(false);
          return;
        }
        courseData = courseDoc.data();
        // Cache the course data
        courseCache.set(courseId, courseData);
      }

      setCourse(courseData);

      await loadOrCreateCohort(user.uid, courseId);

      const initialExpanded = {};
      if (courseData.weeks?.length > 0) {
        initialExpanded[courseData.weeks[0].id] = true;
      }
      setExpandedWeeks(initialExpanded);

      // Load data with caching
      await loadOrCreateProgressWithCache(user.uid, courseId, courseData);
      await loadSubmissionsWithCache(user.uid, courseId);
      await loadQuizResultsWithCache(user.uid, courseId);
      await loadCodeSubmissions(user.uid, courseId); // NEW - Load code submissions
    } catch (err) {
      console.error('Error initializing learning:', err);
      setError(MESSAGES.ERROR.LOADING_FAILED + ': ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==================== SUBSCRIPTION CHECK ====================
  const checkSubscription = (userData) => {
    if (!userData?.subscription?.endDate) return false;
    const endDate = userData.subscription.endDate.toDate
      ? userData.subscription.endDate.toDate()
      : new Date(userData.subscription.endDate);
    return endDate > new Date();
  };

  // ==================== COHORT MANAGEMENT ====================
  // ==================== COHORT MANAGEMENT ====================
// This replaces the loadOrCreateCohort function in CourseLearning.jsx

const loadOrCreateCohort = async (userId, courseId) => {
  try {
    // First, check user's enrollments mapping to get the cohort ID
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      console.error('User document not found');
      return;
    }
    
    const userData = userDoc.data();
    const enrollments = userData.enrollments || {};
    const cohortId = enrollments[courseId];
    
    if (cohortId) {
      // Load the assigned cohort
      const cohortDoc = await getDoc(doc(db, 'cohorts', cohortId));
      
      if (cohortDoc.exists()) {
        const cohortData = cohortDoc.data();
        setCohort({ 
          id: cohortDoc.id, 
          ...cohortData,
          startDate: cohortData.startDate?.toDate ? cohortData.startDate.toDate() : cohortData.startDate,
          endDate: cohortData.endDate?.toDate ? cohortData.endDate.toDate() : cohortData.endDate
        });
        console.log(`Loaded cohort: ${cohortData.name}`);
      } else {
        console.error('Cohort document not found for ID:', cohortId);
      }
    } else {
      // Fallback: Search by studentIds (shouldn't happen if enrollment flow is correct)
      console.warn('No cohort mapping found in enrollments, searching by studentIds...');
      
      const cohortQuery = query(
        collection(db, 'cohorts'),
        where('courseId', '==', courseId),
        where('studentIds', 'array-contains', userId)
      );
      const cohortSnapshot = await getDocs(cohortQuery);

      if (!cohortSnapshot.empty) {
        const cohortData = cohortSnapshot.docs[0].data();
        setCohort({ 
          id: cohortSnapshot.docs[0].id, 
          ...cohortData,
          startDate: cohortData.startDate?.toDate ? cohortData.startDate.toDate() : cohortData.startDate,
          endDate: cohortData.endDate?.toDate ? cohortData.endDate.toDate() : cohortData.endDate
        });
        console.log(`Found cohort via search: ${cohortData.name}`);
      } else {
        console.error('Student not assigned to any cohort for this course');
      }
    }
  } catch (err) {
    console.error('Error loading cohort:', err);
  }
};    

  // ==================== PROGRESS MANAGEMENT WITH CACHE ====================
  const loadOrCreateProgressWithCache = async (userId, courseId, courseData) => {
    try {
      // Try cache first
      let progressData = progressCache.get(userId, courseId);
      
      if (!progressData) {
        // Fetch from Firebase if not cached
        const progressDoc = await getDoc(doc(db, 'progress', `${userId}_${courseId}`));
        if (progressDoc.exists()) {
          progressData = progressDoc.data();
        } else {
          progressData = {
            userId,
            courseId,
            completedSections: [],
            quizScores: {},
            lastAccessedWeek: 0,
            lastAccessedSection: 0,
            startedAt: serverTimestamp(),
            lastAccessedAt: serverTimestamp()
          };
          await setDoc(doc(db, 'progress', `${userId}_${courseId}`), progressData);
        }
        // Cache the progress
        progressCache.set(userId, courseId, progressData);
      }
      
      setUserProgress(progressData);
      setCompletedSections(new Set(progressData.completedSections || []));
    } catch (err) {
      console.error('Error loading progress:', err);
    }
  };

  const markSectionComplete = async (weekId, sectionId) => {
    if (!hasActiveSubscription) return;
    const sectionKey = `${weekId}_${sectionId}`;
    if (completedSections.has(sectionKey)) return;

    try {
      const newCompleted = new Set(completedSections);
      newCompleted.add(sectionKey);
      setCompletedSections(newCompleted);

      const completedArray = Array.from(newCompleted);
      const progressData = {
        completedSections: completedArray,
        lastAccessedAt: serverTimestamp()
      };
      
      await updateDoc(doc(db, 'progress', `${auth.currentUser.uid}_${courseId}`), progressData);

      // Update cache
      const updatedProgress = {
        ...userProgress,
        ...progressData
      };
      setUserProgress(updatedProgress);
      progressCache.set(auth.currentUser.uid, courseId, updatedProgress);
      
      showSuccess(MESSAGES.SUCCESS.SECTION_COMPLETED);
    } catch (err) {
      console.error('Error marking section complete:', err);
      showError(MESSAGES.ERROR.MARK_COMPLETE_FAILED);
    }
  };

  // ==================== CODE SUBMISSIONS MANAGEMENT - NEW ====================
  const loadCodeSubmissions = async (userId, courseId) => {
    try {
      const q = query(
        collection(db, 'code_submissions'),
        where('studentId', '==', userId),
        where('courseId', '==', courseId)
      );
      const snapshot = await getDocs(q);
      
      const subs = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        const assignmentId = data.assignmentId;
        
        // Keep the best score for each assignment (prioritize passed submissions)
        if (!subs[assignmentId] || 
            (data.allTestsPassed && !subs[assignmentId].allTestsPassed) ||
            (data.score > (subs[assignmentId].score || 0))) {
          subs[assignmentId] = {
            id: doc.id,
            ...data
          };
        }
      });
      
      setCodeSubmissions(subs);
      console.log('Loaded code submissions:', subs);
    } catch (err) {
      console.error('Error loading code submissions:', err);
    }
  };

  const getIncompleteItems = useCallback((weekId, sectionId) => {
    if (!course) return { hasIncomplete: false, count: 0 };

    const week = course.weeks.find(w => w.id === weekId);
    const section = week?.sections.find(s => s.id === sectionId);
    if (!section) return { hasIncomplete: false, count: 0 };

    let incompleteCount = 0;

    for (const block of section.content) {
      if (block.type === 'quiz') {
        const result = quizResults[block.id];
        if (!result || !result.passed) {
          incompleteCount++;
        }
      } else if (block.type === 'assignment') {
        // Check if it's a code checking assignment
        if (block.codeCheckingEnabled && block.codeChecking) {
          const codeSubmission = codeSubmissions[block.id];
          if (!codeSubmission || !codeSubmission.allTestsPassed) {
            incompleteCount++;
          }
        } else {
          // Regular assignment - check submissions collection
          const submission = submissions[block.id];
          if (!submission || !submission.submittedAt) {
            incompleteCount++;
          }
        }
      }
    }

    return {
      hasIncomplete: incompleteCount > 0,
      count: incompleteCount
    };
  }, [course, quizResults, submissions, codeSubmissions]);

  // ==================== QUIZ MANAGEMENT WITH CACHE ====================
  const loadQuizResultsWithCache = async (userId, courseId) => {
    try {
      // Try cache first
      let results = quizResultsCache.get(userId, courseId);
      
      if (!results) {
        // Fetch from Firebase if not cached
        const quizQuery = query(
          collection(db, 'quiz_results'),
          where('userId', '==', userId),
          where('courseId', '==', courseId)
        );
        const quizSnapshot = await getDocs(quizQuery);
        results = {};

        quizSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          results[data.quizId] = {
            score: data.score,
            totalQuestions: data.totalQuestions,
            correctAnswers: data.correctAnswers,
            answers: data.answers,
            passed: data.passed,
            submittedAt: data.submittedAt
          };
        });
        
        // Cache the results
        quizResultsCache.set(userId, courseId, results);
      }

      setQuizResults(results);
    } catch (err) {
      console.error('Error loading quiz results:', err);
    }
  };

  const handleQuizComplete = useCallback((quizId, result) => {
    setQuizResults(prev => {
      const updated = {
        ...prev,
        [quizId]: result
      };
      // Update cache
      quizResultsCache.set(auth.currentUser.uid, courseId, updated);
      return updated;
    });
  }, [courseId]);

  // ==================== ASSIGNMENT MANAGEMENT WITH CACHE ====================
  const loadSubmissionsWithCache = async (userId, courseId) => {
    try {
      // Try cache first
      let subs = submissionsCache.get(userId, courseId);
      
      if (!subs) {
        // Fetch from Firebase if not cached
        const submissionQuery = query(
          collection(db, 'submissions'),
          where('userId', '==', userId),
          where('courseId', '==', courseId)
        );
        const submissionSnapshot = await getDocs(submissionQuery);
        subs = {};

        submissionSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          subs[data.assignmentId] = {
            id: docSnap.id,
            ...data
          };
        });
        
        // Cache the submissions
        submissionsCache.set(userId, courseId, subs);
      }

      setSubmissions(subs);
    } catch (err) {
      console.error('Error loading submissions:', err);
    }
  };

  const handleTextSubmission = async (assignmentBlock, textContent, weekId, sectionId) => {
    if (!hasActiveSubscription || !textContent.trim()) return;

    try {
      const submissionData = {
        userId: auth.currentUser.uid,
        courseId,
        assignmentId: assignmentBlock.id,
        type: 'text',
        content: textContent,
        submittedAt: serverTimestamp(),
        status: 'submitted'
      };

      const submissionRef = await addDoc(collection(db, 'submissions'), submissionData);

      const updatedSubmissions = {
        ...submissions,
        [assignmentBlock.id]: {
          id: submissionRef.id,
          ...submissionData
        }
      };
      
      setSubmissions(updatedSubmissions);
      // Update cache
      submissionsCache.set(auth.currentUser.uid, courseId, updatedSubmissions);
      
      showSuccess(MESSAGES.SUCCESS.ASSIGNMENT_SUBMITTED);
    } catch (err) {
      console.error('Error submitting assignment:', err);
      showError(MESSAGES.ERROR.ASSIGNMENT_SUBMIT_FAILED);
    }
  };

  const handleFileUpload = async (assignmentBlock, file, weekId, sectionId) => {
    if (!hasActiveSubscription || !file) return;

    try {
      setUploadingFile(assignmentBlock.id);

      const storageRef = ref(storage, `submissions/${auth.currentUser.uid}/${courseId}/${assignmentBlock.id}/${file.name}`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      const submissionData = {
        userId: auth.currentUser.uid,
        courseId,
        assignmentId: assignmentBlock.id,
        type: 'file',
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        submittedAt: serverTimestamp(),
        status: 'submitted'
      };

      const submissionRef = await addDoc(collection(db, 'submissions'), submissionData);

      const updatedSubmissions = {
        ...submissions,
        [assignmentBlock.id]: {
          id: submissionRef.id,
          ...submissionData
        }
      };
      
      setSubmissions(updatedSubmissions);
      // Update cache
      submissionsCache.set(auth.currentUser.uid, courseId, updatedSubmissions);
      
      showSuccess(MESSAGES.SUCCESS.FILE_UPLOADED);
    } catch (err) {
      console.error('Error uploading file:', err);
      showError(MESSAGES.ERROR.FILE_UPLOAD_FAILED);
    } finally {
      setUploadingFile(null);
    }
  };

  const handleUrlSubmission = async (assignmentBlock, url, weekId, sectionId) => {
    if (!hasActiveSubscription || !url.trim()) return;

    try {
      const submissionData = {
        userId: auth.currentUser.uid,
        courseId,
        assignmentId: assignmentBlock.id,
        type: 'url',
        url,
        submittedAt: serverTimestamp(),
        status: 'submitted'
      };

      const submissionRef = await addDoc(collection(db, 'submissions'), submissionData);

      const updatedSubmissions = {
        ...submissions,
        [assignmentBlock.id]: {
          id: submissionRef.id,
          ...submissionData
        }
      };
      
      setSubmissions(updatedSubmissions);
      // Update cache
      submissionsCache.set(auth.currentUser.uid, courseId, updatedSubmissions);
      
      showSuccess(MESSAGES.SUCCESS.URL_SUBMITTED);
    } catch (err) {
      console.error('Error submitting URL:', err);
      showError(MESSAGES.ERROR.URL_SUBMIT_FAILED);
    }
  };

  // ==================== NAVIGATION ====================
  const toggleWeek = (weekId) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekId]: !prev[weekId]
    }));
  };

  const goToSection = (weekIndex, sectionIndex) => {
    setCurrentWeekIndex(weekIndex);
    setCurrentSectionIndex(sectionIndex);
    setShowSidebar(false);
    window.scrollTo(0, 0);
  };

  const goToNextSection = () => {
    if (!hasActiveSubscription || !course) return;
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
    if (!hasActiveSubscription || !course) return;

    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    } else if (currentWeekIndex > 0) {
      const prevWeek = course.weeks[currentWeekIndex - 1];
      setCurrentWeekIndex(currentWeekIndex - 1);
      setCurrentSectionIndex(prevWeek.sections.length - 1);
    }
    window.scrollTo(0, 0);
  };

  // ==================== RENDER CONDITIONS ====================
  if (loading) {
    return <LoadingState />;
  }

  if (subscriptionChecked && !hasActiveSubscription) {
    return <PaywallScreen />;
  }

  if (error || !course) {
    return <ErrorState error={error} />;
  }

  // ==================== MAIN RENDER ====================
  const currentWeek = course.weeks[currentWeekIndex];
  const currentSection = currentWeek?.sections[currentSectionIndex];
  const hasNext = currentSectionIndex < currentWeek?.sections.length - 1 || currentWeekIndex < course.weeks.length - 1;
  const hasPrevious = currentSectionIndex > 0 || currentWeekIndex > 0;
  
  // Check if current section is completed and has incomplete items
  const sectionKey = `${currentWeek?.id}_${currentSection?.id}`;
  const isSectionCompleted = completedSections.has(sectionKey);
  const { hasIncomplete, count: incompleteCount } = getIncompleteItems(currentWeek?.id, currentSection?.id);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <CourseHeader
        course={course}
        currentWeek={currentWeek}
        currentSection={currentSection}
        completedSections={completedSections}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
      />
      
      <div className="flex flex-1">
        <CourseSidebar
          course={course}
          cohort={cohort}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          expandedWeeks={expandedWeeks}
          toggleWeek={toggleWeek}
          currentWeekIndex={currentWeekIndex}
          currentSectionIndex={currentSectionIndex}
          completedSections={completedSections}
          goToSection={goToSection}
          onOpenSettings={() => setShowSettings(true)}
          onOpenNotifications={() => setShowNotifications(true)}
        />
        
        {showSidebar && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
        
        <main className={`flex-1 transition-all duration-300 ${showSidebar ? 'lg:ml-80' : 'ml-0'}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{currentSection?.title}</h2>
              {currentSection?.description && (
                <p className="text-gray-600 text-base">{currentSection.description}</p>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
              {currentSection?.content?.length > 0 ? (
                currentSection.content.map((block) => (
                  <ContentRenderer
                    key={block.id}
                    block={block}
                    weekId={currentWeek.id}
                    sectionId={currentSection.id}
                    hasActiveSubscription={hasActiveSubscription}
                    submissions={submissions}
                    uploadingFile={uploadingFile}
                    quizResults={quizResults}
                    courseId={courseId}
                    onTextSubmit={handleTextSubmission}
                    onFileUpload={handleFileUpload}
                    onUrlSubmit={handleUrlSubmission}
                    onQuizComplete={(quizId, result) => {
                      handleQuizComplete(quizId, result);
                      
                    }}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-base">{MESSAGES.INFO.NO_CONTENT}</p>
                </div>
              )}
            </div>
            
            {/* Mark as Complete Button */}
            <div className="mb-6">
              <MarkCompleteButton
                weekId={currentWeek?.id}
                sectionId={currentSection?.id}
                isCompleted={isSectionCompleted}
                hasIncompleteItems={hasIncomplete}
                incompleteItemsCount={incompleteCount}
                onMarkComplete={markSectionComplete}
                disabled={!hasActiveSubscription}
              />
            </div>
            
            <NavigationButtons
              hasPrevious={hasPrevious}
              hasNext={hasNext}
              onPrevious={goToPreviousSection}
              onNext={goToNextSection}
            />
          </div>
        </main>
      </div>

      {/* Settings Modal */}
      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
      
      {/* Notifications Modal */}
      <Notifications isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  );
}