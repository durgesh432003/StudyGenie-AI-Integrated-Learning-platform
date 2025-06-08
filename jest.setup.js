// Import Jest DOM extensions
require('@testing-library/jest-dom');

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {}
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams()
}));

// Mock Clerk authentication
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
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
  }),
  auth: () => ({
    userId: 'user_123'
  })
}));

// Mock Inngest
jest.mock('@/inngest/client', () => ({
  inngest: {
    send: jest.fn().mockResolvedValue({ id: 'test-event-id' })
  }
}));

// Mock global objects
global.console = {
  ...console,
  error: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  time: jest.fn(),
  timeEnd: jest.fn()
};

// Mock performance API
if (typeof window !== 'undefined') {
  window.performance = {
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn().mockReturnValue([{ duration: 100 }])
  };
}

// Mock fetch
global.fetch = jest.fn();