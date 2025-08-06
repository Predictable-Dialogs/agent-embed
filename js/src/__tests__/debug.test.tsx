import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';

// Simple SolidJS component to test
function TestComponent() {
  const [count, setCount] = createSignal(0);
  return (
    <div data-testid="test-component">
      <p data-testid="count">{count()}</p>
      <button data-testid="increment" onClick={() => setCount(count() + 1)}>
        Increment
      </button>
    </div>
  );
}

// Import the actual Bot component without mocking initially
import { Bot } from '@/components/Bot';

describe('Debug Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render a simple SolidJS component', () => {
    render(() => <TestComponent />);
    
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('should see what Bot component renders without any mocking', () => {
    // Don't mock anything - let's see what actually renders
    const { container } = render(() => <Bot agentName="test" />);
    
    console.log('Bot container HTML:', container.innerHTML);
    console.log('Document body HTML:', document.body.innerHTML);
    
    // Just check that something renders
    expect(container.firstChild).toBeDefined();
  });

  it('should check if style tags are being rendered', () => {
    render(() => <Bot agentName="test" />);
    
    const styleTags = document.querySelectorAll('style');
    console.log('Number of style tags:', styleTags.length);
    styleTags.forEach((tag, index) => {
      console.log(`Style tag ${index}:`, tag.textContent);
    });
    
    expect(styleTags.length).toBeGreaterThan(0);
  });
});