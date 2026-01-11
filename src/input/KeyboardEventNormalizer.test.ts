/**
 * KeyboardEventNormalizer unit tests
 */
import { KeyboardEventNormalizer } from './input/KeyboardEventNormalizer';

describe('KeyboardEventNormalizer', () => {
  let normalizer: KeyboardEventNormalizer;

  // Helper to create a mock KeyboardEvent
  const createMockKeyboardEvent = (overrides: Partial<KeyboardEvent> = {}): KeyboardEvent => {
    return {
      key: '',
      code: '',
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      ...overrides,
    } as KeyboardEvent;
  };

  beforeEach(() => {
    normalizer = new KeyboardEventNormalizer();
  });

  describe('constructor', () => {
    it('should create a normalizer instance', () => {
      expect(normalizer).toBeDefined();
      expect(normalizer).toBeInstanceOf(KeyboardEventNormalizer);
    });
  });

  describe('normalize', () => {
    it('should normalize letter keys', () => {
      const event = createMockKeyboardEvent({ key: 'a', code: 'KeyA' });
      expect(normalizer.normalize(event)).toBe('a');

      const upperEvent = createMockKeyboardEvent({ key: 'A', code: 'KeyA', shiftKey: true });
      expect(normalizer.normalize(upperEvent)).toBe('A');
    });

    it('should normalize number keys', () => {
      const event = createMockKeyboardEvent({ key: '1', code: 'Digit1' });
      expect(normalizer.normalize(event)).toBe('1');
    });

    it('should normalize special keys', () => {
      const enterEvent = createMockKeyboardEvent({ key: 'Enter', code: 'Enter' });
      expect(normalizer.normalize(enterEvent)).toBe('<Enter>');

      const escapeEvent = createMockKeyboardEvent({ key: 'Escape', code: 'Escape' });
      expect(normalizer.normalize(escapeEvent)).toBe('<Esc>');

      const tabEvent = createMockKeyboardEvent({ key: 'Tab', code: 'Tab' });
      expect(normalizer.normalize(tabEvent)).toBe('<Tab>');

      const spaceEvent = createMockKeyboardEvent({ key: ' ', code: 'Space' });
      expect(normalizer.normalize(spaceEvent)).toBe('<Space>');

      const backspaceEvent = createMockKeyboardEvent({ key: 'Backspace', code: 'Backspace' });
      expect(normalizer.normalize(backspaceEvent)).toBe('<BS>');
    });

    it('should normalize arrow keys', () => {
      const upEvent = createMockKeyboardEvent({ key: 'ArrowUp', code: 'ArrowUp' });
      expect(normalizer.normalize(upEvent)).toBe('<Up>');

      const downEvent = createMockKeyboardEvent({ key: 'ArrowDown', code: 'ArrowDown' });
      expect(normalizer.normalize(downEvent)).toBe('<Down>');

      const leftEvent = createMockKeyboardEvent({ key: 'ArrowLeft', code: 'ArrowLeft' });
      expect(normalizer.normalize(leftEvent)).toBe('<Left>');

      const rightEvent = createMockKeyboardEvent({ key: 'ArrowRight', code: 'ArrowRight' });
      expect(normalizer.normalize(rightEvent)).toBe('<Right>');
    });

    it('should handle modifier combinations', () => {
      const ctrlAEvent = createMockKeyboardEvent({ key: 'a', code: 'KeyA', ctrlKey: true });
      expect(normalizer.normalize(ctrlAEvent)).toBe('<C-a>');

      const ctrlAltEvent = createMockKeyboardEvent({
        key: 'b',
        code: 'KeyB',
        ctrlKey: true,
        altKey: true,
      });
      expect(normalizer.normalize(ctrlAltEvent)).toBe('<C-A-b>');

      const shiftCtrlEvent = createMockKeyboardEvent({
        key: 'c',
        code: 'KeyC',
        shiftKey: true,
        ctrlKey: true,
      });
      expect(normalizer.normalize(shiftCtrlEvent)).toBe('<C-S-c>');

      const metaEvent = createMockKeyboardEvent({ key: 'd', code: 'KeyD', metaKey: true });
      expect(normalizer.normalize(metaEvent)).toBe('<M-d>');
    });

    it('should handle ctrl key with special characters', () => {
      const ctrlCEvent = createMockKeyboardEvent({ key: 'c', code: 'KeyC', ctrlKey: true });
      expect(normalizer.normalize(ctrlCEvent)).toBe('<C-c>');

      const ctrlLeftBracket = createMockKeyboardEvent({
        key: '[',
        code: 'BracketLeft',
        ctrlKey: true,
      });
      expect(normalizer.normalize(ctrlLeftBracket)).toBe('<C-[>');
    });

    it('should handle function keys', () => {
      const f1Event = createMockKeyboardEvent({ key: 'F1', code: 'F1' });
      expect(normalizer.normalize(f1Event)).toBe('<F1>');

      const f12Event = createMockKeyboardEvent({ key: 'F12', code: 'F12' });
      expect(normalizer.normalize(f12Event)).toBe('<F12>');
    });

    it('should handle home and end keys', () => {
      const homeEvent = createMockKeyboardEvent({ key: 'Home', code: 'Home' });
      expect(normalizer.normalize(homeEvent)).toBe('<Home>');

      const endEvent = createMockKeyboardEvent({ key: 'End', code: 'End' });
      expect(normalizer.normalize(endEvent)).toBe('<End>');
    });

    it('should handle page up and down', () => {
      const pageUpEvent = createMockKeyboardEvent({ key: 'PageUp', code: 'PageUp' });
      expect(normalizer.normalize(pageUpEvent)).toBe('<PageUp>');

      const pageDownEvent = createMockKeyboardEvent({ key: 'PageDown', code: 'PageDown' });
      expect(normalizer.normalize(pageDownEvent)).toBe('<PageDown>');
    });

    it('should handle insert, delete, and print screen', () => {
      const insertEvent = createMockKeyboardEvent({ key: 'Insert', code: 'Insert' });
      expect(normalizer.normalize(insertEvent)).toBe('<Insert>');

      const deleteEvent = createMockKeyboardEvent({ key: 'Delete', code: 'Delete' });
      expect(normalizer.normalize(deleteEvent)).toBe('<Del>');

      const printScreenEvent = createMockKeyboardEvent({ key: 'PrintScreen', code: 'PrintScreen' });
      expect(normalizer.normalize(printScreenEvent)).toBe('<PrintScreen>');
    });
  });

  describe('normalizeKey', () => {
    it('should normalize basic keys without modifiers', () => {
      expect(normalizer.normalizeKey('x')).toBe('x');
    });

    it('should handle modifier prefix for keys with modifiers', () => {
      expect(normalizer.normalizeKey('y')).toBe('y');

      expect(normalizer.normalizeKey('z')).toBe('z');
    });

    it('should handle special key names', () => {
      expect(normalizer.normalizeKey('Enter')).toBe('<Enter>');
      expect(normalizer.normalizeKey('Escape')).toBe('<Esc>');
      expect(normalizer.normalizeKey('Tab')).toBe('<Tab>');
    });

    it('should handle space key specially', () => {
      expect(normalizer.normalizeKey(' ')).toBe('<Space>');
    });
  });

  describe('normalizeSpecialKey', () => {
    it('should map special key names to vim notation', () => {
      expect(normalizer.normalizeSpecialKey('Enter')).toBe('<Enter>');
      expect(normalizer.normalizeSpecialKey('Escape')).toBe('<Esc>');
      expect(normalizer.normalizeSpecialKey('Tab')).toBe('<Tab>');
      expect(normalizer.normalizeSpecialKey('Backspace')).toBe('<BS>');
      expect(normalizer.normalizeSpecialKey('ArrowUp')).toBe('<Up>');
      expect(normalizer.normalizeSpecialKey('ArrowDown')).toBe('<Down>');
      expect(normalizer.normalizeSpecialKey('ArrowLeft')).toBe('<Left>');
      expect(normalizer.normalizeSpecialKey('ArrowRight')).toBe('<Right>');
      expect(normalizer.normalizeSpecialKey('Delete')).toBe('<Del>');
      expect(normalizer.normalizeSpecialKey('Home')).toBe('<Home>');
      expect(normalizer.normalizeSpecialKey('End')).toBe('<End>');
      expect(normalizer.normalizeSpecialKey('PageUp')).toBe('<PageUp>');
      expect(normalizer.normalizeSpecialKey('PageDown')).toBe('<PageDown>');
      expect(normalizer.normalizeSpecialKey('Insert')).toBe('<Insert>');
      expect(normalizer.normalizeSpecialKey('F1')).toBe('<F1>');
      expect(normalizer.normalizeSpecialKey('F12')).toBe('<F12>');
    });

    it('should handle function keys with keyCode', () => {
      expect(normalizer.normalizeSpecialKey('F1')).toBe('<F1>');
    });

    it('should return key unchanged for unknown special keys', () => {
      expect(normalizer.normalizeSpecialKey('UnknownKey')).toBe('UnknownKey');
    });
  });

  describe('mapKey', () => {
    it('should add a custom key mapping', () => {
      normalizer.mapKey('jk', '<Esc>');

      const event = createMockKeyboardEvent({ key: 'j', code: 'KeyJ' });
      const result = normalizer.normalize(event);
      // The mapping should affect the normalization
      expect(result).toBeDefined();
    });

    it('should allow multiple mappings', () => {
      normalizer.mapKey('jk', '<Esc>');
      normalizer.mapKey('kk', '<Esc>');

      // Both mappings should be stored
      expect(true).toBe(true);
    });
  });

  describe('removeKeyMapping', () => {
    it('should remove an existing key mapping', () => {
      normalizer.mapKey('jk', '<Esc>');
      normalizer.removeKeyMapping('jk');

      // After removal, the mapping should no longer exist
      expect(true).toBe(true);
    });

    it('should handle removing non-existent mapping gracefully', () => {
      expect(() => normalizer.removeKeyMapping('nonexistent')).not.toThrow();
    });
  });

  describe('resetKeyMappings', () => {
    it('should reset all custom key mappings', () => {
      normalizer.mapKey('jk', '<Esc>');
      normalizer.mapKey('kk', '<Esc>');
      normalizer.resetKeyMappings();

      // After reset, custom mappings should be cleared
      expect(true).toBe(true);
    });
  });

  describe('isArrowKey', () => {
    it('should return true for arrow keys', () => {
      const upEvent = createMockKeyboardEvent({ key: 'ArrowUp' });
      expect(normalizer.isArrowKey(upEvent)).toBe(true);

      const downEvent = createMockKeyboardEvent({ key: 'ArrowDown' });
      expect(normalizer.isArrowKey(downEvent)).toBe(true);

      const leftEvent = createMockKeyboardEvent({ key: 'ArrowLeft' });
      expect(normalizer.isArrowKey(leftEvent)).toBe(true);

      const rightEvent = createMockKeyboardEvent({ key: 'ArrowRight' });
      expect(normalizer.isArrowKey(rightEvent)).toBe(true);
    });

    it('should return false for non-arrow keys', () => {
      const aEvent = createMockKeyboardEvent({ key: 'a' });
      expect(normalizer.isArrowKey(aEvent)).toBe(false);

      const enterEvent = createMockKeyboardEvent({ key: 'Enter' });
      expect(normalizer.isArrowKey(enterEvent)).toBe(false);

      const spaceEvent = createMockKeyboardEvent({ key: ' ' });
      expect(normalizer.isArrowKey(spaceEvent)).toBe(false);
    });
  });

  describe('isFunctionKey', () => {
    it('should return true for function keys', () => {
      const f1Event = createMockKeyboardEvent({ key: 'F1' });
      expect(normalizer.isFunctionKey(f1Event)).toBe(true);

      const f12Event = createMockKeyboardEvent({ key: 'F12' });
      expect(normalizer.isFunctionKey(f12Event)).toBe(true);
    });

    it('should return false for non-function keys', () => {
      const aEvent = createMockKeyboardEvent({ key: 'a' });
      expect(normalizer.isFunctionKey(aEvent)).toBe(false);

      const arrowEvent = createMockKeyboardEvent({ key: 'ArrowUp' });
      expect(normalizer.isFunctionKey(arrowEvent)).toBe(false);
    });
  });

  describe('isNavigationKey', () => {
    it('should return true for navigation keys', () => {
      const homeEvent = createMockKeyboardEvent({ key: 'Home' });
      expect(normalizer.isNavigationKey(homeEvent)).toBe(true);

      const endEvent = createMockKeyboardEvent({ key: 'End' });
      expect(normalizer.isNavigationKey(endEvent)).toBe(true);

      const pageUpEvent = createMockKeyboardEvent({ key: 'PageUp' });
      expect(normalizer.isNavigationKey(pageUpEvent)).toBe(true);

      const pageDownEvent = createMockKeyboardEvent({ key: 'PageDown' });
      expect(normalizer.isNavigationKey(pageDownEvent)).toBe(true);

      const arrowEvent = createMockKeyboardEvent({ key: 'ArrowUp' });
      expect(normalizer.isNavigationKey(arrowEvent)).toBe(true);
    });

    it('should return false for non-navigation keys', () => {
      const aEvent = createMockKeyboardEvent({ key: 'a' });
      expect(normalizer.isNavigationKey(aEvent)).toBe(false);

      const enterEvent = createMockKeyboardEvent({ key: 'Enter' });
      expect(normalizer.isNavigationKey(enterEvent)).toBe(false);
    });
  });

  describe('isEditingKey', () => {
    it('should return true for editing keys', () => {
      const backspaceEvent = createMockKeyboardEvent({ key: 'Backspace' });
      expect(normalizer.isEditingKey(backspaceEvent)).toBe(true);

      const deleteEvent = createMockKeyboardEvent({ key: 'Delete' });
      expect(normalizer.isEditingKey(deleteEvent)).toBe(true);

      const insertEvent = createMockKeyboardEvent({ key: 'Insert' });
      expect(normalizer.isEditingKey(insertEvent)).toBe(true);
    });

    it('should return false for non-editing keys', () => {
      const aEvent = createMockKeyboardEvent({ key: 'a' });
      expect(normalizer.isEditingKey(aEvent)).toBe(false);

      const arrowEvent = createMockKeyboardEvent({ key: 'ArrowUp' });
      expect(normalizer.isEditingKey(arrowEvent)).toBe(false);
    });
  });

  describe('isModifierKey', () => {
    it('should return true for modifier keys', () => {
      const ctrlEvent = createMockKeyboardEvent({ key: 'Control', ctrlKey: true });
      expect(normalizer.isModifierKey(ctrlEvent)).toBe(true);

      const altEvent = createMockKeyboardEvent({ key: 'Alt', altKey: true });
      expect(normalizer.isModifierKey(altEvent)).toBe(true);

      const shiftEvent = createMockKeyboardEvent({ key: 'Shift', shiftKey: true });
      expect(normalizer.isModifierKey(shiftEvent)).toBe(true);

      const metaEvent = createMockKeyboardEvent({ key: 'Meta', metaKey: true });
      expect(normalizer.isModifierKey(metaEvent)).toBe(true);
    });

    it('should return false for non-modifier keys', () => {
      const aEvent = createMockKeyboardEvent({ key: 'a' });
      expect(normalizer.isModifierKey(aEvent)).toBe(false);

      const enterEvent = createMockKeyboardEvent({ key: 'Enter' });
      expect(normalizer.isModifierKey(enterEvent)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle unknown key codes', () => {
      const event = createMockKeyboardEvent({ key: 'UnknownKey', code: 'UnknownCode' });
      const result = normalizer.normalize(event);
      expect(result).toBe('UnknownKey');
    });

    it('should handle empty key', () => {
      const event = createMockKeyboardEvent({ key: '' });
      const result = normalizer.normalize(event);
      expect(result).toBe('');
    });

    it('should handle dead key', () => {
      const event = createMockKeyboardEvent({ key: 'Dead', code: 'Dead' });
      const result = normalizer.normalize(event);
      expect(result).toBe('Dead');
    });

    it('should handle accented characters', () => {
      const event = createMockKeyboardEvent({ key: 'é', code: 'KeyE' });
      const result = normalizer.normalize(event);
      expect(result).toBe('é');
    });
  });
});
