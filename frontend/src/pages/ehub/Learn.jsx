import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function Learn() {
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [expandedWeeks, setExpandedWeeks] = useState({});

  // Toggle week expansion
  const toggleWeek = (weekId) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekId]: !prev[weekId]
    }));
  };

  // Fetch course from Firestore
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        console.log('Fetching course...');
        // Try different course IDs - adjust based on what you saved in CourseBuilder
        const courseIds = ['my_course', 'course1', 'test_course', 'my_first_course'];
        let courseData = null;
        let foundCourseId = null;

        // Try multiple possible course IDs
        for (const courseId of courseIds) {
          try {
            const docRef = doc(db, 'courses', courseId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              courseData = docSnap.data();
              foundCourseId = courseId;
              console.log(`Found course with ID: ${courseId}`, courseData);
              break;
            }
          } catch (err) {
            console.log(`Course ${courseId} not found`);
          }
        }

        if (courseData) {
          setCourse(courseData);
          // Auto-expand first week if exists
          if (courseData.weeks && courseData.weeks.length > 0) {
            setExpandedWeeks({ [courseData.weeks[0].id]: true });
            // Auto-select first section of first week
            if (courseData.weeks[0].sections && courseData.weeks[0].sections.length > 0) {
              setSelectedSection(courseData.weeks[0].sections[0]);
            }
          }
        } else {
          setError('No course found. Please create a course first using the Course Builder.');
          console.log('Available collections in Firestore:', 'Check your Firestore console');
        }
      } catch (err) {
        console.error('Error loading course:', err);
        setError(`Failed to load course: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, []);

  // Render content block based on type
  const renderContentBlock = (block, index) => {
    if (!block || !block.type) return null;

    switch(block.type) {
      case 'heading':
        const HeadingTag = `h${block.level || 2}`;
        return (
          <HeadingTag
            key={block.id || index}
            style={{ margin: '20px 0 10px 0', color: '#333' }}
          >
            {block.text || 'Heading text'}
          </HeadingTag>
        );
      case 'subheading':
        const SubheadingTag = `h${block.level || 3}`;
        return (
          <SubheadingTag
            key={block.id || index}
            style={{ margin: '15px 0 8px 0', color: '#555' }}
          >
            {block.text || 'Subheading text'}
          </SubheadingTag>
        );
      case 'paragraph':
        return (
          <p
            key={block.id || index}
            style={{ margin: '10px 0', lineHeight: '1.6', color: '#444' }}
          >
            {block.text || 'Paragraph text'}
          </p>
        );
      case 'video':
        if (!block.url) {
          return (
            <div key={block.id || index} style={{ margin: '20px 0', color: '#666' }}>
              Video URL not provided
            </div>
          );
        }
        // Extract YouTube video ID
        let videoId = '';
        try {
          const url = block.url;
          if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1]?.split('&')[0] || '';
          } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
          }
        } catch (err) {
          console.error('Error parsing video URL:', err);
        }
        if (!videoId) {
          return (
            <div key={block.id || index} style={{ margin: '20px 0' }}>
              <h4>{block.title || 'Video'}</h4>
              <p>Invalid YouTube URL: {block.url}</p>
            </div>
          );
        }
        return (
          <div key={block.id || index} style={{ margin: '20px 0' }}>
            {block.title && <h4>{block.title}</h4>}
            <div style={{
              position: 'relative',
              paddingBottom: '56.25%', // 16:9 aspect ratio
              height: 0,
              overflow: 'hidden',
              borderRadius: '8px',
              backgroundColor: '#000'
            }}>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 0
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={block.title || 'YouTube video'}
              />
            </div>
          </div>
        );
      case 'list':
        if (!block.items || !Array.isArray(block.items)) {
          return (
            <div key={block.id || index} style={{ color: '#666' }}>
              No list items available
            </div>
          );
        }
        return (
          <ul
            key={block.id || index}
            style={{ margin: '10px 0 10px 20px' }}
          >
            {block.items.map((item, idx) => (
              <li key={idx} style={{ margin: '5px 0', color: '#444' }}>
                {item}
              </li>
            ))}
          </ul>
        );
      case 'link':
        if (!block.url) return null;
        return (
          <div key={block.id || index} style={{ margin: '10px 0' }}>
            <a
              href={block.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#2196F3',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>🔗</span>
              <span>{block.text || block.url}</span>
            </a>
          </div>
        );
      case 'assignment':
        return (
          <div
            key={block.id || index}
            style={{
              margin: '20px 0',
              padding: '15px',
              backgroundColor: '#e3f2fd',
              borderLeft: '4px solid #2196F3',
              borderRadius: '4px'
            }}
          >
            <h4>📝 Assignment</h4>
            <p style={{ margin: '10px 0' }}>{block.description || 'Assignment description not provided'}</p>
            {block.dueDate && (
              <p style={{ margin: '5px 0' }}>
                <strong>Due Date:</strong> {new Date(block.dueDate).toLocaleDateString()}
              </p>
            )}
            <input
              type="file"
              style={{
                margin: '10px 0',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                width: '100%',
                backgroundColor: 'white'
              }}
            />
            <button
              style={{
                backgroundColor: '#2196F3',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Submit Assignment
            </button>
          </div>
        );
      case 'quiz':
        const QuizComponent = ({ question, options, answer, quizIndex }) => {
          const [selectedAnswer, setSelectedAnswer] = useState(null);
          const [submitted, setSubmitted] = useState(false);

          const handleSubmit = () => {
            setSubmitted(true);
            if (selectedAnswer === answer) {
              alert('✅ Correct!');
            } else {
              alert('❌ Incorrect. Try again!');
            }
          };

          const handleReset = () => {
            setSelectedAnswer(null);
            setSubmitted(false);
          };

          return (
            <div style={{
              margin: '20px 0',
              padding: '15px',
              backgroundColor: '#f3e5f5',
              borderLeft: '4px solid #9C27B0',
              borderRadius: '4px'
            }}>
              <h4>❓ Quiz Question</h4>
              <p><strong>{question || 'Quiz question not provided'}</strong></p>
              {options && Array.isArray(options) ? (
                options.map((option, idx) => (
                  <div key={idx} style={{ margin: '8px 0' }}>
                    <input
                      type="radio"
                      id={`option_${quizIndex}_${idx}`}
                      name={`quiz_${quizIndex}`}
                      value={option}
                      checked={selectedAnswer === option}
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                      disabled={submitted}
                      style={{ cursor: 'pointer' }}
                    />
                    <label
                      htmlFor={`option_${quizIndex}_${idx}`}
                      style={{ marginLeft: '8px', cursor: 'pointer' }}
                    >
                      {option}
                      {submitted && option === answer && (
                        <span style={{ color: 'green', marginLeft: '10px' }}>✓ Correct</span>
                      )}
                      {submitted && option !== answer && selectedAnswer === option && (
                        <span style={{ color: 'red', marginLeft: '10px' }}>✗ Incorrect</span>
                      )}
                    </label>
                  </div>
                ))
              ) : (
                <p style={{ color: '#666' }}>No options provided</p>
              )}
              {!submitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={!selectedAnswer}
                  style={{
                    backgroundColor: '#9C27B0',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: selectedAnswer ? 'pointer' : 'not-allowed',
                    marginTop: '10px',
                    opacity: selectedAnswer ? 1 : 0.5
                  }}
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  style={{
                    backgroundColor: '#757575',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '10px'
                  }}
                >
                  Try Again
                </button>
              )}
            </div>
          );
        };
        return (
          <QuizComponent
            key={block.id || index}
            question={block.question}
            options={block.options}
            answer={block.answer}
            quizIndex={index}
          />
        );
      default:
        console.warn('Unknown content block type:', block.type);
        return (
          <div
            key={block.id || index}
            style={{
              margin: '10px 0',
              padding: '10px',
              backgroundColor: '#ffebee',
              border: '1px solid #f44336',
              borderRadius: '4px'
            }}
          >
            <p style={{ color: '#c62828' }}>
              Unknown content type: {block.type}
            </p>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {JSON.stringify(block, null, 2)}
            </pre>
          </div>
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ fontSize: '48px' }}>📚</div>
        <div style={{ textAlign: 'center' }}>
          <h3>Loading course...</h3>
          <p>Please wait while we fetch your course content.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
        <h2>Unable to Load Course</h2>
        <p style={{ color: '#666', margin: '20px 0' }}>{error}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#2196F3',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
          <button
            onClick={() => navigate('/builder')}
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Go to Course Builder
          </button>
        </div>
        {/* Debug info */}
        <div style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          textAlign: 'left'
        }}>
          <h4>Debug Information:</h4>
          <p>Make sure:</p>
          <ol style={{ textAlign: 'left', marginLeft: '20px' }}>
            <li>You have created a course using the Course Builder</li>
            <li>The course is saved to Firestore in the 'courses' collection</li>
            <li>Your Firebase configuration is correct</li>
            <li>You have proper Firestore read permissions</li>
          </ol>
        </div>
      </div>
    );
  }

  // No course found
  if (!course) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>📚</div>
        <h2>No Course Found</h2>
        <p style={{ color: '#666', margin: '20px 0' }}>
          It looks like no course has been created yet.
        </p>
        <button
          onClick={() => navigate('/builder')}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Create Your First Course
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8f9fa'
    }}>
      {/* Left Sidebar */}
      <div style={{
        width: '320px',
        backgroundColor: 'white',
        borderRight: '1px solid #dee2e6',
        overflowY: 'auto',
        padding: '20px',
        boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        <h2 style={{
          margin: '0 0 20px 0',
          color: '#333',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>📚</span>
          <span>{course.title || 'Untitled Course'}</span>
        </h2>
        {(!course.weeks || course.weeks.length === 0) ? (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px dashed #dee2e6'
          }}>
            <p style={{ color: '#6c757d' }}>No weeks available</p>
            <p style={{ fontSize: '14px', color: '#adb5bd' }}>
              Add weeks in the Course Builder
            </p>
          </div>
        ) : (
          <div>
            {course.weeks
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((week) => (
                <div key={week.id} style={{ marginBottom: '12px' }}>
                  {/* Week Header */}
                  <div
                    onClick={() => toggleWeek(week.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 15px',
                      backgroundColor: expandedWeeks[week.id] ? '#e9ecef' : 'white',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      userSelect: 'none',
                      border: '1px solid #dee2e6',
                      transition: 'all 0.2s',
                      fontWeight: '500'
                    }}
                  >
                    <span style={{
                      marginRight: '10px',
                      color: expandedWeeks[week.id] ? '#495057' : '#6c757d'
                    }}>
                      {expandedWeeks[week.id] ? '▼' : '▶'}
                    </span>
                    <span>{week.title || `Week ${week.order || 'Unknown'}`}</span>
                  </div>
                  {/* Week Sections */}
                  {expandedWeeks[week.id] && week.sections && week.sections.length > 0 && (
                    <div style={{
                      marginLeft: '15px',
                      marginTop: '8px',
                      paddingLeft: '15px',
                      borderLeft: '2px solid #e9ecef'
                    }}>
                      {week.sections
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((section) => (
                          <div
                            key={section.id}
                            onClick={() => setSelectedSection(section)}
                            style={{
                              padding: '10px 12px',
                              marginBottom: '6px',
                              backgroundColor: selectedSection?.id === section.id ? '#007bff' : 'transparent',
                              color: selectedSection?.id === section.id ? 'white' : '#495057',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}
                          >
                            <span style={{
                              opacity: selectedSection?.id === section.id ? 1 : 0.7
                            }}>
                              📖
                            </span>
                            <span>{section.title || `Section ${section.order || 'Unknown'}`}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
      {/* Main Content Area */}
      <div style={{
        flex: 1,
        padding: '30px',
        overflowY: 'auto',
        backgroundColor: 'white',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {selectedSection ? (
          <>
            <h1 style={{
              marginBottom: '10px',
              color: '#333',
              borderBottom: '2px solid #007bff',
              paddingBottom: '10px'
            }}>
              {selectedSection.title || 'Untitled Section'}
            </h1>
            {(!selectedSection.content || selectedSection.content.length === 0) ? (
              <div style={{
                padding: '60px 40px',
                textAlign: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                border: '3px dashed #dee2e6',
                marginTop: '40px'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.5 }}>📄</div>
                <h3 style={{ color: '#6c757d', marginBottom: '10px' }}>No Content Yet</h3>
                <p style={{ color: '#adb5bd', maxWidth: '400px', margin: '0 auto' }}>
                  This section doesn't have any content yet.
                  Add content using the Course Builder.
                </p>
              </div>
            ) : (
              <div style={{ marginTop: '20px' }}>
                {selectedSection.content.map((block, index) => (
                  <div key={block.id || index}>
                    {renderContentBlock(block, index)}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            textAlign: 'center',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ fontSize: '96px', opacity: 0.3 }}>👈</div>
            <div>
              <h2 style={{ color: '#6c757d', marginBottom: '10px' }}>Select a Section</h2>
              <p style={{ color: '#adb5bd', maxWidth: '400px' }}>
                Choose a section from the sidebar to view its content
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}