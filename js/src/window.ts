//window.ts
/* eslint-disable solid/reactivity */
import { BubbleProps } from './features/bubble'
import { PopupProps } from './features/popup'
import { BotProps } from './components/Bot'
import {
  close,
  hidePreviewMessage,
  open,
  setPrefilledVariables,
  showPreviewMessage,
  toggle,
  setInputValue,
} from './features/commands'


export const initStandard = (props: BotProps & { id?: string }) => {
  if (typeof window !== 'undefined') {
    const standardElement = props.id
      ? document.getElementById(props.id)
      : document.querySelector('agent-standard')
    if (!standardElement) throw new Error('<agent-standard> element not found.')
    Object.assign(standardElement, props)
 }
}

export const initPopup = (props: PopupProps) => {
  if (typeof window !== 'undefined') {
    const popupElement = document.createElement('agent-popup')
    Object.assign(popupElement, props)
    document.body.appendChild(popupElement)
  }
}

export const initBubble = (props: BubbleProps) => {
  if (typeof window !== 'undefined') {
    const bubbleElement = document.createElement('agent-bubble')
    Object.assign(bubbleElement, props)
    document.body.appendChild(bubbleElement)
  }
}

type Agent = {
  initStandard: typeof initStandard
  initPopup: typeof initPopup
  initBubble: typeof initBubble
  close: typeof close
  hidePreviewMessage: typeof hidePreviewMessage
  open: typeof open
  setPrefilledVariables: typeof setPrefilledVariables
  showPreviewMessage: typeof showPreviewMessage
  toggle: typeof toggle
  setInputValue: typeof setInputValue
}

declare global {
  interface Window {
    Agent?: Agent
  }
}
  

export const parsePredictable = () => ({
  initStandard,
  initPopup,
  initBubble,
  close,
  hidePreviewMessage,
  open,
  setPrefilledVariables,
  showPreviewMessage,
  toggle,
  setInputValue,
})

export const injectAgentInWindow = (agent: Agent) => {
  if (typeof window === 'undefined') return
  window.Agent = { ...agent }
}
