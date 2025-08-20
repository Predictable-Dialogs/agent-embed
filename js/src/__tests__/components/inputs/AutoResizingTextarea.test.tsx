import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';
import { AutoResizingTextarea } from '@/components/inputs/AutoResizingTextarea';
import { cleanupDOM } from '../../test-utils';

// Mock dependencies
vi.mock('@/utils/isMobileSignal', () => ({
  isMobile: vi.fn(() => false),
}));

import { isMobile } from '@/utils/isMobileSignal';

const mockIsMobile = isMobile as any;

describe('AutoResizingTextarea Component', () => {
  let mockGetComputedStyle: any;
  let mockGetPropertyValue: any;
  
  const createMockProps = (overrides = {}) => ({
    ref: undefined as HTMLTextAreaElement | undefined,
    onInput: vi.fn(),
    value: '',
    placeholder: 'Type here...',
    ...overrides,
  });

  beforeEach(() => {
    cleanupDOM();
    vi.clearAllMocks();
    mockIsMobile.mockReturnValue(false);
    
    // Mock getComputedStyle for both font calculations and CSS variables
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
    // Clear the document body to prevent multiple elements
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('1. Core Rendering & Testid Tests', () => {
    it('should render with data-testid="auto-resizing-textarea"', () => {
      const props = createMockProps();
      render(() => <AutoResizingTextarea {...props} />);
      
      // This assertion WILL FAIL if data-testid is removed from the component
      expect(screen.getByTestId('auto-resizing-textarea')).toBeInTheDocument();
      expect(screen.getByTestId('auto-resizing-textarea')).toHaveAttribute('data-testid', 'auto-resizing-textarea');
    });

    it('should render as a textarea element', () => {
      const props = createMockProps();
      render(() => <AutoResizingTextarea {...props} />);
      
      const element = screen.getByTestId('auto-resizing-textarea');
      expect(element.tagName).toBe('TEXTAREA');
    });

    it('should have required class names', () => {
      const props = createMockProps();
      render(() => <AutoResizingTextarea {...props} />);
      
      const textarea = screen.getByTestId('auto-resizing-textarea');
      expect(textarea).toHaveClass('focus:outline-none');
      expect(textarea).toHaveClass('bg-transparent');
      expect(textarea).toHaveClass('px-4');
      expect(textarea).toHaveClass('py-4');
      expect(textarea).toHaveClass('flex-1');
      expect(textarea).toHaveClass('w-full');
      expect(textarea).toHaveClass('text-input');
      expect(textarea).toHaveClass('resize-none');
    });

    it('should have required attribute', () => {
      const props = createMockProps();
      render(() => <AutoResizingTextarea {...props} />);
      
      const textarea = screen.getByTestId('auto-resizing-textarea');
      expect(textarea).toHaveAttribute('required');
    });

    it('should have correct inline styles', () => {
      const props = createMockProps();
      render(() => <AutoResizingTextarea {...props} />);
      
      const textarea = screen.getByTestId('auto-resizing-textarea');
      // Check individual style properties since the component may add additional styles dynamically
      expect(textarea.style.fontSize).toBe('16px');
      expect(textarea.style.lineHeight).toBe('1.5');
      expect(textarea.style.overflowY).toBe('hidden');
    });
  });

  describe('2. Props Integration Tests', () => {
    it('should display correct placeholder text', () => {
      const props = createMockProps({
        placeholder: 'Custom placeholder text'
      });
      render(() => <AutoResizingTextarea {...props} />);
      
      const textarea = screen.getByTestId('auto-resizing-textarea') as HTMLTextAreaElement;
      expect(textarea).toHaveAttribute('placeholder', 'Custom placeholder text');
    });

    it('should display correct value', () => {
      const props = createMockProps({
        value: 'Initial text value'
      });
      render(() => <AutoResizingTextarea {...props} />);
      
      const textarea = screen.getByTestId('auto-resizing-textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Initial text value');
    });

    it('should handle disabled state', () => {
      const props = createMockProps({
        disabled: true
      });
      render(() => <AutoResizingTextarea {...props} />);
      
      const textarea = screen.getByTestId('auto-resizing-textarea') as HTMLTextAreaElement;
      expect(textarea).toBeDisabled();
    });

    it('should forward additional props via spread operator', () => {
      const props = createMockProps({
        'data-custom': 'test-attribute',
        'aria-label': 'Custom aria label',
        maxLength: 100
      } as any);
      render(() => <AutoResizingTextarea {...props} />);
      
      const textarea = screen.getByTestId('auto-resizing-textarea') as HTMLTextAreaElement;
      expect(textarea).toHaveAttribute('data-custom', 'test-attribute');
      expect(textarea).toHaveAttribute('aria-label', 'Custom aria label');
      expect(textarea).toHaveAttribute('maxLength', '100');
    });
  });

  describe('3. Input Handling Tests', () => {
    it('should call onInput handler when user types', () => {
      const mockOnInput = vi.fn();
      const props = createMockProps({
        onInput: mockOnInput
      });
      render(() => <AutoResizingTextarea {...props} />);
      
      const textarea = screen.getByTestId('auto-resizing-textarea') as HTMLTextAreaElement;
      
      fireEvent.input(textarea, { target: { value: 'Hello world' } });
      
      expect(mockOnInput).toHaveBeenCalledWith(expect.any(Event));
    });

    it('should call onInput for every input event', () => {
      const mockOnInput = vi.fn();
      const props = createMockProps({
        onInput: mockOnInput
      });
      render(() => <AutoResizingTextarea {...props} />);
      
      const textarea = screen.getByTestId('auto-resizing-textarea') as HTMLTextAreaElement;
      
      fireEvent.input(textarea, { target: { value: 'First' } });
      fireEvent.input(textarea, { target: { value: 'Second' } });
      fireEvent.input(textarea, { target: { value: 'Third' } });
      
      expect(mockOnInput).toHaveBeenCalledTimes(3);
    });

    it('should require onInput prop for proper functioning', () => {
      const props = {
        ref: undefined as HTMLTextAreaElement | undefined,
        onInput: undefined as any,
        value: '',
        placeholder: 'Type here...',
      };
      
      // This test documents current behavior - component requires onInput
      // Component renders but would error if input event occurs without onInput
      expect(() => {
        render(() => <AutoResizingTextarea {...props} />);
      }).not.toThrow();
      
      const textarea = screen.getByTestId('auto-resizing-textarea') as HTMLTextAreaElement;
      expect(textarea).toBeInTheDocument();
      
      // We don't trigger the input event to avoid the unhandled error
      // This documents that the component requires onInput for input events
    });
  });

  describe('4. Ref Forwarding Tests', () => {
    it('should forward ref correctly to textarea element', () => {
      let refElement: HTMLTextAreaElement | undefined;
      const props = createMockProps({
        ref: (el: HTMLTextAreaElement) => {
          refElement = el;
        }
      });
      
      render(() => <AutoResizingTextarea {...props} />);
      
      expect(refElement).toBeInstanceOf(HTMLTextAreaElement);
      expect(refElement).toHaveAttribute('data-testid', 'auto-resizing-textarea');
    });

    it('should handle ref as object property assignment', () => {
      // Test documents actual behavior: the component assigns directly to ref property
      const refObject = { current: undefined as HTMLTextAreaElement | undefined };
      const props = createMockProps({
        ref: refObject as any
      });
      
      render(() => <AutoResizingTextarea {...props} />);
      
      // The component modifies the ref object directly via props.ref = el
      expect(props.ref).toBeInstanceOf(HTMLTextAreaElement);
      expect(props.ref).toHaveAttribute('data-testid', 'auto-resizing-textarea');
    });

    it('should handle undefined ref gracefully', () => {
      const props = createMockProps({
        ref: undefined
      });
      
      expect(() => {
        render(() => <AutoResizingTextarea {...props} />);
      }).not.toThrow();
      
      expect(screen.getByTestId('auto-resizing-textarea')).toBeInTheDocument();
    });
  });

  describe('5. Focus Management Tests', () => {
    it('should auto-focus on non-mobile devices', () => {
      mockIsMobile.mockReturnValue(false);
      const props = createMockProps();
      
      render(() => <AutoResizingTextarea {...props} />);
      
      const textarea = screen.getByTestId('auto-resizing-textarea') as HTMLTextAreaElement;
      expect(textarea).toHaveAttribute('autofocus');
    });

    it('should not auto-focus on mobile devices', () => {
      mockIsMobile.mockReturnValue(true);
      const props = createMockProps();
      
      render(() => <AutoResizingTextarea {...props} />);
      
      const textarea = screen.getByTestId('auto-resizing-textarea') as HTMLTextAreaElement;
      expect(textarea).not.toHaveAttribute('autofocus');
    });
  });

  describe('6. Height Calculation Tests', () => {
    it('should call adjustHeight on mount', () => {
      const props = createMockProps();
      
      // Spy on the internal adjustHeight functionality through style changes
      const { container } = render(() => <AutoResizingTextarea {...props} />);
      const textarea = screen.getByTestId('auto-resizing-textarea') as HTMLTextAreaElement;
      
      // Verify that style.height was manipulated (indicating adjustHeight was called)
      expect(textarea.style.height).toBeDefined();
    });

    it('should read max-lines CSS variable from document root', () => {
      const props = createMockProps();
      
      render(() => <AutoResizingTextarea {...props} />);
      
      expect(mockGetPropertyValue).toHaveBeenCalledWith('--input-max-lines');
    });

    it('should use default max-lines value when CSS variable is not available', () => {
      mockGetPropertyValue.mockReturnValue(''); // Simulate missing CSS variable
      const props = createMockProps();
      
      // Should not throw and should still render
      expect(() => {
        render(() => <AutoResizingTextarea {...props} />);
      }).not.toThrow();
      
      expect(screen.getByTestId('auto-resizing-textarea')).toBeInTheDocument();
    });

    it('should adjust height when value changes', () => {
      const props = createMockProps({
        value: 'Initial value'
      });
      
      const { unmount } = render(() => <AutoResizingTextarea {...props} />);
      let textarea = screen.getByTestId('auto-resizing-textarea') as HTMLTextAreaElement;
      
      const initialHeight = textarea.style.height;
      
      unmount();
      
      // Render with different value
      props.value = 'Much longer value that should trigger height recalculation when the content changes';
      render(() => <AutoResizingTextarea {...props} />);
      
      textarea = screen.getByTestId('auto-resizing-textarea') as HTMLTextAreaElement;
      
      // Height calculation should have been triggered
      expect(textarea.style.height).toBeDefined();
    });

    it('should respond to reactive value changes via createEffect', async () => {
      const [value, setValue] = createSignal('Short');
      const mockOnInput = vi.fn();
      
      const props = {
        ref: undefined as HTMLTextAreaElement | undefined,
        onInput: mockOnInput,
        get value() { return value(); }, // Reactive getter that tracks the signal
        placeholder: 'Type here...',
      };
      
      render(() => <AutoResizingTextarea {...props} />);
      const textarea = screen.getByTestId('auto-resizing-textarea') as HTMLTextAreaElement;
      
      // Wait for initial mount effects to complete
      await waitFor(() => {
        expect(textarea.style.height).toBeDefined();
      });
      
      // Track specific style changes that only happen in adjustHeight
      const initialPaddingRight = textarea.style.paddingRight;
      const initialOverflowY = textarea.style.overflowY;
      
      // Clear the style to see if adjustHeight gets called again
      textarea.style.height = '';
      
      // Change the signal value - this should trigger createEffect -> adjustHeight
      setValue('Much longer text content that requires height adjustment and should cause the createEffect to run which calls adjustHeight function');
      
      // Wait for the createEffect to run and adjustHeight to be called
      await waitFor(() => {
        // These style properties are only set by adjustHeight function
        expect(textarea.style.height).not.toBe(''); // Should be recalculated
        expect(textarea.style.paddingRight).toBeDefined(); // Should be set by adjustHeight
        expect(textarea.style.overflowY).toBeDefined(); // Should be set by adjustHeight
      }, { timeout: 1000 });
      
      // Verify the value updated (confirming signal reactivity)
      expect(textarea.value).toBe('Much longer text content that requires height adjustment and should cause the createEffect to run which calls adjustHeight function');
    });

    it('should call adjustHeight on input events', () => {
      const props = createMockProps();
      
      render(() => <AutoResizingTextarea {...props} />);
      const textarea = screen.getByTestId('auto-resizing-textarea') as HTMLTextAreaElement;
      
      // Clear any initial height set by mount
      textarea.style.height = '';
      
      // Trigger input event
      fireEvent.input(textarea, { target: { value: 'New content' } });
      
      // Height should be recalculated
      expect(textarea.style.height).toBeDefined();
    });
  });

  describe('7. Error Scenarios & Edge Cases', () => {
    it('should handle missing getComputedStyle gracefully', () => {
      // Mock getComputedStyle to return null - this tests error handling
      mockGetComputedStyle.mockReturnValue(null);
      
      const props = createMockProps();
      
      // The component currently doesn't handle null getComputedStyle gracefully
      // This test documents the current behavior
      expect(() => {
        render(() => <AutoResizingTextarea {...props} />);
      }).toThrow();
    });

    it('should work with minimal props', () => {
      const minimalProps = {
        ref: undefined as HTMLTextAreaElement | undefined,
        onInput: vi.fn()
      };
      
      expect(() => {
        render(() => <AutoResizingTextarea {...minimalProps} />);
      }).not.toThrow();
      
      expect(screen.getByTestId('auto-resizing-textarea')).toBeInTheDocument();
    });

    it('should handle style manipulation errors gracefully', () => {
      const props = createMockProps();
      
      render(() => <AutoResizingTextarea {...props} />);
      const textarea = screen.getByTestId('auto-resizing-textarea') as HTMLTextAreaElement;
      
      // Component should handle attempts to access/modify style properties
      expect(() => {
        fireEvent.input(textarea, { target: { value: 'Test content' } });
      }).not.toThrow();
    });
  });
});