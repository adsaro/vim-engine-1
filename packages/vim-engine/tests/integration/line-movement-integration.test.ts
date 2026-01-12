/**
 * Line Movement Integration Tests
 * Tests for integrating line movement commands with the vim-engine
 */
import { VimExecutor } from '../../src/core/VimExecutor';
import { VimState } from '../../src/state/VimState';
import { VIM_MODE } from '../../src/state/VimMode';
import { CursorPosition } from '../../src/state/CursorPosition';
import { ZeroMovementPlugin } from '../../src/plugins/movement/0';
import { CaretMovementPlugin } from '../../src/plugins/movement/caret';
import { DollarMovementPlugin } from '../../src/plugins/movement/dollar';
import { GUnderscoreMovementPlugin } from '../../src/plugins/movement/g-underscore';

describe('Line Movement Integration', () => {
  let executor: VimExecutor;

  beforeEach(() => {
    executor = new VimExecutor();
    executor.registerPlugin(new ZeroMovementPlugin());
    executor.registerPlugin(new CaretMovementPlugin());
    executor.registerPlugin(new DollarMovementPlugin());
    executor.registerPlugin(new GUnderscoreMovementPlugin());
  });

  describe('Sequential Line Movements', () => {
    it('should handle sequential 0 movements', () => {
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(0, 5);
      state.mode = VIM_MODE.NORMAL;

      const context = executor.getExecutionContext();
      context.setState(state);
      context.setMode(VIM_MODE.NORMAL);

      // First 0
      executor.handleKeystroke('0');
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);

      // Move down
      executor.handleKeystroke('j');
      expect(context.getCursor().line).toBe(1);

      // Second 0
      executor.handleKeystroke('0');
      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle sequential ^ movements', () => {
      const state = new VimState('  line1\n  line2\n  line3');
      state.cursor = new CursorPosition(0, 5);
      state.mode = VIM_MODE.NORMAL;

      const context = executor.getExecutionContext();
      context.setState(state);
      context.setMode(VIM_MODE.NORMAL);

      // First ^
      executor.handleKeystroke('^');
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(2);

      // Move down
      executor.handleKeystroke('j');
      expect(context.getCursor().line).toBe(1);

      // Second ^
      executor.handleKeystroke('^');
      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(2);
    });

    it('should handle sequential $ movements', () => {
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(0, 0);
      state.mode = VIM_MODE.NORMAL;

      const context = executor.getExecutionContext();
      context.setState(state);
      context.setMode(VIM_MODE.NORMAL);

      // First $
      executor.handleKeystroke('$');
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(4);

      // Move down
      executor.handleKeystroke('j');
      expect(context.getCursor().line).toBe(1);

      // Second $
      executor.handleKeystroke('$');
      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(4);
    });

    it('should handle sequential g_ movements', () => {
      const state = new VimState('line1  \nline2  \nline3  ');
      state.cursor = new CursorPosition(0, 0);
      state.mode = VIM_MODE.NORMAL;

      const context = executor.getExecutionContext();
      context.setState(state);
      context.setMode(VIM_MODE.NORMAL);

      // First g_
      executor.handleKeystroke('g_');
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(4);

      // Move down
      executor.handleKeystroke('j');
      expect(context.getCursor().line).toBe(1);

      // Second g_
      executor.handleKeystroke('g_');
      expect(context.getCursor().line).toBe(1);
      expect(context.getCursor().column).toBe(4);
    });
  });

  describe('Combining Line Movements with Other Movements', () => {
    it('should combine 0 with horizontal movements', () => {
      const state = new VimState('hello world');
      state.cursor = new CursorPosition(0, 0);
      state.mode = VIM_MODE.NORMAL;

      const context = executor.getExecutionContext();
      context.setState(state);
      context.setMode(VIM_MODE.NORMAL);

      // Move to end
      executor.handleKeystroke('$');
      expect(context.getCursor().column).toBe(10);

      // Move to start
      executor.handleKeystroke('0');
      expect(context.getCursor().column).toBe(0);

      // Move right
      executor.handleKeystroke('l');
      expect(context.getCursor().column).toBe(1);
    });

    it('should combine ^ with horizontal movements', () => {
      const state = new VimState('  hello world');
      state.cursor = new CursorPosition(0, 10);
      state.mode = VIM_MODE.NORMAL;

      const context = executor.getExecutionContext();
      context.setState(state);
      context.setMode(VIM_MODE.NORMAL);

      // Move to first non-whitespace
      executor.handleKeystroke('^');
      expect(context.getCursor().column).toBe(2);

      // Move right
      executor.handleKeystroke('l');
      expect(context.getCursor().column).toBe(3);

      // Move to first non-whitespace again
      executor.handleKeystroke('^');
      expect(context.getCursor().column).toBe(2);
    });

    it('should combine $ with horizontal movements', () => {
      const state = new VimState('hello world  ');
      state.cursor = new CursorPosition(0, 0);
      state.mode = VIM_MODE.NORMAL;

      const context = executor.getExecutionContext();
      context.setState(state);
      context.setMode(VIM_MODE.NORMAL);

      // Move to end
      executor.handleKeystroke('$');
      expect(context.getCursor().column).toBe(12);

      // Move left
      executor.handleKeystroke('h');
      expect(context.getCursor().column).toBe(11);

      // Move to end again
      executor.handleKeystroke('$');
      expect(context.getCursor().column).toBe(12);
    });

    it('should combine g_ with horizontal movements', () => {
      const state = new VimState('hello world  ');
      state.cursor = new CursorPosition(0, 0);
      state.mode = VIM_MODE.NORMAL;

      const context = executor.getExecutionContext();
      context.setState(state);
      context.setMode(VIM_MODE.NORMAL);

      // Move to last non-whitespace
      executor.handleKeystroke('g_');
      expect(context.getCursor().column).toBe(10);

      // Move left
      executor.handleKeystroke('h');
      expect(context.getCursor().column).toBe(9);

      // Move to last non-whitespace again
      executor.handleKeystroke('g_');
      expect(context.getCursor().column).toBe(10);
    });
  });

  describe('Visual Mode Selection with Line Movements', () => {
    it('should work in VISUAL mode with 0', () => {
      const state = new VimState('hello world');
      state.cursor = new CursorPosition(0, 5);
      state.mode = VIM_MODE.NORMAL;

      const context = executor.getExecutionContext();
      context.setState(state);
      context.setMode(VIM_MODE.NORMAL);

      // Enter visual mode
      executor.handleKeystroke('v');
      expect(context.getMode()).toBe(VIM_MODE.VISUAL);

      // Move to start
      executor.handleKeystroke('0');
      expect(context.getCursor().column).toBe(0);
      expect(context.getMode()).toBe(VIM_MODE.VISUAL);
    });

    it('should work in VISUAL mode with ^', () => {
      const state = new VimState('  hello world');
      state.cursor = new CursorPosition(0, 8);
      state.mode = VIM_MODE.NORMAL;

      const context = executor.getExecutionContext();
      context.setState(state);
      context.setMode(VIM_MODE.NORMAL);

      // Enter visual mode
      executor.handleKeystroke('v');
      expect(context.getMode()).toBe(VIM_MODE.VISUAL);

      // Move to first non-whitespace
      executor.handleKeystroke('^');
      expect(context.getCursor().column).toBe(2);
      expect(context.getMode()).toBe(VIM_MODE.VISUAL);
    });

    it('should work in VISUAL mode with $', () => {
      const state = new VimState('hello world');
      state.cursor = new CursorPosition(0, 0);
      state.mode = VIM_MODE.NORMAL;

      const context = executor.getExecutionContext();
      context.setState(state);
      context.setMode(VIM_MODE.NORMAL);

      // Enter visual mode
      executor.handleKeystroke('v');
      expect(context.getMode()).toBe(VIM_MODE.VISUAL);

      // Move to end
      executor.handleKeystroke('$');
      expect(context.getCursor().column).toBe(10);
      expect(context.getMode()).toBe(VIM_MODE.VISUAL);
    });

    it('should work in VISUAL mode with g_', () => {
      const state = new VimState('hello world  ');
      state.cursor = new CursorPosition(0, 0);
      state.mode = VIM_MODE.NORMAL;

      const context = executor.getExecutionContext();
      context.setState(state);
      context.setMode(VIM_MODE.NORMAL);

      // Enter visual mode
      executor.handleKeystroke('v');
      expect(context.getMode()).toBe(VIM_MODE.VISUAL);

      // Move to last non-whitespace
      executor.handleKeystroke('g_');
      expect(context.getCursor().column).toBe(10);
      expect(context.getMode()).toBe(VIM_MODE.VISUAL);
    });
  });

  describe('Count-Based Movements Across Multiple Lines', () => {
    it('should handle count with 0 across multiple lines', () => {
      const state = new VimState('line1\nline2\nline3\nline4\nline5');
      state.cursor = new CursorPosition(0, 3);
      state.mode = VIM_MODE.NORMAL;

      const context = executor.getExecutionContext();
      context.setState(state);
      context.setMode(VIM_MODE.NORMAL);

      // Move to line 3 (count 3 = move 2 lines down)
      executor.handleKeystroke('30');
      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle count with ^ across multiple lines', () => {
      const state = new VimState('  line1\n  line2\n  line3\n  line4\n  line5');
      state.cursor = new CursorPosition(0, 5);
      state.mode = VIM_MODE.NORMAL;

      const context = executor.getExecutionContext();
      context.setState(state);
      context.setMode(VIM_MODE.NORMAL);

      // Move to line 4 (count 4 = move 3 lines down)
      executor.handleKeystroke('4^');
      expect(context.getCursor().line).toBe(3);
      expect(context.getCursor().column).toBe(2);
    });

    it('should handle count with $ across multiple lines', () => {
      const state = new VimState('line1\nline22\nline333\nline4444\nline55555');
      state.cursor = new CursorPosition(0, 0);
      state.mode = VIM_MODE.NORMAL;

      const context = executor.getExecutionContext();
      context.setState(state);
      context.setMode(VIM_MODE.NORMAL);

      // Move to line 5 (count 5 = move 4 lines down)
      executor.handleKeystroke('5$');
      expect(context.getCursor().line).toBe(4);
      expect(context.getCursor().column).toBe(7);
    });

    it('should handle count with g_ across multiple lines', () => {
      const state = new VimState('line1  \nline22  \nline333  \nline4444  \nline55555  ');
      state.cursor = new CursorPosition(0, 0);
      state.mode = VIM_MODE.NORMAL;

      const context = executor.getExecutionContext();
      context.setState(state);
      context.setMode(VIM_MODE.NORMAL);

      // Move to line 3 (count 3 = move 2 lines down)
      executor.handleKeystroke('3g_');
      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(6);
    });

    it('should clamp count to buffer bounds', () => {
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(0, 0);
      state.mode = VIM_MODE.NORMAL;

      const context = executor.getExecutionContext();
      context.setState(state);
      context.setMode(VIM_MODE.NORMAL);

      // Try to move 10 lines (should clamp to last line)
      executor.handleKeystroke('10$');
      expect(context.getCursor().line).toBe(2);
      expect(context.getCursor().column).toBe(4);
    });
  });

  describe('Edge Cases in Integration', () => {
    it('should handle empty buffer', () => {
      const state = new VimState();
      state.cursor = new CursorPosition(0, 0);
      state.mode = VIM_MODE.NORMAL;

      const context = executor.getExecutionContext();
      context.setState(state);
      context.setMode(VIM_MODE.NORMAL);

      // Try all line movements
      executor.handleKeystroke('0');
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);

      executor.handleKeystroke('^');
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);

      executor.handleKeystroke('$');
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);

      executor.handleKeystroke('g_');
      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle single line buffer', () => {
      const state = new VimState('hello world');
      state.cursor = new CursorPosition(0, 5);
      state.mode = VIM_MODE.NORMAL;

      const context = executor.getExecutionContext();
      context.setState(state);
      context.setMode(VIM_MODE.NORMAL);

      executor.handleKeystroke('0');
      expect(context.getCursor().column).toBe(0);

      executor.handleKeystroke('^');
      expect(context.getCursor().column).toBe(0);

      executor.handleKeystroke('$');
      expect(context.getCursor().column).toBe(10);

      executor.handleKeystroke('g_');
      expect(context.getCursor().column).toBe(10);
    });

    it('should handle lines with mixed whitespace', () => {
      const state = new VimState(' \t hello world \t ');
      state.cursor = new CursorPosition(0, 10);
      state.mode = VIM_MODE.NORMAL;

      const context = executor.getExecutionContext();
      context.setState(state);
      context.setMode(VIM_MODE.NORMAL);

      executor.handleKeystroke('0');
      expect(context.getCursor().column).toBe(0);

      executor.handleKeystroke('^');
      expect(context.getCursor().column).toBe(3);

      executor.handleKeystroke('$');
      expect(context.getCursor().column).toBe(15);

      executor.handleKeystroke('g_');
      expect(context.getCursor().column).toBe(11);
    });

    it('should handle mode transitions', () => {
      const state = new VimState('hello world');
      state.cursor = new CursorPosition(0, 5);
      state.mode = VIM_MODE.NORMAL;

      const context = executor.getExecutionContext();
      context.setState(state);
      context.setMode(VIM_MODE.NORMAL);

      // NORMAL mode - should work
      executor.handleKeystroke('0');
      expect(context.getCursor().column).toBe(0);

      // Switch to INSERT mode - should not work
      context.setMode(VIM_MODE.INSERT);
      executor.handleKeystroke('$');
      expect(context.getCursor().column).toBe(0);

      // Switch back to NORMAL mode - should work
      context.setMode(VIM_MODE.NORMAL);
      executor.handleKeystroke('$');
      expect(context.getCursor().column).toBe(10);
    });
  });

  describe('Different Line Movement Combinations', () => {
    it('should switch between different line movements', () => {
      const state = new VimState('  hello world  ');
      state.cursor = new CursorPosition(0, 5);
      state.mode = VIM_MODE.NORMAL;

      const context = executor.getExecutionContext();
      context.setState(state);
      context.setMode(VIM_MODE.NORMAL);

      // Move to start
      executor.handleKeystroke('0');
      expect(context.getCursor().column).toBe(0);

      // Move to first non-whitespace
      executor.handleKeystroke('^');
      expect(context.getCursor().column).toBe(2);

      // Move to end
      executor.handleKeystroke('$');
      expect(context.getCursor().column).toBe(13);

      // Move to last non-whitespace
      executor.handleKeystroke('g_');
      expect(context.getCursor().column).toBe(11);

      // Back to start
      executor.handleKeystroke('0');
      expect(context.getCursor().column).toBe(0);
    });
  });
});
