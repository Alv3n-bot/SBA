export default function CourseHeader({ course, setCourse, previewMode }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Course Title</label>
          <input
            type="text"
            value={course.title}
            onChange={(e) => setCourse({ ...course, title: e.target.value })}
            placeholder="Enter course title..."
            className="w-full px-5 py-3 text-2xl font-bold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={previewMode}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Course Description</label>
          <textarea
            value={course.description}
            onChange={(e) => setCourse({ ...course, description: e.target.value })}
            placeholder="Describe what students will learn..."
            rows={3}
            className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={previewMode}
          />
        </div>
      </div>
    </div>
  );
}