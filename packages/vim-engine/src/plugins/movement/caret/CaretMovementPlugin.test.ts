/**
 * CaretMovementPlugin Unit Tests
 * Tests for the ^ key movement plugin (move to first non-whitespace)
 */
import { CaretMovementPlugin } from './CaretMovementPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimState } from '../../../state/VimState';
import { CursorPosition } from '../../../state/CursorPosition';
import { VIM_MODE } from '../../../state/VimMode';

describe('CaretMovementPlugin', () => {
  describe('Metadata', () => {
    it('should have correct name', () => {
      const plugin = new CaretMovementPlugin();
      expect(plugin.name).toBe('movement-caret');
    });

    it('should have correct version', () => {
      const plugin = new CaretMovementPlugin();
      expect(plugin.version).toBe('1.0.0');
    });

    it('should have correct description', () => {
      const plugin = new CaretMovementPlugin();
      expect(plugin.description).toBe('Move to first non-blank character (^ key)');
    });

    it('should have correct pattern', () => {
      const plugin = new CaretMovementPlugin();
      expect(plugin.patterns).toEqual(['^']);
    });

    it('should support NORMAL and VISUAL modes', () => {
      const plugin = new CaretMovementPlugin();
      expect(plugin.modes).toContain(VIM_MODE.NORMAL);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
      expect(plugin.modes).not.toContain(VIM_MODE.INSERT);
      expect(plugin.modes).not.toContain(VIM_MODE.COMMAND);
    });

    it('should validate pattern correctly', () => {
      const plugin = new CaretMovementPlugin();
      expect(plugin.validatePattern('^')).toBe(true);
      expect(plugin.validatePattern('other')).toBe(false);
    });
  });

  describe('Movement to First Non-Whitespace', () => {
    it('should move to first non-whitespace character', () => {
      const plugin = new CaretMovementPlugin();
      const state = new VimState('hello world');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should move to first non-whitespace on line with leading spaces', () => {
      const plugin = new CaretMovementPlugin();
      const state = new VimState('  hello world');
      state.cursor = new CursorPosition(0, 8);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(2);
    });

    it('should move to first non-whitespace on line with leading tabs', () => {
      const plugin = new CaretMovementPlugin();
      const state = new VimState('\t\thello world');
      state.cursor = new CursorPosition(0, 8);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(2);
    });

    it('should move to first non-whitespace on line with mixed leading whitespace', () => {
      const plugin = new CaretMovementPlugin();
      const state = new VimState(' \t hello world');
      state.cursor = new CursorPosition(0, 8);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(3);
    });

    it('should stay at first non-whitespace if already there', () => {
      const plugin = new CaretMovementPlugin();
      const state = new VimState('  hello world');
      state.cursor = new CursorPosition(0, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(2);
    });
  });

  describe('Empty Line Handling', () => {
    it('should stay at column 0 on empty line', () => {
      const plugin = new CaretMovementPlugin();
      const state = new VimState('line1\n\nline3');
      state.cursor = new CursorPosition(1, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(0);
    });

    it('should stay at column 0 on whitespace-only line', () => {
      const plugin = new CaretMovementPlugin();
      const state = new VimState('line1\n   \nline3');
      state.cursor = new CursorPosition(1, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(0);
    });

    it('should stay at column 0 on tab-only line', () => {
      const plugin = new CaretMovementPlugin();
      const state = new VimState('line1\n\t\t\t\nline3');
      state.cursor = new CursorPosition(1, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(0);
    });

    it('should stay at column 0 on mixed whitespace-only line', () => {
      const plugin = new CaretMovementPlugin();
      const state = new VimState('line1\n \t \nline3');
      state.cursor = new CursorPosition(1, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(0);
    });
  });

  describe('Count-Based Movements', () => {
    it('should handle count of 1 (no line movement)', () => {
      const plugin = new CaretMovementPlugin();
      const state = new VimState('  line1\n  line2\n  line3');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);
      context.setCount(1);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(2);
    });

    it('should handle count of 3 (move 2 lines down then to first non-whitespace)', () => {
      const plugin = new CaretMovementPlugin();
      const state = new VimState('  line1\n  line2\n  line3\n  line4');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);
      context.setCount(3);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(2);
    });

    it('should handle count with different indentation levels', () => {
      const plugin = new CaretMovementPlugin();
      const state = new VimState('    line1\n  line2\n        line3\n  line4');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);
      context.setCount(3);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(8);
    });

    it('should clamp count movement to buffer bounds', () => {
      const plugin = new CaretMovementPlugin();
      const state = new VimState('  line1\n  line2\n  line3');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);
      context.setCount(10);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(2);
    });
  });

  describe('Mode Restrictions', () => {
    it('should execute in NORMAL mode', () => {
      const plugin = new CaretMovementPlugin();
      const state = new VimState('  hello');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(2);
    });

    it('should execute in VISUAL mode', () => {
      const plugin = new CaretMovementPlugin();
      const state = new VimState('  hello');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.VISUAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(2);
    });

    it('should not execute in INSERT mode', () => {
      const plugin = new CaretMovementPlugin();
      const state = new VimState('  hello');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.INSERT);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(5);
    });

    it('should not execute in COMMAND mode', () => {
      const plugin = new CaretMovementPlugin();
      const state = new VimState('  hello');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.COMMAND);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty buffer', () => {
      const plugin = new CaretMovementPlugin();
      const state = new VimState();
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle single character line', () => {
      const plugin = new CaretMovementPlugin();
      const state = new VimState('x');
      state.cursor = new CursorPosition(0, 1);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should handle line with no leading whitespace', () => {
      const plugin = new CaretMovementPlugin();
      const state = new VimState('hello world');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should preserve line position', () => {
      const plugin = new CaretMovementPlugin();
      const state = new VimState('line1\n  line2\nline3');
      state.cursor = new CursorPosition(1, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(2);
    });

    it('should handle line with only one non-whitespace character', () => {
      const plugin = new CaretMovementPlugin();
      const state = new VimState('  x');
      state.cursor = new CursorPosition(0, 3);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(2);
    });
  });

  describe('Configuration', () => {
    it('should have default movement config', () => {
      const plugin = new CaretMovementPlugin();
      const config = plugin.getConfig();

      expect(config.step).toBe(1);
      expect(config.allowWrap).toBe(false);
      expect(config.scrollOnEdge).toBe(false);
      expect(config.visualModeEnabled).toBe(true);
    });

    it('should accept custom config', () => {
      const plugin = new CaretMovementPlugin();
      plugin.updateConfig({ step: 2, allowWrap: true });

      const config = plugin.getConfig();
      expect(config.step).toBe(2);
      expect(config.allowWrap).toBe(true);
    });
  });
});
