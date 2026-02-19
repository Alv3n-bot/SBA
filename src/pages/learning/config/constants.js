// Firebase Configuration
export const FIREBASE_CONFIG = {
  COHORT_MAX_SIZE: 30,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB in bytes
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  PAGINATION_LIMIT: 20,
};

// UI Configuration
export const UI_CONFIG = {
  SIDEBAR_WIDTH: 'w-80', // 320px
  SIDEBAR_WIDTH_LG: 'lg:w-80',
  SIDEBAR_MARGIN: 'lg:ml-80',
  MODAL_Z_INDEX: 'z-[999]',
  SIDEBAR_Z_INDEX: 'z-50',
  HEADER_Z_INDEX: 'z-40',
  OVERLAY_Z_INDEX: 'z-40',
  TOAST_DURATION: 5000, // 5 seconds
  TOAST_AUTO_DISMISS: 3000, // 3 seconds for auto-dismiss
};

// Colors & Theme
export const COLORS = {
  primary: {
    bg: 'bg-gray-800',
    hover: 'hover:bg-gray-700',
    text: 'text-gray-800',
    border: 'border-gray-800',
  },
  success: {
    bg: 'bg-green-600',
    hover: 'hover:bg-green-700',
    text: 'text-green-600',
    light: 'bg-green-50',
    border: 'border-green-600',
  },
  error: {
    bg: 'bg-red-600',
    hover: 'hover:bg-red-700',
    text: 'text-red-600',
    light: 'bg-red-50',
    border: 'border-red-600',
  },
  warning: {
    bg: 'bg-orange-600',
    hover: 'hover:bg-orange-700',
    text: 'text-orange-600',
    light: 'bg-orange-50',
    border: 'border-orange-600',
  },
  info: {
    bg: 'bg-blue-600',
    hover: 'hover:bg-blue-700',
    text: 'text-blue-600',
    light: 'bg-blue-50',
    border: 'border-blue-600',
  },
};

// Messages
export const MESSAGES = {
  SUCCESS: {
    ASSIGNMENT_SUBMITTED: 'Assignment submitted successfully!',
    FILE_UPLOADED: 'File uploaded successfully!',
    URL_SUBMITTED: 'URL submitted successfully!',
    SECTION_COMPLETED: 'Section marked as complete!',
    QUIZ_PASSED: 'Quiz passed! Great job!',
  },
  ERROR: {
    ASSIGNMENT_SUBMIT_FAILED: 'Failed to submit assignment. Please try again.',
    FILE_UPLOAD_FAILED: 'Failed to upload file. Please try again.',
    URL_SUBMIT_FAILED: 'Failed to submit URL. Please try again.',
    COURSE_NOT_FOUND: 'Course not found',
    USER_NOT_FOUND: 'User profile not found',
    LOADING_FAILED: 'Failed to load course',
    MARK_COMPLETE_FAILED: 'Failed to mark section as complete. Please try again.',
  },
  WARNING: {
    INCOMPLETE_ITEMS: 'You have incomplete quizzes or assignments in this section.',
  },
  INFO: {
    NO_CONTENT: 'No content available for this section yet.',
  },
};

// Cache Keys
export const CACHE_KEYS = {
  COURSE_PREFIX: 'course_',
  PROGRESS_PREFIX: 'progress_',
  SUBMISSIONS_PREFIX: 'submissions_',
  QUIZ_RESULTS_PREFIX: 'quiz_results_',
  USER_DATA: 'user_data',
  CACHE_VERSION: 'cache_version',
  CURRENT_VERSION: 'v1.0.0', // Update this when you want to invalidate all caches
};

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  NEXT_SECTION: 'ArrowRight',
  PREVIOUS_SECTION: 'ArrowLeft',
  CLOSE_MODAL: 'Escape',
  MARK_COMPLETE: ' ', // Space bar
  TOGGLE_SIDEBAR: 'm',
};

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    name: 'Monthly Plan',
    price: 1700,
    currency: 'KES',
    duration: 30,
    savings: 0,
  },
  QUARTERLY: {
    name: '3-Month Plan',
    price: 5000,
    currency: 'KES',
    duration: 90,
    savings: 100,
    originalPrice: 5100,
  },
};