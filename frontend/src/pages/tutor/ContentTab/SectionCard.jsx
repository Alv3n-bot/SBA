import { ChevronDown, ChevronRight, ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';
import { FileText, Video, Image, Link as LinkIcon, List, Code, ClipboardCheck, HelpCircle } from 'lucide-react';
import ContentBlock from './ContentBlock';

export default function SectionCard({ 
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