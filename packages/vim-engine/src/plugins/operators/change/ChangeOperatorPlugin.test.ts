/**
 * ChangeOperatorPlugin Tests
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { ChangeOperatorPlugin } from './ChangeOperatorPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimState } from '../../../state/VimState';
import { CursorPosition } from '../../../state/CursorPosition';
import { VIM_MODE } from '../../../state/VimMode';

describe('ChangeOperatorPlugin', () => {
  let plugin: ChangeOperatorPlugin;
  let context: ExecutionContext;
  let state: VimState;

  beforeEach(() => {
    plugin = new ChangeOperatorPlugin();
    state = new VimState('Hello world\nTest line\nAnother line');
    context = new ExecutionContext(state);
  });

  describe('plugin metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('operator-change');
    });

    it('should have correct version', () => {
      expect(plugin.version).toBe('1.0.0');
    });

    it('should have correct description', () => {
      expect(plugin.description).toBe('Change operator (c key)');
    });

    it('should have c and cc patterns', () => {
      expect(plugin.patterns).toContain('c');
      expect(plugin.patterns).toContain('cc');
    });

    it('should support NORMAL and OPERATOR_PENDING modes', () => {
      expect(plugin.modes).toContain('NORMAL');
      expect(plugin.modes).toContain('OPERATOR_PENDING');
    });
  });

  describe('entering operator-pending mode', () => {
    it('should enter operator-pending mode when c is pressed in normal mode', () => {
      expect(context.getMode()).toBe(VIM_MODE.NORMAL);

      context.setCurrentPattern('c');
      plugin.execute(context);

      expect(context.getMode()).toBe(VIM_MODE.OPERATOR_PENDING);
      expect(state.getPendingOperator()).toBe('c');
    });

    it('should save pending count when entering operator-pending mode', () => {
      context.setCount(3);

      context.setCurrentPattern('c');
      plugin.execute(context);

      expect(state.getPendingCount()).toBe(3);
    });
  });

  describe('cc - change line', () => {
    it('should change current line immediately with cc in normal mode', () => {
      state.cursor = new CursorPosition(0, 3);
      context.setCurrentPattern('cc');

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('');
      expect(context.getMode()).toBe(VIM_MODE.INSERT);
    });

    it('should store deleted line in register', () => {
      state.cursor = new CursorPosition(0, 0);
      context.setCurrentPattern('cc');

      plugin.execute(context);

      expect(context.getRegister('"')).toBe('Hello world\n');
    });

    it('should change multiple lines with count', () => {
      context.setCount(2);
      state.cursor = new CursorPosition(0, 0);
      context.setCurrentPattern('cc');

      plugin.execute(context);

      expect(state.buffer.getLine(0)).toBe('');
      expect(state.buffer.getLine(1)).toBe('');
      expect(state.buffer.getLine(2)).toBe('Another line');
      expect(context.getMode()).toBe(VIM_MODE.INSERT);
    });

    it('should enter insert mode for empty buffer', () => {
      state.buffer.setContent('');
      state.cursor = new CursorPosition(0, 0);
      context.setCurrentPattern('cc');

      plugin.execute(context);

      expect(context.getMode()).toBe(VIM_MODE.INSERT);
    });
  });

  describe('cc in operator-pending mode', () => {
    it('should change line when second c is pressed', () => {
      // First c enters operator-pending mode
      state.cursor = new CursorPosition(1, 0);
      context.setCurrentPattern('c');
      plugin.execute(context);

      expect(context.getMode()).toBe(VIM_MODE.OPERATOR_PENDING);

      // Second c changes the line - plugin should be called in OPERATOR_PENDING mode
      context.setMode(VIM_MODE.OPERATOR_PENDING); // Keep mode as OPERATOR_PENDING
      context.setCurrentPattern('cc');
      plugin.execute(context);

      expect(state.buffer.getLine(1)).toBe('');
      expect(context.getMode()).toBe(VIM_MODE.INSERT);
      expect(state.getPendingOperator()).toBeNull();
    });
  });

  describe('executeChangeWithMotion', () => {
    it('should delete text between positions and enter insert mode', () => {
      state.cursor = new CursorPosition(0, 0);
      const from = new CursorPosition(0, 0);
      const to = new CursorPosition(0, 5); // "Hello"

      plugin.executeChangeWithMotion(context, from, to, false);

      expect(state.buffer.getLine(0)).toBe(' world');
      expect(context.getMode()).toBe(VIM_MODE.INSERT);
    });

    it('should store deleted text in register', () => {
      state.cursor = new CursorPosition(0, 0);
      const from = new CursorPosition(0, 0);
      const to = new CursorPosition(0, 5);

      plugin.executeChangeWithMotion(context, from, to, false);

      expect(context.getRegister('"')).toBe('Hello');
    });

    it('should handle inclusive motion', () => {
      state.cursor = new CursorPosition(0, 0);
      const from = new CursorPosition(0, 0);
      const to = new CursorPosition(0, 4); // 'o' in "Hello"

      plugin.executeChangeWithMotion(context, from, to, true);

      expect(state.buffer.getLine(0)).toBe(' world');
      expect(context.getMode()).toBe(VIM_MODE.INSERT);
    });

    it('should handle multi-line change', () => {
      state.cursor = new CursorPosition(0, 0);
      const from = new CursorPosition(0, 6); // After "Hello "
      const to = new CursorPosition(1, 4);   // "Test"

      plugin.executeChangeWithMotion(context, from, to, false);

      // "Hello " + " line" = "Hello  line" (two spaces: one from "Hello " and one from " line")
      expect(state.buffer.getLine(0)).toBe('Hello  line');
      expect(state.buffer.getLine(1)).toBe('Another line');
      expect(context.getMode()).toBe(VIM_MODE.INSERT);
    });

    it('should handle empty buffer', () => {
      state.buffer.setContent('');
      state.cursor = new CursorPosition(0, 0);
      const from = new CursorPosition(0, 0);
      const to = new CursorPosition(0, 0);

      plugin.executeChangeWithMotion(context, from, to, false);

      expect(context.getMode()).toBe(VIM_MODE.INSERT);
    });

    it('should move cursor to start position after change', () => {
      state.cursor = new CursorPosition(0, 10);
      const from = new CursorPosition(0, 2);
      const to = new CursorPosition(0, 5);

      plugin.executeChangeWithMotion(context, from, to, false);

      expect(state.cursor.line).toBe(0);
      expect(state.cursor.column).toBe(2);
    });
  });

  describe('pattern validation', () => {
    it('should validate c pattern', () => {
      expect(plugin.validatePattern('c')).toBe(true);
    });

    it('should validate cc pattern', () => {
      expect(plugin.validatePattern('cc')).toBe(true);
    });

    it('should not validate other patterns', () => {
      expect(plugin.validatePattern('d')).toBe(false);
      expect(plugin.validatePattern('x')).toBe(false);
      expect(plugin.validatePattern('ccc')).toBe(false);
    });
  });

  describe('cw edge cases', () => {
    it('should handle change at end of line', () => {
      // "Hello world" has length 11, so position 10 is 'd', position 11 is past end
      state.cursor = new CursorPosition(0, 10); // 'd' in "Hello world"
      const from = new CursorPosition(0, 10);
      const to = new CursorPosition(0, 11); // Past end of line

      plugin.executeChangeWithMotion(context, from, to, false);

      // Should delete from position 10 to end of line (exclusive)
      expect(state.buffer.getLine(0)).toBe('Hello worl');
      expect(context.getMode()).toBe(VIM_MODE.INSERT);
    });

    it('should handle change across lines', () => {
      state.cursor = new CursorPosition(0, 6); // "world"
      const from = new CursorPosition(0, 6);
      const to = new CursorPosition(1, 4);     // "Test"

      plugin.executeChangeWithMotion(context, from, to, false);

      // "Hello " + " line" = "Hello  line" (two spaces)
      expect(state.buffer.getLine(0)).toBe('Hello  line');
      expect(context.getMode()).toBe(VIM_MODE.INSERT);
    });
  });
});
