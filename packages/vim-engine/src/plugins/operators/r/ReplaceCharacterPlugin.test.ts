/**
 * ReplaceCharacterPlugin Tests
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { ReplaceCharacterPlugin } from './ReplaceCharacterPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimState } from '../../../state/VimState';
import { CursorPosition } from '../../../state/CursorPosition';
import { TextBuffer } from '../../../state/TextBuffer';

describe('ReplaceCharacterPlugin', () => {
  let plugin: ReplaceCharacterPlugin;
  let context: ExecutionContext;
  let state: VimState;

  beforeEach(() => {
    plugin = new ReplaceCharacterPlugin();
    state = new VimState('Hello\nWorld\nTest');
    context = new ExecutionContext(state);
  });

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('operator-replace-char');
    });

    it('should have correct version', () => {
      expect(plugin.version).toBe('1.0.0');
    });

    it('should have correct description', () => {
      expect(plugin.description).toBe('Replace character under cursor (r{char})');
    });

    it('should have r{char} patterns for all printable ASCII', () => {
      // Should have patterns for all printable ASCII (space through tilde = 95 chars)
      expect(plugin.patterns.length).toBe(95);
      expect(plugin.patterns).toContain('ra');
      expect(plugin.patterns).toContain('rb');
      expect(plugin.patterns).toContain('r ');
      expect(plugin.patterns).toContain('r~');
    });

    it('should support NORMAL mode only', () => {
      expect(plugin.modes).toContain('NORMAL');
      expect(plugin.modes.length).toBe(1);
    });
  });

  describe('basic replace', () => {
    it('should replace character under cursor', () => {
      // Cursor at position (0, 0) - 'H' in "Hello"
      state.cursor = new CursorPosition(0, 0);
      context.setCurrentPattern('ra');

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('aello');
      expect(state.cursor.line).toBe(0);
      expect(state.cursor.column).toBe(0);
    });

    it('should replace character at middle of line', () => {
      // Cursor at position (0, 2) - first 'l' in "Hello"
      state.cursor = new CursorPosition(0, 2);
      context.setCurrentPattern('rx');

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('Hexlo');
    });

    it('should replace character at end of line', () => {
      // Cursor at position (0, 4) - 'o' in "Hello"
      state.cursor = new CursorPosition(0, 4);
      context.setCurrentPattern('rz');

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('Hellz');
    });

    it('should replace with space character', () => {
      // Cursor at position (0, 0) - 'H' in "Hello"
      state.cursor = new CursorPosition(0, 0);
      context.setCurrentPattern('r ');

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe(' ello');
    });

    it('should not replace when cursor is past end of line', () => {
      // Cursor at position (0, 10) - past "Hello"
      state.cursor = new CursorPosition(0, 10);
      context.setCurrentPattern('ra');

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('Hello');
    });
  });

  describe('count support', () => {
    it('should replace multiple characters with count', () => {
      // Cursor at position (0, 0) - 'H' in "Hello"
      state.cursor = new CursorPosition(0, 0);
      context.setCount(3);
      context.setCurrentPattern('rx');

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('xxxlo');
    });

    it('should not replace past end of line', () => {
      // Cursor at position (0, 3) - 'l' in "Hello"
      state.cursor = new CursorPosition(0, 3);
      context.setCount(5);
      context.setCurrentPattern('ra');

      plugin.execute(context);

      // Only replaces 'lo' (2 chars available)
      expect(state.buffer.getLine(0)).toBe('Helaa');
    });

    it('should replace entire line content with large count', () => {
      // "Hello" has 5 characters
      state.cursor = new CursorPosition(0, 0);
      context.setCount(100);
      context.setCurrentPattern('rx');

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('xxxxx');
    });
  });

  describe('empty buffer handling', () => {
    it('should handle empty buffer gracefully', () => {
      state.buffer = new TextBuffer();
      state.cursor = new CursorPosition(0, 0);
      context.setCurrentPattern('ra');

      expect(() => plugin.execute(context)).not.toThrow();
    });

    it('should handle empty line', () => {
      state.buffer = new TextBuffer('');
      state.cursor = new CursorPosition(0, 0);
      context.setCurrentPattern('ra');

      expect(() => plugin.execute(context)).not.toThrow();
    });
  });

  describe('cursor position', () => {
    it('should keep cursor at same position after replace', () => {
      // Cursor at position (0, 1) - 'e' in "Hello"
      state.cursor = new CursorPosition(0, 1);
      context.setCurrentPattern('rx');

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('Hxllo');
      expect(state.cursor.column).toBe(1);
    });

    it('should not move cursor when replacing multiple chars', () => {
      state.cursor = new CursorPosition(0, 0);
      context.setCount(3);
      context.setCurrentPattern('rx');

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('xxxlo');
      expect(state.cursor.column).toBe(0);
    });
  });

  describe('pattern validation', () => {
    it('should validate ra pattern', () => {
      expect(plugin.validatePattern('ra')).toBe(true);
    });

    it('should validate r<space> pattern', () => {
      expect(plugin.validatePattern('r ')).toBe(true);
    });

    it('should not validate r alone', () => {
      expect(plugin.validatePattern('r')).toBe(false);
    });

    it('should not validate other patterns', () => {
      expect(plugin.validatePattern('x')).toBe(false);
      expect(plugin.validatePattern('R')).toBe(false);
      expect(plugin.validatePattern('rxtra')).toBe(false);
    });
  });

  describe('special characters', () => {
    it('should replace with special character', () => {
      state.cursor = new CursorPosition(0, 0);
      context.setCurrentPattern('r!');

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('!ello');
    });

    it('should replace with digit', () => {
      state.cursor = new CursorPosition(0, 0);
      context.setCurrentPattern('r5');

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('5ello');
    });

    it('should replace with uppercase letter', () => {
      state.cursor = new CursorPosition(0, 0);
      context.setCurrentPattern('rZ');

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('Zello');
    });
  });

  describe('multiline buffer', () => {
    it('should replace on second line', () => {
      state.cursor = new CursorPosition(1, 0); // 'W' in "World"
      context.setCurrentPattern('rx');

      plugin.execute(context);

      expect(state.buffer.getLine(1)).toBe('xorld');
    });

    it('should replace in middle of second line', () => {
      state.cursor = new CursorPosition(1, 2); // 'r' in "World"
      context.setCurrentPattern('ry');

      plugin.execute(context);

      expect(state.buffer.getLine(1)).toBe('Woyld');
    });
  });
});
