import type { BubbleProps } from './features/bubble'
import type { PopupProps } from './features/popup'
import type { BotProps } from './components/Bot'
import { createDefaultShortcuts } from './utils/keyboardUtils'

export const defaultBotProps: BotProps = {
  agentName: undefined,
  initialPrompt: 'Hi',
  onInit: undefined,
  isPreview: undefined,
  prefilledVariables: undefined,
  apiHost: undefined,
  apiStreamHost: undefined,
  filterResponse: undefined,
  stream: true,
  persistSession: false,
  input: {
    type: "text input",
    options: {
      type: "fixed-bottom",
      labels: {
        placeholder: "Whats on your mind",
        button: "Enter"
      },
      isLong: false,
      shortcuts: createDefaultShortcuts()
    }
  }
}

export const defaultPopupProps: PopupProps = {
  ...defaultBotProps,
  onClose: undefined,
  onOpen: undefined,
  theme: undefined,
  autoShowDelay: undefined,
  isOpen: undefined,
  defaultOpen: undefined,
}

export const defaultBubbleProps: BubbleProps = {
  ...defaultBotProps,
  onClose: undefined,
  onOpen: undefined,
  theme: undefined,
  previewMessage: undefined,
  onPreviewMessageClick: undefined,
  autoShowDelay: undefined,
}
