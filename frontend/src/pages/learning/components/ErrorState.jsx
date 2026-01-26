import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export default function ErrorState({ error }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="text-center bg-white p-6 rounded-lg shadow-md max-w-md border border-gray-200">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600 text-base font-semibold mb-3">
          {error || 'Course not found'}
        </p>
        <button
          onClick={() => navigate('/ehub')}
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 font-medium text-base"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}