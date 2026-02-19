import { useState } from 'react';
import { X, FileText, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import StepOne from './assignment-modal/StepOne';
import StepTwo from './assignment-modal/StepTwo';
import StepThree from './assignment-modal/StepThree';
import StepFour from './assignment-modal/StepFour';

export default function AssignmentModal({ modalData, onSave, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(modalData.existingBlock || {
    type: 'assignment',
    assignmentType: 'regular', // 'regular', 'code-challenge', 'peer-review'
    title: '',
    description: '',
    dueDate: '',
    points: 100,
    submissionType: 'text',
    codeCheckingEnabled: false,
    codeChecking: {
      language: 'javascript',
      repoName: '',
      requiredFiles: [],
      mainFile: '',
      testingType: 'console-output',
      expectedOutput: '',
      functionTests: [],
      testCases: []
    },
    peerReview: {
      enabled: false,
      reviewsPerSubmission: 2,
      anonymous: true,
      rubric: []
    },
    rubric: []
  });

  const steps = [
    { id: 1, name: 'Type' },
    { id: 2, name: 'Details' },
    { id: 3, name: 'Testing' },
    { id: 4, name: 'Grading' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.assignmentType === 'code-challenge') {
      formData.codeCheckingEnabled = true;
      formData.submissionType = 'null';
    }
    
    if (formData.assignmentType === 'peer-review') {
      formData.peerReview.enabled = true;
    }
    
    onSave(formData);
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.assignmentType;
      case 2:
        return formData.title && formData.description && formData.dueDate;
      case 3:
        if (formData.assignmentType === 'code-challenge') {
          return formData.codeChecking.repoName && formData.codeChecking.mainFile;
        }
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {modalData.existingBlock ? 'Edit' : 'Create'} Assignment
              </h3>
              <p className="text-sm text-indigo-100">
                Step {currentStep} of {steps.length}: {steps[currentStep - 1].name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:text-indigo-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition text-sm font-semibold ${
                    currentStep >= step.id
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {step.id}
                  </div>
                  <span className={`text-xs mt-1 font-medium ${
                    currentStep >= step.id ? 'text-indigo-600' : 'text-gray-400'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 ${
                    currentStep > step.id ? 'bg-indigo-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 240px)' }}>
          <div className="p-6">
            {currentStep === 1 && <StepOne formData={formData} setFormData={setFormData} />}
            {currentStep === 2 && <StepTwo formData={formData} setFormData={setFormData} />}
            {currentStep === 3 && <StepThree formData={formData} setFormData={setFormData} />}
            {currentStep === 4 && <StepFour formData={formData} setFormData={setFormData} />}
          </div>
        </form>

        {/* Footer Navigation */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Check className="w-4 h-4" />
                {modalData.existingBlock ? 'Update' : 'Create'} Assignment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}