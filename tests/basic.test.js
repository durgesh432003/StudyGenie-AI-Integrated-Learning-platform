/**
 * Basic test to verify Jest setup
 */

describe('Basic Test Suite', () => {
  test('true should be true', () => {
    expect(true).toBe(true);
  });

  test('math should work', () => {
    expect(1 + 1).toBe(2);
  });
});