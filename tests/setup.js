/**
 * Test Setup for AI Study Material Generator
 * 
 * This file contains the setup for automated testing of the application.
 */

// Import necessary dependencies
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define test environment
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'test_clerk_key';
process.env.CLERK_SECRET_KEY = 'test_clerk_secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// Setup test database
function setupTestDatabase() {
  console.log('Setting up test database...');
  
  try {
    // Create test schema
    execSync('npx drizzle-kit generate:pg --schema=./configs/schema.js --out=./drizzle');
    
    // Push schema to test database
    execSync('npx drizzle-kit push:pg --schema=./configs/schema.js');
    
    console.log('Test database setup complete.');
  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  }
}

// Setup test environment
function setupTestEnvironment() {
  console.log('Setting up test environment...');
  
  try {
    // Create test directories if they don't exist
    const testDirs = [
      path.join(__dirname, 'results'),
      path.join(__dirname, 'fixtures'),
      path.join(__dirname, 'screenshots')
    ];
    
    testDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // Create test fixtures
    const testUsers = [
      { email: 'test1@example.com', name: 'Test User 1' },
      { email: 'test2@example.com', name: 'Test User 2' }
    ];
    
    fs.writeFileSync(
      path.join(__dirname, 'fixtures', 'users.json'),
      JSON.stringify(testUsers, null, 2)
    );
    
    const testCourses = [
      {
        courseId: 'test-course-1',
        courseType: 'Exam',
        topic: 'JavaScript Basics',
        difficultyLevel: 'Easy',
        createdBy: 'test1@example.com',
        status: 'Ready'
      },
      {
        courseId: 'test-course-2',
        courseType: 'Practice',
        topic: 'React Hooks',
        difficultyLevel: 'Moderate',
        createdBy: 'test1@example.com',
        status: 'Generating'
      }
    ];
    
    fs.writeFileSync(
      path.join(__dirname, 'fixtures', 'courses.json'),
      JSON.stringify(testCourses, null, 2)
    );
    
    console.log('Test environment setup complete.');
  } catch (error) {
    console.error('Error setting up test environment:', error);
    process.exit(1);
  }
}

// Setup mock services
function setupMockServices() {
  console.log('Setting up mock services...');
  
  try {
    // Create mock AI service
    const mockAiService = `
      module.exports = {
        sendMessage: async (prompt) => {
          console.log('Mock AI service received prompt:', prompt);
          
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Return mock response based on prompt
          if (prompt.includes('JavaScript')) {
            return {
              response: {
                text: () => JSON.stringify({
                  title: 'JavaScript Fundamentals',
                  summary: 'A comprehensive course on JavaScript basics',
                  chapters: [
                    {
                      title: 'Introduction to JavaScript',
                      summary: 'Basic introduction to JavaScript',
                      emoji: '👋',
                      topics: ['History of JavaScript', 'Setting up environment']
                    },
                    {
                      title: 'Variables and Data Types',
                      summary: 'Understanding variables and data types in JavaScript',
                      emoji: '📦',
                      topics: ['var, let, const', 'Primitive types', 'Objects and arrays']
                    }
                  ]
                })
              }
            };
          } else {
            return {
              response: {
                text: () => JSON.stringify({
                  title: 'Generic Course',
                  summary: 'A generic course on the requested topic',
                  chapters: [
                    {
                      title: 'Introduction',
                      summary: 'Basic introduction',
                      emoji: '👋',
                      topics: ['Overview', 'Getting started']
                    }
                  ]
                })
              }
            };
          }
        }
      };
    `;
    
    fs.writeFileSync(
      path.join(__dirname, 'mocks', 'aiModel.js'),
      mockAiService
    );
    
    // Create mock database service
    const mockDbService = `
      const { faker } = require('@faker-js/faker');
      
      const mockDb = {
        users: [],
        courses: [],
        chapterNotes: [],
        studyTypeContent: []
      };
      
      // Generate some mock data
      for (let i = 0; i < 5; i++) {
        mockDb.users.push({
          id: i + 1,
          userName: faker.person.fullName(),
          email: faker.internet.email(),
          isMember: faker.datatype.boolean(),
          customerId: faker.string.uuid()
        });
      }
      
      for (let i = 0; i < 10; i++) {
        const courseId = faker.string.uuid();
        mockDb.courses.push({
          id: i + 1,
          courseId,
          courseType: faker.helpers.arrayElement(['Exam', 'Job Interview', 'Practice', 'Coding Prep', 'Other']),
          topic: faker.lorem.words(3),
          difficultyLevel: faker.helpers.arrayElement(['Easy', 'Moderate', 'Hard']),
          courseLayout: {
            title: faker.lorem.words(3),
            summary: faker.lorem.paragraph(),
            chapters: Array.from({ length: 3 }, (_, j) => ({
              title: faker.lorem.words(3),
              summary: faker.lorem.sentence(),
              emoji: '📚',
              topics: Array.from({ length: 3 }, () => faker.lorem.words(2))
            }))
          },
          createdBy: mockDb.users[Math.floor(Math.random() * mockDb.users.length)].email,
          status: faker.helpers.arrayElement(['Initializing', 'Generating', 'Ready', 'Error'])
        });
        
        // Add chapter notes
        for (let j = 0; j < 3; j++) {
          mockDb.chapterNotes.push({
            id: mockDb.chapterNotes.length + 1,
            courseId,
            chapterId: (j + 1).toString(),
            notes: faker.lorem.paragraphs(3)
          });
        }
        
        // Add study type content
        mockDb.studyTypeContent.push({
          id: mockDb.studyTypeContent.length + 1,
          courseId,
          type: 'Flashcard',
          content: Array.from({ length: 5 }, () => ({
            question: faker.lorem.sentence(),
            answer: faker.lorem.paragraph()
          })),
          status: 'Ready'
        });
      }
      
      module.exports = {
        mockDb,
        select: () => ({
          from: (table) => ({
            where: (condition) => {
              // Simple mock implementation
              const tableName = table._.table;
              return mockDb[tableName].filter(row => {
                // Very basic condition evaluation
                const key = Object.keys(condition)[0];
                return row[key] === condition[key];
              });
            }
          })
        }),
        insert: (table) => ({
          values: (data) => ({
            returning: () => {
              const tableName = table._.table;
              const newId = mockDb[tableName].length + 1;
              const newRow = { id: newId, ...data };
              mockDb[tableName].push(newRow);
              return [newRow];
            }
          })
        }),
        update: (table) => ({
          set: (data) => ({
            where: (condition) => {
              const tableName = table._.table;
              const key = Object.keys(condition)[0];
              const rows = mockDb[tableName].filter(row => row[key] === condition[key]);
              rows.forEach(row => {
                Object.assign(row, data);
              });
              return rows;
            }
          })
        })
      };
    `;
    
    // Create mocks directory if it doesn't exist
    if (!fs.existsSync(path.join(__dirname, 'mocks'))) {
      fs.mkdirSync(path.join(__dirname, 'mocks'), { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(__dirname, 'mocks', 'db.js'),
      mockDbService
    );
    
    console.log('Mock services setup complete.');
  } catch (error) {
    console.error('Error setting up mock services:', error);
    process.exit(1);
  }
}

// Run setup
function runSetup() {
  setupTestEnvironment();
  setupMockServices();
  // Uncomment to set up a real test database
  // setupTestDatabase();
  
  console.log('Test setup complete. Ready to run tests.');
}

// Export setup function
module.exports = {
  runSetup
};

// Run setup if this file is executed directly
if (require.main === module) {
  runSetup();
}