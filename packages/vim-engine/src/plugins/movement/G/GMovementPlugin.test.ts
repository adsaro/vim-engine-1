/**
 * GMovementPlugin Unit Tests
 * Tests for the jump to last line or specific line with count prefix (G key)
 */
import { GMovementPlugin } from './GMovementPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimState } from '../../../state/VimState';
import { CursorPosition } from '../../../state/CursorPosition';
import { VIM_MODE } from '../../../state/VimMode';

describe('GMovementPlugin', () => {
  describe('Metadata', () => {
    it('should have correct name', () => {
      const plugin = new GMovementPlugin();
      expect(plugin.name).toBe('movement-G');
    });

    it('should have correct version', () => {
      const plugin = new GMovementPlugin();
      expect(plugin.version).toBe('1.0.0');
    });

    it('should have correct description', () => {
      const plugin = new GMovementPlugin();
      expect(plugin.description).toBe('Jump to last line or specific line with count prefix');
    });

    it('should have correct pattern', () => {
      const plugin = new GMovementPlugin();
      expect(plugin.patterns).toEqual(['G']);
    });

    it('should support NORMAL and VISUAL modes', () => {
      const plugin = new GMovementPlugin();
      expect(plugin.modes).toContain(VIM_MODE.NORMAL);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
      expect(plugin.modes).not.toContain(VIM_MODE.INSERT);
      expect(plugin.modes).not.toContain(VIM_MODE.COMMAND);
    });
  });

  describe('Configuration', () => {
    it('should have default step of -1 (represents no count)', () => {
      const plugin = new GMovementPlugin();
      expect(plugin.getConfig().step).toBe(-1);
    });

    it('should accept custom step configuration', () => {
      const plugin = new GMovementPlugin({ step: 10 });
      expect(plugin.getConfig().step).toBe(10);
    });

    it('should update configuration at runtime', () => {
      const plugin = new GMovementPlugin();
      plugin.updateConfig({ step: 5 });
      expect(plugin.getConfig().step).toBe(5);
    });

    it('should validate pattern correctly', () => {
      const plugin = new GMovementPlugin();
      expect(plugin.validatePattern('G')).toBe(true);
      expect(plugin.validatePattern('other')).toBe(false);
    });
  });

  describe('G Movement (no count prefix)', () => {
    it('should jump to last line from middle of buffer', () => {
      const plugin = new GMovementPlugin();
      const state = new VimState('line1\nline2\nline3\nline4\nline5');
      state.cursor = new CursorPosition(2, 3);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(4); // Last line (0-based)
      expect(context.getCursor().column).toBe(0); // Column set to 0
    });

    it('should jump to last line from first line', () => {
      const plugin = new GMovementPlugin();
      const state = new VimState('line1\nline2\nline3\nline4\nline5');
      state.cursor = new CursorPosition(0, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(4); // Last line (0-based)
      expect(context.getCursor().column).toBe(0); // Column set to 0
    });

    it('should stay on last line when already there', () => {
      const plugin = new GMovementPlugin();
      const state = new VimState('line1\nline2\nline3\nline4\nline5');
      state.cursor = new CursorPosition(4, 1);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(4); // Still on last line
      expect(context.getCursor().column).toBe(0); // Column set to 0
    });

    it('should handle single line buffer', () => {
      const plugin = new GMovementPlugin();
      const state = new VimState('single line');
      state.cursor = new CursorPosition(0, 3);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0); // Only line
      expect(context.getCursor().column).toBe(0); // Column set to 0
    });

    it('should handle empty buffer', () => {
      const plugin = new GMovementPlugin();
      const state = new VimState();
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });

    it('should set column to 0 when jumping to last line', () => {
      const plugin = new GMovementPlugin();
      const state = new VimState('line1\nline2\nline3\nline4\nline5');
      state.cursor = new CursorPosition(1, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(4);
      expect(context.getCursor().column).toBe(0); // Column set to 0
    });
  });

  describe('numberG Movement (with count prefix)', () => {
    it('should jump to line 10 with 10G (0-based: 9)', () => {
      const plugin = new GMovementPlugin({ step: 10 });
      const state = new VimState(Array(20).fill('line').join('\n'));
      state.cursor = new CursorPosition(0, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(9); // Line 10 in 1-based = 9 in 0-based
      expect(context.getCursor().column).toBe(0); // Column set to 0
    });

    it('should jump to line 1 with 1G (0-based: 0)', () => {
      const plugin = new GMovementPlugin({ step: 1 });
      const state = new VimState('line1\nline2\nline3\nline4\nline5');
      state.cursor = new CursorPosition(4, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0); // Line 1 in 1-based = 0 in 0-based
      expect(context.getCursor().column).toBe(0); // Column set to 0
    });

    it('should jump to line 2 with 2G (0-based: 1)', () => {
      const plugin = new GMovementPlugin({ step: 2 });
      const state = new VimState('line1\nline2\nline3\nline4\nline5');
      state.cursor = new CursorPosition(0, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1); // Line 2 in 1-based = 1 in 0-based
      expect(context.getCursor().column).toBe(0); // Column set to 0
    });

    it('should jump to line 5 with 5G (0-based: 4)', () => {
      const plugin = new GMovementPlugin({ step: 5 });
      const state = new VimState('line1\nline2\nline3\nline4\nline5');
      state.cursor = new CursorPosition(0, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(4); // Line 5 in 1-based = 4 in 0-based
      expect(context.getCursor().column).toBe(0); // Column set to 0
    });

    it('should clamp to last line when count exceeds buffer size', () => {
      const plugin = new GMovementPlugin({ step: 100 });
      const state = new VimState('line1\nline2\nline3\nline4\nline5');
      state.cursor = new CursorPosition(0, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(4); // Clamped to last line (0-based)
      expect(context.getCursor().column).toBe(0); // Column set to 0
    });

    it('should handle 0G as jump to last line (same as G)', () => {
      const plugin = new GMovementPlugin({ step: 0 });
      const state = new VimState('line1\nline2\nline3\nline4\nline5');
      state.cursor = new CursorPosition(0, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(4); // Last line
      expect(context.getCursor().column).toBe(0); // Column set to 0
    });

    it('should handle very large count values', () => {
      const plugin = new GMovementPlugin({ step: 999999 });
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(0, 1);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2); // Clamped to last line
      expect(context.getCursor().column).toBe(0); // Column set to 0
    });

    it('should set column to 0 when jumping to specific line', () => {
      const plugin = new GMovementPlugin({ step: 3 });
      const state = new VimState('line1\nline2\nline3\nline4\nline5');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2); // Line 3 in 1-based = 2 in 0-based
      expect(context.getCursor().column).toBe(0); // Column set to 0
    });
  });

  describe('Column Position', () => {
    it('should set column to 0 when moving to longer line', () => {
      const plugin = new GMovementPlugin();
      const state = new VimState('short\nvery long line here\nshort');
      state.cursor = new CursorPosition(0, 3);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(0); // Column set to 0
    });

    it('should set column to 0 when moving to shorter line', () => {
      const plugin = new GMovementPlugin({ step: 2 });
      const state = new VimState('very long line here\nshort\nvery long line here');
      state.cursor = new CursorPosition(0, 10);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(0); // Column set to 0
    });

    it('should set column to 0 across movements', () => {
      const plugin = new GMovementPlugin();
      const state = new VimState('line1\nab\nline3\nline4\nline5');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      // First G: jump to last line
      plugin.execute(context);
      expect(context.getCursor().line).toBe(4);
      expect(context.getCursor().column).toBe(0);

      // Move cursor to line 0 manually
      context.setCursor(new CursorPosition(0, 5));

      // Second G: jump to last line again
      plugin.execute(context);
      expect(context.getCursor().line).toBe(4);
      expect(context.getCursor().column).toBe(0);
    });

    it('should set column to 0 with count prefix', () => {
      const plugin = new GMovementPlugin({ step: 3 });
      const state = new VimState('line1\nline2\nline3\nline4\nline5');
      state.cursor = new CursorPosition(0, 4);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(0); // Column set to 0
    });

    it('should set column to 0 when moving to shorter line with count', () => {
      const plugin = new GMovementPlugin({ step: 2 });
      const state = new VimState('very long line here\nab\nline3');
      state.cursor = new CursorPosition(0, 10);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(0); // Column set to 0
    });
  });

  describe('Mode Restrictions', () => {
    it('should execute in NORMAL mode', () => {
      const plugin = new GMovementPlugin();
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(0, 1);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
    });

    it('should execute in VISUAL mode', () => {
      const plugin = new GMovementPlugin();
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(0, 1);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.VISUAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
    });

    it('should not execute in INSERT mode', () => {
      const plugin = new GMovementPlugin();
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(0, 1);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.INSERT);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
    });

    it('should not execute in COMMAND mode', () => {
      const plugin = new GMovementPlugin();
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(0, 1);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.COMMAND);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty buffer', () => {
      const plugin = new GMovementPlugin();
      const state = new VimState();
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle empty buffer with count prefix', () => {
      const plugin = new GMovementPlugin({ step: 10 });
      const state = new VimState();
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle single line buffer', () => {
      const plugin = new GMovementPlugin();
      const state = new VimState('single line');
      state.cursor = new CursorPosition(0, 3);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0); // Column set to 0
    });

    it('should handle single line buffer with count prefix', () => {
      const plugin = new GMovementPlugin({ step: 5 });
      const state = new VimState('single line');
      state.cursor = new CursorPosition(0, 3);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0); // Column set to 0
    });

    it('should handle very large count values', () => {
      const plugin = new GMovementPlugin({ step: 1000000 });
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(0, 1);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2); // Clamped to last line
      expect(context.getCursor().column).toBe(0); // Column set to 0
    });

    it('should handle moving between lines with different lengths', () => {
      const plugin = new GMovementPlugin();
      const state = new VimState('very long line here\nshort\nmedium length line\nab\nanother long line');
      state.cursor = new CursorPosition(0, 10);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      // Jump to last line
      plugin.execute(context);
      expect(context.getCursor().line).toBe(4);
      expect(context.getCursor().column).toBe(0); // Column set to 0

      // Jump to line 3 (short line)
      context.setCursor(new CursorPosition(0, 10));
      const plugin2 = new GMovementPlugin({ step: 3 });
      plugin2.execute(context);
      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(0); // Column set to 0
    });

    it('should handle count of 1 (jump to line 1)', () => {
      const plugin = new GMovementPlugin({ step: 1 });
      const state = new VimState('line1\nline2\nline3\nline4\nline5');
      state.cursor = new CursorPosition(0, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0); // Line 1 (0-based: 0)
      expect(context.getCursor().column).toBe(0); // Column set to 0
    });

    it('should handle multiple G movements', () => {
      const plugin = new GMovementPlugin();
      const state = new VimState('line1\nline2\nline3\nline4\nline5');
      state.cursor = new CursorPosition(0, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      // First G
      plugin.execute(context);
      expect(context.getCursor().line).toBe(4);

      // Second G (should stay on last line)
      plugin.execute(context);
      expect(context.getCursor().line).toBe(4);

      // Third G (should still stay)
      plugin.execute(context);
      expect(context.getCursor().line).toBe(4);
    });

    it('should handle alternating between specific lines and last line', () => {
      const state = new VimState('line1\nline2\nline3\nline4\nline5');
      state.cursor = new CursorPosition(0, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      // Jump to line 2
      let plugin = new GMovementPlugin({ step: 2 });
      plugin.execute(context);
      expect(context.getCursor().line).toBe(1);

      // Jump to last line
      plugin = new GMovementPlugin();
      plugin.execute(context);
      expect(context.getCursor().line).toBe(4);

      // Jump to line 3
      plugin = new GMovementPlugin({ step: 3 });
      plugin.execute(context);
      expect(context.getCursor().line).toBe(2);

      // Jump to last line again
      plugin = new GMovementPlugin();
      plugin.execute(context);
      expect(context.getCursor().line).toBe(4);
    });

    it('should handle column at end of line', () => {
      const plugin = new GMovementPlugin();
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(0, 5); // At end of 'line1'
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(0); // Column set to 0
    });

    it('should handle column beyond all line lengths', () => {
      const plugin = new GMovementPlugin();
      const state = new VimState('ab\ncd\nef');
      state.cursor = new CursorPosition(0, 10); // Beyond all lines
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(0); // Column set to 0
    });
  });

  describe('getTargetLine Method', () => {
    it('should return last line when step is -1 (default, no count)', () => {
      const plugin = new GMovementPlugin();
      const state = new VimState('line1\nline2\nline3');
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      const targetLine = plugin['getTargetLine'](
        context.getCursor(),
        state.buffer,
        { step: -1 }
      );

      expect(targetLine).toBe(2); // Last line (0-based)
    });

    it('should return line 0 when step is 1', () => {
      const plugin = new GMovementPlugin();
      const state = new VimState('line1\nline2\nline3');
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      const targetLine = plugin['getTargetLine'](
        context.getCursor(),
        state.buffer,
        { step: 1 }
      );

      expect(targetLine).toBe(0); // Line 1 (0-based: 0)
    });

    it('should return last line when step is 0', () => {
      const plugin = new GMovementPlugin();
      const state = new VimState('line1\nline2\nline3');
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      const targetLine = plugin['getTargetLine'](
        context.getCursor(),
        state.buffer,
        { step: 0 }
      );

      expect(targetLine).toBe(2); // Last line (0-based)
    });

    it('should return correct line when step is 10', () => {
      const plugin = new GMovementPlugin();
      const state = new VimState(Array(20).fill('line').join('\n'));
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      const targetLine = plugin['getTargetLine'](
        context.getCursor(),
        state.buffer,
        { step: 10 }
      );

      expect(targetLine).toBe(9); // Line 10 in 1-based = 9 in 0-based
    });

    it('should return line 0 when step is 1 and buffer has one line', () => {
      const plugin = new GMovementPlugin();
      const state = new VimState('single line');
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      const targetLine = plugin['getTargetLine'](
        context.getCursor(),
        state.buffer,
        { step: 1 }
      );

      expect(targetLine).toBe(0); // Line 1 (0-based: 0), which is also the only line
    });

    it('should return line 0 when step is -1 and buffer has one line', () => {
      const plugin = new GMovementPlugin();
      const state = new VimState('single line');
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      const targetLine = plugin['getTargetLine'](
        context.getCursor(),
        state.buffer,
        { step: -1 }
      );

      expect(targetLine).toBe(0); // Last line (0-based: 0), which is also the only line
    });
  });
});
