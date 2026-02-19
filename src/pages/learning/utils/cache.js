import { CACHE_KEYS, FIREBASE_CONFIG } from '../config/constants';

/**
 * Cache utility for localStorage with versioning and expiration
 */
class CacheManager {
  constructor() {
    this.checkAndClearOldCache();
  }

  /**
   * Check if cache version has changed and clear if needed
   */
  checkAndClearOldCache() {
    try {
      const storedVersion = localStorage.getItem(CACHE_KEYS.CACHE_VERSION);
      if (storedVersion !== CACHE_KEYS.CURRENT_VERSION) {
        this.clearAll();
        localStorage.setItem(CACHE_KEYS.CACHE_VERSION, CACHE_KEYS.CURRENT_VERSION);
      }
    } catch (error) {
      console.error('Error checking cache version:', error);
    }
  }

  /**
   * Set item in cache with timestamp
   */
  set(key, data) {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        version: CACHE_KEYS.CURRENT_VERSION,
      };
      localStorage.setItem(key, JSON.stringify(cacheItem));
      return true;
    } catch (error) {
      console.error('Error setting cache:', error);
      // If quota exceeded, clear old items
      if (error.name === 'QuotaExceededError') {
        this.clearExpired();
        try {
          const cacheItem = {
            data,
            timestamp: Date.now(),
            version: CACHE_KEYS.CURRENT_VERSION,
          };
          localStorage.setItem(key, JSON.stringify(cacheItem));
          return true;
        } catch (retryError) {
          return false;
        }
      }
      return false;
    }
  }

  /**
   * Get item from cache if not expired
   */
  get(key, maxAge = FIREBASE_CONFIG.CACHE_DURATION) {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheItem = JSON.parse(cached);
      const age = Date.now() - cacheItem.timestamp;

      // Check if expired
      if (age > maxAge) {
        this.remove(key);
        return null;
      }

      // Check version
      if (cacheItem.version !== CACHE_KEYS.CURRENT_VERSION) {
        this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  /**
   * Remove specific item from cache
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing cache:', error);
      return false;
    }
  }

  /**
   * Clear all cache items
   */
  clearAll() {
    try {
      const keysToKeep = [CACHE_KEYS.CACHE_VERSION];
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  /**
   * Clear expired cache items
   */
  clearExpired() {
    try {
      const allKeys = Object.keys(localStorage);
      const now = Date.now();

      allKeys.forEach(key => {
        if (key === CACHE_KEYS.CACHE_VERSION) return;
        
        try {
          const cached = localStorage.getItem(key);
          if (!cached) return;

          const cacheItem = JSON.parse(cached);
          const age = now - cacheItem.timestamp;

          if (age > FIREBASE_CONFIG.CACHE_DURATION) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          // Invalid JSON, remove it
          localStorage.removeItem(key);
        }
      });

      return true;
    } catch (error) {
      console.error('Error clearing expired cache:', error);
      return false;
    }
  }

  /**
   * Get cache info (for debugging)
   */
  getInfo() {
    try {
      const allKeys = Object.keys(localStorage);
      const cacheKeys = allKeys.filter(key => key !== CACHE_KEYS.CACHE_VERSION);
      
      const totalSize = new Blob(Object.values(localStorage)).size;
      const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);

      return {
        itemCount: cacheKeys.length,
        totalSize: `${sizeMB} MB`,
        version: localStorage.getItem(CACHE_KEYS.CACHE_VERSION),
      };
    } catch (error) {
      console.error('Error getting cache info:', error);
      return null;
    }
  }
}

// Export singleton instance
export const cache = new CacheManager();

// Helper functions for specific cache types
export const courseCache = {
  set: (courseId, data) => cache.set(`${CACHE_KEYS.COURSE_PREFIX}${courseId}`, data),
  get: (courseId) => cache.get(`${CACHE_KEYS.COURSE_PREFIX}${courseId}`),
  remove: (courseId) => cache.remove(`${CACHE_KEYS.COURSE_PREFIX}${courseId}`),
};

export const progressCache = {
  set: (userId, courseId, data) => cache.set(`${CACHE_KEYS.PROGRESS_PREFIX}${userId}_${courseId}`, data),
  get: (userId, courseId) => cache.get(`${CACHE_KEYS.PROGRESS_PREFIX}${userId}_${courseId}`),
  remove: (userId, courseId) => cache.remove(`${CACHE_KEYS.PROGRESS_PREFIX}${userId}_${courseId}`),
};

export const submissionsCache = {
  set: (userId, courseId, data) => cache.set(`${CACHE_KEYS.SUBMISSIONS_PREFIX}${userId}_${courseId}`, data),
  get: (userId, courseId) => cache.get(`${CACHE_KEYS.SUBMISSIONS_PREFIX}${userId}_${courseId}`),
  remove: (userId, courseId) => cache.remove(`${CACHE_KEYS.SUBMISSIONS_PREFIX}${userId}_${courseId}`),
};

export const quizResultsCache = {
  set: (userId, courseId, data) => cache.set(`${CACHE_KEYS.QUIZ_RESULTS_PREFIX}${userId}_${courseId}`, data),
  get: (userId, courseId) => cache.get(`${CACHE_KEYS.QUIZ_RESULTS_PREFIX}${userId}_${courseId}`),
  remove: (userId, courseId) => cache.remove(`${CACHE_KEYS.QUIZ_RESULTS_PREFIX}${userId}_${courseId}`),
};