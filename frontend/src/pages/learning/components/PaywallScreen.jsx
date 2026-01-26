import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, CreditCard, Zap } from 'lucide-react';

export default function PaywallScreen() {
  const navigate = useNavigate();

  const benefits = [
    'Full access to all course content',
    'Interactive quizzes and assignments',
    'Track your progress and earn certificates',
    'Join cohorts and learn with peers',
    'Get grades and feedback from instructors'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="bg-gray-100 p-6 text-center">
          <Lock className="w-12 h-12 mx-auto mb-3 text-gray-800" />
          <h1 className="text-2xl font-bold mb-1 text-gray-900">Unlock Full Access</h1>
          <p className="text-gray-600 text-base">Subscribe to access all courses and features</p>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">What You'll Get:</h2>
            <div className="space-y-2">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700 text-base">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 rounded-md p-4 mb-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-gray-900">Monthly Plan</h3>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">KES 1,700</div>
                <div className="text-sm text-gray-600">per month</div>
              </div>
            </div>
            <p className="text-gray-600 text-sm">Access all courses for 30 days</p>
          </div>
          <div className="bg-gray-100 rounded-md p-4 mb-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-gray-800" />
              <h3 className="text-lg font-bold text-gray-900">3-Month Plan</h3>
              <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full font-bold">SAVE KES 100</span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-2xl font-bold text-gray-900">KES 5,000</div>
              <div className="text-sm text-gray-500">
                <span className="line-through">KES 5,100</span>
              </div>
            </div>
            <p className="text-gray-600 text-sm">Access all courses for 90 days</p>
          </div>
          <button
            onClick={() => navigate('/ehub')}
            className="w-full bg-gray-800 text-white py-3 rounded-md font-bold text-base hover:bg-gray-700 transition-all flex items-center justify-center gap-1"
          >
            <CreditCard className="w-4 h-4" />
            Choose Your Plan
          </button>
          <button
            onClick={() => navigate('/ehub')}
            className="w-full mt-2 text-gray-600 hover:text-gray-900 font-medium py-2 text-base"
          >
            EHub
          </button>
        </div>
      </div>
    </div>
  );
}