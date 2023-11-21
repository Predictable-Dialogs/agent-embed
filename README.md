## WIP

## TODO
- Add details on environment variables
- Add details on how to connect to server
- Add details on how to initiate streaming connection from client
- Add few JSON examples to demonstrate server and agent-embed communication.

# agent-embed

### Vision
An agent embed blends the traditional concept of a widget with the more dynamic role of an "agent." This is a tool that's not just a passive interface element, but an active, intelligent participant in user interactions. It implies a certain level of autonomy and sophistication so it fits into the evolving nature of integrating AI with web technologies.

### Current usage
The current implementation can be used to embed agents to a website. This is helps protect your AI API keys, which don't have to be exposed on the frontend.

## Usage
### NextJS 
[Link to readme in nextJs folder](https://github.com/Predictable-Dialogs/agent-embed/blob/main/nextjs/README.md)

### React Instructions
[Link to readme in react folder](https://github.com/Predictable-Dialogs/agent-embed/blob/main/react/README.md)

### JS Instructions
[Link to readme in js folder](https://github.com/Predictable-Dialogs/agent-embed/blob/main/js/README.md)

# Example Screen

<img src="https://github.com/Predictable-Dialogs/agent-embed/assets/3472565/ee609766-a401-4490-a2bf-939ae408ef5a" width="300" />



## Protocol to talk with a agent server

1. Session initiated by agent embed using the agent name & server end point. The server responds with (initialAgentReply)
   initialAgentReply contains:
       a. A theme, used for styling the agent embed. 
       b. The sessionId created on the server.
       c. A message to show on the agent embed (optional)
       d. A list of serverInitiatedActions - things like start streaming, execute webhooks (upload images)
       
2. The following is stored in the sessionData on the client:
      a. sessionId
      b. initialAgentReply
      c. customCss
      d. agentName


     
Agent embed
Copyright (C) 2023 Agent Dialogs

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

