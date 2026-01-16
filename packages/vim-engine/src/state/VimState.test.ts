/**
 * VimState Unit Tests
 */
import { VimState } from './VimState';
import { CursorPosition } from './CursorPosition';
import { TextBuffer } from './TextBuffer';
import { VimMode, VIM_MODE } from './VimMode';

describe('VimState', () => {
  describe('Constructor', () => {
    it('should create empty state with defaults', () => {
      const state = new VimState();
      expect(state.mode).toBe(VIM_MODE.NORMAL);
      expect(state.buffer).toBeInstanceOf(TextBuffer);
      expect(state.cursor).toBeInstanceOf(CursorPosition);
      expect(state.buffer.getLineCount()).toBe(0);
      expect(state.cursor.line).toBe(0);
      expect(state.cursor.column).toBe(0);
    });

    it('should create state with initial content', () => {
      const state = new VimState('line1\nline2\nline3');
      expect(state.buffer.getLineCount()).toBe(3);
      expect(state.mode).toBe(VIM_MODE.NORMAL);
    });
  });

  describe('Getters and Setters', () => {
    describe('mode', () => {
      it('should get current mode', () => {
        const state = new VimState();
        expect(state.mode).toBe(VIM_MODE.NORMAL);
      });

      it('should set mode', () => {
        const state = new VimState();
        state.mode = VIM_MODE.INSERT;
        expect(state.mode).toBe(VIM_MODE.INSERT);
      });
    });

    describe('buffer', () => {
      it('should return the buffer instance', () => {
        const state = new VimState('test');
        expect(state.buffer).toBeInstanceOf(TextBuffer);
        expect(state.buffer.getLine(0)).toBe('test');
      });

      it('should allow setting new buffer', () => {
        const state = new VimState('old');
        const newBuffer = new TextBuffer('new content');
        state.buffer = newBuffer;
        expect(state.buffer.getContent()).toBe('new content');
      });
    });

    describe('cursor', () => {
      it('should return the cursor instance', () => {
        const state = new VimState();
        expect(state.cursor).toBeInstanceOf(CursorPosition);
        expect(state.cursor.line).toBe(0);
        expect(state.cursor.column).toBe(0);
      });

      it('should allow setting new cursor', () => {
        const state = new VimState();
        const newCursor = new CursorPosition(5, 10);
        state.cursor = newCursor;
        expect(state.cursor.line).toBe(5);
        expect(state.cursor.column).toBe(10);
      });
    });

    describe('registers', () => {
      it('should return registers object', () => {
        const state = new VimState();
        expect(state.registers).toBeDefined();
        expect(typeof state.registers).toBe('object');
      });

      it('should allow storing values', () => {
        const state = new VimState();
        state.registers['a'] = 'test content';
        expect(state.registers['a']).toBe('test content');
      });
    });

    describe('markPositions', () => {
      it('should return markPositions object', () => {
        const state = new VimState();
        expect(state.markPositions).toBeDefined();
        expect(typeof state.markPositions).toBe('object');
      });

      it('should allow storing marks', () => {
        const state = new VimState();
        state.markPositions['a'] = new CursorPosition(5, 10);
        expect(state.markPositions['a']).toBeInstanceOf(CursorPosition);
        expect(state.markPositions['a']?.line).toBe(5);
        expect(state.markPositions['a']?.column).toBe(10);
      });
    });

    describe('jumpList', () => {
      it('should return jumpList array', () => {
        const state = new VimState();
        expect(state.jumpList).toBeInstanceOf(Array);
        expect(state.jumpList.length).toBe(0);
      });

      it('should allow adding jumps', () => {
        const state = new VimState();
        state.jumpList.push(new CursorPosition(5, 10));
        expect(state.jumpList.length).toBe(1);
      });
    });

    describe('changeList', () => {
      it('should return changeList array', () => {
        const state = new VimState();
        expect(state.changeList).toBeInstanceOf(Array);
        expect(state.changeList.length).toBe(0);
      });

      it('should allow adding changes', () => {
        const state = new VimState();
        state.changeList.push(new CursorPosition(5, 10));
        expect(state.changeList.length).toBe(1);
      });
    });

    describe('searchHistory', () => {
      it('should return searchHistory array', () => {
        const state = new VimState();
        expect(state.searchHistory).toBeInstanceOf(Array);
        expect(state.searchHistory.length).toBe(0);
      });

      it('should allow pushing search terms', () => {
        const state = new VimState();
        state.searchHistory.push('test');
        expect(state.searchHistory[0]).toBe('test');
      });
    });

    describe('commandHistory', () => {
      it('should return commandHistory array', () => {
        const state = new VimState();
        expect(state.commandHistory).toBeInstanceOf(Array);
        expect(state.commandHistory.length).toBe(0);
      });

      it('should allow pushing commands', () => {
        const state = new VimState();
        state.commandHistory.push(':w');
        expect(state.commandHistory[0]).toBe(':w');
      });
    });
  });

  describe('Operations', () => {
    describe('addJump', () => {
      it('should add position to jump list', () => {
        const state = new VimState();
        state.addJump(new CursorPosition(5, 10));
        expect(state.jumpList.length).toBe(1);
        expect(state.jumpList[0]?.line).toBe(5);
        expect(state.jumpList[0]?.column).toBe(10);
      });

      it('should add multiple jumps', () => {
        const state = new VimState();
        state.addJump(new CursorPosition(1, 2));
        state.addJump(new CursorPosition(3, 4));
        expect(state.jumpList.length).toBe(2);
      });
    });

    describe('addChange', () => {
      it('should add position to change list', () => {
        const state = new VimState();
        state.addChange(new CursorPosition(5, 10));
        expect(state.changeList.length).toBe(1);
        expect(state.changeList[0]?.line).toBe(5);
        expect(state.changeList[0]?.column).toBe(10);
      });

      it('should add multiple changes', () => {
        const state = new VimState();
        state.addChange(new CursorPosition(1, 2));
        state.addChange(new CursorPosition(3, 4));
        expect(state.changeList.length).toBe(2);
      });
    });

    describe('pushSearch', () => {
      it('should add search term to history', () => {
        const state = new VimState();
        state.pushSearch('test');
        expect(state.searchHistory.length).toBe(1);
        expect(state.searchHistory[0]).toBe('test');
      });

      it('should add multiple search terms', () => {
        const state = new VimState();
        state.pushSearch('first');
        state.pushSearch('second');
        expect(state.searchHistory.length).toBe(2);
        expect(state.searchHistory[0]).toBe('first');
        expect(state.searchHistory[1]).toBe('second');
      });
    });

    describe('pushCommand', () => {
      it('should add command to history', () => {
        const state = new VimState();
        state.pushCommand(':w');
        expect(state.commandHistory.length).toBe(1);
        expect(state.commandHistory[0]).toBe(':w');
      });

      it('should add multiple commands', () => {
        const state = new VimState();
        state.pushCommand(':w');
        state.pushCommand(':q');
        expect(state.commandHistory.length).toBe(2);
        expect(state.commandHistory[0]).toBe(':w');
        expect(state.commandHistory[1]).toBe(':q');
      });
    });
  });

  describe('Utility Methods', () => {
    describe('clone', () => {
      it('should create independent copy', () => {
        const state = new VimState('line1\nline2');
        state.mode = VIM_MODE.INSERT;
        state.cursor = new CursorPosition(5, 10);
        state.registers['a'] = 'test';
        state.markPositions['b'] = new CursorPosition(3, 4);

        const cloned = state.clone();

        // Modifications to clone shouldn't affect original
        cloned.buffer.setLine(0, 'modified');
        cloned.mode = VIM_MODE.VISUAL;
        cloned.cursor = new CursorPosition(20, 30);

        expect(state.buffer.getLine(0)).toBe('line1');
        expect(state.mode).toBe(VIM_MODE.INSERT);
        expect(state.cursor.line).toBe(5);
        expect(state.cursor.column).toBe(10);
      });

      it('should have same initial content', () => {
        const state = new VimState('test content');
        const cloned = state.clone();
        expect(cloned.buffer.getContent()).toBe('test content');
        expect(cloned.mode).toBe(state.mode);
      });
    });

    describe('reset', () => {
      it('should reset to initial state', () => {
        const state = new VimState('some content');
        state.mode = VIM_MODE.INSERT;
        state.cursor = new CursorPosition(10, 20);
        state.registers['a'] = 'test';
        state.searchHistory.push('search');
        state.commandHistory.push(':w');

        state.reset();

        expect(state.mode).toBe(VIM_MODE.NORMAL);
        expect(state.cursor.line).toBe(0);
        expect(state.cursor.column).toBe(0);
        expect(state.buffer.getLineCount()).toBe(0);
        expect(state.registers).toEqual({});
        expect(state.searchHistory).toEqual([]);
        expect(state.commandHistory).toEqual([]);
        expect(state.jumpList).toEqual([]);
        expect(state.changeList).toEqual([]);
        expect(state.markPositions).toEqual({});
      });

      it('should work on fresh state', () => {
        const state = new VimState();
        state.reset();
        expect(state.mode).toBe(VIM_MODE.NORMAL);
        expect(state.buffer.isEmpty()).toBe(true);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should work with realistic vim workflow', () => {
      const state = new VimState();

      // Start with some content
      state.buffer.setContent('line1\nline2\nline3');

      // Move cursor
      state.cursor = new CursorPosition(1, 3);

      // Add a mark
      state.markPositions['m'] = state.cursor.clone();

      // Switch to insert mode
      state.mode = VIM_MODE.INSERT;

      // Add content
      state.buffer.setLine(1, 'line2 modified');

      // Switch back to normal mode
      state.mode = VIM_MODE.NORMAL;

      // Add jump
      state.addJump(state.cursor.clone());

      // Verify state
      expect(state.buffer.getLine(1)).toBe('line2 modified');
      expect(state.mode).toBe(VIM_MODE.NORMAL);
      expect(state.markPositions['m']?.line).toBe(1);
      expect(state.markPositions['m']?.column).toBe(3);
      expect(state.jumpList.length).toBe(1);
    });

    it('should handle multiple mode switches', () => {
      const state = new VimState();

      const modes: VimMode[] = [
        VIM_MODE.NORMAL,
        VIM_MODE.INSERT,
        VIM_MODE.NORMAL,
        VIM_MODE.VISUAL,
        VIM_MODE.NORMAL,
        VIM_MODE.COMMAND,
        VIM_MODE.NORMAL,
        VIM_MODE.REPLACE,
        VIM_MODE.NORMAL,
      ];

      modes.forEach(mode => {
        state.mode = mode;
        expect(state.mode).toBe(mode);
      });
    });

    it('should track change history correctly', () => {
      const state = new VimState();

      // Simulate cursor movements for change list
      state.addChange(new CursorPosition(0, 5));
      state.addChange(new CursorPosition(1, 10));
      state.addChange(new CursorPosition(2, 15));

      expect(state.changeList.length).toBe(3);
      expect(state.changeList[0]?.line).toBe(0);
      expect(state.changeList[1]?.line).toBe(1);
      expect(state.changeList[2]?.line).toBe(2);
    });

    it('should maintain search and command history', () => {
      const state = new VimState();

      // Simulate search history
      state.pushSearch('firstSearch');
      state.pushSearch('secondSearch');
      state.pushSearch('thirdSearch');

      // Simulate command history
      state.pushCommand(':w');
      state.pushCommand(':next');
      state.pushCommand(':split');

      expect(state.searchHistory.length).toBe(3);
      expect(state.searchHistory[2]).toBe('thirdSearch');

      expect(state.commandHistory.length).toBe(3);
      expect(state.commandHistory[2]).toBe(':split');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty buffer operations', () => {
      const state = new VimState();
      expect(state.buffer.isEmpty()).toBe(true);
      expect(state.cursor.isAtStart()).toBe(true);
    });

    it('should handle large content', () => {
      const lines = Array.from({ length: 1000 }, (_, i) => `line ${i}`);
      const state = new VimState(lines.join('\n'));
      expect(state.buffer.getLineCount()).toBe(1000);
      expect(state.buffer.getLine(999)).toBe('line 999');
    });

    it('should handle special characters in content', () => {
      const content = 'tabs\ttabs\nquotes"quotes\nbackslashes\\ends';
      const state = new VimState(content);
      expect(state.buffer.getContent()).toBe(content);
    });
  });

  describe('Search State', () => {
    describe('Properties', () => {
      it('should initialize lastSearchPattern as null', () => {
        const state = new VimState();
        expect(state.lastSearchPattern).toBe(null);
      });

      it('should initialize lastSearchDirection as null', () => {
        const state = new VimState();
        expect(state.lastSearchDirection).toBe(null);
      });

      it('should initialize currentMatchPosition as null', () => {
        const state = new VimState();
        expect(state.currentMatchPosition).toBe(null);
      });

      it('should initialize searchMatches as empty array', () => {
        const state = new VimState();
        expect(state.searchMatches).toEqual([]);
      });
    });

    describe('setLastSearch', () => {
      it('should set lastSearchPattern', () => {
        const state = new VimState();
        state.setLastSearch('test', 'forward');
        expect(state.lastSearchPattern).toBe('test');
      });

      it('should set lastSearchDirection to forward', () => {
        const state = new VimState();
        state.setLastSearch('test', 'forward');
        expect(state.lastSearchDirection).toBe('forward');
      });

      it('should set lastSearchDirection to backward', () => {
        const state = new VimState();
        state.setLastSearch('test', 'backward');
        expect(state.lastSearchDirection).toBe('backward');
      });

      it('should add pattern to search history', () => {
        const state = new VimState();
        state.setLastSearch('pattern', 'forward');
        expect(state.searchHistory).toContain('pattern');
        expect(state.searchHistory.length).toBe(1);
      });

      it('should update pattern and direction on subsequent calls', () => {
        const state = new VimState();
        state.setLastSearch('first', 'forward');
        expect(state.lastSearchPattern).toBe('first');
        expect(state.lastSearchDirection).toBe('forward');

        state.setLastSearch('second', 'backward');
        expect(state.lastSearchPattern).toBe('second');
        expect(state.lastSearchDirection).toBe('backward');
      });
    });

    describe('clearSearchState', () => {
      it('should clear lastSearchPattern', () => {
        const state = new VimState();
        state.setLastSearch('test', 'forward');
        state.clearSearchState();
        expect(state.lastSearchPattern).toBe(null);
      });

      it('should clear lastSearchDirection', () => {
        const state = new VimState();
        state.setLastSearch('test', 'forward');
        state.clearSearchState();
        expect(state.lastSearchDirection).toBe(null);
      });

      it('should clear currentMatchPosition', () => {
        const state = new VimState();
        state.currentMatchPosition = new CursorPosition(5, 10);
        state.clearSearchState();
        expect(state.currentMatchPosition).toBe(null);
      });

      it('should clear searchMatches array', () => {
        const state = new VimState();
        state.searchMatches = [
          new CursorPosition(0, 5),
          new CursorPosition(1, 10),
        ];
        state.clearSearchState();
        expect(state.searchMatches).toEqual([]);
      });

      it('should clear all search state at once', () => {
        const state = new VimState();
        state.setLastSearch('test', 'forward');
        state.currentMatchPosition = new CursorPosition(3, 7);
        state.searchMatches = [new CursorPosition(0, 0)];

        state.clearSearchState();

        expect(state.lastSearchPattern).toBe(null);
        expect(state.lastSearchDirection).toBe(null);
        expect(state.currentMatchPosition).toBe(null);
        expect(state.searchMatches).toEqual([]);
      });
    });

    describe('clone with search state', () => {
      it('should copy lastSearchPattern', () => {
        const state = new VimState();
        state.setLastSearch('pattern', 'forward');
        const cloned = state.clone();
        expect(cloned.lastSearchPattern).toBe('pattern');
      });

      it('should copy lastSearchDirection', () => {
        const state = new VimState();
        state.setLastSearch('pattern', 'backward');
        const cloned = state.clone();
        expect(cloned.lastSearchDirection).toBe('backward');
      });

      it('should copy currentMatchPosition', () => {
        const state = new VimState();
        state.currentMatchPosition = new CursorPosition(5, 10);
        const cloned = state.clone();
        expect(cloned.currentMatchPosition).toBeInstanceOf(CursorPosition);
        expect(cloned.currentMatchPosition?.line).toBe(5);
        expect(cloned.currentMatchPosition?.column).toBe(10);
      });

      it('should copy searchMatches array', () => {
        const state = new VimState();
        state.searchMatches = [
          new CursorPosition(0, 5),
          new CursorPosition(1, 10),
          new CursorPosition(2, 15),
        ];
        const cloned = state.clone();
        expect(cloned.searchMatches.length).toBe(3);
        expect(cloned.searchMatches[0]?.line).toBe(0);
        expect(cloned.searchMatches[0]?.column).toBe(5);
        expect(cloned.searchMatches[1]?.line).toBe(1);
        expect(cloned.searchMatches[1]?.column).toBe(10);
        expect(cloned.searchMatches[2]?.line).toBe(2);
        expect(cloned.searchMatches[2]?.column).toBe(15);
      });

      it('should create independent copy of searchMatches', () => {
        const state = new VimState();
        state.searchMatches = [new CursorPosition(0, 5)];
        const cloned = state.clone();
        cloned.searchMatches.push(new CursorPosition(1, 10));
        expect(state.searchMatches.length).toBe(1);
        expect(cloned.searchMatches.length).toBe(2);
      });

      it('should create independent copy of currentMatchPosition', () => {
        const state = new VimState();
        state.currentMatchPosition = new CursorPosition(5, 10);
        const cloned = state.clone();
        cloned.currentMatchPosition = cloned.currentMatchPosition?.withLine(20) ?? null;
        expect(state.currentMatchPosition?.line).toBe(5);
        expect(cloned.currentMatchPosition?.line).toBe(20);
      });
    });

    describe('reset with search state', () => {
      it('should clear lastSearchPattern on reset', () => {
        const state = new VimState();
        state.setLastSearch('test', 'forward');
        state.reset();
        expect(state.lastSearchPattern).toBe(null);
      });

      it('should clear lastSearchDirection on reset', () => {
        const state = new VimState();
        state.setLastSearch('test', 'backward');
        state.reset();
        expect(state.lastSearchDirection).toBe(null);
      });

      it('should clear currentMatchPosition on reset', () => {
        const state = new VimState();
        state.currentMatchPosition = new CursorPosition(5, 10);
        state.reset();
        expect(state.currentMatchPosition).toBe(null);
      });

      it('should clear searchMatches on reset', () => {
        const state = new VimState();
        state.searchMatches = [new CursorPosition(0, 5), new CursorPosition(1, 10)];
        state.reset();
        expect(state.searchMatches).toEqual([]);
      });

      it('should clear all search state on reset', () => {
        const state = new VimState();
        state.setLastSearch('pattern', 'forward');
        state.currentMatchPosition = new CursorPosition(3, 7);
        state.searchMatches = [new CursorPosition(0, 0)];

        state.reset();

        expect(state.lastSearchPattern).toBe(null);
        expect(state.lastSearchDirection).toBe(null);
        expect(state.currentMatchPosition).toBe(null);
        expect(state.searchMatches).toEqual([]);
      });
    });
  });
});
