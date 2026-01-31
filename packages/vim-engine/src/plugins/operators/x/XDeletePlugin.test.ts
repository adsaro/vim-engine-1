/**
 * XDeletePlugin Tests
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { XDeletePlugin } from './XDeletePlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimState } from '../../../state/VimState';
import { CursorPosition } from '../../../state/CursorPosition';
import { TextBuffer } from '../../../state/TextBuffer';

describe('XDeletePlugin', () => {
  let plugin: XDeletePlugin;
  let context: ExecutionContext;
  let state: VimState;

  beforeEach(() => {
    plugin = new XDeletePlugin();
    state = new VimState('Hello\nWorld\nTest');
    context = new ExecutionContext(state);
  });

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('operator-x');
    });

    it('should have correct version', () => {
      expect(plugin.version).toBe('1.0.0');
    });

    it('should have correct description', () => {
      expect(plugin.description).toBe('Delete character under cursor (x key)');
    });

    it('should have x pattern', () => {
      expect(plugin.patterns).toContain('x');
    });

    it('should support NORMAL mode', () => {
      expect(plugin.modes).toContain('NORMAL');
    });

    it('should support VISUAL mode', () => {
      expect(plugin.modes).toContain('VISUAL');
    });
  });

  describe('basic delete', () => {
    it('should delete character under cursor', () => {
      // Cursor at position (0, 0) - 'H' in "Hello"
      state.cursor = new CursorPosition(0, 0);

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('ello');
      expect(state.cursor.line).toBe(0);
    });

    it('should delete character at middle of line', () => {
      // Cursor at position (0, 2) - first 'l' in "Hello"
      // "Hello" indices: H(0), e(1), l(2), l(3), o(4)
      state.cursor = new CursorPosition(0, 2);

      plugin.execute(context);

      // After deleting 'l' at index 2, we get "Helo"
      expect(state.buffer.getLine(0)).toBe('Helo');
    });

    it('should delete character at end of line', () => {
      // Cursor at position (0, 4) - 'o' in "Hello"
      state.cursor = new CursorPosition(0, 4);

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('Hell');
    });

    it('should not delete when cursor is past end of line', () => {
      // Cursor at position (0, 10) - past "Hello"
      state.cursor = new CursorPosition(0, 10);

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('Hello');
    });
  });

  describe('count support', () => {
    it('should delete multiple characters with count', () => {
      // Cursor at position (0, 0) - 'H' in "Hello"
      state.cursor = new CursorPosition(0, 0);
      context.setCount(3);

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('lo');
    });

    it('should not delete past end of line', () => {
      // Cursor at position (0, 3) - 'l' in "Hello"
      state.cursor = new CursorPosition(0, 3);
      context.setCount(5);

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('Hel');
    });
  });

  describe('register storage', () => {
    it('should store deleted character in unnamed register', () => {
      state.cursor = new CursorPosition(0, 0);

      plugin.execute(context);

      expect(context.getRegister('"')).toBe('H');
    });

    it('should store multiple deleted characters in unnamed register', () => {
      state.cursor = new CursorPosition(0, 0);
      context.setCount(3);

      plugin.execute(context);

      expect(context.getRegister('"')).toBe('Hel');
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

  describe('cursor adjustment', () => {
    it('should keep cursor at same position after delete', () => {
      // Cursor at position (0, 1) - 'e' in "Hello"
      state.cursor = new CursorPosition(0, 1);

      plugin.execute(context);

      // After deleting 'e', line is "Hllo"
      expect(state.buffer.getLine(0)).toBe('Hllo');
      expect(state.cursor.column).toBe(1);
    });

    it('should adjust cursor when at end of line after deletion', () => {
      // Cursor at position (0, 4) - 'o' in "Hello"
      state.cursor = new CursorPosition(0, 4);

      plugin.execute(context);

      // After deleting 'o', line is "Hell" (length 4)
      // Cursor was at position 4, which is now past end, so it should move to 3
      expect(state.buffer.getLine(0)).toBe('Hell');
      expect(state.cursor.column).toBe(3);
    });
  });

  describe('pattern validation', () => {
    it('should validate x pattern', () => {
      expect(plugin.validatePattern('x')).toBe(true);
    });

    it('should not validate other patterns', () => {
      expect(plugin.validatePattern('X')).toBe(false);
      expect(plugin.validatePattern('d')).toBe(false);
      expect(plugin.validatePattern('dd')).toBe(false);
    });
  });
});
