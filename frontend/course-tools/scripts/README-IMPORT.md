# Course Content Import/Export System

Bulk import and export course content between JSON files and Firestore.

## 🎯 What This Does

- **Import**: Read JSON → Create weeks/sections/content in Firestore (matches your CourseBuilder structure exactly)
- **Export**: Read Firestore → Output clean JSON for editing/backup
- **No Breaking Changes**: Uses your existing Firestore structure with timestamp-based IDs

---

## 📋 Prerequisites

- Node.js installed (v14 or higher)
- Firebase project with Firestore database
- Firebase Admin SDK service account key

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon (⚙️) → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the downloaded file as `serviceAccountKey.json` in this directory

**Important**: Add `serviceAccountKey.json` to your `.gitignore` file! Never commit credentials.

### Step 3: Prepare Your JSON File

Use the provided `week0-sample.json` as a template, or create your own following the structure below.

---

## 📖 Usage

### Import Course Content

**Basic Import (creates new weeks):**
```bash
node import-course.js week0-sample.json your-course-id
```

**Replace Mode (replaces weeks with matching titles):**
```bash
node import-course.js week0-sample.json your-course-id --replace
```

**Using npm scripts:**
```bash
npm run import week0-sample.json your-course-id
```

### Export Course Content

**Export to auto-generated filename:**
```bash
node export-course.js your-course-id
```

**Export to specific filename:**
```bash
node export-course.js your-course-id my-backup.json
```

**Using npm scripts:**
```bash
npm run export your-course-id output.json
```

---

## 📝 JSON Structure

Your JSON file must follow this structure:

```json
{
  "courseId": "optional-id",
  "courseTitle": "Your Course Title",
  "courseDescription": "Course description",
  "weeks": [
    {
      "title": "Week 1: Introduction",
      "description": "Week description",
      "published": false,
      "sections": [
        {
          "title": "Lesson 1: Getting Started",
          "description": "Lesson description",
          "content": [
            {
              "type": "heading",
              "level": 2,
              "text": "Welcome!"
            },
            {
              "type": "text",
              "content": "This is a paragraph."
            },
            {
              "type": "video",
              "url": "https://youtube.com/...",
              "title": "Video Title",
              "description": "Video description"
            },
            {
              "type": "image",
              "url": "https://example.com/image.jpg",
              "alt": "Alt text",
              "caption": "Image caption"
            },
            {
              "type": "link",
              "url": "https://example.com",
              "text": "Link text",
              "openNewTab": true
            },
            {
              "type": "list",
              "ordered": false,
              "items": ["Item 1", "Item 2", "Item 3"]
            },
            {
              "type": "code",
              "language": "javascript",
              "code": "console.log('Hello World');"
            },
            {
              "type": "assignment",
              "title": "Assignment Title",
              "description": "Assignment description",
              "dueDate": "2026-12-31T23:59:00",
              "points": 100,
              "submissionType": "text"
            },
            {
              "type": "quiz",
              "title": "Quiz Title",
              "timeLimit": 30,
              "attempts": 1,
              "questions": []
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 🎨 Supported Content Block Types

### 1. Heading
```json
{
  "type": "heading",
  "level": 2,
  "text": "Section Title"
}
```

### 2. Text
```json
{
  "type": "text",
  "content": "Paragraph content here"
}
```

### 3. Video
```json
{
  "type": "video",
  "url": "https://youtube.com/watch?v=...",
  "title": "Video Title",
  "description": "Optional description"
}
```

### 4. Image
```json
{
  "type": "image",
  "url": "https://example.com/image.jpg",
  "alt": "Alt text for accessibility",
  "caption": "Optional caption"
}
```

### 5. Link
```json
{
  "type": "link",
  "url": "https://example.com",
  "text": "Click here",
  "openNewTab": true
}
```

### 6. List
```json
{
  "type": "list",
  "ordered": false,
  "items": ["Item 1", "Item 2", "Item 3"]
}
```

### 7. Code
```json
{
  "type": "code",
  "language": "javascript",
  "code": "const x = 10;\nconsole.log(x);"
}
```

### 8. Assignment
```json
{
  "type": "assignment",
  "title": "Assignment Title",
  "description": "What students need to do",
  "dueDate": "2026-12-31T23:59:00",
  "points": 100,
  "submissionType": "text"
}
```

### 9. Quiz
```json
{
  "type": "quiz",
  "title": "Quiz Title",
  "timeLimit": 30,
  "attempts": 1,
  "questions": []
}
```

---

## 💡 How It Works

### Import Process

1. **Reads JSON file** - Parses your course structure
2. **Generates IDs** - Creates timestamp-based IDs matching your CourseBuilder:
   - `week_${timestamp}`
   - `section_${timestamp}_${random}`
   - `block_${timestamp}_${random}`
3. **Transforms structure** - Converts JSON to exact Firestore format
4. **Saves to Firestore** - Uses `setDoc()` just like your CourseBuilder

### Export Process

1. **Fetches from Firestore** - Gets complete course data
2. **Cleans metadata** - Removes internal IDs and timestamps
3. **Outputs JSON** - Creates human-readable, editable file

---

## 🔄 Typical Workflow

### Creating New Course Content

```bash
# 1. Edit JSON file
nano week0-sample.json

# 2. Import to Firestore
node import-course.js week0-sample.json fullstack-2026

# 3. Refresh CourseBuilder in browser
# 4. Edit normally using your UI
```

### Backing Up Existing Course

```bash
# 1. Export from Firestore
node export-course.js fullstack-2026 backup.json

# 2. Commit to Git
git add backup.json
git commit -m "Backup course content"
git push
```

### Sharing Course with Another Instructor

```bash
# Instructor A:
node export-course.js my-course shared-course.json
# Send shared-course.json

# Instructor B:
node import-course.js shared-course.json their-course-id
```

---

## ⚠️ Important Notes

### What Gets Imported

- ✅ Week titles, descriptions, order
- ✅ Section titles, descriptions, order
- ✅ All content blocks with proper types
- ✅ Assignment details, due dates, points
- ✅ Quiz settings and questions

### What Doesn't Get Imported

- ❌ Student submissions (stays in separate collection)
- ❌ Grades (linked to submissions, not course content)
- ❌ Course settings (uses existing or defaults)
- ❌ Historical metadata (timestamps are regenerated)

### ID Generation

- IDs are generated on import: `week_1708123456789`
- Each import creates NEW IDs (not idempotent)
- If you import twice, you'll get duplicate weeks with different IDs
- Use `--replace` mode to replace weeks with matching titles

### Merge vs Replace Mode

**Merge Mode (default):**
- Adds new weeks to end of existing weeks
- Preserves all existing content
- Safe for adding content

**Replace Mode (`--replace`):**
- Matches weeks by title
- Replaces matched weeks
- Keeps unmatched weeks
- Use for updating specific weeks

---

## 🐛 Troubleshooting

### "serviceAccountKey.json not found"

**Solution**: Download your Firebase Admin SDK key and save it in the same directory as these scripts.

### "Course not found"

**Solution**: Check that your course ID exists in Firestore. Use the exact ID from your CourseBuilder URL.

### "Permission denied"

**Solution**: Make sure your service account has Firestore read/write permissions.

### Import creates duplicate weeks

**Solution**: Delete old weeks in CourseBuilder UI before importing, or use `--replace` mode.

### Content blocks not appearing

**Solution**: Check JSON structure matches examples. Ensure `type` field is spelled correctly.

---

## 📂 Files in This Package

- `import-course.js` - Import script
- `export-course.js` - Export script
- `week0-sample.json` - Sample course with 5 lessons
- `package.json` - NPM configuration
- `README-IMPORT.md` - This file
- `.env.example` - Environment variables template (if needed)

---

## 🎓 Example: Week 0 Import

```bash
# Import the provided sample
node import-course.js week0-sample.json your-course-id

# This creates:
# - 1 week: "Week 0: Onboarding & Foundations"
# - 5 sections (lessons)
# - ~30 content blocks (headings, text, videos, lists, code, assignments)
```

After import:
1. Open your CourseBuilder
2. You'll see Week 0 with all lessons
3. Edit using your existing modals
4. Auto-save works normally
5. All content blocks are draggable/editable

---

## 💾 Version Control Best Practices

```bash
# After making changes in CourseBuilder:
node export-course.js your-course-id backup.json
git add backup.json
git commit -m "Updated Week 0 lessons"
git push

# To restore:
node import-course.js backup.json your-course-id --replace
```

---

## 🚀 Advanced Usage

### Batch Import Multiple Courses

```bash
for course in week*.json; do
  node import-course.js "$course" my-course-id
done
```

### Validate JSON Before Import

```bash
# Use jq to validate JSON syntax
jq empty week0-sample.json
```

### Pretty Print Exports

Export already pretty-prints with 2-space indentation for readability.

---

## 📞 Support

If you encounter issues:
1. Check the JSON structure matches examples
2. Verify Firebase credentials are correct
3. Ensure course ID exists in Firestore
4. Check console output for specific error messages

---

## 🎉 You're Ready!

Start by importing the sample:
```bash
node import-course.js week0-sample.json test-course
```

Then check your CourseBuilder to see the imported content!