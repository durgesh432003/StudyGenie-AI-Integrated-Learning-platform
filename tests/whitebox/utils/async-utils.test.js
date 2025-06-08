/**
 * Async Utility Tests
 * 
 * Tests for asynchronous utility functions
 */

// Import utility functions (or define them inline for testing)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retry = async (fn, options = {}) => {
  const { retries = 3, delay: delayMs = 100 } = options;
  
  let lastError;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < retries - 1) {
        await delay(delayMs);
      }
    }
  }
  
  throw lastError;
};

const timeout = (promise, ms) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
  });
  
  return Promise.race([promise, timeoutPromise]);
};

const promiseAll = async (promises, { concurrency = Infinity } = {}) => {
  if (concurrency === Infinity) {
    return Promise.all(promises);
  }
  
  const results = [];
  const running = new Set();
  
  async function run(promise, index) {
    running.add(index);
    try {
      results[index] = await promise;
    } finally {
      running.delete(index);
    }
  }
  
  let index = 0;
  
  while (index < promises.length || running.size > 0) {
    if (index < promises.length && running.size < concurrency) {
      run(promises[index], index);
      index++;
    } else {
      await Promise.race(
        Array.from(running).map(i => promises[i].catch(() => {}))
      );
    }
  }
  
  return results;
};

describe('Async Utility Functions', () => {
  describe('delay', () => {
    test('delays execution for specified time', async () => {
      const start = Date.now();
      await delay(100);
      const elapsed = Date.now() - start;
      
      // Allow for some timing variance
      expect(elapsed).toBeGreaterThanOrEqual(90);
    });

    test('resolves with undefined', async () => {
      const result = await delay(10);
      expect(result).toBeUndefined();
    });
  });

  describe('retry', () => {
    test('returns result if function succeeds on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      
      const result = await retry(fn);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    test('retries function until it succeeds', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('Attempt 1 failed'))
        .mockRejectedValueOnce(new Error('Attempt 2 failed'))
        .mockResolvedValue('success');
      
      const result = await retry(fn, { retries: 3, delay: 10 });
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    test('throws last error if all attempts fail', async () => {
      const error = new Error('Failed');
      const fn = jest.fn().mockRejectedValue(error);
      
      await expect(retry(fn, { retries: 3, delay: 10 })).rejects.toThrow(error);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    test('respects custom retry count', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Failed'));
      
      try {
        await retry(fn, { retries: 5, delay: 10 });
      } catch (error) {
        // Ignore error
      }
      
      expect(fn).toHaveBeenCalledTimes(5);
    });
  });

  describe('timeout', () => {
    test('resolves with promise result if completed before timeout', async () => {
      const promise = Promise.resolve('success');
      
      const result = await timeout(promise, 100);
      
      expect(result).toBe('success');
    });

    test('rejects with timeout error if promise takes too long', async () => {
      const promise = delay(200).then(() => 'success');
      
      await expect(timeout(promise, 50)).rejects.toThrow('Operation timed out after 50ms');
    });

    test('rejects with promise error if promise rejects before timeout', async () => {
      const error = new Error('Promise failed');
      const promise = Promise.reject(error);
      
      await expect(timeout(promise, 100)).rejects.toThrow(error);
    });
  });

  describe('promiseAll', () => {
    test('resolves all promises with unlimited concurrency', async () => {
      const promises = [
        Promise.resolve(1),
        Promise.resolve(2),
        Promise.resolve(3)
      ];
      
      const results = await promiseAll(promises);
      
      expect(results).toEqual([1, 2, 3]);
    });

    test('resolves all promises with limited concurrency', async () => {
      const order = [];
      const createPromise = (value, delay) => {
        return new Promise(resolve => {
          setTimeout(() => {
            order.push(value);
            resolve(value);
          }, delay);
        });
      };
      
      const promises = [
        createPromise(1, 50),
        createPromise(2, 10),
        createPromise(3, 30)
      ];
      
      const results = await promiseAll(promises, { concurrency: 2 });
      
      expect(results).toEqual([1, 2, 3]);
      // The exact order can be unpredictable due to timing,
      // so we just check that all values are present
      expect(order.sort()).toEqual([1, 2, 3]);
    });

    test('handles empty array', async () => {
      const results = await promiseAll([]);
      
      expect(results).toEqual([]);
    });

    test('handles promise rejections', async () => {
      const promises = [
        Promise.resolve(1),
        Promise.reject(new Error('Failed')),
        Promise.resolve(3)
      ];
      
      await expect(promiseAll(promises)).rejects.toThrow('Failed');
    });
  });
});