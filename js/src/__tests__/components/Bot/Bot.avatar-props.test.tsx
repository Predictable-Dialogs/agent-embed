import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { Bot } from '@/components/Bot';
import { getInitialChatReplyQuery } from '@/queries/getInitialChatReplyQuery';
import realisticTestData from '../../data/getInitialChatReplyQuery.json';
import { AvatarProps } from '@/constants';

// Mock dependencies
vi.mock('@/queries/getInitialChatReplyQuery');
vi.mock('@/components/StreamConversation', () => ({
  StreamConversation: (props: any) => (
    <div data-testid="stream-conversation">
      <div data-testid="host-avatar-url">{props.hostAvatar?.url || 'null'}</div>
      <div data-testid="host-avatar-enabled">{String(props.hostAvatar?.isEnabled) || 'null'}</div>
      <div data-testid="guest-avatar-url">{props.guestAvatar?.url || 'null'}</div>
      <div data-testid="guest-avatar-enabled">{String(props.guestAvatar?.isEnabled) || 'null'}</div>
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

describe('Bot.tsx - Avatar Props Override Behavior', () => {
  const realisticSessionId = 'sess_1b30a00f1c61d0cb';
  const mockApiResponse = {
    ...realisticTestData,
    sessionId: realisticSessionId
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

  describe('1. Avatar Props Override Tests', () => {
    describe('1.1 Complete Avatar Override', () => {
      it('should use props.avatar when both props and API provide avatar config', async () => {
        const propsAvatar: AvatarProps = {
          hostAvatar: {
            url: 'https://example.com/custom-host-avatar.png',
            isEnabled: true
          },
          guestAvatar: {
            url: 'https://example.com/custom-guest-avatar.png',
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

        // Verify props avatar values are used instead of API values
        expect(screen.getByTestId('host-avatar-url')).toHaveTextContent('https://example.com/custom-host-avatar.png');
        expect(screen.getByTestId('host-avatar-enabled')).toHaveTextContent('true');
        expect(screen.getByTestId('guest-avatar-url')).toHaveTextContent('https://example.com/custom-guest-avatar.png');
        expect(screen.getByTestId('guest-avatar-enabled')).toHaveTextContent('false');
      });
    });

    describe('1.2 Partial Avatar Override - Host Only', () => {
      it('should use props.avatar.hostAvatar and fallback to API guestAvatar when only hostAvatar provided', async () => {
        const propsAvatar: AvatarProps = {
          hostAvatar: {
            url: 'https://example.com/custom-host-only.png',
            isEnabled: false
          }
          // guestAvatar is undefined, should use API value
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

        // Verify props hostAvatar is used
        expect(screen.getByTestId('host-avatar-url')).toHaveTextContent('https://example.com/custom-host-only.png');
        expect(screen.getByTestId('host-avatar-enabled')).toHaveTextContent('false');
        
        // Verify API guestAvatar is used (fallback)
        expect(screen.getByTestId('guest-avatar-url')).toHaveTextContent(mockApiResponse.agentConfig.theme.chat.guestAvatar.url);
        expect(screen.getByTestId('guest-avatar-enabled')).toHaveTextContent(String(mockApiResponse.agentConfig.theme.chat.guestAvatar.isEnabled));
      });
    });

    describe('1.3 Partial Avatar Override - Guest Only', () => {
      it('should use props.avatar.guestAvatar and fallback to API hostAvatar when only guestAvatar provided', async () => {
        const propsAvatar: AvatarProps = {
          // hostAvatar is undefined, should use API value
          guestAvatar: {
            url: 'https://example.com/custom-guest-only.png',
            isEnabled: true
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

        // Verify API hostAvatar is used (fallback)
        expect(screen.getByTestId('host-avatar-url')).toHaveTextContent(mockApiResponse.agentConfig.theme.chat.hostAvatar.url);
        expect(screen.getByTestId('host-avatar-enabled')).toHaveTextContent(String(mockApiResponse.agentConfig.theme.chat.hostAvatar.isEnabled));
        
        // Verify props guestAvatar is used
        expect(screen.getByTestId('guest-avatar-url')).toHaveTextContent('https://example.com/custom-guest-only.png');
        expect(screen.getByTestId('guest-avatar-enabled')).toHaveTextContent('true');
      });
    });
  });

  describe('2. Avatar Fallback Tests', () => {
    describe('2.1 API Avatar Used When Props Avatar Undefined', () => {
      it('should use API avatar values when props.avatar is undefined', async () => {
        render(() => 
          <Bot 
            agentName="test-agent" 
            stream={true}
            persistSession={true}
          />
        );
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Verify API avatar values are used
        expect(screen.getByTestId('host-avatar-url')).toHaveTextContent(mockApiResponse.agentConfig.theme.chat.hostAvatar.url);
        expect(screen.getByTestId('host-avatar-enabled')).toHaveTextContent(String(mockApiResponse.agentConfig.theme.chat.hostAvatar.isEnabled));
        expect(screen.getByTestId('guest-avatar-url')).toHaveTextContent(mockApiResponse.agentConfig.theme.chat.guestAvatar.url);
        expect(screen.getByTestId('guest-avatar-enabled')).toHaveTextContent(String(mockApiResponse.agentConfig.theme.chat.guestAvatar.isEnabled));
      });
    });

    describe('2.2 Graceful Handling of Missing API Avatar', () => {
      it('should handle missing API avatar gracefully when props avatar provided', async () => {
        // Mock API response without avatar data
        const apiWithoutAvatar = {
          ...mockApiResponse,
          agentConfig: {
            ...mockApiResponse.agentConfig,
            theme: {
              ...mockApiResponse.agentConfig.theme,
              chat: {
                ...mockApiResponse.agentConfig.theme.chat,
                // Remove avatar properties
                hostAvatar: undefined,
                guestAvatar: undefined
              }
            }
          }
        };
        (getInitialChatReplyQuery as any).mockResolvedValue({ data: apiWithoutAvatar, error: null });

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

        // Verify props avatar values are used despite missing API avatar
        expect(screen.getByTestId('host-avatar-url')).toHaveTextContent('https://example.com/props-host.png');
        expect(screen.getByTestId('host-avatar-enabled')).toHaveTextContent('true');
        expect(screen.getByTestId('guest-avatar-url')).toHaveTextContent('https://example.com/props-guest.png');
        expect(screen.getByTestId('guest-avatar-enabled')).toHaveTextContent('false');
      });

      it('should handle completely missing avatar data gracefully', async () => {
        // Mock API response without any avatar data
        const apiWithoutAnyAvatar = {
          ...mockApiResponse,
          agentConfig: {
            ...mockApiResponse.agentConfig,
            theme: {
              ...mockApiResponse.agentConfig.theme,
              chat: {
                ...mockApiResponse.agentConfig.theme.chat,
                hostAvatar: undefined,
                guestAvatar: undefined
              }
            }
          }
        };
        (getInitialChatReplyQuery as any).mockResolvedValue({ data: apiWithoutAnyAvatar, error: null });

        render(() => 
          <Bot 
            agentName="test-agent" 
            stream={true}
            persistSession={true}
          />
        );
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Verify undefined avatar values are handled gracefully
        expect(screen.getByTestId('host-avatar-url')).toHaveTextContent('null');
        expect(screen.getByTestId('host-avatar-enabled')).toHaveTextContent('undefined');
        expect(screen.getByTestId('guest-avatar-url')).toHaveTextContent('null');
        expect(screen.getByTestId('guest-avatar-enabled')).toHaveTextContent('undefined');
      });
    });
  });

  describe('3. Avatar Props Integration Tests', () => {
    describe('3.1 Avatar Props with Other Props', () => {
      it('should correctly merge avatar props with other props like input', async () => {
        const propsAvatar: AvatarProps = {
          hostAvatar: {
            url: 'https://example.com/multi-props-host.png',
            isEnabled: true
          }
        };

        const propsInput = {
          type: "combined props input",
          options: {
            labels: {
              placeholder: "Combined placeholder"
            }
          }
        };

        render(() => 
          <Bot 
            agentName="test-agent" 
            avatar={propsAvatar}
            input={propsInput}
            stream={true}
            persistSession={true}
          />
        );
        
        await waitFor(() => expect(screen.getByTestId('stream-conversation')).toBeInTheDocument());

        // Verify both avatar and input props are applied
        expect(screen.getByTestId('host-avatar-url')).toHaveTextContent('https://example.com/multi-props-host.png');
        expect(screen.getByTestId('host-avatar-enabled')).toHaveTextContent('true');
        // Note: We'd need to mock StreamConversation to also expose input data to verify this completely
      });
    });

    describe('3.2 Avatar Props During Error States', () => {
      it('should handle avatar props gracefully during error states', async () => {
        (getInitialChatReplyQuery as any).mockResolvedValue({
          data: null,
          error: { statusCode: 404 }
        });

        const propsAvatar: AvatarProps = {
          hostAvatar: {
            url: 'https://example.com/error-host.png',
            isEnabled: true
          }
        };

        render(() => 
          <Bot 
            agentName="test-agent" 
            avatar={propsAvatar}
          />
        );

        await waitFor(() => {
          expect(screen.getByTestId('error-message')).toHaveTextContent("The agent you're looking for doesn't exist.");
        });

        // Verify error takes precedence (no BotContent rendered)
        expect(screen.queryByTestId('stream-conversation')).not.toBeInTheDocument();
      });
    });
  });
});