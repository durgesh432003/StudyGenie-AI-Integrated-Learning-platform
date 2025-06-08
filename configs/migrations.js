import { db } from './db';

/**
 * This file contains database migrations to add indexes for performance optimization
 * Run this file manually when needed to add indexes to the database
 */
export async function addDatabaseIndexes() {
  try {
    console.log('Adding database indexes for performance optimization...');
    
    // Add index to STUDY_MATERIAL_TABLE for createdBy (for user's courses queries)
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_study_material_created_by 
      ON "studyMaterial" ("createdBy");
    `);
    
    // Add index to STUDY_MATERIAL_TABLE for courseId (frequently queried)
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_study_material_course_id 
      ON "studyMaterial" ("courseId");
    `);
    
    // Add index to CHAPTER_NOTES_TABLE for courseId (for fetching all chapters of a course)
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_chapter_notes_course_id 
      ON "chapterNotes" ("courseId");
    `);
    
    // Add index to STUDY_TYPE_CONTENT_TABLE for courseId (for fetching content by course)
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_study_type_content_course_id 
      ON "studyTypeContent" ("courseId");
    `);
    
    // Add index to USER_TABLE for email (frequently queried)
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_users_email 
      ON "users" ("email");
    `);
    
    console.log('Database indexes added successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error adding database indexes:', error);
    return { success: false, error };
  }
}