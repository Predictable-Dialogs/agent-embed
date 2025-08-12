# Fixed Bottom Input Feature Implementation Plan

Based on the comprehensive analysis provided, here's the step-by-step implementation plan for the fixed bottom input feature:

## Phase 1: Schema & Type System Updates

### 1. Update TypeScript Schemas
- **File**: `js/src/schemas/features/blocks/inputs/text.ts:13-19`
- **Change**: Extend `textInputOptionsSchema` to include optional `type` field
- **Implementation**:
  ```typescript
  textInputOptionsSchema.merge(z.object({
    type: z.enum(['standard', 'fixed-bottom']).optional().default('standard')
  }))
  ```

### 2. Update Bot Component Props
- **File**: `js/src/components/Bot.tsx:36-37`
- **Change**: Ensure proper merging of new input type in `mergePropsWithApiData`
- **Verification**: Test backward compatibility with existing inputs

## Phase 2: Component Architecture

### 3. Create FixedBottomInput Component
- **New File**: `js/src/components/StreamConversation/FixedBottomInput.tsx`
- **Features**:
  - Fixed positioning at bottom of viewport
  - Proper z-index layering (above messages)
  - Safe area inset handling for mobile
  - Keyboard avoidance for mobile
  - Reuse existing TextInput logic internally

### 4. Update StreamConversation Layout
- **File**: `js/src/components/StreamConversation/StreamConversation.tsx`
- **Changes**:
  - Add fixed input container after main messages container
  - Update state management for fixed vs inline inputs
  - Handle enable/disable states during streaming
  - Preserve existing file attachment logic

## Phase 3: Conditional Rendering Logic

### 5. Modify ChatChunk Conditional Rendering
- **File**: `js/src/components/StreamConversation/ChatChunk.tsx:79-89`
- **Change**: Add condition to prevent inline input when type is 'fixed-bottom'
- **Logic**: 
  ```typescript
  {props.input && 
   props.input.options?.type !== 'fixed-bottom' && 
   (props.message.id === props.displayIndex) && (
     <StreamInput ... />
  )}
  ```

### 6. Update Display Index Logic
- **File**: `js/src/components/StreamConversation/StreamConversation.tsx:79,128`
- **Change**: Separate display logic for fixed vs inline inputs
- **New State**: Track fixed input enabled/disabled independently from displayIndex

## Phase 4: Styling & Layout

### 7. Implement Fixed Positioning CSS
- **Styling Requirements**:
  - `position: fixed; bottom: 0; left: 0; right: 0`
  - Proper z-index above message content
  - Remove max-width constraint (350px) for fixed inputs
  - Background and border styling for visual separation

### 8. Mobile Compatibility
- **iOS Safari Fixes**:
  - Use `env(safe-area-inset-bottom)` for bottom spacing
  - Handle virtual keyboard viewport changes
  - Prevent zoom with `font-size: 16px`
- **Android Compatibility**:
  - Handle virtual keyboard overlay
  - Proper touch targets (44px minimum)

## Phase 5: Widget Integration

### 9. Bubble Widget Compatibility
- **File**: `js/src/features/bubble/`
- **Testing**: Ensure fixed input works within bubble container
- **Positioning**: May need widget-specific positioning adjustments

### 10. Standard Widget Compatibility
- **File**: `js/src/features/standard/`
- **Testing**: Full-width fixed input in standard embed

### 11. Popup Widget Compatibility
- **File**: `js/src/features/popup/`
- **Positioning**: Fixed relative to popup modal, not viewport

## Phase 6: State Management Updates

### 12. Update Streaming Handlers
- **File**: `js/src/components/StreamConversation/StreamConversation.tsx:128,137-140`
- **Changes**:
  - Disable fixed input during streaming instead of hiding
  - Show loading state in fixed input
  - Re-enable after response completion

### 13. Form Reset Logic
- **Preserve**: Existing form reset after submission
- **Update**: Handle fixed input value clearing
- **Focus Management**: Auto-focus behavior for fixed inputs

## Phase 7: Error Handling & Edge Cases

### 14. Fallback Mechanisms
- **Default Behavior**: Fall back to inline input if fixed positioning fails
- **Feature Detection**: Check for CSS support
- **Accessibility**: Maintain tab order and screen reader compatibility

### 15. Validation & Testing
- **Unit Tests**: Component rendering and state management
- **Integration Tests**: Cross-widget functionality
- **Mobile Testing**: iOS Safari, Chrome Mobile, various screen sizes
- **Accessibility Testing**: Screen readers, keyboard navigation

## Phase 8: Performance & Polish

### 16. Performance Optimizations
- **Lazy Loading**: Only render fixed input when type is 'fixed-bottom'
- **Event Listeners**: Efficient keyboard/resize handlers
- **Memory Management**: Proper cleanup on unmount

### 17. Documentation Updates
- **API Documentation**: Update TextInputBlock type definitions
- **Usage Examples**: Show both inline and fixed-bottom configurations
- **Migration Guide**: For existing implementations

## Implementation Order & Risk Assessment

### Low Risk (Implement First):
1. Schema updates with backward compatibility
2. Component creation without integration
3. Basic conditional rendering

### Medium Risk (Careful Testing):
4. StreamConversation integration
5. Cross-widget compatibility
6. State management updates

### High Risk (Thorough Testing Required):
7. Mobile CSS and keyboard handling
8. Z-index and positioning edge cases
9. Performance with long conversations

## Rollback Strategy

- **Feature Flag**: Environment variable to disable fixed-bottom mode
- **Gradual Rollout**: Start with single widget type
- **Backward Compatibility**: Ensure existing inputs continue working unchanged

## Summary

This implementation plan provides a systematic approach to adding the fixed bottom input feature while maintaining backward compatibility and ensuring robust mobile support across all three embed widget types. The phased approach allows for iterative testing and reduces risk of breaking existing functionality.