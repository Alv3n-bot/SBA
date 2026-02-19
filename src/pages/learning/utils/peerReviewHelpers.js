// src/utils/peerReviewHelpers.js - UPDATED WITH SELF-REVIEW PREVENTION
import { db } from '../../../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  query, 
  where, 
  updateDoc, 
  arrayUnion
} from 'firebase/firestore';

/**
 * Generate unique submission ID for shareable link
 */
export function generateSubmissionId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Create peer review submission with shareable link
 */
export async function createPeerReviewSubmission({
  studentId,
  studentName,
  studentEmail,
  assignmentId,
  courseId,
  submissionLinks,
  reviewsNeeded,
  rubric
}) {
  try {
    const submissionId = generateSubmissionId();
    
    const submissionData = {
      studentId,
      studentName,
      studentEmail,
      assignmentId,
      courseId,
      submissionLinks,
      reviewsNeeded: reviewsNeeded || 1,  // DEFAULT TO 1
      rubric: rubric || [],
      reviewsReceived: [],
      reviewsComplete: false,
      averageScore: null,
      reviewLink: `review/${submissionId}`,
      submittedAt: new Date(),
      updatedAt: new Date(),
      version: 1
    };

    await setDoc(doc(db, 'peer_review_submissions', submissionId), submissionData);

    return {
      success: true,
      submissionId,
      reviewLink: `review/${submissionId}`
    };

  } catch (error) {
    console.error('Error creating submission:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update existing submission (resubmit)
 */
export async function updatePeerReviewSubmission(submissionId, newLinks) {
  try {
    const newSubmissionId = generateSubmissionId();
    const submissionRef = doc(db, 'peer_review_submissions', submissionId);
    const submissionDoc = await getDoc(submissionRef);
    
    if (!submissionDoc.exists()) {
      throw new Error('Submission not found');
    }

    const oldData = submissionDoc.data();

    // Create new submission with incremented version
    const newSubmissionData = {
      ...oldData,
      submissionLinks: newLinks,
      reviewLink: `review/${newSubmissionId}`,
      updatedAt: new Date(),
      version: (oldData.version || 1) + 1,
      previousVersions: [
        ...(oldData.previousVersions || []),
        {
          submissionId: submissionId,
          links: oldData.submissionLinks,
          reviewsReceived: oldData.reviewsReceived,
          updatedAt: oldData.updatedAt
        }
      ],
      // Reset reviews for new version
      reviewsReceived: []
    };

    await setDoc(doc(db, 'peer_review_submissions', newSubmissionId), newSubmissionData);

    return {
      success: true,
      submissionId: newSubmissionId,
      reviewLink: `review/${newSubmissionId}`
    };

  } catch (error) {
    console.error('Error updating submission:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if reviewer has already reviewed this submission
 */
export async function checkIfReviewed(submissionId, reviewerId) {
  try {
    const trackingId = `${reviewerId}_${submissionId}`;
    const trackingDoc = await getDoc(doc(db, 'peer_review_tracking', trackingId));
    
    return trackingDoc.exists() && trackingDoc.data().hasReviewed === true;

  } catch (error) {
    console.error('Error checking review status:', error);
    return false;
  }
}

/**
 * Check if reviewer is trying to review their own work
 * CRITICAL: PREVENTS SELF-REVIEW
 */
export async function checkIfOwnSubmission(submissionId, reviewerId) {
  try {
    const submissionDoc = await getDoc(doc(db, 'peer_review_submissions', submissionId));
    
    if (!submissionDoc.exists()) {
      return false;
    }

    const submission = submissionDoc.data();
    return submission.studentId === reviewerId;

  } catch (error) {
    console.error('Error checking submission owner:', error);
    return false;
  }
}

/**
 * Submit a peer review
 */
export async function submitPeerReview({
  submissionId,
  reviewerId,
  reviewerName,
  reviewerEmail,
  rubricScores,
  overallFeedback
}) {
  try {
    // CRITICAL: Check if trying to review own work
    const isOwnSubmission = await checkIfOwnSubmission(submissionId, reviewerId);
    if (isOwnSubmission) {
      return { 
        success: false, 
        error: 'You cannot review your own work' 
      };
    }

    // Validate feedback length
    if (overallFeedback.trim().length < 50) {
      return { 
        success: false, 
        error: 'Feedback must be at least 50 characters long' 
      };
    }

    // Check if already reviewed
    const hasReviewed = await checkIfReviewed(submissionId, reviewerId);
    if (hasReviewed) {
      return { 
        success: false, 
        error: 'You have already reviewed this submission' 
      };
    }

    // Calculate total score
    const totalEarned = rubricScores.reduce((sum, item) => sum + item.score, 0);
    const totalPossible = rubricScores.reduce((sum, item) => sum + item.maxScore, 0);
    const percentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;

    const review = {
      reviewerId,
      reviewerName,
      reviewerEmail,
      rubricScores: rubricScores.map(({ criterion, maxScore, score, feedback }) => ({
        criterion,
        maxScore,
        score,
        feedback: feedback || ''
      })),
      overallFeedback: overallFeedback.trim(),
      totalScore: percentage,
      reviewedAt: new Date()
    };

    // Add review to submission
    const submissionRef = doc(db, 'peer_review_submissions', submissionId);
    await updateDoc(submissionRef, {
      reviewsReceived: arrayUnion(review),
      updatedAt: new Date()
    });

    // Create tracking document
    const trackingId = `${reviewerId}_${submissionId}`;
    await setDoc(doc(db, 'peer_review_tracking', trackingId), {
      reviewerId,
      submissionId,
      hasReviewed: true,
      reviewedAt: new Date()
    });

    // Check if all reviews complete and calculate average
    await calculateAverageScore(submissionId);

    return { success: true };

  } catch (error) {
    console.error('Error submitting review:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Calculate average score if all reviews complete
 */
async function calculateAverageScore(submissionId) {
  try {
    const submissionDoc = await getDoc(doc(db, 'peer_review_submissions', submissionId));
    
    if (!submissionDoc.exists()) return;

    const submission = submissionDoc.data();
    const reviewsReceived = submission.reviewsReceived?.length || 0;
    const reviewsNeeded = submission.reviewsNeeded || 1;  // DEFAULT TO 1

    if (reviewsReceived >= reviewsNeeded) {
      // Calculate average
      const scores = submission.reviewsReceived.map(r => r.totalScore);
      const average = scores.reduce((a, b) => a + b, 0) / scores.length;

      // Update submission
      await updateDoc(doc(db, 'peer_review_submissions', submissionId), {
        averageScore: average,
        reviewsComplete: true,
        updatedAt: new Date()
      });
    }

  } catch (error) {
    console.error('Error calculating average:', error);
  }
}

/**
 * Get submission by ID
 */
export async function getSubmissionById(submissionId) {
  try {
    const submissionDoc = await getDoc(doc(db, 'peer_review_submissions', submissionId));
    
    if (!submissionDoc.exists()) {
      return { success: false, error: 'Submission not found' };
    }

    return {
      success: true,
      submission: {
        id: submissionDoc.id,
        ...submissionDoc.data()
      }
    };

  } catch (error) {
    console.error('Error getting submission:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get student's own submissions
 */
export async function getMySubmissions(studentId) {
  try {
    const q = query(
      collection(db, 'peer_review_submissions'),
      where('studentId', '==', studentId)
    );
    
    const snapshot = await getDocs(q);
    const submissions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { success: true, submissions };

  } catch (error) {
    console.error('Error getting submissions:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get reviews completed by a student
 */
export async function getReviewsCompleted(reviewerId) {
  try {
    const q = query(
      collection(db, 'peer_review_tracking'),
      where('reviewerId', '==', reviewerId),
      where('hasReviewed', '==', true)
    );
    
    const snapshot = await getDocs(q);
    const reviews = [];

    for (const trackingDoc of snapshot.docs) {
      const tracking = trackingDoc.data();
      
      // Get submission details
      const submissionResult = await getSubmissionById(tracking.submissionId);
      
      if (submissionResult.success) {
        const submission = submissionResult.submission;
        
        // Find this reviewer's review
        const myReview = submission.reviewsReceived?.find(
          r => r.reviewerId === reviewerId
        );

        if (myReview) {
          reviews.push({
            submissionId: tracking.submissionId,
            submission,
            myReview,
            reviewedAt: tracking.reviewedAt
          });
        }
      }
    }

    return { success: true, reviews };

  } catch (error) {
    console.error('Error getting completed reviews:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        textArea.remove();
        return true;
      } catch (err) {
        console.error('Fallback copy failed:', err);
        textArea.remove();
        return false;
      }
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
}

/**
 * Share using native share API (mobile-friendly)
 */
export async function shareNative(title, text, url) {
  try {
    if (navigator.share) {
      await navigator.share({
        title,
        text,
        url
      });
      return true;
    } else {
      // Fallback to copy
      return await copyToClipboard(url);
    }
  } catch (error) {
    console.error('Error sharing:', error);
    return false;
  }
}

/**
 * Extract submission ID from review link
 */
export function extractSubmissionId(link) {
  try {
    // Handle full URLs or just the path
    const url = new URL(link, window.location.origin);
    const parts = url.pathname.split('/');
    const reviewIndex = parts.indexOf('review');
    
    if (reviewIndex !== -1 && parts[reviewIndex + 1]) {
      return parts[reviewIndex + 1];
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting submission ID:', error);
    return null;
  }
}