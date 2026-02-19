import { useState, useEffect } from 'react';
import { Award, TrendingUp, CheckCircle, XCircle, Download, AlertCircle, Clock } from 'lucide-react';
import { getGradebook } from '../utils/gradeCalculator';
import { checkCourseCompletion, getCompletionChecklist } from '../utils/completionChecker';
import { getCertificate, downloadCertificate, printCertificate } from '../utils/certificateGenerator';

/**
 * Student Grades View - Shows student their own grades
 * Use in learning interface or as separate "My Grades" page
 */
export default function StudentGradesView({ userId, courseId, courseName }) {
  const [gradebook, setGradebook] = useState(null);
  const [completionData, setCompletionData] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGradeData();
  }, [userId, courseId]);

  const loadGradeData = async () => {
    setLoading(true);
    try {
      // Load gradebook
      const gb = await getGradebook(userId, courseId);
      setGradebook(gb);

      // Check completion
      const completion = await checkCourseCompletion(userId, courseId);
      setCompletionData(completion);

      // Load certificate if issued
      if (gb.certificateIssued) {
        const cert = await getCertificate(userId, courseId);
        setCertificate(cert);
      }
    } catch (error) {
      console.error('Error loading grade data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!gradebook) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No grade data available yet</p>
      </div>
    );
  }

  const checklist = completionData ? getCompletionChecklist(completionData) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall Grade */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Overall Grade</span>
            <Award className="w-5 h-5 opacity-75" />
          </div>
          <div className="text-4xl font-bold mb-1">
            {gradebook.overallPercentage?.toFixed(1) || 0}%
          </div>
          <div className="text-sm opacity-90">
            Letter Grade: {gradebook.letterGrade || 'N/A'}
          </div>
        </div>

        {/* Status */}
        <div className={`rounded-lg p-6 text-white ${
          gradebook.passed 
            ? 'bg-gradient-to-br from-green-500 to-green-600' 
            : 'bg-gradient-to-br from-red-500 to-red-600'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Status</span>
            {gradebook.passed ? (
              <CheckCircle className="w-5 h-5 opacity-75" />
            ) : (
              <XCircle className="w-5 h-5 opacity-75" />
            )}
          </div>
          <div className="text-2xl font-bold mb-1">
            {gradebook.passed ? 'Passing' : 'Not Passing'}
          </div>
          <div className="text-sm opacity-90">
            {gradebook.completed ? 'Course Completed!' : 'In Progress'}
          </div>
        </div>

        {/* Progress */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Progress</span>
            <TrendingUp className="w-5 h-5 opacity-75" />
          </div>
          <div className="text-4xl font-bold mb-1">
            {gradebook.completionPercentage?.toFixed(0) || 0}%
          </div>
          <div className="text-sm opacity-90">
            {gradebook.sectionsCompleted || 0}/{gradebook.totalSections || 0} Sections
          </div>
        </div>
      </div>

      {/* Certificate Section */}
      {gradebook.completed && certificate && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-6 h-6" />
                <h3 className="text-xl font-bold">🎉 Certificate Earned!</h3>
              </div>
              <p className="text-sm opacity-90">
                Congratulations! You've completed this course.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => printCertificate(certificate)}
                className="px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Print
              </button>
              <button
                onClick={() => downloadCertificate(certificate)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grade Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quizzes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Quiz Scores</h3>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">
                {gradebook.quizAverage?.toFixed(1) || 0}%
              </div>
              <div className="text-xs text-gray-500">
                Weight: {((gradebook.quizWeight || 0.30) * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {gradebook.quizzes && gradebook.quizzes.length > 0 ? (
            <div className="space-y-3">
              {gradebook.quizzes.map((quiz, index) => (
                <div key={quiz.quizId || index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      Quiz {index + 1}
                    </span>
                    <span className={`text-sm font-bold ${
                      quiz.passed ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {quiz.percentage?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>
                      Score: {quiz.correctAnswers || 0}/{quiz.totalQuestions || 0}
                    </span>
                    {quiz.attempts > 1 && (
                      <span className="text-gray-500">
                        {quiz.attempts} attempts
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No quizzes taken yet</p>
            </div>
          )}
        </div>

        {/* Assignments */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Assignment Scores</h3>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">
                {gradebook.assignmentAverage?.toFixed(1) || 0}%
              </div>
              <div className="text-xs text-gray-500">
                Weight: {((gradebook.assignmentWeight || 0.50) * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {gradebook.assignments && gradebook.assignments.length > 0 ? (
            <div className="space-y-3">
              {gradebook.assignments.map((assignment, index) => (
                <div key={assignment.assignmentId || index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      Assignment {index + 1}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {assignment.percentage?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Score: {assignment.finalScore?.toFixed(0) || 0}/{assignment.maxPoints || 100}
                    {assignment.isLate && (
                      <span className="text-orange-600 ml-2">
                        (Late: {assignment.latePenalty}% penalty)
                      </span>
                    )}
                  </div>
                  {assignment.feedback && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-700 italic">
                        Feedback: "{assignment.feedback}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No graded assignments yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Completion Requirements */}
      {!gradebook.completed && checklist.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Completion Requirements
          </h3>
          <div className="space-y-3">
            {checklist.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                {item.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${
                      item.completed ? 'text-green-900' : 'text-gray-900'
                    }`}>
                      {item.label}
                    </span>
                    <span className="text-xs text-gray-500">{item.detail}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        item.completed ? 'bg-green-600' : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min(item.progress, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {completionData && !completionData.completed && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Complete all requirements above to earn your certificate!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}