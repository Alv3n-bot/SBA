import { ArrowUp, ArrowDown, Edit2, Trash2, Calendar, Link as LinkIcon, Image, Video, ClipboardCheck, HelpCircle, Clock } from 'lucide-react';

export default function ContentBlock({ weekId, sectionId, block, blockIndex, totalBlocks, viewMode, onEdit, onDelete, onMove }) {
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