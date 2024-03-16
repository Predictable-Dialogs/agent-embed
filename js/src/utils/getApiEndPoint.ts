import { env } from '@/lib/utils'

// const cloudViewerUrl = 'https://app.apimagic.ai'
const apiEndPoint = 'http://localhost:8001/web/incoming'


export const getApiEndPoint = () => {
  console.log(`env('Web') is: ${env('Web')}`)
  return env('Web')?.split(',')[0] ??
  apiEndPoint
}
