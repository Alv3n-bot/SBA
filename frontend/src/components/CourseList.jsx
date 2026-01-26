import { courses } from '../data/courses'
import CourseCard from './CourseCard'

export default function CourseList() {
  return (
    <div>
      <h2>Available Courses</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  )
}