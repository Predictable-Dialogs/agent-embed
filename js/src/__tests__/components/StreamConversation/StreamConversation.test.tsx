import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@solidjs/testing-library';
import { StreamConversation } from '@/components/StreamConversation/StreamConversation';
import { 
  createMockInitialChatReply,
  createMockAgentConfig,
  createMockBotContext,
  createMockUseChat
} from '../../test-utils';
import { useChat } from 'ai-sdk-solid';
import { getApiStreamEndPoint } from '@/utils/getApiEndPoint';
import { transformMessage } from '@/utils/transformMessages';

// Mock dependencies
vi.mock('ai-sdk-solid');
vi.mock('@/utils/getApiEndPoint');
vi.mock('@/utils/transformMessages');

// Mock ChatChunk component to track props passed to it
vi.mock('@/components/StreamConversation/ChatChunk', () => ({
  ChatChunk: (props: any) => (
    <div data-testid="chat-chunk">
      <div data-testid="message-role">{props.message.role}</div>
      <div data-testid="message-content">
        {props.message.parts?.find((part: any) => part.type === 'text')?.text}
      </div>
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
    mockTransformMessage = vi.fn((msg, role) => ({
      ...msg,
      role,
      id: `msg-${Math.random()}`,
      createdAt: new Date(),
      parts: [{ type: 'text', text: 'transformed-message' }],
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
      input: { type: 'test-input', options: { labels: { placeholder: 'Test placeholder' } } },
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
        { id: '1', role: 'assistant', parts: [{ type: 'text', text: 'Hello' }], createdAt: new Date() },
        { id: '2', role: 'user', parts: [{ type: 'text', text: 'Hi' }], createdAt: new Date() }
      ];

      mockUseChat.messages = persistedMessages.map((message) => ({ ...message, isPersisted: true }));

      const props = createTestProps({
        persistedMessages,
      });

      render(() => <StreamConversation {...props} />);

      const useChatCall = (useChat as any).mock.calls[0][0];
      expect(useChatCall.messages).toHaveLength(persistedMessages.length);
      useChatCall.messages.forEach((message: any) => {
        expect(message.isPersisted).toBe(true);
      });

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
        parts: [{ type: 'text', text: 'Welcome' }],
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
        props.input
      );

      const useChatCall = (useChat as any).mock.calls[0][0];
      expect(useChatCall.messages).toEqual([{ ...transformedMessage, isPersisted: false }]);

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

      const useChatCall = (useChat as any).mock.calls[0][0];
      expect(useChatCall.transport.api).toBe(customApiHost);
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
      const useChatCall = (useChat as any).mock.calls[0][0];
      expect(useChatCall.transport.api).toBe('https://default-api.com/stream');
    });

    // it('should prepare request body with only last message content, sessionId, and agentName', () => {
    //   const props = createTestProps();
      
    //   const mockMessages = [
    //     {
    //       content: 'First message',
    //       parts: [{ type: 'text', text: 'First message' }],
    //     },
    //     {
    //       content: 'Last message',
    //       parts: [{ type: 'text', text: 'Last message' }],
    //     },
    //   ];

    //   mockUseChat.messages = mockMessages;

    //   render(() => <StreamConversation {...props} />);

    //   const useChatCall = (useChat as any).mock.calls[0][0];
    //   const prepareRequestBody = useChatCall.transport.prepareSendMessagesRequest;

    //   const result = prepareRequestBody({});

    //   expect(result).toEqual({
    //     body: {
    //       message: 'Last message',
    //       sessionId: 'test-session',
    //       agentName: 'test-agent',
    //     }
    //   });
    // });

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
        { id: '1', role: 'assistant', parts: [{ type: 'text', text: 'Hello' }] }
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
        { id: '1', role: 'assistant', parts: [{ type: 'text', text: 'Hello' }] }
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
        { id: '1', role: 'assistant', parts: [{ type: 'text', text: 'Hello' }] },
        { id: '2', role: 'user', parts: [{ type: 'text', text: 'Hi' }] },
        { id: '3', role: 'assistant', parts: [{ type: 'text', text: 'How can I help?' }] }
      ];

      mockUseChat.messages = messages;

      const props = createTestProps();

      render(() => <StreamConversation {...props} />);

      const chatChunks = screen.getAllByTestId('chat-chunk');
      expect(chatChunks).toHaveLength(3);
    });

    it('should pass input prop only to assistant messages', () => {
      const messages = [
        { id: '1', role: 'assistant', parts: [{ type: 'text', text: 'Hello' }] },
        { id: '2', role: 'user', parts: [{ type: 'text', text: 'Hi' }] },
        { id: '3', role: 'assistant', parts: [{ type: 'text', text: 'How can I help?' }] }
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
        { id: '1', role: 'assistant', parts: [{ type: 'text', text: 'Hello' }], isPersisted: true },
        { id: '2', role: 'user', parts: [{ type: 'text', text: 'Hi' }], isPersisted: false }
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
        'h-full',
        'px-3',
        'pt-10',
        'relative',
        'scrollable-container',
        'agent-chat-view',
        'chat-container',
        'gap-2',
        'overflow-y-scroll'
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
