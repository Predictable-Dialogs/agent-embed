import { describe, it, expect } from 'vitest';
import { 
  matchCombo, 
  resolveShortcutsToKeymap, 
  resolvePresetToKeymap,
  createDefaultShortcuts 
} from '@/utils/keyboardUtils';
import type { KeyCombo, Shortcuts } from '@/schemas/features/blocks/inputs/text';

// Helper function for creating mock keyboard events
const createKeyboardEvent = (overrides: Partial<KeyboardEvent> = {}): KeyboardEvent => ({
  key: 'Enter',
  shiftKey: false,
  altKey: false,
  metaKey: false,
  ctrlKey: false,
  ...overrides,
} as KeyboardEvent);

describe('keyboardUtils', () => {
  describe('matchCombo', () => {

    it('should match Enter combo correctly', () => {
      const combo: KeyCombo = ['Enter'];
      const event = createKeyboardEvent();
      
      expect(matchCombo(event, combo)).toBe(true);
    });

    it('should match Shift+Enter combo correctly', () => {
      const combo: KeyCombo = ['Shift', 'Enter'];
      const event = createKeyboardEvent({ shiftKey: true });
      
      expect(matchCombo(event, combo)).toBe(true);
    });

    it('should match Mod+Enter combo with Ctrl', () => {
      const combo: KeyCombo = ['Mod', 'Enter'];
      const event = createKeyboardEvent({ ctrlKey: true });
      
      expect(matchCombo(event, combo)).toBe(true);
    });

    it('should match Mod+Enter combo with Meta', () => {
      const combo: KeyCombo = ['Mod', 'Enter'];
      const event = createKeyboardEvent({ metaKey: true });
      
      expect(matchCombo(event, combo)).toBe(true);
    });

    it('should match Alt+Enter combo correctly', () => {
      const combo: KeyCombo = ['Alt', 'Enter'];
      const event = createKeyboardEvent({ altKey: true });
      
      expect(matchCombo(event, combo)).toBe(true);
    });

    it('should NOT match when extra modifiers are pressed', () => {
      const combo: KeyCombo = ['Enter'];
      const event = createKeyboardEvent({ shiftKey: true });
      
      expect(matchCombo(event, combo)).toBe(false);
    });

    it('should NOT match when required modifier is missing', () => {
      const combo: KeyCombo = ['Shift', 'Enter'];
      const event = createKeyboardEvent(); // no shift key
      
      expect(matchCombo(event, combo)).toBe(false);
    });

    it('should NOT match non-Enter keys', () => {
      const combo: KeyCombo = ['Enter'];
      const event = createKeyboardEvent({ key: 'Space' });
      
      expect(matchCombo(event, combo)).toBe(false);
    });

    it('should NOT match combos without Enter', () => {
      const combo: KeyCombo = ['Shift'] as KeyCombo; // Invalid but testing robustness
      const event = createKeyboardEvent({ shiftKey: true });
      
      expect(matchCombo(event, combo)).toBe(false);
    });

    it('should require exact modifier match - no extra modifiers allowed', () => {
      const combo: KeyCombo = ['Mod', 'Enter'];
      const event = createKeyboardEvent({ 
        ctrlKey: true,
        shiftKey: true // extra modifier
      });
      
      expect(matchCombo(event, combo)).toBe(false);
    });
  });

  describe('resolvePresetToKeymap', () => {
    it('should resolve enterToSend preset correctly', () => {
      const keymap = resolvePresetToKeymap('enterToSend');
      
      expect(keymap.submit).toEqual([['Enter']]);
      expect(keymap.newline).toEqual([['Shift', 'Enter']]);
    });

    it('should resolve modEnterToSend preset correctly', () => {
      const keymap = resolvePresetToKeymap('modEnterToSend');
      
      expect(keymap.submit).toEqual([['Mod', 'Enter']]);
      expect(keymap.newline).toEqual([['Enter']]);
    });

    it('should resolve custom preset to fallback', () => {
      const keymap = resolvePresetToKeymap('custom');
      
      // Custom should fallback to enterToSend behavior
      expect(keymap.submit).toEqual([['Enter']]);
      expect(keymap.newline).toEqual([['Shift', 'Enter']]);
    });

    it('should handle invalid preset with fallback', () => {
      const keymap = resolvePresetToKeymap('invalid' as any);
      
      expect(keymap.submit).toEqual([['Enter']]);
      expect(keymap.newline).toEqual([['Shift', 'Enter']]);
    });
  });

  describe('resolveShortcutsToKeymap', () => {
    it('should use default enterToSend when no shortcuts provided', () => {
      const keymap = resolveShortcutsToKeymap();
      
      expect(keymap.submit).toEqual([['Enter']]);
      expect(keymap.newline).toEqual([['Shift', 'Enter']]);
    });

    it('should resolve enterToSend preset', () => {
      const shortcuts: Shortcuts = { preset: 'enterToSend', imeSafe: true };
      const keymap = resolveShortcutsToKeymap(shortcuts);
      
      expect(keymap.submit).toEqual([['Enter']]);
      expect(keymap.newline).toEqual([['Shift', 'Enter']]);
    });

    it('should resolve modEnterToSend preset', () => {
      const shortcuts: Shortcuts = { preset: 'modEnterToSend', imeSafe: true };
      const keymap = resolveShortcutsToKeymap(shortcuts);
      
      expect(keymap.submit).toEqual([['Mod', 'Enter']]);
      expect(keymap.newline).toEqual([['Enter']]);
    });

    it('should use custom keymap when provided', () => {
      const shortcuts: Shortcuts = { 
        preset: 'custom',
        keymap: {
          submit: [['Mod', 'Enter'], ['Shift', 'Enter']],
          newline: [['Enter']]
        },
        imeSafe: true 
      };
      const keymap = resolveShortcutsToKeymap(shortcuts);
      
      expect(keymap.submit).toEqual([['Mod', 'Enter'], ['Shift', 'Enter']]);
      expect(keymap.newline).toEqual([['Enter']]);
    });

    it('should fallback when custom preset has no keymap', () => {
      const shortcuts: Shortcuts = { preset: 'custom', imeSafe: true };
      const keymap = resolveShortcutsToKeymap(shortcuts);
      
      // Should fallback to enterToSend
      expect(keymap.submit).toEqual([['Enter']]);
      expect(keymap.newline).toEqual([['Shift', 'Enter']]);
    });
  });

  describe('createDefaultShortcuts', () => {
    it('should create default shortcuts with enterToSend preset', () => {
      const defaults = createDefaultShortcuts();
      
      expect(defaults.preset).toBe('enterToSend');
      expect(defaults.imeSafe).toBe(true);
    });

    it('should return consistent defaults', () => {
      const defaults1 = createDefaultShortcuts();
      const defaults2 = createDefaultShortcuts();
      
      expect(defaults1).toEqual(defaults2);
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle complex custom keymap with multiple submit options', () => {
      const shortcuts: Shortcuts = {
        preset: 'custom',
        keymap: {
          submit: [['Enter'], ['Mod', 'Enter'], ['Alt', 'Enter']],
          newline: [['Shift', 'Enter']]
        },
        imeSafe: true
      };
      
      const keymap = resolveShortcutsToKeymap(shortcuts);
      
      // Should preserve all submit options
      expect(keymap.submit).toHaveLength(3);
      expect(keymap.submit).toContainEqual(['Enter']);
      expect(keymap.submit).toContainEqual(['Mod', 'Enter']);
      expect(keymap.submit).toContainEqual(['Alt', 'Enter']);
    });

    it('should work with matchCombo for resolved keymaps', () => {
      const shortcuts: Shortcuts = { preset: 'modEnterToSend', imeSafe: true };
      const keymap = resolveShortcutsToKeymap(shortcuts);
      
      // Test that resolved keymap works with matchCombo
      const modEnterEvent = createKeyboardEvent({ ctrlKey: true });
      const enterEvent = createKeyboardEvent();
      
      expect(matchCombo(modEnterEvent, keymap.submit[0])).toBe(true);
      expect(matchCombo(enterEvent, keymap.newline[0])).toBe(true);
      
      // Should not cross-match
      expect(matchCombo(enterEvent, keymap.submit[0])).toBe(false);
      expect(matchCombo(modEnterEvent, keymap.newline[0])).toBe(false);
    });
  });
});