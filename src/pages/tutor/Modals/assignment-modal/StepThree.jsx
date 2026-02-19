// assignment-modal/StepThree.jsx
import { Zap } from 'lucide-react';
import CodeChallengeConfig from './CodeChallengeConfig';
import PeerReviewConfig from './PeerReviewConfig';

export default function StepThree({ formData, setFormData }) {
  if (formData.assignmentType === 'code-challenge') {
    return <CodeChallengeConfig formData={formData} setFormData={setFormData} />;
  }

  if (formData.assignmentType === 'peer-review') {
    return <PeerReviewConfig formData={formData} setFormData={setFormData} />;
  }

  return (
    <div className="text-center py-12">
      <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-600">
        No additional testing configuration needed for regular assignments.
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Click Next to configure grading options.
      </p>
    </div>
  );
}