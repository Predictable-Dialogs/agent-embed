import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { Bot } from '@/components/Bot';
import { 
  renderComponent, 
  setupLocalStorage, 
  waitForEffects,
  flushPromises,
  createMockInitialChatReply,
  createMockAgentConfig,
  mockGetInitialChatReplyQuery
} from '../../test-utils';
import { getInitialChatReplyQuery } from '@/queries/getInitialChatReplyQuery';
import realisticTestData from '../../data/getInitialChatReplyQuery.json';

// Mock dependencies
vi.mock('@/queries/getInitialChatReplyQuery');
vi.mock('@/components/StreamConversation', () => ({
  StreamConversation: (props: any) => (
    <div data-testid="stream-conversation">
      <div data-testid="session-id">{props.context.sessionId}</div>
      <div data-testid="persisted-messages-count">{props.persistedMessages.length}</div>
      <button data-testid="expire-session" onClick={props.onSessionExpired}>
        Expire Session
      </button>
    </div>
  ),
}));

vi.mock('@/components/ErrorMessage', () => ({
  ErrorMessage: ({ error }: { error: Error }) => (
    <div data-testid="error-message">{error.message}</div>
  ),
}));

vi.mock('@/components/LiteBadge', () => ({
  LiteBadge: () => <div data-testid="lite-badge">Badge</div>,
}));

vi.mock('@/utils/isMobileSignal', () => ({
  setIsMobile: vi.fn(),
}));

vi.mock('@/utils/setCssVariablesValue', () => ({
  setCssVariablesValue: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Helper functions for test verification
const verifyStorageValue = (key: string, expectedValue: any) => {
  const stored = localStorage.getItem(key);
  expect(stored).not.toBeNull();
  if (stored) {
    const parsed = JSON.parse(stored);
    expect(parsed).toEqual(expectedValue);
    return parsed;
  }
};

const verifyStorageStructure = (agentName: string, expectedSessionId: string) => {
  const sessionIdKey = agentName ? `${agentName}_sessionId` : 'sessionId';
  const agentConfigKey = agentName ? `${agentName}_agentConfig` : 'agentConfig';
  
  const sessionId = verifyStorageValue(sessionIdKey, expectedSessionId);
  const agentConfig = JSON.parse(localStorage.getItem(agentConfigKey) || '{}');
  
  // Verify agentConfig structure matches realistic data
  expect(agentConfig.theme?.general?.font).toBeTruthy();
  expect(agentConfig.theme?.chat?.hostBubbles).toBeTruthy();
  expect(agentConfig.settings?.typingEmulation).toBeTruthy();
  
  return { sessionId, agentConfig };
};

const verifyApiCallParams = (expectedParams: any) => {
  expect(getInitialChatReplyQuery).toHaveBeenCalledWith(
    expect.objectContaining(expectedParams)
  );
};

const waitForStorage = async (key: string, timeout = 3000) => {
  await waitFor(() => {
    expect(localStorage.getItem(key)).not.toBeNull();
  }, { timeout });
};

describe('Bot.tsx - SessionId Functionality', () => {
  // Use realistic test data with actual sessionId from localStorage samples
  const realisticSessionId = 'sess_1b30a00f1c61d0cb';
  const mockApiResponse = {
    ...realisticTestData,
    sessionId: realisticSessionId
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockGetInitialChatReplyQuery.mockResolvedValue({ data: mockApiResponse, error: null });
    (getInitialChatReplyQuery as any).mockResolvedValue({ data: mockApiResponse, error: null });
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('4. Storage Key Namespacing Tests', () => {
    describe('4.1 Agent-Specific Storage Keys', () => {
      it('should use namespaced storage keys when agentName is provided', async () => {
        render(() => <Bot agentName="test-agent" stream={true} persistSession={true} />);
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());
        await waitForStorage('test-agent_sessionId');

        // Verify specific values and structure
        verifyStorageStructure('test-agent', realisticSessionId);
      });


      it('should follow pattern ${agentName}_${key} for all storage keys', async () => {
        render(() => <Bot agentName="my-bot" stream={true} persistSession={true} />);
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());
        await waitForStorage('my-bot_sessionId');

        // Verify specific structure and values
        verifyStorageStructure('my-bot', realisticSessionId);
        
        // Ensure no plain keys exist for this data
        expect(localStorage.getItem('sessionId')).toBeNull();
        expect(localStorage.getItem('agentConfig')).toBeNull();
      });
    });

    describe('4.2 Storage Isolation Between Agents', () => {
      it('should maintain data isolation between different agents', async () => {
        // Setup realistic data for multiple agents using actual localStorage structure
        const agentAConfig = {
          ...realisticTestData.agentConfig,
          theme: { ...realisticTestData.agentConfig.theme, general: { ...realisticTestData.agentConfig.theme.general, font: 'Avenir' } }
        };
        const agentBConfig = {
          ...realisticTestData.agentConfig,
          theme: { ...realisticTestData.agentConfig.theme, general: { ...realisticTestData.agentConfig.theme.general, font: 'Arial' } }
        };
        
        setupLocalStorage({
          'agent-a_sessionId': 'sess_agent_a_123',
          'agent-a_agentConfig': agentAConfig,
          'agent-a_chatMessages': [{ id: '1', parts: [{ type: 'text', text: 'Message A' }], role: 'user' }],
          'agent-b_sessionId': 'sess_agent_b_456', 
          'agent-b_agentConfig': agentBConfig,
          'agent-b_chatMessages': [{ id: '2', parts: [{ type: 'text', text: 'Message B' }], role: 'user' }],
        });

        // Render component with agent-a
        render(() => <Bot agentName="agent-a" stream={true} persistSession={true} />);
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Verify it only loads agent-a data with specific values
        expect(screen.getByTestId('session-id')).toHaveTextContent('sess_agent_a_123');
        expect(screen.getByTestId('persisted-messages-count')).toHaveTextContent('1');

        // Verify agent-b data remains untouched with specific structure checks
        verifyStorageValue('agent-b_sessionId', 'sess_agent_b_456');
        const agentBMessages = JSON.parse(localStorage.getItem('agent-b_chatMessages') || '[]');
        expect(agentBMessages[0].parts?.[0]?.text).toBe('Message B');
      });
    });
  });

  describe('1. New Session Generation Tests', () => {
    describe('1.1 Fresh Start - No Persistence', () => {
      it('should always call API and get new sessionId when persistSession=false', async () => {
        render(() => <Bot agentName="test-agent" persistSession={false} />);
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Verify API was called with specific parameters
        verifyApiCallParams({
          sessionId: undefined,
          agentName: 'test-agent'
        });

        // Verify localStorage was populated with realistic sessionId
        await waitForStorage('test-agent_sessionId');
        verifyStorageValue('test-agent_sessionId', realisticSessionId);
      });
    });

    describe('1.2 Fresh Start - Persistence Enabled but No Storage', () => {
      it('should call API and store new sessionId when localStorage is empty', async () => {
        render(() => <Bot agentName="test-agent" stream={true} persistSession={true} />);
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Verify API was called
        expect(getInitialChatReplyQuery).toHaveBeenCalled();

        // Verify new sessionId stored with proper namespacing and realistic data
        await waitForStorage('test-agent_sessionId');
        verifyStorageStructure('test-agent', realisticSessionId);
      });
    });

    describe('1.3 Fresh Start - Persistence Enabled but Incomplete Storage', () => {
      it('should call API when sessionId is missing', async () => {
        setupLocalStorage({
          'test-agent_agentConfig': realisticTestData.agentConfig,
          'test-agent_chatMessages': [{ id: 'msg-1', parts: [{ type: 'text', text: 'test' }], role: 'user' }],
        });

        render(() => <Bot agentName="test-agent" stream={true} persistSession={true} />);
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        expect(getInitialChatReplyQuery).toHaveBeenCalled();
        await waitForStorage('test-agent_sessionId');
        verifyStorageValue('test-agent_sessionId', realisticSessionId);
      });

      it('should call API when agentConfig is missing', async () => {
        setupLocalStorage({
          'test-agent_sessionId': 'sess_existing_123',
          'test-agent_chatMessages': [{ id: 'msg-1', parts: [{ type: 'text', text: 'test' }], role: 'user' }],
        });

        render(() => <Bot agentName="test-agent" stream={true} persistSession={true} />);
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        verifyApiCallParams({ agentName: 'test-agent' });
      });

      it('should call API when messages are missing', async () => {
        setupLocalStorage({
          'test-agent_sessionId': 'sess_existing_123',
          'test-agent_agentConfig': realisticTestData.agentConfig,
        });

        render(() => <Bot agentName="test-agent" stream={true} persistSession={true} />);
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        verifyApiCallParams({ agentName: 'test-agent' });
      });

      it('should call API when messages array is empty', async () => {
        setupLocalStorage({
          'test-agent_sessionId': 'sess_existing_123',
          'test-agent_agentConfig': realisticTestData.agentConfig,
          'test-agent_chatMessages': [],
        });

        render(() => <Bot agentName="test-agent" stream={true} persistSession={true} />);
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        verifyApiCallParams({ agentName: 'test-agent' });
      });
    });
  });

  describe('2. Session Restoration Tests', () => {
    describe('2.1 Complete Session Restoration', () => {
      it('should skip API call and restore session when all required data exists', async () => {
      const storedMessages = [
        { id: 'msg-user-1', parts: [{ type: 'text', text: 'Hello' }], role: 'user', createdAt: '2025-07-29T05:25:54.145Z' },
        { id: 'msg-asst-1', parts: [{ type: 'text', text: 'Hi there!' }], role: 'assistant', createdAt: '2025-07-29T05:25:55.116Z' },
      ];

        setupLocalStorage({
          'test-agent_sessionId': 'sess_restored_456',
          'test-agent_agentConfig': realisticTestData.agentConfig,
          'test-agent_chatMessages': storedMessages,
          'test-agent_customCss': 'body { background: blue; }',
        });

        render(() => <Bot agentName="test-agent" stream={true} persistSession={true} />);
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Verify no API call was made
        expect(getInitialChatReplyQuery).not.toHaveBeenCalled();

        // Verify component initialized with stored data using specific values
        expect(screen.getByTestId('session-id')).toHaveTextContent('sess_restored_456');
        expect(screen.getByTestId('persisted-messages-count')).toHaveTextContent('2');
      });

      // Test when persistSession=true but data exists in localStorage - should skip API call
      it('should skip API call when persistSession=true and complete session data exists', async () => {
        setupLocalStorage({
          'test-agent_sessionId': 'sess_restored_456',
          'test-agent_agentConfig': realisticTestData.agentConfig,
          'test-agent_chatMessages': [{ id: 'msg-1', parts: [{ type: 'text', text: 'test' }], role: 'user' }],
        });

        render(() => <Bot agentName="test-agent" persistSession={true} />);
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());
        
        // Verify no API call was made since data exists in localStorage
        expect(getInitialChatReplyQuery).not.toHaveBeenCalled();

        vi.clearAllMocks();

        // Test with persistSession=false - should call API even if data exists
        render(() => <Bot agentName="test-agent" persistSession={false} />);
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());
        verifyApiCallParams({ agentName: 'test-agent' });
      });
    });
  });

  describe('3. Session Expiration & Recovery Tests', () => {
    describe('3.1 Session Expiration Handling', () => {
      it('should clear storage and reset state when session expires', async () => {
        setupLocalStorage({
          'test-agent_sessionId': 'sess_expired_789',
          'test-agent_agentConfig': realisticTestData.agentConfig,
          'test-agent_chatMessages': [{ id: 'msg-1', parts: [{ type: 'text', text: 'test message' }], role: 'user', createdAt: '2025-07-29T05:25:54.145Z' }],
        });

        render(() => <Bot agentName="test-agent" stream={true} persistSession={true} />);
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Verify persisted messages are initially loaded with specific count
        expect(screen.getByTestId('persisted-messages-count')).toHaveTextContent('1');

        // Simulate session expiration
        const expireButton = screen.getByTestId('expire-session');
        expireButton.click();

        // Verify specific storage keys were cleared
        expect(localStorage.getItem('test-agent_sessionId')).toBeNull();
        expect(localStorage.getItem('test-agent_agentConfig')).toBeNull();
        expect(localStorage.getItem('test-agent_chatMessages')).toBeNull();

        // Verify persisted messages were reset immediately
        await waitFor(() => {
          expect(screen.getByTestId('persisted-messages-count')).toHaveTextContent('0');
        });
      });
    });

    describe('3.2 Session Recovery After Expiration', () => {
      it('should establish new session after expiration delay', async () => {
        vi.useFakeTimers();

        setupLocalStorage({
          'test-agent_sessionId': 'sess_expired_789',
          'test-agent_agentConfig': realisticTestData.agentConfig,
          'test-agent_chatMessages': [{ id: 'msg-1', parts: [{ type: 'text', text: 'test message' }], role: 'user' }],
        });

        render(() => <Bot agentName="test-agent" stream={true} persistSession={true} />);
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Clear mocks to track new API calls after expiration
        vi.clearAllMocks();
        (getInitialChatReplyQuery as any).mockResolvedValue({ data: mockApiResponse, error: null });

        // Simulate session expiration
        const expireButton = screen.getByTestId('expire-session');
        expireButton.click();

        // Fast-forward through the delay and flush promises
        await vi.advanceTimersByTimeAsync(1500);

        // Verify new session was established with specific parameters
        verifyApiCallParams({
          sessionId: undefined, // Should start fresh after expiration
          agentName: 'test-agent'
        });

        vi.useRealTimers();
      }, 10000);
    });
  });

  describe('5. Effect-Based Persistence Tests', () => {
    describe('5.1 Automatic Storage Updates', () => {
      it('should automatically store sessionId when API returns new data', async () => {
        render(() => <Bot agentName="test-agent" stream={true} persistSession={true} />);
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());
        
        // Verify localStorage is populated with realistic sessionId
        await waitForStorage('test-agent_sessionId');
        verifyStorageValue('test-agent_sessionId', realisticSessionId);
      });

      it('should automatically store agentConfig when API returns new data', async () => {
        render(() => <Bot agentName="test-agent" stream={true} persistSession={true} />);
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());
        
        await waitForStorage('test-agent_agentConfig');
        const storedConfig = JSON.parse(localStorage.getItem('test-agent_agentConfig') || '{}');
        
        // Verify specific structure matches realistic data
        expect(storedConfig.theme?.general?.font).toBe('Amita');
        expect(storedConfig.theme?.chat?.hostBubbles?.backgroundColor).toBe('#629720');
        expect(storedConfig.settings?.typingEmulation?.speed).toBe(300);
      });

      it('should automatically store customCss when present in API response', async () => {
        // Structure the response with customCss using realistic base data
        const responseWithCss = {
          ...mockApiResponse,
          agentConfig: {
            ...mockApiResponse.agentConfig,
            theme: {
              ...mockApiResponse.agentConfig.theme,
              customCss: 'body { font-size: 16px; }'
            }
          }
        };
        
        (getInitialChatReplyQuery as any).mockResolvedValue({ data: responseWithCss, error: null });

        render(() => <Bot agentName="test-agent" stream={true} persistSession={true} />);
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());
        
        await waitForStorage('test-agent_customCss');
        verifyStorageValue('test-agent_customCss', 'body { font-size: 16px; }');
      });

      it('should handle prop updates and maintain storage consistency', async () => {
        render(() => 
          <Bot 
            agentName="test-agent" 
            stream={true} 
            persistSession={true} 
            input={{ type: "text", placeholder: "Custom input" }}
          />
        );
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());
        
        // Wait for initial storage with realistic data
        await waitForStorage('test-agent_sessionId');
        await waitForStorage('test-agent_agentConfig');
        
        // Verify storage consistency with specific values
        verifyStorageStructure('test-agent', realisticSessionId);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      (getInitialChatReplyQuery as any).mockResolvedValue({
        data: null,
        error: { code: 'BAD_REQUEST' }
      });

      render(() => <Bot agentName="test-agent" />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('This agent is now closed.');
      });
    });

    it('should handle 404 errors with specific message', async () => {
      (getInitialChatReplyQuery as any).mockResolvedValue({
        data: null,
        error: { statusCode: 404 }
      });

      render(() => <Bot agentName="test-agent" />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent("The agent you're looking for doesn't exist.");
      });
    });
  });

  describe('Debug Mode', () => {
    it('should detect debug mode from localStorage', async () => {
      localStorage.setItem('debugMode', 'true');

      render(() => 
        <Bot 
          agentName="test-agent" 
          stream={true} 
          persistSession={true} 
        />
      );

      await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

      // Debug mode should be active - look for the version display element
      await waitFor(() => {
        const debugElement = document.querySelector('.absolute.bottom-0.w-full.text-center.text-gray-500');
        expect(debugElement).toBeInTheDocument();
      });
    });
  });
});
