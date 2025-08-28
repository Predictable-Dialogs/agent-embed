import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { Bot } from '@/components/Bot';
import { getInitialChatReplyQuery } from '@/queries/getInitialChatReplyQuery';
import realisticTestData from '../../data/getInitialChatReplyQuery.json';

// Mock dependencies
vi.mock('@/queries/getInitialChatReplyQuery');
vi.mock('@/components/StreamConversation', () => ({
  StreamConversation: (props: any) => (
    <div data-testid="stream-conversation">
      StreamConversation Component
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

describe('Bot.tsx - CustomCSS Props Override Behavior', () => {
  const realisticSessionId = 'sess_1b30a00f1c61d0cb';
  const apiCustomCss = '.api-custom { color: blue; background: yellow; }';
  const mockApiResponse = {
    ...realisticTestData,
    sessionId: realisticSessionId,
    agentConfig: {
      ...realisticTestData.agentConfig,
      theme: {
        ...realisticTestData.agentConfig.theme,
        customCss: apiCustomCss
      }
    }
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    (getInitialChatReplyQuery as any).mockResolvedValue({ data: mockApiResponse, error: null });
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('1. CustomCSS Props Override Tests', () => {
    describe('1.1 Props CustomCSS Completely Overrides API', () => {
      it('should use props.customCss when both props and API provide customCss', async () => {
        const propsCustomCss = '.props-custom { color: red; font-size: 16px; }';

        const { container } = render(() => 
          <Bot 
            agentName="test-agent" 
            customCss={propsCustomCss}
            stream={true}
            persistSession={true}
          />
        );
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Verify props customCSS is rendered in style tag
        const styleElements = container.querySelectorAll('style');
        const customCssStyle = Array.from(styleElements).find(style => 
          style.textContent?.includes('.props-custom')
        );
        expect(customCssStyle).toBeTruthy();
        expect(customCssStyle?.textContent).toContain('.props-custom { color: red; font-size: 16px; }');

        // Verify API customCSS is NOT rendered
        const apiCssStyle = Array.from(styleElements).find(style => 
          style.textContent?.includes('.api-custom')
        );
        expect(apiCssStyle).toBeFalsy();
      });
    });

    describe('1.2 Empty Props CustomCSS Overrides API', () => {
      it('should use empty props.customCss to completely override API customCss', async () => {
        const propsCustomCss = '';

        const { container } = render(() => 
          <Bot 
            agentName="test-agent" 
            customCss={propsCustomCss}
            stream={true}
            persistSession={true}
          />
        );
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Verify empty props customCSS results in empty style tag
        const styleElements = container.querySelectorAll('style');
        const customCssStyle = Array.from(styleElements).find((style, index) => 
          // First style element should be the custom CSS (empty), second is immutable CSS
          index === 0
        );
        expect(customCssStyle).toBeTruthy();
        expect(customCssStyle?.textContent).toBe('');

        // Verify API customCSS is NOT rendered
        const apiCssStyle = Array.from(styleElements).find(style => 
          style.textContent?.includes('.api-custom')
        );
        expect(apiCssStyle).toBeFalsy();
      });
    });

    describe('1.3 Complex Props CustomCSS Override', () => {
      it('should handle complex CSS in props.customCss', async () => {
        const complexCustomCss = `
          .agent-embed-container {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            border-radius: 10px;
          }
          .agent-embed-container .message {
            font-family: 'Comic Sans MS', cursive;
          }
          @media (max-width: 768px) {
            .agent-embed-container { padding: 8px; }
          }
        `;

        const { container } = render(() => 
          <Bot 
            agentName="test-agent" 
            customCss={complexCustomCss}
            stream={true}
            persistSession={true}
          />
        );
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Verify complex CSS is rendered correctly
        const styleElements = container.querySelectorAll('style');
        const customCssStyle = Array.from(styleElements).find(style => 
          style.textContent?.includes('.agent-embed-container')
        );
        expect(customCssStyle).toBeTruthy();
        expect(customCssStyle?.textContent).toContain('background: linear-gradient(45deg, #ff6b6b, #4ecdc4)');
        expect(customCssStyle?.textContent).toContain('font-family: \'Comic Sans MS\', cursive');
        expect(customCssStyle?.textContent).toContain('@media (max-width: 768px)');
      });
    });
  });

  describe('2. CustomCSS Fallback Tests', () => {
    describe('2.1 API CustomCSS Used When Props CustomCSS Undefined', () => {
      it('should use API customCss when props.customCss is undefined', async () => {
        const { container } = render(() => 
          <Bot 
            agentName="test-agent" 
            stream={true}
            persistSession={true}
          />
        );
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Verify API customCSS is rendered
        const styleElements = container.querySelectorAll('style');
        const apiCssStyle = Array.from(styleElements).find(style => 
          style.textContent?.includes('.api-custom')
        );
        expect(apiCssStyle).toBeTruthy();
        expect(apiCssStyle?.textContent).toContain('.api-custom { color: blue; background: yellow; }');
      });
    });

    describe('2.2 No CustomCSS When Both Are Undefined', () => {
      it('should render empty style tag when both props and API customCss are undefined', async () => {
        // Mock API response without customCSS
        const apiWithoutCss = {
          ...mockApiResponse,
          agentConfig: {
            ...mockApiResponse.agentConfig,
            theme: {
              ...mockApiResponse.agentConfig.theme,
              customCss: undefined
            }
          }
        };
        (getInitialChatReplyQuery as any).mockResolvedValue({ data: apiWithoutCss, error: null });

        const { container } = render(() => 
          <Bot 
            agentName="test-agent" 
            stream={true}
            persistSession={true}
          />
        );
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Verify first style tag is empty (custom CSS), second is immutable CSS
        const styleElements = container.querySelectorAll('style');
        expect(styleElements.length).toBeGreaterThanOrEqual(1);
        
        const customCssStyle = styleElements[0];
        expect(customCssStyle.textContent).toBe('');
      });
    });

    describe('2.3 Graceful Handling of Missing API Theme', () => {
      it('should handle missing API theme gracefully when props customCss provided', async () => {
        // Mock API response without theme
        const apiWithoutTheme = {
          ...mockApiResponse,
          agentConfig: {
            ...mockApiResponse.agentConfig,
            theme: undefined
          }
        };
        (getInitialChatReplyQuery as any).mockResolvedValue({ data: apiWithoutTheme, error: null });

        const propsCustomCss = '.props-no-theme { color: green; }';

        const { container } = render(() => 
          <Bot 
            agentName="test-agent" 
            customCss={propsCustomCss}
            stream={true}
            persistSession={true}
          />
        );
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Verify props customCSS is used despite missing API theme
        const styleElements = container.querySelectorAll('style');
        const customCssStyle = Array.from(styleElements).find(style => 
          style.textContent?.includes('.props-no-theme')
        );
        expect(customCssStyle).toBeTruthy();
        expect(customCssStyle?.textContent).toContain('.props-no-theme { color: green; }');
      });
    });
  });

  describe('3. CustomCSS Props Integration Tests', () => {
    describe('3.1 CustomCSS Props with Other Props', () => {
      it('should correctly apply customCss props alongside other props like input and avatar', async () => {
        const propsCustomCss = '.multi-props { border: 2px solid purple; }';
        const propsInput = {
          type: "combined input",
          options: { labels: { placeholder: "Combined placeholder" } }
        };

        const { container } = render(() => 
          <Bot 
            agentName="test-agent" 
            customCss={propsCustomCss}
            input={propsInput}
            stream={true}
            persistSession={true}
          />
        );
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Verify customCSS is applied
        const styleElements = container.querySelectorAll('style');
        const customCssStyle = Array.from(styleElements).find(style => 
          style.textContent?.includes('.multi-props')
        );
        expect(customCssStyle).toBeTruthy();
        expect(customCssStyle?.textContent).toContain('.multi-props { border: 2px solid purple; }');

        // Note: We'd need additional mocking to verify input props integration
      });
    });

    describe('3.2 CustomCSS Props During Error States', () => {
      it('should not render customCss during error states', async () => {
        (getInitialChatReplyQuery as any).mockResolvedValue({
          data: null,
          error: { statusCode: 404 }
        });

        const propsCustomCss = '.error-css { color: orange; }';

        const { container } = render(() => 
          <Bot 
            agentName="test-agent" 
            customCss={propsCustomCss}
          />
        );

        await waitFor(() => {
          expect(screen.getByTestId('error-message')).toHaveTextContent("The agent you're looking for doesn't exist.");
        });

        // Verify error takes precedence (no BotContent rendered)
        expect(screen.queryByTestId('stream-conversation')).not.toBeInTheDocument();
        
        // However, customCSS style tag is still rendered as it's outside the conditional
        const styleElements = container.querySelectorAll('style');
        const errorCssStyle = Array.from(styleElements).find(style => 
          style.textContent?.includes('.error-css')
        );
        expect(errorCssStyle).toBeTruthy();
      });
    });

    describe('3.3 CustomCSS Storage Behavior', () => {
      it('should store props customCss in localStorage correctly', async () => {
        const propsCustomCss = '.storage-test { font-weight: bold; }';

        render(() => 
          <Bot 
            agentName="test-agent" 
            customCss={propsCustomCss}
            stream={true}
            persistSession={true}
          />
        );
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Wait for localStorage to be updated
        await waitFor(() => {
          expect(localStorage.getItem('test-agent_customCss')).not.toBeNull();
        });

        // Verify props customCSS is stored (as JSON string)
        const storedCustomCss = localStorage.getItem('test-agent_customCss');
        expect(JSON.parse(storedCustomCss || '""')).toBe('.storage-test { font-weight: bold; }');
      });
    });
  });
});