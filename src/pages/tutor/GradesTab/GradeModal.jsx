import { useState } from 'react';
import { X } from 'lucide-react';

export default function GradeModal({ submission, onSave, onClose }) {
  const [grade, setGrade] = useState(submission.grade || '');
  const [feedback, setFeedback] = useState(submission.feedback || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(submission.id, { grade: parseInt(grade), feedback });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Grade Submission</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Student</p>
                <p className="font-medium text-gray-900">{submission.studentName}</p>
              </div>
              <div>
                <p className="text-gray-600">Assignment</p>
                <p className="font-medium text-gray-900">{submission.assignmentTitle}</p>
              </div>
              <div>
                <p className="text-gray-600">Submitted</p>
                <p className="font-medium text-gray-900">
                  {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  submission.isLate ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {submission.isLate ? 'Late' : 'On Time'}
                </span>
              </div>
            </div>
          </div>

          {submission.content && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Submission</label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{submission.content}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade (out of {submission.maxPoints})
              </label>
              <input
                type="number"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                min="0"
                max={submission.maxPoints}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                rows="6"
                placeholder="Provide feedback to the student..."
              />
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
                Save Grade
              </button>
            </div>
          </form>
        </div>
      </div>  
    </div>
  );
}