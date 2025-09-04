# CSS CLASSES, DESCRIPTIONS, LIMITATIONS

## MAIN CLASSES

### .agent-embed-container
**Purpose:** Root-level theming container for the entire chatbot widget.
**Scope:** Applied to the outermost Bot component container.
**Responsibility:** Sets global theme variables (background, font-family, color) and establishes the main widget container.
**Limitations:** Changing background here affects the entire widget. Font changes apply globally to all text.

## .agent-host-bubble
**Purpose:** Container for AI/bot message bubbles.
**Scope:** Applied to host message containers.
**Responsibility:** Provides base styling for bot messages including typing animation container.
**Limitations:** Works in conjunction with .bubble-typing class for background color as shown below.
**CRITICAL LIMITATION:**  Cannot override the background color alone, to override background color use `.agent-host-bubble .bubble-typing` class.

## .agent-host-bubble .bubble-typing
**Purpose:** Use to override background color in AI/bot message bubbles.
**Scope:** Applied to the AI/bot message & typing container inside host bubbles.
**Responsibility:** Handles size transitions during typing animation and background styling.
**Limitations:** Cannot be used to set the text color, to set the text color use the `agent-host-bubble` class.

## .agent-guest-bubble
**Purpose:** Styling for user/guest message bubbles.
**Scope:** Applied to user message containers.
**Responsibility:** Provides background, text color, and border radius for user messages.
**Limitations:** Single color scheme for all user messages.

## .agent-input
**Purpose:** Base styling for all input containers.
**Scope:** Applied to the text input containers.
**Responsibility:** Provides background, text color, shadow, and border radius for input areas. Variations like `.agent-input:focus-within` work very nicely with this.
**Limitations:** Single input styling applies to all input types.


## .agent-button
**Purpose:** Primary action buttons styling (send buttons, choice buttons).
**Scope:** Applied to the submit button.
**Responsibility:** Provides consistent button styling with hover/active states. Classes like `.agent-button:hover` play very nicely with this.
**Limitations:** Changes affect all primary buttons.


## SECONDARY CLASSES

## .agent-input-container
**Purpose:** Layout constraint for input components.
**Scope:** Applied to input container elements (FixedBottomInput.tsx:106).
**Responsibility:** Constrains input width using max-width CSS variable.
**CSS Variables:** Uses --agent-input-max-width.
**Limitations:** Fixed maximum width constraint might not work for all designs.

## .agent-input-error-message
**Purpose:** Error message styling for inputs.
**Scope:** Applied to error messages in forms (StripePaymentForm.tsx).
**Responsibility:** Provides color for error text.
**CSS Variables:** Uses --agent-input-color.
**Limitations:** Uses same color as regular input text, might need distinct error color.

## .agent-chat-view
**Purpose:** Layout constraint for chat content area.
**Scope:** Applied to the chat conversation container (StreamConversation.tsx:319).
**Responsibility:** Sets max-width to constrain chat width for readability.
**CSS Variables:** Uses --agent-content-max-width.
**Limitations:** Fixed width constraint affects entire chat layout.

## .agent-avatar-container
**Purpose:** Container for avatar positioning and sizing.
**Scope:** Applied to avatar side containers (AvatarSideContainer.tsx:46).
**Responsibility:** Manages avatar layout and positioning within message flows.
**CSS Variables:** None directly, but inherits sizing from mobile detection.
**Limitations:** Responsive behavior is JavaScript-controlled, not CSS-based.

## .agent-fixed-input
**Purpose:** Styling for fixed bottom input areas.
**Scope:** Applied to fixed-bottom input containers.
**Responsibility:** Provides color and background for fixed input areas.
**CSS Variables:** Uses --agent-input-color, --agent-input-bg-color.
**Limitations:** Same variables as regular inputs, no distinction for fixed positioning.


## Utility Classes

## .scrollable-container
**Purpose:** Removes scrollbars from scrollable areas.
**Scope:** Applied to chat containers and scrollable areas (StreamConversation.tsx:319).
**Responsibility:** Hides scrollbars across different browsers while maintaining scroll functionality.
**CSS Variables:** None.
**Limitations:** Might reduce accessibility for users who rely on visible scrollbars.

## .text-fade-in
**Purpose:** Fade-in animation for text content.
**Scope:** Applied to text that should fade in (TextBubble.tsx).
**Responsibility:** Provides smooth opacity transition for appearing text.
**CSS Variables:** None.
**Limitations:** Hardcoded timing (400ms ease-in with 200ms delay).

## .bubble-typing
**Purpose:** Size transition animation for typing bubble container.
**Scope:** Applied to typing indicator containers (TextBubble.tsx:95, LoadingBubble.tsx:8).
**Responsibility:** Smooth size transitions during typing animation.
**CSS Variables:** None.
**Limitations:** Hardcoded timing (400ms ease-out for width/height).

## .bubble1, .bubble2, .bubble3
**Purpose:** Individual typing indicator dots with staggered animation.
**Scope:** Applied to typing indicator dots (TypingBubble.tsx:3-5).
**Responsibility:** Creates bouncing animation effect for typing indicators.
**CSS Variables:** Uses --agent-host-bubble-color for background.
**Limitations:** Animation timing and sequence is hardcoded. Color inheritance might conflict with custom styling.

## .text-input
**Purpose:** Base styling for text input fields and textareas.
**Scope:** Applied to input elements (ShortTextInput.tsx:15, Textarea.tsx:16, AutoResizingTextarea.tsx:126).
**Responsibility:** Provides placeholder color styling and basic input appearance.
**CSS Variables:** Uses --agent-input-placeholder-color for placeholder text.
**Limitations:** Placeholder styling is hardcoded with !important, difficult to override.

## .chat-container
**Purpose:** Animation container for the entire chat area.
**Scope:** Applied to main chat container (StreamConversation.tsx:319).
**Responsibility:** Handles fade-in animation for the chat interface.
**CSS Variables:** None.
**Limitations:** Opacity animation timing is hardcoded (0.4s ease).

## .chat-container.ready
**Purpose:** Visible state for chat container after initialization.
**Scope:** Added to chat container after mounting (StreamConversation.tsx:232).
**Responsibility:** Sets opacity to 1 to complete fade-in animation.
**CSS Variables:** None.
**Limitations:** Tied to JavaScript initialization timing.

## .secondary-button
**Purpose:** Secondary button styling variant.
**Scope:** Applied to secondary action buttons (Button.tsx:21, ClearButton.tsx).
**Responsibility:** Alternative button appearance using host bubble colors.
**CSS Variables:** Uses --agent-host-bubble-bg-color, --agent-host-bubble-color, --agent-border-radius.
**Limitations:** Color dependency on host bubble variables creates coupling.

## .clear-button
**Purpose:** Specific styling for the clear chat button.
**Scope:** Applied to the clear session button (ClearButton.tsx:26).
**Responsibility:** Identifies clear button for specific styling.
**CSS Variables:** Inherits from .secondary-button.
**Limitations:** Currently relies on secondary button styling.

## .lite-badge
**Purpose:** Styling for the branding badge.
**Scope:** Applied to the PD branding link (LiteBadge.tsx:42).
**Responsibility:** Provides styling for the "Powered by" badge.
**CSS Variables:** None directly.
**Limitations:** Badge appearance is primarily controlled by SVG content.

## .guest-container
**Purpose:** Container for user/guest message layout.
**Scope:** Applied to guest message containers (GuestBubble.tsx:13).
**Responsibility:** Right-aligned layout for user messages with left margin.
**CSS Variables:** None.
**Limitations:** Fixed left margin (50px) might not be responsive enough.

## .fixed-input-overlay
**Purpose:** Overlay container for fixed bottom input styling.
**Scope:** Applied to fixed bottom input containers (FixedBottomInput.tsx:106).
**Responsibility:** Provides positioning context for fixed input overlays.
**CSS Variables:** None.
**Limitations:** Currently commented out overlay effects in CSS.

## .ping
**Purpose:** Pulsing animation indicator for new options.
**Scope:** Applied to notification indicators (Buttons.tsx:61).
**Responsibility:** Creates pulsing animation effect for highlighting.
**CSS Variables:** Uses --agent-button-bg-color for animation color.
**Limitations:** Animation is hardcoded, timing cannot be customized.

## .rating-icon-container
**Purpose:** Container for rating/feedback icons.
**Scope:** Applied to rating elements in forms.
**Responsibility:** Provides sizing and base styling for rating icons.
**CSS Variables:** Uses --agent-button-bg-color, --agent-host-bubble-bg-color.
**Limitations:** Icon sizing is hardcoded (42px). Color transitions are fixed timing.

## .rating-icon-container.selected
**Purpose:** Selected state for rating icons.
**Scope:** Applied when rating options are selected.
**Responsibility:** Changes fill color to indicate selection.
**CSS Variables:** Uses --agent-button-bg-color.
**Limitations:** Relies on SVG fill property, might not work with all icon types.

## .rating-icon-container:hover, .rating-icon-container:active
**Purpose:** Interactive states for rating icons.
**Scope:** Hover and active states for rating elements.
**Responsibility:** Provides brightness-based feedback for interactions.
**CSS Variables:** None.
**Limitations:** Brightness filter might not work well with all color schemes.

## .upload-progress-bar
**Purpose:** Styling for file upload progress indicators.
**Scope:** Applied to upload progress elements.
**Responsibility:** Provides progress bar appearance with color and border radius.
**CSS Variables:** Uses --agent-button-bg-color, --agent-border-radius.
**Limitations:** Progress bar color is tied to button color.

## .total-files-indicator
**Purpose:** Styling for file count indicators during uploads.
**Scope:** Applied to file count badges in upload areas.
**Responsibility:** Small badge styling with background and text color.
**CSS Variables:** Uses --agent-button-bg-color, --agent-button-color.
**Limitations:** Fixed font size (10px) and color coupling with buttons.

## .hide-scrollbar
**Purpose:** Cross-browser scrollbar hiding utility.
**Scope:** Applied to scrollable areas that should not show scrollbars (picture choices, search results).
**Responsibility:** Hides scrollbars while maintaining scroll functionality.
**CSS Variables:** None.
**Limitations:** Same as .scrollable-container, reduces accessibility.

## .no-transition
**Purpose:** Disables CSS transitions.
**Scope:** Applied to elements when transitions should be disabled (TextBubble.tsx:96).
**Responsibility:** Removes transition effects for immediate state changes.
**CSS Variables:** None.
**Limitations:** Uses !important, making it difficult to override.

## .send-icon
**Purpose:** Styling for send button icons.
**Scope:** Applied to send button SVG icons (SendButton.tsx:18).
**Responsibility:** Controls fill color for send button icons.
**CSS Variables:** Uses --agent-button-color.
**Limitations:** Color is tied to button text color.

## .slate-html-container
**Purpose:** Container class for the markdown. 
**Scope:** This class is inside the host bubble. It is inside this class that entire markdown is shown as html. So if we need to style the container which holds the html elements we can use this class. 
**Responsibility:** Styling the html container.
**Limitations:** If we set a background on this class, it will create a border effect between the parent host bubble so avoid setting a background in this class. Also adding extra paddings in this will make the host bubble have a different structure from the guest bubble, so it should be avoided.

## .slate-html-container > div
**Purpose:** Inner container for slate/markdown content.
**Scope:** Direct children of slate HTML containers.
**Responsibility:** Sets minimum height for content areas.
**CSS Variables:** None.
**Limitations:** Hardcoded min-height (24px) might not scale with font sizes.


## FUTURE CLASSES

## .agent-button.selectable
**Purpose:** Variant of agent-button for selectable button states.
**Scope:** Applied when buttons are in a selectable context.
**Responsibility:** Alternative button styling using host bubble colors.
**CSS Variables:** Uses --agent-host-bubble-color, --agent-host-bubble-bg-color, --agent-button-bg-color.
**Limitations:** Color inheritance from host bubble can cause unexpected styling conflicts.

## .agent-selectable
**Purpose:** Base styling for selectable items (choice buttons, picture choices).
**Scope:** Applied to buttons and options that can be selected (Buttons.tsx, picture choices).
**Responsibility:** Provides subtle border, background, and hover effects for interactive elements.
**CSS Variables:** Uses --agent-button-bg-color-rgb, --selectable-base-alpha for transparency calculations.
**Limitations:** Alpha calculations make it complex to override. Border opacity depends on base alpha value.

## .agent-selectable:hover
**Purpose:** Hover state for selectable items.
**Scope:** Automatic hover state for .agent-selectable elements.
**Responsibility:** Slightly darker background and border on hover.
**CSS Variables:** Uses --agent-button-bg-color-rgb, --selectable-base-alpha.
**Limitations:** Calculated alpha values make precise color control difficult.

## .agent-selectable.selected
**Purpose:** Selected state for selectable items.
**Scope:** Applied when items are in selected state.
**Responsibility:** Stronger background and border to indicate selection.
**CSS Variables:** Uses --agent-button-bg-color-rgb, --selectable-base-alpha.
**Limitations:** Similar alpha calculation issues as hover state.

## .agent-checkbox
**Purpose:** Custom checkbox styling for choice inputs.
**Scope:** Applied to checkbox elements (Checkbox.tsx:13).
**Responsibility:** Provides consistent checkbox appearance with borders and background.
**CSS Variables:** Uses --agent-button-bg-color, --agent-border-radius, --agent-checkbox-bg-color, --agent-button-color.
**Limitations:** Border radius is shared globally. Background switching on checked state.

## .agent-checkbox.checked
**Purpose:** Checked state for custom checkboxes.
**Scope:** Applied when checkbox is checked (Checkbox.tsx:14).
**Responsibility:** Changes background to button color to show checked state.
**CSS Variables:** Uses --agent-button-bg-color.
**Limitations:** Relies on button color variable, creating dependency.

## .agent-host-bubble img, .agent-host-bubble iframe, .agent-host-bubble video
**Purpose:** Media element styling within host bubbles.
**Scope:** Applied to media content in bot messages.
**Responsibility:** Consistent border radius for embedded media.
**CSS Variables:** Uses --agent-border-radius.
**Limitations:** Global border radius affects all media elements.

## .agent-picture-button
**Purpose:** Styling for picture choice buttons.
**Scope:** Applied to picture selection buttons (SinglePictureChoice.tsx:72).
**Responsibility:** Provides button styling, dimensions, and border radius for picture choices.
**CSS Variables:** Uses --agent-button-color, --agent-button-bg-color, --agent-border-radius.
**Limitations:** Fixed width (236px) might not be responsive enough for all layouts.

## .agent-picture-button > img, .agent-selectable-picture > img
**Purpose:** Image styling within picture buttons.
**Scope:** Applied to images inside picture choice buttons.
**Responsibility:** Consistent image sizing, border radius, and object-fit properties.
**CSS Variables:** Uses --agent-border-radius.
**Limitations:** Fixed dimensions (min-width: 200px, max-height: 200px) might not scale well.

## .agent-picture-button.has-svg > img, .agent-selectable-picture.has-svg > img
**Purpose:** Special styling for SVG images in picture buttons.
**Scope:** Applied when picture source is detected as SVG.
**Responsibility:** Different sizing and padding for SVG content vs regular images.
**CSS Variables:** Uses --agent-border-radius.
**Limitations:** SVG detection logic might miss edge cases.

## .agent-selectable-picture
**Purpose:** Styling for selectable picture choice items.
**Scope:** Applied to picture choices in multiple selection contexts.
**Responsibility:** Similar to agent-selectable but specifically for picture choices.
**CSS Variables:** Uses --agent-button-bg-color-rgb, --selectable-base-alpha, --agent-embed-container-color, --agent-border-radius.
**Limitations:** Same alpha calculation complexities as other selectable elements.

## .agent-selectable-picture:hover
**Purpose:** Hover state for selectable pictures.
**Scope:** Automatic hover state for picture choices.
**Responsibility:** Hover feedback for picture selection.
**CSS Variables:** Uses --agent-button-bg-color-rgb, --selectable-base-alpha.
**Limitations:** Complex alpha calculations limit customization flexibility.

## .agent-selectable-picture.selected
**Purpose:** Selected state for picture choices.
**Scope:** Applied when picture choices are selected.
**Responsibility:** Visual indication of selected picture options.
**CSS Variables:** Uses --agent-button-bg-color-rgb, --selectable-base-alpha.
**Limitations:** Same calculation-based limitations as other selected states.

## .agent-country-select
**Purpose:** Styling for country selection dropdowns.
**Scope:** Applied to country select elements.
**Responsibility:** Consistent styling for country/region selection inputs.
**CSS Variables:** Uses --agent-input-color, --agent-input-bg-color, --agent-border-radius.
**Limitations:** Inherits input styling, might need dropdown-specific styling.

## .agent-date-input
**Purpose:** Styling for date input fields.
**Scope:** Applied to date picker inputs (DateForm.tsx).
**Responsibility:** Provides styling for date input elements with forced light color scheme.
**CSS Variables:** Uses --agent-input-color, --agent-input-bg-color, --agent-border-radius.
**Limitations:** Hardcoded to light color scheme, might conflict with dark themes.

## .agent-popup-blocked-toast
**Purpose:** Styling for popup blocked notification toasts.
**Scope:** Applied to popup blocked warning messages.
**Responsibility:** Provides border radius for notification messages.
**CSS Variables:** Uses --agent-border-radius.
**Limitations:** Only sets border radius, relies on other styling for appearance.

## .agent-upload-input
**Purpose:** Styling for file upload input areas.
**Scope:** Applied to file upload zones.
**Responsibility:** Provides transition effects and border radius for upload areas.
**CSS Variables:** Uses --agent-border-radius.
**Limitations:** Transition is hardcoded, relies on state classes for full styling.

## .agent-upload-input.dragging-over
**Purpose:** Styling for file upload areas when files are dragged over.
**Scope:** Applied during drag-and-drop file operations.
**Responsibility:** Visual feedback when files are being dragged over upload zone.
**CSS Variables:** Uses --agent-button-bg-color for border.
**Limitations:** Only changes border color, might need more comprehensive drag styling.
