// src/utils/cohortUtils.js
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Cohort configuration
const COHORT_MAX_SIZE = 50; // Maximum students per cohort
const COHORT_START_MONTHS = [1, 3, 5, 7, 9, 11]; // Jan, Mar, May, Jul, Sep, Nov
const COHORT_DURATION_MONTHS = 4; // Each cohort runs for 4 months

// Cohort number mapping
const COHORT_NUMBERS = {
  1: '01',  // January
  3: '02',  // March
  5: '03',  // May
  7: '04',  // July
  9: '05',  // September
  11: '06'  // November
};

/**
 * Get the second Monday of a given month/year
 * @param {number} year 
 * @param {number} month (1-12)
 * @returns {Date}
 */
const getSecondMonday = (year, month) => {
  let date = new Date(year, month - 1, 1); // First day of month
  
  // Find first Monday
  while (date.getDay() !== 1) {
    date.setDate(date.getDate() + 1);
  }
  
  // Add 7 days to get second Monday
  date.setDate(date.getDate() + 7);
  
  return date;
};

/**
 * Calculate cohort end date based on start date
 * @param {Date} startDate 
 * @returns {Date}
 */
const calculateEndDate = (startDate) => {
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + COHORT_DURATION_MONTHS);
  endDate.setDate(endDate.getDate() + 6); // Add 6 days for full week completion
  return endDate;
};

/**
 * Determine the next available cohort based on enrollment date
 * @param {Date} enrollmentDate - When the student is enrolling
 * @returns {Object} - {year, month, cohortNumber, startDate, endDate, registrationDeadline, name}
 */
export const determineNextCohort = (enrollmentDate = new Date()) => {
  const currentYear = enrollmentDate.getFullYear();
  const currentMonth = enrollmentDate.getMonth() + 1; // 1-12
  const currentDate = enrollmentDate.getDate();
  
  // Find the next available cohort
  for (let yearOffset = 0; yearOffset <= 1; yearOffset++) {
    const checkYear = currentYear + yearOffset;
    
    for (const cohortMonth of COHORT_START_MONTHS) {
      // Skip past months in current year
      if (yearOffset === 0 && cohortMonth < currentMonth) {
        continue;
      }
      
      // Skip current month if we're past the registration deadline
      if (yearOffset === 0 && cohortMonth === currentMonth) {
        const registrationDeadline = getSecondMonday(checkYear, cohortMonth);
        if (enrollmentDate > registrationDeadline) {
          continue; // Try next cohort
        }
      }
      
      // This is our cohort!
      const startDate = new Date(checkYear, cohortMonth - 1, 1);
      const endDate = calculateEndDate(startDate);
      const registrationDeadline = getSecondMonday(checkYear, cohortMonth);
      const cohortNumber = COHORT_NUMBERS[cohortMonth];
      const name = `SBA-${checkYear}${String(cohortMonth).padStart(2, '0')}-${cohortNumber}`;
      
      return {
        year: checkYear,
        month: cohortMonth,
        cohortNumber,
        startDate,
        endDate,
        registrationDeadline,
        name
      };
    }
  }
  
  // Fallback (should never reach here)
  const fallbackMonth = COHORT_START_MONTHS[0];
  const fallbackYear = currentYear + 1;
  const startDate = new Date(fallbackYear, fallbackMonth - 1, 1);
  const endDate = calculateEndDate(startDate);
  const registrationDeadline = getSecondMonday(fallbackYear, fallbackMonth);
  
  return {
    year: fallbackYear,
    month: fallbackMonth,
    cohortNumber: COHORT_NUMBERS[fallbackMonth],
    startDate,
    endDate,
    registrationDeadline,
    name: `SBA-${fallbackYear}${String(fallbackMonth).padStart(2, '0')}-${COHORT_NUMBERS[fallbackMonth]}`
  };
};

/**
 * Find or create a cohort for a course
 * @param {string} courseId 
 * @param {Date} enrollmentDate 
 * @returns {Promise<{id: string, name: string, startDate: Date, endDate: Date}>}
 */
export const findOrCreateCohort = async (courseId, enrollmentDate = new Date()) => {
  try {
    const nextCohortInfo = determineNextCohort(enrollmentDate);
    
    // Check if cohort already exists for this course
    const cohortQuery = query(
      collection(db, 'cohorts'),
      where('courseId', '==', courseId),
      where('name', '==', nextCohortInfo.name),
      where('status', '==', 'active')
    );
    
    const cohortSnapshot = await getDocs(cohortQuery);
    
    // If cohort exists and has space, return it
    if (!cohortSnapshot.empty) {
      const existingCohort = cohortSnapshot.docs[0];
      const cohortData = existingCohort.data();
      
      if ((cohortData.studentIds?.length || 0) < COHORT_MAX_SIZE) {
        return {
          id: existingCohort.id,
          ...cohortData,
          startDate: cohortData.startDate.toDate ? cohortData.startDate.toDate() : cohortData.startDate,
          endDate: cohortData.endDate.toDate ? cohortData.endDate.toDate() : cohortData.endDate
        };
      }
    }
    
    // Create new cohort
    const newCohortData = {
      courseId,
      name: nextCohortInfo.name,
      startDate: nextCohortInfo.startDate,
      endDate: nextCohortInfo.endDate,
      registrationDeadline: nextCohortInfo.registrationDeadline,
      trackFocus: 'Full Stack / DS / Cybersec',
      studentIds: [],
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const cohortRef = await addDoc(collection(db, 'cohorts'), newCohortData);
    
    console.log(`Created new cohort: ${nextCohortInfo.name} for course: ${courseId}`);
    
    return {
      id: cohortRef.id,
      ...newCohortData
    };
  } catch (error) {
    console.error('Error finding/creating cohort:', error);
    throw error;
  }
};

/**
 * Add student to a cohort
 * @param {string} cohortId 
 * @param {string} userId 
 * @returns {Promise<void>}
 */
export const addStudentToCohort = async (cohortId, userId) => {
  try {
    const cohortRef = doc(db, 'cohorts', cohortId);
    
    // Get current cohort data
    const cohortDoc = await getDocs(query(collection(db, 'cohorts'), where('__name__', '==', cohortId)));
    
    if (cohortDoc.empty) {
      throw new Error('Cohort not found');
    }
    
    const cohortData = cohortDoc.docs[0].data();
    const currentStudents = cohortData.studentIds || [];
    
    // Check if student already in cohort
    if (currentStudents.includes(userId)) {
      console.log('Student already in cohort');
      return;
    }
    
    // Check if cohort is full
    if (currentStudents.length >= COHORT_MAX_SIZE) {
      throw new Error('Cohort is full');
    }
    
    // Add student to cohort
    await updateDoc(cohortRef, {
      studentIds: [...currentStudents, userId],
      updatedAt: serverTimestamp()
    });
    
    console.log(`Added student ${userId} to cohort ${cohortId}`);
  } catch (error) {
    console.error('Error adding student to cohort:', error);
    throw error;
  }
};

/**
 * Get cohort by ID
 * @param {string} cohortId 
 * @returns {Promise<Object|null>}
 */
export const getCohortById = async (cohortId) => {
  try {
    const cohortQuery = query(
      collection(db, 'cohorts'),
      where('__name__', '==', cohortId)
    );
    
    const cohortSnapshot = await getDocs(cohortQuery);
    
    if (cohortSnapshot.empty) {
      return null;
    }
    
    const cohortDoc = cohortSnapshot.docs[0];
    return {
      id: cohortDoc.id,
      ...cohortDoc.data()
    };
  } catch (error) {
    console.error('Error getting cohort:', error);
    return null;
  }
};

/**
 * Get student's cohort for a specific course
 * @param {string} userId 
 * @param {string} courseId 
 * @returns {Promise<Object|null>}
 */
export const getStudentCohort = async (userId, courseId) => {
  try {
    const cohortQuery = query(
      collection(db, 'cohorts'),
      where('courseId', '==', courseId),
      where('studentIds', 'array-contains', userId)
    );
    
    const cohortSnapshot = await getDocs(cohortQuery);
    
    if (cohortSnapshot.empty) {
      return null;
    }
    
    const cohortDoc = cohortSnapshot.docs[0];
    return {
      id: cohortDoc.id,
      ...cohortDoc.data()
    };
  } catch (error) {
    console.error('Error getting student cohort:', error);
    return null;
  }
};