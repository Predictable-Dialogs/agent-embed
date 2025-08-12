## NEW FEATURE : FIXED BOTTOM INPUT

Thoroughly understand and document how input is shown in the current chatbot. Currently the chatbot supports either a single line input or a multi line input. The props.input or the API provide this value initially in the Bot.tsx file which is then sent to the child components. We need this understanding so that we can add a third input type (fixed at the bottom).
A user using the input prop or the API would be able to in addition to the existing type, opt for the fixed input at the bottom.

The current implementation hides the input when a message is being streamed, with the fixed bottom input, the input should accept text but the submit should be disabled till streaming is completed.

## Context
- Current single-line input (reference image): `js/src/__features__/Fixed-Input/single-line.png`
- Current multi-line input (reference image): `js/src/__features__/Fixed-Input/example-multiline.png`
- Desired new variant (fixed at bottom): `js/src/__features__/Fixed-Input/example.png`
- And when a user starts entering multiple lines, the initial single line input expands to multi-line and also has a scroll bar, here is an example image: `js/src/__features__/Fixed-Input/example-multiline.png`

## Primary Source Files
1.  `js/src/components/Bot.tsx`
2.  `js/src/components/StreamConversation/StreamConversation.tsx`

## Secondary Source Files
1.  `js/src/components/StreamConversation/ChatChunk.tsx`
2.   `js/src/components/StreamConversation/StreamInput.tsx`


## Deliverables (be specific and cite files/lines)
1. **File & dependency map**
   - List all files that define or directly support the current fixed input. For each file, give a one-line purpose.
   - Draw the component tree for the feature (parent → children). Show where state and effects live.
2. **Public API**
   - Enumerate the component(s) props, default values, and types; events/callbacks; context; and any CSS vars/classes they rely on.
   - Provide at least one minimal usage snippet copied from the codebase or stories, with path and line numbers.
3. **Behavior & state**
   - Describe how the single-line vs multi-line mode is chosen today (props, API).
4. **Styling & layout**
   - List key Tailwind classes/selectors and CSS vars.
   - Document positioning logic (relative/absolute/fixed), z-index layers, max-heights, paddings, safe-area insets, and mobile vs desktop differences.
5. **Accessibility & UX**
   - Tab/focus order, ARIA roles/attributes, label/description/error patterns.
   - Keyboard behaviors (Enter to submit, Shift+Enter for newline, Esc to blur/close, IME handling).
   - Screen reader announcements and focus trapping, if any.
6. **Side effects & integrations**
   - Where submission happens; validation; mention parsing/sanitization; undo/redo.
   - Any global listeners (scroll/resize), portals, or overlays.
8. **Extension points & constraints**
   - Identify the minimum set of places we’d need to touch to add a **third type: bottom-fixed input**.
   - Call out assumptions and constraints (e.g., container expects to fill width).
   - List risks (keyboard overlap on mobile, iOS Safari viewport units, safe-area, virtual keyboard).
9. **State machine sketch**
   - Provide a small state diagram or bullet version: `Idle → Typing(single) → Expanding → Typing(multi) → Scrollable` and transitions/triggers.
10. **Open questions**
   - Anything unclear in code; propose where to confirm.

## Output format
- Keep it concise but complete (aim for 1–2 pages).
- Use this structure with headings matching the Deliverables list.
- For every claim, include inline citations to paths and line ranges like: `(js/src/components/Bot.tsx:123–164)`.
- If relevant, include short code excerpts (≤ 10 lines) to illustrate key logic.

## Notes for the new variant (do NOT implement yet)
- While documenting, add the layout/styling hooks which would be reused vs new.
- Note any abstractions that would benefit from refactor (e.g., autosize hook, maxHeight calculation, scrollbar styling).

