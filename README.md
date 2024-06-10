## WIP

# agent-embed

### Vision
An agent embed blends the traditional concept of a widget with the more dynamic role of an "agent." This tool can be an active, intelligent participant on a website. It would derive its autonomy and sophistication from the AI models running on your backend. So it fits into the evolving nature of integrating AI with web technologies.

### Current usage
The current implementation can be used to embed agents to a website without exposing your API Keys, which remain on [predictabledialogs.com](https://predictabledialogs.com/agent/create) or on your backend.

## Usage
### [Shopify Store](https://github.com/Predictable-Dialogs/agent-embed/blob/main/js/shopify.md)

Embed chat widget to your shopify store. 
Go to Online Store -> Themes -> Edit the theme file, include the below script tag at the end.

Note: The agent name is an id, your backend should recognize and use to start chatting.

```html
<script type="module">
  import Agent from 'https://cdn.jsdelivr.net/npm/@agent-embed/js@0.0.1/dist/web.js'

  Agent.initBubble({
    agentName: 'options-agent',
  })
</script>
<agent-bubble></agent-bubble>
```

### NextJS 
[Link to readme in nextJs folder](https://github.com/Predictable-Dialogs/agent-embed/blob/main/nextjs/README.md)

### React Instructions
[Link to readme in react folder](https://github.com/Predictable-Dialogs/agent-embed/blob/main/react/README.md)

### JS Instructions
[Link to readme in js folder](https://github.com/Predictable-Dialogs/agent-embed/blob/main/js/README.md)

# Example Screen

<img src="https://github.com/Predictable-Dialogs/agent-embed/assets/3472565/ee609766-a401-4490-a2bf-939ae408ef5a" width="300" />



## Protocol to talk with a agent server

1. The Session would be initiated by the agent embed using the agent name & server end point. The server responds with (initialAgentReply):
       a. A theme, used for styling the agent embed. 
       b. The sessionId created on the server.
       c. A message to show on the agent embed.
       d. A list of server capabilities (streaming, webhooks etc)
       
### First Server Response, would contain the theme to style the embed. 
```json
{
  "theme": {
    "general": {
      "font": "Avenir",
      "background": {
        "type": "Color",
        "content": "#ffffff"
      }
    },
    "chat": {
      "hostAvatar": {
        "isEnabled": true,
        "url": "https://pd-images-public.s3.ap-south-1.amazonaws.com/host-profile.png"
      },
      "guestAvatar": {
        "isEnabled": true,
        "url": "https://pd-images-public.s3.ap-south-1.amazonaws.com/guest-profile.png"
      },
      "hostBubbles": {
        "backgroundColor": "#2b3e13",
        "color": "#e8e2d6"
      },
      "guestBubbles": {
        "backgroundColor": "#4b5a2a",
        "color": "#FFFFFF"
      },
      "buttons": {
        "backgroundColor": "#4b5a2a",
        "color": "#FFFFFF"
      },
      "inputs": {
        "backgroundColor": "#FFFFFF",
        "color": "#5a5a5a",
        "placeholderColor": "#4b5a2a"
      }
    }
  },
  "settings": {
    "general": {
      "isBrandingEnabled": true,
      "isInputPrefillEnabled": true,
      "isHideQueryParamsEnabled": true,
      "isNewResultOnRefreshEnabled": true
    },
    "typingEmulation": {
      "enabled": true,
      "speed": 300,
      "maxDelay": 1.5
    },
    "metadata": {
      "description": "Build agents and embed them directly in your applications without a line of code."
    }
  }
}
```

## TODO
- Add details on how to bring up your own server
- Add few JSON examples to demonstrate server and agent-embed communication.

     
Agent embed
Copyright (C) 2023 Predictable Dialogs

### License
(copied from typebot.io repository)

This program is a modification of the software available at 
https://github.com/baptisteArno/typebot.io/tree/main/packages/embeds. 
The original software is created and maintained by Baptiste Arnaud and 
contributors, and it is licensed under the GNU Affero General Public License 
version 3.

This program, Agent embed, is free software: you can redistribute 
it and/or modify it under the terms of the GNU Affero General Public License as 
published by the Free Software Foundation, either version 3 of the License, or 
(at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT 
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS 
FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more 
details.

See <https://www.gnu.org/licenses/>.

For further inquiries or to contact us, you can reach Agent Dialogs at 
jai@predictabledialogs.com.

