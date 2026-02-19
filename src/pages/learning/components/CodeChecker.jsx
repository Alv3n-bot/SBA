import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { 
  Github, 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader, 
  FileCode, 
  Clock, 
  Terminal,
  Zap,
  Code2,
  Server,
  Shield,
  FileCheck,
  FolderTree
} from 'lucide-react';

export default function CodeChecker({ 
  assignment, 
  studentId, 
  studentGithubUsername, 
  courseId, 
  weekId, 
  sectionId,  
  onSubmissionComplete 
}) {
  const [githubUsername, setGithubUsername] = useState(studentGithubUsername || '');
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previousAttempts, setPreviousAttempts] = useState(0);

  const { codeChecking } = assignment;

  useEffect(() => {
    loadPreviousSubmission();
  }, [assignment.id, studentId]);

  const loadPreviousSubmission = async () => {
    try {
      const q = query(
        collection(db, 'code_submissions'),
        where('studentId', '==', studentId),
        where('assignmentId', '==', assignment.id)
      );

      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const submissions = [];
        snapshot.forEach(doc => {
          submissions.push({ id: doc.id, ...doc.data() });
        });
        
        submissions.sort((a, b) => {
          const timeA = a.submittedAt?.toMillis?.() || 0;
          const timeB = b.submittedAt?.toMillis?.() || 0;
          return timeB - timeA;
        });
        
        if (submissions.length > 0) {
          const previousResult = submissions[0];
          setResults(previousResult);
          setGithubUsername(previousResult.githubUsername || studentGithubUsername || '');
          setPreviousAttempts(submissions.length);
        }
      }
    } catch (err) {
      console.error('Error loading previous submission:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckCode = async () => {
    if (!githubUsername.trim()) {
      setError('Please enter your GitHub username');
      return;
    }

    const usernamePattern = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
    if (!usernamePattern.test(githubUsername.trim())) {
      setError('Invalid GitHub username format. Please check and try again.');
      return;
    }

    setChecking(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/check-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          assignmentId: assignment.id,
          githubUsername: githubUsername.trim(),
          courseId,
          weekId,
          sectionId,
          testingType: codeChecking.testingType,
          language: codeChecking.language,
          repoName: codeChecking.repoName,
          mainFile: codeChecking.mainFile,
          requiredFiles: codeChecking.requiredFiles || [],
          expectedOutput: codeChecking.expectedOutput,
          functionTests: codeChecking.functionTests || [],
          componentTests: codeChecking.componentTests || [],
          apiTests: codeChecking.apiTests || [],
          securityTests: codeChecking.securityTests || [],
          fileStructureTests: codeChecking.fileStructureTests || [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check code');
      }

      setResults(data);
      setPreviousAttempts(prev => prev + 1);
      
      setTimeout(() => loadPreviousSubmission(), 500);
      
      if (onSubmissionComplete) {
        onSubmissionComplete(data);
      }

    } catch (err) {
      console.error('Code check error:', err);
      setError(err.message || 'An error occurred while checking your code. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const getTestingIcon = () => {
    switch (codeChecking.testingType) {
      case 'console-output': return Terminal;
      case 'function-testing': return Zap;
      case 'component-testing': return Code2;
      case 'api-testing': return Server;
      case 'security-testing': return Shield;
      case 'file-structure': return FileCheck;
      default: return FileCode;
    }
  };

  const getTestingLabel = () => {
    switch (codeChecking.testingType) {
      case 'console-output': return 'Console Output Testing';
      case 'function-testing': return 'Function Testing';
      case 'component-testing': return 'Component Logic Testing';
      case 'api-testing': return 'API Endpoint Testing';
      case 'security-testing': return 'Security Testing';
      case 'file-structure': return 'File Structure Testing';
      default: return 'Code Testing';
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
        <div className="flex items-center justify-center py-4">
          <Loader className="w-5 h-5 animate-spin text-indigo-600" />
          <span className="ml-2 text-sm text-gray-600">Loading previous submission...</span>
        </div>
      </div>
    );
  }

  const TestIcon = getTestingIcon();

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-indigo-600" />
          <h4 className="font-semibold text-gray-900">Automated Code Checking</h4>
        </div>
        {previousAttempts > 0 && (
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
            {previousAttempts} attempt{previousAttempts !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Assignment Requirements */}
      <div className="bg-white rounded-md p-3 mb-4 border border-indigo-100">
        <p className="text-sm font-medium text-gray-700 mb-2">Requirements:</p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <span>Language: <span className="font-medium text-gray-800 capitalize">{codeChecking.language}</span></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <span>Repository: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">{codeChecking.repoName}</code></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <span>Main file: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">{codeChecking.mainFile}</code></span>
          </li>
          
          {codeChecking.requiredFiles && codeChecking.requiredFiles.length > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <div className="flex-1">
                <span className="font-medium">Required files:</span>
                <div className="mt-1 ml-4 space-y-0.5">
                  {codeChecking.requiredFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <FolderTree className="w-3 h-3 text-gray-400" />
                      <code className="font-mono text-xs text-gray-700">{file.path || file}</code>
                    </div>
                  ))}
                </div>
              </div>
            </li>
          )}

          <li className="flex items-start gap-2">
            <span className="text-indigo-600 font-bold">•</span>
            <div className="flex items-center gap-1">
              <TestIcon className="w-3.5 h-3.5 text-gray-600" />
              <span>Testing: <span className="font-medium text-gray-800">{getTestingLabel()}</span></span>
            </div>
          </li>

          {/* Console Output Details */}
          {codeChecking.testingType === 'console-output' && codeChecking.expectedOutput && (
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <div className="flex-1">
                <span>Expected output:</span>
                <code className="block bg-gray-100 px-2 py-1 rounded text-xs font-mono mt-1 whitespace-pre-wrap">
                  {codeChecking.expectedOutput}
                </code>
              </div>
            </li>
          )}

          {/* Function Testing Details */}
          {codeChecking.testingType === 'function-testing' && codeChecking.functionTests && codeChecking.functionTests.length > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <div className="flex-1">
                <span className="font-medium">Function tests ({codeChecking.functionTests.length}):</span>
                <div className="mt-1 ml-2 space-y-1">
                  {codeChecking.functionTests.map((test, idx) => (
                    <div key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs">
                      <code className="font-mono text-gray-800">
                        {test.functionName}({test.inputs})
                      </code>
                      <span className="text-gray-600 mx-1">→</span>
                      <code className="font-mono text-gray-800">{test.expectedOutput}</code>
                    </div>
                  ))}
                </div>
              </div>
            </li>
          )}

          {/* Component Testing Details */}
          {codeChecking.testingType === 'component-testing' && codeChecking.componentTests && codeChecking.componentTests.length > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <div className="flex-1">
                <span className="font-medium">Component tests ({codeChecking.componentTests.length}):</span>
                <div className="mt-1 ml-2 space-y-1">
                  {codeChecking.componentTests.map((test, idx) => (
                    <div key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs">
                      <code className="font-mono text-gray-800">
                        {test.methodName}({test.inputs || ''})
                      </code>
                      {test.description && <span className="text-gray-600 ml-2">- {test.description}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </li>
          )}

          {/* API Testing Details */}
          {codeChecking.testingType === 'api-testing' && codeChecking.apiTests && codeChecking.apiTests.length > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <div className="flex-1">
                <span className="font-medium">API tests ({codeChecking.apiTests.length}):</span>
                <div className="mt-1 ml-2 space-y-1">
                  {codeChecking.apiTests.map((test, idx) => (
                    <div key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs">
                      <code className="font-mono text-gray-800">
                        {test.method} {test.endpoint}
                      </code>
                      <span className="text-gray-600 ml-2">→ {test.expectedStatus}</span>
                    </div>
                  ))}
                </div>
              </div>
            </li>
          )}

          {/* Security Testing Details */}
          {codeChecking.testingType === 'security-testing' && codeChecking.securityTests && codeChecking.securityTests.length > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <div className="flex-1">
                <span className="font-medium">Security checks ({codeChecking.securityTests.length}):</span>
                <div className="mt-1 ml-2 space-y-1">
                  {codeChecking.securityTests.map((test, idx) => (
                    <div key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs">
                      <span className="font-mono text-gray-800">{test.type.replace('-', ' ')}</span>
                      {test.description && <span className="text-gray-600 ml-2">- {test.description}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </li>
          )}

          {/* File Structure Testing Details */}
          {codeChecking.testingType === 'file-structure' && codeChecking.fileStructureTests && codeChecking.fileStructureTests.length > 0 && (
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">•</span>
              <div className="flex-1">
                <span className="font-medium">File structure checks ({codeChecking.fileStructureTests.length}):</span>
                <div className="mt-1 ml-2 space-y-1">
                  {codeChecking.fileStructureTests.map((test, idx) => (
                    <div key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs">
                      <code className="font-mono text-gray-800">{test.path}</code>
                      <span className="text-gray-600 ml-2">({test.type})</span>
                    </div>
                  ))}
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>

      {/* Previous Result Banner */}
      {results && !checking && (
        <div className={`mb-4 p-3 rounded-lg border-2 ${
          results.allTestsPassed 
            ? 'bg-green-50 border-green-300' 
            : 'bg-yellow-50 border-yellow-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {results.allTestsPassed ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              )}
              <div>
                <p className="font-semibold text-sm">
                  {results.allTestsPassed ? 'Previously Passed!' : `Last attempt: ${results.score}%`}
                </p>
                <p className="text-xs text-gray-600">
                  {results.allTestsPassed ? 'You can check again to verify' : 'Try again to improve your score'}
                </p>
              </div>
            </div>
            <span className="text-2xl font-bold">
              {results.score}%
            </span>
          </div>
        </div>
      )}

      {/* GitHub Username Input */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your GitHub Username
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="e.g., johndoe"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              disabled={checking}
            />
          </div>
          <button
            onClick={handleCheckCode}
            disabled={checking || !githubUsername.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition"
          >
            {checking ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                {previousAttempts > 0 ? 'Check Again' : 'Check My Code'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
          <div className="flex items-start gap-2 text-red-800">
            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Checking Progress */}
      {checking && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
          <div className="flex items-start gap-2 text-blue-800">
            <Loader className="w-5 h-5 flex-shrink-0 mt-0.5 animate-spin" />
            <div className="flex-1">
              <p className="font-medium text-sm mb-2">Running tests...</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  Checking repository
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  Verifying files
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  {codeChecking.testingType === 'console-output' && 'Running code and comparing output'}
                  {codeChecking.testingType === 'function-testing' && 'Testing functions'}
                  {codeChecking.testingType === 'component-testing' && 'Testing component methods'}
                  {codeChecking.testingType === 'api-testing' && 'Testing API endpoints'}
                  {codeChecking.testingType === 'security-testing' && 'Running security checks'}
                  {codeChecking.testingType === 'file-structure' && 'Validating file structure'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Results */}
      {results && !checking && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              {results.allTestsPassed ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              <div>
                <h4 className="font-bold text-lg">
                  {results.allTestsPassed ? 'All Tests Passed! 🎉' : 'Some Tests Failed'}
                </h4>
                {results.timestamp && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {new Date(results.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">{results.score}%</div>
              <div className="text-xs text-gray-500">Score</div>
            </div>
          </div>

          <div className="space-y-2">
            {/* Repository Check */}
            <div className={`p-3 rounded-lg border ${
              results.repoExists 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-2">
                {results.repoExists ? (
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">Repository Check</p>
                  <p className="text-xs text-gray-600">
                    {results.repoExists 
                      ? `Repository '${codeChecking.repoName}' found`
                      : `Repository '${codeChecking.repoName}' not found`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* File Structure Check */}
            {results.fileChecks && results.fileChecks.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">File Structure:</p>
                <div className="space-y-1">
                  {results.fileChecks.map((fileCheck, idx) => (
                    <div key={idx} className={`p-2 rounded border ${
                      fileCheck.exists 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        {fileCheck.exists ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <code className="text-xs font-mono">{fileCheck.path}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Console Output Results */}
            {codeChecking.testingType === 'console-output' && results.codeExecuted !== undefined && (
              <div className={`p-3 rounded-lg border ${
                results.outputMatches 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-2">
                  {results.outputMatches ? (
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">Console Output</p>
                    {results.actualOutput !== undefined && (
                      <div className="mt-1 text-xs">
                        <p className="text-gray-600">Your output:</p>
                        <code className="block bg-white p-2 rounded mt-0.5 font-mono text-gray-800 border border-gray-200 whitespace-pre-wrap">
                          {results.actualOutput}
                        </code>
                        {!results.outputMatches && codeChecking.expectedOutput && (
                          <>
                            <p className="text-gray-600 mt-2">Expected output:</p>
                            <code className="block bg-white p-2 rounded mt-0.5 font-mono text-gray-800 border border-gray-200 whitespace-pre-wrap">
                              {codeChecking.expectedOutput}
                            </code>
                          </>
                        )}
                      </div>
                    )}
                    {results.error && (
                      <div className="mt-2 p-2 bg-red-100 rounded border border-red-200">
                        <p className="text-xs font-medium text-red-800">Error:</p>
                        <code className="text-xs text-red-700 block mt-1 whitespace-pre-wrap">{results.error}</code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Function Testing Results */}
            {codeChecking.testingType === 'function-testing' && results.functionTestResults && (
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  Function Test Results:
                </p>
                <div className="space-y-2">
                  {results.functionTestResults.map((testResult, idx) => (
                    <div key={idx} className={`p-2 rounded border ${
                      testResult.passed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start gap-2">
                        {testResult.passed ? (
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 text-xs">
                          <div className="font-mono mb-1">
                            <code className="text-gray-800">
                              {testResult.functionName}({testResult.inputs})
                            </code>
                          </div>
                          <div className="space-y-0.5">
                            <div>
                              <span className="text-gray-600">Expected: </span>
                              <code className="bg-white px-1 py-0.5 rounded border border-gray-200">
                                {testResult.expectedOutput}
                              </code>
                            </div>
                            <div>
                              <span className="text-gray-600">Got: </span>
                              <code className={`px-1 py-0.5 rounded border ${
                                testResult.passed 
                                  ? 'bg-white border-gray-200' 
                                  : 'bg-red-100 border-red-300'
                              }`}>
                                {testResult.actualOutput !== undefined ? String(testResult.actualOutput) : 'undefined'}
                              </code>
                            </div>
                          </div>
                          {testResult.error && (
                            <div className="mt-1 p-1.5 bg-red-100 rounded border border-red-200">
                              <p className="text-xs font-medium text-red-800">Error:</p>
                              <code className="text-xs text-red-700 block whitespace-pre-wrap">
                                {testResult.error}
                              </code>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Component Testing Results */}
            {codeChecking.testingType === 'component-testing' && results.componentTestResults && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-green-600" />
                  Component Test Results:
                </p>
                <div className="space-y-2">
                  {results.componentTestResults.map((testResult, idx) => (
                    <div key={idx} className={`p-2 rounded border ${
                      testResult.passed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start gap-2">
                        {testResult.passed ? (
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 text-xs">
                          <div className="font-mono mb-1">
                            <code className="text-gray-800">
                              {testResult.methodName}({testResult.inputs || ''})
                            </code>
                          </div>
                          {testResult.description && (
                            <p className="text-gray-600 mb-1">{testResult.description}</p>
                          )}
                          {!testResult.passed && (
                            <div className="mt-1 p-1.5 bg-red-100 rounded border border-red-200">
                              <code className="text-xs text-red-700 block whitespace-pre-wrap">
                                {testResult.error || 'Test failed'}
                              </code>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* API Testing Results */}
            {codeChecking.testingType === 'api-testing' && results.apiTestResults && (
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Server className="w-4 h-4 text-orange-600" />
                  API Test Results:
                </p>
                <div className="space-y-2">
                  {results.apiTestResults.map((testResult, idx) => (
                    <div key={idx} className={`p-2 rounded border ${
                      testResult.passed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start gap-2">
                        {testResult.passed ? (
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 text-xs">
                          <div className="font-mono mb-1">
                            <code className="text-gray-800">
                              {testResult.method} {testResult.endpoint}
                            </code>
                          </div>
                          <div className="space-y-0.5">
                            <div>
                              <span className="text-gray-600">Expected Status: </span>
                              <code className="bg-white px-1 py-0.5 rounded border border-gray-200">
                                {testResult.expectedStatus}
                              </code>
                            </div>
                            <div>
                              <span className="text-gray-600">Got: </span>
                              <code className={`px-1 py-0.5 rounded border ${
                                testResult.passed 
                                  ? 'bg-white border-gray-200' 
                                  : 'bg-red-100 border-red-300'
                              }`}>
                                {testResult.actualStatus || 'Error'}
                              </code>
                            </div>
                            {testResult.responseTime && (
                              <div className="text-gray-600">
                                Response time: {testResult.responseTime}ms
                              </div>
                            )}
                          </div>
                          {testResult.error && (
                            <div className="mt-1 p-1.5 bg-red-100 rounded border border-red-200">
                              <code className="text-xs text-red-700 block whitespace-pre-wrap">
                                {testResult.error}
                              </code>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Testing Results */}
            {codeChecking.testingType === 'security-testing' && results.securityTestResults && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-600" />
                  Security Test Results:
                </p>
                <div className="space-y-2">
                  {results.securityTestResults.map((testResult, idx) => (
                    <div key={idx} className={`p-2 rounded border ${
                      testResult.passed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start gap-2">
                        {testResult.passed ? (
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 text-xs">
                          <div className="font-medium mb-1 capitalize">
                            {testResult.type.replace('-', ' ')}
                          </div>
                          {testResult.description && (
                            <p className="text-gray-600 mb-1">{testResult.description}</p>
                          )}
                          <div className="text-gray-600">
                            {testResult.passed ? 'Security check passed ✓' : 'Security vulnerability detected ✗'}
                          </div>
                          {testResult.details && (
                            <div className="mt-1 p-1.5 bg-white rounded border border-gray-200">
                              <code className="text-xs text-gray-700 block whitespace-pre-wrap">
                                {testResult.details}
                              </code>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* File Structure Testing Results */}
            {codeChecking.testingType === 'file-structure' && results.fileStructureResults && (
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-yellow-600" />
                  File Structure Results:
                </p>
                <div className="space-y-2">
                  {results.fileStructureResults.map((testResult, idx) => (
                    <div key={idx} className={`p-2 rounded border ${
                      testResult.passed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start gap-2">
                        {testResult.passed ? (
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 text-xs">
                          <div className="font-mono mb-1">
                            <code className="text-gray-800">{testResult.path}</code>
                          </div>
                          <div className="text-gray-600 capitalize">
                            {testResult.type.replace('-', ' ')}: {testResult.passed ? 'Pass' : 'Fail'}
                          </div>
                          {testResult.details && (
                            <div className="mt-1 p-1.5 bg-white rounded border border-gray-200">
                              <code className="text-xs text-gray-700 block whitespace-pre-wrap">
                                {testResult.details}
                              </code>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Test Summary */}
            {results.testSummary && (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Test Summary:</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-bold text-lg text-green-600">
                      {results.testSummary.passed || 0}
                    </div>
                    <div className="text-gray-600">Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-red-600">
                      {results.testSummary.failed || 0}
                    </div>
                    <div className="text-gray-600">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-gray-800">
                      {results.testSummary.total || 0}
                    </div>
                    <div className="text-gray-600">Total</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-3 text-xs text-gray-600 bg-white rounded p-2 border border-gray-200">
        <p className="font-medium mb-1">💡 How it works:</p>
        <ol className="space-y-0.5 ml-4 list-decimal">
          <li>Create a GitHub repository named exactly: <code className="bg-gray-100 px-1 rounded">{codeChecking.repoName}</code></li>
          <li>Add all required files to your repository</li>
          <li>Make sure your repository is <span className="font-medium">public</span></li>
          <li>Push your code to GitHub</li>
          <li>Enter your GitHub username above and click "Check My Code"</li>
          <li>Your results are automatically saved - you can check multiple times!</li>
        </ol>
      </div>
    </div>
  );
}