/**
 * XCapitalDeletePlugin Tests
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { XCapitalDeletePlugin } from './XCapitalDeletePlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimState } from '../../../state/VimState';
import { CursorPosition } from '../../../state/CursorPosition';
import { TextBuffer } from '../../../state/TextBuffer';

describe('XCapitalDeletePlugin', () => {
  let plugin: XCapitalDeletePlugin;
  let context: ExecutionContext;
  let state: VimState;

  beforeEach(() => {
    plugin = new XCapitalDeletePlugin();
    state = new VimState('Hello\nWorld\nTest');
    context = new ExecutionContext(state);
  });

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('operator-X-capital');
    });

    it('should have correct version', () => {
      expect(plugin.version).toBe('1.0.0');
    });

    it('should have correct description', () => {
      expect(plugin.description).toBe('Delete character before cursor (X key - capital)');
    });

    it('should have X pattern', () => {
      expect(plugin.patterns).toContain('X');
    });

    it('should support NORMAL mode', () => {
      expect(plugin.modes).toContain('NORMAL');
    });

    it('should support VISUAL mode', () => {
      expect(plugin.modes).toContain('VISUAL');
    });
  });

  describe('basic delete', () => {
    it('should delete character before cursor', () => {
      // Cursor at position (0, 1) - after 'H' in "Hello"
      state.cursor = new CursorPosition(0, 1);

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('ello');
      expect(state.cursor.line).toBe(0);
      expect(state.cursor.column).toBe(0);
    });

    it('should delete character at middle of line', () => {
      // Cursor at position (0, 3) - after 'l' in "Hello"
      // "Hello" indices: H(0), e(1), l(2), l(3), o(4)
      state.cursor = new CursorPosition(0, 3);

      plugin.execute(context);

      // After deleting 'l' at index 2, we get "Helo"
      expect(state.buffer.getLine(0)).toBe('Helo');
      // Cursor should move to column 2
      expect(state.cursor.column).toBe(2);
    });

    it('should not delete when cursor is at column 0', () => {
      // Cursor at position (0, 0) - start of line
      state.cursor = new CursorPosition(0, 0);

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('Hello');
      expect(state.cursor.column).toBe(0);
    });
  });

  describe('count support', () => {
    it('should delete multiple characters with count', () => {
      // Cursor at position (0, 3) - after 'Hel' in "Hello"
      // "Hello" indices: H(0), e(1), l(2), l(3), o(4)
      // With count 2, we delete characters at columns 1 and 2 ('e' and 'l')
      state.cursor = new CursorPosition(0, 3);
      context.setCount(2);

      plugin.execute(context);

      // After deleting 'e' and 'l', we get "Hlo"
      expect(state.buffer.getLine(0)).toBe('Hlo');
      // Cursor should move to column 1 (startColumn = 3 - 2 = 1)
      expect(state.cursor.column).toBe(1);
    });

    it('should not delete past beginning of line', () => {
      // Cursor at position (0, 2) - after 'He' in "Hello"
      state.cursor = new CursorPosition(0, 2);
      context.setCount(5);

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('llo');
      // Cursor should move to column 0
      expect(state.cursor.column).toBe(0);
    });
  });

  describe('register storage', () => {
    it('should store deleted character in unnamed register', () => {
      state.cursor = new CursorPosition(0, 1);

      plugin.execute(context);

      expect(context.getRegister('"')).toBe('H');
    });

    it('should store multiple deleted characters in unnamed register', () => {
      state.cursor = new CursorPosition(0, 3);
      context.setCount(2);

      plugin.execute(context);

      expect(context.getRegister('"')).toBe('el');
    });
  });

  describe('empty buffer handling', () => {
    it('should handle empty buffer gracefully', () => {
      state.buffer = new TextBuffer();
      state.cursor = new CursorPosition(0, 0);

      expect(() => plugin.execute(context)).not.toThrow();
    });

    it('should handle empty line', () => {
      state.buffer = new TextBuffer('');
      state.cursor = new CursorPosition(0, 0);

      expect(() => plugin.execute(context)).not.toThrow();
    });
  });

  describe('cursor movement', () => {
    it('should move cursor left after delete', () => {
      // Cursor at position (0, 4) - after 'Hell' in "Hello"
      state.cursor = new CursorPosition(0, 4);

      plugin.execute(context);

      // After deleting 'l' at index 3, line is "Helo"
      expect(state.buffer.getLine(0)).toBe('Helo');
      // Cursor should move to column 3
      expect(state.cursor.column).toBe(3);
    });

    it('should move cursor to column 0 when deleting at column 1', () => {
      // Cursor at position (0, 1) - after 'H' in "Hello"
      state.cursor = new CursorPosition(0, 1);

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('ello');
      expect(state.cursor.column).toBe(0);
    });
  });

  describe('pattern validation', () => {
    it('should validate X pattern', () => {
      expect(plugin.validatePattern('X')).toBe(true);
    });

    it('should not validate other patterns', () => {
      expect(plugin.validatePattern('x')).toBe(false);
      expect(plugin.validatePattern('d')).toBe(false);
      expect(plugin.validatePattern('dd')).toBe(false);
    });
  });
});
