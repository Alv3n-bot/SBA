import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { Book, Save, Eye, Edit2, Award, BarChart3, Settings } from 'lucide-react';
import ContentTab from './ContentTab/ContentTab';
import GradesTab from './GradesTab/GradesTab';
import AnalyticsTab from './AnalyticsTab/AnalyticsTab';
import SettingsTab from './SettingsTab/SettingsTab';
import Notification from './Shared/Notification';
import ContentBlockModal from './Modals/ContentBlockModal';
import QuizModal from './Modals/QuizModal';
import AssignmentModal from './Modals/AssignmentModal';
import GradeModal from './GradesTab/GradeModal';

export default function CourseBuilder({ courseId, courseName }) {
  // Core State
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [notification, setNotification] = useState(null);
  
  // Content Management
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [viewMode, setViewMode] = useState('edit');
  
  // Assignment & Grading
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradeFilter, setGradeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [showContentModal, setShowContentModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  
  // Auto-save
  const saveTimeoutRef = useRef(null);
  const lastSavedRef = useRef(null);

  // Load course function
  const loadCourse = async () => {
    setLoading(true);
    try {
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      if (courseDoc.exists()) {
        const data = courseDoc.data();
        setCourse(data);
        lastSavedRef.current = JSON.stringify(data);
        
        if (data.weeks?.length > 0) {
          setExpandedWeeks({ [data.weeks[0].id]: true });
        }
      } else {
        const newCourse = {
          id: courseId,
          title: courseName || "New Course",
          description: "",
          weeks: [],
          settings: {
            allowLateSubmissions: true,
            lateSubmissionPenalty: 10,
            gradeScale: 'percentage'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, 'courses', courseId), newCourse);
        setCourse(newCourse);
        lastSavedRef.current = JSON.stringify(newCourse);
      }
    } catch (err) {
      showNotification('error', 'Failed to load course: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (!course || !lastSavedRef.current) return;
    
    const currentState = JSON.stringify(course);
    if (currentState === lastSavedRef.current) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveCourse(true);
    }, 2000);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [course]);

  // Save course function
  const saveCourse = async (isAutoSave = false) => {
    if (!course) return;
    
    setSaving(true);
    try {
      const updatedCourse = {
        ...course,
        updatedAt: new Date().toISOString(),
        lastModifiedBy: auth.currentUser?.uid
      };
      
      await setDoc(doc(db, 'courses', courseId), updatedCourse);
      lastSavedRef.current = JSON.stringify(updatedCourse);
      
      if (!isAutoSave) {
        showNotification('success', 'Course saved successfully!');
      }
    } catch (err) {
      showNotification('error', 'Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Notification function
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Week management functions
  const addWeek = () => {
    const weekId = `week_${Date.now()}`;
    const newWeek = {
      id: weekId,
      title: `Week ${course.weeks.length + 1}`,
      description: "",
      order: course.weeks.length,
      sections: [],
      published: false
    };
    
    setCourse({
      ...course,
      weeks: [...course.weeks, newWeek]
    });
    setExpandedWeeks({ ...expandedWeeks, [weekId]: true });
  };

  const updateWeek = (weekId, updates) => {
    setCourse({
      ...course,
      weeks: course.weeks.map(w => 
        w.id === weekId ? { ...w, ...updates } : w
      )
    });
  };

  const deleteWeek = (weekId) => {
    if (window.confirm('Delete this week and all its content? This cannot be undone.')) {
      setCourse({
        ...course,
        weeks: course.weeks.filter(w => w.id !== weekId)
      });
      showNotification('success', 'Week deleted');
    }
  };

  const moveWeek = (weekId, direction) => {
    const weeks = [...course.weeks];
    const index = weeks.findIndex(w => w.id === weekId);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < weeks.length) {
      [weeks[index], weeks[newIndex]] = [weeks[newIndex], weeks[index]];
      weeks.forEach((w, i) => w.order = i);
      setCourse({ ...course, weeks });
    }
  };

  const duplicateWeek = (weekId) => {
    const week = course.weeks.find(w => w.id === weekId);
    const newWeekId = `week_${Date.now()}`;
    const duplicated = {
      ...JSON.parse(JSON.stringify(week)),
      id: newWeekId,
      title: `${week.title} (Copy)`,
      order: course.weeks.length,
      sections: week.sections.map(s => ({
        ...s,
        id: `section_${Date.now()}_${Math.random()}`,
        content: s.content.map(c => ({
          ...c,
          id: `block_${Date.now()}_${Math.random()}`
        }))
      }))
    };
    
    setCourse({
      ...course,
      weeks: [...course.weeks, duplicated]
    });
    showNotification('success', 'Week duplicated');
  };

  // Section management functions
  const addSection = (weekId) => {
    const week = course.weeks.find(w => w.id === weekId);
    const sectionId = `section_${Date.now()}`;
    const newSection = {
      id: sectionId,
      title: `Section ${week.sections.length + 1}`,
      description: "",
      order: week.sections.length,
      content: []
    };
    
    updateWeek(weekId, {
      sections: [...week.sections, newSection]
    });
    setExpandedSections({ ...expandedSections, [sectionId]: true });
  };

  const updateSection = (weekId, sectionId, updates) => {
    const week = course.weeks.find(w => w.id === weekId);
    updateWeek(weekId, {
      sections: week.sections.map(s => 
        s.id === sectionId ? { ...s, ...updates } : s
      )
    });
  };

  const deleteSection = (weekId, sectionId) => {
    if (window.confirm('Delete this section and all its content?')) {
      const week = course.weeks.find(w => w.id === weekId);
      updateWeek(weekId, {
        sections: week.sections.filter(s => s.id !== sectionId)
      });
      showNotification('success', 'Section deleted');
    }
  };

  const moveSection = (weekId, sectionId, direction) => {
    const week = course.weeks.find(w => w.id === weekId);
    const sections = [...week.sections];
    const index = sections.findIndex(s => s.id === sectionId);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < sections.length) {
      [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
      sections.forEach((s, i) => s.order = i);
      updateWeek(weekId, { sections });
    }
  };

  // Content block management functions
  const openContentModal = (weekId, sectionId, blockType, existingBlock = null) => {
    setModalData({
      weekId,
      sectionId,
      blockType,
      existingBlock
    });
    
    if (blockType === 'quiz') {
      setShowQuizModal(true);
    } else if (blockType === 'assignment') {
      setShowAssignmentModal(true);
    } else {
      setShowContentModal(true);
    }
  };

  const saveContentBlock = (blockData) => {
    const { weekId, sectionId } = modalData;
    const week = course.weeks.find(w => w.id === weekId);
    const section = week.sections.find(s => s.id === sectionId);
    
    if (modalData.existingBlock) {
      updateSection(weekId, sectionId, {
        content: section.content.map(b => 
          b.id === modalData.existingBlock.id ? { ...b, ...blockData } : b
        )
      });
    } else {
      const newBlock = {
        ...blockData,
        id: `block_${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      updateSection(weekId, sectionId, {
        content: [...section.content, newBlock]
      });
    }
    
    closeModals();
    showNotification('success', modalData.existingBlock ? 'Content updated' : 'Content added');
  };

  const deleteContentBlock = (weekId, sectionId, blockId) => {
    if (window.confirm('Delete this content block?')) {
      const week = course.weeks.find(w => w.id === weekId);
      const section = week.sections.find(s => s.id === sectionId);
      
      updateSection(weekId, sectionId, {
        content: section.content.filter(b => b.id !== blockId)
      });
      showNotification('success', 'Content deleted');
    }
  };

  const moveContentBlock = (weekId, sectionId, blockId, direction) => {
    const week = course.weeks.find(w => w.id === weekId);
    const section = week.sections.find(s => s.id === sectionId);
    const content = [...section.content];
    const index = content.findIndex(b => b.id === blockId);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < content.length) {
      [content[index], content[newIndex]] = [content[newIndex], content[index]];
      updateSection(weekId, sectionId, { content });
    }
  };

  const closeModals = () => {
    setShowContentModal(false);
    setShowQuizModal(false);
    setShowAssignmentModal(false);
    setShowGradeModal(false);
    setModalData(null);
  };

  // Submissions & grading functions
  const loadSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const q = query(
        collection(db, 'submissions'), 
        where('courseId', '==', courseId)
      );
      const snapshot = await getDocs(q);
      const subs = [];
      snapshot.forEach((doc) => {
        subs.push({ id: doc.id, ...doc.data() });
      });
      setSubmissions(subs);
    } catch (err) {
      showNotification('error', 'Failed to load submissions: ' + err.message);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const saveGrade = async (submissionId, gradeData) => {
    try {
      await updateDoc(doc(db, 'submissions', submissionId), {
        ...gradeData,
        gradedAt: new Date().toISOString(),
        gradedBy: auth.currentUser?.uid
      });
      
      setSubmissions(prev => prev.map(sub => 
        sub.id === submissionId ? { ...sub, ...gradeData } : sub
      ));
      
      showNotification('success', 'Grade saved successfully');
      setShowGradeModal(false);
    } catch (err) {
      showNotification('error', 'Failed to save grade: ' + err.message);
    }
  };

  // Load course on mount
  useEffect(() => {
    loadCourse();
  }, [courseId]);

  // Load submissions when grades tab is active
  useEffect(() => {
    if (activeTab === 'grades') {
      loadSubmissions();
    }
  }, [activeTab]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">Failed to load course</p>
          <button 
            onClick={loadCourse}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Book className="w-6 h-6 text-indigo-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-sm text-gray-500">
                  {saving ? 'Saving...' : 'All changes saved'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {viewMode === 'edit' ? <Eye className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                {viewMode === 'edit' ? 'Preview' : 'Edit Mode'}
              </button>
              
              <button
                onClick={() => saveCourse(false)}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Now
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-8 border-t border-gray-200">
            {[
              { id: 'content', label: 'Course Content', icon: Book },
              { id: 'grades', label: 'Grades & Submissions', icon: Award },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && <Notification notification={notification} />}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'content' && (
          <ContentTab
            course={course}
            viewMode={viewMode}
            expandedWeeks={expandedWeeks}
            setExpandedWeeks={setExpandedWeeks}
            expandedSections={expandedSections}
            setExpandedSections={setExpandedSections}
            addWeek={addWeek}
            updateWeek={updateWeek}
            deleteWeek={deleteWeek}
            moveWeek={moveWeek}
            duplicateWeek={duplicateWeek}
            addSection={addSection}
            updateSection={updateSection}
            deleteSection={deleteSection}
            moveSection={moveSection}
            openContentModal={openContentModal}
            deleteContentBlock={deleteContentBlock}
            moveContentBlock={moveContentBlock}
          />
        )}

        {activeTab === 'grades' && (
          <GradesTab
            submissions={submissions}
            loadingSubmissions={loadingSubmissions}
            course={course}
            gradeFilter={gradeFilter}
            setGradeFilter={setGradeFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setShowGradeModal={setShowGradeModal}
            setModalData={setModalData}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab course={course} submissions={submissions} />
        )}

        {activeTab === 'settings' && (
          <SettingsTab course={course} setCourse={setCourse} />
        )}
      </div>

      {/* Modals */}
      {showContentModal && (
        <ContentBlockModal
          modalData={modalData}
          onSave={saveContentBlock}
          onClose={closeModals}
        />
      )}

      {showQuizModal && (
        <QuizModal
          modalData={modalData}
          onSave={saveContentBlock}
          onClose={closeModals}
        />
      )}

      {showAssignmentModal && (
        <AssignmentModal
          modalData={modalData}
          onSave={saveContentBlock}
          onClose={closeModals}
        />
      )}

      {showGradeModal && modalData && (
        <GradeModal
          submission={modalData}
          onSave={saveGrade}
          onClose={closeModals}
        />
      )}
    </div>
  );
}