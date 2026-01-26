import React, { useState } from 'react';

export default function AssignmentModal({ modalData, onSave, onClose }) {
  const [formData, setFormData] = useState(modalData.existingBlock || {
    type: 'assignment',
    title: '',
    description: '',
    dueDate: '',
    points: 100,
    submissionType: 'text',
    rubric: [],
    codeCheckingEnabled: false,
    codeChecking: {
      language: 'javascript',
      repoName: '',
      requiredFiles: [],
      mainFile: '',
      expectedOutput: '',
      testCases: []
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      codeChecking: {
        ...formData.codeChecking,
        testCases: [...formData.codeChecking.testCases, { input: '', expected: '' }]
      }
    });
  };

  const removeTestCase = (index) => {
    const updatedTestCases = formData.codeChecking.testCases.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      codeChecking: {
        ...formData.codeChecking,
        testCases: updatedTestCases
      }
    });
  };

  const updateTestCase = (index, field, value) => {
    const updatedTestCases = formData.codeChecking.testCases.map((testCase, i) => 
      i === index ? { ...testCase, [field]: value } : testCase
    );
    setFormData({
      ...formData,
      codeChecking: {
        ...formData.codeChecking,
        testCases: updatedTestCases
      }
    });
  };

  const addRequiredFile = () => {
    setFormData({
      ...formData,
      codeChecking: {
        ...formData.codeChecking,
        requiredFiles: [...formData.codeChecking.requiredFiles, '']
      }
    });
  };

  const removeRequiredFile = (index) => {
    const updatedRequiredFiles = formData.codeChecking.requiredFiles.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      codeChecking: {
        ...formData.codeChecking,
        requiredFiles: updatedRequiredFiles
      }
    });
  };

  const updateRequiredFile = (index, value) => {
    const updatedRequiredFiles = formData.codeChecking.requiredFiles.map((file, i) => 
      i === index ? value : file
    );
    setFormData({
      ...formData,
      codeChecking: {
        ...formData.codeChecking,
        requiredFiles: updatedRequiredFiles
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {modalData.existingBlock ? 'Edit' : 'Add'} Assignment
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              rows="4"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
            <input
              type="number"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
              className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Submission Type</label>
            <select
              value={formData.submissionType}
              onChange={(e) => setFormData({ ...formData, submissionType: e.target.value })}
              className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="text">Text</option>
              <option value="file">File Upload</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Enable Code Checking</label>
            <input
              type="checkbox"
              checked={formData.codeCheckingEnabled}
              onChange={(e) => setFormData({ ...formData, codeCheckingEnabled: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
          </div>
          {formData.codeCheckingEnabled && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Code Checking Settings</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  value={formData.codeChecking.language}
                  onChange={(e) => setFormData({ ...formData, codeChecking: { ...formData.codeChecking, language: e.target.value } })}
                  className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Required Files</label>
                {formData.codeChecking.requiredFiles.map((file, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={file}
                      onChange={(e) => updateRequiredFile(index, e.target.value)}
                      className="flex-1 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={`Required File ${index + 1}`}
                    />
                    <button type="button" onClick={() => removeRequiredFile(index)} className="ml-2 text-red-600">Remove</button>
                  </div>
                ))}
                <button type="button" onClick={addRequiredFile} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">+ Add Required File</button>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Test Cases</h4>
                {formData.codeChecking.testCases.map((testCase, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      type="text"
                      value={testCase.input}
                      onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                      className="flex-1 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={`Input for Test Case ${index + 1}`}
                    />
                    <input
                      type="text"
                      value={testCase.expected}
                      onChange={(e) => updateTestCase(index, 'expected', e.target.value)}
                      className="flex-1 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ml-2"
                      placeholder={`Expected Output for Test Case ${index + 1}`}
                    />
                    <button type="button" onClick={() => removeTestCase(index)} className="ml-2 text-red-600">Remove</button>
                  </div>
                ))}
                <button type="button" onClick={addTestCase} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">+ Add Test Case</button>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}