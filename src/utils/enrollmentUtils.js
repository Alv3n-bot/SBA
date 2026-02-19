// src/utils/enrollmentUtils.js
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { findOrCreateCohort, addStudentToCohort } from './cohortUtils';

/**
 * Check if user can enroll in a course
 * @param {string} userId - Firebase user ID
 * @param {string} courseId - Course ID to enroll in
 * @returns {Promise<{canEnroll: boolean, reason?: string, enrolledCourses?: array}>}
 */
export const canEnrollInCourse = async (userId, courseId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return { canEnroll: false, reason: 'User not found' };
    }

    const userData = userDoc.data();
    const enrolledCourses = userData.enrolledCourses || [];

    // Check if already enrolled
    if (enrolledCourses.includes(courseId)) {
      return { 
        canEnroll: false, 
        reason: 'already_enrolled',
        enrolledCourses 
      };
    }

    // Check if max courses reached (2 courses limit)
    if (enrolledCourses.length >= 2) {
      return { 
        canEnroll: false, 
        reason: 'max_courses_reached',
        enrolledCourses 
      };
    }

    return { 
      canEnroll: true,
      enrolledCourses 
    };
  } catch (error) {
    console.error('Error checking enrollment eligibility:', error);
    return { canEnroll: false, reason: 'error' };
  }
};

/**
 * Enroll user in a course with automatic cohort assignment
 * @param {string} userId - Firebase user ID
 * @param {string} courseId - Course ID to enroll in
 * @returns {Promise<{success: boolean, cohort?: object, error?: string}>}
 */
export const enrollInCourse = async (userId, courseId) => {
  try {
    console.log(`Starting enrollment for user ${userId} in course ${courseId}`);
    
    // 1. Find or create cohort for this course
    const cohort = await findOrCreateCohort(courseId, new Date());
    console.log(`Cohort determined: ${cohort.name} (ID: ${cohort.id})`);
    
    // 2. Add student to cohort
    await addStudentToCohort(cohort.id, userId);
    console.log(`Student added to cohort ${cohort.name}`);
    
    // 3. Update user's enrolled courses array
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      enrolledCourses: arrayUnion(courseId)
    });
    console.log(`Added ${courseId} to user's enrolledCourses`);
    
    // 4. Update user's enrollments mapping (courseId -> cohortId)
    const userDoc = await getDoc(userRef);
    const currentEnrollments = userDoc.data()?.enrollments || {};
    
    await updateDoc(userRef, {
      enrollments: {
        ...currentEnrollments,
        [courseId]: cohort.id
      }
    });
    console.log(`Mapped ${courseId} to cohort ${cohort.id} in user's enrollments`);
    
    return { 
      success: true,
      cohort: {
        id: cohort.id,
        name: cohort.name,
        startDate: cohort.startDate,
        endDate: cohort.endDate
      }
    };
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user's enrolled courses
 * @param {string} userId - Firebase user ID
 * @returns {Promise<array>}
 */
export const getEnrolledCourses = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return [];
    }
    const userData = userDoc.data();
    return userData.enrolledCourses || [];
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return [];
  }
};

/**
 * Unenroll user from a course
 * @param {string} userId - Firebase user ID
 * @param {string} courseId - Course ID to unenroll from
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const unenrollFromCourse = async (userId, courseId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userDoc.data();
    const enrolledCourses = userData.enrolledCourses || [];
    const enrollments = userData.enrollments || {};

    // Remove course from enrolledCourses array
    const updatedCourses = enrolledCourses.filter(id => id !== courseId);
    
    // Remove course from enrollments mapping
    const updatedEnrollments = { ...enrollments };
    delete updatedEnrollments[courseId];

    await updateDoc(userRef, {
      enrolledCourses: updatedCourses,
      enrollments: updatedEnrollments
    });

    return { success: true };
  } catch (error) {
    console.error('Error unenrolling from course:', error);
    return { success: false, error: error.message };
  }
};