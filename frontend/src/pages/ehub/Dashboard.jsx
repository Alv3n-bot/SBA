import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function Dashboard() {
  const [course, setCourse] = useState({
    title: "My Course",
    weeks: []
  });

  // Add a new week
  const addWeek = () => {
    const weekId = `week_${Date.now()}`;
    const newWeek = {
      id: weekId,
      title: `Week ${course.weeks.length + 1}`,
      order: course.weeks.length + 1,
      sections: []
    };
    
    setCourse({
      ...course,
      weeks: [...course.weeks, newWeek]
    });
  };

  // Add a section to a specific week
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

  // Add content block to a specific section
  const addContentBlock = (weekId, sectionId, type) => {
    const updatedWeeks = course.weeks.map(week => {
      if (week.id === weekId) {
        const updatedSections = week.sections.map(section => {
          if (section.id === sectionId) {
            const newBlock = { type, id: `block_${Date.now()}` };
            
            // Add default content based on type
            switch(type) {
              case 'heading':
                newBlock.text = 'New Heading';
                newBlock.level = 2;
                break;
              case 'subheading':
                newBlock.text = 'New Subheading';
                newBlock.level = 3;
                break;
              case 'paragraph':
                newBlock.text = 'Enter text here...';
                break;
              case 'video':
                newBlock.url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
                newBlock.title = 'Video Title';
                break;
              case 'list':
                newBlock.items = ['Item 1', 'Item 2', 'Item 3'];
                break;
              case 'link':
                newBlock.url = 'https://example.com';
                newBlock.text = 'Link Text';
                break;
              case 'assignment':
                newBlock.description = 'Assignment description';
                newBlock.dueDate = '2024-12-31';
                break;
              case 'quiz':
                newBlock.question = 'Quiz question?';
                newBlock.options = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];
                newBlock.answer = 'Option 1';
                break;
              default:
                break;
            }
            
            return {
              ...section,
              content: [...section.content, newBlock]
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

  // Update any content block
  const updateContentBlock = (weekId, sectionId, blockId, field, value) => {
    const updatedWeeks = course.weeks.map(week => {
      if (week.id === weekId) {
        const updatedSections = week.sections.map(section => {
          if (section.id === sectionId) {
            const updatedContent = section.content.map(block => {
              if (block.id === blockId) {
                return { ...block, [field]: value };
              }
              return block;
            });
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

  // Save course to Firestore
  const saveCourse = async () => {
    try {
      // Use course title as ID or generate one
      const courseId = course.title.toLowerCase().replace(/\s+/g, '_');
      await setDoc(doc(db, 'courses', courseId), course);
      alert('Course saved successfully!');
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Error saving course');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Course Builder</h1>
      
      {/* Course Title */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Course Title:</label>
        <input
          type="text"
          value={course.title}
          onChange={(e) => setCourse({ ...course, title: e.target.value })}
          style={{ width: '300px', padding: '8px' }}
        />
      </div>
      
      {/* Add Week Button */}
      <button
        onClick={addWeek}
        style={{
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          marginBottom: '20px',
          cursor: 'pointer'
        }}
      >
        + Add Week
      </button>
      
      {/* Render Weeks */}
      {course.weeks.map((week) => (
        <div key={week.id} style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: '0', flex: 1 }}>{week.title}</h3>
            <button
              onClick={() => {
                const newTitle = prompt('Enter new week title:', week.title);
                if (newTitle) {
                  const updatedWeeks = course.weeks.map(w => 
                    w.id === week.id ? { ...w, title: newTitle } : w
                  );
                  setCourse({ ...course, weeks: updatedWeeks });
                }
              }}
              style={{ marginRight: '10px', padding: '5px 10px' }}
            >
              Rename
            </button>
            <button
              onClick={() => addSection(week.id)}
              style={{ backgroundColor: '#2196F3', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px' }}
            >
              + Add Section
            </button>
          </div>
          
          {/* Render Sections in this Week */}
          {week.sections.map((section) => (
            <div key={section.id} style={{ marginLeft: '20px', marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: '0', flex: 1 }}>{section.title}</h4>
                <button
                  onClick={() => {
                    const newTitle = prompt('Enter new section title:', section.title);
                    if (newTitle) {
                      const updatedWeeks = course.weeks.map(w => {
                        if (w.id === week.id) {
                          const updatedSections = w.sections.map(s => 
                            s.id === section.id ? { ...s, title: newTitle } : s
                          );
                          return { ...w, sections: updatedSections };
                        }
                        return w;
                      });
                      setCourse({ ...course, weeks: updatedWeeks });
                    }
                  }}
                  style={{ marginRight: '5px', padding: '3px 8px' }}
                >
                  Rename
                </button>
                
                {/* Buttons to add different content types */}
                <select
                  onChange={(e) => addContentBlock(week.id, section.id, e.target.value)}
                  defaultValue=""
                  style={{ padding: '5px', marginRight: '5px' }}
                >
                  <option value="" disabled>Add Content</option>
                  <option value="heading">Heading</option>
                  <option value="subheading">Subheading</option>
                  <option value="paragraph">Paragraph</option>
                  <option value="video">Video</option>
                  <option value="list">List</option>
                  <option value="link">Link</option>
                  <option value="assignment">Assignment</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
              
              {/* Render Content Blocks */}
              {section.content.map((block) => (
                <div key={block.id} style={{ marginBottom: '10px', padding: '10px', border: '1px dashed #ccc', backgroundColor: 'white' }}>
                  {block.type === 'heading' && (
                    <div>
                      <label>Heading Text:</label>
                      <input
                        type="text"
                        value={block.text || ''}
                        onChange={(e) => updateContentBlock(week.id, section.id, block.id, 'text', e.target.value)}
                        style={{ width: '100%', padding: '5px', marginBottom: '5px' }}
                      />
                      <label>Level (1-6):</label>
                      <select
                        value={block.level || 2}
                        onChange={(e) => updateContentBlock(week.id, section.id, block.id, 'level', parseInt(e.target.value))}
                        style={{ padding: '5px' }}
                      >
                        {[1, 2, 3, 4, 5, 6].map(level => (
                          <option key={level} value={level}>H{level}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {block.type === 'subheading' && (
                    <div>
                      <label>Subheading Text:</label>
                      <input
                        type="text"
                        value={block.text || ''}
                        onChange={(e) => updateContentBlock(week.id, section.id, block.id, 'text', e.target.value)}
                        style={{ width: '100%', padding: '5px' }}
                      />
                    </div>
                  )}
                  
                  {block.type === 'paragraph' && (
                    <div>
                      <label>Paragraph:</label>
                      <textarea
                        value={block.text || ''}
                        onChange={(e) => updateContentBlock(week.id, section.id, block.id, 'text', e.target.value)}
                        style={{ width: '100%', padding: '5px', minHeight: '100px' }}
                      />
                    </div>
                  )}
                  
                  {block.type === 'video' && (
                    <div>
                      <label>Video Title:</label>
                      <input
                        type="text"
                        value={block.title || ''}
                        onChange={(e) => updateContentBlock(week.id, section.id, block.id, 'title', e.target.value)}
                        style={{ width: '100%', padding: '5px', marginBottom: '5px' }}
                      />
                      <label>YouTube URL:</label>
                      <input
                        type="text"
                        value={block.url || ''}
                        onChange={(e) => updateContentBlock(week.id, section.id, block.id, 'url', e.target.value)}
                        style={{ width: '100%', padding: '5px' }}
                      />
                    </div>
                  )}
                  
                  {block.type === 'list' && (
                    <div>
                      <label>List Items (one per line):</label>
                      <textarea
                        value={block.items ? block.items.join('\n') : ''}
                        onChange={(e) => updateContentBlock(week.id, section.id, block.id, 'items', e.target.value.split('\n'))}
                        style={{ width: '100%', padding: '5px', minHeight: '100px' }}
                      />
                    </div>
                  )}
                  
                  {block.type === 'link' && (
                    <div>
                      <label>Link Text:</label>
                      <input
                        type="text"
                        value={block.text || ''}
                        onChange={(e) => updateContentBlock(week.id, section.id, block.id, 'text', e.target.value)}
                        style={{ width: '100%', padding: '5px', marginBottom: '5px' }}
                      />
                      <label>URL:</label>
                      <input
                        type="text"
                        value={block.url || ''}
                        onChange={(e) => updateContentBlock(week.id, section.id, block.id, 'url', e.target.value)}
                        style={{ width: '100%', padding: '5px' }}
                      />
                    </div>
                  )}
                  
                  {block.type === 'assignment' && (
                    <div>
                      <label>Assignment Description:</label>
                      <textarea
                        value={block.description || ''}
                        onChange={(e) => updateContentBlock(week.id, section.id, block.id, 'description', e.target.value)}
                        style={{ width: '100%', padding: '5px', marginBottom: '5px', minHeight: '80px' }}
                      />
                      <label>Due Date:</label>
                      <input
                        type="date"
                        value={block.dueDate || ''}
                        onChange={(e) => updateContentBlock(week.id, section.id, block.id, 'dueDate', e.target.value)}
                        style={{ padding: '5px' }}
                      />
                    </div>
                  )}
                  
                  {block.type === 'quiz' && (
                    <div>
                      <label>Question:</label>
                      <input
                        type="text"
                        value={block.question || ''}
                        onChange={(e) => updateContentBlock(week.id, section.id, block.id, 'question', e.target.value)}
                        style={{ width: '100%', padding: '5px', marginBottom: '5px' }}
                      />
                      <label>Options (one per line):</label>
                      <textarea
                        value={block.options ? block.options.join('\n') : ''}
                        onChange={(e) => updateContentBlock(week.id, section.id, block.id, 'options', e.target.value.split('\n'))}
                        style={{ width: '100%', padding: '5px', marginBottom: '5px', minHeight: '80px' }}
                      />
                      <label>Correct Answer:</label>
                      <input
                        type="text"
                        value={block.answer || ''}
                        onChange={(e) => updateContentBlock(week.id, section.id, block.id, 'answer', e.target.value)}
                        style={{ width: '100%', padding: '5px' }}
                        placeholder="Enter the exact correct option"
                      />
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      // Remove this content block
                      const updatedWeeks = course.weeks.map(w => {
                        if (w.id === week.id) {
                          const updatedSections = w.sections.map(s => {
                            if (s.id === section.id) {
                              return {
                                ...s,
                                content: s.content.filter(b => b.id !== block.id)
                              };
                            }
                            return s;
                          });
                          return { ...w, sections: updatedSections };
                        }
                        return w;
                      });
                      setCourse({ ...course, weeks: updatedWeeks });
                    }}
                    style={{ marginTop: '10px', backgroundColor: '#f44336', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
      
      {/* Save Button */}
      <button
        onClick={saveCourse}
        style={{
          backgroundColor: '#673AB7',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        💾 Save Course to Firestore
      </button>
      
      {/* Preview JSON */}
      <div style={{ marginTop: '40px' }}>
        <h3>Preview (what will be saved to Firestore):</h3>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '4px', 
          maxHeight: '300px', 
          overflow: 'auto',
          fontSize: '12px'
        }}>
          {JSON.stringify(course, null, 2)}
        </pre>
      </div>
    </div>
  );
}