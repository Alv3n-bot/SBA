export default function SubmissionsView({
  submissions,
  editingGrade,
  gradeInput,
  setEditingGrade,
  setGradeInput,
  saveGrade,
  setSubmissionsMode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => setSubmissionsMode(false)}
          className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Back to Builder
        </button>
        <h2 className="text-2xl font-bold mb-6">Submitted Assignments</h2>
        {submissions.length > 0 ? (
          submissions.map((sub) => (
            <div key={sub.id} className="bg-white p-4 rounded-lg mb-4">
              <p>User ID: {sub.userId}</p>
              <p>Assignment Block: {sub.blockId}</p>
              <a href={sub.link} target="_blank" rel="noopener noreferrer">
                {sub.link}
              </a>
              {editingGrade === sub.id ? (
                <div>
                  <input
                    type="number"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    placeholder="Grade (0-100)"
                    className="px-2 py-1 border"
                  />
                  <button
                    onClick={() => saveGrade(sub.id, gradeInput)}
                    className="ml-2 px-2 py-1 bg-indigo-600 text-white rounded"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div>
                  <p>Grade: {sub.grade || 'Not graded'}</p>
                  <button
                    onClick={() => {
                      setEditingGrade(sub.id);
                      setGradeInput(sub.grade || '');
                    }}
                    className="text-indigo-600"
                  >
                    Grade
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No submissions yet.</p>
        )}
      </div>
    </div>
  );
}