import { useState } from 'react';
import {
  GripVertical,
  Trash2,
  XCircle,
  Type,
  AlignLeft,
  Video,
  List,
  FileText,
  ListChecks,
  Image as ImageIcon,
  Code
} from 'lucide-react';

export default function ContentBlock({
  block,
  weekId,
  sectionId,
  isPreview,
  updateContentBlock,
  deleteContentBlock,
  moveContentBlock,
  addQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion
}) {
  const update = (updates) => updateContentBlock(weekId, sectionId, block.id, updates);
  const remove = () => deleteContentBlock(weekId, sectionId, block.id);
  const blockStyles = "bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-indigo-300 transition-all";

  if (isPreview) {
    switch (block.type) {
      case 'heading':
        const HeadingTag = `h${block.level}`;
        return <HeadingTag className="text-gray-900 font-bold">{block.text}</HeadingTag>;
      case 'paragraph':
        return <p className="text-gray-700">{block.text}</p>;
      case 'video':
        return (
          <div className="my-4">
            <h3 className="font-semibold">{block.title}</h3>
            <iframe
              src={block.url.replace('watch?v=', 'embed/')}
              width="100%"
              height="315"
              title={block.title}
            />
            <p>{block.description}</p>
          </div>
        );
      case 'list':
        const ListTag = block.ordered ? 'ol' : 'ul';
        return (
          <ListTag className={`list-inside ${block.ordered ? 'list-decimal' : 'list-disc'}`}>
            {block.items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ListTag>
        );
      case 'assignment':
        return (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-bold">{block.title}</h3>
            <p>{block.description}</p>
            <p>Submission: {block.submissionType.charAt(0).toUpperCase() + block.submissionType.slice(1)}</p>
            <p>Due: {block.dueDate} | Points: {block.points}</p>
          </div>
        );
      case 'quiz':
        return (
          <div className="bg-blue-50 p-4 rounded-lg">
            {block.questions.map((q, qIdx) => (
              <div key={qIdx} className="mb-4">
                <h3 className="font-bold">{q.question}</h3>
                <ul className="list-disc list-inside">
                  {q.options.map((opt, idx) => (
                    <li key={idx}>{opt}</li>
                  ))}
                </ul>
                <p className="text-sm text-gray-500">Explanation: {q.explanation}</p>
              </div>
            ))}
          </div>
        );
      case 'image':
        return <img src={block.url} alt={block.alt} className="max-w-full" />;
      case 'code':
        return (
          <pre className="bg-gray-800 text-white p-4 rounded">
            <code>{block.text}</code>
          </pre>
        );
      default:
        return null;
    }
  } else {
    // Editor mode
    switch (block.type) {
      case 'heading':
        return (
          <div className={blockStyles}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Type className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-gray-700">Heading</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => moveContentBlock(weekId, sectionId, block.id, 'up')}>
                  <GripVertical className="w-4 h-4 rotate-90" />
                </button>
                <button onClick={() => moveContentBlock(weekId, sectionId, block.id, 'down')}>
                  <GripVertical className="w-4 h-4 -rotate-90" />
                </button>
                <button onClick={remove} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <input
              type="text"
              value={block.text}
              onChange={(e) => update({ text: e.target.value })}
              placeholder="Enter heading text..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <select
              value={block.level}
              onChange={(e) => update({ level: parseInt(e.target.value) })}
              className="mt-3 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {[1, 2, 3, 4, 5, 6].map((l) => (
                <option key={l} value={l}>
                  Heading {l}
                </option>
              ))}
            </select>
          </div>
        );
      case 'paragraph':
        return (
          <div className={blockStyles}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlignLeft className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-gray-700">Paragraph</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => moveContentBlock(weekId, sectionId, block.id, 'up')}>
                  <GripVertical className="w-4 h-4 rotate-90" />
                </button>
                <button onClick={() => moveContentBlock(weekId, sectionId, block.id, 'down')}>
                  <GripVertical className="w-4 h-4 -rotate-90" />
                </button>
                <button onClick={remove} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <textarea
              value={block.text}
              onChange={(e) => update({ text: e.target.value })}
              placeholder="Write your content here..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>
        );
      case 'video':
        return (
          <div className={blockStyles}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-gray-700">Video</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => moveContentBlock(weekId, sectionId, block.id, 'up')}>
                  <GripVertical className="w-4 h-4 rotate-90" />
                </button>
                <button onClick={() => moveContentBlock(weekId, sectionId, block.id, 'down')}>
                  <GripVertical className="w-4 h-4 -rotate-90" />
                </button>
                <button onClick={remove} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={block.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Video title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={block.url}
                onChange={(e) => update({ url: e.target.value })}
                placeholder="YouTube URL"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                value={block.description || ''}
                onChange={(e) => update({ description: e.target.value })}
                placeholder="Video description (optional)"
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        );
      case 'list':
        return (
          <div className={blockStyles}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <List className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-gray-700">List</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => moveContentBlock(weekId, sectionId, block.id, 'up')}>
                  <GripVertical className="w-4 h-4 rotate-90" />
                </button>
                <button onClick={() => moveContentBlock(weekId, sectionId, block.id, 'down')}>
                  <GripVertical className="w-4 h-4 -rotate-90" />
                </button>
                <button onClick={remove} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={block.ordered}
                onChange={(e) => update({ ordered: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-sm text-gray-700">Numbered list</span>
            </label>
            <div className="space-y-2">
              {block.items.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newItems = [...block.items];
                      newItems[idx] = e.target.value;
                      update({ items: newItems });
                    }}
                    placeholder={`Item ${idx + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => update({ items: block.items.filter((_, i) => i !== idx) })}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => update({ items: [...block.items, ''] })}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                + Add item
              </button>
            </div>
          </div>
        );
      case 'assignment':
        return (
          <div className={blockStyles}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-gray-700">Assignment</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => moveContentBlock(weekId, sectionId, block.id, 'up')}>
                  <GripVertical className="w-4 h-4 rotate-90" />
                </button>
                <button onClick={() => moveContentBlock(weekId, sectionId, block.id, 'down')}>
                  <GripVertical className="w-4 h-4 -rotate-90" />
                </button>
                <button onClick={remove} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={block.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Assignment title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
              />
              <textarea
                value={block.description}
                onChange={(e) => update({ description: e.target.value })}
                placeholder="Assignment instructions"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={block.submissionType}
                onChange={(e) => update({ submissionType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="text">Text Response</option>
                <option value="link">Submit Link</option>
                <option value="file">File Upload</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={block.dueDate}
                    onChange={(e) => update({ dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                  <input
                    type="number"
                    value={block.points}
                    onChange={(e) => update({ points: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <textarea
                value={block.answerSheet || ''}
                onChange={(e) => update({ answerSheet: e.target.value })}
                placeholder="Answer sheet / grading rubric (for peer review)"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        );
      case 'quiz':
        return (
          <div className={blockStyles}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-gray-700">Quiz</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => moveContentBlock(weekId, sectionId, block.id, 'up')}>
                  <GripVertical className="w-4 h-4 rotate-90" />
                </button>
                <button onClick={() => moveContentBlock(weekId, sectionId, block.id, 'down')}>
                  <GripVertical className="w-4 h-4 -rotate-90" />
                </button>
                <button onClick={remove} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {(block.questions || []).map((q, qIdx) => {
                const isTrueFalse = q.subtype === 'true_false';
                return (
                  <div key={qIdx} className="border p-4 rounded-lg bg-gray-50">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Question {qIdx + 1}</span>
                      <button
                        onClick={() => deleteQuizQuestion(weekId, sectionId, block.id, qIdx)}
                        className="text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <select
                      value={q.subtype}
                      onChange={(e) => {
                        const subtype = e.target.value;
                        updateQuizQuestion(weekId, sectionId, block.id, qIdx, {
                          subtype,
                          options: subtype === 'true_false' ? ['True', 'False'] : ['', '', '', '']
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-3"
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="true_false">True/False</option>
                    </select>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => updateQuizQuestion(weekId, sectionId, block.id, qIdx, { question: e.target.value })}
                      placeholder="Enter question..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-3"
                    />
                    <div className="space-y-2">
                      {(isTrueFalse ? ['True', 'False'] : q.options).map((opt, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              if (!isTrueFalse) {
                                const newOpts = [...q.options];
                                newOpts[idx] = e.target.value;
                                updateQuizQuestion(weekId, sectionId, block.id, qIdx, { options: newOpts });
                              }
                            }}
                            placeholder={`Option ${idx + 1}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            disabled={isTrueFalse}
                          />
                          <input
                            type="radio"
                            checked={q.correctAnswer === idx}
                            onChange={() => updateQuizQuestion(weekId, sectionId, block.id, qIdx, { correctAnswer: idx })}
                            className="w-4 h-4"
                          />
                          {!isTrueFalse && (
                            <button
                              onClick={() => {
                                const newOpts = q.options.filter((_, i) => i !== idx);
                                updateQuizQuestion(weekId, sectionId, block.id, qIdx, { options: newOpts });
                              }}
                              className="text-red-500"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      {!isTrueFalse && (
                        <button
                          onClick={() => {
                            const newOpts = [...q.options, ''];
                            updateQuizQuestion(weekId, sectionId, block.id, qIdx, { options: newOpts });
                          }}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          + Add option
                        </button>
                      )}
                    </div>
                    <textarea
                      value={q.explanation}
                      onChange={(e) => updateQuizQuestion(weekId, sectionId, block.id, qIdx, { explanation: e.target.value })}
                      placeholder="Explanation (optional)"
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mt-3"
                    />
                  </div>
                );
              })}
              <button
                onClick={() => addQuizQuestion(weekId, sectionId, block.id)}
                className="w-full py-2 border border-dashed border-indigo-500 text-indigo-600 hover:bg-indigo-50"
              >
                + Add Question
              </button>
            </div>
          </div>
        );
      case 'image':
        return (
          <div className={blockStyles}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-gray-700">Image</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => moveContentBlock(weekId, sectionId, block.id, 'up')}>
                  <GripVertical className="w-4 h-4 rotate-90" />
                </button>
                <button onClick={() => moveContentBlock(weekId, sectionId, block.id, 'down')}>
                  <GripVertical className="w-4 h-4 -rotate-90" />
                </button>
                <button onClick={remove} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <input
              type="text"
              value={block.url}
              onChange={(e) => update({ url: e.target.value })}
              placeholder="Image URL"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-2"
            />
            <input
              type="text"
              value={block.alt}
              onChange={(e) => update({ alt: e.target.value })}
              placeholder="Alt text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-2"
            />
            <input
              type="text"
              value={block.caption}
              onChange={(e) => update({ caption: e.target.value })}
              placeholder="Caption (optional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        );
      case 'code':
        return (
          <div className={blockStyles}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-gray-700">Code Block</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => moveContentBlock(weekId, sectionId, block.id, 'up')}>
                  <GripVertical className="w-4 h-4 rotate-90" />
                </button>
                <button onClick={() => moveContentBlock(weekId, sectionId, block.id, 'down')}>
                  <GripVertical className="w-4 h-4 -rotate-90" />
                </button>
                <button onClick={remove} className="text-red-500 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <select
              value={block.language}
              onChange={(e) => update({ language: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-3"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="html">HTML</option>
            </select>
            <textarea
              value={block.text}
              onChange={(e) => update({ text: e.target.value })}
              placeholder="Enter code here..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>
        );
      default:
        return null;
    }
  }
}