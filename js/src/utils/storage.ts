const sessionStorageKey = 'resultId'

export const getExistingResultIdFromStorage = (agentId?: string) => {
  if (!agentId) return
  try {
    return (
      sessionStorage.getItem(`${sessionStorageKey}-${agentId}`) ??
      localStorage.getItem(`${sessionStorageKey}-${agentId}`) ??
      undefined
    )
  } catch {
    /* empty */
  }
}

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
