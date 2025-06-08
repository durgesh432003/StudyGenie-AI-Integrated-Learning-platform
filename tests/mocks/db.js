
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
    