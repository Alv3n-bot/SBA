export default function ErrorState({ onRetry }) {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
        <p className="text-red-600 text-lg font-semibold mb-4">Error loading course</p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md"
        >
          Retry
        </button>
      </div>
    </div>
  );
}