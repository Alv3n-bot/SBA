import { useState } from 'react';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import IncompleteWarningModal from './IncompleteWarningModal';

export default function MarkCompleteButton({
  weekId,
  sectionId,
  isCompleted,
  hasIncompleteItems,
  incompleteItemsCount,
  onMarkComplete,
  disabled = false
}) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleClick = async () => {
    if (disabled || loading) return;

    // If has incomplete items, show modal instead of browser confirm
    if (hasIncompleteItems && !isCompleted) {
      setShowModal(true);
      return;
    }

    // If no incomplete items, mark as complete directly
    await markComplete();
  };

  const markComplete = async () => {
    setLoading(true);
    try {
      await onMarkComplete(weekId, sectionId);
    } finally {
      setLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="flex items-center justify-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-lg border-2 border-green-200">
        <CheckCircle className="w-5 h-5" />
        <span className="font-semibold">Section Completed</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {hasIncompleteItems && (
          <div className="flex items-start gap-3 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-orange-900 font-semibold mb-1">
                {incompleteItemsCount} incomplete {incompleteItemsCount === 1 ? 'item' : 'items'}
              </p>
              <p className="text-xs text-orange-700">
                You have unfinished quizzes or assignments in this section
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleClick}
          disabled={disabled || loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Marking Complete...</span>
            </>
          ) : (
            <>
              <Circle className="w-5 h-5" />
              <span>Mark Section as Complete</span>
            </>
          )}
        </button>
      </div>

      {/* Modal */}
      <IncompleteWarningModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={markComplete}
        incompleteCount={incompleteItemsCount}
      />
    </>
  );
}