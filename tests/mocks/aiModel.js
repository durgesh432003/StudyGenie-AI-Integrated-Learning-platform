
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
    