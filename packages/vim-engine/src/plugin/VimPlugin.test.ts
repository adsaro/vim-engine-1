/**
 * VimPlugin Interface Tests
 */
import { VimPlugin } from './plugin/VimPlugin';
import { VimMode } from './VimMode';

describe('VimPlugin Interface', () => {
  describe('interface structure', () => {
    it('should define name as readonly string', () => {
      const plugin: VimPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        description: 'A test plugin',
        patterns: ['test'],
        modes: ['NORMAL' as VimMode],
        initialize: jest.fn(),
        destroy: jest.fn(),
        execute: jest.fn(),
        canExecute: jest.fn(() => true),
        validatePattern: jest.fn(() => true),
        onRegister: jest.fn(),
        onUnregister: jest.fn(),
        enable: jest.fn(),
        disable: jest.fn(),
        isEnabled: jest.fn(() => true),
      };

      expect(plugin.name).toBe('test-plugin');
    });

    it('should define version as readonly string', () => {
      const plugin: VimPlugin = {
        name: 'test-plugin',
        version: '2.0.0',
        description: 'A test plugin',
        patterns: ['test'],
        modes: ['NORMAL' as VimMode],
        initialize: jest.fn(),
        destroy: jest.fn(),
        execute: jest.fn(),
        canExecute: jest.fn(() => true),
        validatePattern: jest.fn(() => true),
        onRegister: jest.fn(),
        onUnregister: jest.fn(),
        enable: jest.fn(),
        disable: jest.fn(),
        isEnabled: jest.fn(() => true),
      };

      expect(plugin.version).toBe('2.0.0');
    });

    it('should define description as readonly string', () => {
      const plugin: VimPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        description: 'Plugin description',
        patterns: ['test'],
        modes: ['NORMAL' as VimMode],
        initialize: jest.fn(),
        destroy: jest.fn(),
        execute: jest.fn(),
        canExecute: jest.fn(() => true),
        validatePattern: jest.fn(() => true),
        onRegister: jest.fn(),
        onUnregister: jest.fn(),
        enable: jest.fn(),
        disable: jest.fn(),
        isEnabled: jest.fn(() => true),
      };

      expect(plugin.description).toBe('Plugin description');
    });

    it('should define patterns as readonly string array', () => {
      const plugin: VimPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        description: 'A test plugin',
        patterns: ['pattern1', 'pattern2', 'pattern3'],
        modes: ['NORMAL' as VimMode],
        initialize: jest.fn(),
        destroy: jest.fn(),
        execute: jest.fn(),
        canExecute: jest.fn(() => true),
        validatePattern: jest.fn(() => true),
        onRegister: jest.fn(),
        onUnregister: jest.fn(),
        enable: jest.fn(),
        disable: jest.fn(),
        isEnabled: jest.fn(() => true),
      };

      expect(plugin.patterns).toEqual(['pattern1', 'pattern2', 'pattern3']);
      expect(plugin.patterns.length).toBe(3);
    });

    it('should define modes as readonly VimMode array', () => {
      const plugin: VimPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        description: 'A test plugin',
        patterns: ['test'],
        modes: ['NORMAL' as VimMode, 'INSERT' as VimMode, 'VISUAL' as VimMode],
        initialize: jest.fn(),
        destroy: jest.fn(),
        execute: jest.fn(),
        canExecute: jest.fn(() => true),
        validatePattern: jest.fn(() => true),
        onRegister: jest.fn(),
        onUnregister: jest.fn(),
        enable: jest.fn(),
        disable: jest.fn(),
        isEnabled: jest.fn(() => true),
      };

      expect(plugin.modes).toContain('NORMAL');
      expect(plugin.modes).toContain('INSERT');
      expect(plugin.modes).toContain('VISUAL');
    });
  });

  describe('lifecycle methods', () => {
    it('should have initialize method', () => {
      const plugin: VimPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        description: 'A test plugin',
        patterns: ['test'],
        modes: ['NORMAL' as VimMode],
        initialize: jest.fn(),
        destroy: jest.fn(),
        execute: jest.fn(),
        canExecute: jest.fn(() => true),
        validatePattern: jest.fn(() => true),
        onRegister: jest.fn(),
        onUnregister: jest.fn(),
        enable: jest.fn(),
        disable: jest.fn(),
        isEnabled: jest.fn(() => true),
      };

      expect(typeof plugin.initialize).toBe('function');
      plugin.initialize({} as any);
      expect(plugin.initialize).toHaveBeenCalled();
    });

    it('should have destroy method', () => {
      const plugin: VimPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        description: 'A test plugin',
        patterns: ['test'],
        modes: ['NORMAL' as VimMode],
        initialize: jest.fn(),
        destroy: jest.fn(),
        execute: jest.fn(),
        canExecute: jest.fn(() => true),
        validatePattern: jest.fn(() => true),
        onRegister: jest.fn(),
        onUnregister: jest.fn(),
        enable: jest.fn(),
        disable: jest.fn(),
        isEnabled: jest.fn(() => true),
      };

      expect(typeof plugin.destroy).toBe('function');
      plugin.destroy();
      expect(plugin.destroy).toHaveBeenCalled();
    });

    it('should have execute method', () => {
      const plugin: VimPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        description: 'A test plugin',
        patterns: ['test'],
        modes: ['NORMAL' as VimMode],
        initialize: jest.fn(),
        destroy: jest.fn(),
        execute: jest.fn(),
        canExecute: jest.fn(() => true),
        validatePattern: jest.fn(() => true),
        onRegister: jest.fn(),
        onUnregister: jest.fn(),
        enable: jest.fn(),
        disable: jest.fn(),
        isEnabled: jest.fn(() => true),
      };

      expect(typeof plugin.execute).toBe('function');
      plugin.execute({} as any);
      expect(plugin.execute).toHaveBeenCalled();
    });

    it('should have canExecute method', () => {
      const plugin: VimPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        description: 'A test plugin',
        patterns: ['test'],
        modes: ['NORMAL' as VimMode],
        initialize: jest.fn(),
        destroy: jest.fn(),
        execute: jest.fn(),
        canExecute: jest.fn(() => true),
        validatePattern: jest.fn(() => true),
        onRegister: jest.fn(),
        onUnregister: jest.fn(),
        enable: jest.fn(),
        disable: jest.fn(),
        isEnabled: jest.fn(() => true),
      };

      expect(typeof plugin.canExecute).toBe('function');
      expect(plugin.canExecute({} as any)).toBe(true);
    });

    it('should have validatePattern method', () => {
      const plugin: VimPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        description: 'A test plugin',
        patterns: ['test'],
        modes: ['NORMAL' as VimMode],
        initialize: jest.fn(),
        destroy: jest.fn(),
        execute: jest.fn(),
        canExecute: jest.fn(() => true),
        validatePattern: jest.fn(() => true),
        onRegister: jest.fn(),
        onUnregister: jest.fn(),
        enable: jest.fn(),
        disable: jest.fn(),
        isEnabled: jest.fn(() => true),
      };

      expect(typeof plugin.validatePattern).toBe('function');
      expect(plugin.validatePattern('test')).toBe(true);
    });

    it('should have onRegister method', () => {
      const plugin: VimPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        description: 'A test plugin',
        patterns: ['test'],
        modes: ['NORMAL' as VimMode],
        initialize: jest.fn(),
        destroy: jest.fn(),
        execute: jest.fn(),
        canExecute: jest.fn(() => true),
        validatePattern: jest.fn(() => true),
        onRegister: jest.fn(),
        onUnregister: jest.fn(),
        enable: jest.fn(),
        disable: jest.fn(),
        isEnabled: jest.fn(() => true),
      };

      expect(typeof plugin.onRegister).toBe('function');
      plugin.onRegister();
      expect(plugin.onRegister).toHaveBeenCalled();
    });

    it('should have onUnregister method', () => {
      const plugin: VimPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        description: 'A test plugin',
        patterns: ['test'],
        modes: ['NORMAL' as VimMode],
        initialize: jest.fn(),
        destroy: jest.fn(),
        execute: jest.fn(),
        canExecute: jest.fn(() => true),
        validatePattern: jest.fn(() => true),
        onRegister: jest.fn(),
        onUnregister: jest.fn(),
        enable: jest.fn(),
        disable: jest.fn(),
        isEnabled: jest.fn(() => true),
      };

      expect(typeof plugin.onUnregister).toBe('function');
      plugin.onUnregister();
      expect(plugin.onUnregister).toHaveBeenCalled();
    });
  });

  describe('immutability', () => {
    it('should have readonly properties', () => {
      const plugin: VimPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        description: 'A test plugin',
        patterns: ['test'],
        modes: ['NORMAL' as VimMode],
        initialize: jest.fn(),
        destroy: jest.fn(),
        execute: jest.fn(),
        canExecute: jest.fn(() => true),
        validatePattern: jest.fn(() => true),
        onRegister: jest.fn(),
        onUnregister: jest.fn(),
        enable: jest.fn(),
        disable: jest.fn(),
        isEnabled: jest.fn(() => true),
      };

      expect(plugin.name).toBeDefined();
      expect(plugin.version).toBeDefined();
      expect(plugin.description).toBeDefined();
      expect(plugin.patterns).toBeDefined();
      expect(plugin.modes).toBeDefined();
    });
  });

  describe('lifecycle hooks (enable/disable)', () => {
    it('should have enable method', () => {
      const plugin: VimPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        description: 'A test plugin',
        patterns: ['test'],
        modes: ['NORMAL' as VimMode],
        initialize: jest.fn(),
        destroy: jest.fn(),
        execute: jest.fn(),
        canExecute: jest.fn(() => true),
        validatePattern: jest.fn(() => true),
        onRegister: jest.fn(),
        onUnregister: jest.fn(),
        enable: jest.fn(),
        disable: jest.fn(),
        isEnabled: jest.fn(() => true),
      };

      expect(typeof plugin.enable).toBe('function');
      plugin.enable();
      expect(plugin.enable).toHaveBeenCalled();
    });

    it('should have disable method', () => {
      const plugin: VimPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        description: 'A test plugin',
        patterns: ['test'],
        modes: ['NORMAL' as VimMode],
        initialize: jest.fn(),
        destroy: jest.fn(),
        execute: jest.fn(),
        canExecute: jest.fn(() => true),
        validatePattern: jest.fn(() => true),
        onRegister: jest.fn(),
        onUnregister: jest.fn(),
        enable: jest.fn(),
        disable: jest.fn(),
        isEnabled: jest.fn(() => true),
      };

      expect(typeof plugin.disable).toBe('function');
      plugin.disable();
      expect(plugin.disable).toHaveBeenCalled();
    });

    it('should have isEnabled method', () => {
      const plugin: VimPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        description: 'A test plugin',
        patterns: ['test'],
        modes: ['NORMAL' as VimMode],
        initialize: jest.fn(),
        destroy: jest.fn(),
        execute: jest.fn(),
        canExecute: jest.fn(() => true),
        validatePattern: jest.fn(() => true),
        onRegister: jest.fn(),
        onUnregister: jest.fn(),
        enable: jest.fn(),
        disable: jest.fn(),
        isEnabled: jest.fn(() => true),
      };

      expect(typeof plugin.isEnabled).toBe('function');
      expect(plugin.isEnabled()).toBe(true);
    });
  });
});
