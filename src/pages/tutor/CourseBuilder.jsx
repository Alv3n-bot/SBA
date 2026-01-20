import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import TopBar from './components/TopBar';
import CourseHeader from './components/CourseHeader';
import WeekItem from './components/WeekItem';
import SubmissionsView from './components/SubmissionsView';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import { Book, Plus } from 'lucide-react';

export default function CourseBuilder({ courseId, courseName }) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedWeeks, setExpandedWeeks] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [previewMode, setPreviewMode] = useState(false);
  const [submissionsMode, setSubmissionsMode] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [editingGrade, setEditingGrade] = useState(null);
  const [gradeInput, setGradeInput] = useState('');

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    setLoading(true);
    setError('');
    try {
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      if (courseDoc.exists()) {
        const data = courseDoc.data();
        setCourse(data);
        if (data.weeks && data.weeks.length > 0) {
          setExpandedWeeks({ [data.weeks[0].id]: true });
        }
      } else {
        const newCourse = {
          id: courseId,
          title: courseName || "New Course",
          description: "",
          weeks: []
        };
        setCourse(newCourse);
      }
    } catch (err) {
      setError('Error loading course: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleWeek = (weekId) => {
    setExpandedWeeks(prev => ({ ...prev, [weekId]: !prev[weekId] }));
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const addWeek = () => {
    const weekId = `week_${Date.now()}`;
    const newWeek = {
      id: weekId,
      title: `Week ${course.weeks.length + 1}`,
      description: "",
      order: course.weeks.length + 1,
      sections: []
    };
    setCourse({
      ...course,
      weeks: [...course.weeks, newWeek]
    });
    setExpandedWeeks({ ...expandedWeeks, [weekId]: true });
  };

  const updateWeek = (weekId, field, value) => {
    const updatedWeeks = course.weeks.map(week =>
      week.id === weekId ? { ...week, [field]: value } : week
    );
    setCourse({ ...course, weeks: updatedWeeks });
  };

  const deleteWeek = (weekId) => {
    if (confirm('Delete this week and all its content?')) {
      setCourse({
        ...course,
        weeks: course.weeks.filter(w => w.id !== weekId)
      });
    }
  };

  const moveWeek = (weekId, direction) => {
    const weeks = [...course.weeks];
    const index = weeks.findIndex(w => w.id === weekId);
    if (direction === 'up' && index > 0) {
      [weeks[index - 1], weeks[index]] = [weeks[index], weeks[index - 1]];
    } else if (direction === 'down' && index < weeks.length - 1) {
      [weeks[index], weeks[index + 1]] = [weeks[index + 1], weeks[index]];
    }
    setCourse({ ...course, weeks });
  };

  const addSection = (weekId) => {
    const updatedWeeks = course.weeks.map(week => {
      if (week.id === weekId) {
        const sectionId = `section_${Date.now()}`;
        return {
          ...week,
          sections: [
            ...week.sections,
            {
              id: sectionId,
              title: `Section ${week.sections.length + 1}`,
              order: week.sections.length + 1,
              content: []
            }
          ]
        };
      }
      return week;
    });
    setCourse({ ...course, weeks: updatedWeeks });
  };

  const updateSection = (weekId, sectionId, field, value) => {
    const updatedWeeks = course.weeks.map(week => {
      if (week.id === weekId) {
        const updatedSections = week.sections.map(section =>
          section.id === sectionId ? { ...section, [field]: value } : section
        );
        return { ...week, sections: updatedSections };
      }
      return week;
    });
    setCourse({ ...course, weeks: updatedWeeks });
  };

  const deleteSection = (weekId, sectionId) => {
    if (confirm('Delete this section and all its content?')) {
      const updatedWeeks = course.weeks.map(week => {
        if (week.id === weekId) {
          return {
            ...week,
            sections: week.sections.filter(s => s.id !== sectionId)
          };
        }
        return week;
      });
      setCourse({ ...course, weeks: updatedWeeks });
    }
  };

  const moveSection = (weekId, sectionId, direction) => {
    const updatedWeeks = course.weeks.map(week => {
      if (week.id === weekId) {
        const sections = [...week.sections];
        const index = sections.findIndex(s => s.id === sectionId);
        if (direction === 'up' && index > 0) {
          [sections[index - 1], sections[index]] = [sections[index], sections[index - 1]];
        } else if (direction === 'down' && index < sections.length - 1) {
          [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
        }
        return { ...week, sections };
      }
      return week;
    });
    setCourse({ ...course, weeks: updatedWeeks });
  };

  const addContentBlock = (weekId, sectionId, type) => {
    const templates = {
      heading: { type: 'heading', text: 'New Heading', level: 2 },
      paragraph: { type: 'paragraph', text: '' },
      video: { type: 'video', url: '', title: '', description: '' },
      list: { type: 'list', items: [''], ordered: false },
      link: { type: 'link', url: '', text: 'Click here', openNewTab: true },
      assignment: { type: 'assignment', title: '', description: '', dueDate: '', points: 100, submissionType: 'text', answerSheet: '' },
      quiz: { type: 'quiz', questions: [] },
      image: { type: 'image', url: '', alt: '', caption: '' },
      code: { type: 'code', language: 'javascript', text: '' }
    };
    const updatedWeeks = course.weeks.map(week => {
      if (week.id === weekId) {
        const updatedSections = week.sections.map(section => {
          if (section.id === sectionId) {
            return {
              ...section,
              content: [
                ...section.content,
                { ...templates[type], id: `block_${Date.now()}` }
              ]
            };
          }
          return section;
        });
        return { ...week, sections: updatedSections };
      }
      return week;
    });
    setCourse({ ...course, weeks: updatedWeeks });
  };

  const updateContentBlock = (weekId, sectionId, blockId, updates) => {
    const updatedWeeks = course.weeks.map(week => {
      if (week.id === weekId) {
        const updatedSections = week.sections.map(section => {
          if (section.id === sectionId) {
            const updatedContent = section.content.map(block =>
              block.id === blockId ? { ...block, ...updates } : block
            );
            return { ...section, content: updatedContent };
          }
          return section;
        });
        return { ...week, sections: updatedSections };
      }
      return week;
    });
    setCourse({ ...course, weeks: updatedWeeks });
  };

  const deleteContentBlock = (weekId, sectionId, blockId) => {
    const updatedWeeks = course.weeks.map(week => {
      if (week.id === weekId) {
        const updatedSections = week.sections.map(section => {
          if (section.id === sectionId) {
            return {
              ...section,
              content: section.content.filter(block => block.id !== blockId)
            };
          }
          return section;
        });
        return { ...week, sections: updatedSections };
      }
      return week;
    });
    setCourse({ ...course, weeks: updatedWeeks });
  };

  const moveContentBlock = (weekId, sectionId, blockId, direction) => {
    const updatedWeeks = course.weeks.map(week => {
      if (week.id === weekId) {
        const updatedSections = week.sections.map(section => {
          if (section.id === sectionId) {
            const content = [...section.content];
            const index = content.findIndex(b => b.id === blockId);
            if (direction === 'up' && index > 0) {
              [content[index - 1], content[index]] = [content[index], content[index - 1]];
            } else if (direction === 'down' && index < content.length - 1) {
              [content[index], content[index + 1]] = [content[index + 1], content[index]];
            }
            return { ...section, content };
          }
          return section;
        });
        return { ...week, sections: updatedSections };
      }
      return week;
    });
    setCourse({ ...course, weeks: updatedWeeks });
  };

  const addQuizQuestion = (weekId, sectionId, blockId) => {
    const block = course.weeks.find(w => w.id === weekId).sections.find(s => s.id === sectionId).content.find(b => b.id === blockId);
    updateContentBlock(weekId, sectionId, blockId, { 
      questions: [...(block.questions || []), { 
        subtype: 'multiple_choice', 
        question: '', 
        options: ['', '', '', ''], 
        correctAnswer: 0, 
        explanation: '' 
      }] 
    });
  };

  const updateQuizQuestion = (weekId, sectionId, blockId, qIdx, updates) => {
    const block = course.weeks.find(w => w.id === weekId).sections.find(s => s.id === sectionId).content.find(b => b.id === blockId);
    const questions = [...block.questions];
    questions[qIdx] = { ...questions[qIdx], ...updates };
    updateContentBlock(weekId, sectionId, blockId, { questions });
  };

  const deleteQuizQuestion = (weekId, sectionId, blockId, qIdx) => {
    const block = course.weeks.find(w => w.id === weekId).sections.find(s => s.id === sectionId).content.find(b => b.id === blockId);
    const questions = block.questions.filter((_, i) => i !== qIdx);
    updateContentBlock(weekId, sectionId, blockId, { questions });
  };

  const saveCourse = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await setDoc(doc(db, 'courses', courseId), {
        ...course,
        lastModified: new Date(),
        lastModifiedBy: auth.currentUser.uid
      });
      setSuccess('Course saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error saving course: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const loadSubmissions = async () => {
    setSubmissionsMode(true);
    try {
      const q = query(collection(db, 'submissions'), where('courseId', '==', courseId));
      const querySnapshot = await getDocs(q);
      const subs = [];
      querySnapshot.forEach((doc) => {
        subs.push({ id: doc.id, ...doc.data() });
      });
      setSubmissions(subs);
    } catch (err) {
      setError('Error loading submissions: ' + err.message);
    }
  };

  const saveGrade = async (submissionId, grade) => {
    try {
      await setDoc(doc(db, 'submissions', submissionId), { grade: parseInt(grade) }, { merge: true });
      setSubmissions(prev => prev.map(sub => sub.id === submissionId ? { ...sub, grade: parseInt(grade) } : sub));
      setEditingGrade(null);
      setGradeInput('');
    } catch (err) {
      setError('Error saving grade: ' + err.message);
    }
  };

  if (loading) return <LoadingState />;
  if (!course) return <ErrorState onRetry={loadCourse} />;
  if (submissionsMode) {
    return (
      <SubmissionsView
        submissions={submissions}
        editingGrade={editingGrade}
        gradeInput={gradeInput}
        setEditingGrade={setEditingGrade}
        setGradeInput={setGradeInput}
        saveGrade={saveGrade}
        setSubmissionsMode={setSubmissionsMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <TopBar
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
        loadSubmissions={loadSubmissions}
        saveCourse={saveCourse}
        saving={saving}
      />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <p className="text-green-800 font-medium">{success}</p>
          </div>
        )}
        
        <CourseHeader
          course={course}
          setCourse={setCourse}
          previewMode={previewMode}
        />
        
        <div className="space-y-6">
          {course.weeks.map((week) => (
            <WeekItem
              key={week.id}
              week={week}
              expandedWeeks={expandedWeeks}
              expandedSections={expandedSections}
              previewMode={previewMode}
              updateWeek={updateWeek}
              deleteWeek={deleteWeek}
              moveWeek={moveWeek}
              toggleWeek={toggleWeek}
              addSection={addSection}
              updateSection={updateSection}
              deleteSection={deleteSection}
              moveSection={moveSection}
              toggleSection={toggleSection}
              addContentBlock={addContentBlock}
              updateContentBlock={updateContentBlock}
              deleteContentBlock={deleteContentBlock}
              moveContentBlock={moveContentBlock}
              addQuizQuestion={addQuizQuestion}
              updateQuizQuestion={updateQuizQuestion}
              deleteQuizQuestion={deleteQuizQuestion}
            />
          ))}
        </div>
        
        {!previewMode && (
          <button
            onClick={addWeek}
            className="w-full mt-6 py-4 bg-white border-2 border-dashed border-gray-300 rounded-2xl text-gray-700 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition font-semibold text-lg shadow-md"
          >
            + Add New Week
          </button>
        )}
      </div>
    </div>
  );
}