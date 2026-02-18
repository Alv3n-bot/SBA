import { CheckCircle, AlertCircle } from 'lucide-react';

export default function Notification({ notification }) {
  return (
    <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 ${
      notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
    }`}>
      {notification.type === 'success' ? (
        <CheckCircle className="w-5 h-5 text-green-600" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-600" />
      )}
      <span className={notification.type === 'success' ? 'text-green-800' : 'text-red-800'}>
        {notification.message}
      </span>
    </div>
  );
}