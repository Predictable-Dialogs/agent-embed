## Install

```bash
npm install @agent-embed/nextjs
```

## Bubble

```tsx
import { Bubble } from '@agent-embed/nextjs'

const App = () => {
  return (
          <Bubble
            agentName="agent-name"
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

This code will show the bubble and let a preview message appear after 5 seconds.

You can also use the `Script` component in NextJs as below:

```tsx
import Script from 'next/script'

<Script
  src="https://cdn.jsdelivr.net/npm/@agent-embed/js@0.0.1/dist/web.js"
  strategy="afterInteractive"
  type="module"
  onLoad={() => {
    Agent.initBubble({
      agentName: "agent-name",
      theme: {
        button: { backgroundColor: "#2b3e13" },
      },
    });
  }}
/> 

```

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
