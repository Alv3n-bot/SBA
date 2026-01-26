import React from 'react';

const NotificationBar = ({ notification }) => {
  if (!notification) return null;

  return (
    <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3 ${
      notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
    }`}>
      {notification.type === 'success' ? (
        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm4.29 7.29l-5 5c-.39.39-1.02.39-1.41 0l-2-2c-.39-.39-.39-1.02 0-1.41s1.02-.39 1.41 0l1.29 1.29 4.29-4.29c.39-.39 1.02-.39 1.41 0s.39 1.02 0 1.41z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15h-2v-2h2v2zm0-4h-2V5h2v6z" />
        </svg>
      )}
      <span className={notification.type === 'success' ? 'text-green-800' : 'text-red-800'}>
        {notification.message}
      </span>
    </div>
  );
};

export default NotificationBar;