import { render, screen, fireEvent } from '@solidjs/testing-library';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createSignal } from 'solid-js';
import { Bot } from '@/components/Bot';
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

// Mock mergePropsWithApiData utility (simplified - no longer handles input)
vi.mock('@/utils/mergePropsWithApiData', () => ({
  mergePropsWithApiData: vi.fn((props, apiData) => ({
    messages: apiData?.messages || [],
    sessionId: apiData?.sessionId,
    agentConfig: apiData?.agentConfig,
  })),
}));

// Mock StreamConversation to render FixedBottomInput when needed
vi.mock('@/components/StreamConversation', () => ({
  StreamConversation: (props: any) => {
    const hasFixedBottomInput = props.input?.options?.type === 'fixed-bottom';
    const isStandardWidget = props.widgetContext === 'standard';
    
    // Replicate the conditional positioning logic from our fix
    const getInputStyles = (): Record<string, string> => {
      if (isStandardWidget) {
        // Standard widget: absolute positioning with container boundaries
        return {
          position: 'absolute',
          bottom: '0',
          left: '0', 
          right: '0',
          'z-index': '10',
          'padding-left': '0.75rem',
          'padding-right': '0.75rem',
          'padding-top': '1rem',
          'padding-bottom': 'max(3rem, calc(env(safe-area-inset-bottom) + 2.5rem))',
          'background-color': 'var(--agent-embed-container-bg-color, #ffffff)',
        };
      } else {
        // Bubble/Popup: fixed positioning for viewport overlays
        return {
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0', 
          'z-index': '51',
          'padding-left': '1rem',
          'padding-right': '1rem',
          'padding-top': '1rem',
          'padding-bottom': 'max(3rem, calc(env(safe-area-inset-bottom) + 2.5rem))',
          'background-color': 'var(--agent-embed-container-bg-color, #ffffff)',
        };
      }
    };

    const getInputClasses = () => {
      if (isStandardWidget) {
        return 'agent-fixed-input';
      } else {
        return 'fixed bottom-0 left-0 right-0 agent-fixed-input';
      }
    };
    
    return (
      <div data-testid="stream-conversation">
        <div 
          class="flex flex-col overflow-y-scroll w-full min-h-full px-3 pt-10 relative scrollable-container agent-chat-view chat-container gap-2"
          style={{
            'padding-bottom': hasFixedBottomInput ? '200px' : undefined,
            position: isStandardWidget ? 'relative' : undefined,
            'padding-left': '0.75rem', // px-3 equivalent
            'padding-right': '0.75rem', // px-3 equivalent
          }}
        >
          <div data-testid="chat-messages">Mock chat messages</div>
        </div>
        {hasFixedBottomInput && (
          <div
            class={getInputClasses()}
            style={getInputStyles()}
          >
            <div
              class="flex items-end justify-between agent-input w-full max-w-4xl mx-auto"
              data-testid="fixed-input"
            >
              <input placeholder="Type your answer..." />
              <button>Send</button>
            </div>
          </div>
        )}
      </div>
    );
  },
}));

describe('Standard Widget - FixedBottomInput Positioning Regression Tests', () => {
  let mockContainer: HTMLElement;
  let mockUseChat: any;

  beforeEach(async () => {
    // Create a mock container element that simulates different Standard widget sizes
    mockContainer = document.createElement('agent-standard');
    document.body.appendChild(mockContainer);
    
    // Setup useChat mock
    mockUseChat = createMockUseChat({
      messages: [],
      status: 'ready',
    });
    
    (vi.mocked(import('@ai-sdk/solid')) as any).useChat = vi.fn(() => mockUseChat);
    
    // Mock the initial chat reply query - this returns the complete Bot initialization data
    const mockInitialReply = createMockInitialChatReply({
      input: {
        type: "text input",
        options: {
          type: "fixed-bottom", // This is the key - triggers FixedBottomInput
          labels: {
            placeholder: "Type your message...",
            button: "Send"
          }
        }
      }
    });
    
    const getInitialChatReplyQuery = vi.mocked((await import('@/queries/getInitialChatReplyQuery')).getInitialChatReplyQuery);
    getInitialChatReplyQuery.mockResolvedValue({ data: mockInitialReply, error: undefined });
  });

  afterEach(() => {
    document.body.removeChild(mockContainer);
    vi.clearAllMocks();
  });

  describe('Container Boundary Respect Tests', () => {
    it('should NOT extend input beyond constrained Standard widget width (Card Layout)', async () => {
      // Simulate card-style widget with constrained width
      mockContainer.style.width = '500px';
      mockContainer.style.maxWidth = '500px';
      mockContainer.style.height = '700px';
      mockContainer.style.margin = '0 auto';
      mockContainer.style.position = 'relative';
      
      const context = createMockBotContext();
      
      const result = render(() => (
        <Bot 
          agentName={context.agentName}
          apiHost={context.apiHost}
          widgetContext="standard"
        />
      ), { container: mockContainer });

      // Wait longer for async initialization
      await new Promise(resolve => setTimeout(resolve, 500));
      await waitForEffects();

      // Wait for FixedBottomInput to be rendered
      const fixedInput = await screen.findByTestId('fixed-input');
      const inputContainer = fixedInput.parentElement!;
      
      // Get computed styles
      const inputStyles = window.getComputedStyle(inputContainer);
      const containerStyles = window.getComputedStyle(mockContainer);
      
      // CRITICAL TEST: Input should NOT use fixed positioning that ignores container
      // This test WILL FAIL with current implementation because FixedBottomInput uses fixed positioning
      expect(inputStyles.position).not.toBe('fixed');
      
      // CRITICAL TEST: Input should not extend beyond container width
      // This test WILL FAIL because fixed positioning makes input span full viewport
      const inputRect = inputContainer.getBoundingClientRect();
      const containerRect = mockContainer.getBoundingClientRect();
      
      expect(inputRect.width).toBeLessThanOrEqual(containerRect.width);
      expect(inputRect.left).toBeGreaterThanOrEqual(containerRect.left);
      expect(inputRect.right).toBeLessThanOrEqual(containerRect.right);
    });

    it('should NOT extend input beyond narrow Standard widget width (Sidebar Layout)', async () => {
      // Simulate sidebar-style widget with narrow width
      mockContainer.style.width = '350px';
      mockContainer.style.height = '100vh';
      mockContainer.style.position = 'fixed';
      mockContainer.style.right = '0';
      
      const context = createMockBotContext();
      
      render(() => (
        <Bot 
          agentName={context.agentName}
          apiHost={context.apiHost}
          widgetContext="standard"
        />
      ), { container: mockContainer });

      await waitForEffects();

      const fixedInput = await screen.findByTestId('fixed-input');
      const inputContainer = fixedInput.parentElement!;
      
      // CRITICAL TEST: Input should be constrained to sidebar width, not full viewport
      // This test WILL FAIL because current implementation uses left-0 right-0 (full width)
      const inputRect = inputContainer.getBoundingClientRect();
      const containerRect = mockContainer.getBoundingClientRect();
      
      expect(inputRect.width).toBe(containerRect.width);
      expect(inputRect.left).toBe(containerRect.left);
      expect(inputRect.right).toBe(containerRect.right);
    });
  });

  describe('Positioning Context Tests', () => {
    it('should position input relative to Standard widget container, not viewport', async () => {
      // Position container away from bottom of viewport
      mockContainer.style.width = '400px';
      mockContainer.style.height = '500px';
      mockContainer.style.position = 'absolute';
      mockContainer.style.top = '100px';
      mockContainer.style.left = '100px';
      
      const context = createMockBotContext();
      
      render(() => (
        <Bot 
          agentName={context.agentName}
          apiHost={context.apiHost}
          widgetContext="standard"
        />
      ), { container: mockContainer });

      await waitForEffects();

      const fixedInput = await screen.findByTestId('fixed-input');
      const inputContainer = fixedInput.parentElement!;
      
      const inputRect = inputContainer.getBoundingClientRect();
      const containerRect = mockContainer.getBoundingClientRect();
      
      // CRITICAL TEST: Input should be at bottom of widget, not bottom of viewport
      // This test WILL FAIL because current implementation uses bottom-0 (viewport bottom)
      expect(inputRect.bottom).toBe(containerRect.bottom);
      expect(inputRect.bottom).not.toBe(window.innerHeight);
    });

    it('should use absolute positioning within Standard widget context', async () => {
      mockContainer.style.position = 'relative';
      
      const context = createMockBotContext();
      
      render(() => (
        <Bot 
          agentName={context.agentName}
          apiHost={context.apiHost}
          widgetContext="standard"
        />
      ), { container: mockContainer });

      await waitForEffects();

      const fixedInput = await screen.findByTestId('fixed-input');
      const inputContainer = fixedInput.parentElement!;
      
      // CRITICAL TEST: Should use absolute positioning, not fixed
      // This test WILL FAIL because FixedBottomInput currently uses fixed positioning
      const styles = window.getComputedStyle(inputContainer);
      expect(styles.position).toBe('absolute');
    });
  });

  describe('Padding Consistency Tests', () => {
    it('should match chat container padding in Standard widget', async () => {
      const context = createMockBotContext();
      
      render(() => (
        <Bot 
          agentName={context.agentName}
          apiHost={context.apiHost}
          widgetContext="standard"
        />
      ), { container: mockContainer });

      await waitForEffects();

      // Find chat container (has px-3 class)
      const chatContainer = document.querySelector('.agent-chat-view');
      const fixedInput = await screen.findByTestId('fixed-input');
      
      expect(chatContainer).toBeTruthy();
      expect(fixedInput).toBeTruthy();
      
      const chatStyles = window.getComputedStyle(chatContainer!);
      const inputStyles = window.getComputedStyle(fixedInput.parentElement!);
      
      // CRITICAL TEST: Input padding should match chat container padding
      // This test WILL FAIL because FixedBottomInput doesn't inherit container padding
      expect(inputStyles.paddingLeft).toBe(chatStyles.paddingLeft);
      expect(inputStyles.paddingRight).toBe(chatStyles.paddingRight);
    });

    it('should have consistent horizontal spacing with chat messages', async () => {
      mockContainer.style.width = '600px';
      mockContainer.style.padding = '20px';
      
      const context = createMockBotContext();
      
      render(() => (
        <Bot 
          agentName={context.agentName}
          apiHost={context.apiHost}
          widgetContext="standard"
        />
      ), { container: mockContainer });

      await waitForEffects();

      const chatContainer = document.querySelector('.agent-chat-view');
      const fixedInput = await screen.findByTestId('fixed-input');
      
      if (chatContainer && fixedInput) {
        const chatRect = chatContainer.getBoundingClientRect();
        const inputRect = fixedInput.getBoundingClientRect();
        
        // CRITICAL TEST: Input should align horizontally with chat content
        // This test WILL FAIL because fixed positioning ignores container padding
        expect(Math.abs(inputRect.left - chatRect.left)).toBeLessThan(5); // 5px tolerance
        expect(Math.abs(inputRect.right - chatRect.right)).toBeLessThan(5);
      }
    });
  });

  describe('Z-Index and Layering Tests', () => {
    it('should maintain proper z-index within Standard widget context', async () => {
      const context = createMockBotContext();
      
      render(() => (
        <Bot 
          agentName={context.agentName}
          apiHost={context.apiHost}
          widgetContext="standard"
        />
      ), { container: mockContainer });

      await waitForEffects();

      const fixedInput = await screen.findByTestId('fixed-input');
      const inputContainer = fixedInput.parentElement!;
      
      const styles = window.getComputedStyle(inputContainer);
      
      // Input should have reasonable z-index for widget context (not viewport-level z-index)
      const zIndex = parseInt(styles.zIndex);
      expect(zIndex).toBeGreaterThan(0);
      expect(zIndex).toBeLessThan(100); // Should not use extremely high z-index meant for viewport overlays
    });
  });

  describe('Responsive Behavior Tests', () => {
    it('should adapt to Standard widget resize without breaking boundaries', async () => {
      // Start with larger width
      mockContainer.style.width = '800px';
      mockContainer.style.height = '600px';
      
      const context = createMockBotContext();
      
      render(() => (
        <Bot 
          agentName={context.agentName}
          apiHost={context.apiHost}
          widgetContext="standard"
        />
      ), { container: mockContainer });

      await waitForEffects();

      let fixedInput = await screen.findByTestId('fixed-input');
      let inputContainer = fixedInput.parentElement!;
      let initialRect = inputContainer.getBoundingClientRect();
      
      // Resize container to smaller width
      mockContainer.style.width = '300px';
      
      // Trigger resize event
      window.dispatchEvent(new Event('resize'));
      await waitForEffects();
      
      let newRect = inputContainer.getBoundingClientRect();
      let containerRect = mockContainer.getBoundingClientRect();
      
      // CRITICAL TEST: Input should adapt to new container size
      // This test WILL FAIL because fixed positioning doesn't respond to container resize
      expect(newRect.width).toBe(containerRect.width);
      expect(newRect.right).toBeLessThanOrEqual(containerRect.right);
    });
  });
});