import { render, screen } from '@solidjs/testing-library';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FixedBottomInput } from '@/components/StreamConversation/FixedBottomInput';
import { InputBlockType } from '@/schemas/features/blocks/inputs/enums';
import type { TextInputBlock } from '@/schemas';
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

  // Visual Example

  // Standard Widget (position: absolute):
  // ┌─────────────────────────────────────┐  Browser Window
  // │  ┌─────────────────────────────────┐ │
  // │  │          Other Content          │ │
  // │  │  ┌─────────────────────────────┐│ │
  // │  │  │     Widget Container        ││ │  ← Container (position: relative)
  // │  │  │                             ││ │
  // │  │  │  Messages...                ││ │
  // │  │  │                             ││ │
  // │  │  │  ┌─────────────────────────┐││ │  ← Input (position: absolute)
  // │  │  │  │ [Input Field] [Send]    │││ │     left:0, right:0, bottom:0
  // │  │  │  └─────────────────────────┘││ │     = spans container width
  // │  │  └─────────────────────────────┘│ │
  // │  └─────────────────────────────────┘ │
  // └─────────────────────────────────────┘

  // Bubble/Popup Widget (position: fixed):
  // ┌─────────────────────────────────────┐  Browser Window
  // │                                     │
  // │          Other Content              │
  // │                                     │
  // │          Widget Somewhere           │
  // │                                     │
  // │ ┌─────────────────────────────────┐ │  ← Input (position: fixed)
  // │ │ [Input Field]         [Send]    │ │     left:0, right:0, bottom:0
  // │ └─────────────────────────────────┘ │     = spans full screen width
  // └─────────────────────────────────────┘

  // Standard Widget (position: absolute):
  // - bottom: 0 = "0px from bottom of container"
  // - left: 0, right: 0 = "span width of container"
  // - Reference point: The widget container

  // Bubble/Popup Widget (position: fixed):
  // - bottom: 0 = "0px from bottom of viewport/screen"
  // - left: 0, right: 0 = "span width of entire screen"
  // - Reference point: The browser window

  // Same CSS values + different position property = completely different behaviors. We're
  // verifying that our fix uses the right positioning strategy while keeping the same coordinate
  // system.

  describe('Standard Widget Context - Fixed Positioning (After Fix)', () => {
    it('FIXED: should still use fixed positioning without widget context (fallback behavior)', async () => {
      // This test shows what happens without widgetContext prop (legacy behavior)
      mockContainer.style.width = '400px';
      mockContainer.style.height = '600px';
      mockContainer.style.position = 'relative';
      
      const mockInput = {
        id: "test-input-id",
        groupId: "test-group-id", 
        type: InputBlockType.TEXT,
        options: {
          type: "fixed-bottom" as const,
          labels: {
            placeholder: "Type here...",
            button: "Send"
          },
          isLong: false
        }
      } as TextInputBlock;
      
      render(() => (
        <FixedBottomInput 
          block={mockInput}
          isDisabled={false}
          // No widgetContext prop - should fallback to fixed positioning
        />
      ), { container: mockContainer });

      await waitForEffects();
      
      const inputElement = screen.getByTestId('fixed-input');
      const inputContainer = inputElement.parentElement!;
      
      // Without widgetContext, should still use fixed positioning (legacy behavior)
      expect(inputContainer).toHaveClass('fixed');
      expect(inputContainer).not.toHaveClass('absolute');
      expect(inputContainer).toHaveClass('z-[var(--layer-overlay)]');
      expect(inputContainer).not.toHaveClass('z-[var(--layer-container)]');
    });
    it('FIXED: should use absolute positioning within Standard widget context', async () => {
      // Setup: Constrained container (simulating Standard widget)
      mockContainer.style.width = '400px';
      mockContainer.style.height = '600px';
      mockContainer.style.position = 'relative';
      mockContainer.style.margin = '50px';
      mockContainer.style.border = '2px solid red';
      
      const mockInput = {
        id: "test-input-id",
        groupId: "test-group-id", 
        type: InputBlockType.TEXT,
        options: {
          type: "fixed-bottom" as const,
          labels: {
            placeholder: "Type here...",
            button: "Send"
          },
          isLong: false
        }
      } as TextInputBlock;
      
      render(() => (
        <FixedBottomInput 
          block={mockInput}
          isDisabled={false}
          widgetContext="standard"
        />
      ), { container: mockContainer });

      await waitForEffects();
      
      const inputElement = screen.getByTestId('fixed-input');
      const inputContainer = inputElement.parentElement!;
      
      // CRITICAL ASSERTION: Should use absolute positioning for Standard widgets
      // This test PASSES with the fix and would FAIL if fix regresses
      expect(inputContainer).toHaveClass('absolute');
      expect(inputContainer).not.toHaveClass('fixed');
      expect(inputContainer).toHaveClass('z-[var(--layer-container)]');
      expect(inputContainer).not.toHaveClass('z-[var(--layer-overlay)]');
    });

  // Visual Breakdown of the Test

  // Test Setup:

  // mockContainer.style.width = '300px';       // Narrow container
  // mockContainer.style.position = 'relative'; // Provides positioning context
  // mockContainer.style.left = '100px';        // Container positioned from left
  // mockContainer.style.top = '100px';         // Container positioned from top

  // Visual Layout:

  // Browser Window (1200px wide)
  // ┌────────────────────────────────────────────────────────────┐
  // │                                                            │
  // │     100px                                                  │
  // │    ┌─────┐                                                 │
  // │100px│     │                                                │
  // │    │  ┌──▼──────────────────────────┐                     │ ← Container
  // │    │  │  Widget Container (300px)   │                     │   positioned at
  // │    │  │  position: relative         │                     │   (100px, 100px)
  // │    │  │                             │                     │
  // │    │  │  Chat messages...           │                     │
  // │    │  │                             │                     │
  // │    │  │  ┌─────────────────────────┐│                     │ ← Input should be
  // │    │  │  │[Input Field]    [Send]  ││                     │   constrained to
  // │    │  │  └─────────────────────────┘│                     │   300px width
  // │    │  └─────────────────────────────┘                     │
  // │    └────────────────────────────────────────────────────  │
  // └────────────────────────────────────────────────────────────┘

  // What This Test Verifies

  // The Problem This Test Catches:

  // Before our fix, with position: fixed:
  // Browser Window (1200px wide)
  // ┌────────────────────────────────────────────────────────────┐
  // │                                                            │
  // │    ┌─────────────────────────────────┐ 300px container     │
  // │    │  Widget Container               │                     │
  // │    │  Chat messages...               │                     │
  // │    │  └─────────────────────────────┘                     │
  // │                                                            │
  // │┌──────────────────────────────────────────────────────────┐│ ← BROKEN: Input
  // ││ [Input Field]                              [Send]        ││   spans full width
  // │└──────────────────────────────────────────────────────────┘│   ignoring container
  // └────────────────────────────────────────────────────────────┘

  // After our fix, with position: absolute:
  // Browser Window (1200px wide)
  // ┌────────────────────────────────────────────────────────────┐
  // │                                                            │
  // │    ┌─────────────────────────────────┐                     │
  // │    │  Widget Container (300px)       │                     │
  // │    │  Chat messages...               │                     │
  // │    │  ┌─────────────────────────────┐│ ← FIXED: Input     │
  // │    │  │[Input Field]        [Send]  ││   respects         │
  // │    │  └─────────────────────────────┘│   container width  │
  // │    └─────────────────────────────────┘                     │
  // └────────────────────────────────────────────────────────────┘

  // The Assertions Explained

  // const containerRect = mockContainer.getBoundingClientRect();
  // const inputRect = inputContainer.getBoundingClientRect();

  // // Test 1: Input width should not exceed container width
  // expect(inputRect.width).toBeLessThanOrEqual(containerRect.width);
  // // ✓ Input: 300px ≤ Container: 300px

  // // Test 2: Input left edge should be within container bounds  
  // expect(inputRect.left).toBeGreaterThanOrEqual(containerRect.left);
  // // ✓ Input left: 100px ≥ Container left: 100px

  // // Test 3: Input right edge should be within container bounds
  // expect(inputRect.right).toBeLessThanOrEqual(containerRect.right);
  // // ✓ Input right: 400px ≤ Container right: 400px

  // Coordinate Example

  // With the test setup:
  // - Container: left=100px, width=300px, so right=400px
  // - Input (Fixed): With our fix, should match container bounds
  // - Input (Broken): Would be left=0px, width=1200px, right=1200px

  // Coordinates:
  // Container: left=100, right=400, width=300
  // Input Fixed: left=100, right=400, width=300  ✓
  // Input Broken: left=0,   right=1200, width=1200  ✗

  // Why This Test Is Important

  // This test specifically catches boundary violations - the core problem we fixed:

  // 1. Width Constraint: Input must fit within container width
  // 2. Left Boundary: Input cannot extend left of container
  // 3. Right Boundary: Input cannot extend right of container

  // This ensures that in real-world scenarios like:
  // - Narrow sidebars (350px)
  // - Card layouts (500px)
  // - Mobile containers (320px)

  // The input will respect the widget boundaries instead of breaking out and spanning the full screen
  // width.

  // This test would FAIL if someone accidentally reverted our fix back to position: fixed because the
  // input would ignore container boundaries again.

    it('FIXED: should respect container width with Standard widget context', async () => {
      // Setup: Narrow container with positioned context
      mockContainer.style.width = '300px';
      mockContainer.style.position = 'relative'; // Provide positioning context
      mockContainer.style.left = '100px';
      mockContainer.style.top = '100px';
      
      const mockInput = {
        id: "test-input-id",
        groupId: "test-group-id", 
        type: InputBlockType.TEXT,
        options: {
          type: "fixed-bottom" as const,
          labels: {
            placeholder: "Type here...",
            button: "Send"
          },
          isLong: false
        }
      } as TextInputBlock;
      
      render(() => (
        <FixedBottomInput 
          block={mockInput}
          isDisabled={false}
          widgetContext="standard"
        />
      ), { container: mockContainer });

      await waitForEffects();
      
      const inputElement = screen.getByTestId('fixed-input');
      const inputContainer = inputElement.parentElement!;
      
      const containerRect = mockContainer.getBoundingClientRect();
      const inputRect = inputContainer.getBoundingClientRect();
      
      expect(inputRect.width).toBeLessThanOrEqual(containerRect.width);
      expect(inputRect.left).toBeGreaterThanOrEqual(containerRect.left);
      expect(inputRect.right).toBeLessThanOrEqual(containerRect.right);
    });

    it('FIXED: should position at container bottom with Standard widget context', async () => {
      // Setup: Container positioned away from viewport bottom
      mockContainer.style.width = '400px';
      mockContainer.style.height = '500px';
      mockContainer.style.position = 'relative'; // Provide positioning context
      mockContainer.style.top = '100px';
      mockContainer.style.left = '100px';
      
      const mockInput = {
        id: "test-input-id",
        groupId: "test-group-id", 
        type: InputBlockType.TEXT,
        options: {
          type: "fixed-bottom" as const,
          labels: {
            placeholder: "Type here...",
            button: "Send"
          },
          isLong: false
        }
      } as TextInputBlock;
      
      render(() => (
        <FixedBottomInput 
          block={mockInput}
          isDisabled={false}
          widgetContext="standard"
        />
      ), { container: mockContainer });

      await waitForEffects();
      
      const inputElement = screen.getByTestId('fixed-input');
      const inputContainer = inputElement.parentElement!;
      
      const containerRect = mockContainer.getBoundingClientRect();
      const inputRect = inputContainer.getBoundingClientRect();
      
      // CRITICAL ASSERTION: Input should now be positioned relative to container
      // This test PASSES with the fix and would FAIL if fix regresses
      expect(inputRect.bottom).toBe(containerRect.bottom);
      expect(inputRect.bottom).not.toBe(window.innerHeight);
      
      // Input should be INSIDE container with the fix
      expect(inputRect.bottom).toBeLessThanOrEqual(containerRect.bottom);
    });

    it('REGRESSION: should use high z-index meant for viewport overlays', async () => {
      const mockInput = {
        id: "test-input-id",
        groupId: "test-group-id", 
        type: InputBlockType.TEXT,
        options: {
          type: "fixed-bottom" as const,
          labels: {
            placeholder: "Type here...",
            button: "Send"
          },
          isLong: false
        }
      } as TextInputBlock;
      
      render(() => (
        <FixedBottomInput 
          block={mockInput}
          isDisabled={false}
        />
      ));

      await waitForEffects();
      
      const inputElement = screen.getByTestId('fixed-input');
      const inputContainer = inputElement.parentElement!;
      
      // CRITICAL ASSERTION: This documents the current behavior
      // Uses z-index 51, which is appropriate for viewport overlays but too high for widget-contained elements
      expect(inputContainer).toHaveClass('z-[var(--layer-overlay)]');
      expect(inputContainer).not.toHaveClass('z-[var(--layer-container)]');
    });
  });

  describe('Standard Widget Context - Correct Behavior Verified', () => {
    it('FIXED: should use absolute positioning within Standard widget context', async () => {
      // Test that Standard widgets now use absolute positioning correctly
      mockContainer.style.position = 'relative'; // Parent provides positioning context
      
      const mockInput = {
        id: "test-input-id",
        groupId: "test-group-id", 
        type: InputBlockType.TEXT,
        options: {
          type: "fixed-bottom" as const,
          labels: {
            placeholder: "Type here...",
            button: "Send"
          },
          isLong: false
        }
      } as TextInputBlock;
      
      render(() => (
        <FixedBottomInput 
          block={mockInput}
          isDisabled={false}
          widgetContext="standard"
        />
      ));

      await waitForEffects();
      
      const inputElement = screen.getByTestId('fixed-input');
      const inputContainer = inputElement.parentElement!;
      
      // CRITICAL ASSERTION: Should now use absolute positioning for Standard widgets
      // This test PASSES with the fix and would FAIL if fix regresses
      expect(inputContainer).toHaveClass('absolute');
      expect(inputContainer).not.toHaveClass('fixed');
      expect(inputContainer).toHaveClass('z-[var(--layer-container)]');
      expect(inputContainer).not.toHaveClass('z-[var(--layer-overlay)]');
    });

    it('FIXED: should respect container boundaries with Standard widget context', async () => {
      mockContainer.style.width = '350px';
      mockContainer.style.position = 'relative';
      
      const mockInput = {
        id: "test-input-id",
        groupId: "test-group-id", 
        type: InputBlockType.TEXT,
        options: {
          type: "fixed-bottom" as const,
          labels: {
            placeholder: "Type here...",
            button: "Send"
          },
          isLong: false
        }
      } as TextInputBlock;
      
      render(() => (
        <FixedBottomInput 
          block={mockInput}
          isDisabled={false}
          widgetContext="standard"
        />
      ), { container: mockContainer });

      await waitForEffects();
      
      const inputElement = screen.getByTestId('fixed-input');
      const inputContainer = inputElement.parentElement!;
      
      const containerRect = mockContainer.getBoundingClientRect();
      const inputRect = inputContainer.getBoundingClientRect();
      
      // CRITICAL ASSERTION: Input should now respect container boundaries
      // This test PASSES with the fix and would FAIL if fix regresses
      expect(inputRect.width).toBeLessThanOrEqual(containerRect.width);
      expect(inputRect.left).toBeGreaterThanOrEqual(containerRect.left);
      expect(inputRect.right).toBeLessThanOrEqual(containerRect.right);
    });
  });

  describe('Bubble/Popup Context - Should Work Correctly', () => {
    it('should maintain fixed positioning for Bubble widgets (viewport overlays)', async () => {
      // For Bubble/Popup widgets, fixed positioning IS correct
      // because they are viewport overlays
      
      const mockInput = {
        id: "test-input-id",
        groupId: "test-group-id", 
        type: InputBlockType.TEXT,
        options: {
          type: "fixed-bottom" as const,
          labels: {
            placeholder: "Type here...",
            button: "Send"
          },
          isLong: false
        }
      } as TextInputBlock;
      
      render(() => (
        <FixedBottomInput 
          block={mockInput}
          isDisabled={false}
          widgetContext="bubble"
        />
      ));

      await waitForEffects();
      
      const inputElement = screen.getByTestId('fixed-input');
      const inputContainer = inputElement.parentElement!;
      
      // CRITICAL ASSERTION: Bubble widgets should still use fixed positioning
      // This ensures our fix doesn't break Bubble/Popup widgets
      expect(inputContainer).toHaveClass('fixed');
      expect(inputContainer).not.toHaveClass('absolute');
      expect(inputContainer).toHaveClass('z-[var(--layer-overlay)]');
      expect(inputContainer).not.toHaveClass('z-[var(--layer-container)]');
    });

    it('should maintain fixed positioning for Popup widgets (viewport overlays)', async () => {
      const mockInput = {
        id: "test-input-id",
        groupId: "test-group-id", 
        type: InputBlockType.TEXT,
        options: {
          type: "fixed-bottom" as const,
          labels: {
            placeholder: "Type here...",
            button: "Send"
          },
          isLong: false
        }
      } as TextInputBlock;
      
      render(() => (
        <FixedBottomInput 
          block={mockInput}
          isDisabled={false}
          widgetContext="popup"
        />
      ));

      await waitForEffects();
      
      const inputElement = screen.getByTestId('fixed-input');
      const inputContainer = inputElement.parentElement!;
      
      // CRITICAL ASSERTION: Popup widgets should still use fixed positioning
      expect(inputContainer).toHaveClass('fixed');
      expect(inputContainer).not.toHaveClass('absolute');
      expect(inputContainer).toHaveClass('z-[var(--layer-overlay)]');
      expect(inputContainer).not.toHaveClass('z-[var(--layer-container)]');
    });
  });
});