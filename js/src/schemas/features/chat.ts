import { z } from 'zod'
import {
  googleAnalyticsOptionsSchema,
  paymentInputRuntimeOptionsSchema,
  pixelOptionsSchema,
  redirectOptionsSchema,
} from './blocks'
import { listVariableValue, agentSchema } from './agent'
import {
  textBubbleContentSchema,
  imageBubbleContentSchema,
  videoBubbleContentSchema,
  audioBubbleContentSchema,
  embedBubbleContentSchema,
} from './blocks/bubbles'
import { BubbleBlockType } from './blocks/bubbles/enums'
import { inputBlockSchemas } from './blocks/schemas'

const dynamicThemeSchema = z.object({
  hostAvatarUrl: z.string().optional(),
  guestAvatarUrl: z.string().optional(),
})

const textMessageSchema = z.object({
  type: z.literal(BubbleBlockType.TEXT),
  content: textBubbleContentSchema,
})

const imageMessageSchema = z.object({
  type: z.enum([BubbleBlockType.IMAGE]),
  content: imageBubbleContentSchema,
})

const videoMessageSchema = z.object({
  type: z.enum([BubbleBlockType.VIDEO]),
  content: videoBubbleContentSchema,
})

const audioMessageSchema = z.object({
  type: z.enum([BubbleBlockType.AUDIO]),
  content: audioBubbleContentSchema,
})

const embedMessageSchema = z.object({
  type: z.enum([BubbleBlockType.EMBED]),
  content: embedBubbleContentSchema
    .omit({
      height: true,
    })
    .merge(z.object({ height: z.number().optional() })),
})

const chatMessageSchema = z.object({ 
  id: z.string(),
  role: z.enum(["assistant", "user"]).optional(), 
  type: z.enum([
    BubbleBlockType.TEXT,
    BubbleBlockType.IMAGE,
    BubbleBlockType.VIDEO,
    BubbleBlockType.AUDIO,
    BubbleBlockType.EMBED
  ]),
  content: z.union([
    textBubbleContentSchema,
    imageBubbleContentSchema,
    videoBubbleContentSchema,
    audioBubbleContentSchema,
    embedBubbleContentSchema
  ])
 })
  

const scriptToExecuteSchema = z.object({
  content: z.string(),
  args: z.array(
    z.object({
      id: z.string(),
      value: z
        .string()
        .or(z.number())
        .or(z.boolean())
        .or(listVariableValue)
        .nullish(),
    })
  ),
})

const startAgentSchema = agentSchema.pick({
  id: true,
  groups: true,
  edges: true,
  variables: true,
  settings: true,
  theme: true,
})

const startParamsSchema = z.object({
  agentName: z
    .string()
    .optional()
    .describe("Name of the agent, temporarily here ..should be removed."),
  isPreview: z
    .boolean()
    .optional()
    .describe(
      "If set to `true`, it will start a Preview session with the unpublished bot and it won't be saved in the Results tab. You need to be authenticated for this to work."
    ),
  startGroupId: z
    .string()
    .optional()
    .describe('Start chat from a specific group.'),
  prefilledVariables: z
    .record(z.unknown())
    .optional()
    .describe(
      ''
    ),
  isStreamEnabled: z.boolean().optional(),
})

export const sendMessageInputSchema = z.object({
  message: z
    .string()
    .optional()
    .describe('The answer to the previous chat input. Do not provide it if you are starting a new chat.'),
  sessionId: z
    .union([z.string(), z.null()])
    .optional()
    .describe(
      'Session ID that you get from the initial chat request to a bot. If not provided, it will create a new session.'
    ),
  startParams: startParamsSchema.optional(),
  agentName: z.string().optional().describe('The agent name.'),
});

const runtimeOptionsSchema = paymentInputRuntimeOptionsSchema.optional()

const startPropsToInjectSchema = z.object({
  googleAnalyticsId: z.string().optional(),
  pixelId: z.string().optional(),
  gtmId: z.string().optional(),
  customHeadCode: z.string().optional(),
})

const clientSideActionSchema = z
  .object({
    lastBubbleBlockId: z.string().optional(),
  })
  .and(
    z
      .object({
        scriptToExecute: scriptToExecuteSchema,
      })
      .or(
        z.object({
          redirect: redirectOptionsSchema,
        })
      )
      .or(
        z.object({
          chatwoot: z.object({ scriptToExecute: scriptToExecuteSchema }),
        })
      )
      .or(
        z.object({
          googleAnalytics: googleAnalyticsOptionsSchema,
        })
      )
      .or(
        z.object({
          wait: z.object({
            secondsToWaitFor: z.number(),
          }),
        })
      )
      .or(
        z.object({
          setVariable: z.object({ scriptToExecute: scriptToExecuteSchema }),
        })
      )
      .or(
        z.object({
          streamOpenAiChatCompletion: z.object({
            message: z.string().optional()
          }),
        })
      )
      .or(
        z.object({
          startPropsToInject: startPropsToInjectSchema,
        })
      )
      .or(
        z.object({
          pixel: pixelOptionsSchema,
        })
      )
  )

export const chatReplySchema = z.object({
  messages: z.any(),
  input: z.any(),
  clientSideActions: z.array(clientSideActionSchema).optional(),
  sessionId: z.string().optional(),
  agentConfig: agentSchema
    .pick({ id: true, theme: true, settings: true })
    .optional(),
  dynamicTheme: dynamicThemeSchema.optional(),
})

export type ChatReply = z.infer<typeof chatReplySchema>
export type ChatMessage = z.infer<typeof chatMessageSchema>
export type SendMessageInput = z.infer<typeof sendMessageInputSchema>
export type ScriptToExecute = z.infer<typeof scriptToExecuteSchema>
export type StartParams = z.infer<typeof startParamsSchema>
export type RuntimeOptions = z.infer<typeof runtimeOptionsSchema>
export type StartAgent = z.infer<typeof startAgentSchema>
export type StartPropsToInject = z.infer<typeof startPropsToInjectSchema>

// export type Message = {
//   id: string
//   role: "user" | "assistant"
//   type: BubbleBlockType
//   content: any
// }
