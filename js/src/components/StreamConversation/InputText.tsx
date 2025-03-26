import { Textarea, ShortTextInput } from '@/components'
import { SendButton } from '@/components/SendButton'
import { CommandData } from '@/features/commands'
import { InputSubmitContent } from '@/types'
import { isMobile } from '@/utils/isMobileSignal'
import type { TextInputBlock } from '@/schemas'
import { createSignal, onCleanup, onMount } from 'solid-js'

type Props = {
  block: TextInputBlock
  defaultValue?: string
  onSubmit?: (value: InputSubmitContent) => void
  streamingHandlers?: {
    onInput?: (e: Event) => void;
    onSubmit?: (e: Event) => void
  }
}

export const InputText = (props: Props) => {
  const [inputValue, setInputValue] = createSignal(props.defaultValue ?? '')
  let inputRef: HTMLInputElement | HTMLTextAreaElement | undefined

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

    if (!checkIfInputIsValid()) return

    if (props.streamingHandlers?.onSubmit) {
      const event = new Event('submit')
      props.streamingHandlers?.onSubmit(event)
    } else if (props.onSubmit) {
      props.onSubmit({ value: inputValue() })
    }
    setInputValue('');
  }

  const submitWhenEnter = (e: KeyboardEvent) => {
    if (props.block?.options?.isLong) return
    if (e.key === 'Enter') submit()
  }

  const submitIfCtrlEnter = (e: KeyboardEvent) => {
    if (!props.block?.options?.isLong) return
    if (e.key === 'Enter') submit()
  }

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
      class={'flex items-end justify-between pr-2 agent-input w-full'}
      data-testid="input"
      style={{
        'max-width': undefined
      }}
      onKeyDown={submitWhenEnter}
    >
        <Textarea
          ref={inputRef as HTMLTextAreaElement}
          onInput={(e) => handleInput(e)}
          onKeyDown={submitIfCtrlEnter}
          value={inputValue()}
          placeholder={
            props.block?.options?.labels?.placeholder ?? 'Type your answer...'
          }
        />
      <SendButton
        type="button"
        isDisabled={inputValue() === ''}
        class="my-2 ml-2"
        on:click={submit}
      >
        {props.block?.options?.labels?.button ?? 'Send'}
      </SendButton>
    </div>
  )
}
