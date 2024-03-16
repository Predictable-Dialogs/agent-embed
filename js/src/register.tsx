import { customElement } from 'solid-element'
import {
  defaultBotProps,
  defaultBubbleProps,
  defaultPopupProps,
} from './constants'
import { Bubble } from './features/bubble'
import { Popup } from './features/popup'
import { Standard } from './features/standard'

export const registerWebComponents = () => {
  if (typeof window === 'undefined') {
    return
  }
  
  if (window.localStorage.getItem('NEXT_PUBLIC_DEBUG') === 'true') {
    console.log('Registering web components...');
  }

  // @ts-expect-error element incorect type
  customElement('agent-standard', defaultBotProps, Standard)
  customElement('agent-bubble', defaultBubbleProps, Bubble)
  customElement('agent-popup', defaultPopupProps, Popup)
}
