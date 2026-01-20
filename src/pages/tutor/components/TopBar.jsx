import { Book, FileText, Eye, Save } from 'lucide-react';

export default function TopBar({
  previewMode,
  setPreviewMode,
  loadSubmissions,
  saveCourse,
  saving
}) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Book className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Course Builder</h1>
              <p className="text-sm text-gray-500">Create engaging learning experiences</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadSubmissions}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <FileText className="w-4 h-4" />
              View Submissions
            </button>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <Eye className="w-4 h-4" />
              {previewMode ? 'Edit Mode' : 'Preview'}
            </button>
            <button
              onClick={saveCourse}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-md disabled:bg-gray-400"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Course'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}