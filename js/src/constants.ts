import type { BubbleProps } from './features/bubble'
import type { PopupProps } from './features/popup'
import type { BotProps } from './components/Bot'

export const defaultBotProps: BotProps = {
  agentName: undefined,
  initialPrompt: 'Hi',
  onAnswer: undefined,
  onEnd: undefined,
  onInit: undefined,
  onNewLogs: undefined,
  isPreview: undefined,
  prefilledVariables: undefined,
  apiHost: undefined,
  apiStreamHost: undefined,
  filterResponse: undefined,
  stream: true,
  persistSession: false,
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
