// assignment-modal/StepFour.jsx
import { Trash2, Check } from 'lucide-react';

export default function StepFour({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">Grading Configuration</h4>
        <p className="text-sm text-gray-600 mb-4">
          Optional: Add grading criteria and rubrics
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Grading Rubric (Optional)
        </label>
        {formData.rubric?.map((criterion, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={criterion.name}
              onChange={(e) => {
                const newRubric = [...formData.rubric];
                newRubric[index].name = e.target.value;
                setFormData({ ...formData, rubric: newRubric });
              }}
              className="flex-1 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Criterion name"
            />
            <input
              type="number"
              value={criterion.points}
              onChange={(e) => {
                const newRubric = [...formData.rubric];
                newRubric[index].points = parseInt(e.target.value);
                setFormData({ ...formData, rubric: newRubric });
              }}
              className="w-24 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Points"
            />
            <button
              type="button"
              onClick={() => {
                const newRubric = formData.rubric.filter((_, i) => i !== index);
                setFormData({ ...formData, rubric: newRubric });
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setFormData({ 
            ...formData, 
            rubric: [...(formData.rubric || []), { name: '', points: 0 }] 
          })}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          + Add Rubric Item
        </button>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-900">Ready to create!</p>
            <p className="text-sm text-green-700 mt-1">
              Review your settings and click "Create Assignment" to finish.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}