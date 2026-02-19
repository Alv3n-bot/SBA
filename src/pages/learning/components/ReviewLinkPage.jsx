// src/pages/learning/components/ReviewLinkPage.jsx - UPDATED WITH SELF-REVIEW CHECK
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase';
import { 
  getSubmissionById, 
  checkIfReviewed,
  checkIfOwnSubmission,
  submitPeerReview 
} from '../utils/peerReviewHelpers';
import { 
  ArrowLeft, 
  Send, 
  CheckCircle, 
  ExternalLink, 
  Github, 
  Globe,
  AlertCircle,
  Award,
  Calendar,
  Ban
} from 'lucide-react';

export default function ReviewLinkPage() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [isOwnSubmission, setIsOwnSubmission] = useState(false);  // NEW
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [myPreviousReview, setMyPreviousReview] = useState(null);
  const [rubricScores, setRubricScores] = useState([]);
  const [overallFeedback, setOverallFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadSubmission();
  }, [submissionId]);

  const loadSubmission = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login', { state: { from: `/review/${submissionId}` } });
        return;
      }

      // Get submission
      const result = await getSubmissionById(submissionId);
      
      if (!result.success) {
        setError(result.error || 'Submission not found');
        setLoading(false);
        return;
      }

      setSubmission(result.submission);

      // CRITICAL: Check if this is their own work
      const isOwn = await checkIfOwnSubmission(submissionId, user.uid);
      setIsOwnSubmission(isOwn);

      if (isOwn) {
        // Don't allow self-review
        setLoading(false);
        return;
      }

      // Check if already reviewed
      const hasReviewed = await checkIfReviewed(submissionId, user.uid);
      setAlreadyReviewed(hasReviewed);

      if (hasReviewed) {
        // Find their previous review
        const previousReview = result.submission.reviewsReceived?.find(
          r => r.reviewerId === user.uid
        );
        setMyPreviousReview(previousReview);
      } else {
        // Initialize rubric scores
        if (result.submission.rubric) {
          setRubricScores(
            result.submission.rubric.map(criterion => ({
              criterion: criterion.criterion,
              description: criterion.description,
              maxScore: criterion.maxScore,
              score: 0,
              feedback: ''
            }))
          );
        }
      }

    } catch (error) {
      console.error('Error loading submission:', error);
      setError('Failed to load submission');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (index, score) => {
    const newScores = [...rubricScores];
    newScores[index].score = Math.min(Math.max(0, parseInt(score) || 0), newScores[index].maxScore);
    setRubricScores(newScores);
  };

  const handleFeedbackChange = (index, feedback) => {
    const newScores = [...rubricScores];
    newScores[index].feedback = feedback;
    setRubricScores(newScores);
  };

  const calculateTotalScore = () => {
    const totalEarned = rubricScores.reduce((sum, item) => sum + item.score, 0);
    const totalPossible = rubricScores.reduce((sum, item) => sum + item.maxScore, 0);
    return totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
  };

  const handleSubmitReview = async () => {
    setError('');

    // Validation
    if (overallFeedback.trim().length < 50) {
      setError('Overall feedback must be at least 50 characters long');
      return;
    }

    const allScored = rubricScores.every(item => item.score > 0);
    if (!allScored) {
      setError('Please provide a score for all criteria');
      return;
    }

    setSubmitting(true);

    try {
      const user = auth.currentUser;
      
      const result = await submitPeerReview({
        submissionId,
        reviewerId: user.uid,
        reviewerName: user.displayName || user.email || 'Anonymous',
        reviewerEmail: user.email,
        rubricScores,
        overallFeedback
      });

      if (result.success) {
        alert('✅ Review submitted successfully! Thank you for your feedback.');
        navigate('/peer-reviews');
      } else {
        setError(result.error || 'Failed to submit review');
      }

    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submission...</p>
        </div>
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Submission Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/peer-reviews')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // NEW: Cannot review own work
  if (isOwnSubmission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
          <Ban className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Cannot Review Own Work</h2>
          <p className="text-gray-600 mb-6">
            You cannot review your own submission. Share your review link with other students to get feedback!
          </p>
          <button
            onClick={() => navigate('/peer-reviews')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Already reviewed view
  if (alreadyReviewed && myPreviousReview) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/peer-reviews')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              You Already Reviewed This
            </h2>
            <p className="text-gray-600 mb-1">
              You submitted your review on {myPreviousReview.reviewedAt?.toDate?.()?.toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500">
              Score given: <span className="font-bold text-indigo-600">{myPreviousReview.totalScore}%</span>
            </p>
          </div>

          {/* Show their previous review */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Review</h3>
            
            <div className="space-y-4 mb-6">
              {myPreviousReview.rubricScores?.map((item, idx) => (
                <div key={idx} className="pb-4 border-b border-gray-100 last:border-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{item.criterion}</h4>
                    <span className="text-lg font-bold text-indigo-600">
                      {item.score}/{item.maxScore}
                    </span>
                  </div>
                  {item.feedback && (
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {item.feedback}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Overall Feedback</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{myPreviousReview.overallFeedback}</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/peer-reviews')}
              className="text-gray-700 hover:text-gray-900"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Review form view (rest of the component stays the same...)
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate('/peer-reviews')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Submission</h1>
        <p className="text-gray-600 mb-8">Provide constructive feedback using the rubric below</p>

        {/* Submission Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Submission Details</h2>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">
              Submitted by: <span className="font-medium text-gray-900">{submission.studentName}</span>
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {submission.submittedAt?.toDate?.()?.toLocaleDateString()}
            </p>
          </div>

          {/* Submission Links */}
          <div className="space-y-3">
            {submission.submissionLinks?.map((link, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">{link.label}:</p>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-indigo-600 hover:underline break-all group"
                >
                  {link.type === 'github' && <Github className="w-4 h-4 flex-shrink-0" />}
                  {link.type === 'demo' && <Globe className="w-4 h-4 flex-shrink-0" />}
                  <span className="flex-1">{link.url}</span>
                  <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition" />
                </a>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Tip:</span> Review the submission thoroughly before providing feedback. Click the links above to view the work.
            </p>
          </div>
        </div>

        {/* Rubric */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Review Rubric</h2>

          <div className="space-y-6">
            {rubricScores.map((item, index) => (
              <div key={index} className="pb-6 border-b border-gray-200 last:border-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.criterion}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-600">{item.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <input
                      type="number"
                      min="0"
                      max={item.maxScore}
                      value={item.score}
                      onChange={(e) => handleScoreChange(index, e.target.value)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-bold text-lg"
                    />
                    <span className="text-gray-600">/ {item.maxScore}</span>
                  </div>
                </div>

                <textarea
                  value={item.feedback}
                  onChange={(e) => handleFeedbackChange(index, e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Provide specific feedback for this criterion..."
                />
              </div>
            ))}
          </div>

          <div className="mt-6 bg-indigo-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">Total Score:</span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-indigo-600">{calculateTotalScore()}</span>
                <span className="text-gray-600">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Feedback */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Overall Feedback</h3>
          <p className="text-sm text-gray-600 mb-3">
            Provide constructive feedback (minimum 50 characters). What did they do well? What could be improved?
          </p>
          <textarea
            value={overallFeedback}
            onChange={(e) => setOverallFeedback(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Write your overall feedback here...&#10;&#10;Strengths:&#10;- ...&#10;&#10;Areas for improvement:&#10;- ..."
          />
          <p className="text-xs text-gray-500 mt-2">
            {overallFeedback.length} / 50 characters minimum
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => navigate('/peer-reviews')}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmitReview}
            disabled={submitting || overallFeedback.length < 50}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Review
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}