/**
 * Centralized utility for merging Bot props with API data.
 * This function prioritizes props over API data when both are present,
 * providing a single source of truth for configuration merging.
 */

export interface ApiData {
  input?: any;
  agentConfig?: {
    theme?: {
      customCss?: string;
    };
  };
  messages?: any[];
  clientSideActions?: any[];
  sessionId?: string;
}

export interface BotProps {
  input?: any;
  // Future props that may override API data can be added here
}

export interface MergedConfig {
  input: any | null;
  customCss: string;
  messages: any[];
  clientSideActions: any[];
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
  // Props take precedence over API data
  const input = props.input ?? apiData?.input ?? null;
  const customCss = apiData?.agentConfig?.theme?.customCss ?? '';
  const messages = apiData?.messages ?? [];
  const clientSideActions = apiData?.clientSideActions ?? [];
  const sessionId = apiData?.sessionId;
  const agentConfig = apiData?.agentConfig;

  return {
    input,
    customCss,
    messages,
    clientSideActions,
    sessionId,
    agentConfig,
  };
};