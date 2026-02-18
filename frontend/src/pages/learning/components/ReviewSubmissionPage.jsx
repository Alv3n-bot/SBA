// src/components/learner/ReviewSubmissionPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../../../firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ArrowLeft, Send, FileText, Award, ExternalLink, Github, AlertCircle } from 'lucide-react';

export default function ReviewSubmissionPage() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [rubricScores, setRubricScores] = useState([]);
  const [overallFeedback, setOverallFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadSubmission();
  }, [submissionId]);

  const loadSubmission = async () => {
    try {
      const submissionDoc = await getDoc(doc(db, 'submissions', submissionId));
      
      if (!submissionDoc.exists()) {
        setError('Submission not found');
        return;
      }

      const submissionData = { id: submissionDoc.id, ...submissionDoc.data() };
      setSubmission(submissionData);

      // Get assignment
      const assignmentDoc = await getDoc(doc(db, 'assignments', submissionData.assignmentId));
      if (assignmentDoc.exists()) {
        setAssignment(assignmentDoc.data());
      }

      // Initialize rubric scores
      if (submissionData.rubric) {
        setRubricScores(
          submissionData.rubric.map(criterion => ({
            criterion: criterion.criterion,
            description: criterion.description,
            maxScore: criterion.maxScore,
            score: 0,
            feedback: ''
          }))
        );
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
    // Validation
    if (!overallFeedback.trim()) {
      setError('Please provide overall feedback');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const totalScore = calculateTotalScore();
      const userId = auth.currentUser.uid;

      const review = {
        reviewerId: userId,
        reviewerName: 'Reviewer ' + ((submission.reviewsReceived?.length || 0) + 1),
        rubricScores: rubricScores.map(({ criterion, maxScore, score, feedback }) => ({
          criterion,
          maxScore,
          score,
          feedback
        })),
        overallFeedback: overallFeedback.trim(),
        totalScore,
        reviewedAt: new Date()
      };

      // 1. Add review to submission
      await updateDoc(doc(db, 'submissions', submissionId), {
        reviewsReceived: arrayUnion(review)
      });

      // 2. Mark as completed in reviewer's assignments
      const assignmentDocId = `${userId}_${submission.assignmentId}`;
      const assignmentDocRef = doc(db, 'peer_review_assignments', assignmentDocId);
      const assignmentDoc = await getDoc(assignmentDocRef);
      
      if (assignmentDoc.exists()) {
        const data = assignmentDoc.data();
        const updatedReviews = data.assignedReviews.map(r => {
          if (r.submissionId === submissionId) {
            return { ...r, status: 'completed', completedAt: new Date() };
          }
          return r;
        });

        await updateDoc(assignmentDocRef, {
          assignedReviews: updatedReviews
        });
      }

      // 3. Check if all reviews complete and calculate final score
      const updatedSubmission = await getDoc(doc(db, 'submissions', submissionId));
      const submissionData = updatedSubmission.data();
      const reviewsReceived = (submissionData.reviewsReceived || []).length;
      const reviewsNeeded = submissionData.reviewsPerSubmission;

      if (reviewsReceived >= reviewsNeeded) {
        const scores = submissionData.reviewsReceived.map(r => r.totalScore);
        const average = scores.reduce((a, b) => a + b, 0) / scores.length;

        await updateDoc(doc(db, 'submissions', submissionId), {
          peerReviewScore: average,
          reviewsComplete: true
        });
      }

      // Success!
      alert('Review submitted successfully!');
      navigate('/peer-reviews');

    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again.');
      setSubmitting(false);
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

  if (error && !submission) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
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

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Submission</h1>
      <p className="text-gray-600 mb-8">Evaluate your peer's work using the rubric</p>

      {/* Submission Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-900">
            {assignment?.title || 'Assignment'}
          </h2>
        </div>

        <p className="text-sm text-gray-600 mb-3">
          Submitted by: <span className="font-medium">{submission.studentName}</span>
        </p>

        {submission.submissionUrl && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Submission Link:</p>
            <a
              href={submission.submissionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-indigo-600 hover:underline break-all"
            >
              <Github className="w-4 h-4" />
              {submission.submissionUrl}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>

      {/* Rubric */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          <Award className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-900">Review Rubric</h2>
        </div>

        <div className="space-y-6">
          {rubricScores.map((item, index) => (
            <div key={index} className="pb-6 border-b border-gray-200 last:border-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{item.criterion}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <input
                    type="number"
                    min="0"
                    max={item.maxScore}
                    value={item.score}
                    onChange={(e) => handleScoreChange(index, e.target.value)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-bold"
                  />
                  <span className="text-gray-600">/ {item.maxScore}</span>
                </div>
              </div>

              <textarea
                value={item.feedback}
                onChange={(e) => handleFeedbackChange(index, e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Provide specific feedback..."
              />
            </div>
          ))}
        </div>

        <div className="mt-6 bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">Total Score:</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-indigo-600">{calculateTotalScore()}</span>
              <span className="text-gray-600">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Feedback */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Overall Feedback</h3>
        <p className="text-sm text-gray-600 mb-3">
          Provide constructive feedback about what was done well and what could be improved.
        </p>
        <textarea
          value={overallFeedback}
          onChange={(e) => setOverallFeedback(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="Write your overall feedback here..."
        />
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
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
}