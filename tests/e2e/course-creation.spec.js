/**
 * End-to-End Tests for Course Creation Flow
 * 
 * This file contains Playwright tests for the course creation flow.
 */

const { test, expect } = require('@playwright/test');

// Test the complete course creation flow
test('complete course creation flow', async ({ page }) => {
  // Mock authentication
  await mockAuthentication(page);
  
  // Navigate to the create page
  await page.goto('/create');
  
  // Verify page title
  const pageTitle = await page.textContent('h2');
  expect(pageTitle).toContain('Start Building your Personal Study Material');
  
  // Wait for the SelectOption component to load
  await page.waitForSelector('text=For which purpose you want to generate study material');
  
  // Select "Exam" as the study type
  await page.click('text=Exam');
  
  // Click the Next button
  await page.click('text=Next');
  
  // Wait for the TopicInput component to load
  await page.waitForSelector('text=Enter the topic or paste the content for which you want to generate study material');
  
  // Enter a topic
  await page.fill('textarea', 'JavaScript Fundamentals');
  
  // Select difficulty level
  await page.click('text=Difficulty Level');
  await page.click('text=Moderate');
  
  // Click the Generate button
  await page.click('text=Generate');
  
  // Verify loading state
  await page.waitForSelector('text=Generating...');
  
  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard');
  
  // Verify toast notification
  const toastText = await page.textContent('.sonner-toast');
  expect(toastText).toContain('Your course is being generated');
});

// Test form validation
test('form validation prevents submission with missing fields', async ({ page }) => {
  // Mock authentication
  await mockAuthentication(page);
  
  // Navigate to the create page
  await page.goto('/create');
  
  // Wait for the SelectOption component to load
  await page.waitForSelector('text=For which purpose you want to generate study material');
  
  // Click the Next button without selecting a study type
  await page.click('text=Next');
  
  // Verify we're still on the first step (SelectOption component)
  await expect(page.locator('text=For which purpose you want to generate study material')).toBeVisible();
  
  // Select "Exam" as the study type
  await page.click('text=Exam');
  
  // Click the Next button
  await page.click('text=Next');
  
  // Wait for the TopicInput component to load
  await page.waitForSelector('text=Enter the topic or paste the content for which you want to generate study material');
  
  // Click the Generate button without entering a topic
  await page.click('text=Generate');
  
  // Verify we're still on the second step (TopicInput component)
  await expect(page.locator('text=Enter the topic or paste the content for which you want to generate study material')).toBeVisible();
});

// Test responsive design
test('responsive design adapts to different screen sizes', async ({ page }) => {
  // Mock authentication
  await mockAuthentication(page);
  
  // Test on mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/create');
  
  // Verify mobile layout
  const containerPaddingMobile = await page.evaluate(() => {
    const container = document.querySelector('.flex.flex-col.items-center');
    const computedStyle = window.getComputedStyle(container);
    return computedStyle.padding;
  });
  expect(containerPaddingMobile).toBe('5px');
  
  // Test on tablet viewport
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.reload();
  
  // Verify tablet layout
  const containerPaddingTablet = await page.evaluate(() => {
    const container = document.querySelector('.flex.flex-col.items-center');
    const computedStyle = window.getComputedStyle(container);
    return computedStyle.padding;
  });
  expect(containerPaddingTablet).toContain('24px');
  
  // Test on desktop viewport
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.reload();
  
  // Verify desktop layout
  const containerPaddingDesktop = await page.evaluate(() => {
    const container = document.querySelector('.flex.flex-col.items-center');
    const computedStyle = window.getComputedStyle(container);
    return computedStyle.padding;
  });
  expect(containerPaddingDesktop).toContain('36px');
});

// Test error handling
test('error handling during course generation', async ({ page }) => {
  // Mock authentication
  await mockAuthentication(page);
  
  // Mock API error
  await page.route('/api/generate-course-outline', route => {
    route.fulfill({
      status: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    });
  });
  
  // Navigate to the create page
  await page.goto('/create');
  
  // Wait for the SelectOption component to load
  await page.waitForSelector('text=For which purpose you want to generate study material');
  
  // Select "Exam" as the study type
  await page.click('text=Exam');
  
  // Click the Next button
  await page.click('text=Next');
  
  // Wait for the TopicInput component to load
  await page.waitForSelector('text=Enter the topic or paste the content for which you want to generate study material');
  
  // Enter a topic
  await page.fill('textarea', 'JavaScript Fundamentals');
  
  // Select difficulty level
  await page.click('text=Difficulty Level');
  await page.click('text=Moderate');
  
  // Click the Generate button
  await page.click('text=Generate');
  
  // Verify loading state appears
  await page.waitForSelector('text=Generating...');
  
  // Verify error toast appears
  await page.waitForSelector('text=Failed to generate course');
  
  // Verify we can try again (button is enabled again)
  await expect(page.locator('text=Generate')).toBeEnabled();
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