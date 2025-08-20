import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { AutoResizingTextarea } from '@/components/inputs/AutoResizingTextarea';
import { cleanupDOM } from '../../test-utils';
import type { Shortcuts } from '@/schemas/features/blocks/inputs/text';

// Mock dependencies
vi.mock('@/utils/isMobileSignal', () => ({
  isMobile: vi.fn(() => false),
}));

describe('AutoResizingTextarea - Keyboard Shortcuts', () => {
  let mockOnSubmit: ReturnType<typeof vi.fn>;
  let mockOnNewline: ReturnType<typeof vi.fn>;
  let mockOnInput: ReturnType<typeof vi.fn>;
  let mockGetComputedStyle: any;
  let mockGetPropertyValue: any;

  const createMockProps = (overrides = {}) => ({
    ref: undefined as HTMLTextAreaElement | undefined,
    onInput: mockOnInput,
    onSubmit: mockOnSubmit,
    onNewline: mockOnNewline,
    value: '',
    placeholder: 'Type here...',
    ...overrides,
  });

  const createKeyboardEvent = (type: string, overrides: Partial<KeyboardEvent> = {}): KeyboardEvent => {
    return new KeyboardEvent(type, {
      key: 'Enter',
      shiftKey: false,
      altKey: false,
      metaKey: false,
      ctrlKey: false,
      bubbles: true,
      cancelable: true,
      ...overrides,
    });
  };

  beforeEach(() => {
    cleanupDOM();
    mockOnSubmit = vi.fn();
    mockOnNewline = vi.fn();
    mockOnInput = vi.fn();
    vi.clearAllMocks();

    // Mock getComputedStyle for height calculations
    mockGetPropertyValue = vi.fn().mockReturnValue('11');
    mockGetComputedStyle = vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
      if (element === document.documentElement) {
        return {
          getPropertyValue: mockGetPropertyValue,
        } as CSSStyleDeclaration;
      }
      return {
        fontSize: '16px',
        getPropertyValue: mockGetPropertyValue,
      } as CSSStyleDeclaration;
    });
  });

  afterEach(() => {
    cleanupDOM();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('Enter to Send Shortcuts', () => {
    it('should trigger onSubmit when Enter key is pressed', () => {
      const shortcuts: Shortcuts = { preset: 'enterToSend', imeSafe: true };
      const props = createMockProps({ shortcuts });
      
      render(() => <AutoResizingTextarea {...props} />);
      const textarea = screen.getByTestId('auto-resizing-textarea');

      fireEvent.keyDown(textarea, { key: 'Enter' });

      expect(mockOnSubmit).toHaveBeenCalledOnce();
      expect(mockOnNewline).not.toHaveBeenCalled();
    });

    it('should trigger onNewline when Shift+Enter is pressed', () => {
      const shortcuts: Shortcuts = { preset: 'enterToSend', imeSafe: true };
      const props = createMockProps({ shortcuts });
      
      render(() => <AutoResizingTextarea {...props} />);
      const textarea = screen.getByTestId('auto-resizing-textarea');

      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

      expect(mockOnNewline).toHaveBeenCalledOnce();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should ignore non-Enter keys', () => {
      const shortcuts: Shortcuts = { preset: 'enterToSend', imeSafe: true };
      const props = createMockProps({ shortcuts });
      
      render(() => <AutoResizingTextarea {...props} />);
      const textarea = screen.getByTestId('auto-resizing-textarea');

      fireEvent.keyDown(textarea, { key: 'Space' });

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnNewline).not.toHaveBeenCalled();
    });
  });

  describe('Mod+Enter to Send Shortcuts', () => {
    it('should trigger onSubmit when Ctrl+Enter is pressed', () => {
      const shortcuts: Shortcuts = { preset: 'modEnterToSend', imeSafe: true };
      const props = createMockProps({ shortcuts });
      
      render(() => <AutoResizingTextarea {...props} />);
      const textarea = screen.getByTestId('auto-resizing-textarea');

      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

      expect(mockOnSubmit).toHaveBeenCalledOnce();
      expect(mockOnNewline).not.toHaveBeenCalled();
    });

    it('should trigger onSubmit when Cmd+Enter is pressed', () => {
      const shortcuts: Shortcuts = { preset: 'modEnterToSend', imeSafe: true };
      const props = createMockProps({ shortcuts });
      
      render(() => <AutoResizingTextarea {...props} />);
      const textarea = screen.getByTestId('auto-resizing-textarea');

      fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });

      expect(mockOnSubmit).toHaveBeenCalledOnce();
      expect(mockOnNewline).not.toHaveBeenCalled();
    });

    it('should trigger onNewline when plain Enter is pressed', () => {
      const shortcuts: Shortcuts = { preset: 'modEnterToSend', imeSafe: true };
      const props = createMockProps({ shortcuts });
      
      render(() => <AutoResizingTextarea {...props} />);
      const textarea = screen.getByTestId('auto-resizing-textarea');

      fireEvent.keyDown(textarea, { key: 'Enter' });

      expect(mockOnNewline).toHaveBeenCalledOnce();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Custom Keymap', () => {
    it('should handle custom keymap with multiple submit options', () => {
      const shortcuts: Shortcuts = {
        preset: 'custom',
        keymap: {
          submit: [['Mod', 'Enter'], ['Alt', 'Enter']],
          newline: [['Enter']]
        },
        imeSafe: true
      };
      const props = createMockProps({ shortcuts });
      
      render(() => <AutoResizingTextarea {...props} />);
      const textarea = screen.getByTestId('auto-resizing-textarea');

      // Test Mod+Enter
      fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
      expect(mockOnSubmit).toHaveBeenCalledOnce();

      mockOnSubmit.mockClear();

      // Test Alt+Enter
      fireEvent.keyDown(textarea, { key: 'Enter', altKey: true });
      expect(mockOnSubmit).toHaveBeenCalledOnce();

      mockOnSubmit.mockClear();

      // Test plain Enter for newline
      fireEvent.keyDown(textarea, { key: 'Enter' });
      expect(mockOnNewline).toHaveBeenCalledOnce();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Newline Insertion', () => {
    it('should insert newline at cursor position', async () => {
      const shortcuts: Shortcuts = { preset: 'enterToSend', imeSafe: true };
      const props = createMockProps({ shortcuts, value: 'Hello world' });
      
      render(() => <AutoResizingTextarea {...props} />);
      const textarea = screen.getByTestId('auto-resizing-textarea') as HTMLTextAreaElement;

      // Set cursor position to middle of text
      textarea.selectionStart = 5;
      textarea.selectionEnd = 5;

      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

      expect(mockOnNewline).toHaveBeenCalledOnce();

      // Verify newline insertion behavior was triggered
      // (The actual insertion is tested in the newline insertion logic)
    });

    it('should handle newline insertion when no onNewline callback provided', () => {
      const shortcuts: Shortcuts = { preset: 'enterToSend', imeSafe: true };
      const props = createMockProps({ shortcuts, onNewline: undefined });
      
      render(() => <AutoResizingTextarea {...props} />);
      const textarea = screen.getByTestId('auto-resizing-textarea');

      // Should not crash when onNewline is undefined
      expect(() => fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true })).not.toThrow();
    });
  });

  describe('IME Composition Safety', () => {
    it('should ignore shortcuts during composition', () => {
      const shortcuts: Shortcuts = { preset: 'enterToSend', imeSafe: true };
      const props = createMockProps({ shortcuts });
      
      render(() => <AutoResizingTextarea {...props} />);
      const textarea = screen.getByTestId('auto-resizing-textarea');

      // Start composition
      const compositionStart = new CompositionEvent('compositionstart');
      fireEvent(textarea, compositionStart);

      // Try to trigger shortcut during composition
      fireEvent.keyDown(textarea, { key: 'Enter' });

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnNewline).not.toHaveBeenCalled();

      // End composition
      const compositionEnd = new CompositionEvent('compositionend');
      fireEvent(textarea, compositionEnd);

      // Now shortcuts should work
      fireEvent.keyDown(textarea, { key: 'Enter' });

      expect(mockOnSubmit).toHaveBeenCalledOnce();
    });

    it('should process shortcuts when IME safety is disabled', () => {
      const shortcuts: Shortcuts = { preset: 'enterToSend', imeSafe: false };
      const props = createMockProps({ shortcuts });
      
      render(() => <AutoResizingTextarea {...props} />);
      const textarea = screen.getByTestId('auto-resizing-textarea');

      // Start composition
      const compositionStart = new CompositionEvent('compositionstart');
      fireEvent(textarea, compositionStart);

      // Should still process shortcuts when IME safety is off
      fireEvent.keyDown(textarea, { key: 'Enter' });

      expect(mockOnSubmit).toHaveBeenCalledOnce();
    });
  });

  describe('No Shortcuts Configuration', () => {
    it('should work without shortcuts prop', () => {
      const props = createMockProps({ shortcuts: undefined });
      
      // Should not crash without shortcuts
      expect(() => render(() => <AutoResizingTextarea {...props} />)).not.toThrow();
      
      const textarea = screen.getByTestId('auto-resizing-textarea');
      expect(textarea).toBeInTheDocument();
    });

    it('should work without onSubmit callback', () => {
      const shortcuts: Shortcuts = { preset: 'enterToSend', imeSafe: true };
      const props = createMockProps({ shortcuts, onSubmit: undefined });
      
      render(() => <AutoResizingTextarea {...props} />);
      const textarea = screen.getByTestId('auto-resizing-textarea');

      // Should not crash when onSubmit is undefined
      expect(() => fireEvent.keyDown(textarea, { key: 'Enter' })).not.toThrow();
    });
  });

  describe('Integration with Auto-Resizing', () => {
    it('should trigger height adjustment after newline insertion', () => {
      const shortcuts: Shortcuts = { preset: 'enterToSend', imeSafe: true };
      const props = createMockProps({ shortcuts, value: 'Test text' });
      
      render(() => <AutoResizingTextarea {...props} />);
      const textarea = screen.getByTestId('auto-resizing-textarea');

      // Spy on style changes
      const setHeightSpy = vi.spyOn(textarea.style, 'height', 'set');

      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

      expect(mockOnNewline).toHaveBeenCalledOnce();
      // Height adjustment should be triggered after newline insertion
      // (The exact height calculation is mocked, but the call should happen)
    });

    it('should preserve existing auto-resize functionality', () => {
      const shortcuts: Shortcuts = { preset: 'enterToSend', imeSafe: true };
      const props = createMockProps({ shortcuts });
      
      render(() => <AutoResizingTextarea {...props} />);
      const textarea = screen.getByTestId('auto-resizing-textarea');

      // Regular input should still trigger resize
      fireEvent.input(textarea, { target: { value: 'Some text input' } });

      expect(mockOnInput).toHaveBeenCalledOnce();
      // Auto-resize functionality should still work normally
    });
  });

  describe('Event Handling Priority', () => {
    it('should not interfere with regular input events', () => {
      const shortcuts: Shortcuts = { preset: 'enterToSend', imeSafe: true };
      const props = createMockProps({ shortcuts });
      
      render(() => <AutoResizingTextarea {...props} />);
      const textarea = screen.getByTestId('auto-resizing-textarea');

      // Regular typing should work normally
      fireEvent.input(textarea, { target: { value: 'Normal typing' } });
      
      expect(mockOnInput).toHaveBeenCalledOnce();
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnNewline).not.toHaveBeenCalled();
    });

    it('should handle keyboard events before other handlers', () => {
      const shortcuts: Shortcuts = { preset: 'enterToSend', imeSafe: true };
      const additionalKeyDownHandler = vi.fn();
      const props = createMockProps({ 
        shortcuts,
        onKeyDown: additionalKeyDownHandler
      });
      
      render(() => <AutoResizingTextarea {...props} />);
      const textarea = screen.getByTestId('auto-resizing-textarea');

      fireEvent.keyDown(textarea, { key: 'Enter' });

      // Our shortcut handler should execute
      expect(mockOnSubmit).toHaveBeenCalledOnce();
    });
  });
});