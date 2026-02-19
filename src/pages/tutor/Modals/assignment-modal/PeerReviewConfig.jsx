// assignment-modal/PeerReviewConfig.jsx - COMPLETE UPDATE
import { Trash2, Plus, Users, Link as LinkIcon, Github, Globe } from 'lucide-react';

export default function PeerReviewConfig({ formData, setFormData }) {
  
  // Add rubric criterion
  const addPeerReviewCriterion = () => {
    const newRubric = [...(formData.peerReview.rubric || []), {
      criterion: '',
      description: '',
      maxScore: 5
    }];
    setFormData({
      ...formData,
      peerReview: { ...formData.peerReview, rubric: newRubric }
    });
  };

  // Remove rubric criterion
  const removePeerReviewCriterion = (index) => {
    const newRubric = formData.peerReview.rubric.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      peerReview: { ...formData.peerReview, rubric: newRubric }
    });
  };

  // Update rubric criterion
  const updatePeerReviewCriterion = (index, field, value) => {
    const newRubric = [...formData.peerReview.rubric];
    newRubric[index][field] = value;
    setFormData({
      ...formData,
      peerReview: { ...formData.peerReview, rubric: newRubric }
    });
  };

  // Add submission link
  const addSubmissionLink = () => {
    const newLinks = [...(formData.peerReview.submissionLinks || []), {
      label: '',
      type: 'url',
      required: true
    }];
    setFormData({
      ...formData,
      peerReview: { ...formData.peerReview, submissionLinks: newLinks }
    });
  };

  // Remove submission link
  const removeSubmissionLink = (index) => {
    const newLinks = formData.peerReview.submissionLinks.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      peerReview: { ...formData.peerReview, submissionLinks: newLinks }
    });
  };

  // Update submission link
  const updateSubmissionLink = (index, field, value) => {
    const newLinks = [...formData.peerReview.submissionLinks];
    newLinks[index][field] = value;
    setFormData({
      ...formData,
      peerReview: { ...formData.peerReview, submissionLinks: newLinks }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">Peer Review Configuration</h4>
        <p className="text-sm text-gray-600 mb-4">
          Configure how students will submit and review work
        </p>
      </div>

      {/* Submission Links Configuration */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Submission Links
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Define what students need to submit (1-3 links)
            </p>
          </div>
          {(!formData.peerReview.submissionLinks || formData.peerReview.submissionLinks.length < 3) && (
            <button
              type="button"
              onClick={addSubmissionLink}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Link
            </button>
          )}
        </div>

        {formData.peerReview.submissionLinks?.map((link, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
            <div className="grid grid-cols-3 gap-2 mb-2">
              <input
                type="text"
                value={link.label}
                onChange={(e) => updateSubmissionLink(index, 'label', e.target.value)}
                className="col-span-2 border-gray-300 rounded text-sm px-3 py-2"
                placeholder="Label (e.g., GitHub Repository)"
              />
              
              <select
                value={link.type}
                onChange={(e) => updateSubmissionLink(index, 'type', e.target.value)}
                className="border-gray-300 rounded text-sm px-3 py-2"
              >
                <option value="url">URL</option>
                <option value="github">GitHub</option>
                <option value="demo">Live Demo</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={link.required}
                  onChange={(e) => updateSubmissionLink(index, 'required', e.target.checked)}
                  className="rounded border-gray-300"
                />
                Required
              </label>

              {formData.peerReview.submissionLinks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSubmissionLink(index)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {(!formData.peerReview.submissionLinks || formData.peerReview.submissionLinks.length === 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3">
            <p className="text-sm text-yellow-800">
              ⚠️ Add at least one submission link requirement
            </p>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  ...formData,
                  peerReview: {
                    ...formData.peerReview,
                    submissionLinks: [
                      { label: 'GitHub Repository', type: 'github', required: true }
                    ]
                  }
                });
              }}
              className="mt-2 text-sm text-yellow-700 hover:text-yellow-900 font-medium"
            >
              Add default GitHub link →
            </button>
          </div>
        )}
      </div>

      {/* Reviews Needed */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reviews Needed Per Submission
        </label>
        <input
          type="number"
          min="1"
          max="10"
          value={formData.peerReview.reviewsNeeded || 1}
          onChange={(e) => setFormData({
            ...formData,
            peerReview: { ...formData.peerReview, reviewsNeeded: parseInt(e.target.value) || 1 }
          })}
          className="w-full border-gray-300 rounded-lg px-3 py-2"
        />
        <p className="text-xs text-gray-500 mt-1">
          How many peer reviews each submission needs (default: 1)
        </p>
      </div>

      {/* Review Rubric */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Review Rubric
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Criteria that students will use to review each other
            </p>
          </div>
          <button
            type="button"
            onClick={addPeerReviewCriterion}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Criterion
          </button>
        </div>
        
        {formData.peerReview.rubric?.map((criterion, index) => (
          <div key={index} className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="text"
                value={criterion.criterion}
                onChange={(e) => updatePeerReviewCriterion(index, 'criterion', e.target.value)}
                className="border-gray-300 rounded text-sm px-3 py-2"
                placeholder="Criterion name (e.g., Code Quality)"
              />
              <input
                type="number"
                min="1"
                max="100"
                value={criterion.maxScore}
                onChange={(e) => updatePeerReviewCriterion(index, 'maxScore', parseInt(e.target.value))}
                className="border-gray-300 rounded text-sm px-3 py-2"
                placeholder="Max score"
              />
            </div>
            <div className="flex gap-2">
              <textarea
                value={criterion.description}
                onChange={(e) => updatePeerReviewCriterion(index, 'description', e.target.value)}
                className="flex-1 border-gray-300 rounded text-sm px-3 py-2"
                rows="2"
                placeholder="Description (e.g., Code is well-organized and follows best practices)"
              />
              <button
                type="button"
                onClick={() => removePeerReviewCriterion(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {(!formData.peerReview.rubric || formData.peerReview.rubric.length === 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Add at least one rubric criterion
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Peer Review Summary</p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Students submit: {formData.peerReview.submissionLinks?.length || 0} link(s)</li>
              <li>• Each submission needs: {formData.peerReview.reviewsNeeded || 1} review(s)</li>
              <li>• Rubric has: {formData.peerReview.rubric?.length || 0} criteria</li>
              <li>• Students share review links with peers</li>
              <li>• Students cannot review their own work (automatic)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}