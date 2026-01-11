/**
 * HMovementPlugin Unit Tests
 * Tests for the left movement plugin (h key)
 */
import { HMovementPlugin } from '../../plugins/movement';
import { ExecutionContext } from '../../plugin/ExecutionContext';
import { VimState } from '../../state/VimState';
import { CursorPosition } from '../../state/CursorPosition';
import { VIM_MODE } from '../../state/VimMode';

describe('HMovementPlugin', () => {
  describe('Metadata', () => {
    it('should have correct name', () => {
      const plugin = new HMovementPlugin();
      expect(plugin.name).toBe('movement-h');
    });

    it('should have correct version', () => {
      const plugin = new HMovementPlugin();
      expect(plugin.version).toBe('1.0.0');
    });

    it('should have correct description', () => {
      const plugin = new HMovementPlugin();
      expect(plugin.description).toBe('Move cursor left (h key)');
    });

    it('should have correct pattern', () => {
      const plugin = new HMovementPlugin();
      expect(plugin.patterns).toEqual(['h']);
    });

    it('should support NORMAL and VISUAL modes', () => {
      const plugin = new HMovementPlugin();
      expect(plugin.modes).toContain(VIM_MODE.NORMAL);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
      expect(plugin.modes).not.toContain(VIM_MODE.INSERT);
      expect(plugin.modes).not.toContain(VIM_MODE.COMMAND);
    });
  });

  describe('Configuration', () => {
    it('should have default step of 1', () => {
      const plugin = new HMovementPlugin();
      expect(plugin.getConfig().step).toBe(1);
    });

    it('should accept custom step configuration', () => {
      const plugin = new HMovementPlugin({ step: 5 });
      expect(plugin.getConfig().step).toBe(5);
    });

    it('should update configuration at runtime', () => {
      const plugin = new HMovementPlugin();
      plugin.updateConfig({ step: 3 });
      expect(plugin.getConfig().step).toBe(3);
    });

    it('should validate pattern correctly', () => {
      const plugin = new HMovementPlugin();
      expect(plugin.validatePattern('h')).toBe(true);
      expect(plugin.validatePattern('other')).toBe(false);
    });
  });

  describe('Movement Behavior', () => {
    it('should move cursor left by 1 column', () => {
      const plugin = new HMovementPlugin();
      const state = new VimState('hello');
      state.cursor = new CursorPosition(state.cursor.line, 3);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(2);
    });

    it('should move cursor left by step columns', () => {
      const plugin = new HMovementPlugin({ step: 2 });
      const state = new VimState('hello');
      state.cursor = new CursorPosition(state.cursor.line, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(3);
    });

    it('should clamp to column 0 when at left edge', () => {
      const plugin = new HMovementPlugin();
      const state = new VimState('hello');
      state.cursor = new CursorPosition(state.cursor.line, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should not move when at column 0', () => {
      const plugin = new HMovementPlugin({ step: 5 });
      const state = new VimState('hello');
      state.cursor = new CursorPosition(state.cursor.line, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should work with custom step size', () => {
      const plugin = new HMovementPlugin({ step: 3 });
      const state = new VimState('hello world');
      state.cursor = new CursorPosition(state.cursor.line, 6);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(3);
    });

    it('should clamp to column 0 when step exceeds current position', () => {
      const plugin = new HMovementPlugin({ step: 10 });
      const state = new VimState('hello');
      state.cursor = new CursorPosition(state.cursor.line, 3);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });
  });

  describe('Mode Restrictions', () => {
    it('should execute in NORMAL mode', () => {
      const plugin = new HMovementPlugin({ step: 2 });
      const state = new VimState('hello');
      state.cursor = new CursorPosition(state.cursor.line, 4);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(2);
    });

    it('should execute in VISUAL mode', () => {
      const plugin = new HMovementPlugin({ step: 2 });
      const state = new VimState('hello');
      state.cursor = new CursorPosition(state.cursor.line, 4);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.VISUAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(2);
    });

    it('should not execute in INSERT mode', () => {
      const plugin = new HMovementPlugin({ step: 2 });
      const state = new VimState('hello');
      state.cursor = new CursorPosition(state.cursor.line, 4);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.INSERT);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(4);
    });

    it('should not execute in COMMAND mode', () => {
      const plugin = new HMovementPlugin({ step: 2 });
      const state = new VimState('hello');
      state.cursor = new CursorPosition(state.cursor.line, 4);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.COMMAND);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(4);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty buffer', () => {
      const plugin = new HMovementPlugin();
      const state = new VimState();
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle single character line', () => {
      const plugin = new HMovementPlugin();
      const state = new VimState('x');
      state.cursor = new CursorPosition(state.cursor.line, 1);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should handle multiple step movements', () => {
      const plugin = new HMovementPlugin({ step: 2 });
      const state = new VimState('hello');
      state.cursor = new CursorPosition(state.cursor.line, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(3);

      // Execute again
      plugin.execute(context);

      expect(context.getCursor().column).toBe(1);

      // Execute again - should clamp to 0
      plugin.execute(context);

      expect(context.getCursor().column).toBe(0);
    });

    it('should preserve line position', () => {
      const plugin = new HMovementPlugin();
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(1, 3);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(2);
    });

    it('should handle line with spaces', () => {
      const plugin = new HMovementPlugin();
      const state = new VimState('  leading spaces');
      state.cursor = new CursorPosition(state.cursor.line, 8);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(7);
    });

    it('should handle empty line', () => {
      const plugin = new HMovementPlugin();
      const state = new VimState('hello\n\nworld');
      state.cursor = new CursorPosition(1, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(0);
    });
  });
});
