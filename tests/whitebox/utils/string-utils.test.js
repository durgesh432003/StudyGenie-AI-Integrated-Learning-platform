/**
 * String Utility Tests
 * 
 * Tests for string manipulation utility functions
 */

// Import utility functions (or define them inline for testing)
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const truncate = (str, length) => str.length > length ? str.substring(0, length) + '...' : str;
const slugify = (str) => str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
const stripHtml = (html) => html.replace(/<[^>]*>?/gm, '');
const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num);

describe('String Utility Functions', () => {
  describe('capitalize', () => {
    test('capitalizes the first letter of a string', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('world')).toBe('World');
    });

    test('returns empty string when input is empty', () => {
      expect(capitalize('')).toBe('');
    });

    test('handles strings that are already capitalized', () => {
      expect(capitalize('Hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('WORLD');
    });

    test('handles strings with special characters', () => {
      expect(capitalize('123abc')).toBe('123abc');
      expect(capitalize('!hello')).toBe('!hello');
    });
  });

  describe('truncate', () => {
    test('truncates strings longer than specified length', () => {
      expect(truncate('Hello World', 5)).toBe('Hello...');
      expect(truncate('This is a long string', 10)).toBe('This is a ...');
    });

    test('does not truncate strings shorter than specified length', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
      expect(truncate('', 5)).toBe('');
    });

    test('handles strings equal to specified length', () => {
      expect(truncate('Hello', 5)).toBe('Hello');
      expect(truncate('12345', 5)).toBe('12345');
    });

    test('handles edge cases', () => {
      expect(truncate('Hello', 0)).toBe('...');
      expect(truncate('', 0)).toBe('');
    });
  });

  describe('slugify', () => {
    test('converts spaces to hyphens', () => {
      expect(slugify('hello world')).toBe('hello-world');
      expect(slugify('this is a test')).toBe('this-is-a-test');
    });

    test('converts to lowercase', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('THIS IS A TEST')).toBe('this-is-a-test');
    });

    test('removes special characters', () => {
      expect(slugify('hello, world!')).toBe('hello-world');
      expect(slugify('test@example.com')).toBe('testexamplecom');
    });

    test('handles multiple spaces', () => {
      expect(slugify('hello   world')).toBe('hello-world');
      expect(slugify('  leading and trailing  ')).toBe('leading-and-trailing');
    });
  });

  describe('stripHtml', () => {
    test('removes HTML tags', () => {
      expect(stripHtml('<p>Hello</p>')).toBe('Hello');
      expect(stripHtml('<div><span>Test</span></div>')).toBe('Test');
    });

    test('handles self-closing tags', () => {
      expect(stripHtml('Hello<br/>World')).toBe('HelloWorld');
      expect(stripHtml('Image: <img src="test.jpg" />')).toBe('Image: ');
    });

    test('preserves text content', () => {
      expect(stripHtml('<h1>Title</h1><p>Content</p>')).toBe('TitleContent');
      expect(stripHtml('<strong>Bold</strong> and <em>italic</em>')).toBe('Bold and italic');
    });

    test('handles malformed HTML', () => {
      expect(stripHtml('<p>Unclosed tag')).toBe('Unclosed tag');
      expect(stripHtml('Missing bracket p>Text</p>')).toBe('Missing bracket p>Text');
    });
  });

  describe('formatNumber', () => {
    test('formats numbers with thousands separators', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    test('handles decimal numbers', () => {
      expect(formatNumber(1000.5)).toBe('1,000.5');
      expect(formatNumber(1234.56)).toBe('1,234.56');
    });

    test('handles negative numbers', () => {
      expect(formatNumber(-1000)).toBe('-1,000');
      expect(formatNumber(-1234.56)).toBe('-1,234.56');
    });

    test('handles zero', () => {
      expect(formatNumber(0)).toBe('0');
    });
  });
});