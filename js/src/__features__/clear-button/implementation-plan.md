# Clear Button Implementation Plan

## Overview
Add a clear/reset button that appears at the bottom right of the chat widget container, positioned symmetrically opposite to the LiteBadge. The button will clear localStorage session data and reinitialize the bot efficiently.

## Architecture Analysis

Based on code analysis:
- **LiteBadge Positioning**: Uses `#lite-badge` CSS with absolute positioning: `bottom: 16px !important; left: max(16px, calc(50% - 400px + 16px)) !important`
- **Button Component**: Located at `js/src/components/Button.tsx`, supports `variant="secondary"` 
- **localStorage Operations**: Handled via `useAgentStorage` hook with `clearSession()` method
- **Bot Reinitialization**: `initializeBot()` function in `Bot.tsx:43` handles clean initialization

## Implementation Steps

### 1. Create ClearButton Component
**File**: `js/src/components/ClearButton.tsx`

- Create a new component wrapping the existing `Button` component
- Use `variant="secondary"` for consistent styling with requirement
- Make button slightly smaller than standard secondary button for aesthetic appeal
- Add clear/reset icon (X or refresh icon)
- Accept `onClick` prop for handling clear action
- Include semantic class names for theming compatibility

### 2. Update Bot Component Structure
**File**: `js/src/components/Bot.tsx`

**Changes needed:**
- Add clear handler function `handleClearSession()` in `BotContent` component
- Function should:
  1. Call `storage.clearSession()` to clear localStorage
  2. Call `setPersistedMessages([])` to clear persisted messages
  3. Call `initializeBot()` to reinitialize
  4. Call `setIsInitialized(true)` after reinitialization completes
- Import and render `ClearButton` component in `BotContent` at `Bot.tsx:271`
- Position it conditionally (same logic as LiteBadge) when branding is enabled

### 3. Add CSS Styling
**File**: `js/src/assets/immutable.css`

Add new CSS rule for clear button positioning:
```css
#clear-button {
  position: absolute !important;
  padding: 4px 8px !important;
  background-color: var(--agent-host-bubble-bg-color) !important;
  z-index: 52 !important;
  border-radius: var(--agent-border-radius) !important;
  color: var(--agent-host-bubble-color) !important;
  font-size: 12px !important;
  line-height: 16px !important;
  font-weight: 500 !important;
  border: 1px solid var(--agent-host-bubble-bg-color) !important;
  opacity: 1 !important;
  visibility: visible !important;
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
  /* Position symmetrically opposite to LiteBadge */
  bottom: 16px !important;
  left: auto !important;
  right: max(16px, calc(50% - 400px + 16px)) !important;
  top: auto !important;
  transition: all 0.2s ease-in-out !important;
  filter: brightness(1) !important;
}

#clear-button:hover {
  filter: brightness(0.9) !important;
}

#clear-button:active {
  filter: brightness(0.75) !important;
}
```

**Design Principles Applied:**
- Uses CSS variables for theming compatibility (`--agent-host-bubble-bg-color`, `--agent-host-bubble-color`)
- Follows semantic layer tokens (`z-index: 52` matches LiteBadge)  
- Uses `--agent-border-radius` token for consistency
- Implements filter brightness effects matching existing Button component behavior
- Avoids hardcoded colors per CSS rules
- Matches secondary button styling (same colors as `.secondary-button` class)

### 4. Update Type Definitions (if needed)
**File**: `js/src/components/Button.tsx`

No changes needed - existing Button component already supports all required props.

## Files Requiring Modifications

1. **`js/src/components/ClearButton.tsx`** (NEW)
   - New component wrapping Button with clear functionality
   
2. **`js/src/components/Bot.tsx`** (MODIFY)
   - Add `handleClearSession` function in `BotContent` 
   - Import and render `ClearButton` component
   - Position it conditionally based on branding settings

3. **`js/src/assets/immutable.css`** (MODIFY)
   - Add `#clear-button` CSS rules for positioning and styling

## Implementation Rules Compliance

Following `js/src/__rules__/implementation-rules.md`:
- ✅ Improves maintainability by reusing existing Button component
- ✅ No performance impact - minimal additional rendering
- ✅ Existing tests will pass - no modifications to test files
- ✅ Will run `npm run build` to ensure compilation works
- ✅ No test creation/modification as per rules

## UI Testing Plan

**Testing Environment Setup:**
1. Build the code: `npm run build` 
2. Use Python HTTP server (already running)
3. Use Playwright MCP server for UI testing
4. Test with fixtures in `js/src/__tests__/fixtures/`

**UI Test Scenarios:**
1. **Positioning Test**: Open `http://localhost:8000/pd/agent-embed/js/src/__tests__/fixtures/lb-lh-std-input.html`
   - Verify clear button appears at bottom right, symmetrical to LiteBadge
   - Verify 16px margin from container edges
   - Verify proper z-index layering

2. **Styling Test**: 
   - Verify button uses secondary variant styling but slightly smaller
   - Verify hover states work correctly
   - Verify theme variables apply correctly
   - Test responsive behavior at different container widths

3. **Functionality Test**:
   - Start a conversation to generate session data
   - Click clear button
   - Verify chat clears and reinitializes cleanly
   - Verify localStorage is cleared
   - Verify no error states during reinitialization

4. **Integration Test**:
   - Test with branding disabled (button should not appear)
   - Test with branding enabled (button should appear)
   - Verify clear button doesn't interfere with existing functionality

## Unit Testing Plan

**Test Location**: `js/src/__tests__/components/ClearButton/`

Following `js/src/__rules__/test-rules.md`:
- Write tests AFTER UI testing and successful build
- Use Vitest with @solidjs/testing-library
- Use existing test utilities from `test-utils.tsx`
- Mock `useAgentStorage` hook for localStorage operations
- Use real component behavior, minimal mocking

**Test Cases:**
1. **Component Rendering**:
   - Renders clear button with correct styling
   - Shows appropriate icon/text
   - Applies correct CSS classes

2. **Clear Functionality**:
   - Calls `clearSession()` when clicked
   - Calls reinitialization functions in correct sequence
   - Handles edge cases (multiple rapid clicks, already cleared state)

3. **Integration with Button Component**:
   - Passes through button props correctly
   - Maintains button accessibility features
   - Supports disabled states if needed

**Test Data:**
- Use localStorage mock data from `js/src/__tests__/data/localStorage.md`
- Use `getInitialChatReplyQuery` response from `js/src/__tests__/data/getInitialChatReplyQuery.json`

## Quality Assurance Checklist

**Pre-Implementation:**
- [ ] All implementation rules read and understood
- [ ] CSS rules reviewed for styling consistency
- [ ] Test rules reviewed for testing approach

**During Implementation:**
- [ ] Follow semantic CSS variable usage
- [ ] Maintain existing component API compatibility
- [ ] Preserve accessibility features
- [ ] Use existing storage patterns

**Post-Implementation:**
- [ ] Run `npm run build` successfully
- [ ] UI testing with Playwright MCP server completed
- [ ] Unit tests written and passing
- [ ] All existing tests still pass
- [ ] Visual regression testing completed
- [ ] Cross-widget compatibility verified (Standard, Bubble, Popup)

## Risk Mitigation

**Potential Issues:**
1. **Positioning Conflicts**: Clear button might overlap with other elements
   - Mitigation: Use same positioning logic as LiteBadge but mirrored
   
2. **Reinitialization Errors**: Bot might fail to reinitialize cleanly
   - Mitigation: Reuse existing `handleSessionExpired` pattern proven to work.

3. **Theme Compatibility**: Button styling might not adapt to all themes  
   - Mitigation: Use CSS variables and alpha patterns like existing components

4. **Performance**: Additional component might impact render performance
   - Mitigation: Minimal overhead, conditionally rendered like LiteBadge

## Success Criteria

1. ✅ Clear button appears in correct position (bottom right, symmetrical to LiteBadge)
2. ✅ Button styling matches secondary variant but appropriately sized
3. ✅ Click clears localStorage and reinitializes bot without errors
4. ✅ Functionality works across all embed types (Standard, Bubble, Popup)  
5. ✅ All existing tests pass
6. ✅ UI tests confirm proper positioning and styling
7. ✅ Build process completes successfully
8. ✅ No visual regressions in other components