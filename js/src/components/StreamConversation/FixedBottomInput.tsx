import { Textarea, ShortTextInput } from '@/components'
import { SendButton } from '@/components/SendButton'
import { CommandData } from '@/features/commands'
import { InputSubmitContent, WidgetContext } from '@/types'
import { isMobile } from '@/utils/isMobileSignal'
import type { TextInputBlock } from '@/schemas'
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
  let inputRef: HTMLInputElement | HTMLTextAreaElement | undefined

  // Determine positioning based on widget context
  const isStandardWidget = createMemo(() => props.widgetContext === 'standard')

  const handleInput = (e: Event) => {
    const target = e.currentTarget as HTMLInputElement | HTMLTextAreaElement;
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
    } else if (props.onSubmit) {
      props.onSubmit({ value: inputValue() })
      // Clear input after submission
      setInputValue('')
      // Set flag to focus when input is re-enabled
      setShouldFocus(true)
    }
  }

  const submitWhenEnter = (e: KeyboardEvent) => {
    if (props.block?.options?.isLong) return
    if (e.key === 'Enter') submit()
  }

  const submitIfCtrlEnter = (e: KeyboardEvent) => {
    if (!props.block?.options?.isLong) return
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit()
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
        class="flex items-end justify-between agent-input w-full max-w-4xl mx-auto relative fixed-input-overlay"
        data-testid="fixed-input"
        onKeyDown={submitWhenEnter}
      >
        {props.block?.options?.isLong ? (
          <Textarea
            ref={inputRef as HTMLTextAreaElement}
            onInput={(e) => handleInput(e)}
            onKeyDown={submitIfCtrlEnter}
            value={inputValue()}
            placeholder={
              props.block?.options?.labels?.placeholder ?? 'Type your answer...'
            }
            disabled={props.isDisabled}
          />
        ) : (
          <ShortTextInput
            ref={inputRef as HTMLInputElement}
            onInput={(e) => handleInput(e)}
            value={inputValue()}
            placeholder={
              props.block?.options?.labels?.placeholder ?? 'Type your answer...'
            }
            disabled={props.isDisabled}
          />
        )}
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