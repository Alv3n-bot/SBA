export default function CourseCard({ course }) {
  return (
    <div style={{ 
      border: '1px solid #ccc', 
      padding: '20px', 
      margin: '10px',
      borderRadius: '8px'
    }}>
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      <p><strong>Duration:</strong> {course.duration}</p>
      <p><strong>Level:</strong> {course.level}</p>
      <details>
        <summary>Topics Covered</summary>
        <ul>
          {course.topics.map((topic, index) => (
            <li key={index}>{topic}</li>
          ))}
        </ul>
      </details>
    </div>
  )
}