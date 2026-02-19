export default function SettingsTab({ course, setCourse }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Allow Late Submissions</p>
              <p className="text-sm text-gray-500">Students can submit assignments after the due date</p>
            </div>
            <input
              type="checkbox"
              checked={course.settings?.allowLateSubmissions}
              onChange={(e) => setCourse({
                ...course,
                settings: { ...course.settings, allowLateSubmissions: e.target.checked }
              })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-900 mb-2">Late Submission Penalty (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={course.settings?.lateSubmissionPenalty || 0}
              onChange={(e) => setCourse({
                ...course,
                settings: { ...course.settings, lateSubmissionPenalty: parseInt(e.target.value) }
              })}
              className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-900 mb-2">Grade Scale</label>
            <select
              value={course.settings?.gradeScale || 'percentage'}
              onChange={(e) => setCourse({
                ...course,
                settings: { ...course.settings, gradeScale: e.target.value }
              })}
              className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="percentage">Percentage (0-100)</option>
              <option value="points">Points</option>
              <option value="letter">Letter Grade (A-F)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}