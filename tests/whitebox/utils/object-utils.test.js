/**
 * Object Utility Tests
 * 
 * Tests for object manipulation utility functions
 */

// Import utility functions (or define them inline for testing)
const pick = (obj, keys) => {
  return keys.reduce((acc, key) => {
    if (obj.hasOwnProperty(key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

const omit = (obj, keys) => {
  return Object.keys(obj).reduce((acc, key) => {
    if (!keys.includes(key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

const merge = (target, ...sources) => {
  return Object.assign({}, target, ...sources);
};

const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = deepClone(obj[key]);
    return acc;
  }, {});
};

const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

describe('Object Utility Functions', () => {
  describe('pick', () => {
    test('picks specified properties from an object', () => {
      expect(pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ a: 1, c: 3 });
      expect(pick({ name: 'John', age: 30, city: 'New York' }, ['name', 'city'])).toEqual({ name: 'John', city: 'New York' });
    });

    test('ignores properties that do not exist', () => {
      expect(pick({ a: 1, b: 2 }, ['a', 'c'])).toEqual({ a: 1 });
      expect(pick({ name: 'John' }, ['age'])).toEqual({});
    });

    test('returns empty object when no properties are picked', () => {
      expect(pick({ a: 1, b: 2 }, [])).toEqual({});
    });

    test('handles empty objects', () => {
      expect(pick({}, ['a', 'b'])).toEqual({});
    });
  });

  describe('omit', () => {
    test('omits specified properties from an object', () => {
      expect(omit({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ b: 2 });
      expect(omit({ name: 'John', age: 30, city: 'New York' }, ['age'])).toEqual({ name: 'John', city: 'New York' });
    });

    test('ignores properties that do not exist', () => {
      expect(omit({ a: 1, b: 2 }, ['c'])).toEqual({ a: 1, b: 2 });
    });

    test('returns original object when no properties are omitted', () => {
      expect(omit({ a: 1, b: 2 }, [])).toEqual({ a: 1, b: 2 });
    });

    test('handles empty objects', () => {
      expect(omit({}, ['a', 'b'])).toEqual({});
    });
  });

  describe('merge', () => {
    test('merges multiple objects', () => {
      expect(merge({ a: 1 }, { b: 2 }, { c: 3 })).toEqual({ a: 1, b: 2, c: 3 });
      expect(merge({ name: 'John' }, { age: 30 })).toEqual({ name: 'John', age: 30 });
    });

    test('later properties overwrite earlier ones', () => {
      expect(merge({ a: 1, b: 2 }, { b: 3, c: 4 })).toEqual({ a: 1, b: 3, c: 4 });
      expect(merge({ name: 'John' }, { name: 'Jane' })).toEqual({ name: 'Jane' });
    });

    test('handles empty objects', () => {
      expect(merge({}, { a: 1 })).toEqual({ a: 1 });
      expect(merge({ a: 1 }, {})).toEqual({ a: 1 });
      expect(merge({}, {})).toEqual({});
    });

    test('preserves original objects', () => {
      const obj1 = { a: 1 };
      const obj2 = { b: 2 };
      merge(obj1, obj2);
      expect(obj1).toEqual({ a: 1 });
      expect(obj2).toEqual({ b: 2 });
    });
  });

  describe('deepClone', () => {
    test('creates a deep copy of an object', () => {
      const original = { a: 1, b: { c: 2 } };
      const clone = deepClone(original);
      
      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.b).not.toBe(original.b);
    });

    test('handles arrays', () => {
      const original = [1, [2, 3]];
      const clone = deepClone(original);
      
      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone[1]).not.toBe(original[1]);
    });

    test('handles nested objects and arrays', () => {
      const original = { a: [1, { b: 2 }] };
      const clone = deepClone(original);
      
      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.a).not.toBe(original.a);
      expect(clone.a[1]).not.toBe(original.a[1]);
    });

    test('handles primitive values', () => {
      expect(deepClone(1)).toBe(1);
      expect(deepClone('hello')).toBe('hello');
      expect(deepClone(null)).toBe(null);
      expect(deepClone(undefined)).toBe(undefined);
    });
  });

  describe('isEmpty', () => {
    test('returns true for empty objects', () => {
      expect(isEmpty({})).toBe(true);
    });

    test('returns false for non-empty objects', () => {
      expect(isEmpty({ a: 1 })).toBe(false);
      expect(isEmpty({ a: undefined })).toBe(false);
    });

    test('handles objects with inherited properties', () => {
      const proto = { a: 1 };
      const obj = Object.create(proto);
      
      expect(isEmpty(obj)).toBe(true);
      
      obj.b = 2;
      expect(isEmpty(obj)).toBe(false);
    });
  });
});