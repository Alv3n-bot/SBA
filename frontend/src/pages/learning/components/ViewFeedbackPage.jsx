// src/components/learner/ViewFeedbackPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Award, User, MessageSquare, CheckCircle, Clock } from 'lucide-react';

export default function ViewFeedbackPage() {
  const { assignmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(location.state?.submission || null);
  const [assignment, setAssignment] = useState(null);

  useEffect(() => {
    loadFeedback();
  }, [assignmentId]);

  const loadFeedback = async () => {
    try {
      if (submission) {
        // Get assignment
        const assignmentDoc = await getDoc(doc(db, 'assignments', submission.assignmentId));
        if (assignmentDoc.exists()) {
          setAssignment(assignmentDoc.data());
        }
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Submission not found</p>
          <button
            onClick={() => navigate('/peer-reviews')}
            className="text-indigo-600 hover:underline"
          >
            ← Back to Peer Reviews
          </button>
        </div>
      </div>
    );
  }

  const reviews = submission.reviewsReceived || [];
  const averageScore = submission.peerReviewScore;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <button
        onClick={() => navigate('/peer-reviews')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Peer Reviews
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Peer Review Feedback</h1>
      <p className="text-gray-600 mb-8">{assignment?.title || 'Assignment'}</p>

      {/* Score Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-100 mb-2">Your Peer Review Score</p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-bold">
                {averageScore ? Math.round(averageScore) : '-'}
              </span>
              <span className="text-2xl text-indigo-100">/ 100</span>
            </div>
            <div className="mt-4 flex items-center gap-4 text-indigo-100">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {reviews.length} review{reviews.length !== 1 ? 's' : ''} received
              </span>
              {submission.reviewsComplete ? (
                <span className="flex items-center gap-1 px-2 py-1 bg-green-500 bg-opacity-30 rounded-full text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Complete
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500 bg-opacity-30 rounded-full text-sm">
                  <Clock className="w-4 h-4" />
                  {reviews.length}/{submission.reviewsPerSubmission} reviews
                </span>
              )}
            </div>
          </div>
          <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Award className="w-16 h-16" />
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No reviews yet</p>
            <p className="text-sm text-gray-500 mt-1">Your peers are currently reviewing your submission</p>
          </div>
        ) : (
          reviews.map((review, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Review Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{review.reviewerName}</h3>
                      <p className="text-xs text-gray-500">
                        {review.reviewedAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">
                      {Math.round(review.totalScore)}
                    </div>
                    <div className="text-xs text-gray-600">/ 100</div>
                  </div>
                </div>
              </div>

              {/* Rubric Scores */}
              <div className="px-6 py-4">
                <h4 className="font-semibold text-gray-900 mb-4">Rubric Scores</h4>
                <div className="space-y-4">
                  {review.rubricScores.map((item, idx) => (
                    <div key={idx} className="pb-4 border-b border-gray-100 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{item.criterion}</h5>
                        <div className="flex items-center gap-1 ml-4">
                          <span className="text-lg font-bold text-gray-900">{item.score}</span>
                          <span className="text-sm text-gray-600">/ {item.maxScore}</span>
                        </div>
                      </div>
                      {item.feedback && (
                        <div className="bg-gray-50 rounded-lg p-3 mt-2">
                          <p className="text-sm text-gray-700">{item.feedback}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Overall Feedback */}
              {review.overallFeedback && (
                <div className="px-6 pb-6">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <MessageSquare className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <h4 className="font-semibold text-gray-900">Overall Feedback</h4>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{review.overallFeedback}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Back Button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate('/peer-reviews')}
          className="text-gray-700 hover:text-gray-900"
        >
          ← Back to Peer Reviews
        </button>
      </div>
    </div>
  );
}