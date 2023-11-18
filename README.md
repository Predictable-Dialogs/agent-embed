## This is work in progress.

# agent-widget

An agent widget blends the traditional concept of a widget with the more dynamic role of an "agent." This is a tool that's not just a passive interface element, but an active, intelligent participant in user interactions. It implies a certain level of autonomy and sophistication so it fits into the evolving nature of integrating AI with web technologies.

## Protocol to talk with a agent server

1. Session initiated by agent widget using the agent name & server end point. The server responds with (initialAgentReply)
   initialAgentReply contains:
       a. A theme, used for styling the chat widget. 
       b. The sessionId created on the server.
       c. A message to show on the chat widget (optional)
       d. A list of serverInitiatedActions - things like start streaming, execute webhooks (upload images)
       
2. The following is stored in the sessionData on the client:
      a. sessionId
      b. initialAgentReply
      c. customCss
      d. agentName


     
Agent Widget
Copyright (C) 2023 Agent Dialogs

This program is a modification of the software available at 
https://github.com/baptisteArno/typebot.io/tree/main/packages/embeds. 
The original software is created and maintained by Baptiste Arnaud and 
contributors, and it is licensed under the GNU Affero General Public License 
version 3.

This program, Agent Widget, is free software: you can redistribute 
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

