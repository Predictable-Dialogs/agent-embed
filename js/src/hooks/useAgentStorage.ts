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
   * Safe localStorage getItem with error handling
   */
  const safeGetItem = (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to access localStorage for key:', key, error);
      }
      return null;
    }
  };

  /**
   * Safe localStorage setItem with error handling
   */
  const safeSetItem = (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to store localStorage value for key:', key, error);
      }
    }
  };

  /**
   * Safe localStorage removeItem with error handling
   */
  const safeRemoveItem = (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to remove localStorage value for key:', key, error);
      }
    }
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
    const sessionId = safeGetItem(getStorageKey('sessionId'));
    return safeParse(sessionId, null);
  };

  const setSessionId = (sessionId: string): void => {
    safeSetItem(getStorageKey('sessionId'), safeStringify(sessionId));
  };

  const getAgentConfig = (): any | null => {
    const agentConfig = safeGetItem(getStorageKey('agentConfig'));
    return safeParse(agentConfig, null);
  };

  const setAgentConfig = (config: any): void => {
    safeSetItem(getStorageKey('agentConfig'), safeStringify(config));
  };

  const getCustomCss = (): string | null => {
    const customCss = safeGetItem(getStorageKey('customCss'));
    return safeParse(customCss, null);
  };

  const setCustomCss = (css: string): void => {
    safeSetItem(getStorageKey('customCss'), safeStringify(css));
  };

  const getChatMessages = (): any[] => {
    const messages = safeGetItem(getStorageKey('chatMessages'));
    return safeParse(messages, []);
  };

  const setChatMessages = (messages: any[]): void => {
    safeSetItem(getStorageKey('chatMessages'), safeStringify(messages));
  };

  const getInput = (): any | null => {
    const input = safeGetItem(getStorageKey('input'));
    return safeParse(input, null);
  };

  const setInput = (input: any): void => {
    safeSetItem(getStorageKey('input'), safeStringify(input));
  };

  const getDebugMode = (): boolean => {
    const debugFlag = safeGetItem('debugMode');
    return debugFlag === 'true';
  };

  // Session management
  const clearSession = (): void => {
    safeRemoveItem(getStorageKey('sessionId'));
    safeRemoveItem(getStorageKey('agentConfig'));
    safeRemoveItem(getStorageKey('chatMessages'));
    safeRemoveItem(getStorageKey('customCss'));
    safeRemoveItem(getStorageKey('input'));
  };

  const hasCompleteSession = (): boolean => {
    const sessionId = getSessionId();
    const agentConfig = getAgentConfig(); 
    // const messages = getChatMessages();
    return !!(sessionId && agentConfig);
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