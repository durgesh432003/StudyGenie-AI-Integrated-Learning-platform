/**
 * Unit Tests for AI Study Material Generator
 * 
 * This file contains unit tests for key components and functions.
 * To run these tests, you would need to set up Jest or another testing framework.
 */

// Import necessary dependencies
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Mock dependencies
jest.mock('axios');
jest.mock('uuid');
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: {
      primaryEmailAddress: {
        emailAddress: 'test@example.com'
      }
    }
  })
}));
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn()
  })
}));
jest.mock('sonner', () => ({
  toast: jest.fn()
}));

// Import components to test
import CreateCourse from '@/app/create/page';
import SelectOption from '@/app/create/_components/SelectOption';
import TopicInput from '@/app/create/_components/TopicInput';

// Unit tests for SelectOption component
describe('SelectOption Component', () => {
  test('renders all study type options', () => {
    const mockSelectedStudyType = jest.fn();
    render(<SelectOption selectedStudyType={mockSelectedStudyType} />);
    
    expect(screen.getByText('Exam')).toBeInTheDocument();
    expect(screen.getByText('Job Interview')).toBeInTheDocument();
    expect(screen.getByText('Practice')).toBeInTheDocument();
    expect(screen.getByText('Coding Prep')).toBeInTheDocument();
    expect(screen.getByText('Other')).toBeInTheDocument();
  });
  
  test('calls selectedStudyType when an option is clicked', () => {
    const mockSelectedStudyType = jest.fn();
    render(<SelectOption selectedStudyType={mockSelectedStudyType} />);
    
    fireEvent.click(screen.getByText('Exam'));
    expect(mockSelectedStudyType).toHaveBeenCalledWith('Exam');
  });
  
  test('applies selected styling to chosen option', () => {
    const mockSelectedStudyType = jest.fn();
    render(<SelectOption selectedStudyType={mockSelectedStudyType} />);
    
    const examOption = screen.getByText('Exam').closest('div');
    fireEvent.click(examOption);
    
    expect(examOption).toHaveClass('border-primary');
  });
});

// Unit tests for TopicInput component
describe('TopicInput Component', () => {
  test('renders topic input field and difficulty selector', () => {
    const mockSetTopic = jest.fn();
    const mockSetDifficultyLevel = jest.fn();
    
    render(
      <TopicInput 
        setTopic={mockSetTopic} 
        setDifficultyLevel={mockSetDifficultyLevel} 
      />
    );
    
    expect(screen.getByPlaceholderText('Start writing here')).toBeInTheDocument();
    expect(screen.getByText('Select the difficulty level')).toBeInTheDocument();
  });
  
  test('calls setTopic when text is entered', () => {
    const mockSetTopic = jest.fn();
    const mockSetDifficultyLevel = jest.fn();
    
    render(
      <TopicInput 
        setTopic={mockSetTopic} 
        setDifficultyLevel={mockSetDifficultyLevel} 
      />
    );
    
    fireEvent.change(screen.getByPlaceholderText('Start writing here'), {
      target: { value: 'JavaScript Fundamentals' }
    });
    
    expect(mockSetTopic).toHaveBeenCalledWith('JavaScript Fundamentals');
  });
  
  test('calls setDifficultyLevel when difficulty is selected', async () => {
    const mockSetTopic = jest.fn();
    const mockSetDifficultyLevel = jest.fn();
    
    render(
      <TopicInput 
        setTopic={mockSetTopic} 
        setDifficultyLevel={mockSetDifficultyLevel} 
      />
    );
    
    // Open the select dropdown
    fireEvent.click(screen.getByText('Difficulty Level'));
    
    // Select an option
    fireEvent.click(screen.getByText('Moderate'));
    
    expect(mockSetDifficultyLevel).toHaveBeenCalledWith('Moderate');
  });
});

// Unit tests for CreateCourse component
describe('CreateCourse Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    uuidv4.mockReturnValue('test-uuid');
  });
  
  test('renders initial step with SelectOption component', async () => {
    render(<CreateCourse />);
    
    expect(screen.getByText('Start Building your Personal Study Material')).toBeInTheDocument();
    // Wait for lazy-loaded component
    await waitFor(() => {
      expect(screen.getByText('For which purpose you want to generate study material')).toBeInTheDocument();
    });
  });
  
  test('navigates to second step when Next is clicked', async () => {
    render(<CreateCourse />);
    
    // Wait for lazy-loaded component
    await waitFor(() => {
      expect(screen.getByText('Next')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Next'));
    
    // Wait for lazy-loaded component
    await waitFor(() => {
      expect(screen.getByText('Enter the topic or paste the content for which you want to generate study material')).toBeInTheDocument();
    });
  });
  
  test('calls API and shows loading state when Generate is clicked', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });
    
    render(<CreateCourse />);
    
    // Wait for lazy-loaded component and go to next step
    await waitFor(() => {
      expect(screen.getByText('Next')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Next'));
    
    // Wait for lazy-loaded component
    await waitFor(() => {
      expect(screen.getByText('Generate')).toBeInTheDocument();
    });
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Start writing here'), {
      target: { value: 'JavaScript Fundamentals' }
    });
    
    // Click generate
    fireEvent.click(screen.getByText('Generate'));
    
    // Check loading state
    expect(screen.getByText('Generating...')).toBeInTheDocument();
    
    // Wait for API call to resolve
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/generate-course-outline', {
        courseId: 'test-uuid',
        topic: 'JavaScript Fundamentals',
        createdBy: 'test@example.com'
      });
    });
  });
  
  test('handles API errors correctly', async () => {
    axios.post.mockRejectedValue(new Error('API Error'));
    
    render(<CreateCourse />);
    
    // Wait for lazy-loaded component and go to next step
    await waitFor(() => {
      expect(screen.getByText('Next')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Next'));
    
    // Wait for lazy-loaded component
    await waitFor(() => {
      expect(screen.getByText('Generate')).toBeInTheDocument();
    });
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Start writing here'), {
      target: { value: 'JavaScript Fundamentals' }
    });
    
    // Click generate
    fireEvent.click(screen.getByText('Generate'));
    
    // Wait for API call to reject
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error generating course:', expect.any(Error));
    });
    
    // Check toast was called with error message
    expect(toast.error).toHaveBeenCalledWith('Failed to generate course. Please try again.');
  });
});

// Unit tests for performance monitoring utility
import { markAndMeasure, measurePerformance, measureAsyncPerformance } from '@/lib/performance';

describe('Performance Utilities', () => {
  beforeEach(() => {
    // Mock performance API
    global.performance = {
      mark: jest.fn(),
      measure: jest.fn(),
      getEntriesByName: jest.fn().mockReturnValue([{ duration: 100 }]),
    };
    console.log = jest.fn();
  });
  
  test('markAndMeasure creates marks and measures', () => {
    markAndMeasure('test-mark', 'test-measure');
    
    expect(performance.mark).toHaveBeenCalledWith('test-mark');
    
    markAndMeasure('test-mark-end', 'test-measure', 'test-mark');
    
    expect(performance.measure).toHaveBeenCalledWith('test-measure', 'test-mark', 'test-mark-end');
    expect(console.log).toHaveBeenCalledWith('Measure [test-measure]: 100.00ms');
  });
  
  test('measurePerformance measures execution time', () => {
    const mockFn = jest.fn().mockReturnValue('result');
    
    const result = measurePerformance('test-performance', mockFn);
    
    expect(mockFn).toHaveBeenCalled();
    expect(result).toBe('result');
    expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Performance \[test-performance\]: \d+\.\d+ms/));
  });
  
  test('measureAsyncPerformance measures async execution time', async () => {
    const mockAsyncFn = jest.fn().mockResolvedValue('async result');
    
    const result = await measureAsyncPerformance('test-async-performance', mockAsyncFn);
    
    expect(mockAsyncFn).toHaveBeenCalled();
    expect(result).toBe('async result');
    expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Performance \[test-async-performance\]: \d+\.\d+ms/));
  });
});