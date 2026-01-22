import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function NavigationButtons({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
      <button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className="flex-1 sm:flex-none flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-base"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>
      <button
        onClick={onNext}
        disabled={!hasNext}
        className="flex-1 sm:flex-none flex items-center gap-1 px-4 py-2 bg-gray-800 text-white rounded-md font-semibold hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-base"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}