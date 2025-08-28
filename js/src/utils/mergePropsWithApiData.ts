import { AvatarProps, AvatarConfig } from '@/constants';

export interface ApiData {
  input?: any;
  agentConfig?: {
    theme?: {
      customCss?: string;
      chat?: {
        hostAvatar?: AvatarConfig;
        guestAvatar?: AvatarConfig;
      };
    };
  };
  messages?: any[];
  clientSideActions?: any[];
  sessionId?: string;
}

export interface BotProps {
  input?: any;
  avatar?: AvatarProps;
}

export interface MergedConfig {
  messages: any[];
  sessionId: string | undefined;
  agentConfig: any | undefined;
}

/**
 * Merges Bot props with API data, giving precedence to props when both exist.
 * 
 * @param props - Bot component props
 * @param apiData - Data from getInitialChatReplyQuery
 * @returns Merged configuration object
 */
export const mergePropsWithApiData = (
  props: BotProps,
  apiData: ApiData | null
): MergedConfig => {

  const messages = apiData?.messages ?? [];
  const sessionId = apiData?.sessionId;
  
  // Merge avatar data into agentConfig.theme.chat if needed
  const agentConfig = apiData?.agentConfig ? {
    ...apiData.agentConfig,
    theme: {
      ...apiData.agentConfig.theme,
      chat: {
        ...apiData.agentConfig.theme?.chat,
      }
    }
  } : undefined;

  return {
    messages,
    sessionId,
    agentConfig,
  };
};