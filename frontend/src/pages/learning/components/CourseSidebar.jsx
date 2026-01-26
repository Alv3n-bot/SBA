import { useNavigate } from 'react-router-dom';
import { X, User, BookOpen, ChevronDown, CheckCircle, Circle, Home, Settings as SettingsIcon, Bell } from 'lucide-react';

export default function CourseSidebar({
  course,
  cohort,
  showSidebar,
  setShowSidebar,
  expandedWeeks,
  toggleWeek,
  currentWeekIndex,
  currentSectionIndex,
  completedSections,
  goToSection,
  onOpenSettings,
  onOpenNotifications
}) {
  const navigate = useNavigate();

  if (!course) return null;

  const totalSections = course.weeks.reduce((acc, w) => acc + w.sections.length, 0);
  const overallProgress = Math.round((completedSections.size / totalSections) * 100);

  return (
    <aside className={`${
      showSidebar ? 'translate-x-0' : '-translate-x-full'
    } fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-300 flex flex-col shadow-md md:w-72 lg:w-80`}>
      <div className="p-3 border-b border-gray-200 bg-gray-100">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-gray-900">Course Content</h2>
          <button
            onClick={() => setShowSidebar(false)}
            className="text-gray-600 hover:bg-gray-200 rounded-md p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {cohort && (
          <div className="flex items-center gap-1 text-gray-600 text-sm">
            <User className="w-4 h-4" />
            <span>{cohort.name}</span>
          </div>
        )}
      </div>
      <div className="p-3 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Overall Progress</span>
          <span className="font-semibold text-gray-900">{overallProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-gray-800 h-1.5 rounded-full transition-all"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {course.weeks.map((week, weekIndex) => (
          <div
            key={week.id}
            className="bg-white rounded-md border border-gray-200 overflow-hidden"
          >
            <button
              onClick={() => toggleWeek(week.id)}
              className="w-full flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 transition text-sm"
            >
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-gray-800" />
                <h3 className="font-semibold text-gray-900">{week.title}</h3>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${
                expandedWeeks[week.id] ? 'rotate-180' : ''
              }`} />
            </button>
            {expandedWeeks[week.id] && (
              <div className="p-1 space-y-1">
                {week.sections.map((section, sectionIndex) => {
                  const isActive = weekIndex === currentWeekIndex && sectionIndex === currentSectionIndex;
                  const isCompleted = completedSections.has(`${week.id}_${section.id}`);
                  return (
                    <button
                      key={section.id}
                      onClick={() => goToSection(weekIndex, sectionIndex)}
                      className={`w-full text-left px-2 py-1 rounded-md transition-all flex items-center gap-1 text-sm ${
                        isActive
                          ? 'bg-gray-100 text-gray-900 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span className="flex-1 truncate">{section.title}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => navigate('/ehub')}
            className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-all font-medium text-xs"
          >
            <Home className="w-4 h-4" />
            <span>EHub</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-all font-medium text-xs"
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Settings</span>
          </button>
          <button
            onClick={onOpenNotifications}
            className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-all font-medium text-xs"
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </button>
        </div>
      </div>
    </aside>
  );
}