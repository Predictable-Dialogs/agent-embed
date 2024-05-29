const sessionStorageKey = 'resultId'


export const setResultInStorage =
  (storageType: 'local' | 'session' = 'session') =>
  (agentId: string, resultId: string) => {
    try {
      ;(storageType === 'session' ? localStorage : sessionStorage).removeItem(
        `${sessionStorageKey}-${agentId}`
      )
      return (
        storageType === 'session' ? sessionStorage : localStorage
      ).setItem(`${sessionStorageKey}-${agentId}`, resultId)
    } catch {
      /* empty */
    }
  }
