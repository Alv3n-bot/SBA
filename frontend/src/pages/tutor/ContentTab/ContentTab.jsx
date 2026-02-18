import { Plus } from 'lucide-react';
import WeekCard from './WeekCard';

export default function ContentTab({ 
  course, viewMode, expandedWeeks, setExpandedWeeks, 
  expandedSections, setExpandedSections, addWeek, updateWeek, 
  deleteWeek, moveWeek, duplicateWeek, addSection, updateSection, 
  deleteSection, moveSection, openContentModal, deleteContentBlock, 
  moveContentBlock 
}) {
  const updateCourseTitle = (title) => {
    updateWeek(null, { title });
  };

  const updateCourseDescription = (description) => {
    updateWeek(null, { description });
  };

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
                onChange={(e) => updateCourseTitle(e.target.value)}
                className="text-2xl font-bold w-full border-none focus:ring-0 p-0"
                placeholder="Course Title"
              />
              <textarea
                value={course.description}
                onChange={(e) => updateCourseDescription(e.target.value)}
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