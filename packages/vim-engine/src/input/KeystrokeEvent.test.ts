/**
 * KeystrokeEvent unit tests
 */
import { KeystrokeEvent } from './input/KeystrokeEvent';

describe('KeystrokeEvent', () => {
  // Helper to create a mock KeyboardEvent
  const createMockKeyboardEvent = (overrides: Partial<KeyboardEvent> = {}): KeyboardEvent => {
    return {
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      repeat: false,
      key: '',
      code: '',
      ...overrides,
    } as KeyboardEvent;
  };

  describe('constructor', () => {
    it('should create a KeystrokeEvent with basic properties', () => {
      const keystroke = 'a';
      const rawEvent = createMockKeyboardEvent({ key: 'a' });
      const event = new KeystrokeEvent(keystroke, rawEvent);

      expect(event.keystroke).toBe('a');
      expect(event.timestamp).toBeDefined();
      expect(event.timestamp).toBeGreaterThan(0);
    });

    it('should store rawEvent reference', () => {
      const rawEvent = createMockKeyboardEvent({ key: 'a' });
      const event = new KeystrokeEvent('a', rawEvent);

      expect(event.getRawEvent()).toBe(rawEvent);
    });

    it('should capture isRepeat from rawEvent', () => {
      const repeatEvent = createMockKeyboardEvent({ repeat: true });
      const event = new KeystrokeEvent('a', repeatEvent);

      expect(event.isRepeat).toBe(true);

      const nonRepeatEvent = createMockKeyboardEvent({ repeat: false });
      const event2 = new KeystrokeEvent('a', nonRepeatEvent);

      expect(event2.isRepeat).toBe(false);
    });

    it('should capture modifiers from rawEvent', () => {
      const ctrlEvent = createMockKeyboardEvent({ ctrlKey: true, key: 'c' });
      const event = new KeystrokeEvent('<C-c>', ctrlEvent);

      expect(event.modifiers.ctrl).toBe(true);
      expect(event.modifiers.alt).toBe(false);
      expect(event.modifiers.shift).toBe(false);
      expect(event.modifiers.meta).toBe(false);
    });

    it('should capture all modifiers correctly', () => {
      const allModsEvent = createMockKeyboardEvent({
        ctrlKey: true,
        altKey: true,
        shiftKey: true,
        metaKey: true,
        key: 's',
      });
      const event = new KeystrokeEvent('<C-A-S-M-s>', allModsEvent);

      expect(event.modifiers.ctrl).toBe(true);
      expect(event.modifiers.alt).toBe(true);
      expect(event.modifiers.shift).toBe(true);
      expect(event.modifiers.meta).toBe(true);
    });
  });

  describe('getKeystroke', () => {
    it('should return the keystroke string', () => {
      const event = new KeystrokeEvent('hello', createMockKeyboardEvent());
      expect(event.getKeystroke()).toBe('hello');
    });
  });

  describe('getTimestamp', () => {
    it('should return the timestamp', () => {
      const before = Date.now();
      const event = new KeystrokeEvent('a', createMockKeyboardEvent());
      const after = Date.now();

      expect(event.getTimestamp()).toBeGreaterThanOrEqual(before);
      expect(event.getTimestamp()).toBeLessThanOrEqual(after);
    });
  });

  describe('isModifierOnly', () => {
    it('should return true for modifier-only keystrokes', () => {
      const ctrlEvent = createMockKeyboardEvent({ key: 'Control', ctrlKey: true });
      const event = new KeystrokeEvent('<C>', ctrlEvent);
      expect(event.isModifierOnly()).toBe(true);

      const altEvent = createMockKeyboardEvent({ key: 'Alt', altKey: true });
      const event2 = new KeystrokeEvent('<A>', altEvent);
      expect(event2.isModifierOnly()).toBe(true);

      const shiftEvent = createMockKeyboardEvent({ key: 'Shift', shiftKey: true });
      const event3 = new KeystrokeEvent('<S>', shiftEvent);
      expect(event3.isModifierOnly()).toBe(true);

      const metaEvent = createMockKeyboardEvent({ key: 'Meta', metaKey: true });
      const event4 = new KeystrokeEvent('<M>', metaEvent);
      expect(event4.isModifierOnly()).toBe(true);
    });

    it('should return false for non-modifier keystrokes', () => {
      const regularEvent = createMockKeyboardEvent({ key: 'a' });
      const event = new KeystrokeEvent('a', regularEvent);
      expect(event.isModifierOnly()).toBe(false);

      const ctrlCharEvent = createMockKeyboardEvent({ key: 'c', ctrlKey: true });
      const event2 = new KeystrokeEvent('<C-c>', ctrlCharEvent);
      expect(event2.isModifierOnly()).toBe(false);
    });
  });

  describe('hasCtrl', () => {
    it('should return true when ctrl modifier is present', () => {
      const event = new KeystrokeEvent('<C-c>', createMockKeyboardEvent({ ctrlKey: true }));
      expect(event.hasCtrl()).toBe(true);
    });

    it('should return false when ctrl modifier is not present', () => {
      const event = new KeystrokeEvent('c', createMockKeyboardEvent({ ctrlKey: false }));
      expect(event.hasCtrl()).toBe(false);
    });
  });

  describe('hasAlt', () => {
    it('should return true when alt modifier is present', () => {
      const event = new KeystrokeEvent('<A-c>', createMockKeyboardEvent({ altKey: true }));
      expect(event.hasAlt()).toBe(true);
    });

    it('should return false when alt modifier is not present', () => {
      const event = new KeystrokeEvent('c', createMockKeyboardEvent({ altKey: false }));
      expect(event.hasAlt()).toBe(false);
    });
  });

  describe('hasShift', () => {
    it('should return true when shift modifier is present', () => {
      const event = new KeystrokeEvent('<S-c>', createMockKeyboardEvent({ shiftKey: true }));
      expect(event.hasShift()).toBe(true);
    });

    it('should return false when shift modifier is not present', () => {
      const event = new KeystrokeEvent('c', createMockKeyboardEvent({ shiftKey: false }));
      expect(event.hasShift()).toBe(false);
    });
  });

  describe('hasMeta', () => {
    it('should return true when meta modifier is present', () => {
      const event = new KeystrokeEvent('<D-c>', createMockKeyboardEvent({ metaKey: true }));
      expect(event.hasMeta()).toBe(true);
    });

    it('should return false when meta modifier is not present', () => {
      const event = new KeystrokeEvent('c', createMockKeyboardEvent({ metaKey: false }));
      expect(event.hasMeta()).toBe(false);
    });
  });

  describe('getModifierState', () => {
    it('should return the complete modifier state', () => {
      const event = new KeystrokeEvent(
        '<C-A>',
        createMockKeyboardEvent({
          ctrlKey: true,
          altKey: true,
          shiftKey: false,
          metaKey: false,
        })
      );

      const state = event.getModifierState();
      expect(state).toEqual({
        ctrl: true,
        alt: true,
        shift: false,
        meta: false,
      });
    });

    it('should return all false when no modifiers are pressed', () => {
      const event = new KeystrokeEvent(
        'a',
        createMockKeyboardEvent({
          ctrlKey: false,
          altKey: false,
          shiftKey: false,
          metaKey: false,
        })
      );

      const state = event.getModifierState();
      expect(state).toEqual({
        ctrl: false,
        alt: false,
        shift: false,
        meta: false,
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty keystroke', () => {
      const event = new KeystrokeEvent('', createMockKeyboardEvent());
      expect(event.getKeystroke()).toBe('');
    });

    it('should handle special keys', () => {
      const enterEvent = createMockKeyboardEvent({ key: 'Enter', code: 'Enter' });
      const event = new KeystrokeEvent('<Enter>', enterEvent);
      expect(event.keystroke).toBe('<Enter>');
    });

    it('should handle escape key', () => {
      const escEvent = createMockKeyboardEvent({ key: 'Escape', code: 'Escape' });
      const event = new KeystrokeEvent('<Esc>', escEvent);
      expect(event.keystroke).toBe('<Esc>');
    });

    it('should handle space key', () => {
      const spaceEvent = createMockKeyboardEvent({ key: ' ', code: 'Space' });
      const event = new KeystrokeEvent('<Space>', spaceEvent);
      expect(event.keystroke).toBe('<Space>');
    });

    it('should handle tab key', () => {
      const tabEvent = createMockKeyboardEvent({ key: 'Tab', code: 'Tab' });
      const event = new KeystrokeEvent('<Tab>', tabEvent);
      expect(event.keystroke).toBe('<Tab>');
    });

    it('should handle backspace key', () => {
      const bsEvent = createMockKeyboardEvent({ key: 'Backspace', code: 'Backspace' });
      const event = new KeystrokeEvent('<BS>', bsEvent);
      expect(event.keystroke).toBe('<BS>');
    });

    it('should handle arrow keys', () => {
      const upEvent = createMockKeyboardEvent({ key: 'ArrowUp', code: 'ArrowUp' });
      const event = new KeystrokeEvent('<Up>', upEvent);
      expect(event.keystroke).toBe('<Up>');

      const downEvent = createMockKeyboardEvent({ key: 'ArrowDown', code: 'ArrowDown' });
      const event2 = new KeystrokeEvent('<Down>', downEvent);
      expect(event2.keystroke).toBe('<Down>');

      const leftEvent = createMockKeyboardEvent({ key: 'ArrowLeft', code: 'ArrowLeft' });
      const event3 = new KeystrokeEvent('<Left>', leftEvent);
      expect(event3.keystroke).toBe('<Left>');

      const rightEvent = createMockKeyboardEvent({ key: 'ArrowRight', code: 'ArrowRight' });
      const event4 = new KeystrokeEvent('<Right>', rightEvent);
      expect(event4.keystroke).toBe('<Right>');
    });
  });
});
