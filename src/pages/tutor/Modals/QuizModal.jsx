import { useState } from 'react';
import { X, Trash2, Plus } from 'lucide-react';

export default function QuizModal({ modalData, onSave, onClose }) {
  const [formData, setFormData] = useState(modalData.existingBlock || {
    type: 'quiz',
    title: '',
    timeLimit: 30,
    attempts: 1,
    questions: []
  });

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, {
        id: `q_${Date.now()}`,
        type: 'multiple_choice',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 10,
        explanation: ''
      }]
    });
  };

  const updateQuestion = (index, updates) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setFormData({ ...formData, questions: newQuestions });
  };

  const deleteQuestion = (index) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {modalData.existingBlock ? 'Edit' : 'Create'} Quiz
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title</label>
            <input
              type="text"
              value={formData.title}
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
                value={formData.timeLimit}
                onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Attempts</label>
              <input
                type="number"
                value={formData.attempts}
                onChange={(e) => setFormData({ ...formData, attempts: parseInt(e.target.value) })}
                className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                min="1"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">Questions</label>
              <button
                type="button"
                onClick={addQuestion}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Question
              </button>
            </div>

            {formData.questions.map((question, qIndex) => (
              <div key={question.id} className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Question {qIndex + 1}</span>
                  <button
                    type="button"
                    onClick={() => deleteQuestion(qIndex)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={question.question}
                    onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
                    className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter question"
                    required
                  />

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Answer Options</label>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex gap-2 mb-2">
                        <input
                          type="radio"
                          name={`correct_${qIndex}`}
                          checked={question.correctAnswer === oIndex}
                          onChange={() => updateQuestion(qIndex, { correctAnswer: oIndex })}
                          className="mt-1"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...question.options];
                            newOptions[oIndex] = e.target.value;
                            updateQuestion(qIndex, { options: newOptions });
                          }}
                          className="flex-1 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          placeholder={`Option ${oIndex + 1}`}
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Points</label>
                      <input
                        type="number"
                        value={question.points}
                        onChange={(e) => updateQuestion(qIndex, { points: parseInt(e.target.value) })}
                        className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Explanation (optional)</label>
                      <input
                        type="text"
                        value={question.explanation || ''}
                        onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })}
                        className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        placeholder="Explain the correct answer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {formData.questions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No questions yet. Click "Add Question" to get started.
              </div>
            )}
          </div>

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
              {modalData.existingBlock ? 'Update' : 'Create'} Quiz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}