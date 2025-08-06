import { vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Configure SolidJS for testing
import { createRoot } from 'solid-js';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock ResizeObserver with spy functionality
const MockResizeObserver = vi.fn();
MockResizeObserver.prototype.observe = vi.fn();
MockResizeObserver.prototype.unobserve = vi.fn();
MockResizeObserver.prototype.disconnect = vi.fn();

Object.defineProperty(window, 'ResizeObserver', {
  value: MockResizeObserver,
  writable: true,
});

// Mock fetch
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock location for URL params
Object.defineProperty(window, 'location', {
  value: {
    search: '',
    href: 'http://localhost:3000/',
  },
  writable: true,
});

// Clean up after each test
beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});