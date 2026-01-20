import { ChevronDown, ChevronRight, GripVertical, Trash2, Plus } from 'lucide-react';
import SectionItem from './SectionItem';

export default function WeekItem({
  week,
  expandedWeeks,
  expandedSections,
  previewMode,
  updateWeek,
  deleteWeek,
  moveWeek,
  toggleWeek,
  addSection,
  updateSection,
  deleteSection,
  moveSection,
  toggleSection,
  addContentBlock,
  updateContentBlock,
  deleteContentBlock,
  moveContentBlock,
  addQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion
}) {
  return (
    <div key={week.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Week Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => toggleWeek(week.id)}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              disabled={previewMode}
            >
              {expandedWeeks[week.id] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
            <div className="flex-1">
              <input
                type="text"
                value={week.title}
                onChange={(e) => updateWeek(week.id, 'title', e.target.value)}
                className="w-full bg-transparent text-white text-xl font-bold placeholder-white/70 border-b-2 border-transparent hover:border-white/50 focus:border-white focus:outline-none py-1"
                placeholder="Week title..."
                disabled={previewMode}
              />
              <input
                type="text"
                value={week.description || ''}
                onChange={(e) => updateWeek(week.id, 'description', e.target.value)}
                className="w-full bg-transparent text-white/90 text-sm placeholder-white/50 border-b border-transparent hover:border-white/30 focus:border-white/50 focus:outline-none py-1 mt-1"
                placeholder="Week description..."
                disabled={previewMode}
              />
            </div>
          </div>
          {!previewMode && (
            <div className="flex gap-2">
              <button onClick={() => moveWeek(week.id, 'up')}>
                <GripVertical className="w-5 h-5 text-white rotate-90" />
              </button>
              <button onClick={() => moveWeek(week.id, 'down')}>
                <GripVertical className="w-5 h-5 text-white -rotate-90" />
              </button>
              <button
                onClick={() => deleteWeek(week.id)}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Week Content */}
      {expandedWeeks[week.id] && (
        <div className="p-6 space-y-4">
          {week.sections.map((section) => (
            <SectionItem
              key={section.id}
              section={section}
              weekId={week.id}
              expandedSections={expandedSections}
              previewMode={previewMode}
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
          {!previewMode && (
            <button
              onClick={() => addSection(week.id)}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition font-medium"
            >
              + Add Section
            </button>
          )}
        </div>
      )}
    </div>
  );
}