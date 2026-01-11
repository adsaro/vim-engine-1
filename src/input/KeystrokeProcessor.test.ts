/**
 * KeystrokeProcessor unit tests
 */
import { KeystrokeProcessor } from './input/KeystrokeProcessor';
import { KeystrokeEvent } from './input/KeystrokeEvent';

describe('KeystrokeProcessor', () => {
  let processor: KeystrokeProcessor;

  // Helper to create a mock KeyboardEvent
  const createMockKeyboardEvent = (overrides: Partial<KeyboardEvent> = {}): KeyboardEvent => {
    return {
      key: '',
      code: '',
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      repeat: false,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      ...overrides,
    } as KeyboardEvent & { preventDefault: jest.Mock; stopPropagation: jest.Mock };
  };

  beforeEach(() => {
    processor = new KeystrokeProcessor();
  });

  describe('constructor', () => {
    it('should create a processor with default options', () => {
      expect(processor).toBeDefined();
      expect(processor).toBeInstanceOf(KeystrokeProcessor);
    });

    it('should create a processor with custom timeout', () => {
      const processorWithTimeout = new KeystrokeProcessor({ timeout: 1000 });
      expect(processorWithTimeout).toBeDefined();
    });

    it('should create a processor with timeout of 0', () => {
      const processorNoTimeout = new KeystrokeProcessor({ timeout: 0 });
      expect(processorNoTimeout).toBeDefined();
    });
  });

  describe('process', () => {
    it('should process a basic key event', () => {
      const event = createMockKeyboardEvent({ key: 'a', code: 'KeyA' });
      const result = processor.process(event);

      expect(result).toBeInstanceOf(KeystrokeEvent);
      expect(result.getKeystroke()).toBe('a');
    });

    it('should process a key with ctrl modifier', () => {
      const event = createMockKeyboardEvent({ key: 'c', code: 'KeyC', ctrlKey: true });
      const result = processor.process(event);

      expect(result.getKeystroke()).toBe('<C-c>');
    });

    it('should process special keys', () => {
      const enterEvent = createMockKeyboardEvent({ key: 'Enter', code: 'Enter' });
      const result = processor.process(enterEvent);

      expect(result.getKeystroke()).toBe('<Enter>');
    });

    it('should capture repeat state', () => {
      const repeatEvent = createMockKeyboardEvent({ key: 'a', repeat: true });
      const result = processor.process(repeatEvent);

      expect(result.isRepeat).toBe(true);
    });

    it('should capture non-repeat state', () => {
      const normalEvent = createMockKeyboardEvent({ key: 'a', repeat: false });
      const result = processor.process(normalEvent);

      expect(result.isRepeat).toBe(false);
    });
  });

  describe('processKey', () => {
    it('should process a key string', () => {
      const result = processor.processKey('b');

      expect(result).toBe('b');
    });

    it('should handle special keys', () => {
      const result = processor.processKey('Enter');

      expect(result).toBe('<Enter>');
    });

    it('should handle modifiers in key string', () => {
      const result = processor.processKey('x');

      expect(result).toBe('x');
    });
  });

  describe('flushPending', () => {
    it('should return empty string when no pending keystrokes', () => {
      const result = processor.flushPending();
      expect(result).toBe('');
    });

    it('should clear pending keystrokes after flush', () => {
      processor.clearPending();
      const result = processor.flushPending();
      expect(result).toBe('');
    });
  });

  describe('clearPending', () => {
    it('should clear pending keystrokes', () => {
      processor.clearPending();
      expect(processor.hasPending()).toBe(false);
      expect(processor.getPendingCount()).toBe(0);
    });
  });

  describe('getPendingKeystrokes', () => {
    it('should return empty string when no pending keystrokes', () => {
      const result = processor.getPendingKeystrokes();
      expect(result).toBe('');
    });
  });

  describe('getPendingAsArray', () => {
    it('should return empty array when no pending keystrokes', () => {
      const result = processor.getPendingAsArray();
      expect(result).toEqual([]);
    });
  });

  describe('hasPending', () => {
    it('should return false initially', () => {
      expect(processor.hasPending()).toBe(false);
    });
  });

  describe('getPendingCount', () => {
    it('should return 0 initially', () => {
      expect(processor.getPendingCount()).toBe(0);
    });
  });

  describe('setTimeout', () => {
    it('should set the timeout value', () => {
      processor.setTimeout(500);
      expect(processor.getTimeout()).toBe(500);
    });

    it('should handle zero timeout', () => {
      processor.setTimeout(0);
      expect(processor.getTimeout()).toBe(0);
    });

    it('should handle large timeout', () => {
      processor.setTimeout(10000);
      expect(processor.getTimeout()).toBe(10000);
    });
  });

  describe('getTimeout', () => {
    it('should return default timeout', () => {
      const defaultTimeout = processor.getTimeout();
      expect(defaultTimeout).toBeDefined();
      expect(typeof defaultTimeout).toBe('number');
    });

    it('should return custom timeout after set', () => {
      processor.setTimeout(750);
      expect(processor.getTimeout()).toBe(750);
    });
  });

  describe('shouldProcess', () => {
    it('should return true for regular key events', () => {
      const event = createMockKeyboardEvent({ key: 'a' });
      expect(processor.shouldProcess(event)).toBe(true);
    });

    it('should return true for special keys', () => {
      const event = createMockKeyboardEvent({ key: 'Enter' });
      expect(processor.shouldProcess(event)).toBe(true);
    });

    it('should return true for modifier keys with other modifiers', () => {
      const event = createMockKeyboardEvent({ key: 'Control', ctrlKey: true });
      expect(processor.shouldProcess(event)).toBe(true);
    });

    it('should return true for key with ctrl modifier', () => {
      const event = createMockKeyboardEvent({ key: 'c', ctrlKey: true });
      expect(processor.shouldProcess(event)).toBe(true);
    });

    it('should return true for key with alt modifier', () => {
      const event = createMockKeyboardEvent({ key: 'b', altKey: true });
      expect(processor.shouldProcess(event)).toBe(true);
    });

    it('should return true for key with meta modifier', () => {
      const event = createMockKeyboardEvent({ key: 'd', metaKey: true });
      expect(processor.shouldProcess(event)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle multiple rapid key presses', () => {
      const events = [
        createMockKeyboardEvent({ key: 'g', code: 'KeyG' }),
        createMockKeyboardEvent({ key: 'g', code: 'KeyG' }),
      ];

      const results = events.map(e => processor.process(e));
      expect(results).toHaveLength(2);
      expect(results[0].getKeystroke()).toBe('g');
      expect(results[1].getKeystroke()).toBe('g');
    });

    it('should handle modifier combinations', () => {
      const ctrlAltEvent = createMockKeyboardEvent({
        key: 'k',
        code: 'KeyK',
        ctrlKey: true,
        altKey: true,
      });
      const result = processor.process(ctrlAltEvent);
      expect(result.getKeystroke()).toBe('<C-A-k>');
    });

    it('should handle shift alone on letter key', () => {
      const shiftAEvent = createMockKeyboardEvent({ key: 'A', code: 'KeyA', shiftKey: true });
      const result = processor.process(shiftAEvent);
      // Shift alone on letter should return the uppercase letter
      expect(result.getKeystroke()).toBe('A');
    });

    it('should handle shift with other modifiers', () => {
      const ctrlShiftEvent = createMockKeyboardEvent({
        key: 'w',
        code: 'KeyW',
        ctrlKey: true,
        shiftKey: true,
      });
      const result = processor.process(ctrlShiftEvent);
      expect(result.getKeystroke()).toBe('<C-S-w>');
    });

    it('should handle arrow keys', () => {
      const upEvent = createMockKeyboardEvent({ key: 'ArrowUp', code: 'ArrowUp' });
      const result = processor.process(upEvent);
      expect(result.getKeystroke()).toBe('<Up>');
    });

    it('should handle function keys', () => {
      const f5Event = createMockKeyboardEvent({ key: 'F5', code: 'F5' });
      const result = processor.process(f5Event);
      expect(result.getKeystroke()).toBe('<F5>');
    });

    it('should handle escape key', () => {
      const escEvent = createMockKeyboardEvent({ key: 'Escape', code: 'Escape' });
      const result = processor.process(escEvent);
      expect(result.getKeystroke()).toBe('<Esc>');
    });

    it('should handle space key', () => {
      const spaceEvent = createMockKeyboardEvent({ key: ' ', code: 'Space' });
      const result = processor.process(spaceEvent);
      expect(result.getKeystroke()).toBe('<Space>');
    });

    it('should handle tab key', () => {
      const tabEvent = createMockKeyboardEvent({ key: 'Tab', code: 'Tab' });
      const result = processor.process(tabEvent);
      expect(result.getKeystroke()).toBe('<Tab>');
    });

    it('should handle backspace key', () => {
      const bsEvent = createMockKeyboardEvent({ key: 'Backspace', code: 'Backspace' });
      const result = processor.process(bsEvent);
      expect(result.getKeystroke()).toBe('<BS>');
    });
  });
});
