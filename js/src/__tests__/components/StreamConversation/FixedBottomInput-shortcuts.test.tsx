import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { FixedBottomInput } from '@/components/StreamConversation/FixedBottomInput';
import { createMockInitialChatReply, cleanupDOM } from '../../test-utils';
import type { TextInputBlock } from '@/schemas';
import type { Shortcuts } from '@/schemas/features/blocks/inputs/text';

// Mock dependencies
vi.mock('@/utils/isMobileSignal', () => ({
  isMobile: vi.fn(() => false),
}));

// Mock AutoResizingTextarea to capture shortcuts prop
let capturedShortcuts: Shortcuts | undefined;
let capturedOnSubmit: (() => void) | undefined;

vi.mock('@/components/inputs/AutoResizingTextarea', () => ({
  AutoResizingTextarea: (props: any) => {
    capturedShortcuts = props.shortcuts;
    capturedOnSubmit = props.onSubmit;
    
    return (
      <textarea
        data-testid="auto-resizing-textarea"
        ref={props.ref}
        onInput={props.onInput}
        onKeyDown={props.onKeyDown}
        onCompositionStart={props.onCompositionStart}
        onCompositionEnd={props.onCompositionEnd}
        value={props.value}
        placeholder={props.placeholder}
        disabled={props.disabled}
      />
    );
  },
}));

vi.mock('@/components/SendButton', () => ({
  SendButton: (props: any) => (
    <button
      data-testid="send-button"
      type={props.type}
      disabled={props.isDisabled}
      class={props.class}
      onClick={props['on:click']}
    >
      {props.children}
    </button>
  ),
}));

describe('FixedBottomInput - Keyboard Shortcuts', () => {
  let mockWindowAddEventListener: any;
  let mockWindowRemoveEventListener: any;
  
  const createMockTextInputBlock = (overrides = {}): TextInputBlock => {
    const mockReply = createMockInitialChatReply();
    return {
      type: 'text input' as const,
      options: {
        labels: {
          placeholder: 'Type your answer...',
          button: 'Send',
        },
        isLong: false,
        type: 'fixed-bottom' as const,
        ...overrides,
      },
    } as TextInputBlock;
  };

  beforeEach(() => {
    cleanupDOM();
    vi.clearAllMocks();
    capturedShortcuts = undefined;
    capturedOnSubmit = undefined;

    // Mock window event listener methods
    mockWindowAddEventListener = vi.fn();
    mockWindowRemoveEventListener = vi.fn();
    Object.defineProperty(window, 'addEventListener', {
      value: mockWindowAddEventListener,
      writable: true,
    });
    Object.defineProperty(window, 'removeEventListener', {
      value: mockWindowRemoveEventListener,
      writable: true,
    });
  });

  afterEach(() => {
    cleanupDOM();
  });

  describe('Shortcuts Configuration Passing', () => {
    it('should pass explicit shortcuts configuration to AutoResizingTextarea', () => {
      const shortcuts: Shortcuts = {
        preset: 'modEnterToSend',
        imeSafe: true
      };
      
      const mockBlock = createMockTextInputBlock({ shortcuts });
      render(() => <FixedBottomInput block={mockBlock} />);

      expect(capturedShortcuts).toEqual(shortcuts);
    });

    it('should pass custom keymap shortcuts to AutoResizingTextarea', () => {
      const shortcuts: Shortcuts = {
        preset: 'custom',
        keymap: {
          submit: [['Mod', 'Enter'], ['Alt', 'Enter']],
          newline: [['Enter']]
        },
        imeSafe: true
      };
      
      const mockBlock = createMockTextInputBlock({ shortcuts });
      render(() => <FixedBottomInput block={mockBlock} />);

      expect(capturedShortcuts).toEqual(shortcuts);
    });

    it('should always pass onSubmit callback to AutoResizingTextarea', () => {
      const mockBlock = createMockTextInputBlock();
      const mockOnSubmit = vi.fn();
      const streamingHandlers = { onSubmit: mockOnSubmit };
      
      render(() => (
        <FixedBottomInput block={mockBlock} streamingHandlers={streamingHandlers} />
      ));

      expect(typeof capturedOnSubmit).toBe('function');
    });
  });

  describe('missing isLong', () => {
    it('should handle missing isLong property with default enterToSend', () => {
      const mockBlock = createMockTextInputBlock({ 
        // No isLong property, no shortcuts
      });
      render(() => <FixedBottomInput block={mockBlock} />);

      expect(capturedShortcuts).toEqual({
        preset: 'enterToSend',
        imeSafe: true
      });
    });
  });

  describe('Submit Handler Integration', () => {
    it('should trigger submit through AutoResizingTextarea callback', () => {
      const mockBlock = createMockTextInputBlock();
      const mockOnSubmit = vi.fn();
      const streamingHandlers = { onSubmit: mockOnSubmit };
      
      render(() => (
        <FixedBottomInput block={mockBlock} streamingHandlers={streamingHandlers} />
      ));

      // Add text to make submission valid
      const textarea = screen.getByTestId('auto-resizing-textarea');
      fireEvent.input(textarea, { target: { value: 'Test message' } });

      // Call the captured onSubmit callback (simulating AutoResizingTextarea calling it)
      expect(capturedOnSubmit).toBeDefined();
      capturedOnSubmit!();

      expect(mockOnSubmit).toHaveBeenCalled();
    });

    it('should prevent submission when input is empty', () => {
      const mockBlock = createMockTextInputBlock();
      const mockOnSubmit = vi.fn();
      const streamingHandlers = { onSubmit: mockOnSubmit };
      
      render(() => (
        <FixedBottomInput block={mockBlock} streamingHandlers={streamingHandlers} />
      ));

      // Don't add any text (input remains empty)
      
      // Call the captured onSubmit callback
      expect(capturedOnSubmit).toBeDefined();
      capturedOnSubmit!();

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should prevent submission when component is disabled', () => {
      const mockBlock = createMockTextInputBlock();
      const mockOnSubmit = vi.fn();
      const streamingHandlers = { onSubmit: mockOnSubmit };
      
      render(() => (
        <FixedBottomInput 
          block={mockBlock} 
          streamingHandlers={streamingHandlers}
          isDisabled={true}
        />
      ));

      // Add text
      const textarea = screen.getByTestId('auto-resizing-textarea');
      fireEvent.input(textarea, { target: { value: 'Test message' } });

      // Call the captured onSubmit callback
      expect(capturedOnSubmit).toBeDefined();
      capturedOnSubmit!();

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should clear input and manage focus after successful submission', async () => {
      const mockBlock = createMockTextInputBlock();
      const mockOnSubmit = vi.fn();
      const streamingHandlers = { onSubmit: mockOnSubmit };
      
      render(() => (
        <FixedBottomInput block={mockBlock} streamingHandlers={streamingHandlers} />
      ));

      const textarea = screen.getByTestId('auto-resizing-textarea') as HTMLTextAreaElement;
      
      // Add text
      fireEvent.input(textarea, { target: { value: 'Test message' } });
      expect(textarea.value).toBe('Test message');

      // Call the captured onSubmit callback
      capturedOnSubmit!();

      expect(mockOnSubmit).toHaveBeenCalled();
      
      // Input should be cleared after submission
      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for next tick
      expect(textarea.value).toBe('');
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should work without streamingHandlers', () => {
      const mockBlock = createMockTextInputBlock();
      
      // Should not crash without streamingHandlers
      expect(() => render(() => <FixedBottomInput block={mockBlock} />)).not.toThrow();
      
      expect(capturedShortcuts).toBeDefined();
      expect(capturedOnSubmit).toBeDefined();
    });

    it('should handle complex custom shortcuts configuration', () => {
      const complexShortcuts: Shortcuts = {
        preset: 'custom',
        keymap: {
          submit: [['Enter'], ['Mod', 'Enter'], ['Shift', 'Enter']],
          newline: [['Alt', 'Enter']]
        },
        imeSafe: false
      };
      
      const mockBlock = createMockTextInputBlock({ shortcuts: complexShortcuts });
      render(() => <FixedBottomInput block={mockBlock} />);

      expect(capturedShortcuts).toEqual(complexShortcuts);
    });

    it('should pass through all AutoResizingTextarea props correctly', () => {
      const mockBlock = createMockTextInputBlock({
        labels: {
          placeholder: 'Custom placeholder for shortcuts test',
          button: 'Send'
        }
      });
      
      render(() => (
        <FixedBottomInput 
          block={mockBlock} 
          defaultValue="Initial value"
          isDisabled={false}
        />
      ));

      const textarea = screen.getByTestId('auto-resizing-textarea') as HTMLTextAreaElement;
      
      expect(textarea).toHaveAttribute('placeholder', 'Custom placeholder for shortcuts test');
      expect(textarea.value).toBe('Initial value');
      expect(textarea).not.toBeDisabled();
      expect(capturedShortcuts).toBeDefined();
      expect(capturedOnSubmit).toBeDefined();
    });

    it('should maintain original FixedBottomInput functionality with shortcuts', () => {
      const mockBlock = createMockTextInputBlock();
      const mockOnSubmit = vi.fn();
      const streamingHandlers = { onSubmit: mockOnSubmit };
      
      render(() => (
        <FixedBottomInput block={mockBlock} streamingHandlers={streamingHandlers} />
      ));

      // Test that button click still works alongside keyboard shortcuts
      const textarea = screen.getByTestId('auto-resizing-textarea');
      const button = screen.getByTestId('send-button');
      
      fireEvent.input(textarea, { target: { value: 'Button click test' } });
      fireEvent.click(button);
      
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    it('should handle malformed or missing block options gracefully', () => {
      const malformedBlock = {
        type: 'text input' as const,
        options: {
          type: 'fixed-bottom' as const,
          // Missing labels, isLong, etc.
        }
      } as TextInputBlock;
      
      expect(() => render(() => <FixedBottomInput block={malformedBlock} />)).not.toThrow();
      
      // Should still provide default shortcuts
      expect(capturedShortcuts).toEqual({
        preset: 'enterToSend',
        imeSafe: true
      });
    });
  });

  describe('IME Safety Configuration', () => {
    it('should pass through IME safety settings', () => {
      const shortcuts: Shortcuts = {
        preset: 'enterToSend',
        imeSafe: false  // Explicitly disabled
      };
      
      const mockBlock = createMockTextInputBlock({ shortcuts });
      render(() => <FixedBottomInput block={mockBlock} />);

      expect(capturedShortcuts?.imeSafe).toBe(false);
    });

    it('should default to IME safe when not specified', () => {
      const mockBlock = createMockTextInputBlock({ isLong: false });
      render(() => <FixedBottomInput block={mockBlock} />);

      expect(capturedShortcuts?.imeSafe).toBe(true);
    });
  });
});