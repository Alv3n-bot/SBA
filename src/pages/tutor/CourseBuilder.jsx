import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { 
  Book, Plus, Save, Eye, Users, ChevronDown, ChevronRight, 
  Trash2, Edit2, Check, X, ArrowUp, ArrowDown, FileText, 
  Video, List, Link as LinkIcon, Image, Code, ClipboardCheck, 
  HelpCircle, GripVertical, Settings, BarChart3, Clock,
  AlertCircle, CheckCircle, Search, Filter, Download,
  Upload, Copy, Calendar, Award
} from 'lucide-react';

// ==================== MAIN COMPONENT ====================
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
  const [editingItem, setEditingItem] = useState(null);
  const [viewMode, setViewMode] = useState('edit'); // edit or preview
  
  // Assignment & Grading
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [gradeFilter, setGradeFilter] = useState('all'); // all, graded, ungraded, late
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

  // ==================== LOAD COURSE ====================
  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    setLoading(true);
    try {
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      if (courseDoc.exists()) {
        const data = courseDoc.data();
        setCourse(data);
        lastSavedRef.current = JSON.stringify(data);
        
        // Auto-expand first week
        if (data.weeks?.length > 0) {
          setExpandedWeeks({ [data.weeks[0].id]: true });
        }
      } else {
        // Initialize new course
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

  // ==================== AUTO-SAVE ====================
  useEffect(() => {
    if (!course || !lastSavedRef.current) return;
    
    const currentState = JSON.stringify(course);
    if (currentState === lastSavedRef.current) return;
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout for auto-save (2 seconds after last change)
    saveTimeoutRef.current = setTimeout(() => {
      saveCourse(true);
    }, 2000);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [course]);

  // ==================== SAVE COURSE ====================
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

  // ==================== NOTIFICATIONS ====================
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // ==================== WEEK MANAGEMENT ====================
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

  // ==================== SECTION MANAGEMENT ====================
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

  // ==================== CONTENT BLOCK MANAGEMENT ====================
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
      // Update existing block
      updateSection(weekId, sectionId, {
        content: section.content.map(b => 
          b.id === modalData.existingBlock.id ? { ...b, ...blockData } : b
        )
      });
    } else {
      // Add new block
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

  // ==================== SUBMISSIONS & GRADING ====================
  useEffect(() => {
    if (activeTab === 'grades') {
      loadSubmissions();
    }
  }, [activeTab]);

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

  // ==================== RENDER ====================
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
      {notification && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 ${
          notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className={notification.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {notification.message}
          </span>
        </div>
      )}

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

// ==================== CONTENT TAB ====================
function ContentTab({ 
  course, viewMode, expandedWeeks, setExpandedWeeks, 
  expandedSections, setExpandedSections, addWeek, updateWeek, 
  deleteWeek, moveWeek, duplicateWeek, addSection, updateSection, 
  deleteSection, moveSection, openContentModal, deleteContentBlock, 
  moveContentBlock 
}) {
  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {viewMode === 'edit' ? (
            <>
              <input
                type="text"
                value={course.title}
                onChange={(e) => updateWeek(null, { title: e.target.value })}
                className="text-2xl font-bold w-full border-none focus:ring-0 p-0"
                placeholder="Course Title"
              />
              <textarea
                value={course.description}
                onChange={(e) => updateWeek(null, { description: e.target.value })}
                className="w-full border-gray-300 rounded-lg resize-none"
                rows="3"
                placeholder="Course description..."
              />
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold">{course.title}</h2>
              <p className="text-gray-600">{course.description}</p>
            </>
          )}
        </div>
      </div>

      {/* Weeks */}
      {course.weeks.map((week, weekIndex) => (
        <WeekCard
          key={week.id}
          week={week}
          weekIndex={weekIndex}
          totalWeeks={course.weeks.length}
          viewMode={viewMode}
          expanded={expandedWeeks[week.id]}
          onToggle={() => setExpandedWeeks({ ...expandedWeeks, [week.id]: !expandedWeeks[week.id] })}
          onUpdate={(updates) => updateWeek(week.id, updates)}
          onDelete={() => deleteWeek(week.id)}
          onMove={(direction) => moveWeek(week.id, direction)}
          onDuplicate={() => duplicateWeek(week.id)}
          onAddSection={() => addSection(week.id)}
          expandedSections={expandedSections}
          setExpandedSections={setExpandedSections}
          updateSection={updateSection}
          deleteSection={deleteSection}
          moveSection={moveSection}
          openContentModal={openContentModal}
          deleteContentBlock={deleteContentBlock}
          moveContentBlock={moveContentBlock}
        />
      ))}

      {/* Add Week Button */}
      {viewMode === 'edit' && (
        <button
          onClick={addWeek}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition font-medium flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Week
        </button>
      )}
    </div>
  );
}

// ==================== WEEK CARD ====================
function WeekCard({ 
  week, weekIndex, totalWeeks, viewMode, expanded, onToggle, 
  onUpdate, onDelete, onMove, onDuplicate, onAddSection,
  expandedSections, setExpandedSections, updateSection, 
  deleteSection, moveSection, openContentModal, 
  deleteContentBlock, moveContentBlock 
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Week Header */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <button
            onClick={onToggle}
            className="flex items-center flex-1 text-left"
          >
            {expanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
            )}
            <div className="flex-1">
              {viewMode === 'edit' ? (
                <input
                  type="text"
                  value={week.title}
                  onChange={(e) => {
                    e.stopPropagation();
                    onUpdate({ title: e.target.value });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="text-lg font-semibold border-none focus:ring-0 p-0 w-full"
                  placeholder="Week title"
                />
              ) : (
                <h3 className="text-lg font-semibold">{week.title}</h3>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {week.sections.length} section{week.sections.length !== 1 ? 's' : ''}
              </p>
            </div>
          </button>

          {viewMode === 'edit' && (
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => onMove('up')}
                disabled={weekIndex === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="Move up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => onMove('down')}
                disabled={weekIndex === totalWeeks - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                title="Move down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onClick={onDuplicate}
                className="p-1 text-gray-400 hover:text-gray-600"
                title="Duplicate"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-1 text-red-400 hover:text-red-600"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {viewMode === 'edit' && expanded && (
          <textarea
            value={week.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="mt-4 w-full border-gray-300 rounded-lg text-sm resize-none"
            rows="2"
            placeholder="Week description (optional)"
          />
        )}
        {viewMode === 'preview' && week.description && (
          <p className="mt-4 text-gray-600 text-sm">{week.description}</p>
        )}
      </div>

      {/* Sections */}
      {expanded && (
        <div className="border-t border-gray-200 p-6 space-y-4">
          {week.sections.map((section, sectionIndex) => (
            <SectionCard
              key={section.id}
              weekId={week.id}
              section={section}
              sectionIndex={sectionIndex}
              totalSections={week.sections.length}
              viewMode={viewMode}
              expanded={expandedSections[section.id]}
              onToggle={() => setExpandedSections({ ...expandedSections, [section.id]: !expandedSections[section.id] })}
              onUpdate={(updates) => updateSection(week.id, section.id, updates)}
              onDelete={() => deleteSection(week.id, section.id)}
              onMove={(direction) => moveSection(week.id, section.id, direction)}
              openContentModal={openContentModal}
              deleteContentBlock={deleteContentBlock}
              moveContentBlock={moveContentBlock}
            />
          ))}

          {viewMode === 'edit' && (
            <button
              onClick={onAddSection}
              className="w-full py-3 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition text-sm font-medium flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ==================== SECTION CARD ====================
function SectionCard({ 
  weekId, section, sectionIndex, totalSections, viewMode, 
  expanded, onToggle, onUpdate, onDelete, onMove, 
  openContentModal, deleteContentBlock, moveContentBlock 
}) {
  const contentTypes = [
    { type: 'heading', label: 'Heading', icon: FileText },
    { type: 'text', label: 'Text', icon: FileText },
    { type: 'video', label: 'Video', icon: Video },
    { type: 'image', label: 'Image', icon: Image },
    { type: 'link', label: 'Link', icon: LinkIcon },
    { type: 'list', label: 'List', icon: List },
    { type: 'code', label: 'Code', icon: Code },
    { type: 'assignment', label: 'Assignment', icon: ClipboardCheck },
    { type: 'quiz', label: 'Quiz', icon: HelpCircle }
  ];

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <button
            onClick={onToggle}
            className="flex items-center flex-1 text-left"
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
            )}
            <div className="flex-1">
              {viewMode === 'edit' ? (
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => {
                    e.stopPropagation();
                    onUpdate({ title: e.target.value });
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="font-medium text-gray-900 border-none focus:ring-0 p-0 w-full bg-transparent"
                  placeholder="Section title"
                />
              ) : (
                <h4 className="font-medium text-gray-900">{section.title}</h4>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {section.content.length} item{section.content.length !== 1 ? 's' : ''}
              </p>
            </div>
          </button>

          {viewMode === 'edit' && (
            <div className="flex items-center space-x-1 ml-4">
              <button
                onClick={() => onMove('up')}
                disabled={sectionIndex === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => onMove('down')}
                disabled={sectionIndex === totalSections - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
              <button
                onClick={onDelete}
                className="p-1 text-red-400 hover:text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-200 p-4 space-y-3">
          {section.content.map((block, blockIndex) => (
            <ContentBlock
              key={block.id}
              weekId={weekId}
              sectionId={section.id}
              block={block}
              blockIndex={blockIndex}
              totalBlocks={section.content.length}
              viewMode={viewMode}
              onEdit={() => openContentModal(weekId, section.id, block.type, block)}
              onDelete={() => deleteContentBlock(weekId, section.id, block.id)}
              onMove={(direction) => moveContentBlock(weekId, section.id, block.id, direction)}
            />
          ))}

          {viewMode === 'edit' && (
            <div className="pt-2">
              <p className="text-xs font-medium text-gray-700 mb-2">Add Content:</p>
              <div className="grid grid-cols-3 gap-2">
                {contentTypes.map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => openContentModal(weekId, section.id, type)}
                    className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition text-xs"
                  >
                    <Icon className="w-4 h-4 mb-1 text-gray-600" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==================== CONTENT BLOCK ====================
function ContentBlock({ weekId, sectionId, block, blockIndex, totalBlocks, viewMode, onEdit, onDelete, onMove }) {
  const renderPreview = () => {
    switch (block.type) {
      case 'heading':
        const HeadingTag = `h${block.level || 2}`;
        return <HeadingTag className="font-bold text-gray-900">{block.text}</HeadingTag>;
      
      case 'text':
        return <p className="text-gray-700">{block.content}</p>;
      
      case 'video':
        return (
          <div className="bg-gray-100 p-4 rounded border border-gray-200">
            <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-center">{block.title || 'Video'}</p>
            {block.url && <p className="text-xs text-gray-500 text-center truncate">{block.url}</p>}
          </div>
        );
      
      case 'image':
        return (
          <div className="bg-gray-100 p-4 rounded border border-gray-200">
            {block.url ? (
              <img src={block.url} alt={block.alt} className="max-w-full h-auto rounded" />
            ) : (
              <Image className="w-8 h-8 text-gray-400 mx-auto" />
            )}
            {block.caption && <p className="text-sm text-gray-600 mt-2">{block.caption}</p>}
          </div>
        );
      
      case 'link':
        return (
          <a href={block.url} target={block.openNewTab ? '_blank' : '_self'} rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center">
            <LinkIcon className="w-4 h-4 mr-2" />
            {block.text}
          </a>
        );
      
      case 'list':
        const ListTag = block.ordered ? 'ol' : 'ul';
        return (
          <ListTag className={block.ordered ? 'list-decimal list-inside' : 'list-disc list-inside'}>
            {block.items?.map((item, i) => (
              <li key={i} className="text-gray-700">{item}</li>
            ))}
          </ListTag>
        );
      
      case 'code':
        return (
          <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
            <code>{block.code}</code>
          </pre>
        );
      
      case 'assignment':
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center">
                <ClipboardCheck className="w-5 h-5 text-yellow-600 mr-2" />
                <h5 className="font-semibold text-gray-900">{block.title || 'Assignment'}</h5>
              </div>
              <span className="text-sm font-medium text-yellow-700">{block.points} points</span>
            </div>
            {block.description && <p className="text-sm text-gray-700 mb-2">{block.description}</p>}
            {block.dueDate && (
              <div className="flex items-center text-xs text-gray-600">
                <Calendar className="w-3 h-3 mr-1" />
                Due: {new Date(block.dueDate).toLocaleDateString()}
              </div>
            )}
          </div>
        );
      
      case 'quiz':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center">
                <HelpCircle className="w-5 h-5 text-blue-600 mr-2" />
                <h5 className="font-semibold text-gray-900">{block.title || 'Quiz'}</h5>
              </div>
              <span className="text-sm font-medium text-blue-700">{block.questions?.length || 0} questions</span>
            </div>
            {block.timeLimit && (
              <div className="flex items-center text-xs text-gray-600">
                <Clock className="w-3 h-3 mr-1" />
                Time limit: {block.timeLimit} minutes
              </div>
            )}
          </div>
        );
      
      default:
        return <p className="text-gray-500 text-sm">Unknown content type</p>;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          {renderPreview()}
        </div>
        
        {viewMode === 'edit' && (
          <div className="flex items-center space-x-1 ml-3">
            <button
              onClick={() => onMove('up')}
              disabled={blockIndex === 0}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => onMove('down')}
              disabled={blockIndex === totalBlocks - 1}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
            <button
              onClick={onEdit}
              className="p-1 text-blue-400 hover:text-blue-600"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-red-400 hover:text-red-600"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== GRADES TAB ====================
function GradesTab({ submissions, loadingSubmissions, course, gradeFilter, setGradeFilter, searchTerm, setSearchTerm, setShowGradeModal, setModalData }) {
  const filteredSubmissions = submissions.filter(sub => {
    if (gradeFilter === 'graded' && !sub.grade) return false;
    if (gradeFilter === 'ungraded' && sub.grade !== undefined && sub.grade !== null) return false;
    if (gradeFilter === 'late' && !sub.isLate) return false;
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        sub.studentName?.toLowerCase().includes(search) ||
        sub.assignmentTitle?.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  if (loadingSubmissions) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students or assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            {['all', 'graded', 'ungraded', 'late'].map(filter => (
              <button
                key={filter}
                onClick={() => setGradeFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                  gradeFilter === filter
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No submissions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{sub.studentName || 'Unknown Student'}</div>
                      <div className="text-sm text-gray-500">{sub.studentEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{sub.assignmentTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sub.isLate ? (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Late</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">On Time</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sub.grade !== undefined && sub.grade !== null ? (
                        <span className="text-sm font-semibold text-gray-900">{sub.grade}/{sub.maxPoints}</span>
                      ) : (
                        <span className="text-sm text-gray-400">Not graded</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setModalData(sub);
                          setShowGradeModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {sub.grade !== undefined && sub.grade !== null ? 'Edit Grade' : 'Grade'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== ANALYTICS TAB ====================
function AnalyticsTab({ course, submissions }) {
  const totalSubmissions = submissions.length;
  const gradedSubmissions = submissions.filter(s => s.grade !== undefined && s.grade !== null).length;
  const averageGrade = gradedSubmissions > 0
    ? submissions.filter(s => s.grade !== undefined).reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions
    : 0;
  const lateSubmissions = submissions.filter(s => s.isLate).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalSubmissions}</p>
            </div>
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Graded</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{gradedSubmissions}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Grade</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{averageGrade.toFixed(1)}%</p>
            </div>
            <Award className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Late Submissions</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{lateSubmissions}</p>
            </div>
            <Clock className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Progress</h3>
        <p className="text-gray-600">Analytics and detailed reports will be available soon.</p>
      </div>
    </div>
  );
}

// ==================== SETTINGS TAB ====================
function SettingsTab({ course, setCourse }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Allow Late Submissions</p>
              <p className="text-sm text-gray-500">Students can submit assignments after the due date</p>
            </div>
            <input
              type="checkbox"
              checked={course.settings?.allowLateSubmissions}
              onChange={(e) => setCourse({
                ...course,
                settings: { ...course.settings, allowLateSubmissions: e.target.checked }
              })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-900 mb-2">Late Submission Penalty (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={course.settings?.lateSubmissionPenalty || 0}
              onChange={(e) => setCourse({
                ...course,
                settings: { ...course.settings, lateSubmissionPenalty: parseInt(e.target.value) }
              })}
              className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-900 mb-2">Grade Scale</label>
            <select
              value={course.settings?.gradeScale || 'percentage'}
              onChange={(e) => setCourse({
                ...course,
                settings: { ...course.settings, gradeScale: e.target.value }
              })}
              className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="percentage">Percentage (0-100)</option>
              <option value="points">Points</option>
              <option value="letter">Letter Grade (A-F)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== MODALS ====================
function ContentBlockModal({ modalData, onSave, onClose }) {
  const [formData, setFormData] = useState(modalData.existingBlock || {
    type: modalData.blockType,
    ...(modalData.blockType === 'heading' && { text: '', level: 2 }),
    ...(modalData.blockType === 'text' && { content: '' }),
    ...(modalData.blockType === 'video' && { url: '', title: '', description: '' }),
    ...(modalData.blockType === 'image' && { url: '', alt: '', caption: '' }),
    ...(modalData.blockType === 'link' && { url: '', text: '', openNewTab: true }),
    ...(modalData.blockType === 'list' && { items: [''], ordered: false }),
    ...(modalData.blockType === 'code' && { code: '', language: 'javascript' })
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {modalData.existingBlock ? 'Edit' : 'Add'} {modalData.blockType}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {modalData.blockType === 'heading' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heading Text</label>
                <input
                  type="text"
                  value={formData.text || ''}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heading Level</label>
                <select
                  value={formData.level || 2}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {[1, 2, 3, 4, 5, 6].map(level => (
                    <option key={level} value={level}>H{level}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {modalData.blockType === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                rows="6"
                required
              />
            </div>
          )}

          {modalData.blockType === 'video' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                <input
                  type="url"
                  value={formData.url || ''}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://youtube.com/watch?v=..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                />
              </div>
            </>
          )}

          {modalData.blockType === 'image' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.url || ''}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
                <input
                  type="text"
                  value={formData.alt || ''}
                  onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Description for accessibility"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Caption (optional)</label>
                <input
                  type="text"
                  value={formData.caption || ''}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </>
          )}

          {modalData.blockType === 'link' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                <input
                  type="url"
                  value={formData.url || ''}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link Text</label>
                <input
                  type="text"
                  value={formData.text || ''}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.openNewTab}
                  onChange={(e) => setFormData({ ...formData, openNewTab: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Open in new tab</label>
              </div>
            </>
          )}

          {modalData.blockType === 'list' && (
            <>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={formData.ordered}
                  onChange={(e) => setFormData({ ...formData, ordered: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Numbered list</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">List Items</label>
                {formData.items?.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index] = e.target.value;
                        setFormData({ ...formData, items: newItems });
                      }}
                      className="flex-1 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={`Item ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newItems = formData.items.filter((_, i) => i !== index);
                        setFormData({ ...formData, items: newItems });
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, items: [...formData.items, ''] })}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  + Add Item
                </button>
              </div>
            </>
          )}

          {modalData.blockType === 'code' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Programming Language</label>
                <select
                  value={formData.language || 'javascript'}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="sql">SQL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
                <textarea
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                  rows="10"
                  required
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {modalData.existingBlock ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssignmentModal({ modalData, onSave, onClose }) {
  const [formData, setFormData] = useState(modalData.existingBlock || {
    type: 'assignment',
    title: '',
    description: '',
    dueDate: '',
    points: 100,
    submissionType: 'text',
    rubric: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {modalData.existingBlock ? 'Edit' : 'Create'} Assignment
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              rows="4"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Submission Type</label>
            <select
              value={formData.submissionType}
              onChange={(e) => setFormData({ ...formData, submissionType: e.target.value })}
              className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="text">Text Entry</option>
              <option value="file">File Upload</option>
              <option value="url">Website URL</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grading Rubric (Optional)</label>
            {formData.rubric?.map((criterion, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={criterion.name}
                  onChange={(e) => {
                    const newRubric = [...formData.rubric];
                    newRubric[index].name = e.target.value;
                    setFormData({ ...formData, rubric: newRubric });
                  }}
                  className="flex-1 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Criterion name"
                />
                <input
                  type="number"
                  value={criterion.points}
                  onChange={(e) => {
                    const newRubric = [...formData.rubric];
                    newRubric[index].points = parseInt(e.target.value);
                    setFormData({ ...formData, rubric: newRubric });
                  }}
                  className="w-24 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Points"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newRubric = formData.rubric.filter((_, i) => i !== index);
                    setFormData({ ...formData, rubric: newRubric });
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, rubric: [...(formData.rubric || []), { name: '', points: 0 }] })}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              + Add Rubric Item
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {modalData.existingBlock ? 'Update' : 'Create'} Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function QuizModal({ modalData, onSave, onClose }) {
  const [formData, setFormData] = useState(modalData.existingBlock || {
    type: 'quiz',
    title: '',
    timeLimit: 30,
    attempts: 1,
    questions: []
  });

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, {
        id: `q_${Date.now()}`,
        type: 'multiple_choice',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 10,
        explanation: ''
      }]
    });
  };

  const updateQuestion = (index, updates) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setFormData({ ...formData, questions: newQuestions });
  };

  const deleteQuestion = (index) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {modalData.existingBlock ? 'Edit' : 'Create'} Quiz
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (minutes)</label>
              <input
                type="number"
                value={formData.timeLimit}
                onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Attempts</label>
              <input
                type="number"
                value={formData.attempts}
                onChange={(e) => setFormData({ ...formData, attempts: parseInt(e.target.value) })}
                className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                min="1"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">Questions</label>
              <button
                type="button"
                onClick={addQuestion}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Question
              </button>
            </div>

            {formData.questions.map((question, qIndex) => (
              <div key={question.id} className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Question {qIndex + 1}</span>
                  <button
                    type="button"
                    onClick={() => deleteQuestion(qIndex)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
                    className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter question"
                    required
                  />

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Answer Options</label>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex gap-2 mb-2">
                        <input
                          type="radio"
                          name={`correct_${qIndex}`}
                          checked={question.correctAnswer === oIndex}
                          onChange={() => updateQuestion(qIndex, { correctAnswer: oIndex })}
                          className="mt-1"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...question.options];
                            newOptions[oIndex] = e.target.value;
                            updateQuestion(qIndex, { options: newOptions });
                          }}
                          className="flex-1 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          placeholder={`Option ${oIndex + 1}`}
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Points</label>
                      <input
                        type="number"
                        value={question.points}
                        onChange={(e) => updateQuestion(qIndex, { points: parseInt(e.target.value) })}
                        className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Explanation (optional)</label>
                      <input
                        type="text"
                        value={question.explanation || ''}
                        onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })}
                        className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        placeholder="Explain the correct answer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {formData.questions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No questions yet. Click "Add Question" to get started.
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {modalData.existingBlock ? 'Update' : 'Create'} Quiz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GradeModal({ submission, onSave, onClose }) {
  const [grade, setGrade] = useState(submission.grade || '');
  const [feedback, setFeedback] = useState(submission.feedback || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(submission.id, { grade: parseInt(grade), feedback });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Grade Submission</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Student</p>
                <p className="font-medium text-gray-900">{submission.studentName}</p>
              </div>
              <div>
                <p className="text-gray-600">Assignment</p>
                <p className="font-medium text-gray-900">{submission.assignmentTitle}</p>
              </div>
              <div>
                <p className="text-gray-600">Submitted</p>
                <p className="font-medium text-gray-900">
                  {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  submission.isLate ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {submission.isLate ? 'Late' : 'On Time'}
                </span>
              </div>
            </div>
          </div>

          {submission.content && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Submission</label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{submission.content}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade (out of {submission.maxPoints})
              </label>
              <input
                type="number"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                min="0"
                max={submission.maxPoints}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                rows="6"
                placeholder="Provide feedback to the student..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save Grade
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}