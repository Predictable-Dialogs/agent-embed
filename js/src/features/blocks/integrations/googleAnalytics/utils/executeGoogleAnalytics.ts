import { sendGaEvent } from '@/lib/gtag'
import type { GoogleAnalyticsOptions } from '@/schemas'

export const executeGoogleAnalyticsBlock = async (
  options: GoogleAnalyticsOptions
) => {
  if (!options?.trackingId) return
  sendGaEvent(options)
}
