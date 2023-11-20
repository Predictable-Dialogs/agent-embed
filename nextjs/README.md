## Install

```bash
npm install @agent-embed/nextjs
```

## Bubble

```tsx
const Bubble = dynamic(
  () => import('cembed').then(module => {
    return module.Bubble}),
  { ssr: false }
);


const App = () => {
  return (
          <Bubble
            agentName="options-agent"
            theme={{ button: { 
              backgroundColor: "#2b3e13",
            } }}
            previewMessage={{
              message: 'Sounds Interesting? Use the chatbot to sign up!',
            }}
          />  
        )
}
```

This code is creating a container with a 100% width (will match parent width) and 600px height.

This code will show the bubble and let a preview message appear after 5 seconds.

### Open or close the preview message

You can use these commands:

```js
import { showPreviewMessage } from '@agent-embed/nextjs'

Agent.showPreviewMessage()
```

```js
import { hidePreviewMessage } from '@agent-embed/nextjs'

Agent.hidePreviewMessage()
```

### Open or close the chat window

You can use these commands:

```js
import { open } from '@agent-embed/nextjs'

open()
```

```js
import { close } from '@agent-embed/nextjs'

close()
```

```js
import { toggle } from '@agent-embed/nextjs'

toggle()
```