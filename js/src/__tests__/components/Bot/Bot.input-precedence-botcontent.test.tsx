import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';
import { Bot } from '@/components/Bot';
import { 
  createMockAgentConfig,
  createMockInitialChatReply,
  waitForEffects,
  flushPromises
} from '../../test-utils';
import { getInitialChatReplyQuery } from '@/queries/getInitialChatReplyQuery';

// Mock dependencies
vi.mock('@/queries/getInitialChatReplyQuery');

// Critical: Capture StreamConversation props to verify input precedence
let capturedStreamConversationProps: any = null;

// Mock StreamConversation component to capture its props
vi.mock('@/components/StreamConversation', () => ({
  StreamConversation: (props: any) => {
    capturedStreamConversationProps = props;
    return (
      <div data-testid="stream-conversation">
        <div data-testid="input-type">{props.input?.type || 'null'}</div>
        <div data-testid="input-placeholder">{props.input?.options?.labels?.placeholder || 'null'}</div>
        <div data-testid="input-button">{props.input?.options?.labels?.button || 'null'}</div>
        <div data-testid="session-id">{props.context?.sessionId || 'null'}</div>
        <div data-testid="persisted-messages-count">{props.persistedMessages?.length || '0'}</div>
      </div>
    );
  },
}));

// Mock other dependencies
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

describe('Bot.tsx - Input Precedence with StreamConversation Verification', () => {
  const mockApiResponse = createMockInitialChatReply({
    sessionId: 'test-session-123',
    input: {
      type: 'api-input-type',
      options: {
        labels: {
          placeholder: 'API placeholder text',
          button: 'API button text'
        }
      }
    }
  });

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    capturedStreamConversationProps = null;
    (getInitialChatReplyQuery as any).mockResolvedValue({ data: mockApiResponse, error: null });
  });

  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Test Case 1: Component Mount Scenario', () => {
    it('should pass props.input to StreamConversation when both props and API provide input on mount', async () => {
      // Setup API response with different input values than props
      const apiResponseWithInput = {
        ...mockApiResponse,
        input: {
          type: 'api-input-type',
          options: {
            labels: {
              placeholder: 'API placeholder text',
              button: 'API button text'  
            }
          }
        }
      };
      (getInitialChatReplyQuery as any).mockResolvedValue({ data: apiResponseWithInput, error: null });

      // Props input that should take precedence
      const propsInput = {
        type: 'props-input-type',
        options: {
          labels: {
            placeholder: 'Props placeholder text',
            button: 'Props button text'
          }
        }
      };

      render(() => 
        <Bot 
          agentName="test-agent" 
          input={propsInput}
        />
      );

      // Wait for component to initialize and StreamConversation to be rendered
      await waitFor(() => {
        expect(screen.getByTestId('stream-conversation')).toBeInTheDocument();
      });

      // Verify StreamConversation receives props.input, not API input
      expect(screen.getByTestId('input-type')).toHaveTextContent('props-input-type');
      expect(screen.getByTestId('input-placeholder')).toHaveTextContent('Props placeholder text');
      expect(screen.getByTestId('input-button')).toHaveTextContent('Props button text');

      // Verify captured props directly
      expect(capturedStreamConversationProps).toBeTruthy();
      expect(capturedStreamConversationProps.input).toEqual(propsInput);
      expect(capturedStreamConversationProps.input).not.toEqual(apiResponseWithInput.input);
    });

    it('should pass API input to StreamConversation when props.input is undefined', async () => {
      // Setup API response with input
      const apiResponseWithInput = {
        ...mockApiResponse,
        input: {
          type: 'api-input-type',
          options: {
            labels: {
              placeholder: 'API placeholder text',
              button: 'API button text'
            }
          }
        }
      };
      (getInitialChatReplyQuery as any).mockResolvedValue({ data: apiResponseWithInput, error: null });

      // Render Bot without props.input
      render(() => 
        <Bot 
          agentName="test-agent"
          // No input prop provided
        />
      );

      // Wait for component to initialize
      await waitFor(() => {
        expect(screen.getByTestId('stream-conversation')).toBeInTheDocument();
      });

      // Verify StreamConversation receives API input values
      expect(screen.getByTestId('input-type')).toHaveTextContent('api-input-type');
      expect(screen.getByTestId('input-placeholder')).toHaveTextContent('API placeholder text');
      expect(screen.getByTestId('input-button')).toHaveTextContent('API button text');

      // Verify captured props directly
      expect(capturedStreamConversationProps).toBeTruthy();
      expect(capturedStreamConversationProps.input).toEqual(apiResponseWithInput.input);
    });

    it('should pass null input to StreamConversation when both props and API input are undefined', async () => {
      // Setup API response without input
      const apiResponseWithoutInput = {
        ...mockApiResponse,
        input: null
      };
      (getInitialChatReplyQuery as any).mockResolvedValue({ data: apiResponseWithoutInput, error: null });

      render(() => 
        <Bot 
          agentName="test-agent"
          // No input prop provided
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('stream-conversation')).toBeInTheDocument();
      });

      // Verify StreamConversation receives null input
      expect(screen.getByTestId('input-type')).toHaveTextContent('null');
      expect(screen.getByTestId('input-placeholder')).toHaveTextContent('null');
      expect(screen.getByTestId('input-button')).toHaveTextContent('null');

      // Verify captured props directly
      expect(capturedStreamConversationProps).toBeTruthy();
      expect(capturedStreamConversationProps.input).toBeNull();
    });
  });

  describe('Test Case 2: Props Change Scenario', () => {
    it('should update StreamConversation with new props.input when props change dynamically', async () => {
      // Setup API response
      const apiResponseWithInput = {
        ...mockApiResponse,
        input: {
          type: 'api-input-type',
          options: {
            labels: {
              placeholder: 'API placeholder text',
              button: 'API button text'
            }
          }
        }
      };
      (getInitialChatReplyQuery as any).mockResolvedValue({ data: apiResponseWithInput, error: null });

      // Create reactive props.input using createSignal
      let setInput: any;
      const TestWrapper = () => {
        const [input, setInputSignal] = createSignal({
          type: 'initial-props-type',
          options: {
            labels: {
              placeholder: 'Initial props placeholder',
              button: 'Initial props button'
            }
          }
        });
        
        setInput = setInputSignal;
        
        return (
          <Bot 
            agentName="test-agent" 
            input={input()}
          />
        );
      };

      render(TestWrapper);

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByTestId('stream-conversation')).toBeInTheDocument();
      });

      // Verify initial props input is used
      expect(screen.getByTestId('input-type')).toHaveTextContent('initial-props-type');
      expect(screen.getByTestId('input-placeholder')).toHaveTextContent('Initial props placeholder');
      expect(screen.getByTestId('input-button')).toHaveTextContent('Initial props button');

      // Store initial captured props for comparison
      const initialCapturedProps = { ...capturedStreamConversationProps };

      // Update props.input
      const updatedInput = {
        type: 'updated-props-type',
        options: {
          labels: {
            placeholder: 'Updated props placeholder',
            button: 'Updated props button'
          }
        }
      };
      
      setInput(updatedInput);
      
      // Wait for effects to process the change
      await waitForEffects();
      await flushPromises();

      // Wait for StreamConversation to receive updated input
      await waitFor(() => {
        expect(screen.getByTestId('input-type')).toHaveTextContent('updated-props-type');
      });

      // Verify StreamConversation received updated props input
      expect(screen.getByTestId('input-placeholder')).toHaveTextContent('Updated props placeholder');
      expect(screen.getByTestId('input-button')).toHaveTextContent('Updated props button');

      // Verify captured props changed
      expect(capturedStreamConversationProps.input).toEqual(updatedInput);
      expect(capturedStreamConversationProps.input).not.toEqual(initialCapturedProps.input);

      // Verify API input was never used
      expect(capturedStreamConversationProps.input).not.toEqual(apiResponseWithInput.input);
    });

    it('should maintain props precedence during dynamic updates even with API data present', async () => {
      // Setup API response with strong input values
      const apiResponseWithInput = {
        ...mockApiResponse,
        input: {
          type: 'persistent-api-type',
          options: {
            labels: {
              placeholder: 'Persistent API placeholder',
              button: 'Persistent API button'
            }
          }
        }
      };
      (getInitialChatReplyQuery as any).mockResolvedValue({ data: apiResponseWithInput, error: null });

      // Create reactive props
      let setInput: any;
      const TestWrapper = () => {
        const [input, setInputSignal] = createSignal({
          type: 'props-type-1',
          options: {
            labels: {
              placeholder: 'Props placeholder 1',
              button: 'Props button 1'
            }
          }
        });
        
        setInput = setInputSignal;
        
        return (
          <Bot 
            agentName="test-agent" 
            input={input()}
          />
        );
      };

      render(TestWrapper);

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByTestId('stream-conversation')).toBeInTheDocument();
      });

      // Verify initial state
      expect(screen.getByTestId('input-placeholder')).toHaveTextContent('Props placeholder 1');

      // Change props multiple times to test persistence of precedence
      const updates = [
        {
          type: 'props-type-2',
          options: {
            labels: {
              placeholder: 'Props placeholder 2',
              button: 'Props button 2'
            }
          }
        },
        {
          type: 'props-type-3', 
          options: {
            labels: {
              placeholder: 'Props placeholder 3',
              button: 'Props button 3'
            }
          }
        }
      ];

      for (let i = 0; i < updates.length; i++) {
        setInput(updates[i]);
        await waitForEffects();
        await flushPromises();

        await waitFor(() => {
          expect(screen.getByTestId('input-placeholder')).toHaveTextContent(`Props placeholder ${i + 2}`);
        });

        // Verify props input is always used, never API input
        expect(capturedStreamConversationProps.input).toEqual(updates[i]);
        expect(capturedStreamConversationProps.input).not.toEqual(apiResponseWithInput.input);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined props.input correctly', async () => {
      const apiResponseWithInput = {
        ...mockApiResponse,
        input: {
          type: 'fallback-api-type',
          options: {
            labels: {
              placeholder: 'Fallback API placeholder',
              button: 'Fallback API button'
            }
          }
        }
      };
      (getInitialChatReplyQuery as any).mockResolvedValue({ data: apiResponseWithInput, error: null });

      // Test with undefined (not providing the prop)
      render(() => 
        <Bot 
          agentName="test-agent"
          // No input prop provided (undefined)
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('stream-conversation')).toBeInTheDocument();
      });

      // Should fall back to API input when props.input is undefined
      expect(screen.getByTestId('input-placeholder')).toHaveTextContent('Fallback API placeholder');
      expect(capturedStreamConversationProps.input).toEqual(apiResponseWithInput.input);
    });

    it('should handle empty object props.input', async () => {
      const apiResponseWithInput = {
        ...mockApiResponse,
        input: {
          type: 'api-fallback-type',
          options: {
            labels: {
              placeholder: 'API fallback placeholder',
              button: 'API fallback button'
            }
          }
        }
      };
      (getInitialChatReplyQuery as any).mockResolvedValue({ data: apiResponseWithInput, error: null });

      const emptyInput = {};
      render(() => 
        <Bot 
          agentName="test-agent" 
          input={emptyInput} // Empty object
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('stream-conversation')).toBeInTheDocument();
      });

      // Empty object should take precedence over API input
      expect(capturedStreamConversationProps.input).toEqual(emptyInput);
      expect(capturedStreamConversationProps.input).not.toEqual(apiResponseWithInput.input);

      // UI should show 'null' for missing properties
      expect(screen.getByTestId('input-type')).toHaveTextContent('null');
      expect(screen.getByTestId('input-placeholder')).toHaveTextContent('null');
    });

    // it('should handle falsy but defined props.input values according to || operator behavior', async () => {
    //   const apiResponseWithInput = {
    //     ...mockApiResponse,
    //     input: {
    //       type: 'api-type',
    //       options: {
    //         labels: {
    //           placeholder: 'API placeholder',
    //           button: 'API button'
    //         }
    //       }
    //     }
    //   };
    //   (getInitialChatReplyQuery as any).mockResolvedValue({ data: apiResponseWithInput, error: null });

    //   // Test that falsy props.input values fallback to API input due to || operator
    //   // mergePropsWithApiData now uses: props.input || apiData?.input
    //   // This means falsy props.input will use apiData?.input
      
    //   const falsyInputs = [false, null, 0, '', undefined];
      
    //   for (const falsyInput of falsyInputs) {
    //     vi.clearAllMocks();
    //     capturedStreamConversationProps = null;
        
    //     render(() => 
    //       <Bot 
    //         agentName="test-agent" 
    //         input={falsyInput} // Falsy value should fallback to API input
    //       />
    //     );

    //     await waitFor(() => {
    //       expect(screen.getByTestId('stream-conversation')).toBeInTheDocument();
    //     });

    //     // With || operator in mergePropsWithApiData: falsyInput || apiData.input = apiData.input
    //     // This test will FAIL if apiData.input is not used when props.input is falsy
    //     expect(capturedStreamConversationProps.initialAgentReply.input).toEqual(apiResponseWithInput.input);
    //     expect(capturedStreamConversationProps.initialAgentReply.input).not.toBe(falsyInput);
    //   }
    // });

    it('should prioritize truthy props.input over API input (test that fails if API input is used when props.input is truthy)', async () => {
      const apiResponseWithInput = {
        ...mockApiResponse,
        input: {
          type: 'api-should-not-be-used',
          options: {
            labels: {
              placeholder: 'API placeholder should not appear',
              button: 'API button should not appear'
            }
          }
        }
      };
      (getInitialChatReplyQuery as any).mockResolvedValue({ data: apiResponseWithInput, error: null });

      const truthyPropsInput = {
        type: 'props-input-should-win',
        options: {
          labels: {
            placeholder: 'Props placeholder should appear',
            button: 'Props button should appear'
          }
        }
      };

      render(() => 
        <Bot 
          agentName="test-agent" 
          input={truthyPropsInput} // Truthy props.input should take precedence
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('stream-conversation')).toBeInTheDocument();
      });

      // This test will FAIL if API input is used when props.input is truthy
      expect(capturedStreamConversationProps.input).toEqual(truthyPropsInput);
      expect(capturedStreamConversationProps.input).not.toEqual(apiResponseWithInput.input);
      
      // Verify specific values to ensure props took precedence
      expect(screen.getByTestId('input-type')).toHaveTextContent('props-input-should-win');
      expect(screen.getByTestId('input-placeholder')).toHaveTextContent('Props placeholder should appear');
      expect(screen.getByTestId('input-button')).toHaveTextContent('Props button should appear');
      
      // These should NOT appear if props precedence works correctly
      expect(screen.queryByText('API placeholder should not appear')).not.toBeInTheDocument();
      expect(screen.queryByText('API button should not appear')).not.toBeInTheDocument();
      expect(screen.queryByText('api-should-not-be-used')).not.toBeInTheDocument();
    });
  });
});