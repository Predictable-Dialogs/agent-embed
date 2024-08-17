import { Component, mergeProps } from 'solid-js';

export type ButtonProps = {
  id: string,
  class?: string,
  style?: string | { [key: string]: string },
};

export const Button: Component<ButtonProps> = (rawProps) => {
  const props = mergeProps({ class: '', style: '' }, rawProps);
  let buttonRef: HTMLButtonElement | undefined;
  const setButtonRef = (element: HTMLButtonElement | undefined) => {
    buttonRef = element;
  };
  
  const handleClick = () => {
    // prints ok
    if (typeof window !== 'undefined' && window.Agent) {
      window.Agent.open({ variables: { topic: props.id } });
    }
  };

  return (
    <button 
      ref={setButtonRef} 
      id={props.id} 
      class={props.class}
      style={props.style}
      onClick={handleClick}
      part="button"
    >
      <slot></slot>
    </button>
);
};