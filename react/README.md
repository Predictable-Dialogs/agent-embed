## Install

```bash
npm install @agent-widget/react
```

## Standard

```tsx
import { Standard } from '@agent-widget/react'

const App = () => {
  return (
    <Standard
      agentName="my-agent"
      style={{ width: '100%', height: '600px' }}
    />
  )
}
```

This code is creating a container with a 100% width (will match parent width) and 600px height.

## Popup

```tsx
import { Popup } from '@agent-widget/react'

const App = () => {
  return <Popup agentName="my-agent" autoShowDelay={3000} />
}
```

This code will automatically trigger the popup window after 3 seconds.

### Open or Close a popup

You can use these commands:

```js
import { open } from '@agent-widget/react'

open()
```

```js
import { close } from '@agent-widget/react'

close()
```

```js
import { toggle } from '@agent-widget/react'

toggle()
```

## Bubble

```tsx
import { Bubble } from '@agent-widget/react'

const App = () => {
  return (
    <Bubble
      agentName="my-agent"
      previewMessage={{
        message: 'I have a question for you!',
        autoShowDelay: 5000,
        avatarUrl: 'https://avatars.githubusercontent.com/u/16015833?v=4',
      }}
      theme={{
        button: { backgroundColor: '#0042DA', iconColor: '#FFFFFF' },
        previewMessage: { backgroundColor: '#ffffff', textColor: 'black' },
      }}
    />
  )
}
```

This code will show the bubble and let a preview message appear after 5 seconds.

### Open or close the preview message

You can use these commands:

```js
import { showPreviewMessage } from '@agent-widget/react'

Agent.showPreviewMessage()
```

```js
import { hidePreviewMessage } from '@agent-widget/react'

Agent.hidePreviewMessage()
```

### Open or close the chat window

You can use these commands:

```js
import { open } from '@agent-widget/react'

open()
```

```js
import { close } from '@agent-widget/react'

close()
```

```js
import { toggle } from '@agent-widget/react'

toggle()
```