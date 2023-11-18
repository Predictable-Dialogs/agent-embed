import { z } from 'zod'
import { blockBaseSchema } from '../baseSchemas'
import { LogicBlockType } from './enums'

export const agentLinkOptionsSchema = z.object({
  agentId: z.string().optional(),
  groupId: z.string().optional(),
})

export const agentLinkBlockSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([LogicBlockType.AGENT_LINK]),
    options: agentLinkOptionsSchema,
  })
)

export const defaultAgentLinkOptions: AgentLinkOptions = {}

export type AgentLinkBlock = z.infer<typeof agentLinkBlockSchema>
export type AgentLinkOptions = z.infer<typeof agentLinkOptionsSchema>
