// src/components/learner/AssignmentBlock.jsx - COMPLETE FIX
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Clock, Award, CheckCircle2, Download, Send, Upload, 
  AlertCircle, Users, Copy, Share2, Github, Globe, Link as LinkIcon, 
  ExternalLink, RefreshCw 
} from 'lucide-react';
import CodeChecker from './CodeChecker';
import { auth } from '../../../firebase';
import { 
  createPeerReviewSubmission,
  updatePeerReviewSubmission,
  getMySubmissions,
  copyToClipboard,
  shareNative
} from '../utils/peerReviewHelpers';

export default function AssignmentBlock({ 
  block, 
  weekId, 
  sectionId, 
  submissions, 
  uploadingFile,
  onTextSubmit,
  onFileUpload,
  onUrlSubmit,
  studentId,
  studentGithubUsername,
  courseId,
  onCodeSubmissionComplete
}) {
  const navigate = useNavigate();
  const [assignmentInput, setAssignmentInput] = useState('');
  const [submissionError, setSubmissionError] = useState('');
  const [peerReviewSubmission, setPeerReviewSubmission] = useState(null);
  const [loadingPeerReview, setLoadingPeerReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Dynamic submission links based on teacher config
  const [submissionLinks, setSubmissionLinks] = useState([]);
  
  // Update mode
  const [isUpdating, setIsUpdating] = useState(false);
  
  const fileInputRef = useRef(null);

  const submission = submissions[block.id];
  const isSubmitted = !!submission;

  // Initialize submission links from teacher config
  useEffect(() => {
    if (block.assignmentType === 'peer-review' && block.peerReview?.submissionLinks) {
      // Use teacher's configured links
      const configuredLinks = block.peerReview.submissionLinks.map(link => ({
        label: link.label,
        url: '',
        type: link.type || 'url',
        required: link.required !== false
      }));
      setSubmissionLinks(configuredLinks);
    }
  }, [block]);

  // Load peer review submission if exists
  useEffect(() => {
    if (block.assignmentType === 'peer-review') {
      loadPeerReviewSubmission();
    }
  }, [block.id, studentId]);

  const loadPeerReviewSubmission = async () => {
    try {
      setLoadingPeerReview(true);
      const result = await getMySubmissions(studentId);
      
      if (result.success) {
        // Find submission for this assignment
        const mySubmission = result.submissions.find(
          s => s.assignmentId === block.id
        );
        
        if (mySubmission) {
          setPeerReviewSubmission(mySubmission);
        }
      }
    } catch (error) {
      console.error('Error loading peer review submission:', error);
    } finally {
      setLoadingPeerReview(false);
    }
  };

  // Validate input
  const validateInput = () => {
    setSubmissionError('');
    
    if (block.submissionType === 'text' && !assignmentInput.trim()) {
      setSubmissionError('Please enter your answer before submitting.');
      return false;
    }
    
    if (block.submissionType === 'url') {
      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(assignmentInput.trim())) {
        setSubmissionError('Please enter a valid URL starting with http:// or https://');
        return false;
      }
    }
    
    return true;
  };

  // Validate peer review links
  const validatePeerReviewLinks = () => {
    setSubmissionError('');
    
    // Check required links
    for (const link of submissionLinks) {
      if (link.required && !link.url.trim()) {
        setSubmissionError(`${link.label} is required`);
        return false;
      }

      // Validate URL format if filled
      if (link.url.trim()) {
        const urlPattern = /^https?:\/\/.+/i;
        if (!urlPattern.test(link.url.trim())) {
          setSubmissionError(`${link.label} must be a valid URL starting with http:// or https://`);
          return false;
        }
      }
    }

    // At least one link must be filled
    const hasAnyLink = submissionLinks.some(link => link.url.trim());
    if (!hasAnyLink) {
      setSubmissionError('Please provide at least one submission link');
      return false;
    }

    return true;
  };

  const handleTextSubmit = () => {
    if (!validateInput()) return;
    onTextSubmit(block, assignmentInput, weekId, sectionId);
    setAssignmentInput('');
    setSubmissionError('');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setSubmissionError('File size must be less than 10MB');
        return;
      }
      setSubmissionError('');
      onFileUpload(block, file, weekId, sectionId);
    }
  };

  const handleUrlSubmit = () => {
    if (!validateInput()) return;
    onUrlSubmit(block, assignmentInput, weekId, sectionId);
    setAssignmentInput('');
    setSubmissionError('');
  };

  // Handle peer review submission
  const handlePeerReviewSubmit = async () => {
    if (!validatePeerReviewLinks()) return;

    try {
      setSubmitting(true);
      setSubmissionError('');

      const user = auth.currentUser;
      const validLinks = submissionLinks.filter(link => link.url.trim());

      const result = await createPeerReviewSubmission({
        studentId: user.uid,
        studentName: user.displayName || user.email || 'Student',
        studentEmail: user.email,
        assignmentId: block.id,
        courseId: courseId,
        submissionLinks: validLinks,
        reviewsNeeded: block.peerReview?.reviewsNeeded || 1,  // Use teacher's config or default to 1
        rubric: block.peerReview?.rubric || []
      });

      if (result.success) {
        await loadPeerReviewSubmission();
        
        // Reset form
        const configuredLinks = block.peerReview.submissionLinks.map(link => ({
          label: link.label,
          url: '',
          type: link.type || 'url',
          required: link.required !== false
        }));
        setSubmissionLinks(configuredLinks);
        
        alert('✅ Submission successful! Share your review link with peers to get feedback.');
      } else {
        setSubmissionError(result.error || 'Failed to submit');
      }

    } catch (error) {
      console.error('Error submitting:', error);
      setSubmissionError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle update submission
  const handleUpdateSubmission = async () => {
    if (!validatePeerReviewLinks()) return;

    try {
      setSubmitting(true);
      setSubmissionError('');

      const validLinks = submissionLinks.filter(link => link.url.trim());

      const result = await updatePeerReviewSubmission(
        peerReviewSubmission.id,
        validLinks
      );

      if (result.success) {
        await loadPeerReviewSubmission();
        setIsUpdating(false);
        
        // Reset form
        const configuredLinks = block.peerReview.submissionLinks.map(link => ({
          label: link.label,
          url: '',
          type: link.type || 'url',
          required: link.required !== false
        }));
        setSubmissionLinks(configuredLinks);
        
        alert('✅ Submission updated! New review link generated. Share it to get more reviews.');
      } else {
        setSubmissionError(result.error || 'Failed to update');
      }

    } catch (error) {
      console.error('Error updating:', error);
      setSubmissionError('Failed to update. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle copy link
  const handleCopyLink = async () => {
    const fullLink = `${window.location.origin}/${peerReviewSubmission.reviewLink}`;
    const success = await copyToClipboard(fullLink);
    
    if (success) {
      alert('✅ Link copied to clipboard!');
    } else {
      alert('❌ Failed to copy link');
    }
  };

  // Handle share
  const handleShare = async () => {
    const fullLink = `${window.location.origin}/${peerReviewSubmission.reviewLink}`;
    await shareNative(
      'Review My Work',
      'Please review my submission for this assignment!',
      fullLink
    );
  };

  // Enter update mode
  const enterUpdateMode = () => {
    setIsUpdating(true);
    setSubmissionLinks(peerReviewSubmission.submissionLinks || []);
  };

  // Get icon for link type
  const getLinkIcon = (type) => {
    switch(type) {
      case 'github':
        return <Github className="w-4 h-4" />;
      case 'demo':
        return <Globe className="w-4 h-4" />;
      default:
        return <LinkIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-md p-4 mb-4 shadow-sm">
      <div className="flex items-start gap-2">
        <FileText className="w-5 h-5 text-gray-800 mt-1 flex-shrink-0" />

        <div className="flex-1">
          <h4 className="text-lg font-bold text-gray-900 mb-2">
            {block.title || 'Assignment'}
          </h4>

          <p className="text-gray-700 mb-3 leading-relaxed text-base">
            {block.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
            {block.dueDate && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Due: {new Date(block.dueDate).toLocaleDateString()}
              </span>
            )}

            {block.points && (
              <span className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                {block.points} points
              </span>
            )}
            
            {block.assignmentType && (
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                {block.assignmentType === 'code-challenge' ? 'Code Challenge' : 
                 block.assignmentType === 'peer-review' ? 'Peer Review' : 
                 'Regular Assignment'}
              </span>
            )}

            {block.assignmentType === 'peer-review' && block.peerReview?.reviewsNeeded && (
              <span className="flex items-center gap-1 text-xs text-gray-600">
                <Users className="w-3 h-3" />
                {block.peerReview.reviewsNeeded} review{block.peerReview.reviewsNeeded !== 1 ? 's' : ''} needed
              </span>
            )}
          </div>

          {/* CODE CHECKER */}
          {block.codeCheckingEnabled && block.codeChecking && (
            <div className="mb-4">
              <CodeChecker
                assignment={block}
                studentId={studentId}
                studentGithubUsername={studentGithubUsername}
                courseId={courseId}
                weekId={weekId}
                sectionId={sectionId}
                onSubmissionComplete={onCodeSubmissionComplete}
              />
            </div>
          )}

          {/* PEER REVIEW SUBMISSION */}
          {block.assignmentType === 'peer-review' && (
            <div className="mb-4">
              {loadingPeerReview ? (
                <div className="bg-gray-50 rounded-md p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading...</p>
                </div>
              ) : peerReviewSubmission && !isUpdating ? (
                // Already submitted - show status
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-center gap-2 text-indigo-800 font-semibold mb-3">
                    <CheckCircle2 className="w-5 h-5" />
                    Submitted for Peer Review
                  </div>

                  {/* Submitted Links */}
                  <div className="space-y-2 mb-4">
                    {peerReviewSubmission.submissionLinks?.map((link, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-indigo-100">
                        <p className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                          {getLinkIcon(link.type)}
                          {link.label}:
                        </p>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-600 hover:underline break-all flex items-center gap-1"
                        >
                          <span className="flex-1">{link.url}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </div>
                    ))}
                  </div>

                  {/* Shareable Review Link */}
                  <div className="bg-white rounded-lg p-4 border border-indigo-200 mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      📤 Share this link to get reviewed:
                    </p>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 overflow-x-auto">
                        <p className="text-sm text-gray-700 font-mono break-all">
                          {window.location.origin}/{peerReviewSubmission.reviewLink}
                        </p>
                      </div>
                      <button
                        onClick={handleCopyLink}
                        className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        title="Copy link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleShare}
                        className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Review Progress */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white rounded-lg p-3 border border-indigo-100">
                      <p className="text-xs text-gray-600 mb-1">Reviews Received</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {peerReviewSubmission.reviewsReceived?.length || 0} / {peerReviewSubmission.reviewsNeeded || 1}
                      </p>
                    </div>
                    
                    {peerReviewSubmission.reviewsComplete && peerReviewSubmission.averageScore !== null && (
                      <div className="bg-white rounded-lg p-3 border border-green-200">
                        <p className="text-xs text-gray-600 mb-1">Average Score</p>
                        <p className="text-2xl font-bold text-green-600">
                          {Math.round(peerReviewSubmission.averageScore)}%
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {peerReviewSubmission.reviewsComplete && (
                      <button
                        onClick={() => navigate(`/assignments/${block.id}/feedback`, {
                          state: { submission: peerReviewSubmission }
                        })}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        <Award className="w-4 h-4" />
                        View Feedback
                      </button>
                    )}
                    
                    <button
                      onClick={enterUpdateMode}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Update Links
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    Submitted: {peerReviewSubmission.submittedAt?.toDate?.()?.toLocaleString()}
                  </p>
                </div>
              ) : (
                // Not submitted OR updating - show form
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Peer Review Assignment:</span> Submit your work to get a shareable review link. Share it with classmates to receive feedback!
                    </p>
                  </div>

                  {/* Dynamic submission links from teacher config */}
                  {submissionLinks.map((link, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        {getLinkIcon(link.type)}
                        {link.label}
                        {link.required && <span className="text-red-500">*</span>}
                        {!link.required && <span className="text-gray-400 text-xs">(optional)</span>}
                      </label>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => {
                          const newLinks = [...submissionLinks];
                          newLinks[index].url = e.target.value;
                          setSubmissionLinks(newLinks);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder={`https://...`}
                      />
                    </div>
                  ))}

                  {submissionError && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {submissionError}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {isUpdating && (
                      <button
                        onClick={() => {
                          setIsUpdating(false);
                          const configuredLinks = block.peerReview.submissionLinks.map(link => ({
                            label: link.label,
                            url: '',
                            type: link.type || 'url',
                            required: link.required !== false
                          }));
                          setSubmissionLinks(configuredLinks);
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    )}
                    
                    <button
                      onClick={isUpdating ? handleUpdateSubmission : handlePeerReviewSubmit}
                      disabled={submitting}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          {isUpdating ? 'Updating...' : 'Submitting...'}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {isUpdating ? 'Update Submission' : 'Submit for Review'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* REGULAR SUBMISSION UI */}
          {block.submissionType !== 'null' && block.assignmentType !== 'peer-review' && (
            isSubmitted ? (
              <div className="bg-gray-100 rounded-md p-3 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-800 font-semibold mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Submitted
                </div>

                {submission.type === 'text' && (
                  <>
                    <p className="text-sm text-gray-600 mb-1">Your submission:</p>
                    <p className="text-gray-800 whitespace-pre-wrap">{submission.content}</p>
                  </>
                )}

                {submission.type === 'file' && (
                  <>
                    <p className="text-sm text-gray-600 mb-1">File uploaded:</p>
                    <a
                      href={submission.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-gray-800 hover:text-gray-600"
                    >
                      <Download className="w-4 h-4" />
                      {submission.fileName}
                    </a>
                  </>
                )}

                {submission.type === 'url' && (
                  <>
                    <p className="text-sm text-gray-600 mb-1">URL submitted:</p>
                    <a
                      href={submission.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-800 hover:underline break-all"
                    >
                      {submission.url}
                    </a>
                  </>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  Submitted on: {submission.submittedAt?.toDate?.()?.toLocaleString() || 'Just now'}
                </p>

                {submission.grade !== undefined && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Grade:</span>
                      <span className="text-base font-bold text-gray-900">
                        {submission.grade}/{block.points}
                      </span>
                    </div>

                    {submission.feedback && (
                      <div className="mt-1">
                        <p className="text-sm font-medium text-gray-700 mb-1">Feedback:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {submission.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {block.submissionType === 'text' && (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Answer
                    </label>
                    <textarea
                      value={assignmentInput}
                      onChange={(e) => setAssignmentInput(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Type your answer here..."
                    />
                    {submissionError && (
                      <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                        <AlertCircle className="w-4 h-4" />
                        {submissionError}
                      </div>
                    )}
                    <button
                      onClick={handleTextSubmit}
                      disabled={!assignmentInput.trim()}
                      className="mt-2 flex items-center gap-1 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <Send className="w-4 h-4" />
                      Submit Assignment
                    </button>
                  </>
                )}

                {block.submissionType === 'file' && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    {submissionError && (
                      <div className="flex items-center gap-2 text-red-600 text-sm mb-2">
                        <AlertCircle className="w-4 h-4" />
                        {submissionError}
                      </div>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFile === block.id}
                      className="flex items-center gap-1 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingFile === block.id ? 'Uploading...' : 'Choose File'}
                    </button>
                    <p className="text-xs text-gray-500 mt-1">Maximum file size: 10MB</p>
                  </>
                )}

                {block.submissionType === 'url' && (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={assignmentInput}
                        onChange={(e) => setAssignmentInput(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="https://example.com"
                      />
                      <button
                        onClick={handleUrlSubmit}
                        disabled={!assignmentInput.trim()}
                        className="flex items-center gap-1 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <Send className="w-4 h-4" />
                        Submit
                      </button>
                    </div>
                    {submissionError && (
                      <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                        <AlertCircle className="w-4 h-4" />
                        {submissionError}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}