import React, { useState, useEffect } from 'react';
import { 
  Save, Plus, Trash2, Edit2, Eye, Download, Upload, 
  BookOpen, Video, Type, Link, Code, Calendar,
  ChevronUp, ChevronDown, Copy, ArrowLeft
} from 'lucide-react';

const TeacherDashboard = () => {
  // Default course template
  const defaultCourse = {
    course: {
      title: "Introduction to Web Development",
      description: "Learn HTML, CSS, and JavaScript fundamentals",
      duration: "3 weeks",
      instructor: "Web Dev Instructor",
      category: "Web Development"
    },
    weeks: []
  };

  const [courseContent, setCourseContent] = useState(defaultCourse);
  const [activeWeekIndex, setActiveWeekIndex] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  // Initialize with saved content
  useEffect(() => {
    const savedContent = localStorage.getItem('teacherCourseContent');
    if (savedContent) {
      setCourseContent(JSON.parse(savedContent));
    }
  }, []);

  // Save to localStorage whenever content changes
  useEffect(() => {
    localStorage.setItem('teacherCourseContent', JSON.stringify(courseContent));
  }, [courseContent]);

  // Save to file
  const saveToFile = () => {
    const dataStr = JSON.stringify(courseContent, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'course-content.json';
    link.click();
  };

  // Load from file
  const loadFromFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = JSON.parse(event.target.result);
        setCourseContent(content);
      } catch (error) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  // Update course info
  const updateCourseInfo = (field, value) => {
    setCourseContent(prev => ({
      ...prev,
      course: {
        ...prev.course,
        [field]: value
      }
    }));
  };

  // Add a new week
  const addWeek = () => {
    const newWeek = {
      weekNumber: courseContent.weeks.length + 1,
      title: `Week ${courseContent.weeks.length + 1}`,
      description: "New week description",
      modules: [],
      assignment: {
        title: "New Assignment",
        description: "Assignment description",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    };
    
    setCourseContent(prev => ({
      ...prev,
      weeks: [...prev.weeks, newWeek]
    }));
    setActiveWeekIndex(courseContent.weeks.length);
  };

  // Update week
  const updateWeek = (index, field, value) => {
    setCourseContent(prev => {
      const newWeeks = [...prev.weeks];
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        newWeeks[index] = {
          ...newWeeks[index],
          [parent]: {
            ...newWeeks[index][parent],
            [child]: value
          }
        };
      } else {
        newWeeks[index] = {
          ...newWeeks[index],
          [field]: value
        };
      }
      return { ...prev, weeks: newWeeks };
    });
  };

  // Delete week
  const deleteWeek = (index) => {
    setCourseContent(prev => ({
      ...prev,
      weeks: prev.weeks.filter((_, i) => i !== index)
    }));
    if (activeWeekIndex === index) setActiveWeekIndex(null);
  };

  // Add module to week
  const addModule = (weekIndex) => {
    const newModule = {
      id: Date.now(),
      title: "New Module",
      content: "Module content goes here...",
      videoLinks: [],
      resources: []
    };
    
    updateWeek(weekIndex, 'modules', [
      ...courseContent.weeks[weekIndex].modules,
      newModule
    ]);
    setEditingModule(newModule.id);
  };

  // Update module
  const updateModule = (weekIndex, moduleIndex, field, value) => {
    setCourseContent(prev => {
      const newWeeks = [...prev.weeks];
      const newModules = [...newWeeks[weekIndex].modules];
      newModules[moduleIndex] = {
        ...newModules[moduleIndex],
        [field]: value
      };
      newWeeks[weekIndex].modules = newModules;
      return { ...prev, weeks: newWeeks };
    });
  };

  // Delete module
  const deleteModule = (weekIndex, moduleIndex) => {
    setCourseContent(prev => {
      const newWeeks = [...prev.weeks];
      newWeeks[weekIndex].modules = newWeeks[weekIndex].modules.filter((_, i) => i !== moduleIndex);
      return { ...prev, weeks: newWeeks };
    });
    setEditingModule(null);
  };

  // Add video link to module
  const addVideoLink = (weekIndex, moduleIndex) => {
    const newVideo = {
      id: `vid-${Date.now()}`,
      title: "New Video",
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      type: "youtube"
    };
    
    setCourseContent(prev => {
      const newWeeks = [...prev.weeks];
      const module = newWeeks[weekIndex].modules[moduleIndex];
      module.videoLinks = [...module.videoLinks, newVideo];
      return { ...prev, weeks: newWeeks };
    });
  };

  // Update video link
  const updateVideoLink = (weekIndex, moduleIndex, videoIndex, field, value) => {
    setCourseContent(prev => {
      const newWeeks = [...prev.weeks];
      const module = newWeeks[weekIndex].modules[moduleIndex];
      const newVideos = [...module.videoLinks];
      newVideos[videoIndex] = { ...newVideos[videoIndex], [field]: value };
      module.videoLinks = newVideos;
      return { ...prev, weeks: newWeeks };
    });
  };

  // Delete video link
  const deleteVideoLink = (weekIndex, moduleIndex, videoIndex) => {
    setCourseContent(prev => {
      const newWeeks = [...prev.weeks];
      const module = newWeeks[weekIndex].modules[moduleIndex];
      module.videoLinks = module.videoLinks.filter((_, i) => i !== videoIndex);
      return { ...prev, weeks: newWeeks };
    });
  };

  // Add resource to module
  const addResource = (weekIndex, moduleIndex, type) => {
    let newResource;
    
    switch(type) {
      case 'text':
        newResource = {
          type: 'text',
          content: 'New text resource...'
        };
        break;
      case 'code':
        newResource = {
          type: 'code',
          content: '// Code example\nconsole.log("Hello");',
          language: 'javascript'
        };
        break;
      case 'link':
        newResource = {
          type: 'link',
          content: 'Resource Link',
          url: 'https://example.com'
        };
        break;
      default:
        return;
    }
    
    setCourseContent(prev => {
      const newWeeks = [...prev.weeks];
      const module = newWeeks[weekIndex].modules[moduleIndex];
      module.resources = [...module.resources, newResource];
      return { ...prev, weeks: newWeeks };
    });
  };

  // Update resource
  const updateResource = (weekIndex, moduleIndex, resourceIndex, field, value) => {
    setCourseContent(prev => {
      const newWeeks = [...prev.weeks];
      const module = newWeeks[weekIndex].modules[moduleIndex];
      const newResources = [...module.resources];
      newResources[resourceIndex] = { 
        ...newResources[resourceIndex], 
        [field]: value 
      };
      module.resources = newResources;
      return { ...prev, weeks: newWeeks };
    });
  };

  // Delete resource
  const deleteResource = (weekIndex, moduleIndex, resourceIndex) => {
    setCourseContent(prev => {
      const newWeeks = [...prev.weeks];
      const module = newWeeks[weekIndex].modules[moduleIndex];
      module.resources = module.resources.filter((_, i) => i !== resourceIndex);
      return { ...prev, weeks: newWeeks };
    });
  };

  // Export JSON string
  const exportJSON = () => {
    const jsonString = JSON.stringify(courseContent, null, 2);
    setJsonInput(jsonString);
  };

  // Import from JSON string
  const importJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setCourseContent(parsed);
      setJsonInput('');
    } catch (error) {
      alert('Invalid JSON format');
    }
  };

  // Copy JSON to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(courseContent, null, 2));
    alert('JSON copied to clipboard!');
  };

  // Reset to default
  const resetCourse = () => {
    if (window.confirm('Reset course to default? All changes will be lost.')) {
      setCourseContent(defaultCourse);
      setActiveWeekIndex(null);
      setEditingModule(null);
    }
  };

  // Get module by ID
  const getModuleById = (weekIndex, moduleId) => {
    const week = courseContent.weeks[weekIndex];
    return week.modules.find(m => m.id === moduleId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
              <p className="text-purple-100 mt-2">Create and manage your course content</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                {previewMode ? <Edit2 size={20} /> : <Eye size={20} />}
                {previewMode ? 'Edit Mode' : 'Preview Mode'}
              </button>
              <button
                onClick={saveToFile}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition-colors"
              >
                <Download size={20} />
                Export JSON
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!previewMode ? (
          /* EDIT MODE */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Course Info & Weeks List */}
            <div className="lg:col-span-1 space-y-6">
              {/* Course Information Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BookOpen size={20} />
                  Course Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course Title
                    </label>
                    <input
                      type="text"
                      value={courseContent.course.title}
                      onChange={(e) => updateCourseInfo('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={courseContent.course.description}
                      onChange={(e) => updateCourseInfo('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={courseContent.course.duration}
                        onChange={(e) => updateCourseInfo('duration', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instructor
                      </label>
                      <input
                        type="text"
                        value={courseContent.course.instructor}
                        onChange={(e) => updateCourseInfo('instructor', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Weeks Management */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Course Weeks</h2>
                  <button
                    onClick={addWeek}
                    className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600"
                  >
                    <Plus size={18} />
                    Add Week
                  </button>
                </div>
                <div className="space-y-3">
                  {courseContent.weeks.map((week, index) => (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        activeWeekIndex === index
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setActiveWeekIndex(index)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">Week {week.weekNumber}</h3>
                          <p className="text-sm text-gray-600 truncate">{week.title}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteWeek(index);
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                          <ChevronDown size={16} className="text-gray-400" />
                        </div>
                      </div>
                      {activeWeekIndex === index && (
                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                          <input
                            type="text"
                            value={week.title}
                            onChange={(e) => updateWeek(index, 'title', e.target.value)}
                            className="w-full px-2 py-1 text-sm border rounded"
                            placeholder="Week title"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <textarea
                            value={week.description}
                            onChange={(e) => updateWeek(index, 'description', e.target.value)}
                            className="w-full px-2 py-1 text-sm border rounded"
                            placeholder="Week description"
                            rows="2"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div>
                            <label className="text-xs text-gray-500">Assignment Due Date</label>
                            <input
                              type="date"
                              value={week.assignment.dueDate}
                              onChange={(e) => updateWeek(index, 'assignment.dueDate', e.target.value)}
                              className="w-full px-2 py-1 text-sm border rounded"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* JSON Import/Export */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">JSON Data</h2>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <label className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Upload size={18} />
                        <span className="font-medium">Import JSON</span>
                      </div>
                      <input
                        type="file"
                        accept=".json"
                        onChange={loadFromFile}
                        className="w-full text-sm"
                      />
                    </label>
                    <button
                      onClick={exportJSON}
                      className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg"
                    >
                      <Copy size={18} />
                      Show JSON
                    </button>
                  </div>
                  <button
                    onClick={resetCourse}
                    className="w-full bg-red-50 text-red-600 hover:bg-red-100 px-4 py-3 rounded-lg font-medium"
                  >
                    Reset Course
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content - Week/Module Editor */}
            <div className="lg:col-span-2">
              {activeWeekIndex !== null ? (
                <div className="space-y-6">
                  {/* Week Header */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">
                        Week {courseContent.weeks[activeWeekIndex].weekNumber} Editor
                      </h2>
                      <div className="flex gap-2">
                        <button
                          onClick={() => addModule(activeWeekIndex)}
                          className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
                        >
                          <Plus size={18} />
                          Add Module
                        </button>
                      </div>
                    </div>

                    {/* Modules List */}
                    <div className="space-y-4">
                      {courseContent.weeks[activeWeekIndex].modules.map((module, moduleIndex) => (
                        <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-100 text-blue-800 rounded-lg p-2">
                                <BookOpen size={18} />
                              </div>
                              <div>
                                <h3 className="font-bold">{module.title}</h3>
                                <p className="text-sm text-gray-600">{module.content.substring(0, 50)}...</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingModule(editingModule === module.id ? null : module.id)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                              >
                                <Edit2 size={16} />
                                {editingModule === module.id ? 'Collapse' : 'Edit'}
                              </button>
                              <button
                                onClick={() => deleteModule(activeWeekIndex, moduleIndex)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          {editingModule === module.id && (
                            <div className="p-6 space-y-6">
                              {/* Module Details */}
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Module Title
                                  </label>
                                  <input
                                    type="text"
                                    value={module.title}
                                    onChange={(e) => updateModule(activeWeekIndex, moduleIndex, 'title', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Content Description
                                  </label>
                                  <textarea
                                    value={module.content}
                                    onChange={(e) => updateModule(activeWeekIndex, moduleIndex, 'content', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32"
                                  />
                                </div>
                              </div>

                              {/* Video Links */}
                              <div>
                                <div className="flex justify-between items-center mb-4">
                                  <h4 className="font-semibold text-lg flex items-center gap-2">
                                    <Video size={20} className="text-red-500" />
                                    Video Lessons
                                  </h4>
                                  <button
                                    onClick={() => addVideoLink(activeWeekIndex, moduleIndex)}
                                    className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                                  >
                                    <Plus size={16} />
                                    Add Video
                                  </button>
                                </div>
                                <div className="space-y-3">
                                  {module.videoLinks.map((video, videoIndex) => (
                                    <div key={video.id} className="border border-gray-200 rounded-lg p-4">
                                      <div className="flex justify-between items-start mb-3">
                                        <input
                                          type="text"
                                          value={video.title}
                                          onChange={(e) => updateVideoLink(activeWeekIndex, moduleIndex, videoIndex, 'title', e.target.value)}
                                          className="font-medium px-2 py-1 border rounded flex-1 mr-2"
                                          placeholder="Video title"
                                        />
                                        <button
                                          onClick={() => deleteVideoLink(activeWeekIndex, moduleIndex, videoIndex)}
                                          className="text-red-500 hover:text-red-700 p-1"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                      <input
                                        type="text"
                                        value={video.url}
                                        onChange={(e) => updateVideoLink(activeWeekIndex, moduleIndex, videoIndex, 'url', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        placeholder="YouTube embed URL"
                                      />
                                      <div className="mt-2 text-xs text-gray-500">
                                        Format: https://www.youtube.com/embed/VIDEO_ID
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Resources */}
                              <div>
                                <div className="flex justify-between items-center mb-4">
                                  <h4 className="font-semibold text-lg flex items-center gap-2">
                                    <Type size={20} className="text-green-500" />
                                    Learning Resources
                                  </h4>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => addResource(activeWeekIndex, moduleIndex, 'text')}
                                      className="flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
                                    >
                                      <Type size={16} />
                                      Add Text
                                    </button>
                                    <button
                                      onClick={() => addResource(activeWeekIndex, moduleIndex, 'code')}
                                      className="flex items-center gap-2 bg-gray-700 text-white px-3 py-1 rounded-lg hover:bg-gray-800"
                                    >
                                      <Code size={16} />
                                      Add Code
                                    </button>
                                    <button
                                      onClick={() => addResource(activeWeekIndex, moduleIndex, 'link')}
                                      className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
                                    >
                                      <Link size={16} />
                                      Add Link
                                    </button>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  {module.resources.map((resource, resourceIndex) => (
                                    <div key={resourceIndex} className="border border-gray-200 rounded-lg p-4">
                                      <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                          {resource.type === 'text' && <Type size={16} className="text-green-500" />}
                                          {resource.type === 'code' && <Code size={16} className="text-gray-500" />}
                                          {resource.type === 'link' && <Link size={16} className="text-blue-500" />}
                                          <span className="font-medium capitalize">{resource.type}</span>
                                        </div>
                                        <button
                                          onClick={() => deleteResource(activeWeekIndex, moduleIndex, resourceIndex)}
                                          className="text-red-500 hover:text-red-700 p-1"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                      {resource.type === 'text' && (
                                        <textarea
                                          value={resource.content}
                                          onChange={(e) => updateResource(activeWeekIndex, moduleIndex, resourceIndex, 'content', e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24"
                                        />
                                      )}
                                      {resource.type === 'code' && (
                                        <>
                                          <textarea
                                            value={resource.content}
                                            onChange={(e) => updateResource(activeWeekIndex, moduleIndex, resourceIndex, 'content', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32 font-mono text-sm"
                                          />
                                          <input
                                            type="text"
                                            value={resource.language || ''}
                                            onChange={(e) => updateResource(activeWeekIndex, moduleIndex, resourceIndex, 'language', e.target.value)}
                                            className="w-full mt-2 px-3 py-1 border border-gray-300 rounded-lg text-sm"
                                            placeholder="Language (e.g., javascript, html, css)"
                                          />
                                        </>
                                      )}
                                      {resource.type === 'link' && (
                                        <>
                                          <input
                                            type="text"
                                            value={resource.content}
                                            onChange={(e) => updateResource(activeWeekIndex, moduleIndex, resourceIndex, 'content', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                                            placeholder="Link text"
                                          />
                                          <input
                                            type="text"
                                            value={resource.url}
                                            onChange={(e) => updateResource(activeWeekIndex, moduleIndex, resourceIndex, 'url', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="https://example.com"
                                          />
                                        </>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <BookOpen size={64} className="mx-auto text-gray-300 mb-6" />
                  <h3 className="text-2xl font-bold text-gray-700 mb-4">No Week Selected</h3>
                  <p className="text-gray-500 mb-8">Select a week from the sidebar to start editing, or create a new week.</p>
                  <button
                    onClick={addWeek}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    Create Your First Week
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* PREVIEW MODE - Shows what students will see */
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold">Student Preview</h2>
                  <p className="text-blue-100">This is how students will see the course</p>
                </div>
                <button
                  onClick={() => setPreviewMode(false)}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg"
                >
                  <ArrowLeft size={20} />
                  Back to Edit
                </button>
              </div>
            </div>
            
            <div className="p-8">
              <h1 className="text-4xl font-bold mb-2">{courseContent.course.title}</h1>
              <p className="text-gray-600 text-lg mb-6">{courseContent.course.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courseContent.weeks.map((week, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="bg-blue-100 text-blue-800 inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4">
                      Week {week.weekNumber}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{week.title}</h3>
                    <p className="text-gray-600 mb-4">{week.description}</p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Modules ({week.modules.length})</h4>
                        <ul className="space-y-2">
                          {week.modules.map((module, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>{module.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                          <Calendar size={14} />
                          <span>Assignment Due:</span>
                        </div>
                        <div className="font-medium">{week.assignment.title}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {courseContent.weeks.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No weeks created yet. Add weeks in edit mode.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* JSON Editor Modal */}
        {jsonInput && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold">JSON Data</h2>
                <div className="flex gap-2">
                  <button
                    onClick={importJSON}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Import This JSON
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Copy to Clipboard
                  </button>
                  <button
                    onClick={() => setJsonInput('')}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full h-full p-6 font-mono text-sm bg-gray-50"
                  rows={30}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;