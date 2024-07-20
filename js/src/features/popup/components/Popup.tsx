// features/popup/components/Popup.tsx
import styles from '../../../assets/index.css'
import {
  createSignal,
  onMount,
  Show,
  splitProps,
  onCleanup,
  createEffect,
} from 'solid-js'
import { CommandData } from '../../commands'
import { isDefined, isNotDefined } from '@/lib/utils'
import { PopupParams } from '../types'
import { Bot, BotProps } from '../../../components/Bot'
import { getPaymentInProgressInStorage } from '@/features/blocks/inputs/payment/helpers/paymentInProgressStorage'

export type PopupProps = BotProps &
  PopupParams & {
    defaultOpen?: boolean
    isOpen?: boolean
    onOpen?: () => void
    onClose?: () => void
  }

export const Popup = (props: PopupProps) => {
  const [popupProps, botProps] = splitProps(props, [
    'onOpen',
    'onClose',
    'autoShowDelay',
    'theme',
    'isOpen',
    'defaultOpen',
  ])

  const [initialPrompt, setInitialPrompt] = createSignal<string | undefined>();
  const [prefilledVariables, setPrefilledVariables] = createSignal(
    // eslint-disable-next-line solid/reactivity
    botProps.prefilledVariables
  )

  const [isBotOpened, setIsBotOpened] = createSignal(
    // eslint-disable-next-line solid/reactivity
    popupProps.isOpen ?? false
  )

  onMount(() => {
    const paymentInProgress = getPaymentInProgressInStorage()
    if (popupProps.defaultOpen || paymentInProgress) openBot()
    window.addEventListener('message', processIncomingEvent)
    const autoShowDelay = popupProps.autoShowDelay
    if (isDefined(autoShowDelay)) {
      setTimeout(() => {
        openBot()
      }, autoShowDelay)
    }
  })

  onCleanup(() => {
    window.removeEventListener('message', processIncomingEvent)
  })

  createEffect(() => {
    if (isNotDefined(props.isOpen) || props.isOpen === isBotOpened()) return
    toggleBot()
  })

  createEffect(() => {
    if (!props.prefilledVariables) return
    setPrefilledVariables((existingPrefilledVariables) => ({
      ...existingPrefilledVariables,
      ...props.prefilledVariables,
    }))
  })

  const stopPropagation = (event: MouseEvent) => {
    event.stopPropagation()
  }

  const processIncomingEvent = (event: MessageEvent<CommandData>) => {
    const { data } = event
    if (!data.isFromAgent) return
    if (data.command === 'open') {
      setInitialPrompt(data?.prompt);
      setPrefilledVariables((existingPrefilledVariables) => {
        let updatedPrefilledVariables = { ...existingPrefilledVariables, ...data?.variables };
        
        // If there's a prompt, remove the 'topic' key from the prefilled variables
        if (data?.prompt) {
          const { topic, ...rest } = updatedPrefilledVariables;
          updatedPrefilledVariables = rest;
        }
    
        return updatedPrefilledVariables;
      });      
      openBot()
    }
    if (data.command === 'close') closeBot()
    if (data.command === 'toggle') toggleBot()
    if (data.command === 'setPrefilledVariables')
      setPrefilledVariables((existingPrefilledVariables) => ({
        ...existingPrefilledVariables,
        ...data.variables,
      }))
  }

  const openBot = () => {
    setIsBotOpened(true)
    popupProps.onOpen?.()
    document.body.style.overflow = 'hidden'
    document.addEventListener('pointerdown', closeBot)
  }

  const closeBot = () => {
    setIsBotOpened(false)
    popupProps.onClose?.()
    document.body.style.overflow = 'auto'
    document.removeEventListener('pointerdown', closeBot)
  }

  const toggleBot = () => {
    isBotOpened() ? closeBot() : openBot()
  }

  return (
    <Show when={isBotOpened()}>
      <style>{styles}</style>
      <div
        class="relative"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
        style={{
          'z-index': props.theme?.zIndex ?? 42424242,
        }}
      >
        <style>{styles}</style>
        <div
          class="fixed inset-0 bg-black bg-opacity-50 transition-opacity animate-fade-in"
          part="overlay"
        />
        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div
              class={
                'relative h-[80vh] transform overflow-hidden rounded-lg text-left transition-all sm:my-8 sm:w-full sm:max-w-lg' +
                (props.theme?.backgroundColor ? ' shadow-xl' : '')
              }
              style={{
                'background-color':
                  props.theme?.backgroundColor ?? 'transparent',
              }}
              on:pointerdown={stopPropagation}
            >
              <Bot {...botProps} initialPrompt={initialPrompt()} prefilledVariables={prefilledVariables()} />
            </div>
          </div>
        </div>
      </div>
    </Show>
  )
}
