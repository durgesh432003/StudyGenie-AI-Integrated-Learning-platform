/**
 * Performance monitoring utilities
 */

// Simple performance measurement utility
export function measurePerformance(name, fn) {
  if (typeof window === 'undefined') {
    // Server-side
    const start = process.hrtime();
    const result = fn();
    const diff = process.hrtime(start);
    const time = diff[0] * 1e3 + diff[1] * 1e-6; // Convert to ms
    console.log(`Performance [${name}]: ${time.toFixed(2)}ms`);
    return result;
  } else {
    // Client-side
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`Performance [${name}]: ${(end - start).toFixed(2)}ms`);
    return result;
  }
}

// For async functions
export async function measureAsyncPerformance(name, asyncFn) {
  if (typeof window === 'undefined') {
    // Server-side
    const start = process.hrtime();
    const result = await asyncFn();
    const diff = process.hrtime(start);
    const time = diff[0] * 1e3 + diff[1] * 1e-6; // Convert to ms
    console.log(`Performance [${name}]: ${time.toFixed(2)}ms`);
    return result;
  } else {
    // Client-side
    const start = performance.now();
    const result = await asyncFn();
    const end = performance.now();
    console.log(`Performance [${name}]: ${(end - start).toFixed(2)}ms`);
    return result;
  }
}

// Create a performance mark and measure (client-side only)
export function markAndMeasure(markName, measureName, startMark = null) {
  if (typeof window !== 'undefined' && window.performance) {
    try {
      performance.mark(markName);
      
      if (startMark) {
        performance.measure(measureName, startMark, markName);
        const entries = performance.getEntriesByName(measureName);
        if (entries.length > 0) {
          console.log(`Measure [${measureName}]: ${entries[0].duration.toFixed(2)}ms`);
        }
      }
    } catch (e) {
      console.error('Performance API error:', e);
    }
  }
}