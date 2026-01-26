export default function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-base text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}