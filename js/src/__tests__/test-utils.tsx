import { render } from '@solidjs/testing-library';
import { Component, JSX } from 'solid-js';
import { vi } from 'vitest';
import { BackgroundType } from '@/schemas/features/agent/theme/enums';

// Test utilities for component testing
export function renderComponent<T extends Component<any>>(
  Component: T,
  props: Parameters<T>[0] = {} as Parameters<T>[0]
) {
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
    id: 'test-agent-id',
    theme: {
        chat: {
            "inputs": {
                "color": "#5a5a5a",
                "backgroundColor": "#FFFFFF",
                "placeholderColor": "#f35512"
            },
            "buttons": {
                "color": "#FFFFFF",
                "backgroundColor": "#517920"
            },
            "roundness": "none" as const,
            "hostAvatar": {
                "url": "https://pd-images-public.s3.ap-south-1.amazonaws.com/guest-profile.png",
                "isEnabled": true
            },
            "guestAvatar": {
                "url": "https://pd-images-public.s3.ap-south-1.amazonaws.com/guest-profile.png",
                "isEnabled": true
            },
            "hostBubbles": {
                "color": "#eef4e7",
                "backgroundColor": "#629720"
            },
            "guestBubbles": {
                "color": "#171716",
                "backgroundColor": "#f2f4f0"
            }
        },
        general: {
            "font": "Amita",
            "background": {
                "type": BackgroundType.COLOR,
                "content": "#b6a0a0"
            }
        }
    },
    settings: {
        "general": {
            "isBrandingEnabled": false,
            "isInputPrefillEnabled": true,
            "isHideQueryParamsEnabled": true,
            "isNewResultOnRefreshEnabled": true
        },
        "metadata": {
            "description": "Build agents and embed them directly in your applications without a line of code."
        },
        "typingEmulation": {
            "speed": 300,
            "enabled": true,
            "maxDelay": 1.5
        }
    },
    ...overrides,
  }
}

export function createMockInitialChatReply(overrides = {}) {
  const fullAgentConfig = createMockAgentConfig();
  return {
    sessionId: 'test-session-id',
    agentConfig: {
      id: fullAgentConfig.id,
      theme: fullAgentConfig.theme,
      settings: fullAgentConfig.settings,
    },
    messages: [
        {
            "type": "text",
            "content": {
                "richText": [
                    {
                        "type": "p",
                        "children": [
                            {
                                "text": "You can change this **welcome message** or remove it completely.\n\nLogin to <a href=\"https://predictabledialogs.com\" style=\"text-decoration: underline;\">Predictable Dialogs</a> then click on your agent and go to \"settings\" and update or remove this message."
                            }
                        ]
                    }
                ]
            }
        }
    ],
    input: {
        "type": "text input",
        "options": {
            "labels": {
                "placeholder": "Whats on your mind",
                "button": "Enter"
            },
            "isLong": true
        }
    },
    ...overrides,
  };
}

export function createMockBotContext(overrides = {}) {
  const fullAgentConfig = createMockAgentConfig();
  return {
    agentName: 'test-agent',
    apiHost: 'https://api.test.com',
    apiStreamHost: 'https://stream.test.com',
    isPreview: false,
    sessionId: 'test-session',
    agentConfig: {
      id: fullAgentConfig.id,
      theme: fullAgentConfig.theme,
      settings: fullAgentConfig.settings,
    },
    contextVariables: {},
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
  let messagesData: any[] = [];
  let errorData: any = null;
  let statusData: any = 'idle';
  let dataValue: any = null;
  
  const mock = {
    messages: vi.fn(() => messagesData),
    input: '',
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: false,
    error: vi.fn(() => errorData),
    reload: vi.fn(),
    stop: vi.fn(),
    append: vi.fn(),
    setMessages: vi.fn(),
    setInput: vi.fn(),
    status: vi.fn(() => statusData),
    data: vi.fn(() => dataValue),
    ...overrides,
  } as any;
  
  // Allow tests to set the underlying data
  Object.defineProperty(mock, 'messages', {
    get() { return vi.fn(() => messagesData); },
    set(value: any) { messagesData = value; },
    configurable: true
  });
  
  Object.defineProperty(mock, 'error', {
    get() { return vi.fn(() => errorData); },
    set(value: any) { errorData = value; },
    configurable: true
  });
  
  Object.defineProperty(mock, 'status', {
    get() { return vi.fn(() => statusData); },
    set(value: any) { statusData = value; },
    configurable: true
  });
  
  Object.defineProperty(mock, 'data', {
    get() { return vi.fn(() => dataValue); },
    set(value: any) { dataValue = value; },
    configurable: true
  });
  
  return mock;
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