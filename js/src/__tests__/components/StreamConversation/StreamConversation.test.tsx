import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { StreamConversation } from '@/components/StreamConversation/StreamConversation';
import { 
  createMockInitialChatReply,
  createMockAgentConfig,
  createMockBotContext,
  createMockUseChat
} from '../../test-utils';
import { useChat } from '@ai-sdk/solid';
import { getApiStreamEndPoint } from '@/utils/getApiEndPoint';
import { transformMessage } from '@/utils/transformMessages';

// Mock dependencies
vi.mock('@ai-sdk/solid');
vi.mock('@/utils/getApiEndPoint');
vi.mock('@/utils/transformMessages');

// Mock ChatChunk component to track props passed to it
vi.mock('@/components/StreamConversation/ChatChunk', () => ({
  ChatChunk: (props: any) => (
    <div data-testid="chat-chunk">
      <div data-testid="message-role">{props.message.role}</div>
      <div data-testid="message-content">{props.message.content}</div>
      <div data-testid="display-index">{props.displayIndex}</div>
      <div data-testid="is-persisted">{props.isPersisted ? 'true' : 'false'}</div>
      <div data-testid="has-input">{props.input ? 'true' : 'false'}</div>
      <div data-testid="has-streaming-handlers">{props.streamingHandlers ? 'true' : 'false'}</div>
    </div>
  ),
}));

// Mock LoadingChunk and ErrorChunk
vi.mock('@/components/StreamConversation/LoadingChunk', () => ({
  LoadingChunk: () => <div data-testid="loading-chunk">Loading...</div>,
  ErrorChunk: ({ message }: { message: string }) => (
    <div data-testid="error-chunk">{message}</div>
  ),
}));

describe('StreamConversation - Working Tests', () => {
  let mockUseChat: ReturnType<typeof createMockUseChat>;
  let mockGetApiStreamEndPoint: ReturnType<typeof vi.fn>;
  let mockTransformMessage: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Mock scrollTo function to prevent errors
    Element.prototype.scrollTo = vi.fn();
    
    // Setup default mocks
    mockUseChat = createMockUseChat({
      status: 'idle',
      messages: [],
      setMessages: vi.fn(),
      data: null,
      error: null,
      handleInputChange: vi.fn(),
      handleSubmit: vi.fn(),
    });
    
    mockGetApiStreamEndPoint = vi.fn(() => 'https://default-api.com/stream');
    mockTransformMessage = vi.fn((msg, role, input) => ({
      ...msg,
      role,
      id: `msg-${Math.random()}`,
      createdAt: new Date(),
    }));

    (useChat as any).mockReturnValue(mockUseChat);
    (getApiStreamEndPoint as any).mockImplementation(mockGetApiStreamEndPoint);
    (transformMessage as any).mockImplementation(mockTransformMessage);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper function to create test props
  const createTestProps = (overrides = {}) => {
    return {
      initialAgentReply: createMockInitialChatReply(),
      persistedMessages: [],
      agentConfig: createMockAgentConfig(),
      context: {
        ...createMockBotContext(),
        sessionId: 'test-session',
        agentName: 'test-agent',
        apiStreamHost: '',
      },
      onSessionExpired: vi.fn(),
      ...overrides,
    };
  };

  describe('1. Initial Message Bootstrapping', () => {
    it('should initialize with persisted messages and mark them as persisted', () => {
      const persistedMessages = [
        { id: '1', role: 'assistant', content: 'Hello', createdAt: new Date() },
        { id: '2', role: 'user', content: 'Hi', createdAt: new Date() }
      ];

      const expectedMessagesWithPersisted = persistedMessages.map(msg => ({
        ...msg,
        isPersisted: true
      }));

      mockUseChat.messages = expectedMessagesWithPersisted;

      const props = createTestProps({
        persistedMessages,
      });

      render(() => <StreamConversation {...props} />);

      // Verify useChat was called with persisted messages marked as isPersisted: true
      expect(useChat).toHaveBeenCalledWith(
        expect.objectContaining({
          initialMessages: expectedMessagesWithPersisted
        })
      );

      // Verify ChatChunk components are rendered
      const chatChunks = screen.getAllByTestId('chat-chunk');
      expect(chatChunks).toHaveLength(2);

      // Verify persisted status is passed correctly
      expect(screen.getAllByTestId('is-persisted')[0]).toHaveTextContent('true');
      expect(screen.getAllByTestId('is-persisted')[1]).toHaveTextContent('true');
    });

    it('should initialize with transformed initial agent messages when no persisted messages', () => {
      const initialMessages = [
        { type: 'text', content: { richText: [{ type: 'p', children: [{ text: 'Welcome' }] }] } }
      ];

      const transformedMessage = {
        id: 'msg-1',
        role: 'assistant',
        content: 'Welcome',
        createdAt: new Date(),
        isPersisted: false
      };

      mockTransformMessage.mockReturnValue(transformedMessage);
      mockUseChat.messages = [transformedMessage];

      const props = createTestProps({
        initialAgentReply: {
          ...createMockInitialChatReply(),
          messages: initialMessages,
        },
        persistedMessages: [], // No persisted messages
      });

      render(() => <StreamConversation {...props} />);

      // Verify transformMessage was called
      expect(transformMessage).toHaveBeenCalledWith(
        initialMessages[0],
        'assistant',
        props.initialAgentReply.input
      );

      // Verify useChat was called with transformed messages
      expect(useChat).toHaveBeenCalledWith(
        expect.objectContaining({
          initialMessages: [{ ...transformedMessage, isPersisted: false }]
        })
      );

      // Verify message is not marked as persisted
      expect(screen.getByTestId('is-persisted')).toHaveTextContent('false');
    });

    it('should handle empty state with no messages', () => {
      mockUseChat.messages = [];

      const props = createTestProps({
        persistedMessages: [],
        initialAgentReply: {
          ...createMockInitialChatReply(),
          messages: [],
        },
      });

      const { container } = render(() => <StreamConversation {...props} />);

      // Verify no ChatChunk components are rendered
      expect(screen.queryByTestId('chat-chunk')).toBeNull();

      // Verify container structure is still present
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('2. Chat API Wiring (Vercel AI SDK)', () => {
    it('should use custom apiStreamHost when provided', () => {
      const customApiHost = 'https://custom-stream.com/api';
      
      const props = createTestProps({
        context: {
          ...createMockBotContext(),
          apiStreamHost: customApiHost,
        },
      });

      render(() => <StreamConversation {...props} />);

      expect(useChat).toHaveBeenCalledWith(
        expect.objectContaining({
          api: customApiHost,
          streamProtocol: 'data',
        })
      );
    });

    it('should use default endpoint when apiStreamHost is empty', () => {
      const props = createTestProps({
        context: {
          ...createMockBotContext(),
          apiStreamHost: '',
        },
      });

      render(() => <StreamConversation {...props} />);

      expect(getApiStreamEndPoint).toHaveBeenCalled();
      expect(useChat).toHaveBeenCalledWith(
        expect.objectContaining({
          api: 'https://default-api.com/stream',
        })
      );
    });

    it('should prepare request body with only last message content, sessionId, and agentName', () => {
      const props = createTestProps();
      
      render(() => <StreamConversation {...props} />);

      const useChatCall = (useChat as any).mock.calls[0][0];
      const prepareRequestBody = useChatCall.experimental_prepareRequestBody;

      const mockMessages = [
        { content: 'First message' },
        { content: 'Last message' }
      ];

      const result = prepareRequestBody({ messages: mockMessages });

      expect(result).toEqual({
        message: 'Last message',
        sessionId: 'test-session',
        agentName: 'test-agent',
      });
    });

    it('should call onSessionExpired when error message is session expired', () => {
      const onSessionExpired = vi.fn();
      const props = createTestProps({ onSessionExpired });
      
      render(() => <StreamConversation {...props} />);

      const useChatCall = (useChat as any).mock.calls[0][0];
      const onError = useChatCall.onError;

      // Simulate session expired error
      onError({ message: 'Session expired. Starting a new session.' });

      expect(onSessionExpired).toHaveBeenCalled();
    });

    it('should not call onSessionExpired for other errors', () => {
      const onSessionExpired = vi.fn();
      const props = createTestProps({ onSessionExpired });
      
      render(() => <StreamConversation {...props} />);

      const useChatCall = (useChat as any).mock.calls[0][0];
      const onError = useChatCall.onError;

      // Simulate different error
      onError({ message: 'Network error' });

      expect(onSessionExpired).not.toHaveBeenCalled();
    });
  });

  describe('3. Local Message Persistence', () => {
    it('should save messages to localStorage with agent name prefix', () => {
      const messages = [
        { id: '1', role: 'assistant', content: 'Hello' }
      ];

      mockUseChat.messages = messages;

      const props = createTestProps({
        context: {
          ...createMockBotContext(),
          agentName: 'test-agent',
        },
      });

      render(() => <StreamConversation {...props} />);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'test-agent_chatMessages',
        JSON.stringify(messages)
      );
    });

    it('should save messages to localStorage without prefix when no agent name', () => {
      const messages = [
        { id: '1', role: 'assistant', content: 'Hello' }
      ];

      mockUseChat.messages = messages;

      const props = createTestProps({
        context: {
          ...createMockBotContext(),
          agentName: '',
        },
      });

      render(() => <StreamConversation {...props} />);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'chatMessages',
        JSON.stringify(messages)
      );
    });
  });

  describe('4. Error and Toast UI', () => {
    it('should display ErrorChunk when error is present', () => {
      const errorMessage = 'Network connection failed';
      mockUseChat.error = { message: errorMessage };

      const props = createTestProps();

      render(() => <StreamConversation {...props} />);

      expect(screen.getByTestId('error-chunk')).toHaveTextContent(errorMessage);
    });

    it('should not display ErrorChunk when no error', () => {
      mockUseChat.error = null;

      const props = createTestProps();

      render(() => <StreamConversation {...props} />);

      expect(screen.queryByTestId('error-chunk')).toBeNull();
    });
  });

  describe('5. Message Rendering & Filtering', () => {
    it('should render correct number of ChatChunk components for all messages', () => {
      const messages = [
        { id: '1', role: 'assistant', content: 'Hello' },
        { id: '2', role: 'user', content: 'Hi' },
        { id: '3', role: 'assistant', content: 'How can I help?' }
      ];

      mockUseChat.messages = messages;

      const props = createTestProps();

      render(() => <StreamConversation {...props} />);

      const chatChunks = screen.getAllByTestId('chat-chunk');
      expect(chatChunks).toHaveLength(3);
    });

    it('should pass input prop only to assistant messages', () => {
      const messages = [
        { id: '1', role: 'assistant', content: 'Hello' },
        { id: '2', role: 'user', content: 'Hi' },
        { id: '3', role: 'assistant', content: 'How can I help?' }
      ];

      mockUseChat.messages = messages;

      const props = createTestProps();

      render(() => <StreamConversation {...props} />);

      const hasInputElements = screen.getAllByTestId('has-input');
      
      // First message (assistant) should have input
      expect(hasInputElements[0]).toHaveTextContent('true');
      // Second message (user) should not have input
      expect(hasInputElements[1]).toHaveTextContent('false');
      // Third message (assistant) should have input
      expect(hasInputElements[2]).toHaveTextContent('true');
    });

    it('should correctly propagate isPersisted status to ChatChunk components', () => {
      const messages = [
        { id: '1', role: 'assistant', content: 'Hello', isPersisted: true },
        { id: '2', role: 'user', content: 'Hi', isPersisted: false }
      ];

      mockUseChat.messages = messages;

      const props = createTestProps();

      render(() => <StreamConversation {...props} />);

      const isPersistedElements = screen.getAllByTestId('is-persisted');
      
      expect(isPersistedElements[0]).toHaveTextContent('true');
      expect(isPersistedElements[1]).toHaveTextContent('false');
    });
  });

  describe('6. Styling/Layout', () => {
    it('should render container with correct CSS classes', () => {
      const props = createTestProps();

      const { container } = render(() => <StreamConversation {...props} />);

      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass(
        'flex',
        'flex-col', 
        'overflow-y-scroll',
        'w-full',
        'min-h-full',
        'px-3',
        'pt-10',
        'relative',
        'scrollable-container',
        'agent-chat-view',
        'chat-container',
        'gap-2'
      );
    });

    it('should render BottomSpacer at the end', () => {
      const props = createTestProps();

      const { container } = render(() => <StreamConversation {...props} />);

      // Check that the last element has the spacer classes
      const mainContainer = container.firstChild as HTMLElement;
      const lastChild = mainContainer.lastElementChild as HTMLElement;
      expect(lastChild).toHaveClass('w-full', 'h-32', 'flex-shrink-0');
    });
  });
});