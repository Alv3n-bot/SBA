// assignment-modal/StepOne.jsx
import { FileText, Code, Users, Check } from 'lucide-react';

export default function StepOne({ formData, setFormData }) {
  const assignmentTypes = [
    {
      id: 'regular',
      name: 'Regular Assignment',
      description: 'Text, file upload, or URL submission',
      icon: FileText,
      color: 'blue'
    },
    {
      id: 'code-challenge',
      name: 'Code Challenge',
      description: 'GitHub integration with automated testing',
      icon: Code,
      color: 'purple'
    },
    {
      id: 'peer-review',
      name: 'Peer Review',
      description: 'Students review each other\'s work',
      icon: Users,
      color: 'green'
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">Choose Assignment Type</h4>
        <p className="text-sm text-gray-600 mb-4">
          Select the type of assignment that best fits your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {assignmentTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = formData.assignmentType === type.id;
          
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => setFormData({ ...formData, assignmentType: type.id })}
              className={`p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                isSelected ? 'bg-indigo-100' : 'bg-gray-100'
              }`}>
                <Icon className={`w-6 h-6 ${
                  isSelected ? 'text-indigo-600' : 'text-gray-600'
                }`} />
              </div>
              <h5 className="font-semibold text-gray-900 mb-1">{type.name}</h5>
              <p className="text-sm text-gray-600">{type.description}</p>
              
              {isSelected && (
                <div className="mt-3 flex items-center text-sm text-indigo-600 font-medium">
                  <Check className="w-4 h-4 mr-1" />
                  Selected
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}