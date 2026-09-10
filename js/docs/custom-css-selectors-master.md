# Custom CSS Selector Reference

This document maps the visible chatbot areas to the CSS selectors that can be used in the live theme editor's Custom CSS field.

The manual editor in `api-automation-webapp/pages/agent/live-theming/[botId]/index.js` updates broad theme values. Those values are converted to CSS variables in `agent-embed/js/src/utils/setCssVariablesValue.ts` and consumed by the widget styles in `agent-embed/js/src/assets/index.css`.

Use Custom CSS when the manual controls are too broad, for example when initial prompt buttons need a different style from user bubbles, when a gradient or shadow is needed, or when a specific state like hover, selected, dragging, or action-icon state needs styling.

## How Custom CSS Is Applied

`Bot.tsx` renders the saved CSS as:

```tsx
<style>{customCss()}</style>
<style>{immutableCss}</style>
```

The main widget CSS is loaded before the custom CSS, so Custom CSS can normally override `index.css`. `immutable.css` is injected after Custom CSS and uses `!important` for a few protected selectors. For those selectors, use a more specific selector and `!important` if the change is intentional.

Recommended shape:

```css
.agent-embed-container .initial-prompt-button {
  background: linear-gradient(135deg, #fff7e8, #ffe0c6);
  border: 1px solid rgba(180, 110, 60, 0.32);
}
```

Avoid targeting Tailwind utility classes such as `.flex`, `.w-full`, `.px-4`, or `.rounded-lg`. They are implementation details and are too broad.

## Screenshot Area Map

### Initial Welcome State

The first screenshot is the pre-chat state. It contains:

| Area | Selectors |
| --- | --- |
| Whole widget frame/background | `.agent-embed-container` |
| Welcome/start panel | `.initial-prompts-panel`, `.agent-input-container` |
| Welcome title row | `.initial-prompts-heading`, `.initial-prompts-title` |
| Welcome icon/image | `.initial-prompts-title-icon`, `.initial-prompts-title-icon img` |
| Welcome subtitle | `.initial-prompts-subtitle` |
| Prompt list | `.initial-prompts-list` |
| Prompt cards | `.initial-prompt-button` |
| Prompt icon/image | `.initial-prompt-icon`, `.initial-prompt-icon img` |
| Prompt text | `.initial-prompt-text` |
| Bottom input surface | `.agent-input`, `.fixed-input-overlay`, `.agent-input-container` |
| Input field | `.text-input`, `[data-testid="auto-resizing-textarea"]` |
| Send button | `.agent-button`, `.send-icon`, `.send-icon-image` |
| Branding badge | `#lite-badge`, `.lite-badge` |
| Clear/reset button | `#clear-button`, `.clear-button` |

### Conversation State

The second screenshot is the message stream state. It contains:

| Area | Selectors |
| --- | --- |
| Scrollable message viewport | `.agent-chat-view`, `.chat-container`, `.scrollable-container` |
| Assistant avatar column | `.agent-avatar-container`, `.agent-avatar-container figure`, `.agent-avatar-container img` |
| Assistant bubble wrapper | `.agent-host-bubble-wrapper` |
| Assistant bubble visual surface | `.agent-host-bubble:not(.agent-host-bubble-content)` |
| Assistant text content | `.agent-host-bubble-content`, `.ai-bubble`, `.slate-html-container` |
| Assistant message actions | `.agent-message-action-bar`, `.agent-message-action-button` |
| Action icons | `.agent-message-action-icon-fill`, `.agent-message-action-icon-outline` |
| User message row | `.guest-container` |
| User bubble | `.agent-guest-bubble` |
| User avatar | `.guest-container figure`, `.guest-container img` |
| Input area | `.agent-input`, `.fixed-input-overlay`, `.text-input`, `.agent-button` |

## Manual Editor Coverage

The live theme editor currently exposes these broad controls:

| Editor section | What it updates | Widget effect |
| --- | --- | --- |
| Theme Templates | Preset theme values and optional custom CSS | Multiple variables and selectors at once |
| Background | `theme.general.background` | `.agent-embed-container` background color |
| Roundness | `theme.chat.roundness` | `--agent-border-radius` and `--agent-initial-prompt-radius` |
| Start Experience | `welcome` and `initialPrompts` content | Title, subtitle, icons, prompt labels |
| Font & Brand | `theme.general.font`, branding toggle | Widget font and `#lite-badge` visibility |
| Avatars | Host/user avatar enabled state and URL | Assistant and user avatar rendering |
| Bubbles | Host/user bubble text/background colors | `.agent-host-bubble`, `.agent-guest-bubble`; guest colors also drive initial prompt variables |
| Message Action Bar | Host bubble action toggles | Shows/hides thumbs up, thumbs down, copy, and corrective popup |
| Send Button | Button label/icon and colors | `.agent-button`, `.send-icon`, `.send-icon-image` |
| Input | Input type, input length, placeholder, input colors | `.agent-input`, `.text-input`, fixed/floating input behavior |
| Custom CSS | Raw CSS string | Injected into the widget for advanced selectors |

Key limitation: the editor writes shared variables. For example, user bubble colors are also copied into the initial prompt variables. Use `.initial-prompt-button` or `--agent-initial-prompt-*` in Custom CSS to separate those surfaces.

## Theme Variables

These variables are defined in `assets/index.css`. Most manual controls set them inline on `.agent-embed-container`.

| Variable | Area affected | Notes |
| --- | --- | --- |
| `--agent-embed-container-bg-image` | Widget background image | Used by `.agent-embed-container` |
| `--agent-embed-container-bg-color` | Widget background color | Used by `.agent-embed-container` |
| `--agent-embed-container-font-family` | Widget font | Used by `.agent-embed-container` |
| `--agent-embed-container-color` | General text color | Used by selectable inputs and picture choices |
| `--agent-host-bubble-bg-color` | Assistant bubble background | Used by host bubble and some secondary controls |
| `--agent-host-bubble-color` | Assistant bubble text/icons | Used by host bubble text, typing dots, and action icons |
| `--agent-host-bubble-border` | Assistant bubble border | Consumed by `.agent-host-bubble`; not defined by the editor |
| `--agent-guest-bubble-bg-color` | User bubble background | Also copied to initial prompt background by theme code |
| `--agent-guest-bubble-color` | User bubble text | Also copied to initial prompt text by theme code |
| `--agent-input-bg-color` | Input background | Used by `.agent-input`, date inputs, search inputs |
| `--agent-input-color` | Input text color | Also used by welcome title/subtitle |
| `--agent-input-placeholder-color` | Placeholder color | Used by `.text-input::placeholder` |
| `--agent-button-bg-color` | Primary button background | Used by send, choice, upload, rating, focus, progress styles |
| `--agent-button-bg-color-rgb` | RGB form of primary button color | Used by rgba focus/hover styles |
| `--agent-button-color` | Primary button text/icon color | Used by `.agent-button`, `.send-icon`, badges inside upload |
| `--agent-checkbox-bg-color` | Checkbox background | Computed from widget background |
| `--selectable-base-alpha` | Selectable transparency base | Raised for image backgrounds |
| `--agent-initial-prompt-radius` | Initial prompt radius | Defaults to `--agent-border-radius` |
| `--agent-initial-prompt-bg-color` | Initial prompt background | Defaults to guest bubble background |
| `--agent-initial-prompt-color` | Initial prompt text/icon color | Defaults to guest bubble text |
| `--agent-initial-prompt-border-color` | Initial prompt border | Defined in CSS, not directly set by editor |
| `--agent-border-radius` | Shared radius | Bubbles, inputs, buttons, choices, date/upload |
| `--agent-content-max-width` | Message viewport max width | Used by `.agent-chat-view` |
| `--agent-input-max-width` | Input and initial panel max width | Used by `.agent-input-container` |
| `--space-safe-bottom` | Fixed input bottom spacing | Used by fixed bottom input |
| `--input-max-lines` | Auto-resizing textarea max lines | Defined in CSS; current JS reads it from `document.documentElement`, so Custom CSS inside the widget may not reliably change behavior |
| `--layer-container` | Standard-widget fixed input z-index | Used by fixed input wrapper |
| `--layer-overlay` | Bubble/popup fixed input z-index | Used by fixed input wrapper |

To override an inline theme variable from Custom CSS, use `!important` on `.agent-embed-container`:

```css
.agent-embed-container {
  --agent-input-max-width: 720px !important;
  --agent-initial-prompt-bg-color: #fff7ed !important;
}
```

If you override `--agent-button-bg-color`, also override `--agent-button-bg-color-rgb` when focus rings, selected states, or translucent hover colors should match.

## Selector Reference

### Root, Layout, And Scroll

| Selector | Styles this area | Notes |
| --- | --- | --- |
| `.agent-embed-container` | Outermost bot container | Background, font, radius, global variables. Good root scope for Custom CSS. |
| `.agent-chat-view` | Scrollable conversation width | Uses `--agent-content-max-width`. |
| `.chat-container` | Scrollable message container fade-in | Gets `.ready` after mount. |
| `.chat-container.ready` | Loaded chat container | Useful for entry transitions. |
| `.scrollable-container` | Hidden-scrollbar message viewport | Use if you need custom scrollbar behavior. |
| `.agent-input-container` | Max width for inputs and welcome panel | Uses `--agent-input-max-width`. |
| `.fixed-input-overlay` | Inner fixed bottom input surface | Present on fixed bottom input only. |
| `.agent-fixed-input` | Legacy fixed input surface | Defined in CSS/regression docs, not rendered by current `FixedBottomInput.tsx`. |

### Welcome And Initial Prompts

| Selector | Styles this area | Notes |
| --- | --- | --- |
| `.initial-prompts-panel` | Entire welcome/prompts panel | Wraps title, subtitle, and prompts. Also has `.agent-input-container`. |
| `.initial-prompts-heading` | Title/subtitle stack | Use for spacing around heading content. |
| `.initial-prompts-title` | Welcome title row | Text, title size, title layout. |
| `.initial-prompts-title-icon` | Welcome title icon wrapper | Works for emoji or image icons. |
| `.initial-prompts-title-icon img` | Uploaded/URL welcome title icon | Use for image fit, masks, borders. |
| `.initial-prompts-subtitle` | Welcome subtitle | Use for secondary text styling. |
| `.initial-prompts-list` | Prompt button stack | Use for gap/layout changes. |
| `.initial-prompt-button` | Individual starter prompt button/card | Best selector for prompt background, gradient, border, shadow, padding. |
| `.initial-prompt-button:hover` | Prompt hover state | Default hover uses `filter: brightness(...) !important`. |
| `.initial-prompt-button:active` | Prompt active state | Default active state uses `filter: brightness(...) !important`. |
| `.initial-prompt-button:focus-visible` | Prompt keyboard focus | Use for accessible focus styling. |
| `.initial-prompt-icon` | Prompt icon wrapper | Works for emoji or image icons. |
| `.initial-prompt-icon img` | Uploaded/URL prompt icon | Use for object fit, size, masks. |
| `.initial-prompt-text` | Prompt text | Use for typography and wrapping. |

### Bubbles And Message Content

| Selector | Styles this area | Notes |
| --- | --- | --- |
| `.agent-host-bubble-wrapper` | Assistant bubble wrapper | Controls max width, inherited host text color, media radius inheritance. |
| `.agent-host-bubble:not(.agent-host-bubble-content)` | Assistant bubble visual surface | Prefer this for background, gradient, border, and shadow. |
| `.agent-host-bubble` | Assistant bubble shared class | Applied to both the visual typing/surface div and text content div. Use carefully. |
| `.agent-host-bubble-content` | Assistant text content layer | Protected by `immutable.css` from accidental background/border duplication. Good for text spacing/typography. |
| `.slate-html-container` | Host rich-text content wrapper | Contains sanitized markdown HTML. |
| `.ai-bubble` | Rendered assistant markdown root | Use for markdown typography. |
| `.ai-bubble p` | Assistant markdown paragraphs | Default margin is `0 0 8px`. |
| `.ai-bubble ul`, `.ai-bubble ol` | Assistant markdown lists | Use for list indentation and markers. |
| `.ai-bubble li` | Assistant markdown list items | Use for list spacing/line height. |
| `.ai-bubble pre`, `.ai-bubble code` | Assistant code blocks/inline code | Use for code font, background, wrapping. |
| `.agent-guest-bubble` | User message bubble | Best selector for user bubble gradient, border, shadow, radius. |
| `.guest-container` | User message row | Use for user row spacing/alignment and avatar targeting. |

Host bubble caveat:

```css
/* Visual assistant bubble only */
.agent-embed-container .agent-host-bubble:not(.agent-host-bubble-content) {
  background: linear-gradient(135deg, #ffffff, #eef6ff);
  border: 1px solid rgba(45, 90, 140, 0.2);
  box-shadow: 0 10px 24px rgba(20, 50, 90, 0.12);
}

/* Assistant text only */
.agent-embed-container .agent-host-bubble-content .ai-bubble {
  font-size: 15px;
  line-height: 1.55;
}
```

### Avatars And Typing

| Selector | Styles this area | Notes |
| --- | --- | --- |
| `.agent-avatar-container` | Assistant avatar column | Parent of assistant avatar. |
| `.agent-avatar-container figure` | Assistant avatar frame | Figure has Tailwind size classes but no semantic class. |
| `.agent-avatar-container img` | Assistant avatar image | Use for borders, shadows, filters. |
| `.guest-container figure` | User avatar frame | User avatar is rendered beside `.agent-guest-bubble`. |
| `.guest-container img` | User avatar image | Use for borders, shadows, filters. |
| `[data-testid="default-avatar"]` | Default avatar frame | Test id is available, but prefer URL avatars where possible. |
| `.bubble-typing` | Typing bubble shell | Also has `.agent-host-bubble`. |
| `.bubble1`, `.bubble2`, `.bubble3` | Typing dots and connecting dots | Use for dot color, size, animation. |
| `.text-fade-in` | Text/media fade-in transition | Utility-style class used inside bubble content. |
| `.no-transition` | Disables transition on persisted host bubbles | Internal state helper. Avoid styling unless needed. |

### Inputs

| Selector | Styles this area | Notes |
| --- | --- | --- |
| `.agent-input` | Shared input surface | Applies to fixed input, floating input, searchable choices, date, payment. |
| `.fixed-input-overlay.agent-input` | Fixed bottom input surface | Use when fixed bottom input needs different styling from other `.agent-input` surfaces. |
| `.agent-chat-view .agent-input` | Floating input inside message stream | Use when floating input needs different styling from fixed input. |
| `.text-input` | Text input, textarea, search input | Placeholder styling is handled through `.text-input::placeholder`. |
| `.text-input::placeholder` | Placeholder text | Default CSS uses `!important`; use equal/higher specificity plus `!important` if needed. |
| `[data-testid="auto-resizing-textarea"]` | Fixed-bottom textarea | Useful for scrollbar and multiline-specific styling. |
| `[data-testid="auto-resizing-textarea"]::-webkit-scrollbar` | Auto-resizing textarea scrollbar | Chrome/Safari scrollbar width. |
| `.agent-date-input` | Date/datetime input fields | Used in date and date-range forms. |
| `.agent-country-select` | Country select | Defined in CSS for phone/country input styling; not rendered by the currently scanned input components. |
| `.agent-input-error-message` | Input/payment error text | Used by Stripe payment errors. |

### Buttons And Footer Controls

| Selector | Styles this area | Notes |
| --- | --- | --- |
| `.agent-button` | Primary buttons | Send, single-choice buttons, rating number buttons, upload submit. |
| `.agent-button:hover`, `.agent-button:active` | Primary button interaction states | Base hover/active brightness comes from Tailwind utility classes. |
| `.agent-button.selectable` | Unselected number rating buttons | Used when rating buttons are selectable rather than selected. |
| `.secondary-button` | Secondary buttons | Used by clear file/upload secondary actions and `ClearButton` before immutable ID styles. |
| `.agent-button > .send-icon` | Default mobile send SVG icon | Uses `fill: var(--agent-button-color)`. |
| `.agent-button > .send-icon-image` | Custom send icon image | Used when the send button is in icon mode. |
| `.send-icon` | Send SVG icon | Child of `.agent-button`. |
| `.send-icon-image` | Send image icon | Child image for custom button icon. |
| `.ping span` | Auto-attention ping on a single first choice | Uses button background color. |
| `#lite-badge`, `.lite-badge` | Predictable branding badge | Protected by `immutable.css`; use ID with stronger specificity and `!important` for intentional styling. |
| `#clear-button`, `.clear-button` | Clear/reset chat button | Protected by `immutable.css`; use ID with stronger specificity and `!important` for intentional styling. |

Immutable examples:

```css
.agent-embed-container #clear-button {
  background: #111827 !important;
  color: #ffffff !important;
  border-color: #111827 !important;
}

.agent-embed-container #lite-badge {
  border-radius: 999px !important;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12) !important;
}
```

### Feedback And Message Actions

| Selector | Styles this area | Notes |
| --- | --- | --- |
| `.agent-message-action-bar` | Action row below completed assistant messages | Contains thumbs up, thumbs down, copy. |
| `.agent-message-action-button` | Individual action icon button | Use for size, color, opacity, background, hover. |
| `.agent-message-action-button:hover` | Action hover state | Default raises opacity. |
| `.agent-message-action-button.selected` | Selected/copy-success state | Used for selected feedback and copied state. |
| `.agent-message-action-button:disabled` | Pending feedback state | Used while feedback is submitting. |
| `.agent-message-action-icon-fill` | Filled SVG icon layer | Used by thumbs/copy icons. |
| `.agent-message-action-icon-outline` | Outline SVG icon layer | Used by thumbs/copy icons. |
| `.agent-feedback-popup` | Corrective feedback popup container | Appears after thumbs down when corrective popup is enabled. |
| `.agent-feedback-popup-label` | Corrective popup label | Text above textarea. |
| `.agent-feedback-popup-input` | Corrective popup textarea | User-entered correction. |
| `.agent-feedback-popup-input:focus` | Corrective textarea focus state | Default uses button RGB focus ring. |
| `.agent-feedback-popup-actions` | Corrective popup button row | Wraps skip and submit buttons. |
| `.agent-feedback-popup-button` | Corrective popup submit button | Primary popup button. |
| `.agent-feedback-popup-button.secondary` | Corrective popup skip button | Secondary popup button. |
| `.agent-feedback-popup-button:disabled` | Popup pending state | Used while feedback is submitting. |

### Choice, Rating, Upload, Payment, And Media Blocks

| Selector | Styles this area | Notes |
| --- | --- | --- |
| `.agent-selectable` | Multi-choice text option | Has `.selected` when checked. |
| `.agent-selectable:hover` | Multi-choice hover state | Uses button color with alpha. |
| `.agent-selectable.selected` | Selected multi-choice option | Good for selected background/border. |
| `.agent-checkbox` | Checkbox square | Used in multi-choice and multi-picture choices. |
| `.agent-checkbox.checked` | Checked checkbox square | Background uses primary button color. |
| `.agent-picture-button` | Single picture choice card | Has `.has-svg` for SVG images. |
| `.agent-picture-button > img` | Single picture image | Use for image height, fit, masks. |
| `.agent-picture-button.has-svg > img` | Single picture SVG image | Default uses contain and padding. |
| `.agent-selectable-picture` | Multi-picture choice card | Has `.selected` and optional `.has-svg`. |
| `.agent-selectable-picture:hover` | Multi-picture hover state | Uses button color with alpha. |
| `.agent-selectable-picture.selected` | Selected multi-picture card | Good for selected background/border. |
| `.agent-selectable-picture > img` | Multi-picture image | Use for image height, fit, masks. |
| `.agent-selectable-picture.has-svg > img` | Multi-picture SVG image | Default uses contain and padding. |
| `.rating-label` | Rating left/right labels | Labels around rating buttons. |
| `.rating-icon-container` | Icon-based rating item | Inner SVG is styled by CSS. |
| `.rating-icon-container svg` | Rating icon SVG | Use for icon size, stroke, fill. |
| `.rating-icon-container.selected svg` | Selected rating icon | Fill uses primary button color. |
| `.agent-upload-input` | Upload dropzone | Has `.dragging-over` during drag. |
| `.agent-upload-input.dragging-over` | Active drag-over upload dropzone | Border uses primary button color. |
| `.upload-progress-bar` | Upload progress fill | Uses primary button color. |
| `.total-files-indicator` | Selected file-count badge | Uses primary button color and button text color. |
| `#payment-form` | Stripe payment form wrapper | Also has `.agent-input`. |
| `#payment-element` | Stripe mounted payment element container | Created at runtime inside the payment slot. |
| `#embed-bubble-content` | Embed iframe | Use for embedded iframe sizing/borders. |
| `.agent-host-bubble-wrapper img` | Assistant image bubble media | Default radius follows widget radius. |
| `.agent-host-bubble-wrapper iframe` | Assistant embed/video iframe | Default radius follows widget radius. |
| `.agent-host-bubble-wrapper video` | Assistant video bubble media | Default radius follows widget radius. |
| `.agent-host-bubble-wrapper audio` | Assistant audio bubble media | No default class; target through wrapper. |

### Bubble And Popup Shell Parts

These are not classes, but they are stable attributes exposed by bubble/popup wrappers and can be useful in Custom CSS.

| Selector | Styles this area | Notes |
| --- | --- | --- |
| `[part="button"]` | Bubble launcher button | Available in bubble mode. |
| `[part="button-icon"]` | Bubble launcher image icon | Available when custom icon image is used. |
| `[part="preview-message"]` | Bubble preview message | Available in bubble mode before opening. |
| `[part="bot"]` | Bubble chat window shell | Available in bubble mode. |
| `[part="overlay"]` | Popup modal overlay | Available in popup mode. |

Example:

```css
[part="button"] {
  background: linear-gradient(135deg, #111827, #2563eb) !important;
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.35);
}

[part="overlay"] {
  background: rgba(15, 23, 42, 0.64);
  backdrop-filter: blur(4px);
}
```

## Common Custom CSS Recipes

### Style Initial Prompts Separately From User Bubbles

```css
.agent-embed-container {
  --agent-initial-prompt-bg-color: #fff7ed !important;
  --agent-initial-prompt-color: #263342 !important;
  --agent-initial-prompt-border-color: rgba(234, 88, 12, 0.24) !important;
}

.agent-embed-container .initial-prompt-button {
  background: linear-gradient(135deg, #fff7ed, #ffedd5);
  box-shadow: 0 8px 18px rgba(154, 52, 18, 0.12);
}
```

### Add A Glass Fixed Input

```css
.agent-embed-container .fixed-input-overlay.agent-input {
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.32);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
  backdrop-filter: blur(14px);
}
```

### Improve Assistant Markdown Typography

```css
.agent-embed-container .ai-bubble {
  font-size: 15px;
  line-height: 1.6;
}

.agent-embed-container .ai-bubble code {
  padding: 0.1rem 0.35rem;
  border-radius: 5px;
  background: rgba(15, 23, 42, 0.08);
}
```

### Make Avatars Feel Branded

```css
.agent-embed-container .agent-avatar-container img,
.agent-embed-container .guest-container img {
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.18);
}
```

### Restyle Message Actions

```css
.agent-embed-container .agent-message-action-button {
  width: 1.75rem;
  height: 1.75rem;
  background: rgba(15, 23, 42, 0.04);
}

.agent-embed-container .agent-message-action-button.selected {
  background: rgba(var(--agent-button-bg-color-rgb), 0.14);
}
```

## Caveats

1. `.agent-host-bubble` is applied to both the visual assistant bubble and the assistant text content layer. Use `.agent-host-bubble:not(.agent-host-bubble-content)` for visual backgrounds, borders, gradients, and shadows.
2. `.agent-host-bubble-content`, `#lite-badge`, and `#clear-button` are protected by `immutable.css`, which is injected after Custom CSS. Use stronger selectors and `!important` only when you intentionally want to override those protected rules.
3. The manual editor updates shared variables. Custom CSS selectors are the correct way to split surfaces that share a variable, such as initial prompt buttons and user bubbles.
4. If a selector targets generated markdown inside `.ai-bubble`, remember the content is sanitized HTML. Target standard HTML tags like `p`, `ul`, `ol`, `li`, `a`, `pre`, and `code`.
5. Data test selectors such as `[data-testid="auto-resizing-textarea"]` currently exist, but semantic classes are preferable when both are available.
