/**
 * Movement Integration Tests
 * Tests for verifying integration of directional movement functionality
 */
import {
  createTestExecutor,
  createTestState,
  setupExecutorWithState,
} from '../integration.test.utils';
import { VIM_MODE } from '../../src/state/VimMode';

describe('Integration: Movement', () => {
  describe('Multi-directional Movement', () => {
    it('should integrate directional movements correctly', () => {
      const executor = createTestExecutor();
      const state = createTestState('Line 1\nLine 2\nLine 3');

      // Attach state to executor's execution context
      setupExecutorWithState(executor, state);

      // Move right 3 times
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      expect(state.cursor.column).toBe(3);

      // Move down 2 times
      executor.handleKeystroke('j');
      executor.handleKeystroke('j');
      expect(state.cursor.line).toBe(2);
    });

    it('should move in all four directions correctly', () => {
      const executor = createTestExecutor();
      const state = createTestState('Line 1\nLine 2\nLine 3');

      setupExecutorWithState(executor, state);

      // Start at (0, 0)
      expect(state.cursor.line).toBe(0);
      expect(state.cursor.column).toBe(0);

      // Move right 2 times -> (0, 2)
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      expect(state.cursor.column).toBe(2);

      // Move down 2 times -> (2, 2)
      executor.handleKeystroke('j');
      executor.handleKeystroke('j');
      expect(state.cursor.line).toBe(2);

      // Move left 1 time -> (2, 1)
      executor.handleKeystroke('h');
      expect(state.cursor.column).toBe(1);

      // Move up 1 time -> (1, 1)
      executor.handleKeystroke('k');
      expect(state.cursor.line).toBe(1);
      expect(state.cursor.column).toBe(1);
    });

    it('should handle complex movement sequences', () => {
      const executor = createTestExecutor();
      const state = createTestState('12345\nABCDE\nxyz');

      setupExecutorWithState(executor, state);

      // Move right to end of first line
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      expect(state.cursor.column).toBe(5);

      // Move down (should stay at column 5 but clamp to shorter line)
      executor.handleKeystroke('j');
      expect(state.cursor.line).toBe(1);
      expect(state.cursor.column).toBe(5);

      // Move down (should clamp to shorter line)
      executor.handleKeystroke('j');
      expect(state.cursor.line).toBe(2);
      expect(state.cursor.column).toBe(3); // "xyz" has length 3
    });
  });

  describe('Boundary Handling', () => {
    it('should prevent movement beyond document boundaries', () => {
      const executor = createTestExecutor();
      const state = createTestState('Hi');

      setupExecutorWithState(executor, state);

      // Try to move right beyond line length
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l'); // Should not move further
      expect(state.cursor.column).toBe(2); // Max is index 2 (length 2)

      // Try to move up at line 0
      executor.handleKeystroke('k');
      expect(state.cursor.line).toBe(0);
    });

    it('should prevent moving left beyond column 0', () => {
      const executor = createTestExecutor();
      const state = createTestState('Hello');

      setupExecutorWithState(executor, state);

      // Move right 3 times
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      expect(state.cursor.column).toBe(3);

      // Move left 2 times
      executor.handleKeystroke('h');
      executor.handleKeystroke('h');
      expect(state.cursor.column).toBe(1);

      // Try to move left beyond 0
      executor.handleKeystroke('h');
      executor.handleKeystroke('h');
      expect(state.cursor.column).toBe(0);
    });

    it('should prevent moving down beyond last line', () => {
      const executor = createTestExecutor();
      const state = createTestState('Line 1\nLine 2\nLine 3');

      setupExecutorWithState(executor, state);

      // Move down to last line
      executor.handleKeystroke('j');
      executor.handleKeystroke('j');
      expect(state.cursor.line).toBe(2);

      // Try to move down beyond last line
      executor.handleKeystroke('j');
      executor.handleKeystroke('j');
      expect(state.cursor.line).toBe(2);
    });

    it('should handle movement at document boundaries', () => {
      const executor = createTestExecutor();
      const state = createTestState('');

      setupExecutorWithState(executor, state);

      // Try all movements on empty document
      executor.handleKeystroke('l');
      executor.handleKeystroke('h');
      executor.handleKeystroke('j');
      executor.handleKeystroke('k');

      expect(state.cursor.line).toBe(0);
      expect(state.cursor.column).toBe(0);
    });
  });

  describe('Step Configuration', () => {
    it('should handle different step sizes', () => {
      const executor = createTestExecutor();
      const state = createTestState('Line 1\nLine 2\nLine 3\nLine 4\nLine 5');

      setupExecutorWithState(executor, state);

      // Default step is 1
      expect(state.cursor.line).toBe(0);

      // Move down 2 lines (2 steps of 1)
      executor.handleKeystroke('j');
      executor.handleKeystroke('j');
      expect(state.cursor.line).toBe(2);
    });
  });

  describe('Mode Restrictions', () => {
    it('should only move in NORMAL and VISUAL modes', () => {
      const executor = createTestExecutor();
      const state = createTestState('Hello');

      setupExecutorWithState(executor, state);

      // Test INSERT mode - should not move
      state.mode = VIM_MODE.INSERT;
      executor.setCurrentMode(VIM_MODE.INSERT);
      const initialColumn = state.cursor.column;

      executor.handleKeystroke('l');
      expect(state.cursor.column).toBe(initialColumn);

      // Test COMMAND mode - should not move
      state.mode = VIM_MODE.COMMAND;
      executor.setCurrentMode(VIM_MODE.COMMAND);
      executor.handleKeystroke('l');
      expect(state.cursor.column).toBe(initialColumn);

      // Test NORMAL mode - should move
      state.mode = VIM_MODE.NORMAL;
      executor.setCurrentMode(VIM_MODE.NORMAL);
      executor.handleKeystroke('l');
      expect(state.cursor.column).toBe(1);

      // Test VISUAL mode - should move
      state.mode = VIM_MODE.VISUAL;
      executor.setCurrentMode(VIM_MODE.VISUAL);
      executor.handleKeystroke('l');
      expect(state.cursor.column).toBe(2);
    });
  });

  describe('Line Length Handling', () => {
    it('should clamp column to shortest line in vertical movement', () => {
      const executor = createTestExecutor();
      const state = createTestState('Short\nMedium length line\nTiny');

      setupExecutorWithState(executor, state);

      // Move right past "Short"
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      expect(state.cursor.column).toBe(5);

      // Move down to "Medium length line" - should clamp to 5
      executor.handleKeystroke('j');
      expect(state.cursor.line).toBe(1);
      expect(state.cursor.column).toBe(5);

      // Move down to "Tiny" - should clamp to 4
      executor.handleKeystroke('j');
      expect(state.cursor.line).toBe(2);
      expect(state.cursor.column).toBe(4); // "Tiny" has length 4
    });

    it('should handle varying line lengths with up movement', () => {
      const executor = createTestExecutor();
      const state = createTestState('A very long line here\nShort\nMedium');

      setupExecutorWithState(executor, state);

      // Move to end of first line
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      expect(state.cursor.column).toBe(21); // "A very long line here" has 21 characters

      // Move down to "Short"
      executor.handleKeystroke('j');
      expect(state.cursor.line).toBe(1);
      expect(state.cursor.column).toBe(5); // Clamped to "Short" length

      // Move down to "Medium"
      executor.handleKeystroke('j');
      expect(state.cursor.line).toBe(2);
      expect(state.cursor.column).toBe(6); // Clamped to "Medium" length

      // Move up - should stay at clamped column
      executor.handleKeystroke('k');
      expect(state.cursor.line).toBe(1);
      expect(state.cursor.column).toBe(5);
    });
  });

  describe('Empty Lines', () => {
    it('should handle movement through empty lines', () => {
      const executor = createTestExecutor();
      const state = createTestState('Line 1\n\nLine 3');

      setupExecutorWithState(executor, state);

      // Move to end of first line
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      executor.handleKeystroke('l');
      expect(state.cursor.column).toBe(6);

      // Move down to empty line
      executor.handleKeystroke('j');
      expect(state.cursor.line).toBe(1);
      expect(state.cursor.column).toBe(0); // Empty line has length 0

      // Move down to Line 3
      executor.handleKeystroke('j');
      expect(state.cursor.line).toBe(2);
      expect(state.cursor.column).toBe(6);
    });
  });
});
