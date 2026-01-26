import React from 'react';
import { ArrowUp, ArrowDown, Trash2, Edit2 } from 'react-feather';

function ContentBlock({ weekId, sectionId, block, blockIndex, totalBlocks, viewMode, onEdit, onDelete, onMove }) {
  const renderPreview = () => {
    // Logic to render the preview of the content block based on its type
    switch (block.type) {
      case 'heading':
        return <h2>{block.text}</h2>;
      case 'text':
        return <p>{block.content}</p>;
      case 'video':
        return <iframe src={block.url} title={block.title} />;
      case 'image':
        return <img src={block.url} alt={block.alt} />;
      case 'link':
        return <a href={block.url} target={block.openNewTab ? '_blank' : '_self'}>{block.text}</a>;
      case 'list':
        const ListTag = block.ordered ? 'ol' : 'ul';
        return (
          <ListTag>
            {block.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ListTag>
        );
      case 'code':
        return <pre><code>{block.code}</code></pre>;
      default:
        return null;
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

export default ContentBlock;