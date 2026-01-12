/**
 * GUnderscoreMovementPlugin Unit Tests
 * Tests for the g_ key movement plugin (move to last non-whitespace)
 */
import { GUnderscoreMovementPlugin } from './GUnderscoreMovementPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimState } from '../../../state/VimState';
import { CursorPosition } from '../../../state/CursorPosition';
import { VIM_MODE } from '../../../state/VimMode';

describe('GUnderscoreMovementPlugin', () => {
  describe('Metadata', () => {
    it('should have correct name', () => {
      const plugin = new GUnderscoreMovementPlugin();
      expect(plugin.name).toBe('movement-g-underscore');
    });

    it('should have correct version', () => {
      const plugin = new GUnderscoreMovementPlugin();
      expect(plugin.version).toBe('1.0.0');
    });

    it('should have correct description', () => {
      const plugin = new GUnderscoreMovementPlugin();
      expect(plugin.description).toBe('Move to last non-blank character (g_ key)');
    });

    it('should have correct pattern', () => {
      const plugin = new GUnderscoreMovementPlugin();
      expect(plugin.patterns).toEqual(['g_']);
    });

    it('should support NORMAL and VISUAL modes', () => {
      const plugin = new GUnderscoreMovementPlugin();
      expect(plugin.modes).toContain(VIM_MODE.NORMAL);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
      expect(plugin.modes).not.toContain(VIM_MODE.INSERT);
      expect(plugin.modes).not.toContain(VIM_MODE.COMMAND);
    });

    it('should validate pattern correctly', () => {
      const plugin = new GUnderscoreMovementPlugin();
      expect(plugin.validatePattern('g_')).toBe(true);
      expect(plugin.validatePattern('other')).toBe(false);
    });
  });

  describe('Movement to Last Non-Whitespace', () => {
    it('should move to last non-whitespace character', () => {
      const plugin = new GUnderscoreMovementPlugin();
      const state = new VimState('hello world');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(10);
    });

    it('should move to last non-whitespace on line with trailing spaces', () => {
      const plugin = new GUnderscoreMovementPlugin();
      const state = new VimState('hello world  ');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(10);
    });

    it('should move to last non-whitespace on line with trailing tabs', () => {
      const plugin = new GUnderscoreMovementPlugin();
      const state = new VimState('hello world\t\t');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(10);
    });

    it('should move to last non-whitespace on line with mixed trailing whitespace', () => {
      const plugin = new GUnderscoreMovementPlugin();
      const state = new VimState('hello world \t ');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(10);
    });

    it('should stay at last non-whitespace if already there', () => {
      const plugin = new GUnderscoreMovementPlugin();
      const state = new VimState('hello world');
      state.cursor = new CursorPosition(0, 10);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(10);
    });
  });

  describe('Empty Line Handling', () => {
    it('should stay at column 0 on empty line', () => {
      const plugin = new GUnderscoreMovementPlugin();
      const state = new VimState('line1\n\nline3');
      state.cursor = new CursorPosition(1, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(0);
    });

    it('should stay at column 0 on whitespace-only line', () => {
      const plugin = new GUnderscoreMovementPlugin();
      const state = new VimState('line1\n   \nline3');
      state.cursor = new CursorPosition(1, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(0);
    });

    it('should stay at column 0 on tab-only line', () => {
      const plugin = new GUnderscoreMovementPlugin();
      const state = new VimState('line1\n\t\t\t\nline3');
      state.cursor = new CursorPosition(1, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(0);
    });

    it('should stay at column 0 on mixed whitespace-only line', () => {
      const plugin = new GUnderscoreMovementPlugin();
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
      const plugin = new GUnderscoreMovementPlugin();
      const state = new VimState('line1  \nline2  \nline3  ');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);
      context.setCount(1);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(4);
    });

    it('should handle count of 3 (move 2 lines down then to last non-whitespace)', () => {
      const plugin = new GUnderscoreMovementPlugin();
      const state = new VimState('line1  \nline2  \nline3  \nline4  ');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);
      context.setCount(3);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(4);
    });

    it('should handle count with different trailing whitespace', () => {
      const plugin = new GUnderscoreMovementPlugin();
      const state = new VimState('line1\t\nline2  \nline3\t \nline4');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);
      context.setCount(3);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(4);
    });

    it('should clamp count movement to buffer bounds', () => {
      const plugin = new GUnderscoreMovementPlugin();
      const state = new VimState('line1  \nline2  \nline3  ');
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
      const plugin = new GUnderscoreMovementPlugin();
      const state = new VimState('hello  ');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(4);
    });

    it('should execute in VISUAL mode', () => {
      const plugin = new GUnderscoreMovementPlugin();
      const state = new VimState('hello  ');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.VISUAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(4);
    });

    it('should not execute in INSERT mode', () => {
      const plugin = new GUnderscoreMovementPlugin();
      const state = new VimState('hello  ');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.INSERT);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should not execute in COMMAND mode', () => {
      const plugin = new GUnderscoreMovementPlugin();
      const state = new VimState('hello  ');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.COMMAND);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty buffer', () => {
      const plugin = new GUnderscoreMovementPlugin();
      const state = new VimState();
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle single character line', () => {
      const plugin = new GUnderscoreMovementPlugin();
      const state = new VimState('x');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should handle line with no trailing whitespace', () => {
      const plugin = new GUnderscoreMovementPlugin();
      const state = new VimState('hello world');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(10);
    });

    it('should preserve line position', () => {
      const plugin = new GUnderscoreMovementPlugin();
      const state = new VimState('line1  \nline2  \nline3');
      state.cursor = new CursorPosition(1, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(4);
    });

    it('should handle line with only one non-whitespace character', () => {
      const plugin = new GUnderscoreMovementPlugin();
      const state = new VimState('x  ');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should handle line with only whitespace', () => {
      const plugin = new GUnderscoreMovementPlugin();
      const state = new VimState('   ');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should have default movement config', () => {
      const plugin = new GUnderscoreMovementPlugin();
      const config = plugin.getConfig();

      expect(config.step).toBe(1);
      expect(config.allowWrap).toBe(false);
      expect(config.scrollOnEdge).toBe(false);
      expect(config.visualModeEnabled).toBe(true);
    });

    it('should accept custom config', () => {
      const plugin = new GUnderscoreMovementPlugin();
      plugin.updateConfig({ step: 2, allowWrap: true });

      const config = plugin.getConfig();
      expect(config.step).toBe(2);
      expect(config.allowWrap).toBe(true);
    });
  });
});
