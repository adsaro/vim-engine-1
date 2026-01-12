/**
 * ZeroMovementPlugin Unit Tests
 * Tests for the 0 key movement plugin (move to start of line)
 */
import { ZeroMovementPlugin } from './ZeroMovementPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimState } from '../../../state/VimState';
import { CursorPosition } from '../../../state/CursorPosition';
import { VIM_MODE } from '../../../state/VimMode';

describe('ZeroMovementPlugin', () => {
  describe('Metadata', () => {
    it('should have correct name', () => {
      const plugin = new ZeroMovementPlugin();
      expect(plugin.name).toBe('movement-0');
    });

    it('should have correct version', () => {
      const plugin = new ZeroMovementPlugin();
      expect(plugin.version).toBe('1.0.0');
    });

    it('should have correct description', () => {
      const plugin = new ZeroMovementPlugin();
      expect(plugin.description).toBe('Move to start of line (0 key)');
    });

    it('should have correct pattern', () => {
      const plugin = new ZeroMovementPlugin();
      expect(plugin.patterns).toEqual(['0']);
    });

    it('should support NORMAL and VISUAL modes', () => {
      const plugin = new ZeroMovementPlugin();
      expect(plugin.modes).toContain(VIM_MODE.NORMAL);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
      expect(plugin.modes).not.toContain(VIM_MODE.INSERT);
      expect(plugin.modes).not.toContain(VIM_MODE.COMMAND);
    });

    it('should validate pattern correctly', () => {
      const plugin = new ZeroMovementPlugin();
      expect(plugin.validatePattern('0')).toBe(true);
      expect(plugin.validatePattern('other')).toBe(false);
    });
  });

  describe('Basic Movement', () => {
    it('should move to column 0 from any position', () => {
      const plugin = new ZeroMovementPlugin();
      const state = new VimState('hello world');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
      expect(context.getCursor().line).toBe(0);
    });

    it('should move to column 0 from middle of line', () => {
      const plugin = new ZeroMovementPlugin();
      const state = new VimState('this is a test line');
      state.cursor = new CursorPosition(0, 10);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should stay at column 0 if already there', () => {
      const plugin = new ZeroMovementPlugin();
      const state = new VimState('hello');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should move to column 0 from end of line', () => {
      const plugin = new ZeroMovementPlugin();
      const state = new VimState('hello world');
      state.cursor = new CursorPosition(0, 11);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });
  });

  describe('Movement from Different Starting Positions', () => {
    it('should work on first line', () => {
      const plugin = new ZeroMovementPlugin();
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(0, 3);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });

    it('should work on middle line', () => {
      const plugin = new ZeroMovementPlugin();
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(1, 4);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(0);
    });

    it('should work on last line', () => {
      const plugin = new ZeroMovementPlugin();
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(2, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(0);
    });
  });

  describe('Empty Line Handling', () => {
    it('should handle empty line', () => {
      const plugin = new ZeroMovementPlugin();
      const state = new VimState('line1\n\nline3');
      state.cursor = new CursorPosition(1, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle whitespace-only line', () => {
      const plugin = new ZeroMovementPlugin();
      const state = new VimState('line1\n   \nline3');
      state.cursor = new CursorPosition(1, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle single line empty buffer', () => {
      const plugin = new ZeroMovementPlugin();
      const state = new VimState('');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });
  });

  describe('Count-Based Movements', () => {
    it('should handle count of 1 (no line movement)', () => {
      const plugin = new ZeroMovementPlugin();
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);
      context.setCount(1);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle count of 3 (move 2 lines down then to column 0)', () => {
      const plugin = new ZeroMovementPlugin();
      const state = new VimState('line1\nline2\nline3\nline4');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);
      context.setCount(3);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle count of 30 (move 3 lines down then to column 0)', () => {
      const plugin = new ZeroMovementPlugin();
      const state = new VimState('line1\nline2\nline3\nline4');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);
      context.setCount(30);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(0);
    });

    it('should clamp count movement to buffer bounds', () => {
      const plugin = new ZeroMovementPlugin();
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);
      context.setCount(10);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle count from middle of buffer', () => {
      const plugin = new ZeroMovementPlugin();
      const state = new VimState('line1\nline2\nline3\nline4\nline5');
      state.cursor = new CursorPosition(1, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);
      context.setCount(3);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(3);
      expect(context.getCursor().column).toBe(0);
    });
  });

  describe('Mode Restrictions', () => {
    it('should execute in NORMAL mode', () => {
      const plugin = new ZeroMovementPlugin();
      const state = new VimState('hello');
      state.cursor = new CursorPosition(0, 3);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should execute in VISUAL mode', () => {
      const plugin = new ZeroMovementPlugin();
      const state = new VimState('hello');
      state.cursor = new CursorPosition(0, 3);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.VISUAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should not execute in INSERT mode', () => {
      const plugin = new ZeroMovementPlugin();
      const state = new VimState('hello');
      state.cursor = new CursorPosition(0, 3);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.INSERT);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(3);
    });

    it('should not execute in COMMAND mode', () => {
      const plugin = new ZeroMovementPlugin();
      const state = new VimState('hello');
      state.cursor = new CursorPosition(0, 3);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.COMMAND);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty buffer', () => {
      const plugin = new ZeroMovementPlugin();
      const state = new VimState();
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle single character line', () => {
      const plugin = new ZeroMovementPlugin();
      const state = new VimState('x');
      state.cursor = new CursorPosition(0, 1);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should handle line with leading spaces', () => {
      const plugin = new ZeroMovementPlugin();
      const state = new VimState('  hello world');
      state.cursor = new CursorPosition(0, 8);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should handle line with tabs', () => {
      const plugin = new ZeroMovementPlugin();
      const state = new VimState('\t\thello');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should preserve line position', () => {
      const plugin = new ZeroMovementPlugin();
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(1, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should have default movement config', () => {
      const plugin = new ZeroMovementPlugin();
      const config = plugin.getConfig();

      expect(config.step).toBe(1);
      expect(config.allowWrap).toBe(false);
      expect(config.scrollOnEdge).toBe(false);
      expect(config.visualModeEnabled).toBe(true);
    });

    it('should accept custom config', () => {
      const plugin = new ZeroMovementPlugin();
      plugin.updateConfig({ step: 2, allowWrap: true });

      const config = plugin.getConfig();
      expect(config.step).toBe(2);
      expect(config.allowWrap).toBe(true);
    });
  });
});
