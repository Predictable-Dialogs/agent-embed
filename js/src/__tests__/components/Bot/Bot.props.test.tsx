import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';
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
import { AvatarProps } from '@/constants';
import realisticTestData from '../../data/getInitialChatReplyQuery.json';

// Mock dependencies
vi.mock('@/queries/getInitialChatReplyQuery');
vi.mock('@/components/StreamConversation', () => ({
  StreamConversation: (props: any) => (
    <div data-testid="stream-conversation">
      <div data-testid="session-id">{props.context.sessionId}</div>
      <div data-testid="persisted-messages-count">{props.persistedMessages.length}</div>
      <div data-testid="initial-input-type">{props.input?.type || 'null'}</div>
      <div data-testid="initial-input-placeholder">{props.input?.options?.labels?.placeholder || 'null'}</div>
      <div data-testid="host-avatar-url">{props.hostAvatar?.url || 'null'}</div>
      <div data-testid="host-avatar-enabled">{String(props.hostAvatar?.isEnabled) || 'null'}</div>
      <div data-testid="guest-avatar-url">{props.guestAvatar?.url || 'null'}</div>
      <div data-testid="guest-avatar-enabled">{String(props.guestAvatar?.isEnabled) || 'null'}</div>
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

const waitForStorage = async (key: string, timeout = 3000) => {
  await waitFor(() => {
    expect(localStorage.getItem(key)).not.toBeNull();
  }, { timeout });
};

describe('Bot.tsx - Props Integration & Merging Logic', () => {
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

  describe('1. Props Input Precedence Tests', () => {
    describe('1.1 Props Input Takes Precedence Over API Input', () => {
      it('should use props.input when both props and API provide input', async () => {
        // Setup API to return realistic input
        const apiWithInput = {
          ...mockApiResponse,
          input: {
            type: "text input",
            options: {
              labels: {
                placeholder: "API placeholder",
                button: "API button"
              }
            }
          }
        };
        (getInitialChatReplyQuery as any).mockResolvedValue({ data: apiWithInput, error: null });

        // Render with props.input that should take precedence
        const propsInput = {
          type: "custom input",
          options: {
            labels: {
              placeholder: "Props placeholder",
              button: "Props button"
            }
          }
        };

        render(() => 
          <Bot 
            agentName="test-agent" 
            input={propsInput}
            stream={true}
            persistSession={true}
          />
        );
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Verify BotContent receives props input, not API input
        expect(screen.getByTestId('initial-input-type')).toHaveTextContent('custom input');
        expect(screen.getByTestId('initial-input-placeholder')).toHaveTextContent('Props placeholder');
      });
    });

    describe('1.2 API Input Used When Props Input Undefined', () => {
      it('should use API input when props.input is undefined', async () => {
        render(() => 
          <Bot 
            agentName="test-agent" 
            stream={true}
            persistSession={true}
          />
        );
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Verify BotContent receives API input values
        expect(screen.getByTestId('initial-input-type')).toHaveTextContent('text input');
        expect(screen.getByTestId('initial-input-placeholder')).toHaveTextContent('Whats on your m');
      });
    });
  });

  describe('2. Component Integration & Props Passing Tests', () => {
    describe('2.2 Reactive Props Updates During Runtime', () => {
      it('should update BotContent when props.input changes', async () => {
        let updateProps: (newInput: any) => void;
        const TestWrapper = () => {
          const [input, setInput] = createSignal({
            type: "initial input",
            options: { labels: { placeholder: "Initial placeholder" } }
          });
          
          updateProps = (newInput) => setInput(newInput);
          
          return (
            <Bot 
              agentName="test-agent" 
              input={input()}
              stream={true}
              persistSession={true}
            />
          );
        };

        render(TestWrapper);
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Verify initial input
        expect(screen.getByTestId('initial-input-type')).toHaveTextContent('initial input');
        expect(screen.getByTestId('initial-input-placeholder')).toHaveTextContent('Initial placeholder');

        // Update props
        const newInput = {
          type: "updated input",
          options: { labels: { placeholder: "Updated placeholder" } }
        };
        updateProps!(newInput);

        await waitForEffects();

        // Verify BotContent receives updated input
        expect(screen.getByTestId('initial-input-type')).toHaveTextContent('updated input');
        expect(screen.getByTestId('initial-input-placeholder')).toHaveTextContent('Updated placeholder');
      });
    });

    describe('2.3 Props Input Integration with Session Restoration', () => {
      it('should maintain props precedence during session restoration', async () => {
        // Setup stored session data with API input
        const storedMessages = [
          { id: 'msg-1', content: 'Hello', role: 'user' }
        ];

        setupLocalStorage({
          'test-agent_sessionId': 'sess_restored_456',
          'test-agent_agentConfig': realisticTestData.agentConfig,
          'test-agent_chatMessages': storedMessages,
        });

        // Render with props.input
        const propsInput = {
          type: "props input during restoration",
          options: { labels: { placeholder: "Props during restoration" } }
        };

        render(() => 
          <Bot 
            agentName="test-agent" 
            input={propsInput}
            stream={true}
            persistSession={true}
          />
        );
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Verify session restored (no API call)
        expect(getInitialChatReplyQuery).not.toHaveBeenCalled();
        expect(screen.getByTestId('session-id')).toHaveTextContent('sess_restored_456');
        expect(screen.getByTestId('persisted-messages-count')).toHaveTextContent('1');

        // Verify props.input still takes precedence during restoration
        expect(screen.getByTestId('initial-input-type')).toHaveTextContent('props input during restoration');
        expect(screen.getByTestId('initial-input-placeholder')).toHaveTextContent('Props during restoration');
      });
    });
  });

  describe('3. Error Handling Integration Tests', () => {
    describe('3.1 Error Display Prevents BotContent Rendering', () => {
      it('should show error message and prevent BotContent rendering for 404 error', async () => {
        (getInitialChatReplyQuery as any).mockResolvedValue({
          data: null,
          error: { statusCode: 404 }
        });

        render(() => <Bot agentName="test-agent" />);

        await waitFor(() => {
          expect(screen.getByTestId('error-message')).toHaveTextContent("The agent you're looking for doesn't exist.");
        });

        // Verify BotContent is NOT rendered
        expect(screen.queryByTestId('stream-conversation')).not.toBeInTheDocument();
      });

      it('should show error message and prevent BotContent rendering for BAD_REQUEST error', async () => {
        (getInitialChatReplyQuery as any).mockResolvedValue({
          data: null,
          error: { code: 'BAD_REQUEST' }
        });

        render(() => <Bot agentName="test-agent" />);

        await waitFor(() => {
          expect(screen.getByTestId('error-message')).toHaveTextContent('This agent is now closed.');
        });

        // Verify BotContent is NOT rendered
        expect(screen.queryByTestId('stream-conversation')).not.toBeInTheDocument();
      });

      it('should show error message and prevent BotContent rendering for FORBIDDEN error', async () => {
        (getInitialChatReplyQuery as any).mockResolvedValue({
          data: null,
          error: { code: 'FORBIDDEN' }
        });

        render(() => <Bot agentName="test-agent" />);

        await waitFor(() => {
          expect(screen.getByTestId('error-message')).toHaveTextContent('This agent is now closed.');
        });

        // Verify BotContent is NOT rendered
        expect(screen.queryByTestId('stream-conversation')).not.toBeInTheDocument();
      });
    });
  });

  describe('4. MergePropsWithApiData Function Integration Tests', () => {
    describe('4.1 Merging Logic Correctness', () => {
      it('should correctly merge props with API data following precedence rules', async () => {
        // Setup API response with complete realistic data
        const completeApiResponse = {
          ...realisticTestData,
          sessionId: realisticSessionId,
          input: {
            type: "api input type",
            options: {
              labels: {
                placeholder: "API placeholder",
                button: "API button"
              }
            }
          }
        };
        (getInitialChatReplyQuery as any).mockResolvedValue({ data: completeApiResponse, error: null });

        // Render with props
        const propsInput = {
          type: "props input type",
          options: {
            labels: {
              placeholder: "Props placeholder",
              button: "Props button"
            }
          }
        };

        render(() => 
          <Bot 
            agentName="test-agent" 
            input={propsInput}
            stream={true}
            persistSession={true}
          />
        );
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Verify merged config contains props values (precedence)
        expect(screen.getByTestId('initial-input-type')).toHaveTextContent('props input type');
        expect(screen.getByTestId('initial-input-placeholder')).toHaveTextContent('Props placeholder');

        // Verify merged config contains API values where props are undefined
        expect(screen.getByTestId('session-id')).toHaveTextContent(realisticSessionId);

        // Verify localStorage contains correctly extracted values from API data
        await waitForStorage('test-agent_sessionId');
        verifyStorageValue('test-agent_sessionId', realisticSessionId);

        await waitForStorage('test-agent_agentConfig');
        const storedConfig = JSON.parse(localStorage.getItem('test-agent_agentConfig') || '{}');
        expect(storedConfig.theme?.general?.font).toBe('Amita');
      });
    });

    describe('4.2 Null API Data Handling', () => {
      it('should handle null API data gracefully while preserving props values', async () => {
        (getInitialChatReplyQuery as any).mockResolvedValue({ data: null, error: null });

        const propsInput = {
          type: "props with null api",
          options: { labels: { placeholder: "Props placeholder" } }
        };

        render(() => 
          <Bot 
            agentName="test-agent" 
            input={propsInput}
          />
        );
        
        // Component should handle null API data and show an error
        await waitFor(() => {
          expect(screen.getByTestId('error-message')).toHaveTextContent("Couldn't initiate the chat.");
        });

        // Verify no BotContent is rendered due to null API data
        expect(screen.queryByTestId('stream-conversation')).not.toBeInTheDocument();
      });

      it('should apply default values for missing API data while preserving props', async () => {
        // Mock API response with minimal data (missing some fields)
        const minimalApiResponse = {
          sessionId: realisticSessionId,
          agentConfig: realisticTestData.agentConfig,
          // Missing messages, clientSideActions, input
        };
        (getInitialChatReplyQuery as any).mockResolvedValue({ data: minimalApiResponse, error: null });

        const propsInput = {
          type: "props with minimal api",
          options: { labels: { placeholder: "Props placeholder" } }
        };

        render(() => 
          <Bot 
            agentName="test-agent" 
            input={propsInput}
            stream={true}
            persistSession={true}
          />
        );
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Verify props values are still available
        expect(screen.getByTestId('initial-input-type')).toHaveTextContent('props with minimal api');
        expect(screen.getByTestId('initial-input-placeholder')).toHaveTextContent('Props placeholder');

        // Verify API values are used where available
        expect(screen.getByTestId('session-id')).toHaveTextContent(realisticSessionId);

        // Verify default values are applied for missing API data
        expect(screen.getByTestId('persisted-messages-count')).toHaveTextContent('0');
      });
    });
  });

  describe('5. Avatar and CustomCSS Props Integration Tests', () => {
    describe('5.1 Avatar Props Basic Integration', () => {
      it('should include avatar props in the merged configuration and pass them to components', async () => {
        const propsAvatar: AvatarProps = {
          hostAvatar: {
            url: 'https://example.com/props-host.png',
            isEnabled: true
          },
          guestAvatar: {
            url: 'https://example.com/props-guest.png',
            isEnabled: false
          }
        };

        render(() => 
          <Bot 
            agentName="test-agent" 
            avatar={propsAvatar}
            stream={true}
            persistSession={true}
          />
        );
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Verify avatar props are passed to StreamConversation through agentConfig
        expect(screen.getByTestId('host-avatar-url')).toHaveTextContent('https://example.com/props-host.png');
        expect(screen.getByTestId('host-avatar-enabled')).toHaveTextContent('true');
        expect(screen.getByTestId('guest-avatar-url')).toHaveTextContent('https://example.com/props-guest.png');
        expect(screen.getByTestId('guest-avatar-enabled')).toHaveTextContent('false');
      });
    });

    describe('5.2 CustomCSS Props Basic Integration', () => {
      it('should include customCss props in the merged configuration and render them', async () => {
        const propsCustomCss = '.props-integration-test { color: purple; }';

        const { container } = render(() => 
          <Bot 
            agentName="test-agent" 
            customCss={propsCustomCss}
            stream={true}
            persistSession={true}
          />
        );
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Verify customCSS is rendered in style tag
        const styleElements = container.querySelectorAll('style');
        const customCssStyle = Array.from(styleElements).find(style => 
          style.textContent?.includes('.props-integration-test')
        );
        expect(customCssStyle).toBeTruthy();
        expect(customCssStyle?.textContent).toContain('.props-integration-test { color: purple; }');
      });
    });

    describe('5.3 Combined Avatar and CustomCSS Props', () => {
      it('should handle both avatar and customCss props together with input props', async () => {
        const propsAvatar: AvatarProps = {
          hostAvatar: {
            url: 'https://example.com/combined-host.png',
            isEnabled: true
          }
        };

        const propsCustomCss = '.combined-test { background: orange; }';
        
        const propsInput = {
          type: "combined input",
          options: {
            labels: {
              placeholder: "Combined placeholder"
            }
          }
        };

        const { container } = render(() => 
          <Bot 
            agentName="test-agent" 
            avatar={propsAvatar}
            customCss={propsCustomCss}
            input={propsInput}
            stream={true}
            persistSession={true}
          />
        );
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Verify all props are applied correctly
        expect(screen.getByTestId('host-avatar-url')).toHaveTextContent('https://example.com/combined-host.png');
        expect(screen.getByTestId('host-avatar-enabled')).toHaveTextContent('true');
        expect(screen.getByTestId('initial-input-type')).toHaveTextContent('combined input');
        expect(screen.getByTestId('initial-input-placeholder')).toHaveTextContent('Combined placeholder');

        const styleElements = container.querySelectorAll('style');
        const customCssStyle = Array.from(styleElements).find(style => 
          style.textContent?.includes('.combined-test')
        );
        expect(customCssStyle).toBeTruthy();
        expect(customCssStyle?.textContent).toContain('.combined-test { background: orange; }');
      });
    });

    describe('5.4 Props Precedence with New Props', () => {
      it('should maintain proper precedence for avatar and customCss props over API data', async () => {
        // Ensure API has avatar and customCss data
        const apiWithCustomizations = {
          ...mockApiResponse,
          agentConfig: {
            ...mockApiResponse.agentConfig,
            theme: {
              ...mockApiResponse.agentConfig.theme,
              customCss: '.api-custom { color: blue; }',
              chat: {
                ...mockApiResponse.agentConfig.theme.chat,
                hostAvatar: {
                  url: 'https://api.example.com/api-host.png',
                  isEnabled: false
                },
                guestAvatar: {
                  url: 'https://api.example.com/api-guest.png',
                  isEnabled: true
                }
              }
            }
          }
        };
        (getInitialChatReplyQuery as any).mockResolvedValue({ data: apiWithCustomizations, error: null });

        const propsAvatar: AvatarProps = {
          hostAvatar: {
            url: 'https://props.example.com/props-host.png',
            isEnabled: true
          }
        };

        const propsCustomCss = '.props-precedence { color: red; }';

        const { container } = render(() => 
          <Bot 
            agentName="test-agent" 
            avatar={propsAvatar}
            customCss={propsCustomCss}
            stream={true}
            persistSession={true}
          />
        );
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Verify props take precedence over API
        expect(screen.getByTestId('host-avatar-url')).toHaveTextContent('https://props.example.com/props-host.png');
        expect(screen.getByTestId('host-avatar-enabled')).toHaveTextContent('true');
        
        // Verify guestAvatar falls back to API (partial override)
        expect(screen.getByTestId('guest-avatar-url')).toHaveTextContent('https://api.example.com/api-guest.png');
        expect(screen.getByTestId('guest-avatar-enabled')).toHaveTextContent('true');

        // Verify props customCSS completely overrides API customCSS
        const styleElements = container.querySelectorAll('style');
        const propsCustomCssStyle = Array.from(styleElements).find(style => 
          style.textContent?.includes('.props-precedence')
        );
        expect(propsCustomCssStyle).toBeTruthy();

        const apiCustomCssStyle = Array.from(styleElements).find(style => 
          style.textContent?.includes('.api-custom')
        );
        expect(apiCustomCssStyle).toBeFalsy();
      });
    });
  });
});