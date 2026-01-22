import { Lock, Link as LinkIcon } from 'lucide-react';
import VideoBlock from './VideoBlock';
import AssignmentBlock from './AssignmentBlock';
import QuizBlock from './QuizBlock';

export default function ContentRenderer({
  block,
  weekId,
  sectionId,
  hasActiveSubscription,
  submissions,
  uploadingFile,
  quizResults,
  courseId,
  onTextSubmit,
  onFileUpload,
  onUrlSubmit,
  onQuizComplete
}) {
  const renderBlock = () => {
    switch (block.type) {
      case 'heading':
        const HeadingTag = `h${block.level || 2}`;
        return (
          <HeadingTag className={`font-bold text-gray-900 mb-3 ${
            block.level === 1 ? 'text-2xl' :
            block.level === 2 ? 'text-xl' :
            block.level === 3 ? 'text-lg' :
            'text-base'
          }`}>
            {block.text}
          </HeadingTag>
        );
      
      case 'text':
        return (
          <div className="prose max-w-none mb-4">
            <p className="text-gray-700 leading-relaxed text-base">{block.content}</p>
          </div>
        );
      
      case 'video':
        return <VideoBlock block={block} />;
      
      case 'image':
        return (
          <div className="mb-4 max-w-md mx-auto">
            <img
              src={block.url}
              alt={block.alt || ''}
              className="max-w-full rounded-md shadow-sm"
            />
            {block.caption && (
              <p className="text-center text-gray-600 mt-1 text-sm italic">{block.caption}</p>
            )}
          </div>
        );
      
      case 'list':
        const ListTag = block.ordered ? 'ol' : 'ul';
        return (
          <ListTag className={`mb-4 ml-4 space-y-1 ${block.ordered ? 'list-decimal' : 'list-disc'}`}>
            {(block.items || []).map((item, idx) => (
              <li key={idx} className="text-gray-700 leading-relaxed text-base">{item}</li>
            ))}
          </ListTag>
        );
      
      case 'link':
        return (
          <a
            href={block.url}
            target={block.openNewTab ? '_blank' : '_self'}
            rel={block.openNewTab ? 'noopener noreferrer' : ''}
            className="inline-flex items-center gap-2 text-gray-800 hover:text-gray-600 font-medium mb-3 hover:underline"
          >
            <LinkIcon className="w-4 h-4" />
            {block.text}
          </a>
        );
      
      case 'code':
        return (
          <div className="mb-4">
            <div className="bg-gray-100 text-gray-900 p-3 rounded-md overflow-x-auto">
              <div className="text-xs text-gray-500 mb-1">{block.language}</div>
              <pre className="font-mono text-sm">
                <code>{block.code}</code>
              </pre>
            </div>
          </div>
        );
      
      case 'assignment':
        return (
          <AssignmentBlock
            block={block}
            weekId={weekId}
            sectionId={sectionId}
            submissions={submissions}
            uploadingFile={uploadingFile}
            onTextSubmit={onTextSubmit}
            onFileUpload={onFileUpload}
            onUrlSubmit={onUrlSubmit}
          />
        );
      
      case 'quiz':
        return (
          <QuizBlock
            block={block}
            weekId={weekId}
            sectionId={sectionId}
            quizResults={quizResults}
            courseId={courseId}
            onQuizComplete={onQuizComplete}
          />
        );
      
      default:
        return null;
    }
  };

  if (!hasActiveSubscription) {
    return (
      <div className="relative mb-4">
        <div className="blur-sm pointer-events-none opacity-30">
          {renderBlock()}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 shadow-md border border-gray-300">
            <Lock className="w-6 h-6 text-gray-800 mx-auto mb-2" />
            <p className="text-gray-800 font-medium text-sm">Subscribe to unlock</p>
          </div>
        </div>
      </div>
    );
  }

  return <div key={block.id}>{renderBlock()}</div>;
}