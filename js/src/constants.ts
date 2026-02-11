import type { BubbleProps } from './features/bubble'
import type { PopupProps } from './features/popup'
import type { BotProps } from './components/Bot'

// Avatar structure interfaces
export interface AvatarConfig {
  url: string;
  isEnabled: boolean;
}

export interface AvatarProps {
  hostAvatar?: AvatarConfig;
  guestAvatar?: AvatarConfig;
}

// Bubble theme structure interfaces
export interface BubbleThemeConfig {
  color: string;
  backgroundColor: string;
}

export interface BubbleThemeProps {
  hostBubbles?: BubbleThemeConfig;
  guestBubbles?: BubbleThemeConfig;
}

export const MAX_INITIAL_PROMPTS = 10;

export const defaultBotProps: BotProps = {
  agentName: undefined,
  initialPrompt: undefined,
  initialPrompts: undefined,
  onInit: undefined,
  onSend: undefined,
  isPreview: undefined,
  contextVariables: undefined,
  user: undefined,
  apiHost: undefined,
  apiStreamHost: undefined,
  filterResponse: undefined,
  stream: true,
  persistSession: true,
  input: undefined,
  avatar: undefined,
  bubble: undefined,
  customCss: undefined,
  font: undefined,
  background: undefined,
  welcome: undefined
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
