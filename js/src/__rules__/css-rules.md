# CSS RULES

- We aim for "world-class" not only "good".
- styling architecture should not mix concerns or repeat itself.

## WHATS WORLD CLASS 
* **Hybrid layers:** Define semantic layer tokens as **CSS variables**, map them to **Tailwind** for ergonomics and runtime overrides (embeds/hosts can adjust).
* **Design tokens in Tailwind config** with sensible fallbacks so the whole app reuses the same scale (colors, spacing, radii, layers).
* **Safe area support** via tokens/utilities (e.g., `pb-[max(3rem,calc(env(safe-area-inset-bottom)+2.5rem))]`) or a `--space-safe-b` token.
* **Single source of truth:** Use classes/tokens for layout; **reserve inline `style`** for truly runtime-computed values only.
* **Arbitrary utilities** for one-offs when extending the theme isn’t warranted (e.g., `bg-[var(--brand-surface)]`, `z-[var(--layer-overlay)]`).
* **Variant-driven classes** (e.g., `classList` / `cva`) to switch styling by props/context without branching layout in JS.

## WHAT IS NOT WORLD CLASS
* **Two sources of truth** for layout (e.g., `class="fixed bottom-0 ..." + style="position:fixed; bottom:0"`).
* **Inconsistent/underused Tailwind** (magic numbers, ad-hoc z-indexes, ignoring tokens).
* **Magic numbers** for layers/spacing instead of semantic tokens (`z-[51]` without a token).
* **Redundant utilities** (e.g., `my-2 ml-2 mr-2` instead of `my-2 mx-2`; `left-0 right-0 bottom-0` instead of `inset-x-0 bottom-0`).
* **Background conflicts** (multiple elements setting backgrounds without clear hierarchy).

## REFACTOR SAFETY CHECKS
* **Semantic class preservation**: When converting inline styles to classes, verify existing semantic classes (like `agent-input`, `agent-button`) aren't being duplicated or conflicted.
* **Background hierarchy**: Only one element in a component tree should own the primary background - avoid setting backgrounds on both container and child unless intentionally layered.
* **API override points**: Identify which CSS variables can be overridden by APIs/themes and ensure refactoring doesn't create conflicts with those override points.

## BEFORE REFACTORING
* **Audit existing classes**: Search for semantic classes (`agent-*`) that already handle styling concerns.
* **Map CSS variable usage**: Understand which variables are API-configurable vs internal.
* **Test with overrides**: Verify the refactor works when theme variables are dynamically changed.