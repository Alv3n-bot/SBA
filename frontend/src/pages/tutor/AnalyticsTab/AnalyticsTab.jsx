import { Users, CheckCircle, Award, Clock } from 'lucide-react';

export default function AnalyticsTab({ course, submissions }) {
  const totalSubmissions = submissions.length;
  const gradedSubmissions = submissions.filter(s => s.grade !== undefined && s.grade !== null).length;
  const averageGrade = gradedSubmissions > 0
    ? submissions.filter(s => s.grade !== undefined).reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions
    : 0;
  const lateSubmissions = submissions.filter(s => s.isLate).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalSubmissions}</p>
            </div>
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Graded</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{gradedSubmissions}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Grade</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{averageGrade.toFixed(1)}%</p>
            </div>
            <Award className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Late Submissions</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{lateSubmissions}</p>
            </div>
            <Clock className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Progress</h3>
        <p className="text-gray-600">Analytics and detailed reports will be available soon.</p>
      </div>
    </div>
  );
}