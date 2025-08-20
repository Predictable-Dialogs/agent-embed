 Currently the chatbot supports multiple input components as implemented in `agent-embed/js/src/components/inputs` 
 
 We need to support the custom keys for the `agent-embed/js/src/components/inputs/AutoResizingTextarea.tsx` component only. Other input components should not be affected.

This component is used in `agent-embed/js/src/components/StreamConversation/FixedBottomInput.tsx`

While implementing this feature we should try to keep the component as clean as possible by using hooks and utility functions. Global hooks are here `agent-embed/js/src/hooks` or input specific hooks can be created here `agent-embed/js/src/components/inputs`
utils are here: `agent-embed/js/src/utils`
libs are here: `agent-embed/js/src/lib`

The defaultBotProps in `agent-embed/js/src/constants.ts` would help customize this. Currently this prop takes this shape:

```json
    input: {
      "type": "text input",
      "options": {
        "type": "fixed-bottom",
        "labels": {
          "placeholder": "Whats on your mind",
          "button": "Enter"
        },
        "isLong": false
      }
     }

```

We will have to enhance this shape so it can customise the keys.

Here are some example shapes we should support - notice the `shortcuts` property

### Example A — Default (Enter sends, Shift+Enter newline)

```json
{
  "input": {
    "type": "text input",
    "options": {
      "type": "fixed-bottom",
      "labels": { "placeholder": "Whats on your mind", "button": "Send" },
      "isLong": false,
      "shortcuts": {
        "preset": "enterToSend",
        "imeSafe": true
      }
    }
  }
}
```

### Example B — Mod+Enter sends; Enter newline

```json
{
  "input": {
    "type": "text input",
    "options": {
      "type": "fixed-bottom",
      "labels": { "placeholder": "Whats on your mind", "button": "Send" },
      "isLong": false,
      "shortcuts": {
        "preset": "modEnterToSend",
        "imeSafe": true
      }
    }
  }
}
```

**Preset resolution (internal mapping in code):**

```json
{
  "keymap": {
    "submit": [["Mod","Enter"]],
    "newline": [["Enter"]]
  }
}
```

### Example C — Custom (multiple combos per action)

```json
{
  "input": {
    "type": "text input",
    "options": {
      "type": "fixed-bottom",
      "labels": { "placeholder": "Whats on your mind", "button": "Send" },
      "isLong": false,
      "shortcuts": {
        "preset": "custom",
        "keymap": {
          "submit": [["Mod","Enter"], ["Shift","Enter"]],
          "newline": [["Enter"]]
        },
        "imeSafe": true
      }
    }
  }
}
```


# Presets and fallbacks
You have two built-in presets:
- enterToSend (Enter submits, Shift+Enter newline)
- modEnterToSend (Mod+Enter submits, Enter newline)

Only one preset - enterToSend is the default - it applies when nothing is configured. 
Make enterToSend as the global fallback, with imeSafe: true.
custom is an opt-in mode that requires a keymap. If the user selects custom but leaves the keymap empty, treat it as invalid and silently fall back.

# Minimal runtime logic

* Treat **Mod** as `(evt.metaKey || evt.ctrlKey)`.
* Match `Enter` via `evt.key === "Enter"`.
* Respect `imeSafe`: ignore shortcuts while composing (use `compositionstart/ end`).

Here is an example function to match, feel free to use this or a variation of it, the goal is
- Exact matching (no surprises) - If the user configured Shift+Enter, then Mod+Shift+Enter should not trigger. The function rejects “extra” modifiers.

Enter-scoped shortcuts only - It returns false if Enter isn’t part of the combo. That keeps the widget from hijacking random shortcuts like Ctrl+B.

“Mod” abstraction - Treats Mod = Cmd or Ctrl without OS detection (evt.metaKey || evt.ctrlKey).

Separation of concerns - The matching logic lives in one small, testable function; our onKeyDown stays clean.

```ts
function matchCombo(evt: KeyboardEvent, combo: KeyToken[]) {
  const needShift = combo.includes("Shift");
  const needAlt   = combo.includes("Alt");
  const needMod   = combo.includes("Mod");
  const needEnter = combo.includes("Enter");

  if (needShift !== evt.shiftKey) return false;
  if (needAlt   !== evt.altKey)   return false;
  if (needMod   && !(evt.metaKey || evt.ctrlKey)) return false;
  if (needEnter && evt.key !== "Enter") return false;

  // If Enter is not in combo, we don't handle it (keeps scope tight to Enter-based combos)
  if (!needEnter) return false;

  // block if extra modifiers are pressed that weren't requested
  const extraMod =
    (!needShift && evt.shiftKey) ||
    (!needAlt   && evt.altKey)   ||
    (!needMod   && (evt.metaKey || evt.ctrlKey));
  if (extraMod) return false;

  return true;
}
```

Usage:

the same matchCombo fn to be used for both actions. You just pass it different combo lists: one for submit, one for newline. Because it matches exactly (no extra modifiers), a single keydown can’t satisfy both at once (e.g., Enter won’t match Shift+Enter).

* On `keydown`, check `submit` combos first; if matched and not composing, `preventDefault()` and send.
* Else check `newline` combos; if matched, insert `\n` at caret (or let browser default handle `Enter` when appropriate).
