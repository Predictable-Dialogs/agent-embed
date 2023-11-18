import type { RedirectOptions } from '@/schemas'

export const executeRedirect = ({
  url,
  isNewTab,
}: RedirectOptions): { blockedPopupUrl: string } | undefined => {
  console.log(`url is: ${url}, isNewTab is ${isNewTab}`)
  if (!url) return
  const updatedWindow = window.open(url, isNewTab ? '_blank' : '_self')
  if (!updatedWindow)
    return {
      blockedPopupUrl: url,
    }
}
