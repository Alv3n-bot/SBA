import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';

export default function ContentBlockModal({ modalData, onSave, onClose }) {
  const [formData, setFormData] = useState(modalData.existingBlock || {
    type: modalData.blockType,
    ...(modalData.blockType === 'heading' && { text: '', level: 2 }),
    ...(modalData.blockType === 'text' && { content: '' }),
    ...(modalData.blockType === 'video' && { url: '', title: '', description: '' }),
    ...(modalData.blockType === 'image' && { url: '', alt: '', caption: '' }),
    ...(modalData.blockType === 'link' && { url: '', text: '', openNewTab: true }),
    ...(modalData.blockType === 'list' && { items: [''], ordered: false }),
    ...(modalData.blockType === 'code' && { code: '', language: 'javascript' }),
    ...(modalData.blockType === 'assignment' && {
      title: '',
      description: '',
      dueDate: '',
      points: 100,
      submissionType: 'text'
    }),
    ...(modalData.blockType === 'quiz' && {
      title: '',
      timeLimit: 30,
      attempts: 1,
      questions: []
    })
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  // Handle list items
  const addListItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, '']
    });
  };

  const updateListItem = (index, value) => {
    const newItems = [...formData.items];
    newItems[index] = value;
    setFormData({
      ...formData,
      items: newItems
    });
  };

  const removeListItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: newItems
    });
  };

  // Handle quiz questions (simplified for content modal - full version in QuizModal)
  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...(formData.questions || []), {
        id: `q_${Date.now()}`,
        type: 'multiple_choice',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 10
      }]
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {modalData.existingBlock ? 'Edit' : 'Add'} {modalData.blockType}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* HEADING */}
          {modalData.blockType === 'heading' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heading Text</label>
                <input
                  type="text"
                  value={formData.text || ''}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heading Level</label>
                <select
                  value={formData.level || 2}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {[1, 2, 3, 4, 5, 6].map(level => (
                    <option key={level} value={level}>H{level}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* TEXT */}
          {modalData.blockType === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                rows="6"
                required
              />
            </div>
          )}

          {/* VIDEO */}
          {modalData.blockType === 'video' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                <input
                  type="url"
                  value={formData.url || ''}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://youtube.com/watch?v=..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                />
              </div>
            </>
          )}

          {/* IMAGE */}
          {modalData.blockType === 'image' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.url || ''}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
                <input
                  type="text"
                  value={formData.alt || ''}
                  onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Description for accessibility"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Caption (optional)</label>
                <input
                  type="text"
                  value={formData.caption || ''}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </>
          )}

          {/* LINK */}
          {modalData.blockType === 'link' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                <input
                  type="url"
                  value={formData.url || ''}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link Text</label>
                <input
                  type="text"
                  value={formData.text || ''}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.openNewTab}
                  onChange={(e) => setFormData({ ...formData, openNewTab: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Open in new tab</label>
              </div>
            </>
          )}

          {/* LIST */}
          {modalData.blockType === 'list' && (
            <>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={formData.ordered}
                  onChange={(e) => setFormData({ ...formData, ordered: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Numbered list</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">List Items</label>
                {formData.items?.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateListItem(index, e.target.value)}
                      className="flex-1 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={`Item ${index + 1}`}
                    />
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeListItem(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addListItem}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  + Add Item
                </button>
              </div>
            </>
          )}

          {/* CODE */}
          {modalData.blockType === 'code' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Programming Language</label>
                <select
                  value={formData.language || 'javascript'}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="sql">SQL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
                <textarea
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                  rows="10"
                  required
                />
              </div>
            </>
          )}

          {/* SIMPLE ASSIGNMENT (basic version - full version in AssignmentModal) */}
          {modalData.blockType === 'assignment' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="datetime-local"
                    value={formData.dueDate || ''}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
                  <input
                    type="number"
                    value={formData.points || 100}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 100 })}
                    className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    min="0"
                  />
                </div>
              </div>
            </>
          )}

          {/* SIMPLE QUIZ (basic version - full version in QuizModal) */}
          {modalData.blockType === 'quiz' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (minutes)</label>
                  <input
                    type="number"
                    value={formData.timeLimit || 30}
                    onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 30 })}
                    className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Attempts</label>
                  <input
                    type="number"
                    value={formData.attempts || 1}
                    onChange={(e) => setFormData({ ...formData, attempts: parseInt(e.target.value) || 1 })}
                    className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    min="1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Questions</label>
                <p className="text-xs text-gray-500 mb-3">
                  For detailed quiz creation with multiple questions, please use the full Quiz editor.
                  This will create a basic quiz placeholder.
                </p>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  + Add Question
                </button>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {modalData.existingBlock ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}