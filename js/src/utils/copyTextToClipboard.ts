export const copyTextToClipboard = async (text: string): Promise<boolean> => {
  if (!text) {
    return false
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (_error) {
      // Fall back to document.execCommand('copy') when Clipboard API write fails.
    }
  }

  if (typeof document === 'undefined' || !document.body) {
    return false
  }

  const textArea = document.createElement('textarea')

  try {
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    return document.execCommand('copy')
  } catch (_error) {
    return false
  } finally {
    if (textArea.parentNode) {
      textArea.remove()
    }
  }
}
