import { z } from 'zod'
import { choiceInputSchema } from './inputs/choice'
import { conditionBlockSchema } from './logic/condition'
import { startBlockSchema } from './start/schemas'
import {
  textBubbleBlockSchema,
  imageBubbleBlockSchema,
  videoBubbleBlockSchema,
  embedBubbleBlockSchema,
  audioBubbleBlockSchema,
} from './bubbles'
import {
  textInputSchema,
  emailInputSchema,
  numberInputSchema,
  urlInputSchema,
  phoneNumberInputBlockSchema,
  dateInputSchema,
  paymentInputSchema,
  ratingInputBlockSchema,
  fileInputStepSchema,
} from './inputs'
import {
  googleAnalyticsBlockSchema,
  pixelBlockSchema,
} from './integrations'
import {
  scriptBlockSchema,
  redirectBlockSchema,
  setVariableBlockSchema,
  agentLinkBlockSchema,
  waitBlockSchema,
  abTestBlockSchema,
} from './logic'
import { jumpBlockSchema } from './logic/jump'
import { pictureChoiceBlockSchema } from './inputs/pictureChoice'

export const inputBlockSchemas = [
  textInputSchema,
  choiceInputSchema,
  emailInputSchema,
  numberInputSchema,
  urlInputSchema,
  phoneNumberInputBlockSchema,
  dateInputSchema,
  paymentInputSchema,
  ratingInputBlockSchema,
  fileInputStepSchema,
  pictureChoiceBlockSchema,
] as const

export const blockSchema = z.discriminatedUnion('type', [
  startBlockSchema,
  textBubbleBlockSchema,
  imageBubbleBlockSchema,
  videoBubbleBlockSchema,
  embedBubbleBlockSchema,
  audioBubbleBlockSchema,
  ...inputBlockSchemas,
  scriptBlockSchema,
  conditionBlockSchema,
  redirectBlockSchema,
  setVariableBlockSchema,
  agentLinkBlockSchema,
  waitBlockSchema,
  jumpBlockSchema,
  abTestBlockSchema,
  googleAnalyticsBlockSchema,
  pixelBlockSchema,
])