# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is agent-embed, a monorepo for embedding AI chatbots on websites. It provides multiple embed formats (Bubble, Standard, Popup) that integrate with the Predictable Dialogs backend or custom backends. The project is built with SolidJS and distributed as embeddable JavaScript widgets. This repo is the source code for the widgets. A widget REQUIRES the agent name to start chatting with the agent.

## Architecture

The codebase is organized as a monorepo with three main packages:

- **js/** - Core SolidJS-based embed library (`@agent-embed/js`)
- **react/** - React wrapper components (`@agent-embed/react`) 
- **nextjs/** - Next.js integration (`@agent-embed/nextjs`)

### Key Components Structure

- **js/src/features/** - Main embed types:
  - `bubble/` - Chat bubble that appears in corner of page
  - `standard/` - Full-width chat interface
  - `popup/` - Modal popup chat
  - `button/` - Topic buttons for predefined conversations

- **js/src/features/blocks/** - Chat building blocks:
  - `bubbles/` - Message display components (text, image, video, audio, embed)
  - `inputs/` - User input forms (text, buttons, file upload etc.)
  - `logic/` - Flow control (redirects, scripts, variables, waits)

- **js/src/components/** - Shared UI components
- **js/src/schemas/** - Zod validation schemas
- **js/src/queries/** - API communication functions

## Development Commands

### JavaScript Library (js/)
```bash
cd js/
npm run dev          # Development mode with file watching
npm run build        # Production build
npm run lint         # ESLint with auto-fix
```

### React Package (react/)
```bash
cd react/
npm run dev          # Development mode with file watching
npm run build        # Production build
npm run lint         # ESLint with auto-fix
npm run stories:dev  # Ladle storybook development server
```

### Next.js Package (nextjs/)
```bash
cd nextjs/
npm run dev          # Development mode with file watching
npm run build        # Production build
npm run lint         # ESLint with auto-fix
```

### Root Level
```bash
# Root package.json has placeholder scripts
npm run build        # Currently just echoes message
npm run test         # Currently just echoes message
```

## Build System

- **Bundler**: Rollup with multiple output formats
- **TypeScript**: Configured for ESNext with declaration generation
- **Styling**: TailwindCSS with PostCSS processing
- **Framework**: SolidJS with Babel preset
- **Outputs**: 
  - `dist/index.js` - Main library export
  - `dist/web.js` - Web-compatible bundle for CDN usage

## Key Integration Points

The embed widgets communicate with backend APIs through:
- `apiHost` configuration (typically `https://app.predictabledialogs.com/web/incoming`)
- `agentName` for identifying specific chatbot instances
- Streaming responses via useChat from @ai-sdk/solid

## Testing
Vitest with @solidjs/testing-library and jsdom

## Browser Compatibility

Built as ES modules for modern browsers. Uses SolidJS for reactive UI updates and custom elements for web component integration.