import { useState, useEffect } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../../firebase';
import { HelpCircle, FileText, Clock, CheckCircle2, XCircle, RotateCcw, Play, X } from 'lucide-react';

export default function QuizBlock({ block, weekId, sectionId, quizResults, onQuizComplete, courseId }) {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentAnswers, setCurrentAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [notification, setNotification] = useState(null);

  if (!block.questions || block.questions.length === 0) {
    return (
      <div className="bg-white border border-gray-300 rounded-md p-4 mb-4">
        <p className="text-gray-600 text-base">No questions available for this quiz.</p>
      </div>
    );
  }

  const result = quizResults?.[block.id];
  const isSubmitted = !!result && !isRetrying;
  const allAnswered = Object.keys(currentAnswers).length === block.questions.length;
  const passed = result && result.score >= 70;

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type, message, score = null) => {
    setNotification({ type, message, score });
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setCurrentAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!allAnswered || isSubmitting) return;

    for (let i = 0; i < block.questions.length; i++) {
      if (currentAnswers[i] === undefined) {
        showNotification('warning', 'Please answer all questions before submitting');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const totalQuestions = block.questions.length;
      let correctCount = 0;
      const detailedAnswers = {};

      for (let i = 0; i < block.questions.length; i++) {
        const question = block.questions[i];
        const selectedAnswer = currentAnswers[i];
        const isCorrect = selectedAnswer === question.correctAnswer;
        
        if (isCorrect) correctCount++;
        
        detailedAnswers[i] = {
          selected: selectedAnswer,
          correct: question.correctAnswer,
          isCorrect
        };
      }

      const score = Math.round((correctCount / totalQuestions) * 100);

      const quizResultData = {
        userId: auth.currentUser.uid,
        courseId,
        weekId,
        sectionId,
        quizId: block.id,
        score,
        totalQuestions,
        correctAnswers: correctCount,
        answers: detailedAnswers,
        submittedAt: serverTimestamp(),
        passed: score >= 70
      };

      await setDoc(
        doc(db, 'quiz_results', `${auth.currentUser.uid}_${courseId}_${block.id}`),
        quizResultData
      );

      if (onQuizComplete) {
        onQuizComplete(block.id, {
          score,
          totalQuestions,
          correctAnswers: correctCount,
          passed: score >= 70,
          answers: detailedAnswers
        });
      }

      setIsRetrying(false);

      if (score >= 70) {
        showNotification('success', 'Congratulations! You passed this quiz!', score);
      } else {
        showNotification('warning', 'You scored below 70%. Please review the material and try again.', score);
      }

    } catch (err) {
      console.error('Error submitting quiz:', err);
      showNotification('error', 'Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryQuiz = () => {
    setCurrentAnswers({});
    setQuizStarted(true);
    setIsRetrying(true);
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentAnswers({});
    setIsRetrying(false);
  };

  // Notification Component
  const Notification = () => {
    if (!notification) return null;

    return (
      <div 
        className={`fixed top-4 right-4 z-50 max-w-md rounded-lg shadow-lg p-4 border-l-4 ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-500'
            : notification.type === 'error'
            ? 'bg-red-50 border-red-500'
            : 'bg-orange-50 border-orange-500'
        }`}
        style={{
          animation: 'slideIn 0.3s ease-out'
        }}
      >
        <style>{`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}</style>
        <div className="flex items-start gap-3">
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          ) : notification.type === 'error' ? (
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            {notification.score !== null && (
              <p className={`font-bold text-lg mb-1 ${
                notification.type === 'success' ? 'text-green-900' : 
                notification.type === 'error' ? 'text-red-900' : 'text-orange-900'
              }`}>
                Score: {notification.score}%
              </p>
            )}
            <p className={`text-sm ${
              notification.type === 'success' ? 'text-green-800' : 
              notification.type === 'error' ? 'text-red-800' : 'text-orange-800'
            }`}>
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  // Quiz not started - show start screen
  if (!quizStarted && !isSubmitted) {
    return (
      <>
        <Notification />
        <div className="bg-white border border-gray-300 rounded-md p-6 mb-4 shadow-sm">
          <div className="flex items-start gap-2 mb-4">
            <HelpCircle className="w-6 h-6 text-gray-800 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                {block.title || 'Quiz'}
              </h4>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {block.questions.length} questions
                </span>
                {block.timeLimit && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {block.timeLimit} minutes
                  </span>
                )}
                <span className="flex items-center gap-1 text-gray-700 font-medium">
                  Passing Score: 70%
                </span>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4">
                <h5 className="font-semibold text-gray-900 mb-2">Instructions:</h5>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Answer all questions before submitting</li>
                  <li>• You need 70% to pass this quiz</li>
                  <li>• You can retry the quiz if you don't pass</li>
                  <li>• Take your time and read each question carefully</li>
                </ul>
              </div>
              <button
                onClick={handleStartQuiz}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 font-semibold text-base transition-all"
              >
                <Play className="w-5 h-5" />
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Quiz submitted - show results
  if (isSubmitted && result) {
    return (
      <>
        <Notification />
        <div className="bg-white border border-gray-300 rounded-md p-4 mb-4 shadow-sm">
          <div className="flex items-start gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-gray-800 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-900 mb-1">
                {block.title || 'Quiz'}
              </h4>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {block.questions.length} questions
                </span>
              </div>
            </div>
          </div>

          {/* Result Banner */}
          <div className={`mb-4 p-4 rounded-md ${
            passed
              ? 'bg-green-50 border border-green-200'
              : 'bg-orange-50 border border-orange-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {passed ? (
                  <CheckCircle2 className="w-6 h-6 text-green-700" />
                ) : (
                  <XCircle className="w-6 h-6 text-orange-700" />
                )}
                <span className={`font-bold text-lg ${
                  passed ? 'text-green-800' : 'text-orange-800'
                }`}>
                  Score: {result.score}%
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {result.correctAnswers}/{result.totalQuestions} correct
              </span>
            </div>
            <p className={`text-sm mb-3 ${passed ? 'text-green-700' : 'text-orange-700'}`}>
              {passed
                ? '🎉 Congratulations! You passed this quiz.'
                : 'You need 70% to pass. Review the material and try again!'}
            </p>
            
            <button
              onClick={handleRetryQuiz}
              className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Retry Quiz
            </button>
          </div>

          {/* Show answers only if passed */}
          {passed && result.answers && (
            <div className="space-y-4">
              <h5 className="font-semibold text-gray-900 mb-2">Your Answers:</h5>
              {block.questions.map((question, qIndex) => {
                const answerData = result.answers[qIndex];
                const isCorrect = answerData?.isCorrect;
                
                return (
                  <div key={qIndex} className="bg-gray-50 rounded-md p-4 border border-gray-200">
                    <div className="flex items-start gap-2 mb-3">
                      <div className="bg-gray-200 text-gray-800 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">
                        {qIndex + 1}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900 mb-2 text-base">
                          {question.question}
                        </h5>
                        <div className="space-y-2">
                          {question.options.map((option, oIndex) => {
                            const wasSelected = answerData?.selected === oIndex;
                            const isCorrectOption = oIndex === question.correctAnswer;
                            
                            return (
                              <div
                                key={oIndex}
                                className={`p-2 rounded-md border ${
                                  isCorrectOption
                                    ? 'bg-green-50 border-green-300'
                                    : wasSelected && !isCorrect
                                    ? 'bg-red-50 border-red-300'
                                    : 'bg-white border-gray-200'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isCorrectOption && (
                                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                  )}
                                  {wasSelected && !isCorrect && (
                                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                  )}
                                  <span className={`text-sm ${
                                    isCorrectOption ? 'text-green-900 font-medium' : 'text-gray-700'
                                  }`}>
                                    {option}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {question.explanation && (
                          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm font-medium text-blue-900 mb-1">Explanation:</p>
                            <p className="text-sm text-blue-800">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </>
    );
  }

  // Quiz in progress
  return (
    <>
      <Notification />
      <div className="bg-white border border-gray-300 rounded-md p-4 mb-4 shadow-sm">
        <div className="flex items-start gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-gray-800 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-900 mb-1">
              {block.title || 'Quiz'}
            </h4>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {block.questions.length} questions
              </span>
              {block.timeLimit && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {block.timeLimit} minutes
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mb-4 bg-gray-50 border border-gray-200 rounded-md p-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-semibold text-gray-900">
              {Object.keys(currentAnswers).length} / {block.questions.length} answered
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gray-800 h-2 rounded-full transition-all"
              style={{
                width: `${(Object.keys(currentAnswers).length / block.questions.length) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4 mb-4">
          {block.questions.map((question, qIndex) => {
            const selectedAnswer = currentAnswers[qIndex];
            
            return (
              <div key={qIndex} className="bg-gray-50 rounded-md p-4 border border-gray-200">
                <div className="flex items-start gap-2 mb-3">
                  <div className="bg-gray-200 text-gray-800 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">
                    {qIndex + 1}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 mb-1 text-base">
                      {question.question}
                    </h5>
                    {question.points && (
                      <span className="text-xs text-gray-500">{question.points} points</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2 ml-8">
                  {question.options.map((option, oIndex) => {
                    const isSelected = selectedAnswer === oIndex;
                    
                    return (
                      <button
                        key={oIndex}
                        onClick={() => handleAnswerSelect(qIndex, oIndex)}
                        className={`w-full text-left p-3 rounded-md border transition-all ${
                          isSelected
                            ? 'bg-gray-100 border-gray-400 ring-2 ring-gray-300'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? 'border-gray-600 bg-gray-600'
                              : 'border-gray-400'
                          }`}>
                            {isSelected && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <span className="flex-1 text-sm text-gray-700">
                            {option}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmitQuiz}
          disabled={!allAnswered || isSubmitting}
          className="w-full px-4 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base transition-all"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Submitting...
            </span>
          ) : allAnswered ? (
            'Submit Quiz'
          ) : (
            `Answer all questions (${Object.keys(currentAnswers).length}/${block.questions.length})`
          )}
        </button>
      </div>
    </>
  );
}