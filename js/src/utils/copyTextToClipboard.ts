export const copyTextToClipboard = async (text: string): Promise<boolean> => {
  if (!text) {
    return false
  }

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }

    if (typeof document === 'undefined') {
      return false
    }

    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    const wasCopied = document.execCommand('copy')
    textArea.remove()
    return wasCopied
  } catch (_error) {
    return false
  }
}
