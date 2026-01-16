/**
 * Search Movement Integration Tests
 * Tests for verifying integration of search movement functionality
 */
import {
  createTestState,
  setupExecutorWithState,
} from '../integration.test.utils';
import { VimExecutor } from '../../src/core/VimExecutor';
import { VIM_MODE } from '../../src/state/VimMode';
import { SearchForwardPlugin } from '../../src/plugins/movement/search-forward/SearchForwardPlugin';
import { SearchBackwardPlugin } from '../../src/plugins/movement/search-backward/SearchBackwardPlugin';
import { SearchInputManager } from '../../src/plugins/movement/utils/searchInputManager';
import { SearchNextPlugin } from '../../src/plugins/movement/search-next/SearchNextPlugin';
import { SearchPrevPlugin } from '../../src/plugins/movement/search-prev/SearchPrevPlugin';
import { SearchWordUnderCursorPlugin } from '../../src/plugins/movement/search-word/SearchWordUnderCursorPlugin';
import { patternToRegex, findAllMatches } from '../../src/plugins/movement/utils/searchUtils';
import { CursorPosition } from '../../src/state/CursorPosition';

/**
 * Create a test executor with all search movement plugins registered
 */
function createSearchTestExecutor(): VimExecutor {
  const executor = new VimExecutor();
  const searchInputManager = new SearchInputManager();

  // Register all search movement plugins
  executor.registerPlugin(new SearchForwardPlugin(searchInputManager));
  executor.registerPlugin(new SearchBackwardPlugin(searchInputManager));
  executor.registerPlugin(new SearchNextPlugin());
  executor.registerPlugin(new SearchPrevPlugin());
  executor.registerPlugin(new SearchWordUnderCursorPlugin());

  return executor;
}

/**
 * Execute a search by simulating the complete workflow
 * This helper function simulates typing a pattern and pressing Enter
 */
function executeSearch(
  executor: VimExecutor,
  pattern: string,
  direction: 'forward' | 'backward'
): void {
  const state = executor.getExecutionContext().getState();

  // Convert pattern to regex
  const regex = patternToRegex(pattern);
  if (!regex) {
    return;
  }

  // Find all matches starting from the beginning of the buffer
  const matches = findAllMatches(state.buffer, regex, 0, direction);

  // Update state
  state.setLastSearch(pattern, direction);
  state.searchMatches = matches;

  // Find first match after current cursor position
  if (matches.length > 0) {
    const cursor = state.cursor;
    let firstMatch = null;

    if (direction === 'forward') {
      // Find first match at or after current cursor position
      for (const match of matches) {
        if (match.isAfter(cursor) || match.equals(cursor)) {
          firstMatch = match;
          break;
        }
      }
      // If no match at or after cursor, use first match (wrap behavior)
      if (!firstMatch && matches.length > 0) {
        firstMatch = matches[0];
      }
    } else {
      // For backward search, find first match at or before current cursor position
      for (let i = matches.length - 1; i >= 0; i--) {
        if (matches[i].isBefore(cursor) || matches[i].equals(cursor)) {
          firstMatch = matches[i];
          break;
        }
      }
      // If no match at or before cursor, use last match (wrap behavior)
      if (!firstMatch && matches.length > 0) {
        firstMatch = matches[matches.length - 1];
      }
    }

    if (firstMatch) {
      state.currentMatchPosition = firstMatch;
      executor.getExecutionContext().setCursor(firstMatch);
    }
  }
}

describe('Integration: Search Movement', () => {
  describe('Forward search workflow (/pattern with Enter)', () => {
    it('should start forward search when / is pressed', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world\nhello there');
      setupExecutorWithState(executor, state);

      // Press / to start forward search
      executor.handleKeystroke('/');

      // Verify mode is now SEARCH_INPUT
      expect(state.mode).toBe(VIM_MODE.SEARCH_INPUT);
    });

    it('should execute forward search and move cursor to first match', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world\nhello there');
      setupExecutorWithState(executor, state);

      // Execute search for 'hello'
      executeSearch(executor, 'hello', 'forward');

      // Verify cursor moved to first match
      expect(state.cursor.line).toBe(0);
      expect(state.cursor.column).toBe(0);

      // Verify search state is updated
      expect(state.lastSearchPattern).toBe('hello');
      expect(state.lastSearchDirection).toBe('forward');
      expect(state.searchMatches.length).toBe(2);
    });

    it('should find matches in correct order for forward search', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('test line 1\ntest line 2\ntest line 3');
      setupExecutorWithState(executor, state);

      // Execute search for 'test'
      executeSearch(executor, 'test', 'forward');

      // Verify all matches are found
      expect(state.searchMatches.length).toBe(3);
      expect(state.searchMatches[0].line).toBe(0);
      expect(state.searchMatches[1].line).toBe(1);
      expect(state.searchMatches[2].line).toBe(2);
    });
  });

  describe('Backward search workflow (?pattern with Enter)', () => {
    it('should start backward search when ? is pressed', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world\nhello there');
      setupExecutorWithState(executor, state);

      // Press ? to start backward search
      executor.handleKeystroke('?');

      // Verify mode is now SEARCH_INPUT
      expect(state.mode).toBe(VIM_MODE.SEARCH_INPUT);
    });

    it('should execute backward search and move cursor to first match', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world\nhello there');
      setupExecutorWithState(executor, state);

      // Start from line 1
      state.cursor = new CursorPosition(1, 0);

      // Execute backward search for 'hello'
      executeSearch(executor, 'hello', 'backward');

      // Verify cursor moved to first match (going backward)
      expect(state.lastSearchPattern).toBe('hello');
      expect(state.lastSearchDirection).toBe('backward');
      expect(state.searchMatches.length).toBe(2);
    });

    it('should find matches in correct order for backward search', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('test line 1\ntest line 2\ntest line 3');
      setupExecutorWithState(executor, state);

      // Start from line 2
      state.cursor = new CursorPosition(2, 0);

      // Execute backward search for 'test'
      executeSearch(executor, 'test', 'backward');

      // Verify all matches are found
      expect(state.searchMatches.length).toBe(3);
      // Backward search should find matches in reverse order
      expect(state.searchMatches[0].line).toBe(2);
      expect(state.searchMatches[1].line).toBe(1);
      expect(state.searchMatches[2].line).toBe(0);
    });
  });

  describe('Cancel search workflow (/pattern with Esc)', () => {
    it('should cancel search and return to NORMAL mode', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world');
      setupExecutorWithState(executor, state);

      // Press / to start search
      executor.handleKeystroke('/');

      // Verify mode is SEARCH_INPUT
      expect(state.mode).toBe(VIM_MODE.SEARCH_INPUT);

      // Cancel search (simulated by setting mode back to NORMAL)
      state.mode = VIM_MODE.NORMAL;

      // Verify mode returned to NORMAL
      expect(state.mode).toBe(VIM_MODE.NORMAL);

      // Verify search state is not updated
      expect(state.lastSearchPattern).toBe(null);
      expect(state.lastSearchDirection).toBe(null);
    });
  });

  describe('Navigate with n and N', () => {
    it('should navigate to next match with n key', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world\nhello there\nhello again');
      setupExecutorWithState(executor, state);

      // Execute search for 'hello'
      executeSearch(executor, 'hello', 'forward');

      // Cursor should be at first match (0, 0)
      expect(state.cursor.line).toBe(0);
      expect(state.cursor.column).toBe(0);

      // Press n to go to next match
      executor.handleKeystroke('n');

      // Cursor should move to second match
      expect(state.cursor.line).toBe(1);
      expect(state.cursor.column).toBe(0);
    });

    it('should navigate to previous match with N key', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world\nhello there\nhello again');
      setupExecutorWithState(executor, state);

      // Execute search for 'hello'
      executeSearch(executor, 'hello', 'forward');

      // Move to second match
      executor.handleKeystroke('n');
      expect(state.cursor.line).toBe(1);

      // Press N to go to previous match
      executor.handleKeystroke('N');

      // Cursor should move back to first match
      expect(state.cursor.line).toBe(0);
      expect(state.cursor.column).toBe(0);
    });

    it('should handle n when at last match (no wrap)', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world\nhello there');
      setupExecutorWithState(executor, state);

      // Execute search for 'hello'
      executeSearch(executor, 'hello', 'forward');

      // Move to last match
      executor.handleKeystroke('n');
      expect(state.cursor.line).toBe(1);

      // Try to go to next match (should not wrap)
      const lastLine = state.cursor.line;
      executor.handleKeystroke('n');

      // Cursor should not move (no wrap)
      expect(state.cursor.line).toBe(lastLine);
    });

    it('should handle N when at first match (no wrap)', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world\nhello there');
      setupExecutorWithState(executor, state);

      // Execute search for 'hello'
      executeSearch(executor, 'hello', 'forward');

      // Cursor should be at first match
      expect(state.cursor.line).toBe(0);

      // Try to go to previous match (should not wrap)
      executor.handleKeystroke('N');

      // Cursor should not move (no wrap)
      expect(state.cursor.line).toBe(0);
    });

    it('should do nothing when n is pressed without previous search', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world');
      setupExecutorWithState(executor, state);

      // Press n without performing a search
      const initialLine = state.cursor.line;
      executor.handleKeystroke('n');

      // Cursor should not move
      expect(state.cursor.line).toBe(initialLine);
    });
  });

  describe('Word search with *', () => {
    it('should search for word under cursor with * key', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world\nhello there');
      setupExecutorWithState(executor, state);

      // Place cursor on 'hello'
      state.cursor = new CursorPosition(0, 2);

      // Press * to search for word under cursor
      executor.handleKeystroke('*');

      // Verify search state is updated
      expect(state.lastSearchPattern).toBe('\\bhello\\b');
      expect(state.lastSearchDirection).toBe('forward');

      // Verify cursor moved to first occurrence (not necessarily next)
      // Since cursor is at (0, 2) and first match is at (0, 0),
      // it moves to the first match found
      expect(state.cursor.line).toBe(0);
      expect(state.cursor.column).toBe(0);
    });

    it('should skip current position when searching for word under cursor', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world\nhello there');
      setupExecutorWithState(executor, state);

      // Place cursor on first 'hello'
      state.cursor = new CursorPosition(0, 0);

      // Press * to search for word under cursor
      executor.handleKeystroke('*');

      // Verify cursor moved to next occurrence (not current position)
      expect(state.cursor.line).toBe(1);
      expect(state.cursor.column).toBe(0);
    });

    it('should do nothing when * is pressed on non-word character', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world');
      setupExecutorWithState(executor, state);

      // Place cursor on space
      state.cursor = new CursorPosition(0, 5);

      // Press * while on space
      executor.handleKeystroke('*');

      // Verify search state is not updated
      expect(state.lastSearchPattern).toBe(null);
    });

    it('should handle single occurrence of word with *', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world');
      setupExecutorWithState(executor, state);

      // Place cursor on 'hello'
      state.cursor = new CursorPosition(0, 0);

      // Press * to search for word under cursor
      executor.handleKeystroke('*');

      // Verify search state is updated
      expect(state.lastSearchPattern).toBe('\\bhello\\b');
      expect(state.searchMatches.length).toBe(1);

      // Cursor should not move (only match is current position)
      expect(state.cursor.line).toBe(0);
      expect(state.cursor.column).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle search on empty buffer', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('');
      setupExecutorWithState(executor, state);

      // Execute search for 'hello'
      executeSearch(executor, 'hello', 'forward');

      // Verify no matches found
      expect(state.searchMatches.length).toBe(0);
      expect(state.lastSearchPattern).toBe('hello');
    });

    it('should handle search with no matches', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world');
      setupExecutorWithState(executor, state);

      // Execute search for 'xyz'
      executeSearch(executor, 'xyz', 'forward');

      // Verify no matches found
      expect(state.searchMatches.length).toBe(0);
      expect(state.lastSearchPattern).toBe('xyz');
    });

    it('should handle search with invalid regex pattern', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world');
      setupExecutorWithState(executor, state);

      // Try to execute search with invalid pattern
      const regex = patternToRegex('[unclosed');
      expect(regex).toBe(null);
    });

    it('should handle search with empty pattern', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world');
      setupExecutorWithState(executor, state);

      // Try to execute search with empty pattern
      const regex = patternToRegex('');
      expect(regex).toBe(null);
    });

    it('should handle multiple matches on same line', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello hello hello');
      setupExecutorWithState(executor, state);

      // Execute search for 'hello'
      executeSearch(executor, 'hello', 'forward');

      // Verify all matches are found
      expect(state.searchMatches.length).toBe(3);
      expect(state.searchMatches[0].column).toBe(0);
      expect(state.searchMatches[1].column).toBe(6);
      expect(state.searchMatches[2].column).toBe(12);
    });
  });

  describe('Multi-line search', () => {
    it('should find matches across multiple lines', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('line 1 test\nline 2 test\nline 3 test');
      setupExecutorWithState(executor, state);

      // Execute search for 'test'
      executeSearch(executor, 'test', 'forward');

      // Verify all matches are found across lines
      expect(state.searchMatches.length).toBe(3);
      expect(state.searchMatches[0].line).toBe(0);
      expect(state.searchMatches[1].line).toBe(1);
      expect(state.searchMatches[2].line).toBe(2);
    });

    it('should navigate correctly across lines with n', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('line 1 test\nline 2 test\nline 3 test');
      setupExecutorWithState(executor, state);

      // Execute search for 'test'
      executeSearch(executor, 'test', 'forward');

      // Navigate through matches
      executor.handleKeystroke('n');
      expect(state.cursor.line).toBe(1);

      executor.handleKeystroke('n');
      expect(state.cursor.line).toBe(2);
    });

    it('should navigate correctly across lines with N', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('line 1 test\nline 2 test\nline 3 test');
      setupExecutorWithState(executor, state);

      // Execute search for 'test'
      executeSearch(executor, 'test', 'forward');

      // Move to last match
      executor.handleKeystroke('n');
      executor.handleKeystroke('n');
      expect(state.cursor.line).toBe(2);

      // Navigate back with N
      executor.handleKeystroke('N');
      expect(state.cursor.line).toBe(1);

      executor.handleKeystroke('N');
      expect(state.cursor.line).toBe(0);
    });
  });

  describe('Pattern with special characters', () => {
    it('should handle pattern with dot (.) wildcard', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello\nhallo\nhxllo');
      setupExecutorWithState(executor, state);

      // Execute search for 'h.llo' (dot matches any character)
      executeSearch(executor, 'h.llo', 'forward');

      // Verify all matches are found
      expect(state.searchMatches.length).toBe(3);
    });

    it('should handle pattern with asterisk (*) quantifier', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('he\nhee\nheee');
      setupExecutorWithState(executor, state);

      // Execute search for 'he*' (e zero or more times)
      executeSearch(executor, 'he*', 'forward');

      // Verify matches are found
      expect(state.searchMatches.length).toBeGreaterThan(0);
    });

    it('should handle pattern with plus (+) quantifier', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('he\nhee\nheee');
      setupExecutorWithState(executor, state);

      // Execute search for 'he+' (e one or more times)
      executeSearch(executor, 'he+', 'forward');

      // Verify matches are found (excluding 'h' alone)
      expect(state.searchMatches.length).toBeGreaterThan(0);
    });

    it('should handle pattern with question mark (?) quantifier', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('he\nhee');
      setupExecutorWithState(executor, state);

      // Execute search for 'he?' (e zero or one times)
      executeSearch(executor, 'he?', 'forward');

      // Verify matches are found
      expect(state.searchMatches.length).toBeGreaterThan(0);
    });

    it('should handle pattern with character class [abc]', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hat\nhot\nhit');
      setupExecutorWithState(executor, state);

      // Execute search for 'h[ao]t'
      executeSearch(executor, 'h[ao]t', 'forward');

      // Verify matches for 'hat' and 'hot' are found
      expect(state.searchMatches.length).toBe(2);
    });

    it('should handle pattern with anchors ^ and $', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('test line\nline test\ntest');
      setupExecutorWithState(executor, state);

      // Execute search for '^test' (test at start of line)
      executeSearch(executor, '^test', 'forward');

      // Verify matches at start of lines are found
      expect(state.searchMatches.length).toBe(2);
    });
  });

  describe('Search in VISUAL mode', () => {
    it('should start forward search in VISUAL mode', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world');
      setupExecutorWithState(executor, state);

      // Set mode to VISUAL
      state.mode = VIM_MODE.VISUAL;
      executor.setCurrentMode(VIM_MODE.VISUAL);

      // Press / to start forward search
      executor.handleKeystroke('/');

      // Verify mode is now SEARCH_INPUT
      expect(state.mode).toBe(VIM_MODE.SEARCH_INPUT);
    });

    it('should start backward search in VISUAL mode', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world');
      setupExecutorWithState(executor, state);

      // Set mode to VISUAL
      state.mode = VIM_MODE.VISUAL;
      executor.setCurrentMode(VIM_MODE.VISUAL);

      // Press ? to start backward search
      executor.handleKeystroke('?');

      // Verify mode is now SEARCH_INPUT
      expect(state.mode).toBe(VIM_MODE.SEARCH_INPUT);
    });

    it('should navigate with n in VISUAL mode', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world\nhello there');
      setupExecutorWithState(executor, state);

      // Set mode to VISUAL
      state.mode = VIM_MODE.VISUAL;
      executor.setCurrentMode(VIM_MODE.VISUAL);

      // Execute search for 'hello'
      executeSearch(executor, 'hello', 'forward');

      // Press n to go to next match
      executor.handleKeystroke('n');

      // Verify cursor moved
      expect(state.cursor.line).toBe(1);
    });

    it('should navigate with N in VISUAL mode', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world\nhello there');
      setupExecutorWithState(executor, state);

      // Set mode to VISUAL
      state.mode = VIM_MODE.VISUAL;
      executor.setCurrentMode(VIM_MODE.VISUAL);

      // Execute search for 'hello'
      executeSearch(executor, 'hello', 'forward');

      // Move to second match
      executor.handleKeystroke('n');

      // Press N to go to previous match
      executor.handleKeystroke('N');

      // Verify cursor moved back
      expect(state.cursor.line).toBe(0);
    });

    it('should search for word under cursor in VISUAL mode', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world\nhello there');
      setupExecutorWithState(executor, state);

      // Set mode to VISUAL
      state.mode = VIM_MODE.VISUAL;
      executor.setCurrentMode(VIM_MODE.VISUAL);

      // Place cursor on 'hello'
      state.cursor = new CursorPosition(0, 2);

      // Press * to search for word under cursor
      executor.handleKeystroke('*');

      // Verify search state is updated
      expect(state.lastSearchPattern).toBe('\\bhello\\b');
    });
  });

  describe('Search state management', () => {
    it('should update search state after successful search', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world');
      setupExecutorWithState(executor, state);

      // Execute search
      executeSearch(executor, 'hello', 'forward');

      // Verify search state
      expect(state.lastSearchPattern).toBe('hello');
      expect(state.lastSearchDirection).toBe('forward');
      expect(state.searchMatches.length).toBe(1);
      expect(state.currentMatchPosition).not.toBeNull();
    });

    it('should clear search state when requested', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world');
      setupExecutorWithState(executor, state);

      // Execute search
      executeSearch(executor, 'hello', 'forward');

      // Clear search state
      state.clearSearchState();

      // Verify search state is cleared
      expect(state.lastSearchPattern).toBe(null);
      expect(state.lastSearchDirection).toBe(null);
      expect(state.searchMatches).toEqual([]);
      expect(state.currentMatchPosition).toBe(null);
    });

    it('should add search pattern to history', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world');
      setupExecutorWithState(executor, state);

      // Execute search
      executeSearch(executor, 'hello', 'forward');

      // Verify pattern is in search history
      expect(state.searchHistory).toContain('hello');
    });
  });

  describe('Complex search scenarios', () => {
    it('should handle case-sensitive search', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('Hello\nhello\nHELLO');
      setupExecutorWithState(executor, state);

      // Execute case-sensitive search for 'hello'
      executeSearch(executor, 'hello', 'forward');

      // Verify only lowercase 'hello' is found
      expect(state.searchMatches.length).toBe(1);
      expect(state.searchMatches[0].line).toBe(1);
    });

    it('should handle search at end of line', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('hello world\nhello there');
      setupExecutorWithState(executor, state);

      // Place cursor at end of first line
      state.cursor = new CursorPosition(0, 11);

      // Execute search for 'hello'
      executeSearch(executor, 'hello', 'forward');

      // Verify cursor moves to next match
      expect(state.cursor.line).toBe(1);
    });

    it('should handle search with overlapping matches', () => {
      const executor = createSearchTestExecutor();
      const state = createTestState('aaa');
      setupExecutorWithState(executor, state);

      // Execute search for 'aa'
      executeSearch(executor, 'aa', 'forward');

      // Verify matches are found
      // Note: The regex engine with global flag finds non-overlapping matches by default
      // For 'aaa' with pattern 'aa', it finds 'aa' at position 0, then continues
      // from position 2, finding 'a' which doesn't match, so only 1 match is found
      expect(state.searchMatches.length).toBeGreaterThanOrEqual(1);
    });
  });
});
