import { useState, useRef } from 'react';
import { FileText, Clock, Award, CheckCircle2, Download, Send, Upload } from 'lucide-react';

export default function AssignmentBlock({ 
  block, 
  weekId, 
  sectionId, 
  submissions, 
  uploadingFile,
  onTextSubmit,
  onFileUpload,
  onUrlSubmit
}) {
  const [assignmentInput, setAssignmentInput] = useState('');
  const fileInputRef = useRef(null);
  const submission = submissions[block.id];
  const isSubmitted = !!submission;

  const handleTextSubmit = () => {
    onTextSubmit(block, assignmentInput, weekId, sectionId);
    setAssignmentInput('');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(block, file, weekId, sectionId);
    }
  };

  const handleUrlSubmit = () => {
    onUrlSubmit(block, assignmentInput, weekId, sectionId);
    setAssignmentInput('');
  };

  return (
    <div className="bg-white border border-gray-300 rounded-md p-4 mb-4 shadow-sm">
      <div className="flex items-start gap-2">
        <FileText className="w-5 h-5 text-gray-800 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-lg font-bold text-gray-900 mb-2">
            {block.title || 'Assignment'}
          </h4>
          <p className="text-gray-700 mb-3 leading-relaxed text-base">{block.description}</p>
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
          </div>
          {isSubmitted ? (
            <div className="bg-gray-100 rounded-md p-3 border border-gray-200">
              <div className="flex items-center gap-2 text-gray-800 font-semibold mb-2">
                <CheckCircle2 className="w-4 h-4" />
                Submitted
              </div>
              {submission.type === 'text' && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Your submission:</p>
                  <p className="text-gray-800">{submission.content}</p>
                </div>
              )}
              {submission.type === 'file' && (
                <div>
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
                </div>
              )}
              {submission.type === 'url' && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">URL submitted:</p>
                  <a
                    href={submission.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-800 hover:underline break-all"
                  >
                    {submission.url}
                  </a>
                </div>
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
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{submission.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {block.submissionType === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Answer
                  </label>
                  <textarea
                    value={assignmentInput}
                    onChange={(e) => setAssignmentInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-500 focus:border-transparent resize-none"
                    rows="4"
                    placeholder="Type your answer here..."
                  />
                  <button
                    onClick={handleTextSubmit}
                    disabled={!assignmentInput.trim()}
                    className="mt-2 flex items-center gap-1 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                  >
                    <Send className="w-4 h-4" />
                    Submit Assignment
                  </button>
                </div>
              )}
              {block.submissionType === 'file' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload File
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile === block.id}
                    className="flex items-center gap-1 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 font-medium text-sm"
                  >
                    {uploadingFile === block.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Choose File to Upload
                      </>
                    )}
                  </button>
                </div>
              )}
              {block.submissionType === 'url' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Submit URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={assignmentInput}
                      onChange={(e) => setAssignmentInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-500 focus:border-transparent text-sm"
                      placeholder="https://example.com/your-work"
                    />
                    <button
                      onClick={handleUrlSubmit}
                      disabled={!assignmentInput.trim()}
                      className="flex items-center gap-1 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 font-medium text-sm"
                    >
                      <Send className="w-4 h-4" />
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}