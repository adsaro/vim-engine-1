/**
 * SearchBackwardPlugin Unit Tests
 * Tests for the ? key plugin (initiate backward search)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SearchBackwardPlugin } from './SearchBackwardPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimState } from '../../../state/VimState';
import { VIM_MODE } from '../../../state/VimMode';
import { SearchInputManager } from '../utils/searchInputManager';

describe('SearchBackwardPlugin', () => {
  let plugin: SearchBackwardPlugin;
  let searchInputManager: SearchInputManager;
  let state: VimState;
  let context: ExecutionContext;

  beforeEach(() => {
    searchInputManager = new SearchInputManager();
    plugin = new SearchBackwardPlugin(searchInputManager);
    state = new VimState();
    context = new ExecutionContext(state);
  });

  describe('Metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('movement-search-backward');
    });

    it('should have correct version', () => {
      expect(plugin.version).toBe('1.0.0');
    });

    it('should have correct description', () => {
      expect(plugin.description).toBe('Initiate backward search (? key)');
    });

    it('should have correct pattern', () => {
      expect(plugin.patterns).toEqual(['?']);
    });

    it('should support NORMAL and VISUAL modes', () => {
      expect(plugin.modes).toContain(VIM_MODE.NORMAL);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
      expect(plugin.modes).not.toContain(VIM_MODE.INSERT);
      expect(plugin.modes).not.toContain(VIM_MODE.COMMAND);
    });

    it('should validate pattern correctly', () => {
      expect(plugin.validatePattern('?')).toBe(true);
      expect(plugin.validatePattern('/')).toBe(false);
      expect(plugin.validatePattern('other')).toBe(false);
    });
  });

  describe('Initialization', () => {
    it('should accept SearchInputManager in constructor', () => {
      const manager = new SearchInputManager();
      const testPlugin = new SearchBackwardPlugin(manager);
      expect(testPlugin).toBeInstanceOf(SearchBackwardPlugin);
    });
  });

  describe('Action Behavior', () => {
    it('should call start with backward direction when executed in NORMAL mode', () => {
      const startSpy = vi.spyOn(searchInputManager, 'start');
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(startSpy).toHaveBeenCalledWith('backward');
      expect(startSpy).toHaveBeenCalledTimes(1);
    });

    it('should call start with backward direction when executed in VISUAL mode', () => {
      const startSpy = vi.spyOn(searchInputManager, 'start');
      context.setMode(VIM_MODE.VISUAL);

      plugin.execute(context);

      expect(startSpy).toHaveBeenCalledWith('backward');
      expect(startSpy).toHaveBeenCalledTimes(1);
    });

    it('should transition mode to SEARCH_INPUT when executed in NORMAL mode', () => {
      context.setMode(VIM_MODE.NORMAL);
      expect(context.getMode()).toBe(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getMode()).toBe(VIM_MODE.SEARCH_INPUT);
    });

    it('should transition mode to SEARCH_INPUT when executed in VISUAL mode', () => {
      context.setMode(VIM_MODE.VISUAL);
      expect(context.getMode()).toBe(VIM_MODE.VISUAL);

      plugin.execute(context);

      expect(context.getMode()).toBe(VIM_MODE.SEARCH_INPUT);
    });

    it('should activate search input manager', () => {
      expect(searchInputManager.isActive()).toBe(false);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(searchInputManager.isActive()).toBe(true);
    });

    it('should set search direction to backward in search input manager', () => {
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      const state = searchInputManager.getState();
      expect(state.direction).toBe('backward');
    });

    it('should reset pattern in search input manager', () => {
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      const state = searchInputManager.getState();
      expect(state.pattern).toBe('');
    });

    it('should reset cursor position in search input manager', () => {
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      const state = searchInputManager.getState();
      expect(state.cursorPosition).toBe(0);
    });
  });

  describe('Mode Restrictions', () => {
    it('should execute in NORMAL mode', () => {
      const startSpy = vi.spyOn(searchInputManager, 'start');
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(startSpy).toHaveBeenCalledWith('backward');
      expect(context.getMode()).toBe(VIM_MODE.SEARCH_INPUT);
    });

    it('should execute in VISUAL mode', () => {
      const startSpy = vi.spyOn(searchInputManager, 'start');
      context.setMode(VIM_MODE.VISUAL);

      plugin.execute(context);

      expect(startSpy).toHaveBeenCalledWith('backward');
      expect(context.getMode()).toBe(VIM_MODE.SEARCH_INPUT);
    });

    it('should not execute in INSERT mode', () => {
      const startSpy = vi.spyOn(searchInputManager, 'start');
      context.setMode(VIM_MODE.INSERT);

      plugin.execute(context);

      expect(startSpy).not.toHaveBeenCalled();
      expect(context.getMode()).toBe(VIM_MODE.INSERT);
    });

    it('should not execute in COMMAND mode', () => {
      const startSpy = vi.spyOn(searchInputManager, 'start');
      context.setMode(VIM_MODE.COMMAND);

      plugin.execute(context);

      expect(startSpy).not.toHaveBeenCalled();
      expect(context.getMode()).toBe(VIM_MODE.COMMAND);
    });

    it('should not execute in REPLACE mode', () => {
      const startSpy = vi.spyOn(searchInputManager, 'start');
      context.setMode(VIM_MODE.REPLACE);

      plugin.execute(context);

      expect(startSpy).not.toHaveBeenCalled();
      expect(context.getMode()).toBe(VIM_MODE.REPLACE);
    });

    it('should not execute in SELECT mode', () => {
      const startSpy = vi.spyOn(searchInputManager, 'start');
      context.setMode(VIM_MODE.SELECT);

      plugin.execute(context);

      expect(startSpy).not.toHaveBeenCalled();
      expect(context.getMode()).toBe(VIM_MODE.SELECT);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple executions when mode is reset', () => {
      const startSpy = vi.spyOn(searchInputManager, 'start');
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);
      expect(startSpy).toHaveBeenCalledTimes(1);

      // Reset mode to NORMAL for second execution
      context.setMode(VIM_MODE.NORMAL);
      plugin.execute(context);
      expect(startSpy).toHaveBeenCalledTimes(2);
    });

    it('should not execute when already in SEARCH_INPUT mode', () => {
      const startSpy = vi.spyOn(searchInputManager, 'start');
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);
      expect(startSpy).toHaveBeenCalledTimes(1);

      // Try to execute again while in SEARCH_INPUT mode
      plugin.execute(context);
      // Should not be called again since SEARCH_INPUT is not a supported mode
      expect(startSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle execution with existing search state', () => {
      searchInputManager.start('forward');
      searchInputManager.addChar('test');
      expect(searchInputManager.getState().pattern).toBe('test');

      const startSpy = vi.spyOn(searchInputManager, 'start');
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(startSpy).toHaveBeenCalledWith('backward');
      expect(searchInputManager.getState().pattern).toBe('');
    });
  });
});
