import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { ClearButton } from '@/components/ClearButton';
import { cleanupDOM } from '../../test-utils';

// Mock Button component to isolate ClearButton logic
vi.mock('@/components/Button', () => ({
  Button: (props: any) => (
    <button
      {...props}
      data-testid="clear-button"
      class={`mocked-button ${props.variant || 'primary'} ${props.class || ''}`}
      disabled={props.isDisabled || props.disabled}
    >
      {props.children}
    </button>
  ),
}));

describe('ClearButton Component', () => {
  beforeEach(() => {
    cleanupDOM();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Component Rendering', () => {
    it('renders clear button with refresh icon', () => {
      const mockOnClick = vi.fn();
      render(() => <ClearButton onClick={mockOnClick} />);
      
      const button = screen.getByTestId('clear-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('↻');
    });

    it('applies correct CSS classes and ID', () => {
      const mockOnClick = vi.fn();
      render(() => <ClearButton onClick={mockOnClick} />);
      
      const button = screen.getByTestId('clear-button');
      expect(button).toHaveAttribute('id', 'clear-button');
      expect(button).toHaveClass('clear-button');
      expect(button).toHaveClass('secondary'); // from variant="secondary"
    });

    it('has proper accessibility attributes', () => {
      const mockOnClick = vi.fn();
      render(() => <ClearButton onClick={mockOnClick} />);
      
      const button = screen.getByTestId('clear-button');
      expect(button).toHaveAttribute('title', 'Clear chat');
    });

    it('uses secondary button variant styling', () => {
      const mockOnClick = vi.fn();
      render(() => <ClearButton onClick={mockOnClick} />);
      
      const button = screen.getByTestId('clear-button');
      expect(button).toHaveClass('secondary');
    });
  });

  describe('Functionality Tests', () => {
    it('calls onClick handler when clicked', async () => {
      const mockOnClick = vi.fn();
      render(() => <ClearButton onClick={mockOnClick} />);
      
      const button = screen.getByTestId('clear-button');
      button.click();
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('handles button disabled states', () => {
      const mockOnClick = vi.fn();
      render(() => <ClearButton onClick={mockOnClick} isDisabled={true} />);
      
      const button = screen.getByTestId('clear-button');
      expect(button).toBeDisabled();
    });

    it('supports additional props passed through', () => {
      const mockOnClick = vi.fn();
      render(() => <ClearButton onClick={mockOnClick} data-custom="test-value" />);
      
      const button = screen.getByTestId('clear-button');
      expect(button).toHaveAttribute('data-custom', 'test-value');
    });
  });

  describe('Integration Tests', () => {
    it('integrates properly with Button component props', () => {
      const mockOnClick = vi.fn();
      render(() => <ClearButton onClick={mockOnClick} isLoading={true} />);
      
      const button = screen.getByTestId('clear-button');
      expect(button).toHaveAttribute('isLoading', 'true');
    });

    it('maintains button component structure and styling', () => {
      const mockOnClick = vi.fn();
      render(() => <ClearButton onClick={mockOnClick} />);
      
      const button = screen.getByTestId('clear-button');
      expect(button).toHaveClass('mocked-button');
      expect(button).toHaveClass('secondary');
      expect(button).toHaveClass('clear-button');
    });
  });

  describe('Cooldown Functionality', () => {
    it('becomes disabled when isOnCooldown is true', () => {
      const mockOnClick = vi.fn();
      render(() => <ClearButton onClick={mockOnClick} isOnCooldown={true} />);
      
      const button = screen.getByTestId('clear-button');
      expect(button).toBeDisabled();
    });

    it('shows normal title when not on cooldown', () => {
      const mockOnClick = vi.fn();
      render(() => <ClearButton onClick={mockOnClick} isOnCooldown={false} />);
      
      const button = screen.getByTestId('clear-button');
      expect(button).toHaveAttribute('title', 'Clear chat');
    });

    it('changes title to "Please wait..." during cooldown', () => {
      const mockOnClick = vi.fn();
      render(() => <ClearButton onClick={mockOnClick} isOnCooldown={true} />);
      
      const button = screen.getByTestId('clear-button');
      expect(button).toHaveAttribute('title', 'Please wait...');
    });

    it('is enabled when not on cooldown', () => {
      const mockOnClick = vi.fn();
      render(() => <ClearButton onClick={mockOnClick} isOnCooldown={false} />);
      
      const button = screen.getByTestId('clear-button');
      expect(button).not.toBeDisabled();
      expect(button).toHaveAttribute('title', 'Clear chat');
    });

    it('prevents clicks during cooldown period', () => {
      const mockOnClick = vi.fn();
      render(() => <ClearButton onClick={mockOnClick} isOnCooldown={true} />);
      
      const button = screen.getByTestId('clear-button');
      
      // Try to click during cooldown
      button.click();
      button.click();
      button.click();
      
      // onClick should not have been called due to cooldown
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('allows clicking when not on cooldown', () => {
      const mockOnClick = vi.fn();
      render(() => <ClearButton onClick={mockOnClick} isOnCooldown={false} />);
      
      const button = screen.getByTestId('clear-button');
      
      // Click should work when not on cooldown
      button.click();
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      
      button.click();
      expect(mockOnClick).toHaveBeenCalledTimes(2);
    });

    it('works with combined disabled and cooldown states', () => {
      const mockOnClick = vi.fn();
      render(() => <ClearButton onClick={mockOnClick} isDisabled={true} isOnCooldown={true} />);
      
      const button = screen.getByTestId('clear-button');
      expect(button).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('handles multiple rapid clicks when not on cooldown', () => {
      const mockOnClick = vi.fn();
      render(() => <ClearButton onClick={mockOnClick} isOnCooldown={false} />);
      
      const button = screen.getByTestId('clear-button');
      
      // Simulate rapid clicking - should work when not on cooldown
      button.click();
      button.click();
      button.click();
      
      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });

    it('handles onClick being undefined gracefully', () => {
      // TypeScript would normally catch this, but test edge case
      expect(() => {
        render(() => <ClearButton onClick={undefined as any} />);
      }).not.toThrow();
    });

    it('preserves all button accessibility features', () => {
      const mockOnClick = vi.fn();
      render(() => <ClearButton onClick={mockOnClick} />);
      
      const button = screen.getByTestId('clear-button');
      
      // Should be focusable
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveAttribute('title', 'Clear chat');
      
      // Should support keyboard interaction (inherent to button element)
      expect(button).toBeInTheDocument();
    });
  });
});