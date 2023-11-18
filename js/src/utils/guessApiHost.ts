import { env } from '@/lib/utils'

// const cloudViewerUrl = 'https://app.apimagic.ai'
const cloudViewerUrl = 'http://localhost:8001/web/incoming'


export const guessApiHost = () =>
  env('Web')?.split(',')[0] ??
  cloudViewerUrl
