import { z } from 'zod'
import { blockBaseSchema, optionBaseSchema } from '../baseSchemas'
import { defaultButtonLabel } from './constants'
import { InputBlockType } from './enums'

export const keyTokenSchema = z.enum(['Enter', 'Shift', 'Alt', 'Mod'])
export const keyComboSchema = z.array(keyTokenSchema)
export const keymapSchema = z.object({
  submit: z.array(keyComboSchema),
  newline: z.array(keyComboSchema),
})

export const shortcutsSchema = z.object({
  preset: z.enum(['enterToSend', 'modEnterToSend', 'custom']).default('enterToSend'),
  keymap: keymapSchema.optional(),
  imeSafe: z.boolean().default(true),
})

export const textInputOptionsBaseSchema = z.object({
  labels: z.object({
    placeholder: z.string(),
    button: z.string(),
  }),
})

export const textInputOptionsSchema = textInputOptionsBaseSchema
  .merge(optionBaseSchema)
  .merge(
    z.object({
      isLong: z.boolean(),
      type: z.enum(['standard', 'fixed-bottom']).optional().default('standard'),
      shortcuts: shortcutsSchema.optional(),
    })
  )

export const defaultTextInputOptions: TextInputOptions = {
  isLong: false,
  type: 'standard',
  labels: { button: defaultButtonLabel, placeholder: 'Type your answer...' },
}

export const textInputSchema = blockBaseSchema.merge(
  z.object({
    type: z.enum([InputBlockType.TEXT]),
    options: textInputOptionsSchema,
  })
)

export type KeyToken = z.infer<typeof keyTokenSchema>
export type KeyCombo = z.infer<typeof keyComboSchema>
export type Keymap = z.infer<typeof keymapSchema>
export type Shortcuts = z.infer<typeof shortcutsSchema>
export type TextInputBlock = z.infer<typeof textInputSchema>
export type TextInputOptions = z.infer<typeof textInputOptionsSchema>
