// features/command/types.ts
import { PreviewMessageParams } from '../bubble/types'

export type CommandData = {
  isFromAgent: boolean,
  prompt?: string,
  variables?: Record<string, string | number | boolean>
} & (
  | {
      command: 'open' | 'toggle' | 'close' | 'hidePreviewMessage'
    }
  | ShowMessageCommandData
  | SetPrefilledVariablesCommandData
  | SetInputValueCommandData
)

export type ShowMessageCommandData = {
  command: 'showPreviewMessage'
  message?: Pick<PreviewMessageParams, 'avatarUrl' | 'message'>
}

export type SetPrefilledVariablesCommandData = {
  command: 'setPrefilledVariables'
  variables: Record<string, string | number | boolean>
}

export type SetInputValueCommandData = {
  command: 'setInputValue'
  value: string
}
