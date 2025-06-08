/**
 * Array Utility Tests
 * 
 * Tests for array manipulation utility functions
 */

// Import utility functions (or define them inline for testing)
const filterArray = (arr, predicate) => arr.filter(predicate);
const mapArray = (arr, transform) => arr.map(transform);
const uniqueArray = (arr) => [...new Set(arr)];
const sortArray = (arr, compareFn) => [...arr].sort(compareFn);
const groupBy = (arr, key) => {
  return arr.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    (result[groupKey] = result[groupKey] || []).push(item);
    return result;
  }, {});
};

describe('Array Utility Functions', () => {
  describe('filterArray', () => {
    test('filters array elements based on predicate', () => {
      expect(filterArray([1, 2, 3, 4, 5], n => n > 3)).toEqual([4, 5]);
      expect(filterArray(['apple', 'banana', 'cherry'], s => s.startsWith('a'))).toEqual(['apple']);
    });

    test('returns empty array when no elements match', () => {
      expect(filterArray([1, 2, 3], n => n > 5)).toEqual([]);
      expect(filterArray(['apple', 'banana'], s => s.startsWith('c'))).toEqual([]);
    });

    test('handles empty arrays', () => {
      expect(filterArray([], () => true)).toEqual([]);
    });

    test('preserves original array', () => {
      const original = [1, 2, 3, 4, 5];
      filterArray(original, n => n > 3);
      expect(original).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('mapArray', () => {
    test('transforms array elements', () => {
      expect(mapArray([1, 2, 3], n => n * 2)).toEqual([2, 4, 6]);
      expect(mapArray(['a', 'b', 'c'], s => s.toUpperCase())).toEqual(['A', 'B', 'C']);
    });

    test('handles empty arrays', () => {
      expect(mapArray([], () => true)).toEqual([]);
    });

    test('preserves original array', () => {
      const original = [1, 2, 3];
      mapArray(original, n => n * 2);
      expect(original).toEqual([1, 2, 3]);
    });

    test('maintains array length', () => {
      expect(mapArray([1, 2, 3], () => 0)).toEqual([0, 0, 0]);
      expect(mapArray([1, 2, 3], () => null)).toEqual([null, null, null]);
    });
  });

  describe('uniqueArray', () => {
    test('removes duplicate elements', () => {
      expect(uniqueArray([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(uniqueArray(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c']);
    });

    test('handles arrays with no duplicates', () => {
      expect(uniqueArray([1, 2, 3])).toEqual([1, 2, 3]);
      expect(uniqueArray(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    });

    test('handles empty arrays', () => {
      expect(uniqueArray([])).toEqual([]);
    });

    test('preserves original array', () => {
      const original = [1, 2, 2, 3];
      uniqueArray(original);
      expect(original).toEqual([1, 2, 2, 3]);
    });
  });

  describe('sortArray', () => {
    test('sorts array elements in ascending order by default', () => {
      expect(sortArray([3, 1, 4, 2])).toEqual([1, 2, 3, 4]);
      expect(sortArray(['c', 'a', 'b'])).toEqual(['a', 'b', 'c']);
    });

    test('sorts array elements using custom compare function', () => {
      expect(sortArray([3, 1, 4, 2], (a, b) => b - a)).toEqual([4, 3, 2, 1]);
      expect(sortArray(['apple', 'banana', 'cherry'], (a, b) => b.localeCompare(a))).toEqual(['cherry', 'banana', 'apple']);
    });

    test('handles empty arrays', () => {
      expect(sortArray([])).toEqual([]);
    });

    test('preserves original array', () => {
      const original = [3, 1, 4, 2];
      sortArray(original);
      expect(original).toEqual([3, 1, 4, 2]);
    });
  });

  describe('groupBy', () => {
    test('groups array elements by property', () => {
      const people = [
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 30 },
        { name: 'Charlie', age: 25 }
      ];
      
      expect(groupBy(people, 'age')).toEqual({
        '25': [
          { name: 'Alice', age: 25 },
          { name: 'Charlie', age: 25 }
        ],
        '30': [
          { name: 'Bob', age: 30 }
        ]
      });
    });

    test('groups array elements by function result', () => {
      const numbers = [1, 2, 3, 4, 5, 6];
      
      expect(groupBy(numbers, n => n % 2 === 0 ? 'even' : 'odd')).toEqual({
        'even': [2, 4, 6],
        'odd': [1, 3, 5]
      });
    });

    test('handles empty arrays', () => {
      expect(groupBy([], 'prop')).toEqual({});
    });

    test('preserves original array', () => {
      const original = [
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 30 }
      ];
      
      groupBy(original, 'age');
      expect(original).toEqual([
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 30 }
      ]);
    });
  });
});