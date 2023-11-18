import { trackPixelEvent } from '@/lib/pixel'
import { isEmpty } from '@/lib/utils'
import type { PixelBlock } from '@/schemas'

export const executePixel = async (options: PixelBlock['options']) => {
  if (isEmpty(options?.pixelId)) return
  trackPixelEvent(options)
}
