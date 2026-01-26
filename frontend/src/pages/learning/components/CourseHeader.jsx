import { Menu, CheckCircle } from 'lucide-react';

export default function CourseHeader({
  course,
  currentWeek,
  currentSection,
  completedSections,
  showSidebar,
  setShowSidebar
}) {
  const totalSections = course.weeks.reduce((acc, w) => acc + w.sections.length, 0);

  return (
    <header className={`bg-white shadow-sm sticky top-0 z-40 transition-all duration-300 ${showSidebar ? 'lg:ml-80' : 'ml-0'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-100 rounded-md"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-gray-900">{course.title}</h1>
              <p className="text-xs text-gray-500">
                {currentWeek?.title} → {currentSection?.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>{completedSections.size} / {totalSections} completed</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}