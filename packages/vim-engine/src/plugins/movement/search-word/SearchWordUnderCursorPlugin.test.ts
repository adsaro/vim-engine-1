/**
 * SearchWordUnderCursorPlugin Unit Tests
 * Tests for the * key plugin (search for word under cursor)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { SearchWordUnderCursorPlugin } from './SearchWordUnderCursorPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimState } from '../../../state/VimState';
import { VIM_MODE } from '../../../state/VimMode';
import { CursorPosition } from '../../../state/CursorPosition';

describe('SearchWordUnderCursorPlugin', () => {
  let plugin: SearchWordUnderCursorPlugin;
  let state: VimState;
  let context: ExecutionContext;

  beforeEach(() => {
    plugin = new SearchWordUnderCursorPlugin();
    state = new VimState();
    context = new ExecutionContext(state);
  });

  describe('Metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('movement-search-word');
    });

    it('should have correct version', () => {
      expect(plugin.version).toBe('1.0.0');
    });

    it('should have correct description', () => {
      expect(plugin.description).toBe('Search for word under cursor (* key)');
    });

    it('should have correct pattern', () => {
      expect(plugin.patterns).toEqual(['*']);
    });

    it('should support NORMAL and VISUAL modes', () => {
      expect(plugin.modes).toContain(VIM_MODE.NORMAL);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
      expect(plugin.modes).not.toContain(VIM_MODE.INSERT);
      expect(plugin.modes).not.toContain(VIM_MODE.COMMAND);
    });

    it('should validate pattern correctly', () => {
      expect(plugin.validatePattern('*')).toBe(true);
      expect(plugin.validatePattern('/')).toBe(false);
      expect(plugin.validatePattern('?')).toBe(false);
      expect(plugin.validatePattern('other')).toBe(false);
    });
  });

  describe('Initialization', () => {
    it('should initialize correctly', () => {
      expect(plugin).toBeInstanceOf(SearchWordUnderCursorPlugin);
    });
  });

  describe('Action Behavior', () => {
    it('should extract word under cursor correctly', () => {
      state = new VimState('hello world');
      context = new ExecutionContext(state);
      context.setCursor(new CursorPosition(0, 2)); // On 'l' in 'hello'

      plugin.execute(context);

      expect(state.lastSearchPattern).toBe('\\bhello\\b');
      expect(state.lastSearchDirection).toBe('forward');
      expect(state.searchMatches.length).toBeGreaterThan(0);
    });

    it('should do nothing when not on a word', () => {
      state = new VimState('hello world');
      context = new ExecutionContext(state);
      context.setCursor(new CursorPosition(0, 5)); // On space

      const initialCursor = context.getCursor().clone();

      plugin.execute(context);

      // State should not be modified
      expect(state.lastSearchPattern).toBeNull();
      expect(state.lastSearchDirection).toBeNull();
      expect(state.searchMatches).toEqual([]);
      expect(state.currentMatchPosition).toBeNull();
      expect(context.getCursor().equals(initialCursor)).toBe(true);
    });

    it('should create regex with word boundaries', () => {
      state = new VimState('hello world hello');
      context = new ExecutionContext(state);
      context.setCursor(new CursorPosition(0, 2)); // On 'l' in 'hello'

      plugin.execute(context);

      expect(state.lastSearchPattern).toBe('\\bhello\\b');
    });

    it('should find all matches', () => {
      state = new VimState('hello world hello');
      context = new ExecutionContext(state);
      context.setCursor(new CursorPosition(0, 2)); // On 'l' in 'hello'

      plugin.execute(context);

      // Should find both occurrences of 'hello'
      expect(state.searchMatches.length).toBe(2);
      expect(state.searchMatches[0].equals(new CursorPosition(0, 0))).toBe(true);
      expect(state.searchMatches[1].equals(new CursorPosition(0, 12))).toBe(true);
    });

    it('should skip current position if it matches', () => {
      state = new VimState('hello world hello');
      context = new ExecutionContext(state);
      context.setCursor(new CursorPosition(0, 0)); // At start of first 'hello'

      plugin.execute(context);

      // Should move to second occurrence
      expect(state.currentMatchPosition?.equals(new CursorPosition(0, 12))).toBe(true);
    });

    it('should update state correctly', () => {
      state = new VimState('hello world');
      context = new ExecutionContext(state);
      context.setCursor(new CursorPosition(0, 2)); // On 'l' in 'hello'

      plugin.execute(context);

      expect(state.lastSearchPattern).toBe('\\bhello\\b');
      expect(state.lastSearchDirection).toBe('forward');
      expect(state.searchMatches.length).toBeGreaterThan(0);
      expect(state.currentMatchPosition).not.toBeNull();
    });

    it('should move cursor to first match', () => {
      state = new VimState('hello world hello');
      context = new ExecutionContext(state);
      context.setCursor(new CursorPosition(0, 7)); // On 'w' in 'world'

      plugin.execute(context);

      // Should move to first match of 'world' (only one)
      expect(context.getCursor().equals(new CursorPosition(0, 6))).toBe(true);
    });

    it('should handle word at end of line', () => {
      state = new VimState('hello world');
      context = new ExecutionContext(state);
      context.setCursor(new CursorPosition(0, 8)); // On 'r' in 'world'

      plugin.execute(context);

      expect(state.lastSearchPattern).toBe('\\bworld\\b');
      expect(state.searchMatches.length).toBe(1);
      expect(state.searchMatches[0].equals(new CursorPosition(0, 6))).toBe(true);
    });

    it('should handle word at start of line', () => {
      state = new VimState('hello world');
      context = new ExecutionContext(state);
      context.setCursor(new CursorPosition(0, 1)); // On 'e' in 'hello' (not at start)

      plugin.execute(context);

      expect(state.lastSearchPattern).toBe('\\bhello\\b');
      expect(state.searchMatches.length).toBe(1);
      expect(state.searchMatches[0].equals(new CursorPosition(0, 0))).toBe(true);
    });

    it('should handle multi-line buffers', () => {
      state = new VimState('hello\nworld\nhello');
      context = new ExecutionContext(state);
      context.setCursor(new CursorPosition(0, 2)); // On 'l' in first 'hello'

      plugin.execute(context);

      // Should find both 'hello' occurrences
      expect(state.searchMatches.length).toBe(2);
      expect(state.searchMatches[0].equals(new CursorPosition(0, 0))).toBe(true);
      expect(state.searchMatches[1].equals(new CursorPosition(2, 0))).toBe(true);
    });

    it('should do nothing when only match is current position', () => {
      state = new VimState('hello');
      context = new ExecutionContext(state);
      context.setCursor(new CursorPosition(0, 0)); // At start of 'hello'

      const initialCursor = context.getCursor().clone();

      plugin.execute(context);

      // Should find match at (0,0) which is cursor position
      expect(state.searchMatches.length).toBe(1);
      expect(state.searchMatches[0].equals(new CursorPosition(0, 0))).toBe(true);
      // Cursor should stay at current position since only match is current position
      expect(context.getCursor().equals(initialCursor)).toBe(true);
    });

    it('should do nothing when no matches found', () => {
      state = new VimState('hello world');
      context = new ExecutionContext(state);
      context.setCursor(new CursorPosition(0, 2)); // On 'l' in 'hello'

      // This is a bit tricky - we can't really have "no matches" since
      // the word itself is a match. But we can test the edge case where
      // the word is the only match and it's the current position.
      state = new VimState('hello');
      context = new ExecutionContext(state);
      context.setCursor(new CursorPosition(0, 0)); // At start of only 'hello'

      const initialCursor = context.getCursor().clone();

      plugin.execute(context);

      // Cursor should stay at current position
      expect(context.getCursor().equals(initialCursor)).toBe(true);
    });
  });

  describe('Mode Restrictions', () => {
    it('should execute in NORMAL mode', () => {
      state = new VimState('hello world');
      context = new ExecutionContext(state);
      context.setCursor(new CursorPosition(0, 2));
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(state.lastSearchPattern).toBe('\\bhello\\b');
    });

    it('should execute in VISUAL mode', () => {
      state = new VimState('hello world');
      context = new ExecutionContext(state);
      context.setCursor(new CursorPosition(0, 2));
      context.setMode(VIM_MODE.VISUAL);

      plugin.execute(context);

      expect(state.lastSearchPattern).toBe('\\bhello\\b');
    });

    it('should not execute in INSERT mode', () => {
      state = new VimState('hello world');
      context = new ExecutionContext(state);
      context.setCursor(new CursorPosition(0, 2));
      context.setMode(VIM_MODE.INSERT);

      const initialCursor = context.getCursor().clone();

      plugin.execute(context);

      // State should not be modified
      expect(state.lastSearchPattern).toBeNull();
      expect(context.getCursor().equals(initialCursor)).toBe(true);
    });

    it('should not execute in COMMAND mode', () => {
      state = new VimState('hello world');
      context = new ExecutionContext(state);
      context.setCursor(new CursorPosition(0, 2));
      context.setMode(VIM_MODE.COMMAND);

      const initialCursor = context.getCursor().clone();

      plugin.execute(context);

      // State should not be modified
      expect(state.lastSearchPattern).toBeNull();
      expect(context.getCursor().equals(initialCursor)).toBe(true);
    });

    it('should not execute in REPLACE mode', () => {
      state = new VimState('hello world');
      context = new ExecutionContext(state);
      context.setCursor(new CursorPosition(0, 2));
      context.setMode(VIM_MODE.REPLACE);

      const initialCursor = context.getCursor().clone();

      plugin.execute(context);

      // State should not be modified
      expect(state.lastSearchPattern).toBeNull();
      expect(context.getCursor().equals(initialCursor)).toBe(true);
    });

    it('should not execute in SELECT mode', () => {
      state = new VimState('hello world');
      context = new ExecutionContext(state);
      context.setCursor(new CursorPosition(0, 2));
      context.setMode(VIM_MODE.SELECT);

      const initialCursor = context.getCursor().clone();

      plugin.execute(context);

      // State should not be modified
      expect(state.lastSearchPattern).toBeNull();
      expect(context.getCursor().equals(initialCursor)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty buffer', () => {
      state = new VimState('');
      context = new ExecutionContext(state);
      context.setCursor(new CursorPosition(0, 0));

      const initialCursor = context.getCursor().clone();

      plugin.execute(context);

      // State should not be modified
      expect(state.lastSearchPattern).toBeNull();
      expect(state.searchMatches).toEqual([]);
      expect(context.getCursor().equals(initialCursor)).toBe(true);
    });

    it('should handle buffer with only spaces', () => {
      state = new VimState('     ');
      context = new ExecutionContext(state);
      context.setCursor(new CursorPosition(0, 2));

      const initialCursor = context.getCursor().clone();

      plugin.execute(context);

      // State should not be modified
      expect(state.lastSearchPattern).toBeNull();
      expect(state.searchMatches).toEqual([]);
      expect(context.getCursor().equals(initialCursor)).toBe(true);
    });

    it('should handle cursor at end of line', () => {
      state = new VimState('hello');
      context = new ExecutionContext(state);
      context.setCursor(new CursorPosition(0, 5)); // After 'hello'

      const initialCursor = context.getCursor().clone();

      plugin.execute(context);

      // State should not be modified
      expect(state.lastSearchPattern).toBeNull();
      expect(state.searchMatches).toEqual([]);
      expect(context.getCursor().equals(initialCursor)).toBe(true);
    });

    it('should handle single character word', () => {
      state = new VimState('a b c a');
      context = new ExecutionContext(state);
      context.setCursor(new CursorPosition(0, 0)); // On first 'a'

      plugin.execute(context);

      expect(state.lastSearchPattern).toBe('\\ba\\b');
      expect(state.searchMatches.length).toBe(2);
      // Should skip current position and move to second 'a' (at position 6)
      expect(state.currentMatchPosition?.equals(new CursorPosition(0, 6))).toBe(true);
    });

    it('should handle words with special characters', () => {
      state = new VimState('hello_world hello_world');
      context = new ExecutionContext(state);
      context.setCursor(new CursorPosition(0, 0)); // On 'h'

      plugin.execute(context);

      // Underscore is a word character, so 'hello_world' is treated as a single word
      expect(state.lastSearchPattern).toBe('\\bhello_world\\b');
      expect(state.searchMatches.length).toBe(2);
    });

    it('should handle case-sensitive matching', () => {
      state = new VimState('Hello hello HELLO');
      context = new ExecutionContext(state);
      context.setCursor(new CursorPosition(0, 1)); // On 'e' in 'Hello'

      plugin.execute(context);

      // Should only match 'Hello' (case-sensitive)
      expect(state.lastSearchPattern).toBe('\\bHello\\b');
      expect(state.searchMatches.length).toBe(1);
      expect(state.searchMatches[0].equals(new CursorPosition(0, 0))).toBe(true);
    });
  });
});
