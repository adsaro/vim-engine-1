/**
 * DollarMovementPlugin Unit Tests
 * Tests for the $ key movement plugin (move to end of line)
 */
import { DollarMovementPlugin } from './DollarMovementPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimState } from '../../../state/VimState';
import { CursorPosition } from '../../../state/CursorPosition';
import { VIM_MODE } from '../../../state/VimMode';

describe('DollarMovementPlugin', () => {
  describe('Metadata', () => {
    it('should have correct name', () => {
      const plugin = new DollarMovementPlugin();
      expect(plugin.name).toBe('movement-dollar');
    });

    it('should have correct version', () => {
      const plugin = new DollarMovementPlugin();
      expect(plugin.version).toBe('1.0.0');
    });

    it('should have correct description', () => {
      const plugin = new DollarMovementPlugin();
      expect(plugin.description).toBe('Move to end of line ($ key)');
    });

    it('should have correct pattern', () => {
      const plugin = new DollarMovementPlugin();
      expect(plugin.patterns).toEqual(['$']);
    });

    it('should support NORMAL and VISUAL modes', () => {
      const plugin = new DollarMovementPlugin();
      expect(plugin.modes).toContain(VIM_MODE.NORMAL);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
      expect(plugin.modes).not.toContain(VIM_MODE.INSERT);
      expect(plugin.modes).not.toContain(VIM_MODE.COMMAND);
    });

    it('should validate pattern correctly', () => {
      const plugin = new DollarMovementPlugin();
      expect(plugin.validatePattern('$')).toBe(true);
      expect(plugin.validatePattern('other')).toBe(false);
    });
  });

  describe('Movement to Last Character', () => {
    it('should move to last character of line', () => {
      const plugin = new DollarMovementPlugin();
      const state = new VimState('hello world');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(10);
    });

    it('should move to last character from middle of line', () => {
      const plugin = new DollarMovementPlugin();
      const state = new VimState('hello world');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(10);
    });

    it('should stay at last character if already there', () => {
      const plugin = new DollarMovementPlugin();
      const state = new VimState('hello world');
      state.cursor = new CursorPosition(0, 10);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(10);
    });
  });

  describe('Non-Empty Line Handling', () => {
    it('should handle line with trailing spaces', () => {
      const plugin = new DollarMovementPlugin();
      const state = new VimState('hello world  ');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(12);
    });

    it('should handle line with trailing tabs', () => {
      const plugin = new DollarMovementPlugin();
      const state = new VimState('hello world\t\t');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(12);
    });

    it('should handle line with mixed trailing whitespace', () => {
      const plugin = new DollarMovementPlugin();
      const state = new VimState('hello world \t ');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(12);
    });
  });

  describe('Empty Line Handling', () => {
    it('should stay at column 0 on empty line', () => {
      const plugin = new DollarMovementPlugin();
      const state = new VimState('line1\n\nline3');
      state.cursor = new CursorPosition(1, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(0);
    });

    it('should stay at column 0 on whitespace-only line', () => {
      const plugin = new DollarMovementPlugin();
      const state = new VimState('line1\n   \nline3');
      state.cursor = new CursorPosition(1, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(3);
    });

    it('should handle single line empty buffer', () => {
      const plugin = new DollarMovementPlugin();
      const state = new VimState('');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });
  });

  describe('Single Character Line Handling', () => {
    it('should move to column 0 on single character line', () => {
      const plugin = new DollarMovementPlugin();
      const state = new VimState('x');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should stay at column 0 on single character line if already there', () => {
      const plugin = new DollarMovementPlugin();
      const state = new VimState('x');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });
  });

  describe('Count-Based Movements', () => {
    it('should handle count of 1 (no line movement)', () => {
      const plugin = new DollarMovementPlugin();
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);
      context.setCount(1);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(4);
    });

    it('should handle count of 3 (move 2 lines down then to end)', () => {
      const plugin = new DollarMovementPlugin();
      const state = new VimState('line1\nline2\nline3\nline4');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);
      context.setCount(3);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(4);
    });

    it('should handle count with different line lengths', () => {
      const plugin = new DollarMovementPlugin();
      const state = new VimState('line1\nline22\nline333\nline4444');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);
      context.setCount(3);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(7);
    });

    it('should clamp count movement to buffer bounds', () => {
      const plugin = new DollarMovementPlugin();
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);
      context.setCount(10);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(4);
    });
  });

  describe('Mode Restrictions', () => {
    it('should execute in NORMAL mode', () => {
      const plugin = new DollarMovementPlugin();
      const state = new VimState('hello');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(4);
    });

    it('should execute in VISUAL mode', () => {
      const plugin = new DollarMovementPlugin();
      const state = new VimState('hello');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.VISUAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(4);
    });

    it('should not execute in INSERT mode', () => {
      const plugin = new DollarMovementPlugin();
      const state = new VimState('hello');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.INSERT);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should not execute in COMMAND mode', () => {
      const plugin = new DollarMovementPlugin();
      const state = new VimState('hello');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.COMMAND);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty buffer', () => {
      const plugin = new DollarMovementPlugin();
      const state = new VimState();
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle line with no trailing whitespace', () => {
      const plugin = new DollarMovementPlugin();
      const state = new VimState('hello world');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(10);
    });

    it('should preserve line position', () => {
      const plugin = new DollarMovementPlugin();
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(1, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(4);
    });

    it('should handle line with only whitespace', () => {
      const plugin = new DollarMovementPlugin();
      const state = new VimState('   ');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(2);
    });
  });

  describe('Configuration', () => {
    it('should have default movement config', () => {
      const plugin = new DollarMovementPlugin();
      const config = plugin.getConfig();

      expect(config.step).toBe(1);
      expect(config.allowWrap).toBe(false);
      expect(config.scrollOnEdge).toBe(false);
      expect(config.visualModeEnabled).toBe(true);
    });

    it('should accept custom config', () => {
      const plugin = new DollarMovementPlugin();
      plugin.updateConfig({ step: 2, allowWrap: true });

      const config = plugin.getConfig();
      expect(config.step).toBe(2);
      expect(config.allowWrap).toBe(true);
    });
  });
});
