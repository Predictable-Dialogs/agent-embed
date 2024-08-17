// register.tsx
import { customElement } from 'solid-element'
import {
  defaultBotProps,
  defaultBubbleProps,
  defaultPopupProps,
} from './constants'
import { Bubble } from './features/bubble'
import { Button } from './features/button';
import { Popup } from './features/popup'
import { Standard } from './features/standard'

export const registerWebComponents = () => {
  if (typeof window === 'undefined') {
    return
  }
  
  // @ts-expect-error element incorect type
  customElement('agent-standard', defaultBotProps, Standard)
  customElement('agent-bubble', defaultBubbleProps, Bubble)
  customElement('agent-popup', defaultPopupProps, Popup)  
  
  customElement('ai-button', { id: 'default',
    class: undefined,
    style: undefined
  }, Button) 
}
