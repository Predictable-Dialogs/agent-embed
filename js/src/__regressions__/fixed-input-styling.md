# Fixed Input Styling Regression Tests

## Issue Summary

The Standard widget's FixedBottomInput component uses `fixed` positioning that causes styling issues when the widget is constrained to specific dimensions. This works fine for Bubble/Popup widgets (which are viewport overlays) but breaks Standard widgets (which are container-bound).

## Root Cause Analysis

**Location**: `FixedBottomInput.tsx:92`
```tsx
<div class="fixed bottom-0 left-0 right-0 agent-fixed-input">
```

**Problems**:
1. **Fixed positioning** always relates to viewport, not widget container
2. **`left-0 right-0`** spans entire viewport width, ignoring widget boundaries  
3. **`bottom-0`** positions at viewport bottom, not widget bottom
4. **High z-index (51)** is appropriate for viewport overlays, not container elements
5. **No padding inheritance** from widget's `px-3` chat container padding

## Test Coverage

Created comprehensive regression tests in:
- `/src/__tests__/regressions/standard-widget-fixed-input-positioning.test.tsx` (integration-level)
- `/src/__tests__/regressions/fixed-bottom-input-positioning.test.tsx` (component-level)

## Test Results

✅ **Tests correctly identify the issue** - All positioning-related tests fail as expected
✅ **Tests are meaningful** - They verify specific broken behaviors
✅ **Tests will catch regressions** - They will pass when the bug is fixed

### Key Test Failures (Expected)

1. **Boundary Violations**: Input extends beyond constrained widget dimensions
2. **Position Context**: Uses `fixed` instead of `absolute` positioning
3. **Viewport vs Container**: Positions relative to viewport instead of widget
4. **Z-index Inappropriateness**: Uses viewport-level z-index (51) for container element

## Widget Type Behavior

| Widget Type | Current Status | Expected Behavior |
|-------------|----------------|-------------------|
| **Standard** | ❌ Broken | Should use `absolute` positioning within widget bounds |
| **Bubble** | ✅ Working | Correctly uses `fixed` positioning for overlay |  
| **Popup** | ✅ Working | Correctly uses `fixed` positioning for modal |

## Example Issue Scenarios

### Card Layout Widget
```html
<agent-standard style="width: 500px; max-width: 500px; height: 700px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin: 0 auto;"></agent-standard>
```
**Issue**: Input spans full browser width, not 500px card width

### Sidebar Widget  
```html
<agent-standard style="width: 350px; height: 100vh; border-left: 1px solid #e0e0e0;"></agent-standard>
```
**Issue**: Input spans full browser width, not 350px sidebar width

### Responsive Widget
```html
<agent-standard style="width: 100%; max-width: 800px; height: 600px;"></agent-standard>
```
**Issue**: Input doesn't respect max-width constraint or padding consistency

## Fix Requirements

1. **Context Detection**: Differentiate Standard vs Bubble/Popup widget contexts
2. **Conditional Positioning**: Use `absolute` for Standard, keep `fixed` for Bubble/Popup
3. **Container Boundaries**: Respect Standard widget's width/padding constraints
4. **Z-index Adjustment**: Use appropriate z-index for widget-contained elements
5. **Padding Consistency**: Match chat container's `px-3` padding in Standard widgets

## Next Steps

1. ✅ **Analysis Complete** - Root cause identified and documented
2. ✅ **Tests Created** - Comprehensive regression test coverage  
3. 🔄 **Implementation** - Fix the positioning logic in FixedBottomInput
4. 🔄 **Verification** - Ensure all tests pass after fix
5. 🔄 **Integration** - Test across all widget types and scenarios