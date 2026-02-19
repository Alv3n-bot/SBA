    # 🚀 Quick Start Guide

Get up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click ⚙️ → **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Save as `serviceAccountKey.json` in this directory

## Step 3: Test Import

```bash
node import-course.js week0-sample.json test-course
```

✅ Check your CourseBuilder - you should see Week 0 with 5 lessons!

## Step 4: Test Export

```bash
node export-course.js test-course my-backup.json
```

✅ Check `my-backup.json` - you should see clean, editable JSON!

---

## Common Commands

### Import new content
```bash
node import-course.js week0-sample.json your-course-id
```

### Replace existing content
```bash
node import-course.js week0-sample.json your-course-id --replace
```

### Export for backup
```bash
node export-course.js your-course-id backup.json
```

---

## Next Steps

1. ✅ Import `week0-sample.json` to test
2. ✅ Edit content in your CourseBuilder UI
3. ✅ Export to backup your changes
4. ✅ Create your own JSON files for new weeks

---

## Need Help?

- Read full documentation: `README-IMPORT.md`
- Check JSON structure: `week0-sample.json`
- Verify Firebase setup: Make sure `serviceAccountKey.json` exists

---

## Your Workflow

```bash
# Create new course content from JSON
node import-course.js week1.json my-course

# Edit in CourseBuilder (your normal UI)
# ... use your modals, drag-drop, etc ...

# Backup to JSON
node export-course.js my-course week1-backup.json

# Commit to Git
git add week1-backup.json
git commit -m "Updated Week 1"
```

**Remember**: The UI is for daily editing, JSON is for bulk operations! 🎯