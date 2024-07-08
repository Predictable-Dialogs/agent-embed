import type { ChatReply } from './schemas';

export type InputSubmitContent = {
  label?: string
  value: string
}

export type BotContext = {
  agentConfig: InitialChatReply['agentConfig']
  resultId?: string
  isPreview: boolean
  apiHost?: string
  sessionId: string | undefined
  agentName: string
  tabNumber: number
}

export type InitialChatReply = ChatReply & {
  agentConfig: NonNullable<ChatReply['agentConfig']>
  sessionId: NonNullable<ChatReply['sessionId']>
}

export type OutgoingLog = {
  status: string
  description: string
  details?: unknown
}

export type ClientSideActionContext = {
  apiHost?: string
  sessionId: string | undefined 
  agentName?: string
  tabNumber?: number
}

export type ChatChunk = Pick<
  ChatReply,
  'messages' | 'input' | 'clientSideActions'
> & {
  streamingMessageId?: string
}
