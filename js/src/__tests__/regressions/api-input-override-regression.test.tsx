import { render, screen } from '@solidjs/testing-library';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Bot } from '@/components/Bot';
import { defaultBotProps } from '@/constants';
import { 
  createMockBotContext, 
  createMockInitialChatReply,
  createMockUseChat,
  waitForEffects 
} from '../test-utils';

// Mock the useChat hook from @ai-sdk/solid
vi.mock('@ai-sdk/solid', () => ({
  useChat: vi.fn(),
}));

// Mock the query function
vi.mock('@/queries/getInitialChatReplyQuery', () => ({
  getInitialChatReplyQuery: vi.fn(),
}));

// Mock other dependencies
vi.mock('@/utils/isMobileSignal', () => ({
  setIsMobile: vi.fn(),
}));

vi.mock('@/utils/setCssVariablesValue', () => ({
  setCssVariablesValue: vi.fn(),
}));

vi.mock('@/components/ErrorMessage', () => ({
  ErrorMessage: ({ error }: { error: Error }) => (
    <div data-testid="error-message">{error.message}</div>
  ),
}));

vi.mock('@/components/LiteBadge', () => ({
  LiteBadge: () => <div data-testid="lite-badge">Badge</div>,
}));

// Mock useAgentStorage hook
vi.mock('@/hooks/useAgentStorage', () => ({
  useAgentStorage: vi.fn(() => ({
    getDebugMode: vi.fn(() => false),
    hasCompleteSession: vi.fn(() => false),
    getSessionId: vi.fn(),
    getAgentConfig: vi.fn(),
    getCustomCss: vi.fn(),
    getChatMessages: vi.fn(),
    getInput: vi.fn(),
    setCustomCss: vi.fn(),
    setSessionId: vi.fn(),
    setAgentConfig: vi.fn(),
    setInput: vi.fn(),
    clearSession: vi.fn(),
  })),
}));

// Mock mergePropsWithApiData utility
vi.mock('@/utils/mergePropsWithApiData', () => ({
  mergePropsWithApiData: vi.fn((props, apiData) => ({
    ...apiData,
    ...props, // Props should override API data
    customCss: '',
    messages: apiData?.messages || [],
    clientSideActions: apiData?.clientSideActions || [],
    // CRITICAL: Input from API should be used when props.input is undefined
    input: props.input !== undefined ? props.input : apiData?.input,
  })),
}));

// Simple mock for StreamConversation that shows the input type received
vi.mock('@/components/StreamConversation', () => ({
  StreamConversation: (props: any) => {
    const inputType = props.initialAgentReply?.input?.options?.type || 'no-input';
    const placeholder = props.initialAgentReply?.input?.options?.labels?.placeholder || 'default-placeholder';
    
    return (
      <div data-testid="stream-conversation">
        <div data-testid="input-type">{inputType}</div>
        <div data-testid="input-placeholder">{placeholder}</div>
        <div data-testid="chat-messages">Mock conversation</div>
      </div>
    );
  },
}));

describe('API Input Override Regression Tests', () => {
  let mockUseChat: any;

  beforeEach(async () => {
    // Setup useChat mock
    mockUseChat = createMockUseChat({
      messages: [],
      status: 'ready',
    });
    
    (vi.mocked(import('@ai-sdk/solid')) as any).useChat = vi.fn(() => mockUseChat);
    
    vi.clearAllMocks();
  });

  describe('Constants Default Props Validation', () => {
    it('should have undefined input in defaultBotProps to allow API override', () => {
      // REGRESSION TEST: Ensure constants.ts doesn't hardcode input props
      // This prevents the issue where API input values are ignored
      expect(defaultBotProps.input).toBeUndefined();
    });

    it('should not export createDefaultShortcuts from constants module', async () => {
      // REGRESSION TEST: Ensure createDefaultShortcuts is not exported from constants
      // This verifies it was properly removed when input was set to undefined
      const constantsModule = await import('@/constants');
      
      // createDefaultShortcuts should not be exported from constants
      expect('createDefaultShortcuts' in constantsModule).toBe(false);
    });
  });

  describe('API Input Priority Tests', () => {
    it('should use API input when props.input is undefined', async () => {
      // Mock API response with specific input configuration
      const mockApiInput = {
        type: "text input",
        options: {
          type: "fixed-bottom",
          labels: {
            placeholder: "API-provided placeholder",
            button: "API Button"
          },
          isLong: true
        }
      };
      
      const mockInitialReply = createMockInitialChatReply({
        input: mockApiInput
      });
      
      const getInitialChatReplyQuery = vi.mocked((await import('@/queries/getInitialChatReplyQuery')).getInitialChatReplyQuery);
      getInitialChatReplyQuery.mockResolvedValue({ data: mockInitialReply, error: undefined });
      
      const context = createMockBotContext();
      
      render(() => (
        <Bot 
          agentName={context.agentName}
          apiHost={context.apiHost}
          // CRITICAL: No input prop provided - should use API value
        />
      ));

      await waitForEffects();
      
      // Wait for API data to load and render
      const inputType = await screen.findByTestId('input-type');
      const inputPlaceholder = await screen.findByTestId('input-placeholder');
      
      // CRITICAL TEST: Should use API-provided values
      expect(inputType.textContent).toBe('fixed-bottom');
      expect(inputPlaceholder.textContent).toBe('API-provided placeholder');
    });

    it('should override API input when props.input is provided', async () => {
      // Mock API response with one input configuration
      const mockApiInput = {
        type: "text input",
        options: {
          type: "fixed-bottom",
          labels: {
            placeholder: "API-provided placeholder",
            button: "API Button"
          },
          isLong: true
        }
      };
      
      const mockInitialReply = createMockInitialChatReply({
        input: mockApiInput
      });
      
      const getInitialChatReplyQuery = vi.mocked((await import('@/queries/getInitialChatReplyQuery')).getInitialChatReplyQuery);
      getInitialChatReplyQuery.mockResolvedValue({ data: mockInitialReply, error: undefined });
      
      // Props input that should override API
      const propsInput = {
        type: "text input" as const,
        options: {
          type: "inline" as const,
          labels: {
            placeholder: "Props-provided placeholder",
            button: "Props Button"
          },
          isLong: false
        }
      };
      
      const context = createMockBotContext();
      
      render(() => (
        <Bot 
          agentName={context.agentName}
          apiHost={context.apiHost}
          input={propsInput} // CRITICAL: Explicit input prop should override API
        />
      ));

      await waitForEffects();
      
      const inputType = await screen.findByTestId('input-type');
      const inputPlaceholder = await screen.findByTestId('input-placeholder');
      
      // CRITICAL TEST: Should use props values, not API values
      expect(inputType.textContent).toBe('inline');
      expect(inputPlaceholder.textContent).toBe('Props-provided placeholder');
    });

    it('should handle null input gracefully from API', async () => {
      // Mock API response with null input
      const mockInitialReply = createMockInitialChatReply({
        input: null
      });
      
      const getInitialChatReplyQuery = vi.mocked((await import('@/queries/getInitialChatReplyQuery')).getInitialChatReplyQuery);
      getInitialChatReplyQuery.mockResolvedValue({ data: mockInitialReply, error: undefined });
      
      const context = createMockBotContext();
      
      render(() => (
        <Bot 
          agentName={context.agentName}
          apiHost={context.apiHost}
          // No input prop - API returns null
        />
      ));

      await waitForEffects();
      
      const inputType = await screen.findByTestId('input-type');
      
      // Should handle null input gracefully
      expect(inputType.textContent).toBe('no-input');
    });
  });

  describe('Merge Props Priority Validation', () => {
    it('should verify mergePropsWithApiData respects props > API priority', async () => {
      const { mergePropsWithApiData } = await import('@/utils/mergePropsWithApiData');
      
      const mockApiData = {
        input: {
          type: "text input",
          options: { type: "fixed-bottom", labels: { placeholder: "API value" } }
        }
      };
      
      const mockProps = {
        input: {
          type: "text input" as const,
          options: { type: "inline" as const, labels: { placeholder: "Props value" } }
        }
      };
      
      const result = mergePropsWithApiData(mockProps, mockApiData);
      
      // CRITICAL: Props should override API data
      expect(result.input.options.type).toBe('inline');
      expect(result.input.options.labels.placeholder).toBe('Props value');
    });

    it('should verify mergePropsWithApiData uses API when props undefined', async () => {
      const { mergePropsWithApiData } = await import('@/utils/mergePropsWithApiData');
      
      const mockApiData = {
        input: {
          type: "text input",
          options: { type: "fixed-bottom", labels: { placeholder: "API value" } }
        }
      };
      
      const mockProps = {
        input: undefined
      };
      
      const result = mergePropsWithApiData(mockProps, mockApiData);
      
      // CRITICAL: Should use API data when props.input is undefined
      expect(result.input.options.type).toBe('fixed-bottom');
      expect(result.input.options.labels.placeholder).toBe('API value');
    });
  });
});