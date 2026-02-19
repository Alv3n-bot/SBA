import { AlertTriangle, X } from 'lucide-react';

export default function IncompleteWarningModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  incompleteCount 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Incomplete Items
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            This section has{' '}
            <span className="font-bold text-orange-600">
              {incompleteCount} incomplete {incompleteCount === 1 ? 'item' : 'items'}
            </span>
            {' '}(quizzes or assignments).
          </p>
          <p className="text-gray-600 text-sm">
            We recommend completing all items before marking this section as complete. 
            However, you can still mark it as complete if you wish to continue.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
          >
            Go Back
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition"
          >
            Mark Complete Anyway
          </button>
        </div>
      </div>
    </div>
  );
}