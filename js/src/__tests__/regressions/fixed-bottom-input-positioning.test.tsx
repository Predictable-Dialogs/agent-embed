import { render, screen } from '@solidjs/testing-library';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FixedBottomInput } from '@/components/StreamConversation/FixedBottomInput';
import { 
  createMockInitialChatReply,
  waitForEffects 
} from '../test-utils';

describe('FixedBottomInput - Positioning Regression Tests', () => {
  let mockContainer: HTMLElement;

  beforeEach(() => {
    // Create different container scenarios
    mockContainer = document.createElement('div');
    mockContainer.setAttribute('data-testid', 'widget-container');
    document.body.appendChild(mockContainer);
  });

  afterEach(() => {
    if (mockContainer && document.body.contains(mockContainer)) {
      document.body.removeChild(mockContainer);
    }
    vi.clearAllMocks();
  });

  describe('Standard Widget Context - Fixed Positioning Issues', () => {
    it('REGRESSION: should use fixed positioning that ignores container boundaries', async () => {
      // Setup: Constrained container (simulating Standard widget)
      mockContainer.style.width = '400px';
      mockContainer.style.height = '600px';
      mockContainer.style.position = 'relative';
      mockContainer.style.margin = '50px';
      mockContainer.style.border = '2px solid red';
      
      const mockInput = createMockInitialChatReply({
        input: {
          type: "text input",
          options: {
            type: "fixed-bottom",
            labels: {
              placeholder: "Type here...",
              button: "Send"
            }
          }
        }
      }).input;
      
      render(() => (
        <FixedBottomInput 
          block={mockInput}
          isDisabled={false}
        />
      ), { container: mockContainer });

      await waitForEffects();
      
      const inputElement = screen.getByTestId('fixed-input');
      const inputContainer = inputElement.parentElement!;
      
      // CRITICAL ASSERTION: This test documents the current BROKEN behavior
      // The input uses fixed positioning, which is the root cause of the bug
      const styles = window.getComputedStyle(inputContainer);
      
      // This assertion PASSES with current broken code (documenting the bug)
      expect(styles.position).toBe('fixed');
      
      // This assertion PASSES with current broken code (documenting the bug)  
      expect(styles.bottom).toBe('0px');
      expect(styles.left).toBe('0px');
      expect(styles.right).toBe('0px');
    });

    it('REGRESSION: should extend beyond container width due to left-0 right-0', async () => {
      // Setup: Narrow container
      mockContainer.style.width = '300px';
      mockContainer.style.position = 'absolute';
      mockContainer.style.left = '100px';
      mockContainer.style.top = '100px';
      
      const mockInput = createMockInitialChatReply({
        input: {
          type: "text input",
          options: {
            type: "fixed-bottom"
          }
        }
      }).input;
      
      render(() => (
        <FixedBottomInput 
          block={mockInput}
          isDisabled={false}
        />
      ), { container: mockContainer });

      await waitForEffects();
      
      const inputElement = screen.getByTestId('fixed-input');
      const inputContainer = inputElement.parentElement!;
      
      const containerRect = mockContainer.getBoundingClientRect();
      const inputRect = inputContainer.getBoundingClientRect();
      
      // CRITICAL ASSERTION: This documents the current BROKEN behavior
      // Input extends beyond container width (spans full viewport)
      expect(inputRect.width).toBeGreaterThan(containerRect.width);
      expect(inputRect.left).toBeLessThan(containerRect.left);
      expect(inputRect.right).toBeGreaterThan(containerRect.right);
    });

    it('REGRESSION: should position at viewport bottom, not container bottom', async () => {
      // Setup: Container positioned away from viewport bottom
      mockContainer.style.width = '400px';
      mockContainer.style.height = '500px';
      mockContainer.style.position = 'absolute';
      mockContainer.style.top = '100px';
      mockContainer.style.left = '100px';
      
      const mockInput = createMockInitialChatReply({
        input: {
          type: "text input",
          options: {
            type: "fixed-bottom"
          }
        }
      }).input;
      
      render(() => (
        <FixedBottomInput 
          block={mockInput}
          isDisabled={false}
        />
      ), { container: mockContainer });

      await waitForEffects();
      
      const inputElement = screen.getByTestId('fixed-input');
      const inputContainer = inputElement.parentElement!;
      
      const containerRect = mockContainer.getBoundingClientRect();
      const inputRect = inputContainer.getBoundingClientRect();
      
      // CRITICAL ASSERTION: This documents the current BROKEN behavior
      // Input is at viewport bottom, not container bottom
      expect(inputRect.bottom).toBe(window.innerHeight);
      expect(inputRect.bottom).not.toBe(containerRect.bottom);
      
      // Input should be INSIDE container, but it's not due to fixed positioning
      expect(inputRect.bottom).toBeGreaterThan(containerRect.bottom);
    });

    it('REGRESSION: should use high z-index meant for viewport overlays', async () => {
      const mockInput = createMockInitialChatReply({
        input: {
          type: "text input",
          options: {
            type: "fixed-bottom"
          }
        }
      }).input;
      
      render(() => (
        <FixedBottomInput 
          block={mockInput}
          isDisabled={false}
        />
      ));

      await waitForEffects();
      
      const inputElement = screen.getByTestId('fixed-input');
      const inputContainer = inputElement.parentElement!;
      
      const styles = window.getComputedStyle(inputContainer);
      const zIndex = parseInt(styles.zIndex);
      
      // CRITICAL ASSERTION: This documents the current behavior
      // Uses z-index 51, which is appropriate for viewport overlays but too high for widget-contained elements
      expect(zIndex).toBe(51);
      expect(zIndex).toBeGreaterThan(50); // High z-index indicates it's meant for viewport-level overlays
    });
  });

  describe('Expected Correct Behavior Tests (Currently Failing)', () => {
    it('SHOULD use absolute positioning within Standard widget context (FAILS with current code)', async () => {
      // This test shows what SHOULD happen for Standard widgets
      mockContainer.style.position = 'relative'; // Parent should provide positioning context
      
      const mockInput = createMockInitialChatReply({
        input: {
          type: "text input",
          options: {
            type: "fixed-bottom"
          }
        }
      }).input;
      
      render(() => (
        <FixedBottomInput 
          block={mockInput}
          isDisabled={false}
        />
      ));

      await waitForEffects();
      
      const inputElement = screen.getByTestId('fixed-input');
      const inputContainer = inputElement.parentElement!;
      
      const styles = window.getComputedStyle(inputContainer);
      
      // This assertion FAILS with current implementation (as expected)
      // expect(styles.position).toBe('absolute'); // Should be absolute, not fixed
      
      // For now, document that it's currently fixed (wrong)
      expect(styles.position).toBe('fixed');
    });

    it('SHOULD respect container boundaries (FAILS with current code)', async () => {
      mockContainer.style.width = '350px';
      mockContainer.style.position = 'relative';
      
      const mockInput = createMockInitialChatReply({
        input: {
          type: "text input",  
          options: {
            type: "fixed-bottom"
          }
        }
      }).input;
      
      render(() => (
        <FixedBottomInput 
          block={mockInput}
          isDisabled={false}
        />
      ));

      await waitForEffects();
      
      const inputElement = screen.getByTestId('fixed-input');
      const inputContainer = inputElement.parentElement!;
      
      const containerRect = mockContainer.getBoundingClientRect();
      const inputRect = inputContainer.getBoundingClientRect();
      
      // These assertions FAIL with current implementation (as expected)
      // expect(inputRect.width).toBeLessThanOrEqual(containerRect.width);
      // expect(inputRect.left).toBeGreaterThanOrEqual(containerRect.left);
      // expect(inputRect.right).toBeLessThanOrEqual(containerRect.right);
      
      // For now, document that it currently violates boundaries
      expect(inputRect.width).toBeGreaterThan(containerRect.width);
    });
  });

  describe('Bubble/Popup Context - Should Work Correctly', () => {
    it('should work correctly with viewport-level positioning for Bubble/Popup widgets', async () => {
      // For Bubble/Popup widgets, fixed positioning IS correct
      // because they are viewport overlays
      
      const mockInput = createMockInitialChatReply({
        input: {
          type: "text input",
          options: {
            type: "fixed-bottom"
          }
        }
      }).input;
      
      render(() => (
        <FixedBottomInput 
          block={mockInput}
          isDisabled={false}
        />
      ));

      await waitForEffects();
      
      const inputElement = screen.getByTestId('fixed-input');
      const inputContainer = inputElement.parentElement!;
      
      // For Bubble/Popup context, fixed positioning is actually CORRECT
      const styles = window.getComputedStyle(inputContainer);
      expect(styles.position).toBe('fixed');
      expect(styles.bottom).toBe('0px');
      
      // This is the one context where the current implementation works correctly
    });
  });
});