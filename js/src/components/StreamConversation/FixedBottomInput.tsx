import { AutoResizingTextarea } from '@/components/inputs/AutoResizingTextarea'
import { SendButton } from '@/components/SendButton'
import { CommandData } from '@/features/commands'
import { InputSubmitContent, WidgetContext } from '@/types'
import { isMobile } from '@/utils/isMobileSignal'
import type { TextInputBlock } from '@/schemas'
import type { Shortcuts } from '@/schemas/features/blocks/inputs/text'
import { createSignal, createEffect, onCleanup, onMount, createMemo } from 'solid-js'

type Props = {
  block: TextInputBlock
  defaultValue?: string
  onSubmit?: (value: InputSubmitContent) => void
  streamingHandlers?: {
    onInput?: (e: Event) => void;
    onSubmit?: (e: Event) => void
  }
  isDisabled?: boolean
  widgetContext?: WidgetContext
}

export const FixedBottomInput = (props: Props) => {
  const [inputValue, setInputValue] = createSignal(props.defaultValue ?? '')
  const [shouldFocus, setShouldFocus] = createSignal(false)
  let inputRef: HTMLTextAreaElement | undefined

  // Determine positioning based on widget context
  const isStandardWidget = createMemo(() => props.widgetContext === 'standard')

  // Derive shortcuts configuration for backward compatibility with isLong
  const getEffectiveShortcuts = (): Shortcuts => {
    // If shortcuts are explicitly provided, use them
    if (props.block?.options?.shortcuts) {
      return props.block.options.shortcuts
    }
    
    return {
      preset: 'enterToSend', 
      imeSafe: true
    }
  }

  const handleInput = (e: Event) => {
    const target = e.currentTarget as HTMLTextAreaElement;
    setInputValue(target.value);
    
    if (props.streamingHandlers?.onInput) {
      props.streamingHandlers.onInput(e);
    }
  }

  const checkIfInputIsValid = () =>
    inputValue() !== '' && inputRef?.reportValidity()

  const submit = () => {
    if (props.isDisabled) return
    if (!checkIfInputIsValid()) return

    if (props.streamingHandlers?.onSubmit) {
      const event = new Event('submit')
      props.streamingHandlers?.onSubmit(event)
      // Clear input after submission
      setInputValue('')
      // Set flag to focus when input is re-enabled
      setShouldFocus(true)
    } 
  }


  // Effect to focus input when it becomes enabled after submission
  createEffect(() => {
    if (shouldFocus() && !props.isDisabled && inputRef) {
      inputRef.focus()
      setShouldFocus(false)
    }
  })

  onMount(() => {
    if (!isMobile() && inputRef) inputRef.focus()
    window.addEventListener('message', processIncomingEvent)
  })

  onCleanup(() => {
    window.removeEventListener('message', processIncomingEvent)
  })

  const processIncomingEvent = (event: MessageEvent<CommandData>) => {
    const { data } = event
    if (!data.isFromAgent) return
    if (data.command === 'setInputValue') setInputValue(data.value)
  }

  return (
    <div
      class="pb-[var(--space-safe-bottom)] px-3 pt-4 bottom-0 inset-x-0"
      classList={{
        // Standard widget: absolute positioning within container
        'absolute': isStandardWidget(),
        'z-[var(--layer-container)]': isStandardWidget(),
        // Bubble/Popup widgets: fixed positioning for viewport overlay
        'fixed': !isStandardWidget(),
        'z-[var(--layer-overlay)]': !isStandardWidget(),
      }}
    >
      <div
        class="flex items-end justify-between agent-input agent-input-container w-full mx-auto relative fixed-input-overlay"
        data-testid="fixed-input"
      >
        <AutoResizingTextarea
          ref={inputRef as HTMLTextAreaElement}
          onInput={(e) => handleInput(e)}
          onSubmit={submit}
          shortcuts={getEffectiveShortcuts()}
          value={inputValue()}
          placeholder={
            props.block?.options?.labels?.placeholder ?? 'Type your answer...'
          }
          disabled={props.isDisabled}
        />
        <SendButton
          type="button"
          isDisabled={inputValue() === '' || props.isDisabled}
          class="my-2 mx-2"
          on:click={submit}
        >
          {props.block?.options?.labels?.button ?? 'Send'}
        </SendButton>
      </div>
    </div>
  )
}