import { useState, useEffect } from 'react';
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

export default function CourseLearning() {
  const { courseId } = useParams();
  
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
        setError('User profile not found');
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

      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      if (!courseDoc.exists()) {
        setError('Course not found');
        setLoading(false);
        return;
      }

      const courseData = courseDoc.data();
      setCourse(courseData);

      await loadOrCreateCohort(user.uid, courseId);

      const initialExpanded = {};
      if (courseData.weeks?.length > 0) {
        initialExpanded[courseData.weeks[0].id] = true;
      }
      setExpandedWeeks(initialExpanded);

      await loadOrCreateProgress(user.uid, courseId, courseData);
      await loadSubmissions(user.uid, courseId);
      await loadQuizResults(user.uid, courseId);
    } catch (err) {
      console.error('Error initializing learning:', err);
      setError('Failed to load course: ' + err.message);
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
  const loadOrCreateCohort = async (userId, courseId) => {
    try {
      const cohortQuery = query(
        collection(db, 'cohorts'),
        where('courseId', '==', courseId),
        where('studentIds', 'array-contains', userId)
      );
      const cohortSnapshot = await getDocs(cohortQuery);

      if (!cohortSnapshot.empty) {
        const cohortData = cohortSnapshot.docs[0].data();
        setCohort({ id: cohortSnapshot.docs[0].id, ...cohortData });
      } else {
        const allCohortsQuery = query(
          collection(db, 'cohorts'),
          where('courseId', '==', courseId),
          where('status', '==', 'active')
        );
        const allCohortsSnapshot = await getDocs(allCohortsQuery);
        let targetCohort = null;

        for (const doc of allCohortsSnapshot.docs) {
          const data = doc.data();
          if ((data.studentIds?.length || 0) < 30) {
            targetCohort = { id: doc.id, ...data };
            break;
          }
        }

        if (targetCohort) {
          await updateDoc(doc(db, 'cohorts', targetCohort.id), {
            studentIds: [...(targetCohort.studentIds || []), userId],
            updatedAt: serverTimestamp()
          });
          setCohort(targetCohort);
        } else {
          const newCohort = {
            courseId,
            name: `Cohort ${allCohortsSnapshot.size + 1}`,
            studentIds: [userId],
            status: 'active',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          const cohortRef = await addDoc(collection(db, 'cohorts'), newCohort);
          setCohort({ id: cohortRef.id, ...newCohort });
        }
      }
    } catch (err) {
      console.error('Error managing cohort:', err);
    }
  };

  // ==================== PROGRESS MANAGEMENT ====================
  const loadOrCreateProgress = async (userId, courseId, courseData) => {
    try {
      const progressDoc = await getDoc(doc(db, 'progress', `${userId}_${courseId}`));
      if (progressDoc.exists()) {
        const progressData = progressDoc.data();
        setUserProgress(progressData);
        setCompletedSections(new Set(progressData.completedSections || []));
      } else {
        const newProgress = {
          userId,
          courseId,
          completedSections: [],
          quizScores: {},
          lastAccessedWeek: 0,
          lastAccessedSection: 0,
          startedAt: serverTimestamp(),
          lastAccessedAt: serverTimestamp()
        };
        await setDoc(doc(db, 'progress', `${userId}_${courseId}`), newProgress);
        setUserProgress(newProgress);
        setCompletedSections(new Set());
      }
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
      await updateDoc(doc(db, 'progress', `${auth.currentUser.uid}_${courseId}`), {
        completedSections: completedArray,
        lastAccessedAt: serverTimestamp()
      });

      setUserProgress(prev => ({
        ...prev,
        completedSections: completedArray
      }));
    } catch (err) {
      console.error('Error marking section complete:', err);
    }
  };

  const checkAndMarkSectionComplete = async (weekId, sectionId) => {
    if (!course || !hasActiveSubscription) return;

    const week = course.weeks.find(w => w.id === weekId);
    const section = week?.sections.find(s => s.id === sectionId);
    if (!section) return;

    let allComplete = true;
    for (const block of section.content) {
      if (block.type === 'quiz') {
        const result = quizResults[block.id];
        if (!result || !result.passed) {
          allComplete = false;
          break;
        }
      } else if (block.type === 'assignment') {
        const submission = submissions[block.id];
        if (!submission || !submission.submittedAt) {
          allComplete = false;
          break;
        }
      }
    }

    if (allComplete) {
      await markSectionComplete(weekId, sectionId);
    }
  };

  // ==================== QUIZ MANAGEMENT ====================
  const loadQuizResults = async (userId, courseId) => {
    try {
      const quizQuery = query(
        collection(db, 'quiz_results'),
        where('userId', '==', userId),
        where('courseId', '==', courseId)
      );
      const quizSnapshot = await getDocs(quizQuery);
      const results = {};

      quizSnapshot.forEach((doc) => {
        const data = doc.data();
        results[data.quizId] = {
          score: data.score,
          totalQuestions: data.totalQuestions,
          correctAnswers: data.correctAnswers,
          answers: data.answers,
          passed: data.passed,
          submittedAt: data.submittedAt
        };
      });

      setQuizResults(results);
    } catch (err) {
      console.error('Error loading quiz results:', err);
    }
  };

  const handleQuizComplete = (quizId, result) => {
    setQuizResults(prev => ({
      ...prev,
      [quizId]: result
    }));
  };

  // ==================== ASSIGNMENT MANAGEMENT ====================
  const loadSubmissions = async (userId, courseId) => {
    try {
      const submissionQuery = query(
        collection(db, 'submissions'),
        where('userId', '==', userId),
        where('courseId', '==', courseId)
      );
      const submissionSnapshot = await getDocs(submissionQuery);
      const subs = {};

      submissionSnapshot.forEach((doc) => {
        const data = doc.data();
        subs[data.assignmentId] = {
          id: doc.id,
          ...data
        };
      });

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

      setSubmissions(prev => ({
        ...prev,
        [assignmentBlock.id]: {
          id: submissionRef.id,
          ...submissionData
        }
      }));

      await checkAndMarkSectionComplete(weekId, sectionId);
      alert('Assignment submitted successfully!');
    } catch (err) {
      console.error('Error submitting assignment:', err);
      alert('Failed to submit assignment. Please try again.');
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

      setSubmissions(prev => ({
        ...prev,
        [assignmentBlock.id]: {
          id: submissionRef.id,
          ...submissionData
        }
      }));

      await checkAndMarkSectionComplete(weekId, sectionId);
      alert('File uploaded successfully!');
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Failed to upload file. Please try again.');
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

      setSubmissions(prev => ({
        ...prev,
        [assignmentBlock.id]: {
          id: submissionRef.id,
          ...submissionData
        }
      }));

      await checkAndMarkSectionComplete(weekId, sectionId);
      alert('URL submitted successfully!');
    } catch (err) {
      console.error('Error submitting URL:', err);
      alert('Failed to submit URL. Please try again.');
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

  return (
    <div className="min-h-screen flex flex-col bg-white">
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
                      checkAndMarkSectionComplete(currentWeek.id, currentSection.id);
                    }}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-base">No content available for this section yet.</p>
                </div>
              )}
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