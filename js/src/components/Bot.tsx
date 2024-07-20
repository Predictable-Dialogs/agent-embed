import { LiteBadge } from './LiteBadge'
import { createEffect, createSignal, onCleanup, onMount, Show } from 'solid-js'
import { isNotDefined } from '@/lib/utils'
import { getInitialChatReplyQuery } from '@/queries/getInitialChatReplyQuery'
import { ConversationContainer } from './ConversationContainer'
import { setIsMobile } from '@/utils/isMobileSignal'
import { BotContext, InitialChatReply, OutgoingLog } from '@/types'
import { ErrorMessage } from './ErrorMessage'
import { setCssVariablesValue } from '@/utils/setCssVariablesValue'
import immutableCss from '../assets/immutable.css'

export type BotProps = {
  agentName: string | any
  initialPrompt?: string
  isPreview?: boolean
  resultId?: string
  startGroupId?: string
  prefilledVariables?: Record<string, unknown>
  apiHost?: string
  onNewInputBlock?: (ids: { id: string; groupId: string }) => void
  onAnswer?: (answer: { message: string; blockId: string }) => void
  onInit?: () => void
  onEnd?: () => void
  onNewLogs?: (logs: OutgoingLog[]) => void
}


export const Bot = (props: BotProps & { class?: string }) => {
  const [isConnecting, setIsConnecting] = createSignal(false);
  const [sessionId, setSessionId] = createSignal<string | undefined>();
  const [agentConfig, setAgentConfig] = createSignal<any | undefined>()
  const [clientSideActions, setClientSideActions] = createSignal<any | []>([]) 
  const [initialInput, setInitialInput] = createSignal<any | null>(null)
  const [initialMessages, setInitialMessages] = createSignal<any | []>([])
  const [customCss, setCustomCss] = createSignal('')
  const [isInitialized, setIsInitialized] = createSignal(false)
  const [error, setError] = createSignal<Error | undefined>()



  const getSessionId = () => {
    const sessionId = localStorage.getItem("sessionId");
    return sessionId ? JSON.parse(sessionId) : null;
  };

  const getAgentConfig = () => {
    const agentConfig = localStorage.getItem("agentConfig");
    return agentConfig ? JSON.parse(agentConfig) : null;
  };

  const getCustomCss = () => {
    const customCss = localStorage.getItem("customCss");
    return customCss ? JSON.parse(customCss) : null;
  };



  
  const initializeBot = async () => {
    setIsInitialized(true)
    const urlParams = new URLSearchParams(location.search)
    props.onInit?.()
    const prefilledVariables: { [key: string]: string } = {}
    urlParams.forEach((value, key) => {
      prefilledVariables[key] = value
    })


    const storedSessionId = getSessionId();
    const storedAgentConfig = getAgentConfig();
    const storedCustomCss = getCustomCss();


    if (storedSessionId) {
      setSessionId(storedSessionId.sessionId);
    }

    if (storedAgentConfig) {
      setAgentConfig(storedAgentConfig.agentConfig);
    }

    if (storedCustomCss) {
      setCustomCss(storedCustomCss.customCss);
    }
    setIsConnecting(true);
    const { data, error } = await getInitialChatReplyQuery({
      sessionId: sessionId(),
      stripeRedirectStatus: urlParams.get('redirect_status') ?? undefined,
      agentName: props.agentName,
      initialPrompt: props.initialPrompt,
      apiHost: props.apiHost,
      isPreview: props.isPreview ?? false,
      resultId: undefined,
      startGroupId: props.startGroupId,
      prefilledVariables: {
        ...prefilledVariables,
        ...props.prefilledVariables,
      },
    })
    setIsConnecting(false);
    if (error && 'code' in error && typeof error.code === 'string') {
      if (props.isPreview ?? false) {
        return setError(
          new Error('An error occurred while loading the bot.', {
            cause: error.message,
          })
        )
      }
      if (['BAD_REQUEST', 'FORBIDDEN'].includes(error.code))
        return setError(new Error('This bot is now closed.'))
      if (error.code === 'NOT_FOUND')
        return setError(new Error("The bot you're looking for doesn't exist."))
    }
    if (!data) return setError(new Error("Error! Couldn't initiate the chat."))
    
    setSessionId(data.sessionId);
    setClientSideActions(data.clientSideActions);
    setInitialInput(data.input);
    setInitialMessages(data.messages);
    setCustomCss(data.agentConfig.theme.customCss ?? '')
    setAgentConfig(data.agentConfig);

    if (data.input?.id && props.onNewInputBlock)
    props.onNewInputBlock({
      id: data.input.id,
      groupId: data.input.groupId,
    })
    if (data.logs) props.onNewLogs?.(data.logs)
  }
    
  createEffect(() => {
    if (isNotDefined(props.agentName) || isInitialized()) return
    initializeBot().then()
  })

  
  createEffect(() => {
    localStorage.setItem(
      "customCss",
      JSON.stringify({
        customCss: customCss()
      })
    );
  });

  createEffect(() => {
    localStorage.setItem(
      "sessionId",
      JSON.stringify({
        sessionId: sessionId(),
      })
    );
  });

  createEffect(() => {
    localStorage.setItem(
      "agentConfig",
      JSON.stringify({
        agentConfig: agentConfig(),
      })
    );
  });


  // The key used to store the last tab number
  const LAST_TAB_NUMBER_KEY = 'lastTabNumber';

  let tabNumber: number;
  createEffect(() => {    
    // Check if we have a tab number for the current session
    let tabNumberString = sessionStorage.getItem('tabNumber');

    if (!tabNumberString) {
        // If not, get the last tab number from localStorage, increment it and save
        const lastTabNumber = parseInt(localStorage.getItem(LAST_TAB_NUMBER_KEY) || '0');
        tabNumber = lastTabNumber + 1;
        localStorage.setItem(LAST_TAB_NUMBER_KEY, tabNumber.toString());
        sessionStorage.setItem('tabNumber', tabNumber.toString());
        // Trigger the storage event for other tabs
        window.dispatchEvent(new Event('storage'));
    } else {
      tabNumber = parseInt(tabNumberString);
    }
  });

  
  onCleanup(() => {
    setIsInitialized(false)
  })

  return (
    <>
      <style>{customCss()}</style>
      <style>{immutableCss}</style>
      <Show when={error()} keyed>
        {(error) => <ErrorMessage error={error} />}
      </Show>
      <Show when={agentConfig()} keyed>
        {(agentConfigValue) => (
          <BotContent
            class={props.class}
            isConnecting={isConnecting()}
            initialAgentReply={{
              messages: initialMessages(),
              clientSideActions: clientSideActions(),
              input: initialInput(),
              agentConfig: {
                ...agentConfigValue,
              },
            }}
            context={{
              apiHost: props.apiHost,
              isPreview: (props.isPreview ?? false),
              // resultId: initialAgentReply.resultId,
              sessionId: sessionId(),
              agentConfig: agentConfigValue,
              agentName: props.agentName,
              tabNumber: tabNumber
            }}
            setSessionId={setSessionId}
            onNewInputBlock={props.onNewInputBlock}
            onNewLogs={props.onNewLogs}
            onAnswer={props.onAnswer}
            onEnd={props.onEnd}
          />
        )}
      </Show>
    </>
  )
}

type BotContentProps = {
  initialAgentReply: any
  context: BotContext
  class?: string
  onNewInputBlock?: (block: { id: string; groupId: string }) => void
  onAnswer?: (answer: { message: string; blockId: string }) => void
  onEnd?: () => void
  onNewLogs?: (logs: OutgoingLog[]) => void
  setSessionId: (id: string | null) => void;
  isConnecting?: boolean;
}

const BotContent = (props: BotContentProps) => {
  let botContainer: HTMLDivElement | undefined

  const resizeObserver = new ResizeObserver((entries) => {
    return setIsMobile(entries[0].target.clientWidth < 400)
  })

  const injectCustomFont = () => {
    const existingFont = document.getElementById('bot-font')
    if (
      existingFont
        ?.getAttribute('href')
        ?.includes(
          props.initialAgentReply.agentConfig?.theme?.general?.font ?? 'Open Sans'
        )
    )
      return
    const font = document.createElement('link')
    font.href = `https://fonts.bunny.net/css2?family=${
      props.initialAgentReply.agentConfig?.theme?.general?.font ?? 'Open Sans'
    }:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&display=swap');')`
    font.rel = 'stylesheet'
    font.id = 'bot-font'
    document.head.appendChild(font)
  }

  onMount(() => {
    if (!botContainer) { return };
    resizeObserver.observe(botContainer)
  })

  createEffect(() => {
    injectCustomFont()
    if (!botContainer) return
    setCssVariablesValue(props.initialAgentReply.agentConfig.theme, botContainer)
  })

  onCleanup(() => {
    if (!botContainer) return
    resizeObserver.unobserve(botContainer)
  })

  return (
    <div
      ref={botContainer}
      class={
        'relative flex w-full h-full text-base overflow-hidden bg-cover bg-center flex-col items-center agent-embed-container ' +
        props.class
      }
    >
      <div class="flex w-full h-full justify-center">
        <ConversationContainer
          context={props.context}
          isConnecting={props.isConnecting}
          initialAgentReply={props.initialAgentReply}
          onNewInputBlock={props.onNewInputBlock}
          onAnswer={props.onAnswer}
          onEnd={props.onEnd}
          onNewLogs={props.onNewLogs}
          setSessionId={props.setSessionId}
        />
      </div>
      <Show
        when={props.initialAgentReply.agentConfig.settings.general.isBrandingEnabled}
      >
        <LiteBadge botContainer={botContainer} />
      </Show>
      <div class="absolute bottom-0 w-full text-center text-gray-200" style="font-size: 0.5rem;">
        {process.env.VERSION}
      </div>
    </div>
  )
}
