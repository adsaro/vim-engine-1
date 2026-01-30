/**
 * DCapitalDeletePlugin Tests
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { DCapitalDeletePlugin } from './DCapitalDeletePlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimState } from '../../../state/VimState';
import { CursorPosition } from '../../../state/CursorPosition';
import { TextBuffer } from '../../../state/TextBuffer';
import { VIM_MODE } from '../../../state/VimMode';

describe('DCapitalDeletePlugin', () => {
  let plugin: DCapitalDeletePlugin;
  let context: ExecutionContext;
  let state: VimState;

  beforeEach(() => {
    plugin = new DCapitalDeletePlugin();
    state = new VimState('Hello world\nTest line\nAnother line');
    context = new ExecutionContext(state);
  });

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('operator-D-capital');
    });

    it('should have correct version', () => {
      expect(plugin.version).toBe('1.0.0');
    });

    it('should have correct description', () => {
      expect(plugin.description).toBe('Delete to end of line (D key - capital)');
    });

    it('should have D pattern', () => {
      expect(plugin.patterns).toContain('D');
    });

    it('should support NORMAL mode', () => {
      expect(plugin.modes).toContain('NORMAL');
    });

    it('should support VISUAL mode', () => {
      expect(plugin.modes).toContain('VISUAL');
    });
  });

  describe('basic delete to end of line', () => {
    it('should delete from cursor to end of line', () => {
      // Cursor at position (0, 6) - after "Hello "
      state.cursor = new CursorPosition(0, 6);

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('Hello ');
      expect(state.cursor.line).toBe(0);
      expect(state.cursor.column).toBe(6);
    });

    it('should delete entire line when cursor is at start', () => {
      state.cursor = new CursorPosition(0, 0);

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('');
      expect(state.cursor.column).toBe(0);
    });

    it('should do nothing when cursor is already at end of line', () => {
      const line = state.buffer.getLine(0);
      state.cursor = new CursorPosition(0, line?.length || 0);

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('Hello world');
    });
  });

  describe('count support', () => {
    it('should delete to end of current line with count 1', () => {
      state.cursor = new CursorPosition(0, 6);
      context.setCount(1);

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('Hello ');
    });

    it('should delete to end of line 3 lines down with count 3', () => {
      // Cursor at (0, 6), with count 3 should delete from line 0 to end of line 2
      state.cursor = new CursorPosition(0, 6);
      context.setCount(3);

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('Hello ');
      expect(state.buffer.getLineCount()).toBe(1);
    });

    it('should handle count larger than remaining lines', () => {
      state.cursor = new CursorPosition(0, 6);
      context.setCount(10);

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('Hello ');
      expect(state.buffer.getLineCount()).toBe(1);
    });
  });

  describe('register storage', () => {
    it('should store deleted text in unnamed register', () => {
      state.cursor = new CursorPosition(0, 6);

      plugin.execute(context);

      expect(context.getRegister('"')).toBe('world');
    });

    it('should store multi-line deleted text in register', () => {
      state.cursor = new CursorPosition(0, 6);
      context.setCount(2);

      plugin.execute(context);

      expect(context.getRegister('"')).toBe('world\nTest line');
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

  describe('pattern validation', () => {
    it('should validate D pattern', () => {
      expect(plugin.validatePattern('D')).toBe(true);
    });

    it('should not validate other patterns', () => {
      expect(plugin.validatePattern('d')).toBe(false);
      expect(plugin.validatePattern('dd')).toBe(false);
      expect(plugin.validatePattern('x')).toBe(false);
    });
  });
});
