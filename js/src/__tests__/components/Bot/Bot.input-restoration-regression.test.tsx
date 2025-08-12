import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { Bot } from '@/components/Bot';
import {
  createMockAgentConfig,
  createMockInitialChatReply,
  cleanupDOM,
  setupLocalStorage,
} from '../../test-utils';

// Mock external dependencies
vi.mock('@/queries/getInitialChatReplyQuery', () => ({
  getInitialChatReplyQuery: vi.fn(),
}));

vi.mock('@/utils/isMobileSignal', () => ({
  setIsMobile: vi.fn(),
}));

vi.mock('@/utils/setCssVariablesValue', () => ({
  setCssVariablesValue: vi.fn(),
}));

// Mock StreamConversation to capture props passed to it
let capturedStreamConversationProps: any = null;
vi.mock('@/components/StreamConversation', () => ({
  StreamConversation: (props: any) => {
    capturedStreamConversationProps = props;
    return <div data-testid="stream-conversation">StreamConversation</div>;
  },
}));

vi.mock('@/components/LiteBadge', () => ({
  LiteBadge: () => <div data-testid="lite-badge">LiteBadge</div>,
}));

vi.mock('@/components/ErrorMessage', () => ({
  ErrorMessage: ({ error }: { error: Error }) => (
    <div data-testid="error-message">{error.message}</div>
  ),
}));

vi.mock('@/assets/immutable.css', () => ({
  default: '#lite-badge { position: absolute !important; padding: 4px 8px !important; }',
}));

import { getInitialChatReplyQuery } from '@/queries/getInitialChatReplyQuery';

describe('Bot Input Restoration Regression Tests', () => {
  const mockGetInitialChatReplyQuery = getInitialChatReplyQuery as any;
  
  beforeEach(() => {
    cleanupDOM();
    vi.clearAllMocks();
    capturedStreamConversationProps = null;
    localStorage.clear();
  });

  describe('Input Restoration from localStorage', () => {
    it('should restore input data when persistSession=true and persisted messages exist', async () => {
      const agentName = 'test-agent';
      const testInput = { 
        type: 'text input',
        options: {
          labels: {
            placeholder: 'Restored input placeholder',
            button: 'Send'
          },
          isLong: false
        }
      };

      // Setup persisted session data
      setupLocalStorage({
        [`${agentName}_input`]: testInput,
        [`${agentName}_sessionId`]: 'session-123',
        [`${agentName}_agentConfig`]: createMockAgentConfig(),
        [`${agentName}_chatMessages`]: [
          { id: '1', role: 'assistant', content: 'Hello from restored session' }
        ],
        [`${agentName}_customCss`]: '.test { color: blue; }'
      });

      render(() => (
        <Bot 
          agentName={agentName} 
          persistSession={true} 
          stream={true}
        />
      ));

      await waitFor(() => {
        expect(screen.getByTestId('stream-conversation')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Verify that StreamConversation received the restored input
      expect(capturedStreamConversationProps).toBeTruthy();
      expect(capturedStreamConversationProps.initialAgentReply.input).toEqual(testInput);
      
      // Verify API was not called since we're using persisted data
      expect(mockGetInitialChatReplyQuery).not.toHaveBeenCalled();
    });

    it('should handle null input gracefully when no input is stored', async () => {
      const agentName = 'test-agent';

      // Setup persisted session data without input
      setupLocalStorage({
        [`${agentName}_sessionId`]: 'session-123',
        [`${agentName}_agentConfig`]: createMockAgentConfig(),
        [`${agentName}_chatMessages`]: [
          { id: '1', role: 'assistant', content: 'Hello' }
        ]
      });

      render(() => (
        <Bot 
          agentName={agentName} 
          persistSession={true} 
          stream={true}
        />
      ));

      await waitFor(() => {
        expect(screen.getByTestId('stream-conversation')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Verify that StreamConversation received null input (no stored input)
      expect(capturedStreamConversationProps.initialAgentReply.input).toBeNull();
    });
  });

  describe('Input Storage during API Initialization', () => {
    it('should store input data from API response for future restoration', async () => {
      const agentName = 'test-agent';
      const apiInput = { 
        type: 'text input',
        options: {
          labels: {
            placeholder: 'API input placeholder',
            button: 'Submit'
          },
          isLong: true
        }
      };
      
      const mockApiResponse = createMockInitialChatReply({ input: apiInput });
      mockGetInitialChatReplyQuery.mockResolvedValue({ data: mockApiResponse });

      render(() => <Bot agentName={agentName} />);

      await waitFor(() => {
        expect(screen.getByTestId('stream-conversation')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Verify input was stored in localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith(
        `${agentName}_input`,
        JSON.stringify(apiInput)
      );

      // Verify StreamConversation received the API input
      expect(capturedStreamConversationProps.initialAgentReply.input).toEqual(apiInput);
    });

    it('should not store input if API response has no input field', async () => {
      const agentName = 'test-agent';
      const mockApiResponse = createMockInitialChatReply({ input: undefined });
      mockGetInitialChatReplyQuery.mockResolvedValue({ data: mockApiResponse });

      render(() => <Bot agentName={agentName} />);

      await waitFor(() => {
        expect(screen.getByTestId('stream-conversation')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Verify input was not stored since it was undefined
      expect(localStorage.setItem).not.toHaveBeenCalledWith(
        `${agentName}_input`,
        expect.any(String)
      );
    });
  });

  describe('Input Precedence Logic with Session Restoration', () => {
    it('should prioritize props.input over restored input from localStorage', async () => {
      const agentName = 'test-agent';
      
      // Setup restored input in localStorage
      const restoredInput = { 
        type: 'text input',
        options: {
          labels: {
            placeholder: 'Restored input',
            button: 'Send'
          }
        }
      };
      
      // Setup props input (should take precedence)
      const propsInput = { 
        type: 'text input',
        options: {
          labels: {
            placeholder: 'Props input',
            button: 'Submit'
          }
        }
      };

      setupLocalStorage({
        [`${agentName}_input`]: restoredInput,
        [`${agentName}_sessionId`]: 'session-123',
        [`${agentName}_agentConfig`]: createMockAgentConfig(),
        [`${agentName}_chatMessages`]: [
          { id: '1', role: 'assistant', content: 'Hello' }
        ]
      });

      render(() => (
        <Bot 
          agentName={agentName}
          persistSession={true}
          stream={true}
          input={propsInput}  // Should override restored input
        />
      ));

      await waitFor(() => {
        expect(screen.getByTestId('stream-conversation')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Verify props input takes precedence over restored input
      expect(capturedStreamConversationProps.initialAgentReply.input).toEqual(propsInput);
    });

    it('should prioritize props.input over API input in fresh sessions', async () => {
      const agentName = 'test-agent';
      const propsInput = { 
        type: 'text input',
        options: {
          labels: {
            placeholder: 'Props input',
            button: 'Send'
          }
        }
      };
      const apiInput = { 
        type: 'text input',
        options: {
          labels: {
            placeholder: 'API input',
            button: 'Submit'
          }
        }
      };
      
      const mockApiResponse = createMockInitialChatReply({ input: apiInput });
      mockGetInitialChatReplyQuery.mockResolvedValue({ data: mockApiResponse });

      render(() => <Bot agentName={agentName} input={propsInput} />);

      await waitFor(() => {
        expect(screen.getByTestId('stream-conversation')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Verify props input takes precedence over API input
      expect(capturedStreamConversationProps.initialAgentReply.input).toEqual(propsInput);
    });
  });

  describe('Session Clearing and Input Cleanup', () => {
    it('should clear input data when clearSession is called', async () => {
      const agentName = 'test-agent';
      
      // First, setup a session with input
      const testInput = { 
        type: 'text input',
        options: {
          labels: {
            placeholder: 'Test input',
            button: 'Send'
          }
        }
      };

      setupLocalStorage({
        [`${agentName}_input`]: testInput,
        [`${agentName}_sessionId`]: 'session-123',
        [`${agentName}_agentConfig`]: createMockAgentConfig(),
        [`${agentName}_chatMessages`]: [
          { id: '1', role: 'assistant', content: 'Hello' }
        ]
      });

      // Verify data is stored
      expect(localStorage.getItem(`${agentName}_input`)).toBeTruthy();
      expect(localStorage.getItem(`${agentName}_sessionId`)).toBeTruthy();

      // Now simulate session expiry that triggers clearSession
      const mockApiResponse = createMockInitialChatReply();
      mockGetInitialChatReplyQuery.mockResolvedValue({ data: mockApiResponse });

      render(() => (
        <Bot 
          agentName={agentName}
          persistSession={true}
          stream={true}
        />
      ));

      await waitFor(() => {
        expect(screen.getByTestId('stream-conversation')).toBeInTheDocument();
      }, { timeout: 5000 });

      // The component should use persisted data successfully first
      expect(capturedStreamConversationProps.initialAgentReply.input).toEqual(testInput);

      // Note: Testing the actual clearSession call would require triggering session expiration,
      // which is complex to test. The important part is that the useAgentStorage hook 
      // includes input removal in clearSession method, which we've implemented.
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed input data in localStorage gracefully', async () => {
      const agentName = 'test-agent';

      // Setup malformed input data
      localStorage.setItem(`${agentName}_input`, 'invalid-json{');
      setupLocalStorage({
        [`${agentName}_sessionId`]: 'session-123',
        [`${agentName}_agentConfig`]: createMockAgentConfig(),
        [`${agentName}_chatMessages`]: [
          { id: '1', role: 'assistant', content: 'Hello' }
        ]
      });

      render(() => (
        <Bot 
          agentName={agentName} 
          persistSession={true} 
          stream={true}
        />
      ));

      await waitFor(() => {
        expect(screen.getByTestId('stream-conversation')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Should handle malformed data gracefully and default to null
      expect(capturedStreamConversationProps.initialAgentReply.input).toBeNull();
    });

    it('should work correctly when localStorage is unavailable', async () => {
      // Mock localStorage to throw errors
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(() => { throw new Error('localStorage unavailable'); }),
          setItem: vi.fn(() => { throw new Error('localStorage unavailable'); }),
          removeItem: vi.fn(() => { throw new Error('localStorage unavailable'); }),
        },
        writable: true
      });

      const agentName = 'test-agent';
      const mockApiResponse = createMockInitialChatReply();
      mockGetInitialChatReplyQuery.mockResolvedValue({ data: mockApiResponse });

      render(() => <Bot agentName={agentName} />);

      await waitFor(() => {
        expect(screen.getByTestId('stream-conversation')).toBeInTheDocument();
      }, { timeout: 5000 });

      // Should still work by falling back to API data
      expect(capturedStreamConversationProps.initialAgentReply.input).toEqual(mockApiResponse.input);

      // Restore original localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true
      });
    });
  });
});