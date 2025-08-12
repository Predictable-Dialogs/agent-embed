/**
 * useAgentStorage hook - Centralized localStorage operations for agent-specific data
 * 
 * Provides agent-namespaced storage operations for sessionId, agentConfig, customCss, 
 * chatMessages, and debugMode. Includes session management and cleanup utilities.
 */

export interface UseAgentStorageReturn {
  // Storage operations
  getSessionId: () => string | null;
  setSessionId: (sessionId: string) => void;
  getAgentConfig: () => any | null;
  setAgentConfig: (config: any) => void;
  getCustomCss: () => string | null;
  setCustomCss: (css: string) => void;
  getChatMessages: () => any[];
  setChatMessages: (messages: any[]) => void;
  getInput: () => any | null;
  setInput: (input: any) => void;
  getDebugMode: () => boolean;
  
  // Session management  
  clearSession: () => void;
  hasCompleteSession: () => boolean;
  
  // Storage key utilities
  getStorageKey: (key: string) => string;
}

export function useAgentStorage(agentName?: string): UseAgentStorageReturn {
  
  /**
   * Generate storage key with agent namespace
   * Special case: debugMode is not namespaced (global setting)
   */
  const getStorageKey = (key: string): string => {
    if (key === 'debugMode') return key; // Special case - not namespaced
    return agentName ? `${agentName}_${key}` : key;
  };

  /**
   * Safe JSON parsing with error handling
   */
  const safeParse = <T>(value: string | null, defaultValue: T): T => {
    if (!value) return defaultValue;
    try {
      return JSON.parse(value);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to parse localStorage value:', error);
      }
      return defaultValue;
    }
  };

  /**
   * Safe JSON stringifying with error handling
   */
  const safeStringify = (value: any): string => {
    try {
      return JSON.stringify(value);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to stringify value for localStorage:', error);
      }
      return ''; // Return empty string as fallback
    }
  };

  // Storage operations
  const getSessionId = (): string | null => {
    const sessionId = localStorage.getItem(getStorageKey('sessionId'));
    return safeParse(sessionId, null);
  };

  const setSessionId = (sessionId: string): void => {
    localStorage.setItem(getStorageKey('sessionId'), safeStringify(sessionId));
  };

  const getAgentConfig = (): any | null => {
    const agentConfig = localStorage.getItem(getStorageKey('agentConfig'));
    return safeParse(agentConfig, null);
  };

  const setAgentConfig = (config: any): void => {
    localStorage.setItem(getStorageKey('agentConfig'), safeStringify(config));
  };

  const getCustomCss = (): string | null => {
    const customCss = localStorage.getItem(getStorageKey('customCss'));
    return safeParse(customCss, null);
  };

  const setCustomCss = (css: string): void => {
    localStorage.setItem(getStorageKey('customCss'), safeStringify(css));
  };

  const getChatMessages = (): any[] => {
    const messages = localStorage.getItem(getStorageKey('chatMessages'));
    return safeParse(messages, []);
  };

  const setChatMessages = (messages: any[]): void => {
    localStorage.setItem(getStorageKey('chatMessages'), safeStringify(messages));
  };

  const getInput = (): any | null => {
    const input = localStorage.getItem(getStorageKey('input'));
    return safeParse(input, null);
  };

  const setInput = (input: any): void => {
    localStorage.setItem(getStorageKey('input'), safeStringify(input));
  };

  const getDebugMode = (): boolean => {
    const debugFlag = localStorage.getItem('debugMode');
    return debugFlag === 'true';
  };

  // Session management
  const clearSession = (): void => {
    localStorage.removeItem(getStorageKey('sessionId'));
    localStorage.removeItem(getStorageKey('agentConfig'));
    localStorage.removeItem(getStorageKey('chatMessages'));
    localStorage.removeItem(getStorageKey('customCss'));
    localStorage.removeItem(getStorageKey('input'));
  };

  const hasCompleteSession = (): boolean => {
    const sessionId = getSessionId();
    const agentConfig = getAgentConfig(); 
    const messages = getChatMessages();
    return !!(sessionId && agentConfig && messages.length > 0);
  };

  return {
    // Storage operations
    getSessionId,
    setSessionId,
    getAgentConfig,
    setAgentConfig,
    getCustomCss,
    setCustomCss,
    getChatMessages,
    setChatMessages,
    getInput,
    setInput,
    getDebugMode,
    
    // Session management
    clearSession,
    hasCompleteSession,
    
    // Storage key utilities
    getStorageKey,
  };
}