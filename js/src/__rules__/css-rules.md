# CSS RULES

## 1) Principles
1.1 Aim for **world-class**, not merely “good.”  
1.2 Keep styling architecture **single-concern** and **DRY** (don’t repeat yourself).  
1.3 Favor **simplicity and readability** across the codebase.
1.4 Start with architecture, not adjustments. E.g: Choose the right positioning reference element before tweaking values; fix the model, then the numbers.

## 2) What “World-Class” Looks Like
2.1 **Hybrid layers:** Define semantic-layer tokens as **CSS variables**, then map them to **Tailwind** for ergonomics and runtime overrides (so embeds/hosts can adjust).  
2.2 **Design tokens in Tailwind config:** Centralize scales (colors, spacing, radii, layers) with sensible fallbacks so the whole app reuses the same system.  
2.3 **Safe-area support:** Provide tokens/utilities (e.g., `pb-[max(3rem,calc(env(safe-area-inset-bottom)+2.5rem))]`) or a `--space-safe-b` token.  
2.4 **Single source of truth for layout:** Use classes/tokens; **reserve inline `style`** for truly runtime-computed values only.  
2.5 **Arbitrary utilities for one-offs:** When extending the theme isn’t warranted, use targeted utilities (e.g., `bg-[var(--brand-surface)]`, `z-[var(--layer-overlay)]`).  
2.6 **Variant-driven classes:**  
  • Use `class` for always-on Tailwind utilities.  
  • Use `classList` to switch styling by props/context.  
  • Use `cva` for reusable components with variants (e.g., size, intent, tone).  
  • Mix intentionally: `cva` for design variants; `classList` for transient UI state (open, loading, dragging).

## 3) Anti-Patterns (Not World-Class)
3.1 **Two sources of truth** for layout (e.g., `class="fixed bottom-0 …"` **and** `style="position:fixed; bottom:0"`).  
3.2 **Inconsistent/underused Tailwind** (magic numbers, ad-hoc z-indexes, ignoring tokens).  
3.3 **Magic numbers** for layers/spacing instead of semantic tokens (e.g., `z-[51]` without a token).  
3.4 **Redundant utilities** (e.g., `my-2 ml-2 mr-2` instead of `my-2 mx-2`; `left-0 right-0 bottom-0` instead of `inset-x-0 bottom-0`).  
3.5 **Background conflicts** (multiple elements setting backgrounds without a clear hierarchy).

## 4) Refactor Safety Checks
4.1 **Preserve semantic classes:** When converting inline styles to classes, ensure existing semantic classes (e.g., `agent-input`, `agent-button`) aren’t duplicated or conflicted.  
4.2 **Background hierarchy:** Only one element in a component tree should own the **primary background**—avoid setting backgrounds on both container and child unless intentionally layered.  
4.3 **API override points:** Identify which CSS variables are theme/API-overridable and make sure refactors don’t block or conflict with those override points.

## 5) Before Refactoring (Prep)
5.1 **Audit existing classes:** Search for semantic classes (`agent-*`) that already cover styling concerns.  
5.2 **Map CSS variable usage:** Distinguish API-configurable variables from internal ones.  
5.3 **Test with overrides:** Verify the refactor under dynamic theme variable changes.

## 6) Color & Theming

6.1 **Never use hardcoded colors:** Always use CSS variables for colors, especially `rgba()` values.  
6.2 **Theme-aware styling:** Use existing color tokens (`--agent-button-bg-color-rgb`, `--agent-input-color`, etc.) with semantic alpha values (`--selectable-base-alpha + 0.15`).  
6.3 **Consistent opacity patterns:** Follow existing alpha patterns in the codebase (e.g., `calc(var(--selectable-base-alpha) + 0.15)` for subtle elements, `+ 0.25` for hover states).  
6.4 **Anti-pattern:** Never use hardcoded colors - they won't adapt to theme changes or user customizations.

## 7) Positioning & Pseudo-Elements

7.1 **Pseudo-elements anchor:** Always position `::before`/`::after` relative to the element whose **boundaries matter** for your visual design. Ensure that element establishes the containing block (e.g., apply `relative`), then position the pseudo-element (`absolute/fixed`) with semantic tokens.
7.2 **Positioning context checklist (analyze first):**
• What element is the positioning **relative to**?
• What **padding/margins** exist between the reference and the target?
• Is there a **closer/better reference** element nearer to the target that reduces offsets and complexity?


The CSS variables are in the file: `agent-embed/js/src/assets/index.css`