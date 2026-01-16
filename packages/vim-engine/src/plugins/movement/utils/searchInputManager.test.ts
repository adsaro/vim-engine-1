/**
 * Search Input Manager Tests
 */
import { SearchInputManager } from './searchInputManager';

describe('SearchInputManager', () => {
  let manager: SearchInputManager;

  beforeEach(() => {
    manager = new SearchInputManager();
  });

  describe('start()', () => {
    it('should initialize state correctly for forward direction', () => {
      manager.start('forward');
      const state = manager.getState();

      expect(state.isActive).toBe(true);
      expect(state.direction).toBe('forward');
      expect(state.pattern).toBe('');
      expect(state.cursorPosition).toBe(0);
    });

    it('should initialize state correctly for backward direction', () => {
      manager.start('backward');
      const state = manager.getState();

      expect(state.isActive).toBe(true);
      expect(state.direction).toBe('backward');
      expect(state.pattern).toBe('');
      expect(state.cursorPosition).toBe(0);
    });

    it('should reset any existing state', () => {
      // Start with some state
      manager.start('forward');
      manager.addChar('a');
      manager.addChar('b');
      manager.addChar('c');

      // Start again with different direction
      manager.start('backward');
      const state = manager.getState();

      expect(state.isActive).toBe(true);
      expect(state.direction).toBe('backward');
      expect(state.pattern).toBe('');
      expect(state.cursorPosition).toBe(0);
    });

    it('should reset pattern when starting', () => {
      manager.start('forward');
      manager.addChar('test');

      manager.start('forward');
      const state = manager.getState();

      expect(state.pattern).toBe('');
    });

    it('should reset cursor position when starting', () => {
      manager.start('forward');
      manager.addChar('abc');
      manager.moveCursor(2);

      manager.start('forward');
      const state = manager.getState();

      expect(state.cursorPosition).toBe(0);
    });
  });

  describe('addChar()', () => {
    beforeEach(() => {
      manager.start('forward');
    });

    it('should add character to pattern', () => {
      manager.addChar('a');
      const state = manager.getState();

      expect(state.pattern).toBe('a');
      expect(state.cursorPosition).toBe(1);
    });

    it('should add multiple characters sequentially', () => {
      manager.addChar('a');
      manager.addChar('b');
      manager.addChar('c');
      const state = manager.getState();

      expect(state.pattern).toBe('abc');
      expect(state.cursorPosition).toBe(3);
    });

    it('should insert at cursor position', () => {
      manager.addChar('a');
      manager.addChar('c');
      manager.moveCursor(-1); // Move back to position 1
      manager.addChar('b');
      const state = manager.getState();

      expect(state.pattern).toBe('abc');
      expect(state.cursorPosition).toBe(2);
    });

    it('should move cursor correctly after insertion', () => {
      manager.addChar('a');
      manager.addChar('b');
      manager.addChar('c');
      const state = manager.getState();

      expect(state.cursorPosition).toBe(3);
    });

    it('should handle insertion in the middle of pattern', () => {
      manager.addChar('h');
      manager.addChar('l');
      manager.addChar('l');
      manager.addChar('o');
      manager.moveCursor(-2); // Move to position 2 (between first 'l' and second 'l')
      manager.addChar('e');
      const state = manager.getState();

      expect(state.pattern).toBe('hlelo');
      expect(state.cursorPosition).toBe(3);
    });

    it('should handle insertion at beginning', () => {
      manager.addChar('b');
      manager.addChar('c');
      manager.moveCursor(-2); // Move to position 0
      manager.addChar('a');
      const state = manager.getState();

      expect(state.pattern).toBe('abc');
      expect(state.cursorPosition).toBe(1);
    });

    it('should handle insertion at end', () => {
      manager.addChar('a');
      manager.addChar('b');
      manager.addChar('c');
      manager.moveCursor(0); // Already at end
      manager.addChar('d');
      const state = manager.getState();

      expect(state.pattern).toBe('abcd');
      expect(state.cursorPosition).toBe(4);
    });
  });

  describe('deleteChar()', () => {
    beforeEach(() => {
      manager.start('forward');
    });

    it('should remove character before cursor', () => {
      manager.addChar('a');
      manager.addChar('b');
      manager.addChar('c');
      manager.deleteChar();
      const state = manager.getState();

      expect(state.pattern).toBe('ab');
      expect(state.cursorPosition).toBe(2);
    });

    it('should decrement cursor position', () => {
      manager.addChar('a');
      manager.addChar('b');
      manager.addChar('c');
      const beforeDelete = manager.getState().cursorPosition;

      manager.deleteChar();
      const afterDelete = manager.getState().cursorPosition;

      expect(afterDelete).toBe(beforeDelete - 1);
    });

    it('should do nothing when cursor at 0', () => {
      manager.addChar('a');
      manager.moveCursor(-1); // Move to position 0
      const stateBefore = manager.getState();

      manager.deleteChar();
      const stateAfter = manager.getState();

      expect(stateAfter.pattern).toBe(stateBefore.pattern);
      expect(stateAfter.cursorPosition).toBe(0);
    });

    it('should handle multiple deletions', () => {
      manager.addChar('a');
      manager.addChar('b');
      manager.addChar('c');
      manager.addChar('d');

      manager.deleteChar();
      manager.deleteChar();
      const state = manager.getState();

      expect(state.pattern).toBe('ab');
      expect(state.cursorPosition).toBe(2);
    });

    it('should delete from middle of pattern', () => {
      manager.addChar('a');
      manager.addChar('b');
      manager.addChar('c');
      manager.addChar('d');
      manager.moveCursor(-1); // Move to position 3
      manager.deleteChar();
      const state = manager.getState();

      expect(state.pattern).toBe('abd');
      expect(state.cursorPosition).toBe(2);
    });

    it('should handle deleting all characters', () => {
      manager.addChar('a');
      manager.addChar('b');
      manager.addChar('c');

      manager.deleteChar();
      manager.deleteChar();
      manager.deleteChar();
      const state = manager.getState();

      expect(state.pattern).toBe('');
      expect(state.cursorPosition).toBe(0);
    });
  });

  describe('moveCursor()', () => {
    beforeEach(() => {
      manager.start('forward');
      manager.addChar('a');
      manager.addChar('b');
      manager.addChar('c');
    });

    it('should move cursor forward by delta', () => {
      manager.moveCursor(1);
      const state = manager.getState();

      expect(state.cursorPosition).toBe(3);
    });

    it('should move cursor backward by delta', () => {
      manager.moveCursor(-1);
      const state = manager.getState();

      expect(state.cursorPosition).toBe(2);
    });

    it('should move cursor by multiple positions', () => {
      manager.moveCursor(-2);
      const state = manager.getState();

      expect(state.cursorPosition).toBe(1);
    });

    it('should clamp to pattern boundaries when moving forward', () => {
      manager.moveCursor(10);
      const state = manager.getState();

      expect(state.cursorPosition).toBe(3); // Pattern length
    });

    it('should clamp to pattern boundaries when moving backward', () => {
      manager.moveCursor(-10);
      const state = manager.getState();

      expect(state.cursorPosition).toBe(0);
    });

    it('should not move when delta is 0', () => {
      const before = manager.getState().cursorPosition;
      manager.moveCursor(0);
      const after = manager.getState().cursorPosition;

      expect(after).toBe(before);
    });

    it('should handle moving to beginning', () => {
      manager.moveCursor(-3);
      const state = manager.getState();

      expect(state.cursorPosition).toBe(0);
    });

    it('should handle moving to end', () => {
      manager.moveCursor(0);
      const state = manager.getState();

      expect(state.cursorPosition).toBe(3);
    });

    it('should work with empty pattern', () => {
      const emptyManager = new SearchInputManager();
      emptyManager.start('forward');
      emptyManager.moveCursor(5);
      const state = emptyManager.getState();

      expect(state.cursorPosition).toBe(0);
    });
  });

  describe('cancel()', () => {
    it('should clear state and deactivate', () => {
      manager.start('forward');
      manager.addChar('test');
      manager.cancel();
      const state = manager.getState();

      expect(state.isActive).toBe(false);
      expect(state.pattern).toBe('');
      expect(state.cursorPosition).toBe(0);
    });

    it('should deactivate search input', () => {
      manager.start('backward');
      manager.cancel();

      expect(manager.isActive()).toBe(false);
    });

    it('should reset pattern to empty string', () => {
      manager.start('forward');
      manager.addChar('hello');
      manager.addChar(' world');
      manager.cancel();
      const state = manager.getState();

      expect(state.pattern).toBe('');
    });

    it('should reset cursor position to 0', () => {
      manager.start('forward');
      manager.addChar('abc');
      manager.moveCursor(2);
      manager.cancel();
      const state = manager.getState();

      expect(state.cursorPosition).toBe(0);
    });

    it('should handle cancel when already inactive', () => {
      // Don't start, already inactive
      manager.cancel();
      const state = manager.getState();

      expect(state.isActive).toBe(false);
      expect(state.pattern).toBe('');
      expect(state.cursorPosition).toBe(0);
    });
  });

  describe('complete()', () => {
    it('should return pattern and direction when active', () => {
      manager.start('forward');
      manager.addChar('test');
      const result = manager.complete();

      expect(result).toEqual({ pattern: 'test', direction: 'forward' });
    });

    it('should return null when not active', () => {
      const result = manager.complete();

      expect(result).toBeNull();
    });

    it('should deactivate after returning', () => {
      manager.start('backward');
      manager.addChar('search');
      manager.complete();

      expect(manager.isActive()).toBe(false);
    });

    it('should return correct direction for backward search', () => {
      manager.start('backward');
      manager.addChar('pattern');
      const result = manager.complete();

      expect(result).toEqual({ pattern: 'pattern', direction: 'backward' });
    });

    it('should return empty pattern if no characters added', () => {
      manager.start('forward');
      const result = manager.complete();

      expect(result).toEqual({ pattern: '', direction: 'forward' });
    });

    it('should clear state after completion', () => {
      manager.start('forward');
      manager.addChar('test');
      manager.complete();
      const state = manager.getState();

      expect(state.isActive).toBe(false);
      expect(state.pattern).toBe('');
      expect(state.cursorPosition).toBe(0);
    });

    it('should handle completion with cursor in middle of pattern', () => {
      manager.start('forward');
      manager.addChar('a');
      manager.addChar('b');
      manager.addChar('c');
      manager.moveCursor(-1);
      const result = manager.complete();

      expect(result).toEqual({ pattern: 'abc', direction: 'forward' });
    });
  });

  describe('getState()', () => {
    it('should return current state', () => {
      manager.start('forward');
      manager.addChar('test');
      const state = manager.getState();

      expect(state.isActive).toBe(true);
      expect(state.direction).toBe('forward');
      expect(state.pattern).toBe('test');
      expect(state.cursorPosition).toBe(4);
    });

    it('should return read-only copy', () => {
      manager.start('backward');
      manager.addChar('search');
      const state = manager.getState();

      // Attempting to modify should not affect the internal state
      // Note: In TypeScript, Readonly only prevents direct property assignment
      // but doesn't prevent mutation of nested objects. We verify the
      // returned object is a copy by checking that modifying the pattern
      // string (which is immutable) doesn't affect the manager.
      expect(state.pattern).toBe('search');

      // Add more characters to the manager
      manager.addChar(' more');
      const newState = manager.getState();

      // Original state reference should not have changed
      expect(state.pattern).toBe('search');
      expect(newState.pattern).toBe('search more');
    });

    it('should return state with correct types', () => {
      manager.start('forward');
      const state = manager.getState();

      expect(typeof state.isActive).toBe('boolean');
      expect(typeof state.direction).toBe('string');
      expect(typeof state.pattern).toBe('string');
      expect(typeof state.cursorPosition).toBe('number');
    });

    it('should return inactive state when not started', () => {
      const state = manager.getState();

      expect(state.isActive).toBe(false);
      expect(state.direction).toBe('forward'); // Default value
      expect(state.pattern).toBe('');
      expect(state.cursorPosition).toBe(0);
    });
  });

  describe('isActive()', () => {
    it('should return false when not started', () => {
      expect(manager.isActive()).toBe(false);
    });

    it('should return true after start', () => {
      manager.start('forward');
      expect(manager.isActive()).toBe(true);
    });

    it('should return false after cancel', () => {
      manager.start('backward');
      manager.cancel();
      expect(manager.isActive()).toBe(false);
    });

    it('should return false after complete', () => {
      manager.start('forward');
      manager.complete();
      expect(manager.isActive()).toBe(false);
    });

    it('should return correct status for forward direction', () => {
      manager.start('forward');
      expect(manager.isActive()).toBe(true);
    });

    it('should return correct status for backward direction', () => {
      manager.start('backward');
      expect(manager.isActive()).toBe(true);
    });
  });

  describe('Multiple operations', () => {
    it('should handle multiple addChar operations correctly', () => {
      manager.start('forward');
      manager.addChar('h');
      manager.addChar('e');
      manager.addChar('l');
      manager.addChar('l');
      manager.addChar('o');
      const state = manager.getState();

      expect(state.pattern).toBe('hello');
      expect(state.cursorPosition).toBe(5);
    });

    it('should handle multiple deleteChar operations correctly', () => {
      manager.start('forward');
      manager.addChar('a');
      manager.addChar('b');
      manager.addChar('c');
      manager.addChar('d');
      manager.addChar('e');
      manager.deleteChar();
      manager.deleteChar();
      manager.deleteChar();
      const state = manager.getState();

      expect(state.pattern).toBe('ab');
      expect(state.cursorPosition).toBe(2);
    });

    it('should handle mixed addChar and deleteChar operations', () => {
      manager.start('forward');
      manager.addChar('a');
      manager.addChar('b');
      manager.addChar('c');
      manager.deleteChar();
      manager.addChar('d');
      manager.deleteChar();
      const state = manager.getState();

      expect(state.pattern).toBe('ab');
      expect(state.cursorPosition).toBe(2);
    });

    it('should handle mixed operations with cursor movement', () => {
      manager.start('forward');
      manager.addChar('a');
      manager.addChar('b');
      manager.addChar('c');
      manager.moveCursor(-1);
      manager.addChar('x');
      manager.deleteChar();
      const state = manager.getState();

      expect(state.pattern).toBe('abc');
      expect(state.cursorPosition).toBe(2);
    });

    it('should handle complete workflow', () => {
      // Start
      manager.start('backward');
      expect(manager.isActive()).toBe(true);

      // Add characters
      manager.addChar('s');
      manager.addChar('e');
      manager.addChar('a');
      manager.addChar('r');
      manager.addChar('c');
      manager.addChar('h');
      expect(manager.getState().pattern).toBe('search');

      // Move cursor
      manager.moveCursor(-2);
      expect(manager.getState().cursorPosition).toBe(4);

      // Delete
      manager.deleteChar();
      expect(manager.getState().pattern).toBe('seach');

      // Complete
      const result = manager.complete();
      expect(result).toEqual({ pattern: 'seach', direction: 'backward' });
      expect(manager.isActive()).toBe(false);
    });

    it('should handle restart after cancel', () => {
      manager.start('forward');
      manager.addChar('test');
      manager.cancel();

      manager.start('backward');
      manager.addChar('new');
      const state = manager.getState();

      expect(state.isActive).toBe(true);
      expect(state.direction).toBe('backward');
      expect(state.pattern).toBe('new');
      expect(state.cursorPosition).toBe(3);
    });

    it('should handle restart after complete', () => {
      manager.start('forward');
      manager.addChar('old');
      manager.complete();

      manager.start('backward');
      manager.addChar('fresh');
      const state = manager.getState();

      expect(state.isActive).toBe(true);
      expect(state.direction).toBe('backward');
      expect(state.pattern).toBe('fresh');
      expect(state.cursorPosition).toBe(5);
    });
  });
});
