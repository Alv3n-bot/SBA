// assignment-modal/StepTwo.jsx
export default function StepTwo({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">Assignment Details</h4>
        <p className="text-sm text-gray-600 mb-4">
          Provide basic information about the assignment
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assignment Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g., Build a Calculator App"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          rows="5"
          placeholder="Provide detailed instructions for students..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Due Date *
          </label>
          <input
            type="datetime-local"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Points *
          </label>
          <input
            type="number"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
            className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            min="0"
            required
          />
        </div>
      </div>

      {formData.assignmentType === 'regular' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Submission Type
          </label>
          <select
            value={formData.submissionType}
            onChange={(e) => setFormData({ ...formData, submissionType: e.target.value })}
            className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="text">Text Entry</option>
            <option value="file">File Upload</option>
            <option value="url">Website URL</option>
          </select>
        </div>
      )}
    </div>
  );
}