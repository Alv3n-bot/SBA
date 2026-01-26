import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export async function calculateCourseGrade(studentId, courseId) {
  try {
    // Get all code submissions for this course
    const q = query(
      collection(db, 'code_submissions'),
      where('studentId', '==', studentId),
      where('courseId', '==', courseId)
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return { totalScore: 0, maxScore: 0, percentage: 0, submissions: 0 };
    }

    let totalScore = 0;
    let submissions = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      totalScore += data.score || 0;
      submissions++;
    });

    const percentage = submissions > 0 ? Math.round(totalScore / submissions) : 0;

    return {
      totalScore,
      maxScore: submissions * 100,
      percentage,
      submissions
    };
  } catch (error) {
    console.error('Error calculating grade:', error);
    return { totalScore: 0, maxScore: 0, percentage: 0, submissions: 0 };
  }
}