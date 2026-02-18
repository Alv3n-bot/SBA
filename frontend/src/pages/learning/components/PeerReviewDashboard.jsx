// src/components/learner/PeerReviewDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../../firebase';;
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  ArrowRight,
  Award,
  Eye
} from 'lucide-react';

export default function PeerReviewDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [completedReviews, setCompletedReviews] = useState([]);
  const [receivedFeedback, setReceivedFeedback] = useState([]);

  useEffect(() => {
    loadPeerReviews();
  }, []);

  const loadPeerReviews = async () => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // 1. Load assigned reviews (what I need to review)
      const assignmentsQuery = query(
        collection(db, 'peer_review_assignments'),
        where('studentId', '==', currentUser.uid)
      );
      const assignmentsSnap = await getDocs(assignmentsQuery);

      const pending = [];
      const completed = [];

      for (const assignmentDoc of assignmentsSnap.docs) {
        const data = assignmentDoc.data();
        
        for (const review of data.assignedReviews || []) {
          // Get submission details
          const submissionDoc = await getDoc(doc(db, 'submissions', review.submissionId));
          
          if (submissionDoc.exists()) {
            const submission = submissionDoc.data();
            
            // Get assignment details
            const assignmentRef = doc(db, 'courses', submission.courseId, 
              'weeks', submission.weekId, 'sections', submission.sectionId);
            const assignmentSnap = await getDoc(assignmentRef);
            
            let assignmentTitle = 'Assignment';
            if (assignmentSnap.exists()) {
              const sectionData = assignmentSnap.data();
              const assignmentBlock = sectionData.content?.find(
                block => block.id === submission.assignmentId
              );
              assignmentTitle = assignmentBlock?.title || 'Assignment';
            }

            const reviewData = {
              ...review,
              submissionId: review.submissionId,
              submission,
              assignmentTitle,
              courseId: submission.courseId
            };

            if (review.status === 'pending') {
              pending.push(reviewData);
            } else {
              completed.push(reviewData);
            }
          }
        }
      }

      setPendingReviews(pending);
      setCompletedReviews(completed);

      // 2. Load feedback received (reviews I received on my submissions)
      const mySubmissionsQuery = query(
        collection(db, 'submissions'),
        where('studentId', '==', currentUser.uid),
        where('requiresPeerReview', '==', true)
      );
      const mySubmissionsSnap = await getDocs(mySubmissionsQuery);

      const feedback = [];
      for (const submissionDoc of mySubmissionsSnap.docs) {
        const submission = { id: submissionDoc.id, ...submissionDoc.data() };
        
        if (submission.reviewsReceived && submission.reviewsReceived.length > 0) {
          // Get assignment title
          const assignmentRef = doc(db, 'courses', submission.courseId, 
            'weeks', submission.weekId, 'sections', submission.sectionId);
          const assignmentSnap = await getDoc(assignmentRef);
          
          let assignmentTitle = 'Assignment';
          if (assignmentSnap.exists()) {
            const sectionData = assignmentSnap.data();
            const assignmentBlock = sectionData.content?.find(
              block => block.id === submission.assignmentId
            );
            assignmentTitle = assignmentBlock?.title || 'Assignment';
          }

          feedback.push({
            ...submission,
            assignmentTitle
          });
        }
      }

      setReceivedFeedback(feedback);

    } catch (error) {
      console.error('Error loading peer reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading peer reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Peer Reviews</h1>
          <p className="text-gray-600">Review your classmates' work and see feedback on yours</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  {pendingReviews.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {completedReviews.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Feedback Received</p>
                <p className="text-3xl font-bold text-indigo-600 mt-1">
                  {receivedFeedback.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Reviews Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">Reviews to Complete</h2>
            {pendingReviews.length > 0 && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                {pendingReviews.length} pending
              </span>
            )}
          </div>

          {pendingReviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">All caught up!</p>
              <p className="text-sm text-gray-500 mt-1">No pending peer reviews at the moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReviews.map((review, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">
                          {review.assignmentTitle}
                        </h3>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        Submitted by: <span className="font-medium">{review.submitterName}</span>
                      </p>

                      {review.submission.submissionUrl && (
                        <div className="mb-3">
                          <a
                            href={review.submission.submissionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline break-all"
                          >
                            {review.submission.submissionUrl}
                          </a>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Peer Review
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          {review.submission.rubric?.length || 0} criteria
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/peer-reviews/${review.submissionId}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition ml-4"
                    >
                      Review Now
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Reviews Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Completed Reviews</h2>
          </div>

          {completedReviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No completed reviews yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedReviews.map((review, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {review.assignmentTitle}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Reviewed: {review.submitterName}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>

                  <div className="text-xs text-gray-500">
                    Completed: {review.completedAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feedback Received Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Your Feedback</h2>
          </div>

          {receivedFeedback.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No feedback received yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Submit peer review assignments to receive feedback
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {receivedFeedback.map((submission, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {submission.assignmentTitle}
                      </h3>

                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold text-indigo-600">
                            {submission.peerReviewScore 
                              ? Math.round(submission.peerReviewScore)
                              : '-'}
                          </div>
                          <div className="text-sm text-gray-600">/ 100</div>
                        </div>

                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          {submission.reviewsReceived.length} review{submission.reviewsReceived.length !== 1 ? 's' : ''}
                        </div>

                        {submission.reviewsComplete ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Complete
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                            {submission.reviewsReceived.length}/{submission.reviewsPerSubmission} reviews
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => navigate(`/assignments/${submission.id}/feedback`)}
                        className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Feedback
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}