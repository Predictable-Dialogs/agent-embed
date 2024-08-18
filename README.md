## Predictable Dialogs AI Agents and Chatbots
An agent can be created by going to [htps://predictabledialogs.com/agents/create](htps://predictabledialogs.com/agents/create)

The [agent-embed](https://github.com/Predictable-Dialogs/agent-embed) repository provides components which can be embedded on a website and communicates with the predictable dialogs backend which in turn talks to the openAI LLM models. It currently provides components for chat. The chat components it provides are Bubbles, Standard, Popup and Button. 

## Standard Setup and Initialization
 You can get the Standard embed code by clicking on "Install" tab of your agent and select "Standard" in the embed type. Here is an example of how it would look in html.

 ```html
  <script type="module">
    import Agent from 'https://cdn.jsdelivr.net/npm/@agent-embed/js@latest/dist/web.js'
    Agent.initStandard({
      agentName: "your assistant name",
      apiHost: "https://app.predictabledialogs.com/web/incoming",
    });
  </script>
  <agent-standard style="width: 100%; height: 600px; "></agent-standard>
 ```
This code is creating a container with width matching parent width (100% width) and 600px height.


## Bubble Setup and Initialization
The Bubble component is the widget which is placed at the bottom of a webpage, on clicking which it opens the chatbot. To integrate the Bubble component into your website, you need the embed code. You can get the Bubble embed code by clicking on "Install" tab of your agent and select "Bubble" in the embed type. Here is an example of how it would look in html.

```html
  <script type="module">
    import Agent from 'https://cdn.jsdelivr.net/npm/@agent-embed/js@latest/dist/web.js'
    Agent.initBubble({
      agentName: "your assistant name",
      apiHost: "https://app.predictabledialogs.com/web/incoming",
    });
  </script>
```

If you prefer JavaScript, then the code looks like this:
```js
  const agentInitScript = document.createElement("script");
  agentInitScript.type = "module";
  agentInitScript.innerHTML = `import Agent from 'https://cdn.jsdelivr.net/npm/@agent-embed/js@latest/dist/web.js'
  Agent.initBubble({
    agentName: "your assistant name",
    apiHost: "https://app.predictabledialogs.com/web/incoming",
  });
  `;
  document.body.append(agentInitScript);
```

The agentName is generated on the predictable dialogs app. 

After creating an agent, the install page gives the needed embed code, which can be added to any Javascript, Html page.

### Bubble Options and their meanings

agentName: Defines the name of the agent. This is generated on the predictable dialogs app.
apiHost: The value for this is "https://app.predictabledialogs.com/web/incoming". It specifies the URL of the backend service where the chat data is processed.
initialPrompt: Sets the initial message that appears when the user first opens the chat bubble. If no initialPrompt is set, then it defaults to "Hi"
theme: This can be used to style the bubble button and the Bubble Preview Message. The bubble button can be styled with a custom color, size, iconColor. You can also add a custom icon and a custom close icon. This is shown below.

### Styling the Bubble using the theme property:

Using the theme configuration, the button can be styled, the preview message can be styled and the placement of the bubble can be done.

#### Styling the button
The bubble button can be styled using the below options:
size: Specifies the size of the button. This can be set to either 'medium' or 'large'.
backgroundColor: Sets the background color of the bubble button.
iconColor: Defines the color of the icon displayed on the button.
customIconSrc: Allows for a custom icon to be used instead of the default.
customCloseIconSrc: Specifies a custom icon for the close button.

E.g. Green background for the chat button and white icon color, with custom AirBnb logo inside the bubble and a custom close icon.

```html
<script type="module">
  import Agent from 'https://cdn.jsdelivr.net/npm/@agent-embed/js@latest/dist/web.js'

Agent.initBubble({
  agentName: "your assistant name",
  apiHost: "https://app.predictabledialogs.com/web/incoming",
  initialPrompt: "Hello! How can I assist you today?",
    theme: {
      button: {
        size: 'large',
        backgroundColor: "#4CAF50", // Green background for the chat button
        iconColor: "#007BFF",        // White icon color
        customIconSrc: "https://cdn.jsdelivr.net/npm/simple-icons@3.13.0/icons/airbnb.svg",
        customCloseIconSrc: "https://unpkg.com/feather-icons@4.29.2/dist/icons/x.svg"
      }
    },
});

</script>

```

You can find some nice svgs here: https://feathericons.com/ which can be used as an icon inside the bubble button.
Select an svg and replace x.svg with the svg you selected in the url, e.g if you like 
the svg called "message-square" in the feathericons site, then its url would be:
https://unpkg.com/feather-icons@4.29.2/dist/icons/message-square.svg.svg

#### Bubble Placement
The placement option within the theme configuration allows you to specify whether the chat bubble appears on the bottom-right or bottom-left corner of the screen.The placement property can be set to either 'right' or 'left', determining the positioning of the bubble on your webpage:

right: Positions the bubble in the bottom-right corner.
left: Positions the bubble in the bottom-left corner.

```html
<script type="module">
  import Agent from 'https://cdn.jsdelivr.net/npm/@agent-embed/js@latest/dist/web.js'
  Agent.initBubble({
    agentName: "your assistant name",
    apiHost: "https://app.predictabledialogs.com/web/incoming",
    theme: {
      placement: 'left' // Bubble placed on the bottom-left corner
    }
  });
</script>

```

#### Bubble Preview Message.
You can add a preview message to the bubble as follows. The preview message would be shown after 
a set delay as shown below. 

```html
<script type="module">
  import Agent from 'https://cdn.jsdelivr.net/npm/@agent-embed/js@latest/dist/web.js'

  Agent.initBubble({
    agentName: "your assistant name",
    apiHost: "https://api.example.com/chat",
    initialPrompt: "Hello! How can I help you today?",
    previewMessage: {
      message: "Need help? Tap here to chat with us!",
      avatarUrl: "https://unpkg.com/feather-icons@4.29.2/dist/icons/user.svg",
      autoShowDelay: 5000, // Delay in milliseconds before the preview message appears
    },
    theme: {
      previewMessage: { backgroundColor: '#ffffff', textColor: 'black' },
    },
  });
</script>

```

## Popup Setup and Initialization

You can get the Popup embed code by clicking on "Install" tab of your agent and select "Popup" in the embed type. Here is an example of how it would look in html.

```html
<script type="module">
  import Agent from 'https://cdn.jsdelivr.net/npm/@agent-embed/js@latest/dist/web.js'
  Agent.initPopup({
    agentName: "your assistant name",
    apiHost: "https://app.predictabledialogs.com/web/incoming",
    autoShowDelay: 3000,
  });
</script>

```
This code will automatically trigger the popup window after 3 seconds. This is because autoShowDelay is set to 3000.

## Topic Buttons Setup and Initialization
A topic button is a button which is linked to a topic. You can have multiple such buttons on a page, with pre-configured topics. It helps set the topic of conversation and the conversation is continued with the openAI assistant.

You can get the Topic buttons embed code by clicking on "Install" tab of your agent and select "Topic Button" in the embed type. Here is an example of how it would look in html.

```html
<script type="module">
  import Agent from 'https://cdn.jsdelivr.net/npm/@agent-embed/js@latest/dist/web.js'
  Agent.initPopup({
    agentName: "Assistant OpenAI-95f62",
    apiHost: "https://app.predictabledialogs.com/web/incoming",
  });
</script>
// Add a button with id="1"
<ai-button id="1">Button For Topic #1</ai-button>
// Add a button with id="2"
<ai-button id="2">Button For Topic #2</ai-button>
// You can add as many topics and buttons as you need
```

The topic for the buttons can be set in the "Settings" tab, click "Topics". 
Each "Topic Message" corresponds to a button. The "Topic Message" here is the reply the used would get when he clicks the message. The user can then respond to the message, which will be handled by the openAI assistant. If needed, the user response can be disabled by selecting "Exit" to be on. This ends the conversation "after" sending the topic message to the user.

The embed code for each button can be got by clicking the < > button. The embed code would look like this:

```html
// Add a button with id "1"
<ai-button id="1">Button For Topic "2"</ai-button>
```

As topics are added, the id is incremented, this helps in separating the topics and using the
<ai-button> to trigger a specific topic.

The "Topic Message" can be generated using a prompt to the openAIAssistant, by clicking the 
✨ button.


The <ai-button> above can be styled as follows:
```html
<style>
  ai-button::part(button) {
   font-size: 20px;
  }
</style>
```

If you need multiple buttons with different styles, then add the "class" attribbute to the button and then refer to it as `ai-button.<class>::part(button)` as shown below.
```html
<ai-button id="1">
   Topic 1
</ai-button>

<ai-button class="blue" id="2">
  Topic 2
</ai-button>

<ai-button class="red" id="3">
   Topic 3
</ai-button>

<style>
  ai-button::part(button) {
   font-size: 20px;
  }

  ai-button.blue::part(button) {
   background-color: blue;
   color: white;
   font-size: 15px;
  }

  ai-button.red::part(button) {
   background-color: red;
   color: white;
   font-size: 10px;
  }
</style>
```


### Commands

Here are the commands you can use to trigger your embedded agent:

Agent.open(): Open popup or bubble

Agent.close(): Close popup or bubble

Agent.toggle(): Toggle the bubble or popup open/close state,

Agent.showPreviewMessage(): Show preview message from the bubble,

Agent.hidePreviewMessage(): Hide preview message from the bubble,


You can bind these commands on a button element, for example:
```
<button onclick="Agent.open()">Contact us</button>
```

     
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

