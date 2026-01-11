/**
 * HistoryState Unit Tests
 */
import { HistoryState, HISTORY_CONFIG } from '@src/state/history/HistoryState';
import { CursorPosition } from '@src/state/CursorPosition';

describe('HistoryState', () => {
  describe('Constructor', () => {
    it('should create state with default limits', () => {
      const state = new HistoryState();
      expect(state.registers).toEqual({});
      expect(state.markPositions).toEqual({});
      expect(state.jumpList).toEqual([]);
      expect(state.changeList).toEqual([]);
      expect(state.searchHistory).toEqual([]);
      expect(state.commandHistory).toEqual([]);
    });

    it('should accept custom limits', () => {
      const state = new HistoryState({
        maxSize: 5,
        maxSearchHistory: 3,
        maxCommandHistory: 4,
        maxJumpList: 2,
        maxChangeList: 1,
      });
      expect(state).toBeDefined();
    });
  });

  describe('addToJumpList', () => {
    it('should add position to jump list', () => {
      const state = new HistoryState();
      state.addToJumpList(new CursorPosition(5, 10));
      expect(state.jumpList.length).toBe(1);
      expect(state.jumpList[0]?.line).toBe(5);
      expect(state.jumpList[0]?.column).toBe(10);
    });

    it('should remove oldest entry when limit exceeded', () => {
      const state = new HistoryState({ maxJumpList: 3 });
      state.addToJumpList(new CursorPosition(1, 1));
      state.addToJumpList(new CursorPosition(2, 2));
      state.addToJumpList(new CursorPosition(3, 3));
      state.addToJumpList(new CursorPosition(4, 4));

      expect(state.jumpList.length).toBe(3);
      expect(state.jumpList[0]?.line).toBe(2);
      expect(state.jumpList[2]?.line).toBe(4);
    });
  });

  describe('addToChangeList', () => {
    it('should add position to change list', () => {
      const state = new HistoryState();
      state.addToChangeList(new CursorPosition(5, 10));
      expect(state.changeList.length).toBe(1);
      expect(state.changeList[0]?.line).toBe(5);
    });

    it('should remove oldest entry when limit exceeded', () => {
      const state = new HistoryState({ maxChangeList: 2 });
      state.addToChangeList(new CursorPosition(1, 1));
      state.addToChangeList(new CursorPosition(2, 2));
      state.addToChangeList(new CursorPosition(3, 3));

      expect(state.changeList.length).toBe(2);
      expect(state.changeList[0]?.line).toBe(2);
      expect(state.changeList[1]?.line).toBe(3);
    });
  });

  describe('addToSearchHistory', () => {
    it('should add search term to history', () => {
      const state = new HistoryState();
      state.addToSearchHistory('test');
      expect(state.searchHistory.length).toBe(1);
      expect(state.searchHistory[0]).toBe('test');
    });

    it('should maintain order of search terms', () => {
      const state = new HistoryState();
      state.addToSearchHistory('first');
      state.addToSearchHistory('second');
      state.addToSearchHistory('third');

      expect(state.searchHistory.length).toBe(3);
      expect(state.searchHistory[0]).toBe('first');
      expect(state.searchHistory[2]).toBe('third');
    });

    it('should remove oldest entry when limit exceeded', () => {
      const state = new HistoryState({ maxSearchHistory: 3 });
      state.addToSearchHistory('search1');
      state.addToSearchHistory('search2');
      state.addToSearchHistory('search3');
      state.addToSearchHistory('search4');

      expect(state.searchHistory.length).toBe(3);
      expect(state.searchHistory[0]).toBe('search2');
      expect(state.searchHistory[2]).toBe('search4');
    });
  });

  describe('addToCommandHistory', () => {
    it('should add command to history', () => {
      const state = new HistoryState();
      state.addToCommandHistory(':w');
      expect(state.commandHistory.length).toBe(1);
      expect(state.commandHistory[0]).toBe(':w');
    });

    it('should maintain order of commands', () => {
      const state = new HistoryState();
      state.addToCommandHistory(':w');
      state.addToCommandHistory(':q');
      state.addToCommandHistory(':split');

      expect(state.commandHistory.length).toBe(3);
      expect(state.commandHistory[0]).toBe(':w');
      expect(state.commandHistory[2]).toBe(':split');
    });

    it('should remove oldest entry when limit exceeded', () => {
      const state = new HistoryState({ maxCommandHistory: 2 });
      state.addToCommandHistory(':cmd1');
      state.addToCommandHistory(':cmd2');
      state.addToCommandHistory(':cmd3');

      expect(state.commandHistory.length).toBe(2);
      expect(state.commandHistory[0]).toBe(':cmd2');
      expect(state.commandHistory[1]).toBe(':cmd3');
    });
  });

  describe('setRegister', () => {
    it('should set register content', () => {
      const state = new HistoryState();
      state.setRegister('a', 'test content');
      expect(state.registers['a']).toBe('test content');
    });

    it('should set multiple registers', () => {
      const state = new HistoryState();
      state.setRegister('a', 'content A');
      state.setRegister('b', 'content B');
      state.setRegister('c', 'content C');

      expect(state.registers['a']).toBe('content A');
      expect(state.registers['b']).toBe('content B');
      expect(state.registers['c']).toBe('content C');
    });

    it('should remove oldest registers when limit exceeded', () => {
      const state = new HistoryState({ maxSize: 3 });
      state.setRegister('a', 'content A');
      state.setRegister('b', 'content B');
      state.setRegister('c', 'content C');
      state.setRegister('d', 'content D');

      expect(state.registers['a']).toBeUndefined();
      expect(state.registers['b']).toBe('content B');
      expect(state.registers['c']).toBe('content C');
      expect(state.registers['d']).toBe('content D');
    });
  });

  describe('HISTORY_CONFIG', () => {
    it('should have default max size', () => {
      expect(HISTORY_CONFIG.MAX_SIZE).toBe(50);
    });

    it('should have default max search history', () => {
      expect(HISTORY_CONFIG.MAX_SEARCH_HISTORY).toBe(20);
    });

    it('should have default max command history', () => {
      expect(HISTORY_CONFIG.MAX_COMMAND_HISTORY).toBe(50);
    });

    it('should have default max jump list', () => {
      expect(HISTORY_CONFIG.MAX_JUMP_LIST).toBe(100);
    });

    it('should have default max change list', () => {
      expect(HISTORY_CONFIG.MAX_CHANGE_LIST).toBe(100);
    });
  });
});
