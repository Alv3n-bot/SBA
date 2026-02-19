#!/usr/bin/env node

/**
 * Course Content Import Script
 * 
 * This script imports course content from JSON into Firestore
 * Uses the EXACT same structure as your CourseBuilder UI
 * 
 * Usage:
 *   node import-course.js <json-file> <course-id> [--replace]
 * 
 * Example:
 *   node import-course.js week0-sample.json fullstack-2026
 *   node import-course.js week0-sample.json fullstack-2026 --replace
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
if (args.length < 2) {
  console.log(`${colors.red}❌ Error: Missing required arguments${colors.reset}`);
  console.log(`\nUsage: node import-course.js <json-file> <course-id> [--replace]\n`);
  console.log(`Examples:`);
  console.log(`  node import-course.js week0-sample.json fullstack-2026`);
  console.log(`  node import-course.js week0-sample.json fullstack-2026 --replace\n`);
  process.exit(1);
}

const jsonFile = args[0];
const courseId = args[1];
const replaceMode = args.includes('--replace');

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

// Read and parse JSON file
console.log(`${colors.cyan}📖 Reading JSON file: ${jsonFile}${colors.reset}`);

if (!fs.existsSync(jsonFile)) {
  console.log(`${colors.red}❌ Error: File not found: ${jsonFile}${colors.reset}`);
  process.exit(1);
}

let jsonData;
try {
  const fileContent = fs.readFileSync(jsonFile, 'utf8');
  jsonData = JSON.parse(fileContent);
  console.log(`${colors.green}✓ JSON parsed successfully${colors.reset}\n`);
} catch (error) {
  console.log(`${colors.red}❌ Error parsing JSON: ${error.message}${colors.reset}`);
  process.exit(1);
}

// Validate JSON structure
if (!jsonData.weeks || !Array.isArray(jsonData.weeks)) {
  console.log(`${colors.red}❌ Error: JSON must have a "weeks" array${colors.reset}`);
  process.exit(1);
}

// Generate timestamp-based IDs (matching your CourseBuilder logic)
function generateWeekId() {
  return `week_${Date.now()}`;
}

function generateSectionId() {
  return `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateBlockId() {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Transform JSON to Firestore structure
function transformContent(jsonContent) {
  const content = [];
  
  for (const block of jsonContent) {
    const transformedBlock = {
      id: generateBlockId(),
      type: block.type,
      createdAt: new Date().toISOString(),
      ...block
    };
    
    // Remove the duplicate type field if it exists in the spread
    delete transformedBlock.id; // Remove to re-add with proper ID
    transformedBlock.id = generateBlockId();
    
    content.push(transformedBlock);
    
    // Small delay to ensure unique timestamps
    const waitTime = Date.now();
    while (Date.now() - waitTime < 2) { /* wait */ }
  }
  
  return content;
}

function transformSections(jsonSections) {
  const sections = [];
  
  for (let i = 0; i < jsonSections.length; i++) {
    const section = jsonSections[i];
    
    const transformedSection = {
      id: generateSectionId(),
      title: section.title || `Section ${i + 1}`,
      description: section.description || '',
      order: i,
      content: transformContent(section.content || [])
    };
    
    sections.push(transformedSection);
    
    // Small delay to ensure unique timestamps
    const waitTime = Date.now();
    while (Date.now() - waitTime < 5) { /* wait */ }
  }
  
  return sections;
}

function transformWeeks(jsonWeeks) {
  const weeks = [];
  
  for (let i = 0; i < jsonWeeks.length; i++) {
    const week = jsonWeeks[i];
    
    const transformedWeek = {
      id: generateWeekId(),
      title: week.title || `Week ${i + 1}`,
      description: week.description || '',
      order: i,
      sections: transformSections(week.sections || []),
      published: week.published || false
    };
    
    weeks.push(transformedWeek);
    
    // Small delay to ensure unique timestamps
    const waitTime = Date.now();
    while (Date.now() - waitTime < 10) { /* wait */ }
  }
  
  return weeks;
}

// Main import function
async function importCourse() {
  console.log(`${colors.blue}════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}📦 COURSE IMPORT${colors.reset}`);
  console.log(`${colors.blue}════════════════════════════════════════════${colors.reset}\n`);
  
  console.log(`Course ID: ${colors.cyan}${courseId}${colors.reset}`);
  console.log(`JSON File: ${colors.cyan}${jsonFile}${colors.reset}`);
  console.log(`Mode: ${colors.cyan}${replaceMode ? 'REPLACE' : 'MERGE'}${colors.reset}\n`);
  
  try {
    // Check if course exists
    const courseRef = db.collection('courses').doc(courseId);
    const courseDoc = await courseRef.get();
    
    let existingCourse = null;
    if (courseDoc.exists) {
      existingCourse = courseDoc.data();
      console.log(`${colors.yellow}⚠️  Course already exists${colors.reset}`);
      
      if (replaceMode) {
        console.log(`${colors.yellow}📝 Replace mode: Will replace weeks with same title${colors.reset}\n`);
      } else {
        console.log(`${colors.green}📝 Merge mode: Will add new weeks${colors.reset}\n`);
      }
    } else {
      console.log(`${colors.green}✨ Creating new course${colors.reset}\n`);
    }
    
    // Transform JSON weeks
    console.log(`${colors.cyan}🔄 Transforming course structure...${colors.reset}`);
    const newWeeks = transformWeeks(jsonData.weeks);
    console.log(`${colors.green}✓ Transformed ${newWeeks.length} week(s)${colors.reset}`);
    
    let totalSections = 0;
    let totalBlocks = 0;
    newWeeks.forEach(week => {
      totalSections += week.sections.length;
      week.sections.forEach(section => {
        totalBlocks += section.content.length;
      });
    });
    
    console.log(`${colors.green}✓ Total sections: ${totalSections}${colors.reset}`);
    console.log(`${colors.green}✓ Total content blocks: ${totalBlocks}${colors.reset}\n`);
    
    // Prepare course data
    let finalWeeks = newWeeks;
    
    if (existingCourse && !replaceMode) {
      // Merge mode: append new weeks
      finalWeeks = [...(existingCourse.weeks || []), ...newWeeks];
      console.log(`${colors.yellow}📝 Merging with ${existingCourse.weeks?.length || 0} existing week(s)${colors.reset}`);
    } else if (existingCourse && replaceMode) {
      // Replace mode: replace weeks with matching titles
      const existingWeeks = existingCourse.weeks || [];
      const newWeekTitles = new Set(newWeeks.map(w => w.title));
      
      finalWeeks = [
        ...existingWeeks.filter(w => !newWeekTitles.has(w.title)),
        ...newWeeks
      ];
      
      console.log(`${colors.yellow}📝 Replaced/added ${newWeeks.length} week(s)${colors.reset}`);
    }
    
    // Update order
    finalWeeks.forEach((week, index) => {
      week.order = index;
    });
    
    // Prepare final course document
    const courseData = {
      id: courseId,
      title: jsonData.courseTitle || existingCourse?.title || "New Course",
      description: jsonData.courseDescription || existingCourse?.description || "",
      weeks: finalWeeks,
      settings: existingCourse?.settings || {
        allowLateSubmissions: true,
        lateSubmissionPenalty: 10,
        gradeScale: 'percentage'
      },
      updatedAt: new Date().toISOString(),
      ...(existingCourse ? {} : { createdAt: new Date().toISOString() })
    };
    
    // Save to Firestore
    console.log(`\n${colors.cyan}💾 Saving to Firestore...${colors.reset}`);
    await courseRef.set(courseData, { merge: false });
    
    console.log(`${colors.green}✓ Course saved successfully!${colors.reset}\n`);
    
    // Summary
    console.log(`${colors.blue}════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.green}✅ IMPORT COMPLETE${colors.reset}`);
    console.log(`${colors.blue}════════════════════════════════════════════${colors.reset}\n`);
    
    console.log(`Course: ${colors.cyan}${courseData.title}${colors.reset}`);
    console.log(`Total weeks: ${colors.cyan}${finalWeeks.length}${colors.reset}`);
    console.log(`Total sections: ${colors.cyan}${totalSections}${colors.reset}`);
    console.log(`Total content blocks: ${colors.cyan}${totalBlocks}${colors.reset}\n`);
    
    console.log(`${colors.green}✨ You can now view this course in your CourseBuilder!${colors.reset}\n`);
    
  } catch (error) {
    console.log(`\n${colors.red}❌ Error importing course: ${error.message}${colors.reset}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the import
importCourse()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  });