import React from 'react';
import { Book, Eye, Save } from 'react-feather';

const Header = ({ courseTitle, saving, viewMode, onToggleViewMode, onSave }) => {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Book className="w-6 h-6 text-indigo-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{courseTitle}</h1>
              <p className="text-sm text-gray-500">
                {saving ? 'Saving...' : 'All changes saved'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleViewMode}
              className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {viewMode === 'edit' ? <Eye className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
              {viewMode === 'edit' ? 'Preview' : 'Edit Mode'}
            </button>
            
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;