/**
 * Keyboard configuration unit tests
 */
import {
  KEY_NORMALIZATION_MAP,
  VIM_NOTATION_MAP,
  SPECIAL_CHARS,
  DEFAULT_KEY_PATTERNS,
  ARROW_KEYS,
  NAVIGATION_KEYS,
  EDITING_KEYS,
  MODIFIER_KEYS,
  MODIFIER_PREFIX_MAP,
} from './keyboard';

describe('Keyboard Configuration', () => {
  describe('KEY_NORMALIZATION_MAP', () => {
    it('should map space key', () => {
      expect(KEY_NORMALIZATION_MAP[' ']).toBe('space');
    });

    it('should map Enter key', () => {
      expect(KEY_NORMALIZATION_MAP['Enter']).toBe('enter');
    });

    it('should map Escape key', () => {
      expect(KEY_NORMALIZATION_MAP['Escape']).toBe('esc');
    });

    it('should map arrow keys', () => {
      expect(KEY_NORMALIZATION_MAP['ArrowUp']).toBe('up');
      expect(KEY_NORMALIZATION_MAP['ArrowDown']).toBe('down');
      expect(KEY_NORMALIZATION_MAP['ArrowLeft']).toBe('left');
      expect(KEY_NORMALIZATION_MAP['ArrowRight']).toBe('right');
    });

    it('should map function keys', () => {
      expect(KEY_NORMALIZATION_MAP['F1']).toBe('f1');
      expect(KEY_NORMALIZATION_MAP['F12']).toBe('f12');
    });

    it('should map modifier keys with prefixes', () => {
      expect(KEY_NORMALIZATION_MAP['Control']).toBe('ctrl-');
      expect(KEY_NORMALIZATION_MAP['Alt']).toBe('alt-');
      expect(KEY_NORMALIZATION_MAP['Shift']).toBe('shift-');
      expect(KEY_NORMALIZATION_MAP['Meta']).toBe('cmd-');
    });
  });

  describe('VIM_NOTATION_MAP', () => {
    it('should map Enter to vim notation', () => {
      expect(VIM_NOTATION_MAP['Enter']).toBe('<Enter>');
    });

    it('should map Escape to vim notation', () => {
      expect(VIM_NOTATION_MAP['Escape']).toBe('<Esc>');
    });

    it('should map arrow keys to vim notation', () => {
      expect(VIM_NOTATION_MAP['ArrowUp']).toBe('<Up>');
      expect(VIM_NOTATION_MAP['ArrowDown']).toBe('<Down>');
      expect(VIM_NOTATION_MAP['ArrowLeft']).toBe('<Left>');
      expect(VIM_NOTATION_MAP['ArrowRight']).toBe('<Right>');
    });

    it('should map Backspace to vim notation', () => {
      expect(VIM_NOTATION_MAP['Backspace']).toBe('<BS>');
    });

    it('should map Delete to vim notation', () => {
      expect(VIM_NOTATION_MAP['Delete']).toBe('<Del>');
    });

    it('should map function keys to vim notation', () => {
      expect(VIM_NOTATION_MAP['F1']).toBe('<F1>');
      expect(VIM_NOTATION_MAP['F12']).toBe('<F12>');
    });
  });

  describe('SPECIAL_CHARS', () => {
    it('should escape less-than character', () => {
      expect(SPECIAL_CHARS['<']).toBe('lt');
    });

    it('should escape greater-than character', () => {
      expect(SPECIAL_CHARS['>']).toBe('gt');
    });

    it('should escape ampersand character', () => {
      expect(SPECIAL_CHARS['&']).toBe('amp');
    });

    it('should escape double quote character', () => {
      expect(SPECIAL_CHARS['"']).toBe('quot');
    });

    it('should escape single quote character', () => {
      expect(SPECIAL_CHARS[String.fromCharCode(39)]).toBe('apos');
    });
  });

  describe('DEFAULT_KEY_PATTERNS', () => {
    it('should have movement keys', () => {
      expect(DEFAULT_KEY_PATTERNS.movements).toContain('h');
      expect(DEFAULT_KEY_PATTERNS.movements).toContain('j');
      expect(DEFAULT_KEY_PATTERNS.movements).toContain('k');
      expect(DEFAULT_KEY_PATTERNS.movements).toContain('l');
      expect(DEFAULT_KEY_PATTERNS.movements).toContain('w');
      expect(DEFAULT_KEY_PATTERNS.movements).toContain('b');
      expect(DEFAULT_KEY_PATTERNS.movements).toContain('e');
    });

    it('should have operator keys', () => {
      expect(DEFAULT_KEY_PATTERNS.operators).toContain('d');
      expect(DEFAULT_KEY_PATTERNS.operators).toContain('c');
      expect(DEFAULT_KEY_PATTERNS.operators).toContain('y');
      expect(DEFAULT_KEY_PATTERNS.operators).toContain('r');
      expect(DEFAULT_KEY_PATTERNS.operators).toContain('x');
      expect(DEFAULT_KEY_PATTERNS.operators).toContain('p');
    });

    it('should have modifier keys', () => {
      expect(DEFAULT_KEY_PATTERNS.modifiers).toContain('i');
      expect(DEFAULT_KEY_PATTERNS.modifiers).toContain('a');
      expect(DEFAULT_KEY_PATTERNS.modifiers).toContain('v');
      expect(DEFAULT_KEY_PATTERNS.modifiers).toContain('t');
      expect(DEFAULT_KEY_PATTERNS.modifiers).toContain('f');
    });
  });

  describe('ARROW_KEYS', () => {
    it('should contain all arrow key names', () => {
      expect(ARROW_KEYS).toContain('ArrowUp');
      expect(ARROW_KEYS).toContain('ArrowDown');
      expect(ARROW_KEYS).toContain('ArrowLeft');
      expect(ARROW_KEYS).toContain('ArrowRight');
    });

    it('should have exactly 4 arrow keys', () => {
      expect(ARROW_KEYS.length).toBe(4);
    });
  });

  describe('NAVIGATION_KEYS', () => {
    it('should contain navigation keys', () => {
      expect(NAVIGATION_KEYS).toContain('Home');
      expect(NAVIGATION_KEYS).toContain('End');
      expect(NAVIGATION_KEYS).toContain('PageUp');
      expect(NAVIGATION_KEYS).toContain('PageDown');
    });

    it('should include arrow keys', () => {
      expect(NAVIGATION_KEYS).toContain('ArrowUp');
      expect(NAVIGATION_KEYS).toContain('ArrowDown');
    });
  });

  describe('EDITING_KEYS', () => {
    it('should contain editing key names', () => {
      expect(EDITING_KEYS).toContain('Backspace');
      expect(EDITING_KEYS).toContain('Delete');
      expect(EDITING_KEYS).toContain('Insert');
    });

    it('should have exactly 3 editing keys', () => {
      expect(EDITING_KEYS.length).toBe(3);
    });
  });

  describe('MODIFIER_KEYS', () => {
    it('should contain modifier key names', () => {
      expect(MODIFIER_KEYS).toContain('Control');
      expect(MODIFIER_KEYS).toContain('Alt');
      expect(MODIFIER_KEYS).toContain('Shift');
      expect(MODIFIER_KEYS).toContain('Meta');
    });

    it('should have exactly 4 modifier keys', () => {
      expect(MODIFIER_KEYS.length).toBe(4);
    });
  });

  describe('MODIFIER_PREFIX_MAP', () => {
    it('should map Control to C', () => {
      expect(MODIFIER_PREFIX_MAP['Control']).toBe('C');
    });

    it('should map Alt to A', () => {
      expect(MODIFIER_PREFIX_MAP['Alt']).toBe('A');
    });

    it('should map Shift to S', () => {
      expect(MODIFIER_PREFIX_MAP['Shift']).toBe('S');
    });

    it('should map Meta to M', () => {
      expect(MODIFIER_PREFIX_MAP['Meta']).toBe('M');
    });
  });

  describe('immutability', () => {
    it('KEY_NORMALIZATION_MAP should be frozen', () => {
      expect(Object.isFrozen(KEY_NORMALIZATION_MAP)).toBe(true);
    });

    it('VIM_NOTATION_MAP should be frozen', () => {
      expect(Object.isFrozen(VIM_NOTATION_MAP)).toBe(true);
    });

    it('SPECIAL_CHARS should be frozen', () => {
      expect(Object.isFrozen(SPECIAL_CHARS)).toBe(true);
    });

    it('DEFAULT_KEY_PATTERNS should be frozen', () => {
      expect(Object.isFrozen(DEFAULT_KEY_PATTERNS)).toBe(true);
    });
  });
});
