import { ChevronDown, ChevronRight, ArrowUp, ArrowDown, Copy, Trash2, Plus } from 'lucide-react';
import SectionCard from './SectionCard';

export default function WeekCard({ 
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