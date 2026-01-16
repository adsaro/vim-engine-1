/**
 * SearchInputHandlerPlugin Unit Tests
 * Tests for the search input keystroke handler plugin
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SearchInputHandlerPlugin } from './SearchInputHandlerPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimState } from '../../../state/VimState';
import { VIM_MODE } from '../../../state/VimMode';
import { SearchInputManager } from '../utils/searchInputManager';

describe('SearchInputHandlerPlugin', () => {
  let plugin: SearchInputHandlerPlugin;
  let searchInputManager: SearchInputManager;
  let state: VimState;
  let context: ExecutionContext;

  beforeEach(() => {
    searchInputManager = new SearchInputManager();
    plugin = new SearchInputHandlerPlugin(searchInputManager);
    state = new VimState();
    context = new ExecutionContext(state);
  });

  describe('Metadata', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('movement-search-input-handler');
    });

    it('should have correct version', () => {
      expect(plugin.version).toBe('1.0.0');
    });

    it('should have correct description', () => {
      expect(plugin.description).toBe('Handle search input keystrokes');
    });

    it('should have correct pattern for any key', () => {
      expect(plugin.patterns).toEqual(['<any>']);
    });

    it('should only support SEARCH_INPUT mode', () => {
      expect(plugin.modes).toContain(VIM_MODE.SEARCH_INPUT);
      expect(plugin.modes).not.toContain(VIM_MODE.NORMAL);
      expect(plugin.modes).not.toContain(VIM_MODE.INSERT);
      expect(plugin.modes).not.toContain(VIM_MODE.VISUAL);
      expect(plugin.modes).not.toContain(VIM_MODE.COMMAND);
    });

    it('should validate pattern correctly', () => {
      expect(plugin.validatePattern('<any>')).toBe(true);
      expect(plugin.validatePattern('/')).toBe(false);
      expect(plugin.validatePattern('?')).toBe(false);
      expect(plugin.validatePattern('other')).toBe(false);
    });
  });

  describe('Initialization', () => {
    it('should accept SearchInputManager in constructor', () => {
      const manager = new SearchInputManager();
      const testPlugin = new SearchInputHandlerPlugin(manager);
      expect(testPlugin).toBeInstanceOf(SearchInputHandlerPlugin);
    });
  });

  describe('Mode Restrictions', () => {
    it('should execute in SEARCH_INPUT mode', () => {
      searchInputManager.start('forward');
      context.setMode(VIM_MODE.SEARCH_INPUT);

      plugin.execute(context);

      // Plugin should be able to execute in SEARCH_INPUT mode
      expect(plugin.canExecute(context)).toBe(true);
    });

    it('should not execute in NORMAL mode', () => {
      context.setMode(VIM_MODE.NORMAL);

      expect(plugin.canExecute(context)).toBe(false);
    });

    it('should not execute in INSERT mode', () => {
      context.setMode(VIM_MODE.INSERT);

      expect(plugin.canExecute(context)).toBe(false);
    });

    it('should not execute in VISUAL mode', () => {
      context.setMode(VIM_MODE.VISUAL);

      expect(plugin.canExecute(context)).toBe(false);
    });

    it('should not execute in COMMAND mode', () => {
      context.setMode(VIM_MODE.COMMAND);

      expect(plugin.canExecute(context)).toBe(false);
    });

    it('should not execute in REPLACE mode', () => {
      context.setMode(VIM_MODE.REPLACE);

      expect(plugin.canExecute(context)).toBe(false);
    });

    it('should not execute in SELECT mode', () => {
      context.setMode(VIM_MODE.SELECT);

      expect(plugin.canExecute(context)).toBe(false);
    });
  });

  describe('Basic Structure', () => {
    it('should have performAction method', () => {
      expect(typeof plugin['performAction']).toBe('function');
    });

    it('should extend AbstractVimPlugin', () => {
      expect(plugin).toHaveProperty('name');
      expect(plugin).toHaveProperty('version');
      expect(plugin).toHaveProperty('description');
      expect(plugin).toHaveProperty('patterns');
      expect(plugin).toHaveProperty('modes');
    });

    it('should have execute method', () => {
      expect(typeof plugin.execute).toBe('function');
    });

    it('should have canExecute method', () => {
      expect(typeof plugin.canExecute).toBe('function');
    });

    it('should have validatePattern method', () => {
      expect(typeof plugin.validatePattern).toBe('function');
    });

    it('should have initialize method', () => {
      expect(typeof plugin.initialize).toBe('function');
    });

    it('should have destroy method', () => {
      expect(typeof plugin.destroy).toBe('function');
    });
  });

  describe('SearchInputManager Integration', () => {
    it('should have access to SearchInputManager', () => {
      expect(plugin['searchInputManager']).toBe(searchInputManager);
    });

    it('should use the same SearchInputManager instance', () => {
      const manager = new SearchInputManager();
      const testPlugin = new SearchInputHandlerPlugin(manager);
      expect(testPlugin['searchInputManager']).toBe(manager);
    });
  });

  describe('Plugin Lifecycle', () => {
    it('should initialize without errors', () => {
      expect(() => plugin.initialize(context)).not.toThrow();
    });

    it('should destroy without errors', () => {
      expect(() => plugin.destroy()).not.toThrow();
    });

    it('should enable without errors', () => {
      expect(() => plugin.enable()).not.toThrow();
    });

    it('should disable without errors', () => {
      expect(() => plugin.disable()).not.toThrow();
    });

    it('should report enabled status correctly', () => {
      expect(plugin.isEnabled()).toBe(true);
      plugin.disable();
      expect(plugin.isEnabled()).toBe(false);
      plugin.enable();
      expect(plugin.isEnabled()).toBe(true);
    });
  });
});
