/**
 * End-to-End Tests for Dashboard
 * 
 * This file contains Playwright tests for the dashboard functionality.
 */

const { test, expect } = require('@playwright/test');

// Test dashboard course listing
test('dashboard displays user courses correctly', async ({ page }) => {
  // Mock authentication
  await mockAuthentication(page);
  
  // Mock API response for courses
  await page.route('/api/courses', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        courses: [
          {
            courseId: 'course-1',
            courseType: 'Exam',
            topic: 'JavaScript Fundamentals',
            difficultyLevel: 'Moderate',
            status: 'Ready',
            courseLayout: {
              title: 'JavaScript Fundamentals',
              summary: 'A comprehensive course on JavaScript basics',
              chapters: [
                {
                  title: 'Introduction to JavaScript',
                  summary: 'Basic introduction to JavaScript',
                  emoji: '👋',
                  topics: ['History of JavaScript', 'Setting up environment']
                }
              ]
            }
          },
          {
            courseId: 'course-2',
            courseType: 'Practice',
            topic: 'React Hooks',
            difficultyLevel: 'Hard',
            status: 'Generating',
            courseLayout: {
              title: 'React Hooks',
              summary: 'Master React Hooks',
              chapters: []
            }
          }
        ]
      })
    });
  });
  
  // Navigate to the dashboard
  await page.goto('/dashboard');
  
  // Verify page title
  const pageTitle = await page.textContent('h1');
  expect(pageTitle).toContain('Dashboard');
  
  // Verify courses are displayed
  await expect(page.locator('text=JavaScript Fundamentals')).toBeVisible();
  await expect(page.locator('text=React Hooks')).toBeVisible();
  
  // Verify course status is displayed correctly
  await expect(page.locator('text=Ready')).toBeVisible();
  await expect(page.locator('text=Generating')).toBeVisible();
});

// Test course filtering
test('dashboard allows filtering courses', async ({ page }) => {
  // Mock authentication
  await mockAuthentication(page);
  
  // Mock API response for courses
  await page.route('/api/courses', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        courses: [
          {
            courseId: 'course-1',
            courseType: 'Exam',
            topic: 'JavaScript Fundamentals',
            difficultyLevel: 'Moderate',
            status: 'Ready',
            courseLayout: {
              title: 'JavaScript Fundamentals',
              summary: 'A comprehensive course on JavaScript basics',
              chapters: []
            }
          },
          {
            courseId: 'course-2',
            courseType: 'Practice',
            topic: 'React Hooks',
            difficultyLevel: 'Hard',
            status: 'Ready',
            courseLayout: {
              title: 'React Hooks',
              summary: 'Master React Hooks',
              chapters: []
            }
          },
          {
            courseId: 'course-3',
            courseType: 'Job Interview',
            topic: 'System Design',
            difficultyLevel: 'Hard',
            status: 'Ready',
            courseLayout: {
              title: 'System Design',
              summary: 'Prepare for system design interviews',
              chapters: []
            }
          }
        ]
      })
    });
  });
  
  // Navigate to the dashboard
  await page.goto('/dashboard');
  
  // Verify all courses are initially displayed
  await expect(page.locator('text=JavaScript Fundamentals')).toBeVisible();
  await expect(page.locator('text=React Hooks')).toBeVisible();
  await expect(page.locator('text=System Design')).toBeVisible();
  
  // Filter by search term
  await page.fill('input[placeholder="Search..."]', 'JavaScript');
  
  // Verify only matching courses are displayed
  await expect(page.locator('text=JavaScript Fundamentals')).toBeVisible();
  await expect(page.locator('text=React Hooks')).not.toBeVisible();
  await expect(page.locator('text=System Design')).not.toBeVisible();
  
  // Clear search and filter by course type
  await page.fill('input[placeholder="Search..."]', '');
  await page.selectOption('select', 'Job Interview');
  
  // Verify only matching courses are displayed
  await expect(page.locator('text=JavaScript Fundamentals')).not.toBeVisible();
  await expect(page.locator('text=React Hooks')).not.toBeVisible();
  await expect(page.locator('text=System Design')).toBeVisible();
});

// Test course navigation
test('clicking on a course navigates to course detail page', async ({ page }) => {
  // Mock authentication
  await mockAuthentication(page);
  
  // Mock API response for courses
  await page.route('/api/courses', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        courses: [
          {
            courseId: 'course-1',
            courseType: 'Exam',
            topic: 'JavaScript Fundamentals',
            difficultyLevel: 'Moderate',
            status: 'Ready',
            courseLayout: {
              title: 'JavaScript Fundamentals',
              summary: 'A comprehensive course on JavaScript basics',
              chapters: []
            }
          }
        ]
      })
    });
  });
  
  // Navigate to the dashboard
  await page.goto('/dashboard');
  
  // Click on a course
  await page.click('text=JavaScript Fundamentals');
  
  // Verify navigation to course detail page
  await page.waitForURL('/course/course-1');
});

// Test empty state
test('dashboard shows empty state when no courses', async ({ page }) => {
  // Mock authentication
  await mockAuthentication(page);
  
  // Mock empty API response for courses
  await page.route('/api/courses', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        courses: []
      })
    });
  });
  
  // Navigate to the dashboard
  await page.goto('/dashboard');
  
  // Verify empty state message
  await expect(page.locator('text=No courses found')).toBeVisible();
  
  // Verify create course button is displayed
  await expect(page.locator('text=Create New Course')).toBeVisible();
});

// Test error handling
test('dashboard handles API errors gracefully', async ({ page }) => {
  // Mock authentication
  await mockAuthentication(page);
  
  // Mock API error
  await page.route('/api/courses', route => {
    route.fulfill({
      status: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    });
  });
  
  // Navigate to the dashboard
  await page.goto('/dashboard');
  
  // Verify error message
  await expect(page.locator('text=Failed to load courses')).toBeVisible();
  
  // Verify retry button is displayed
  await expect(page.locator('text=Retry')).toBeVisible();
  
  // Test retry functionality
  // Mock successful response for retry
  await page.route('/api/courses', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        courses: [
          {
            courseId: 'course-1',
            courseType: 'Exam',
            topic: 'JavaScript Fundamentals',
            difficultyLevel: 'Moderate',
            status: 'Ready',
            courseLayout: {
              title: 'JavaScript Fundamentals',
              summary: 'A comprehensive course on JavaScript basics',
              chapters: []
            }
          }
        ]
      })
    });
  }, { times: 1 });
  
  // Click retry
  await page.click('text=Retry');
  
  // Verify courses are now displayed
  await expect(page.locator('text=JavaScript Fundamentals')).toBeVisible();
});

// Helper function to mock authentication
async function mockAuthentication(page) {
  // Mock Clerk authentication
  await page.addInitScript(() => {
    window.localStorage.setItem('clerk-user', JSON.stringify({
      id: 'user_123',
      firstName: 'Test',
      lastName: 'User',
      primaryEmailAddress: {
        emailAddress: 'test@example.com'
      }
    }));
    
    // Mock Clerk hooks
    window.useUser = () => ({
      user: {
        id: 'user_123',
        firstName: 'Test',
        lastName: 'User',
        primaryEmailAddress: {
          emailAddress: 'test@example.com'
        }
      },
      isSignedIn: true,
      isLoaded: true
    });
  });
}