export const sendRequest = async <ResponseData>(
  params:
    | {
        url: string
        method: string
        body?: Record<string, unknown> | FormData
      }
    | string
): Promise<{ data?: ResponseData; error?: Error }> => {
  try {
    const url = typeof params === 'string' ? params : params.url
    const response = await fetch(url, {
      method: typeof params === 'string' ? 'GET' : params.method,
      mode: 'cors',
      credentials: 'include',
      headers:
        typeof params !== 'string' && isDefined(params.body)
          ? {
              'Content-Type': 'application/json',
            }
          : undefined,
      body:
        typeof params !== 'string' && isDefined(params.body)
          ? JSON.stringify(params.body)
          : undefined,
    })
    const data = await response.json()
    if (!response.ok) throw 'error' in data ? data.error : data
    return { data }
  } catch (e) {
    console.error(e)
    return { error: e as Error }
  }
}

export const isDefined = <T>(
  value: T | undefined | null
): value is NonNullable<T> => value !== undefined && value !== null

export const isNotDefined = <T>(
  value: T | undefined | null
): value is undefined | null => value === undefined || value === null

export const isEmpty = (value: string | undefined | null): value is undefined =>
  value === undefined || value === null || value === ''

export const isNotEmpty = (value: string | undefined | null): value is string =>
  value !== undefined && value !== null && value !== ''


interface Omit {
  // eslint-disable-next-line @typescript-eslint/ban-types
  <T extends object, K extends [...(keyof T)[]]>(obj: T, ...keys: K): {
    [K2 in Exclude<keyof T, K[number]>]: T[K2]
  }
}

export const omit: Omit = (obj, ...keys) => {
  const ret = {} as {
    [K in keyof typeof obj]: (typeof obj)[K]
  }
  let key: keyof typeof obj
  for (key in obj) {
    if (!keys.includes(key)) {
      ret[key] = obj[key]
    }
  }
  return ret
}

type UploadFileProps = {
  sessionId: string | undefined
  basePath?: string
  files: {
    file: File
    path: string
  }[]
  onUploadProgress?: (percent: number) => void
}
type UrlList = (string | null)[]

export const uploadFiles = async ({
  sessionId,
  basePath = '/api',
  files,
  onUploadProgress,
}: UploadFileProps): Promise<UrlList> => {
  const urls = [];
  const urlKeys = [];
  let i = 0
  for (const { file, path } of files) {
    onUploadProgress && onUploadProgress((i / files.length) * 100)
    i += 1
    const { data } = await sendRequest<{
      presignedUrl: { url: string; fields: any }
      hasReachedStorageLimit: boolean
    }>(
      // `${basePath}/storage/upload-url?filePath=${encodeURIComponent(
      //   path
      // )}&fileType=${file.type}`
      `${basePath}?filePath=${encodeURIComponent(
        path
      )}&fileType=${file.type}`
    )

    if (!data?.presignedUrl) continue

    const { url, fields } = data.presignedUrl

    if (data.hasReachedStorageLimit) urls.push(null)
    else {
      const formData = new FormData()
      Object.entries({ ...fields, file }).forEach(([key, value]) => {
        formData.append(key, value as string | Blob)
      })
      let upload;

      try {
        upload = await fetch(url, {
          method: 'POST',
          body: formData,
        })

        if (!upload.ok) continue
      } catch (error) {
        console.log("An error occurred: ", error);
      }
      urlKeys.push(fields.key)
      urls.push(`${url.split('?')[0]}/${path}`)
    }
  }
  try {
    let result = await fetch(
      `${basePath}/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },  
        body: JSON.stringify({ sessionId, keys: urlKeys }),
        credentials: 'include'
    });  
  } catch (error) {
    console.log(`error fetching: ${JSON.stringify(error)}`);
  }
  return urlKeys
}

declare const window: any

export const env = (key = ''): string | undefined => {
  if (typeof window === 'undefined')
    return isEmpty(process.env['NEXT_PUBLIC_' + key])
      ? undefined
      : (process.env['NEXT_PUBLIC_' + key] as string)

  if (typeof window !== 'undefined' && window.__env)
    return isEmpty(window.__env[key]) ? undefined : window.__env[key]
}

export const hasValue = (
  value: string | undefined | null
): value is NonNullable<string> =>
  value !== undefined &&
  value !== null &&
  value !== '' &&
  value !== 'undefined' &&
  value !== 'null'

export const getViewerUrl = (props?: {
  returnAll?: boolean
}): string | undefined =>
  props?.returnAll ? env('VIEWER_URL') : env('VIEWER_URL')?.split(',')[0]

export const injectCustomHeadCode = (customHeadCode: string) => {
  const headCodes = customHeadCode.split('</noscript>')
  headCodes.forEach((headCode) => {
    const [codeToInject, noScriptContentToInject] = headCode.split('<noscript>')
    const fragment = document
      .createRange()
      .createContextualFragment(codeToInject)
    document.head.append(fragment)

    if (isNotDefined(noScriptContentToInject)) return

    const noScriptElement = document.createElement('noscript')
    const noScriptContentFragment = document
      .createRange()
      .createContextualFragment(noScriptContentToInject)
    noScriptElement.append(noScriptContentFragment)
    document.head.append(noScriptElement)
  })
}

export const isSvgSrc = (src: string | undefined) =>
  src?.startsWith('data:image/svg') || src?.endsWith('.svg')
