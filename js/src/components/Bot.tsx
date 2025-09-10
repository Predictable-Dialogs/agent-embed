import { LiteBadge } from './LiteBadge';
import { ClearButton } from './ClearButton';
import { createEffect, createSignal, onMount, Show, onCleanup, createMemo } from 'solid-js';
import { getInitialChatReplyQuery } from '@/queries/getInitialChatReplyQuery';
import { StreamConversation } from './StreamConversation';
import { setIsMobile } from '@/utils/isMobileSignal';
import { BotContext, WidgetContext } from '@/types';
import { ErrorMessage } from './ErrorMessage';
import { setCssVariablesValue } from '@/utils/setCssVariablesValue';
import { mergePropsWithApiData } from '@/utils/mergePropsWithApiData';
import { useAgentStorage } from '@/hooks/useAgentStorage';
import { AvatarProps, AvatarConfig, BubbleThemeProps, BubbleThemeConfig } from '@/constants';
import { ContainerColors, InputColors } from '@/schemas';
import { Background } from '@/schemas';
import { CommandData } from '@/features/commands';
import immutableCss from '../assets/immutable.css';

export type BotProps = {
  agentName: string | any;
  initialPrompt?: string;
  isPreview?: boolean;
  prefilledVariables?: Record<string, unknown>;
  apiHost?: string;
  apiStreamHost?: string;
  onInit?: () => void;
  onSend?: () => void;
  filterResponse?: (response: string) => string;
  stream?: boolean;
  persistSession?: boolean;
  input?: any;
  avatar?: AvatarProps;
  bubble?: BubbleThemeProps;
  customCss?: string;
  font?: string;
  background?: { type: "Color" | "Image" | "None", content: string };
  widgetContext?: WidgetContext;
};

export const Bot = (props: BotProps & { class?: string }) => {
  const [apiData, setApiData] = createSignal<any | null>(null);
  const [isInitialized, setIsInitialized] = createSignal(false);
  const [error, setError] = createSignal<Error | undefined>();
  const [isDebugMode, setIsDebugMode] = createSignal(false);
  const [persistedMessages, setPersistedMessages] = createSignal<any[]>([]);
  const [isClearButtonOnCooldown, setIsClearButtonOnCooldown] = createSignal(false);

  const input = createMemo(() => props.input ?? apiData()?.input);
  const customCss = createMemo(() => props.customCss ?? apiData()?.agentConfig?.theme?.customCss ?? '');
  const font = createMemo(() => props.font ?? apiData()?.agentConfig?.theme?.general?.font ?? 'Open Sans');
  const background = createMemo(() => props.background ?? apiData()?.agentConfig?.theme?.general?.background);
  const mergedHostAvatar = createMemo<AvatarConfig | undefined>(() => props.avatar?.hostAvatar ?? apiData()?.agentConfig?.theme?.chat?.hostAvatar);
  const mergedGuestAvatar = createMemo<AvatarConfig | undefined>(() => props.avatar?.guestAvatar ?? apiData()?.agentConfig?.theme?.chat?.guestAvatar);
  const mergedHostBubbles = createMemo<BubbleThemeConfig | undefined>(() => props.bubble?.hostBubbles ?? apiData()?.agentConfig?.theme?.chat?.hostBubbles);
  const mergedGuestBubbles = createMemo<BubbleThemeConfig | undefined>(() => props.bubble?.guestBubbles ?? apiData()?.agentConfig?.theme?.chat?.guestBubbles);
  const mergedInputStyles = createMemo(() => {
    const inputStyles = props.input?.styles;
    const apiStyles = apiData()?.agentConfig?.theme?.chat;
    if (!inputStyles) return apiStyles;
    return {
      roundness: inputStyles.roundness ?? apiStyles?.roundness,
      inputs: inputStyles.inputs ?? apiStyles?.inputs,
      buttons: inputStyles.buttons ?? apiStyles?.buttons
    };
  });
  
  const storage = useAgentStorage(props.agentName);
  let cooldownTimeoutId: NodeJS.Timeout | undefined;

  const handleClearSession = async () => {
    // Start cooldown immediately
    setIsClearButtonOnCooldown(true);
    
    // Clear localStorage session data
    storage.clearSession();
    setPersistedMessages([]);
    // Reinitialize the bot
    await initializeBot();
    setIsInitialized(true);
    
    // Set 5-second cooldown timer
    cooldownTimeoutId = setTimeout(() => {
      setIsClearButtonOnCooldown(false);
    }, 5000);
  };

  const initializeBot = async () => {
    const urlParams = new URLSearchParams(location.search);
    props.onInit?.();
    const prefilledVariables: { [key: string]: string } = {};
    urlParams.forEach((value, key) => {
      prefilledVariables[key] = value;
    });

    const { data, error } = await getInitialChatReplyQuery({
      sessionId: undefined, // Start with no sessionId for new initialization
      agentName: props.agentName,
      initialPrompt: props.initialPrompt,
      apiHost: props.apiHost,
      isPreview: props.isPreview ?? false,
      prefilledVariables: {
        ...prefilledVariables,
        ...props.prefilledVariables,
      },
    });
    if (error && 'code' in error && typeof error.code === 'string') {
      if (['BAD_REQUEST', 'FORBIDDEN'].includes(error.code))
        return setError(new Error('This agent is now closed.'));
    }

    if (error && 'statusCode' in error && typeof error.statusCode === 'number') {
      if (error.statusCode === 404)
        return setError(new Error("The agent you're looking for doesn't exist."));
    }

    if (!data) return setError(new Error("Couldn't initiate the chat."));

    // Store API data
    setApiData(data);
    
    // Store input data for future session restoration
    if (data.input) {
      storage.setInput(data.input);
    }
  };

  const handleSessionExpired = () => {
    // Clear local storage
    storage.clearSession();
    setPersistedMessages([]);
    // Delay to show expiration message, then reinitialize
    setTimeout(() => {
      initializeBot().then(() => { 
        setIsInitialized(true);
      });
    }, 1500); // Display "expired" message for 1.5 seconds
  };

  const processIncomingEvent = (event: MessageEvent<CommandData>) => {
    const { data } = event;
    if (!data.isFromAgent) return;
    if (data.command === 'reset') {
      handleClearSession();
    }
  };

  onMount(() => {
    setIsDebugMode(storage.getDebugMode());
    if (!props.agentName) {
      //On the first mount, the agentName is not set, so we return early
      console.info(`Initializing pd agent`);
      return;
    }
    window.addEventListener('message', processIncomingEvent);
    if (props.persistSession && storage.hasCompleteSession()) {
      // If persisted data exists, use it and mark as initialized
      const storedSessionId = storage.getSessionId();
      const storedAgentConfig = storage.getAgentConfig();
      const storedCustomCss = storage.getCustomCss();

      const storedMessages = storage.getChatMessages();
      const storedInput = storage.getInput();
      
      if (storedMessages) setPersistedMessages(storedMessages);
      const restoredData = {
        sessionId: storedSessionId,
        agentConfig: {
          ...storedAgentConfig,
          theme: {
            ...storedAgentConfig?.theme,
            customCss: storedCustomCss || storedAgentConfig?.theme?.customCss || '',  // Prioritize storedCustomCss
          },
        },
        messages: [],
        clientSideActions: [],
        input: storedInput,
      };
      setApiData(restoredData);
      setIsInitialized(true);
    } else {
      initializeBot().then(() => {
        setIsInitialized(true);
      });
    }
  });

  // Store merged config values in localStorage
  createEffect(() => {
    if (customCss()) {
      storage.setCustomCss(customCss());
    }
    if (apiData()?.sessionId) {
      storage.setSessionId(apiData().sessionId);
    }
    let storedAgentConfig = apiData()?.agentConfig;
    const host = mergedHostAvatar();
    const guest = mergedGuestAvatar();
    const hostBubbles = mergedHostBubbles();
    const guestBubbles = mergedGuestBubbles();
    const mergedFont = font();
    const mergedBackground = background();
    const inputStyles = mergedInputStyles();
    if (host || guest || hostBubbles || guestBubbles || mergedFont || mergedBackground || inputStyles) {
      storedAgentConfig = {
        ...storedAgentConfig,
        theme: {
          ...storedAgentConfig?.theme,
          ...(mergedFont || mergedBackground ? { 
            general: {
              ...storedAgentConfig?.theme?.general,
              ...(mergedFont ? { font: mergedFont } : {}),
              ...(mergedBackground ? { background: mergedBackground } : {})
            }
          } : {}),
          chat: {
            ...storedAgentConfig?.theme?.chat,
            ...(host ? { hostAvatar: host } : {}),
            ...(guest ? { guestAvatar: guest } : {}),
            ...(hostBubbles ? { hostBubbles: hostBubbles } : {}),
            ...(guestBubbles ? { guestBubbles: guestBubbles } : {}),
            ...(inputStyles?.roundness !== undefined ? { roundness: inputStyles.roundness } : {}),
            ...(inputStyles?.inputs ? { inputs: inputStyles.inputs } : {}),
            ...(inputStyles?.buttons ? { buttons: inputStyles.buttons } : {}),
          }
        }
      };
    }
    if (storedAgentConfig) {
      storage.setAgentConfig(storedAgentConfig);
    }
    if (input()) {
      storage.setInput(input());
    }
  });

  onCleanup(() => {
    setIsInitialized(false);
    // Cleanup cooldown timeout
    if (cooldownTimeoutId) {
      clearTimeout(cooldownTimeoutId);
    }
    window.removeEventListener('message', processIncomingEvent);
  });

  return (
    <>
      <style>{customCss()}</style>
      <style>{immutableCss}</style>
      <Show when={error()} keyed>
        {(error) => <ErrorMessage error={error} />}
      </Show>
      <Show when={apiData()?.agentConfig} keyed>
        {(agentConfigValue) => {
          const config = apiData();
          return (
            <BotContent
              class={props.class}
              initialAgentReply={{
                messages: config.messages,
              }}
              persistedMessages={persistedMessages()}
              agentConfig={agentConfigValue}
              hostAvatar={mergedHostAvatar()}
              guestAvatar={mergedGuestAvatar()}
              hostBubbles={mergedHostBubbles()}
              guestBubbles={mergedGuestBubbles()}
              font={font()}
              background={background()}
              input={input()}
              inputStyles={mergedInputStyles()}
              context={{
                apiHost: props.apiHost,
                apiStreamHost: props.apiStreamHost,
                isPreview: props.isPreview ?? false,
                sessionId: config.sessionId,
                agentName: props.agentName,
              }}
              filterResponse={props.filterResponse}
              isDebugMode={isDebugMode()}
              onSessionExpired={handleSessionExpired}
              onSend={props.onSend}
              widgetContext={props.widgetContext}
              handleClearSession={handleClearSession}
              isClearButtonOnCooldown={isClearButtonOnCooldown()}
            />
          );
        }}
      </Show>
    </>
  );
};

type BotContentProps = {
  initialAgentReply: any;
  persistedMessages: any[];
  agentConfig: any;
  hostAvatar?: AvatarConfig;
  guestAvatar?: AvatarConfig;
  hostBubbles?: BubbleThemeConfig;
  guestBubbles?: BubbleThemeConfig;
  font?: string;
  background?: Background;
  input?: any;
  inputStyles?: { roundness?: 'none' | 'medium' | 'large'; inputs?: InputColors; buttons?: ContainerColors };
  context: BotContext;
  class?: string;
  filterResponse?: (response: string) => string;
  isDebugMode?: boolean;
  onSessionExpired?: () => void;
  onSend?: () => void;
  widgetContext?: WidgetContext;
  handleClearSession: () => Promise<void>;
  isClearButtonOnCooldown: boolean;
};

const BotContent = (props: BotContentProps) => {
  let botContainer: HTMLDivElement | undefined;
  const resizeObserver = new ResizeObserver((entries) => {
    return setIsMobile(entries[0].target.clientWidth < 400);
  });

  const injectCustomFont = () => {
    const existingFont = document.getElementById('bot-font');
    if (
      existingFont
        ?.getAttribute('href')
        ?.includes(props.font ?? 'Open Sans')
    )
      return;
    const font = document.createElement('link');
    font.href = `https://fonts.bunny.net/css2?family=${
      props.font ?? 'Open Sans'
    }:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&display=swap');')`;
    font.rel = 'stylesheet';
    font.id = 'bot-font';
    document.head.appendChild(font);
  };

  onMount(() => {
    if (!botContainer) {
      return;
    }
    resizeObserver.observe(botContainer);
  });

  createEffect(() => {
    injectCustomFont();
    if (!botContainer) return;
    setCssVariablesValue(props.agentConfig.theme, botContainer, props.font, props.background, props.hostBubbles, props.guestBubbles, props.inputStyles);
  });

  onCleanup(() => {
    if (!botContainer) return;
    resizeObserver.unobserve(botContainer);
  });

  return (
    <div
      ref={botContainer}
      class={
        'relative flex w-full h-full text-base overflow-hidden bg-cover bg-center flex-col items-center agent-embed-container ' +
        props.class
      }
    >
      <div 
        class="flex w-full justify-center overflow-hidden"
        style={{
          'height': props.input?.options?.type === 'fixed-bottom' ? 'calc(100% - 100px)' : 'calc(100% - 44px)'
        }}
      >
        <StreamConversation
          context={props.context}
          initialAgentReply={props.initialAgentReply}
          persistedMessages={props.persistedMessages}
          hostAvatar={props.hostAvatar}
          guestAvatar={props.guestAvatar}
          agentConfig={props.agentConfig}
          input={props.input}
          filterResponse={props.filterResponse}
          onSessionExpired={props.onSessionExpired}
          onSend={props.onSend}
          widgetContext={props.widgetContext}
        />
      </div>
      <Show when={props.agentConfig?.settings?.general.isBrandingEnabled}>
        <LiteBadge botContainer={botContainer} />
      </Show>
      <ClearButton onClick={props.handleClearSession} isOnCooldown={props.isClearButtonOnCooldown} />
      <Show when={props.isDebugMode}>
        <div class="absolute bottom-0 w-full text-center text-gray-500" style="font-size: 0.5rem;">
          {process.env.VERSION}
        </div>
      </Show>
    </div>
  );
};
