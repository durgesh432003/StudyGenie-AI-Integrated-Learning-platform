/**
 * Integration Tests for AI Study Material Generator
 * 
 * This file contains integration tests that verify the interaction between
 * different components and services of the application.
 */

// Import necessary dependencies
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { inngest } from '@/inngest/client';
import { db } from '@/configs/db';
import { courseOutlineAIModel } from '@/configs/AiModel';

// Mock dependencies
jest.mock('axios');
jest.mock('uuid');
jest.mock('@/inngest/client', () => ({
  inngest: {
    send: jest.fn().mockResolvedValue({ id: 'test-event-id' })
  }
}));
jest.mock('@/configs/db', () => ({
  db: {
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([{ id: 1, courseId: 'test-uuid' }]),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
  }
}));
jest.mock('@/configs/AiModel', () => ({
  courseOutlineAIModel: {
    sendMessage: jest.fn()
  }
}));

// Import components and API handlers to test
import CreateCourse from '@/app/create/page';
import { POST as generateCourseOutlineHandler } from '@/app/api/generate-course-outline/route';
import { GenerateCourseOutline } from '@/inngest/functions';

// Integration test for course creation flow
describe('Course Creation Flow Integration', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    uuidv4.mockReturnValue('test-uuid');
  });
  
  test('complete course creation flow from UI to API to background job', async () => {
    // Mock API response
    axios.post.mockResolvedValue({ 
      data: { 
        success: true, 
        message: "Course generation started",
        courseId: 'test-uuid'
      } 
    });
    
    // Render the create course page
    render(<CreateCourse />);
    
    // Wait for lazy-loaded component
    await waitFor(() => {
      expect(screen.getByText('For which purpose you want to generate study material')).toBeInTheDocument();
    });
    
    // Select a study type
    fireEvent.click(screen.getByText('Exam'));
    
    // Go to next step
    fireEvent.click(screen.getByText('Next'));
    
    // Wait for lazy-loaded component
    await waitFor(() => {
      expect(screen.getByText('Enter the topic or paste the content for which you want to generate study material')).toBeInTheDocument();
    });
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Start writing here'), {
      target: { value: 'JavaScript Fundamentals' }
    });
    
    // Open difficulty dropdown and select a difficulty
    fireEvent.click(screen.getByText('Difficulty Level'));
    fireEvent.click(screen.getByText('Moderate'));
    
    // Click generate
    fireEvent.click(screen.getByText('Generate'));
    
    // Verify API call
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/generate-course-outline', {
        courseId: 'test-uuid',
        courseType: 'Exam',
        topic: 'JavaScript Fundamentals',
        difficultyLevel: 'Moderate',
        createdBy: expect.any(String)
      });
    });
    
    // Now test the API handler directly
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        courseId: 'test-uuid',
        courseType: 'Exam',
        topic: 'JavaScript Fundamentals',
        difficultyLevel: 'Moderate',
        createdBy: 'test@example.com'
      })
    };
    
    const response = await generateCourseOutlineHandler(mockRequest);
    const responseData = await response.json();
    
    // Verify database insertion
    expect(db.insert).toHaveBeenCalled();
    expect(db.values).toHaveBeenCalledWith({
      courseId: 'test-uuid',
      courseType: 'Exam',
      topic: 'JavaScript Fundamentals',
      difficultyLevel: 'Moderate',
      createdBy: 'test@example.com',
      status: 'Initializing',
      courseLayout: {}
    });
    
    // Verify Inngest event was sent
    expect(inngest.send).toHaveBeenCalledWith({
      name: 'course.generate-outline',
      data: expect.objectContaining({
        courseId: 'test-uuid',
        topic: 'JavaScript Fundamentals',
        courseType: 'Exam',
        difficultyLevel: 'Moderate',
        createdBy: 'test@example.com',
        dbRecordId: expect.any(Number)
      })
    });
    
    // Verify API response
    expect(responseData).toEqual({
      success: true,
      message: 'Course generation started',
      courseId: 'test-uuid'
    });
    
    // Now test the Inngest function
    // Mock the step object
    const mockStep = {
      run: jest.fn().mockImplementation((name, fn) => fn())
    };
    
    // Mock AI response
    courseOutlineAIModel.sendMessage.mockResolvedValue({
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
            }
          ]
        })
      }
    });
    
    // Call the Inngest function
    await GenerateCourseOutline({
      event: {
        data: {
          courseId: 'test-uuid',
          topic: 'JavaScript Fundamentals',
          courseType: 'Exam',
          difficultyLevel: 'Moderate',
          createdBy: 'test@example.com',
          dbRecordId: 1
        }
      },
      step: mockStep
    });
    
    // Verify AI model was called
    expect(courseOutlineAIModel.sendMessage).toHaveBeenCalledWith(expect.stringContaining('JavaScript Fundamentals'));
    
    // Verify database was updated with AI result
    expect(db.update).toHaveBeenCalled();
    expect(db.set).toHaveBeenCalledWith({
      courseLayout: expect.objectContaining({
        title: 'JavaScript Fundamentals',
        chapters: expect.any(Array)
      }),
      status: 'Generating'
    });
    
    // Verify notes generation was triggered
    expect(mockStep.run).toHaveBeenCalledWith('Trigger Notes Generation', expect.any(Function));
    expect(inngest.send).toHaveBeenCalledWith({
      name: 'notes.generate',
      data: expect.objectContaining({
        courseId: expect.any(String)
      })
    });
  });
  
  test('handles errors in course creation flow', async () => {
    // Mock API error
    axios.post.mockRejectedValue(new Error('API Error'));
    
    // Render the create course page
    render(<CreateCourse />);
    
    // Wait for lazy-loaded component
    await waitFor(() => {
      expect(screen.getByText('For which purpose you want to generate study material')).toBeInTheDocument();
    });
    
    // Select a study type
    fireEvent.click(screen.getByText('Exam'));
    
    // Go to next step
    fireEvent.click(screen.getByText('Next'));
    
    // Wait for lazy-loaded component
    await waitFor(() => {
      expect(screen.getByText('Enter the topic or paste the content for which you want to generate study material')).toBeInTheDocument();
    });
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Start writing here'), {
      target: { value: 'JavaScript Fundamentals' }
    });
    
    // Click generate
    fireEvent.click(screen.getByText('Generate'));
    
    // Verify error handling
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error generating course:', expect.any(Error));
    });
    
    // Now test API handler error handling
    const mockRequest = {
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
    };
    
    const response = await generateCourseOutlineHandler(mockRequest);
    const responseData = await response.json();
    
    expect(responseData).toEqual({
      error: 'Internal Server Error',
      details: 'Invalid JSON'
    });
    
    // Test Inngest function error handling
    courseOutlineAIModel.sendMessage.mockRejectedValue(new Error('AI Model Error'));
    
    // Mock the step object
    const mockStep = {
      run: jest.fn().mockImplementation((name, fn) => {
        if (name === 'Generate Course Outline with AI') {
          throw new Error('AI Model Error');
        }
        return fn();
      })
    };
    
    // Expect the function to throw
    await expect(GenerateCourseOutline({
      event: {
        data: {
          courseId: 'test-uuid',
          topic: 'JavaScript Fundamentals',
          courseType: 'Exam',
          difficultyLevel: 'Moderate',
          createdBy: 'test@example.com',
          dbRecordId: 1
        }
      },
      step: mockStep
    })).rejects.toThrow('AI Model Error');
    
    // Verify error status was set in database
    expect(db.update).toHaveBeenCalled();
    expect(db.set).toHaveBeenCalledWith({
      status: 'Error'
    });
  });
});