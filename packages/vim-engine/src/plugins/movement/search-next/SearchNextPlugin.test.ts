/**
 * SearchNextPlugin Unit Tests
 * Tests for the n key plugin (jump to next search result)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { SearchNextPlugin } from './SearchNextPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimState } from '../../../state/VimState';
import { VIM_MODE } from '../../../state/VimMode';
import { CursorPosition } from '../../../state/CursorPosition';

describe('SearchNextPlugin', () => {
  let plugin: SearchNextPlugin;
  let state: VimState;
  let context: ExecutionContext;

  beforeEach(() => {
    plugin = new SearchNextPlugin();
    state = new VimState();
    context = new ExecutionContext(state);
  });

  describe('Metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('movement-search-next');
    });

    it('should have correct version', () => {
      expect(plugin.version).toBe('1.0.0');
    });

    it('should have correct description', () => {
      expect(plugin.description).toBe('Jump to next search result (n key)');
    });

    it('should have correct pattern', () => {
      expect(plugin.patterns).toEqual(['n']);
    });

    it('should support NORMAL and VISUAL modes', () => {
      expect(plugin.modes).toContain(VIM_MODE.NORMAL);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
      expect(plugin.modes).not.toContain(VIM_MODE.INSERT);
      expect(plugin.modes).not.toContain(VIM_MODE.COMMAND);
    });

    it('should validate pattern correctly', () => {
      expect(plugin.validatePattern('n')).toBe(true);
      expect(plugin.validatePattern('N')).toBe(false);
      expect(plugin.validatePattern('other')).toBe(false);
    });
  });

  describe('Action Behavior', () => {
    it('should do nothing when no previous search exists', () => {
      // No search pattern set
      context.setMode(VIM_MODE.NORMAL);
      const initialCursor = context.getCursor();
      
      plugin.execute(context);
      
      // Cursor should not move
      expect(context.getCursor().equals(initialCursor)).toBe(true);
    });

    it('should do nothing when lastSearchPattern is null', () => {
      state.lastSearchPattern = null;
      state.lastSearchDirection = 'forward';
      context.setMode(VIM_MODE.NORMAL);
      const initialCursor = context.getCursor();
      
      plugin.execute(context);
      
      expect(context.getCursor().equals(initialCursor)).toBe(true);
    });

    it('should do nothing when lastSearchDirection is null', () => {
      state.lastSearchPattern = 'pattern';
      state.lastSearchDirection = null;
      context.setMode(VIM_MODE.NORMAL);
      const initialCursor = context.getCursor();
      
      plugin.execute(context);
      
      expect(context.getCursor().equals(initialCursor)).toBe(true);
    });

    it('should navigate to next match when search exists and matches are available', () => {
      // Set up search state
      state.lastSearchPattern = 'test';
      state.lastSearchDirection = 'forward';
      state.searchMatches = [
        new CursorPosition(0, 0),
        new CursorPosition(0, 10),
        new CursorPosition(1, 5),
      ];
      state.currentMatchPosition = new CursorPosition(0, 0);
      
      context.setMode(VIM_MODE.NORMAL);
      
      plugin.execute(context);
      
      // Should move to next match (0, 10)
      expect(context.getCursor().equals(new CursorPosition(0, 10))).toBe(true);
      expect(state.currentMatchPosition?.equals(new CursorPosition(0, 10))).toBe(true);
    });

    it('should update currentMatchPosition when navigating to next match', () => {
      state.lastSearchPattern = 'pattern';
      state.lastSearchDirection = 'forward';
      state.searchMatches = [
        new CursorPosition(0, 0),
        new CursorPosition(0, 5),
      ];
      state.currentMatchPosition = new CursorPosition(0, 0);
      
      context.setMode(VIM_MODE.NORMAL);
      
      plugin.execute(context);
      
      expect(state.currentMatchPosition).not.toBeNull();
      expect(state.currentMatchPosition?.equals(new CursorPosition(0, 5))).toBe(true);
    });

    it('should do nothing when no more matches available (no wrap)', () => {
      state.lastSearchPattern = 'pattern';
      state.lastSearchDirection = 'forward';
      state.searchMatches = [
        new CursorPosition(0, 0),
        new CursorPosition(0, 5),
      ];
      state.currentMatchPosition = new CursorPosition(0, 5); // At last match
      
      context.setMode(VIM_MODE.NORMAL);
      const initialCursor = context.getCursor();
      
      plugin.execute(context);
      
      // Should not move (no wrap by default)
      expect(context.getCursor().equals(initialCursor)).toBe(true);
      expect(state.currentMatchPosition?.equals(new CursorPosition(0, 5))).toBe(true);
    });

    it('should do nothing when searchMatches is empty', () => {
      state.lastSearchPattern = 'pattern';
      state.lastSearchDirection = 'forward';
      state.searchMatches = [];
      state.currentMatchPosition = null;
      
      context.setMode(VIM_MODE.NORMAL);
      const initialCursor = context.getCursor();
      
      plugin.execute(context);
      
      expect(context.getCursor().equals(initialCursor)).toBe(true);
    });

    it('should work in NORMAL mode', () => {
      state.lastSearchPattern = 'test';
      state.lastSearchDirection = 'forward';
      state.searchMatches = [
        new CursorPosition(0, 0),
        new CursorPosition(0, 10),
      ];
      state.currentMatchPosition = new CursorPosition(0, 0);
      
      context.setMode(VIM_MODE.NORMAL);
      
      plugin.execute(context);
      
      expect(context.getCursor().equals(new CursorPosition(0, 10))).toBe(true);
    });

    it('should work in VISUAL mode', () => {
      state.lastSearchPattern = 'test';
      state.lastSearchDirection = 'forward';
      state.searchMatches = [
        new CursorPosition(0, 0),
        new CursorPosition(0, 10),
      ];
      state.currentMatchPosition = new CursorPosition(0, 0);
      
      context.setMode(VIM_MODE.VISUAL);
      
      plugin.execute(context);
      
      expect(context.getCursor().equals(new CursorPosition(0, 10))).toBe(true);
    });

    it('should use forward direction when lastSearchDirection is forward', () => {
      state.lastSearchPattern = 'test';
      state.lastSearchDirection = 'forward';
      state.searchMatches = [
        new CursorPosition(0, 0),
        new CursorPosition(0, 5),
        new CursorPosition(0, 10),
      ];
      state.currentMatchPosition = new CursorPosition(0, 5);
      
      context.setMode(VIM_MODE.NORMAL);
      
      plugin.execute(context);
      
      // Should go to next match in forward direction
      expect(context.getCursor().equals(new CursorPosition(0, 10))).toBe(true);
    });

    it('should use backward direction when lastSearchDirection is backward', () => {
      state.lastSearchPattern = 'test';
      state.lastSearchDirection = 'backward';
      state.searchMatches = [
        new CursorPosition(0, 0),
        new CursorPosition(0, 5),
        new CursorPosition(0, 10),
      ];
      state.currentMatchPosition = new CursorPosition(0, 5);
      
      context.setMode(VIM_MODE.NORMAL);
      
      plugin.execute(context);
      
      // Should go to previous match (next in backward direction)
      expect(context.getCursor().equals(new CursorPosition(0, 0))).toBe(true);
    });

    it('should handle navigation when cursor is not on a match', () => {
      state.lastSearchPattern = 'test';
      state.lastSearchDirection = 'forward';
      state.searchMatches = [
        new CursorPosition(0, 10),
        new CursorPosition(0, 20),
      ];
      state.currentMatchPosition = null;
      state.cursor = new CursorPosition(0, 0); // Cursor before first match
      
      context.setMode(VIM_MODE.NORMAL);
      
      plugin.execute(context);
      
      // Should go to first match after cursor
      expect(context.getCursor().equals(new CursorPosition(0, 10))).toBe(true);
    });

    it('should handle single match scenario', () => {
      state.lastSearchPattern = 'test';
      state.lastSearchDirection = 'forward';
      state.searchMatches = [new CursorPosition(0, 5)];
      state.currentMatchPosition = null;
      state.cursor = new CursorPosition(0, 0);
      
      context.setMode(VIM_MODE.NORMAL);
      
      plugin.execute(context);
      
      // Should go to the single match
      expect(context.getCursor().equals(new CursorPosition(0, 5))).toBe(true);
    });

    it('should not wrap when at last match with wrap disabled', () => {
      state.lastSearchPattern = 'test';
      state.lastSearchDirection = 'forward';
      state.searchMatches = [
        new CursorPosition(0, 0),
        new CursorPosition(0, 5),
      ];
      state.currentMatchPosition = new CursorPosition(0, 5); // At last match
      
      context.setMode(VIM_MODE.NORMAL);
      const initialCursor = context.getCursor();
      
      plugin.execute(context);
      
      // Should not wrap (wrap parameter is false)
      expect(context.getCursor().equals(initialCursor)).toBe(true);
    });
  });

  describe('Mode Restrictions', () => {
    it('should execute in NORMAL mode', () => {
      state.lastSearchPattern = 'test';
      state.lastSearchDirection = 'forward';
      state.searchMatches = [
        new CursorPosition(0, 0),
        new CursorPosition(0, 5),
      ];
      state.currentMatchPosition = new CursorPosition(0, 0);
      
      context.setMode(VIM_MODE.NORMAL);
      
      plugin.execute(context);
      
      expect(context.getCursor().equals(new CursorPosition(0, 5))).toBe(true);
    });

    it('should execute in VISUAL mode', () => {
      state.lastSearchPattern = 'test';
      state.lastSearchDirection = 'forward';
      state.searchMatches = [
        new CursorPosition(0, 0),
        new CursorPosition(0, 5),
      ];
      state.currentMatchPosition = new CursorPosition(0, 0);
      
      context.setMode(VIM_MODE.VISUAL);
      
      plugin.execute(context);
      
      expect(context.getCursor().equals(new CursorPosition(0, 5))).toBe(true);
    });

    it('should not execute in INSERT mode', () => {
      state.lastSearchPattern = 'test';
      state.lastSearchDirection = 'forward';
      state.searchMatches = [
        new CursorPosition(0, 0),
        new CursorPosition(0, 5),
      ];
      state.currentMatchPosition = new CursorPosition(0, 0);
      
      context.setMode(VIM_MODE.INSERT);
      const initialCursor = context.getCursor();
      
      plugin.execute(context);
      
      expect(context.getCursor().equals(initialCursor)).toBe(true);
    });

    it('should not execute in COMMAND mode', () => {
      state.lastSearchPattern = 'test';
      state.lastSearchDirection = 'forward';
      state.searchMatches = [
        new CursorPosition(0, 0),
        new CursorPosition(0, 5),
      ];
      state.currentMatchPosition = new CursorPosition(0, 0);
      
      context.setMode(VIM_MODE.COMMAND);
      const initialCursor = context.getCursor();
      
      plugin.execute(context);
      
      expect(context.getCursor().equals(initialCursor)).toBe(true);
    });

    it('should not execute in REPLACE mode', () => {
      state.lastSearchPattern = 'test';
      state.lastSearchDirection = 'forward';
      state.searchMatches = [
        new CursorPosition(0, 0),
        new CursorPosition(0, 5),
      ];
      state.currentMatchPosition = new CursorPosition(0, 0);
      
      context.setMode(VIM_MODE.REPLACE);
      const initialCursor = context.getCursor();
      
      plugin.execute(context);
      
      expect(context.getCursor().equals(initialCursor)).toBe(true);
    });

    it('should not execute in SELECT mode', () => {
      state.lastSearchPattern = 'test';
      state.lastSearchDirection = 'forward';
      state.searchMatches = [
        new CursorPosition(0, 0),
        new CursorPosition(0, 5),
      ];
      state.currentMatchPosition = new CursorPosition(0, 0);
      
      context.setMode(VIM_MODE.SELECT);
      const initialCursor = context.getCursor();
      
      plugin.execute(context);
      
      expect(context.getCursor().equals(initialCursor)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle navigation with matches on multiple lines', () => {
      state.lastSearchPattern = 'test';
      state.lastSearchDirection = 'forward';
      state.searchMatches = [
        new CursorPosition(0, 0),
        new CursorPosition(1, 5),
        new CursorPosition(2, 10),
      ];
      state.currentMatchPosition = new CursorPosition(0, 0);
      
      context.setMode(VIM_MODE.NORMAL);
      
      plugin.execute(context);
      
      expect(context.getCursor().equals(new CursorPosition(1, 5))).toBe(true);
    });

    it('should handle when currentMatchPosition is null but cursor is on a match', () => {
      state.lastSearchPattern = 'test';
      state.lastSearchDirection = 'forward';
      state.searchMatches = [
        new CursorPosition(0, 0),
        new CursorPosition(0, 5),
      ];
      state.currentMatchPosition = null;
      state.cursor = new CursorPosition(0, 0); // Cursor on first match
      
      context.setMode(VIM_MODE.NORMAL);
      
      plugin.execute(context);
      
      // Should find next match since cursor is on a match
      expect(context.getCursor().equals(new CursorPosition(0, 5))).toBe(true);
    });

    it('should handle consecutive executions', () => {
      state.lastSearchPattern = 'test';
      state.lastSearchDirection = 'forward';
      state.searchMatches = [
        new CursorPosition(0, 0),
        new CursorPosition(0, 5),
        new CursorPosition(0, 10),
      ];
      state.currentMatchPosition = new CursorPosition(0, 0);
      
      context.setMode(VIM_MODE.NORMAL);
      
      // First execution
      plugin.execute(context);
      expect(context.getCursor().equals(new CursorPosition(0, 5))).toBe(true);
      
      // Second execution
      plugin.execute(context);
      expect(context.getCursor().equals(new CursorPosition(0, 10))).toBe(true);
      
      // Third execution (no more matches)
      const cursorAfterSecond = context.getCursor();
      plugin.execute(context);
      expect(context.getCursor().equals(cursorAfterSecond)).toBe(true);
    });
  });
});
