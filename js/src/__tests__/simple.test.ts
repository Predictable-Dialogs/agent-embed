import { describe, it, expect } from 'vitest';

describe('Simple Test', () => {
  it('should verify basic test setup works', () => {
    expect(1 + 1).toBe(2);
  });

  it('should verify localStorage mock works', () => {
    localStorage.setItem('test', 'value');
    expect(localStorage.getItem('test')).toBe('value');
  });

  it('should verify ResizeObserver mock works', () => {
    const callback = () => {};
    const observer = new ResizeObserver(callback);
    expect(observer).toBeDefined();
    expect(observer.observe).toBeDefined();
    expect(observer.unobserve).toBeDefined();
    expect(observer.disconnect).toBeDefined();
  });
});