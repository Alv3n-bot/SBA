import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebaseConfig'

// Fetch all weeks for a course
export const fetchWeeks = async (courseId) => {
  try {
    const weeksRef = collection(db, 'courseContent', courseId, 'weeks')
    const q = query(weeksRef, orderBy('weekNumber', 'asc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching weeks:', error)
    throw error
  }
}

// Fetch single week
export const fetchWeek = async (courseId, weekId) => {
  try {
    const weekRef = doc(db, 'courseContent', courseId, 'weeks', weekId)
    const snapshot = await getDoc(weekRef)
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() }
    }
    return null
  } catch (error) {
    console.error('Error fetching week:', error)
    throw error
  }
}

// Create new week
export const createWeek = async (courseId, weekData) => {
  try {
    const weekId = `week_${Date.now()}`
    const weekRef = doc(db, 'courseContent', courseId, 'weeks', weekId)
    
    await setDoc(weekRef, {
      weekId,
      weekNumber: weekData.weekNumber,
      title: weekData.title,
      description: weekData.description || '',
      learningObjectives: weekData.learningObjectives || [],
      duration: weekData.duration || '',
      isPublished: false,
      blocks: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    return weekId
  } catch (error) {
    console.error('Error creating week:', error)
    throw error
  }
}

// Update week
export const updateWeek = async (courseId, weekId, updates) => {
  try {
    const weekRef = doc(db, 'courseContent', courseId, 'weeks', weekId)
    await updateDoc(weekRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating week:', error)
    throw error
  }
}

// Delete week
export const deleteWeek = async (courseId, weekId) => {
  try {
    const weekRef = doc(db, 'courseContent', courseId, 'weeks', weekId)
    await deleteDoc(weekRef)
  } catch (error) {
    console.error('Error deleting week:', error)
    throw error
  }
}

// Reorder weeks
export const reorderWeeks = async (courseId, week1Id, week2Id, week1Number, week2Number) => {
  try {
    const batch = writeBatch(db)
    
    batch.update(doc(db, 'courseContent', courseId, 'weeks', week1Id), {
      weekNumber: week2Number,
      updatedAt: serverTimestamp()
    })
    
    batch.update(doc(db, 'courseContent', courseId, 'weeks', week2Id), {
      weekNumber: week1Number,
      updatedAt: serverTimestamp()
    })
    
    await batch.commit()
  } catch (error) {
    console.error('Error reordering weeks:', error)
    throw error
  }
}

// Fetch course data
export const fetchCourse = async (courseId) => {
  try {
    const courseRef = doc(db, 'courses', courseId)
    const snapshot = await getDoc(courseRef)
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() }
    }
    return null
  } catch (error) {
    console.error('Error fetching course:', error)
    throw error
  }
}

// Update course
export const updateCourse = async (courseId, updates) => {
  try {
    const courseRef = doc(db, 'courses', courseId)
    await updateDoc(courseRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating course:', error)
    throw error
  }
}

// Publish course
export const publishCourse = async (courseId) => {
  try {
    await updateCourse(courseId, {
      status: 'published'
    })
  } catch (error) {
    console.error('Error publishing course:', error)
    throw error
  }
}