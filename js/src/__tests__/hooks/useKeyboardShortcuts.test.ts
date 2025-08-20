import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@solidjs/testing-library';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { Shortcuts } from '@/schemas/features/blocks/inputs/text';

describe('useKeyboardShortcuts', () => {
  let mockOnSubmit: ReturnType<typeof vi.fn>;
  let mockOnNewline: ReturnType<typeof vi.fn>;

  const createKeyboardEvent = (overrides: Partial<KeyboardEvent> = {}): KeyboardEvent => {
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      shiftKey: false,
      altKey: false,
      metaKey: false,
      ctrlKey: false,
      bubbles: true,
      cancelable: true,
      ...overrides,
    });
    
    // Mock preventDefault
    Object.defineProperty(event, 'preventDefault', {
      value: vi.fn(),
      writable: false,
    });
    
    return event;
  };

  beforeEach(() => {
    mockOnSubmit = vi.fn();
    mockOnNewline = vi.fn();
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should return keyboard event handlers', () => {
      const { result } = renderHook(() => 
        useKeyboardShortcuts({
          shortcuts: { preset: 'enterToSend', imeSafe: true },
          onSubmit: mockOnSubmit,
          onNewline: mockOnNewline,
        })
      );

      expect(result).toHaveProperty('onKeyDown');
      expect(result).toHaveProperty('onCompositionStart');
      expect(result).toHaveProperty('onCompositionEnd');
      expect(typeof result.onKeyDown).toBe('function');
      expect(typeof result.onCompositionStart).toBe('function');
      expect(typeof result.onCompositionEnd).toBe('function');
    });
  });

  describe('Enter to Send Preset', () => {
    it('should trigger onSubmit for Enter key', () => {
      const { result } = renderHook(() => 
        useKeyboardShortcuts({
          shortcuts: { preset: 'enterToSend', imeSafe: true },
          onSubmit: mockOnSubmit,
          onNewline: mockOnNewline,
        })
      );

      const enterEvent = createKeyboardEvent();
      result.onKeyDown(enterEvent);

      expect(mockOnSubmit).toHaveBeenCalledOnce();
      expect(mockOnNewline).not.toHaveBeenCalled();
      expect(enterEvent.preventDefault).toHaveBeenCalled();
    });

    it('should trigger onNewline for Shift+Enter', () => {
      const { result } = renderHook(() => 
        useKeyboardShortcuts({
          shortcuts: { preset: 'enterToSend', imeSafe: true },
          onSubmit: mockOnSubmit,
          onNewline: mockOnNewline,
        })
      );

      const shiftEnterEvent = createKeyboardEvent({ shiftKey: true });
      result.onKeyDown(shiftEnterEvent);

      expect(mockOnNewline).toHaveBeenCalledOnce();
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(shiftEnterEvent.preventDefault).toHaveBeenCalled();
    });

    it('should ignore non-Enter keys', () => {
      const { result } = renderHook(() => 
        useKeyboardShortcuts({
          shortcuts: { preset: 'enterToSend', imeSafe: true },
          onSubmit: mockOnSubmit,
          onNewline: mockOnNewline,
        })
      );

      const spaceEvent = createKeyboardEvent({ key: 'Space' });
      result.onKeyDown(spaceEvent);

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnNewline).not.toHaveBeenCalled();
      expect(spaceEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('Mod+Enter to Send Preset', () => {
    it('should trigger onSubmit for Ctrl+Enter', () => {
      const { result } = renderHook(() => 
        useKeyboardShortcuts({
          shortcuts: { preset: 'modEnterToSend', imeSafe: true },
          onSubmit: mockOnSubmit,
          onNewline: mockOnNewline,
        })
      );

      const ctrlEnterEvent = createKeyboardEvent({ ctrlKey: true });
      result.onKeyDown(ctrlEnterEvent);

      expect(mockOnSubmit).toHaveBeenCalledOnce();
      expect(mockOnNewline).not.toHaveBeenCalled();
      expect(ctrlEnterEvent.preventDefault).toHaveBeenCalled();
    });

    it('should trigger onSubmit for Cmd+Enter (metaKey)', () => {
      const { result } = renderHook(() => 
        useKeyboardShortcuts({
          shortcuts: { preset: 'modEnterToSend', imeSafe: true },
          onSubmit: mockOnSubmit,
          onNewline: mockOnNewline,
        })
      );

      const cmdEnterEvent = createKeyboardEvent({ metaKey: true });
      result.onKeyDown(cmdEnterEvent);

      expect(mockOnSubmit).toHaveBeenCalledOnce();
      expect(mockOnNewline).not.toHaveBeenCalled();
      expect(cmdEnterEvent.preventDefault).toHaveBeenCalled();
    });

    it('should trigger onNewline for plain Enter', () => {
      const { result } = renderHook(() => 
        useKeyboardShortcuts({
          shortcuts: { preset: 'modEnterToSend', imeSafe: true },
          onSubmit: mockOnSubmit,
          onNewline: mockOnNewline,
        })
      );

      const enterEvent = createKeyboardEvent();
      result.onKeyDown(enterEvent);

      expect(mockOnNewline).toHaveBeenCalledOnce();
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(enterEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Custom Keymap', () => {
    it('should handle custom keymap with multiple submit options', () => {
      const shortcuts: Shortcuts = {
        preset: 'custom',
        keymap: {
          submit: [['Mod', 'Enter'], ['Shift', 'Enter']],
          newline: [['Enter']]
        },
        imeSafe: true
      };

      const { result } = renderHook(() => 
        useKeyboardShortcuts({
          shortcuts,
          onSubmit: mockOnSubmit,
          onNewline: mockOnNewline,
        })
      );

      // Test first submit option: Mod+Enter
      const ctrlEnterEvent = createKeyboardEvent({ ctrlKey: true });
      result.onKeyDown(ctrlEnterEvent);
      expect(mockOnSubmit).toHaveBeenCalledOnce();
      expect(ctrlEnterEvent.preventDefault).toHaveBeenCalled();

      mockOnSubmit.mockClear();

      // Test second submit option: Shift+Enter
      const shiftEnterEvent = createKeyboardEvent({ shiftKey: true });
      result.onKeyDown(shiftEnterEvent);
      expect(mockOnSubmit).toHaveBeenCalledOnce();
      expect(shiftEnterEvent.preventDefault).toHaveBeenCalled();

      mockOnSubmit.mockClear();

      // Test newline option: Enter
      const enterEvent = createKeyboardEvent();
      result.onKeyDown(enterEvent);
      expect(mockOnNewline).toHaveBeenCalledOnce();
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(enterEvent.preventDefault).toHaveBeenCalled();
    });

    it('should reject extra modifiers with custom keymap', () => {
      const shortcuts: Shortcuts = {
        preset: 'custom',
        keymap: {
          submit: [['Mod', 'Enter']],
          newline: [['Enter']]
        },
        imeSafe: true
      };

      const { result } = renderHook(() => 
        useKeyboardShortcuts({
          shortcuts,
          onSubmit: mockOnSubmit,
          onNewline: mockOnNewline,
        })
      );

      // Test with extra modifier (should be ignored)
      const extraModifierEvent = createKeyboardEvent({ 
        ctrlKey: true, 
        shiftKey: true // extra modifier
      });
      result.onKeyDown(extraModifierEvent);

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnNewline).not.toHaveBeenCalled();
      expect(extraModifierEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('IME Safety', () => {
    it('should ignore shortcuts when composing is active', () => {
      const { result } = renderHook(() => 
        useKeyboardShortcuts({
          shortcuts: { preset: 'enterToSend', imeSafe: true },
          onSubmit: mockOnSubmit,
          onNewline: mockOnNewline,
        })
      );

      // Start composition
      result.onCompositionStart();

      // Try to trigger shortcut while composing
      const enterEvent = createKeyboardEvent();
      result.onKeyDown(enterEvent);

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnNewline).not.toHaveBeenCalled();
      expect(enterEvent.preventDefault).not.toHaveBeenCalled();

      // End composition
      result.onCompositionEnd();

      // Now shortcuts should work
      const enterEvent2 = createKeyboardEvent();
      result.onKeyDown(enterEvent2);

      expect(mockOnSubmit).toHaveBeenCalledOnce();
      expect(enterEvent2.preventDefault).toHaveBeenCalled();
    });

    it('should ignore shortcuts when event.isComposing is true', () => {
      const { result } = renderHook(() => 
        useKeyboardShortcuts({
          shortcuts: { preset: 'enterToSend', imeSafe: true },
          onSubmit: mockOnSubmit,
          onNewline: mockOnNewline,
        })
      );

      // Create event with isComposing property
      const composingEvent = createKeyboardEvent();
      Object.defineProperty(composingEvent, 'isComposing', {
        value: true,
        writable: false,
        enumerable: true,
        configurable: true,
      });

      result.onKeyDown(composingEvent);

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnNewline).not.toHaveBeenCalled();
      expect(composingEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should process shortcuts when IME safety is disabled', () => {
      const { result } = renderHook(() => 
        useKeyboardShortcuts({
          shortcuts: { preset: 'enterToSend', imeSafe: false },
          onSubmit: mockOnSubmit,
          onNewline: mockOnNewline,
        })
      );

      // Start composition
      result.onCompositionStart();

      // Should still process shortcuts when IME safety is off
      const enterEvent = createKeyboardEvent();
      result.onKeyDown(enterEvent);

      expect(mockOnSubmit).toHaveBeenCalledOnce();
      expect(enterEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Default Configuration', () => {
    it('should work without explicit shortcuts configuration', () => {
      const { result } = renderHook(() => 
        useKeyboardShortcuts({
          onSubmit: mockOnSubmit,
          onNewline: mockOnNewline,
        })
      );

      // Should default to enterToSend behavior
      const enterEvent = createKeyboardEvent();
      result.onKeyDown(enterEvent);

      expect(mockOnSubmit).toHaveBeenCalledOnce();
      expect(enterEvent.preventDefault).toHaveBeenCalled();
    });

    it('should default to IME safe mode', () => {
      const { result } = renderHook(() => 
        useKeyboardShortcuts({
          shortcuts: { preset: 'enterToSend', imeSafe: true }, // explicit imeSafe
          onSubmit: mockOnSubmit,
          onNewline: mockOnNewline,
        })
      );

      // Start composition (should block shortcuts)
      result.onCompositionStart();

      const enterEvent = createKeyboardEvent();
      result.onKeyDown(enterEvent);

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(enterEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty keymap gracefully', () => {
      const shortcuts: Shortcuts = {
        preset: 'custom',
        keymap: {
          submit: [],
          newline: []
        },
        imeSafe: true
      };

      const { result } = renderHook(() => 
        useKeyboardShortcuts({
          shortcuts,
          onSubmit: mockOnSubmit,
          onNewline: mockOnNewline,
        })
      );

      const enterEvent = createKeyboardEvent();
      result.onKeyDown(enterEvent);

      // No callbacks should be triggered
      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(mockOnNewline).not.toHaveBeenCalled();
      expect(enterEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should prioritize submit over newline when both match', () => {
      // This shouldn't happen with proper configuration, but testing robustness
      const shortcuts: Shortcuts = {
        preset: 'custom',
        keymap: {
          submit: [['Enter']],
          newline: [['Enter']]
        },
        imeSafe: true
      };

      const { result } = renderHook(() => 
        useKeyboardShortcuts({
          shortcuts,
          onSubmit: mockOnSubmit,
          onNewline: mockOnNewline,
        })
      );

      const enterEvent = createKeyboardEvent();
      result.onKeyDown(enterEvent);

      // Submit should be called first and prevent newline
      expect(mockOnSubmit).toHaveBeenCalledOnce();
      expect(mockOnNewline).not.toHaveBeenCalled();
    });
  });
});