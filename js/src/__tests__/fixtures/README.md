# Test Fixtures

This directory contains HTML fixtures for testing different widget configurations and scenarios.

## Directory Structure

### `localhost/` - Local Backend Testing
- **basic/** - Basic widget configurations
  - `bubble.html` - Bubble widget with localhost backend
  - `standard.html` - Standard widget with localhost backend  
  - `popup.html` - Popup widget with localhost backend
- **input-variants/** - Custom input configurations
  - `bubble-with-input.html` - Bubble with custom input config
  - `standard-with-input.html` - Standard with custom input config
  - `popup-with-input.html` - Popup with custom input config
- **shortcuts/** - Keyboard shortcut testing
  - `custom-keymap.html` - Custom keyboard shortcut mappings
  - `enter-to-send.html` - Enter key sends message
  - `mod-enter-to-send.html` - Cmd/Ctrl+Enter sends message
- **compatibility/** - Backward compatibility testing
  - `backward-compatibility.html` - Legacy feature compatibility

### `production/` - Production Backend Testing
- **basic/** - Basic widget configurations against production
  - `bubble.html` - Bubble widget with production backend
  - `standard.html` - Standard widget with production backend
  - `popup.html` - Popup widget with production backend
- **input-variants/** - Custom input configurations against production
  - `bubble-with-input.html` - Bubble with custom input config
  - `standard-with-input.html` - Standard with custom input config
  - `popup-with-input.html` - Popup with custom input config
- **shortcuts/** - Keyboard shortcut testing against production
  - `custom-keymap.html` - Custom keyboard shortcut mappings
  - `enter-to-send.html` - Enter key sends message
  - `mod-enter-to-send.html` - Cmd/Ctrl+Enter sends message
- **compatibility/** - Backward compatibility testing against production
  - `backward-compatibility.html` - Legacy feature compatibility

## Configuration Details

### Local Backend
- **API Host**: `http://localhost:8001/web/incoming`
- **Stream Host**: `http://localhost:8001/web/stream`
- **Agent**: `Chatbot-67689`

### Production Backend
- **API Host**: `https://app.predictabledialogs.com/web/incoming`
- **Stream Host**: `https://app.predictabledialogs.com/web/stream`
- **Agent**: `Assistant OpenAI-18fc0`

## Usage

1. **Local Testing**: Use fixtures in `localhost/` directory when testing against local development backend
2. **Production Testing**: Use fixtures in `production/` directory when testing against production backend to verify nothing is broken
3. **Widget Types**: 
   - **Bubble**: Corner-positioned chat bubble overlay
   - **Standard**: Full-width chat interface that fills container
   - **Popup**: Modal popup chat triggered by button or delay

## Import Path

All fixtures use the local build: `../../../../../dist/web.js`

This ensures testing uses the current development version against both local and production backends.