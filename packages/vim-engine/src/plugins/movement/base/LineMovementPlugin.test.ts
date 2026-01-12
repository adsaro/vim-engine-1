/**
 * LineMovementPlugin Unit Tests
 * Tests for the base class for line-based movement plugins
 */
import { LineMovementPlugin } from './LineMovementPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimState } from '../../../state/VimState';
import { CursorPosition } from '../../../state/CursorPosition';
import { VIM_MODE } from '../../../state/VimMode';

/**
 * Test implementation of LineMovementPlugin for testing abstract class behavior
 */
class TestLineMovementPlugin extends LineMovementPlugin {
  constructor(private targetColumn: number = 0) {
    super('test-line-movement', 'Test line movement', 'x', [VIM_MODE.NORMAL]);
  }

  protected calculateLinePosition(line: string, cursor: CursorPosition): number {
    return this.targetColumn;
  }
}

describe('LineMovementPlugin', () => {
  describe('Abstract Class Behavior', () => {
    it('should be instantiable through subclass', () => {
      const plugin = new TestLineMovementPlugin();
      expect(plugin).toBeInstanceOf(LineMovementPlugin);
      expect(plugin.name).toBe('test-line-movement');
      expect(plugin.patterns).toEqual(['x']);
      expect(plugin.modes).toContain(VIM_MODE.NORMAL);
    });

    it('should require calculateLinePosition implementation', () => {
      const plugin = new TestLineMovementPlugin(5);
      const state = new VimState('hello world');
      state.cursor = new CursorPosition(0, 3);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(5);
    });
  });

  describe('Line Retrieval', () => {
    it('should retrieve current line from buffer', () => {
      const plugin = new TestLineMovementPlugin(0);
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(1, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      // Cursor should move to column 0 on line 1
      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle empty buffer', () => {
      const plugin = new TestLineMovementPlugin(5);
      const state = new VimState();
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      // Should not crash, cursor should remain unchanged
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle single line buffer', () => {
      const plugin = new TestLineMovementPlugin(3);
      const state = new VimState('single line');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(3);
    });

    it('should handle multi-line buffer', () => {
      const plugin = new TestLineMovementPlugin(2);
      const state = new VimState('first line\nsecond line\nthird line');
      state.cursor = new CursorPosition(2, 10);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(2);
    });
  });

  describe('Column Validation', () => {
    it('should clamp column to line length', () => {
      const plugin = new TestLineMovementPlugin(100);
      const state = new VimState('short');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      // Should clamp to line length (5)
      expect(context.getCursor().column).toBe(5);
    });

    it('should handle negative column values', () => {
      const plugin = new TestLineMovementPlugin(-5);
      const state = new VimState('hello');
      state.cursor = new CursorPosition(0, 3);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      // Should clamp to 0
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle column at exact line length', () => {
      const plugin = new TestLineMovementPlugin(5);
      const state = new VimState('hello');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(5);
    });
  });

  describe('Empty Line Handling', () => {
    it('should handle empty line', () => {
      const plugin = new TestLineMovementPlugin(5);
      const state = new VimState('line1\n\nline3');
      state.cursor = new CursorPosition(1, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      // Should stay at column 0 on empty line
      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle whitespace-only line', () => {
      const plugin = new TestLineMovementPlugin(5);
      const state = new VimState('line1\n   \nline3');
      state.cursor = new CursorPosition(1, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      // Should move to column 3 (length of whitespace line)
      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(3);
    });

    it('should handle line with tabs', () => {
      const plugin = new TestLineMovementPlugin(3);
      const state = new VimState('\t\thello');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(3);
    });
  });

  describe('Count-Based Movement', () => {
    it('should handle count of 1 (no movement down)', () => {
      const plugin = new TestLineMovementPlugin(0);
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      // Should stay on current line
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle count greater than 1 (move down count-1 lines)', () => {
      const plugin = new TestLineMovementPlugin(0);
      const state = new VimState('line1\nline2\nline3\nline4');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      // Simulate count of 3 (move 2 lines down)
      plugin.handleCountMovement(context.getCursor(), context.getBuffer(), 3);

      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(0);
    });

    it('should clamp count movement to buffer bounds', () => {
      const plugin = new TestLineMovementPlugin(0);
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      // Try to move 10 lines down (should clamp to last line)
      plugin.handleCountMovement(context.getCursor(), context.getBuffer(), 10);

      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle count of 0 (no movement)', () => {
      const plugin = new TestLineMovementPlugin(5);
      const state = new VimState('line1\nline2');
      state.cursor = new CursorPosition(0, 3);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.handleCountMovement(context.getCursor(), context.getBuffer(), 0);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(5);
    });

    it('should handle negative count (no movement)', () => {
      const plugin = new TestLineMovementPlugin(5);
      const state = new VimState('line1\nline2');
      state.cursor = new CursorPosition(0, 3);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.handleCountMovement(context.getCursor(), context.getBuffer(), -5);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle cursor at last line with count', () => {
      const plugin = new TestLineMovementPlugin(0);
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(2, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.handleCountMovement(context.getCursor(), context.getBuffer(), 5);

      // Should stay on last line
      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle single character line', () => {
      const plugin = new TestLineMovementPlugin(5);
      const state = new VimState('x');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(1);
    });

    it('should handle line with mixed whitespace', () => {
      const plugin = new TestLineMovementPlugin(10);
      const state = new VimState('  \t  hello  \t  ');
      state.cursor = new CursorPosition(0, 5);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      // Should clamp to line length
      expect(context.getCursor().column).toBe(15);
    });

    it('should preserve line position when moving within same line', () => {
      const plugin = new TestLineMovementPlugin(3);
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(1, 8);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(3);
    });
  });

  describe('Mode Restrictions', () => {
    it('should execute in NORMAL mode', () => {
      const plugin = new TestLineMovementPlugin(5);
      const state = new VimState('hello');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(5);
    });

    it('should execute in VISUAL mode', () => {
      const plugin = new TestLineMovementPlugin(5);
      const state = new VimState('hello');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.VISUAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(5);
    });

    it('should not execute in unsupported mode', () => {
      const plugin = new TestLineMovementPlugin(5);
      const state = new VimState('hello');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.INSERT);

      plugin.execute(context);

      // Cursor should remain unchanged in unsupported mode
      expect(context.getCursor().column).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should have default movement config', () => {
      const plugin = new TestLineMovementPlugin(5);
      const config = plugin.getConfig();

      expect(config.step).toBe(1);
      expect(config.allowWrap).toBe(false);
      expect(config.scrollOnEdge).toBe(false);
      expect(config.visualModeEnabled).toBe(true);
    });

    it('should accept custom config', () => {
      const plugin = new TestLineMovementPlugin(5);
      plugin.updateConfig({ step: 2, allowWrap: true });

      const config = plugin.getConfig();
      expect(config.step).toBe(2);
      expect(config.allowWrap).toBe(true);
    });
  });
});
