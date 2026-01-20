import { ChevronDown, ChevronRight, GripVertical, Trash2 } from 'lucide-react';
import ContentBlock from './ContentBlock';
import { Type, AlignLeft, Video, List, FileText, ListChecks, Image as ImageIcon, Code } from 'lucide-react';

export default function SectionItem({
  section,
  weekId,
  expandedSections,
  previewMode,
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
    <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
      {/* Section Header */}
      <div className="bg-gray-50 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={() => toggleSection(section.id)}
            className="text-gray-600 hover:bg-gray-200 p-1.5 rounded transition"
            disabled={previewMode}
          >
            {expandedSections[section.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <input
            type="text"
            value={section.title}
            onChange={(e) => updateSection(weekId, section.id, 'title', e.target.value)}
            className="flex-1 bg-transparent text-lg font-semibold text-gray-800 border-b-2 border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none"
            placeholder="Section title..."
            disabled={previewMode}
          />
        </div>
        {!previewMode && (
          <div className="flex gap-2">
            <button onClick={() => moveSection(weekId, section.id, 'up')}>
              <GripVertical className="w-4 h-4 rotate-90" />
            </button>
            <button onClick={() => moveSection(weekId, section.id, 'down')}>
              <GripVertical className="w-4 h-4 -rotate-90" />
            </button>
            <button
              onClick={() => deleteSection(weekId, section.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      {/* Section Content */}
      {expandedSections[section.id] && (
        <div className="p-4 space-y-4 bg-gray-50/50">
          {section.content.map((block) => (
            <ContentBlock
              key={block.id}
              block={block}
              weekId={weekId}
              sectionId={section.id}
              isPreview={previewMode}
              updateContentBlock={updateContentBlock}
              deleteContentBlock={deleteContentBlock}
              moveContentBlock={moveContentBlock}
              addQuizQuestion={addQuizQuestion}
              updateQuizQuestion={updateQuizQuestion}
              deleteQuizQuestion={deleteQuizQuestion}
            />
          ))}
          {!previewMode && (
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => addContentBlock(weekId, section.id, 'heading')}
                className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition text-sm font-medium"
              >
                <Type className="w-4 h-4" /> Heading
              </button>
              <button
                onClick={() => addContentBlock(weekId, section.id, 'paragraph')}
                className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition text-sm font-medium"
              >
                <AlignLeft className="w-4 h-4" /> Paragraph
              </button>
              <button
                onClick={() => addContentBlock(weekId, section.id, 'video')}
                className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition text-sm font-medium"
              >
                <Video className="w-4 h-4" /> Video
              </button>
              <button
                onClick={() => addContentBlock(weekId, section.id, 'list')}
                className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition text-sm font-medium"
              >
                <List className="w-4 h-4" /> List
              </button>
              <button
                onClick={() => addContentBlock(weekId, section.id, 'assignment')}
                className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition text-sm font-medium"
              >
                <FileText className="w-4 h-4" /> Assignment
              </button>
              <button
                onClick={() => addContentBlock(weekId, section.id, 'quiz')}
                className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition text-sm font-medium"
              >
                <ListChecks className="w-4 h-4" /> Quiz
              </button>
              <button
                onClick={() => addContentBlock(weekId, section.id, 'image')}
                className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition text-sm font-medium"
              >
                <ImageIcon className="w-4 h-4" /> Image
              </button>
              <button
                onClick={() => addContentBlock(weekId, section.id, 'code')}
                className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition text-sm font-medium"
              >
                <Code className="w-4 h-4" /> Code
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}