import { render, RenderResult } from '@solidjs/testing-library';
import { Component, JSX } from 'solid-js';
import { vi } from 'vitest';

// Test utilities for component testing
export function renderComponent<T extends Component<any>>(
  Component: T,
  props: Parameters<T>[0] = {} as Parameters<T>[0]
): RenderResult {
  return render(() => <Component {...props} />);
}

// Mock functions for common dependencies
export const mockGetInitialChatReplyQuery = vi.fn();
export const mockUseChat = vi.fn();
export const mockSetIsMobile = vi.fn();
export const mockSetCssVariablesValue = vi.fn();

// Factory functions for test data
export function createMockAgentConfig(overrides = {}) {
  return {
    agent: {
      name: 'Test Agent',
    },
    settings: {
      general: {
        isBrandingEnabled: false,
      },
    },
    theme: {
      general: {
        font: 'Open Sans',
      },
      chat: {
        hostAvatar: {
          url: 'https://example.com/avatar.png',
        },
        guestAvatar: {
          url: 'https://example.com/guest.png',
        },
      },
    },
    ...overrides,
  };
}

export function createMockInitialChatReply(overrides = {}) {
  return {
    sessionId: 'test-session-id',
    agentConfig: createMockAgentConfig(),
    messages: [],
    input: null,
    customCss: '',
    clientSideActions: [],
    dynamicTheme: null,
    ...overrides,
  };
}

export function createMockBotContext(overrides = {}) {
  return {
    agentName: 'test-agent',
    apiHost: 'https://api.test.com',
    apiStreamHost: 'https://stream.test.com',
    isPreview: false,
    prefilledVariables: {},
    ...overrides,
  };
}

// Helper to create mock ResizeObserver entries
export function createMockResizeObserverEntry(
  width: number,
  height: number = 600
): ResizeObserverEntry {
  return {
    target: {
      clientWidth: width,
      clientHeight: height,
    } as Element,
    contentRect: {
      width,
      height,
      x: 0,
      y: 0,
      top: 0,
      right: width,
      bottom: height,
      left: 0,
    } as DOMRectReadOnly,
    borderBoxSize: [] as ResizeObserverSize[],
    contentBoxSize: [] as ResizeObserverSize[],
    devicePixelContentBoxSize: [] as ResizeObserverSize[],
  };
}

// Helper to simulate localStorage operations
export function setupLocalStorage(data: Record<string, any>) {
  Object.keys(data).forEach(key => {
    localStorage.setItem(key, JSON.stringify(data[key]));
  });
}

// Helper to clean DOM modifications made by components
export function cleanupDOM() {
  // Remove any dynamically created style tags
  document.querySelectorAll('style[data-test]').forEach(el => el.remove());
  document.querySelectorAll('link[data-test]').forEach(el => el.remove());
}

// Mock useChat hook implementation
export function createMockUseChat(overrides = {}) {
  return {
    messages: [],
    input: '',
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: false,
    error: null,
    reload: vi.fn(),
    stop: vi.fn(),
    append: vi.fn(),
    setMessages: vi.fn(),
    setInput: vi.fn(),
    ...overrides,
  };
}

// Helper for testing async effects
export function waitForEffects() {
  return new Promise(resolve => {
    setTimeout(resolve, 100); // Increase timeout for SolidJS effects
  });
}

// Helper for waiting for promises to resolve
export async function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}