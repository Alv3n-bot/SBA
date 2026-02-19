#!/usr/bin/env node

/**
 * Course Content Export Script
 * 
 * This script exports course content from Firestore to JSON
 * Removes internal IDs and metadata for clean, editable output
 * 
 * Usage:
 *   node export-course.js <course-id> [output-file]
 * 
 * Example:
 *   node export-course.js fullstack-2026
 *   node export-course.js fullstack-2026 my-backup.json
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log(`${colors.red}❌ Error: Missing required argument${colors.reset}`);
  console.log(`\nUsage: node export-course.js <course-id> [output-file]\n`);
  console.log(`Examples:`);
  console.log(`  node export-course.js fullstack-2026`);
  console.log(`  node export-course.js fullstack-2026 my-backup.json\n`);
  process.exit(1);
}

const courseId = args[0];
const outputFile = args[1] || `${courseId}-export-${Date.now()}.json`;

// Initialize Firebase Admin
console.log(`${colors.cyan}🔧 Initializing Firebase...${colors.reset}`);

// Check for service account key
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.log(`${colors.red}❌ Error: serviceAccountKey.json not found${colors.reset}`);
  console.log(`\nPlease download your Firebase Admin SDK service account key:`);
  console.log(`1. Go to Firebase Console → Project Settings → Service Accounts`);
  console.log(`2. Click "Generate New Private Key"`);
  console.log(`3. Save as "serviceAccountKey.json" in the same directory as this script\n`);
  process.exit(1);
}

try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log(`${colors.green}✓ Firebase initialized${colors.reset}\n`);
} catch (error) {
  console.log(`${colors.red}❌ Error initializing Firebase: ${error.message}${colors.reset}`);
  process.exit(1);
}

const db = admin.firestore();

// Clean up content blocks (remove internal metadata)
function cleanContentBlock(block) {
  const cleaned = { ...block };
  
  // Remove internal fields
  delete cleaned.id;
  delete cleaned.createdAt;
  delete cleaned.updatedAt;
  
  return cleaned;
}

// Clean up sections
function cleanSection(section) {
  return {
    title: section.title,
    description: section.description || '',
    content: (section.content || []).map(cleanContentBlock)
  };
}

// Clean up weeks
function cleanWeek(week) {
  return {
    title: week.title,
    description: week.description || '',
    published: week.published || false,
    sections: (week.sections || []).map(cleanSection)
  };
}

// Main export function
async function exportCourse() {
  console.log(`${colors.blue}════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}📤 COURSE EXPORT${colors.reset}`);
  console.log(`${colors.blue}════════════════════════════════════════════${colors.reset}\n`);
  
  console.log(`Course ID: ${colors.cyan}${courseId}${colors.reset}`);
  console.log(`Output File: ${colors.cyan}${outputFile}${colors.reset}\n`);
  
  try {
    // Fetch course from Firestore
    console.log(`${colors.cyan}📖 Fetching course from Firestore...${colors.reset}`);
    const courseRef = db.collection('courses').doc(courseId);
    const courseDoc = await courseRef.get();
    
    if (!courseDoc.exists) {
      console.log(`${colors.red}❌ Error: Course not found: ${courseId}${colors.reset}`);
      process.exit(1);
    }
    
    const courseData = courseDoc.data();
    console.log(`${colors.green}✓ Course found: ${courseData.title}${colors.reset}\n`);
    
    // Calculate statistics
    const weeks = courseData.weeks || [];
    let totalSections = 0;
    let totalBlocks = 0;
    
    weeks.forEach(week => {
      totalSections += (week.sections || []).length;
      (week.sections || []).forEach(section => {
        totalBlocks += (section.content || []).length;
      });
    });
    
    console.log(`${colors.cyan}📊 Course Statistics:${colors.reset}`);
    console.log(`  Weeks: ${colors.cyan}${weeks.length}${colors.reset}`);
    console.log(`  Sections: ${colors.cyan}${totalSections}${colors.reset}`);
    console.log(`  Content Blocks: ${colors.cyan}${totalBlocks}${colors.reset}\n`);
    
    // Clean and transform data
    console.log(`${colors.cyan}🔄 Cleaning data for export...${colors.reset}`);
    
    const exportData = {
      courseId: courseId,
      courseTitle: courseData.title,
      courseDescription: courseData.description || '',
      exportedAt: new Date().toISOString(),
      weeks: weeks.map(cleanWeek)
    };
    
    console.log(`${colors.green}✓ Data cleaned${colors.reset}\n`);
    
    // Write to file
    console.log(`${colors.cyan}💾 Writing to file...${colors.reset}`);
    fs.writeFileSync(outputFile, JSON.stringify(exportData, null, 2), 'utf8');
    console.log(`${colors.green}✓ File written successfully${colors.reset}\n`);
    
    // Summary
    console.log(`${colors.blue}════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.green}✅ EXPORT COMPLETE${colors.reset}`);
    console.log(`${colors.blue}════════════════════════════════════════════${colors.reset}\n`);
    
    console.log(`Course: ${colors.cyan}${courseData.title}${colors.reset}`);
    console.log(`Output: ${colors.cyan}${outputFile}${colors.reset}`);
    console.log(`Size: ${colors.cyan}${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB${colors.reset}\n`);
    
    console.log(`${colors.green}✨ You can now edit this JSON file and re-import it!${colors.reset}\n`);
    
  } catch (error) {
    console.log(`\n${colors.red}❌ Error exporting course: ${error.message}${colors.reset}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the export
exportCourse()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  });