/**
 * AbstractVimPlugin Tests
 */
import { AbstractVimPlugin, ExecutionContext } from '../plugin/index';
import { VimMode } from './VimMode';

describe('AbstractVimPlugin', () => {
  // Concrete implementation for testing
  class TestPlugin extends AbstractVimPlugin {
    public initializeCalled = false;
    public destroyCalled = false;
    public executeCalled = false;
    public lastContext: ExecutionContext | null = null;
    public onEnableCalled = false;
    public onDisableCalled = false;

    constructor(name: string, description: string, patterns: string[], modes: VimMode[]) {
      super(name, description, patterns, modes);
    }

    protected onInitialize(): void {
      this.initializeCalled = true;
    }

    protected onDestroy(): void {
      this.destroyCalled = true;
    }

    protected onEnable(): void {
      this.onEnableCalled = true;
    }

    protected onDisable(): void {
      this.onDisableCalled = true;
    }

    protected performAction(context: ExecutionContext): void {
      this.executeCalled = true;
      this.lastContext = context;
    }

    protected isValidContext(context: ExecutionContext): boolean {
      return context.getState() !== null;
    }

    protected isInSupportedMode(context: ExecutionContext): boolean {
      return this.modes.includes(context.getMode());
    }
  }

  describe('constructor', () => {
    it('should create plugin with all required properties', () => {
      const plugin = new TestPlugin(
        'test-plugin',
        'A test plugin',
        ['test', 'tp'],
        ['NORMAL' as VimMode]
      );

      expect(plugin.name).toBe('test-plugin');
      expect(plugin.version).toBe('1.0.0');
      expect(plugin.description).toBe('A test plugin');
      expect(plugin.patterns).toEqual(['test', 'tp']);
      expect(plugin.modes).toEqual(['NORMAL']);
    });

    it('should use default version if not provided', () => {
      const plugin = new TestPlugin(
        'test-plugin',
        'A test plugin',
        ['test'],
        ['NORMAL' as VimMode]
      );

      expect(plugin.version).toBe('1.0.0');
    });

    it('should support multiple modes', () => {
      const plugin = new TestPlugin(
        'test-plugin',
        'A test plugin',
        ['test'],
        ['NORMAL' as VimMode, 'INSERT' as VimMode, 'VISUAL' as VimMode]
      );

      expect(plugin.modes).toHaveLength(3);
      expect(plugin.modes).toContain('NORMAL');
      expect(plugin.modes).toContain('INSERT');
      expect(plugin.modes).toContain('VISUAL');
    });
  });

  describe('initialize', () => {
    it('should call onInitialize hook', () => {
      const plugin = new TestPlugin(
        'test-plugin',
        'A test plugin',
        ['test'],
        ['NORMAL' as VimMode]
      );
      const context = new ExecutionContext();

      plugin.initialize(context);

      expect(plugin.initializeCalled).toBe(true);
    });

    it('should store context', () => {
      const plugin = new TestPlugin(
        'test-plugin',
        'A test plugin',
        ['test'],
        ['NORMAL' as VimMode]
      );
      const context = new ExecutionContext();

      plugin.initialize(context);

      expect(plugin.lastContext).toBe(context);
    });

    it('should call execute when in supported mode', () => {
      const plugin = new TestPlugin(
        'test-plugin',
        'A test plugin',
        ['test'],
        ['NORMAL' as VimMode]
      );
      const context = new ExecutionContext();

      plugin.initialize(context);

      expect(plugin.executeCalled).toBe(true);
    });
  });

  describe('destroy', () => {
    it('should call onDestroy hook', () => {
      const plugin = new TestPlugin(
        'test-plugin',
        'A test plugin',
        ['test'],
        ['NORMAL' as VimMode]
      );

      plugin.destroy();

      expect(plugin.destroyCalled).toBe(true);
    });

    it('should work even if not initialized', () => {
      const plugin = new TestPlugin(
        'test-plugin',
        'A test plugin',
        ['test'],
        ['NORMAL' as VimMode]
      );

      expect(() => {
        plugin.destroy();
      }).not.toThrow();
    });
  });

  describe('execute', () => {
    it('should call performAction when in supported mode', () => {
      const plugin = new TestPlugin(
        'test-plugin',
        'A test plugin',
        ['test'],
        ['NORMAL' as VimMode]
      );
      const context = new ExecutionContext();

      plugin.execute(context);

      expect(plugin.executeCalled).toBe(true);
      expect(plugin.lastContext).toBe(context);
    });

    it('should not call performAction when not in supported mode', () => {
      const plugin = new TestPlugin(
        'test-plugin',
        'A test plugin',
        ['test'],
        ['NORMAL' as VimMode]
      );
      const context = new ExecutionContext();
      context.setMode('INSERT');

      plugin.execute(context);

      expect(plugin.executeCalled).toBe(false);
    });
  });

  describe('canExecute', () => {
    it('should return true when in supported mode', () => {
      const plugin = new TestPlugin(
        'test-plugin',
        'A test plugin',
        ['test'],
        ['NORMAL' as VimMode]
      );
      const context = new ExecutionContext();

      expect(plugin.canExecute(context)).toBe(true);
    });

    it('should return false when not in supported mode', () => {
      const plugin = new TestPlugin(
        'test-plugin',
        'A test plugin',
        ['test'],
        ['NORMAL' as VimMode]
      );
      const context = new ExecutionContext();
      context.setMode('INSERT');

      expect(plugin.canExecute(context)).toBe(false);
    });
  });

  describe('validatePattern', () => {
    it('should return true for valid pattern', () => {
      const plugin = new TestPlugin(
        'test-plugin',
        'A test plugin',
        ['test', 'tp'],
        ['NORMAL' as VimMode]
      );

      expect(plugin.validatePattern('test')).toBe(true);
      expect(plugin.validatePattern('tp')).toBe(true);
    });

    it('should return false for invalid pattern', () => {
      const plugin = new TestPlugin(
        'test-plugin',
        'A test plugin',
        ['test', 'tp'],
        ['NORMAL' as VimMode]
      );

      expect(plugin.validatePattern('invalid')).toBe(false);
    });
  });

  describe('onRegister', () => {
    it('should be callable', () => {
      const plugin = new TestPlugin(
        'test-plugin',
        'A test plugin',
        ['test'],
        ['NORMAL' as VimMode]
      );

      expect(() => {
        plugin.onRegister();
      }).not.toThrow();
    });
  });

  describe('onUnregister', () => {
    it('should be callable', () => {
      const plugin = new TestPlugin(
        'test-plugin',
        'A test plugin',
        ['test'],
        ['NORMAL' as VimMode]
      );

      expect(() => {
        plugin.onUnregister();
      }).not.toThrow();
    });
  });

  describe('enable/disable lifecycle', () => {
    describe('enable', () => {
      it('should set enabled state to true', () => {
        const plugin = new TestPlugin(
          'test-plugin',
          'A test plugin',
          ['test'],
          ['NORMAL' as VimMode]
        );

        expect(plugin.isEnabled()).toBe(true);
        plugin.disable();
        expect(plugin.isEnabled()).toBe(false);
        plugin.enable();
        expect(plugin.isEnabled()).toBe(true);
      });

      it('should call onEnable hook', () => {
        const plugin = new TestPlugin(
          'test-plugin',
          'A test plugin',
          ['test'],
          ['NORMAL' as VimMode]
        );

        plugin.enable();
        expect(plugin.onEnableCalled).toBe(true);
      });

      it('should be enabled by default', () => {
        const plugin = new TestPlugin(
          'test-plugin',
          'A test plugin',
          ['test'],
          ['NORMAL' as VimMode]
        );

        expect(plugin.isEnabled()).toBe(true);
      });
    });

    describe('disable', () => {
      it('should set enabled state to false', () => {
        const plugin = new TestPlugin(
          'test-plugin',
          'A test plugin',
          ['test'],
          ['NORMAL' as VimMode]
        );

        expect(plugin.isEnabled()).toBe(true);
        plugin.disable();
        expect(plugin.isEnabled()).toBe(false);
      });

      it('should call onDisable hook', () => {
        const plugin = new TestPlugin(
          'test-plugin',
          'A test plugin',
          ['test'],
          ['NORMAL' as VimMode]
        );

        plugin.disable();
        expect(plugin.onDisableCalled).toBe(true);
      });
    });

    describe('isEnabled', () => {
      it('should return true when enabled', () => {
        const plugin = new TestPlugin(
          'test-plugin',
          'A test plugin',
          ['test'],
          ['NORMAL' as VimMode]
        );

        expect(plugin.isEnabled()).toBe(true);
      });

      it('should return false when disabled', () => {
        const plugin = new TestPlugin(
          'test-plugin',
          'A test plugin',
          ['test'],
          ['NORMAL' as VimMode]
        );

        plugin.disable();
        expect(plugin.isEnabled()).toBe(false);
      });
    });

    describe('canExecute with enabled state', () => {
      it('should return true when enabled and in supported mode', () => {
        const plugin = new TestPlugin(
          'test-plugin',
          'A test plugin',
          ['test'],
          ['NORMAL' as VimMode]
        );
        const context = new ExecutionContext();

        expect(plugin.canExecute(context)).toBe(true);
      });

      it('should return false when disabled even in supported mode', () => {
        const plugin = new TestPlugin(
          'test-plugin',
          'A test plugin',
          ['test'],
          ['NORMAL' as VimMode]
        );
        const context = new ExecutionContext();

        plugin.disable();
        expect(plugin.canExecute(context)).toBe(false);
      });

      it('should return false when enabled but not in supported mode', () => {
        const plugin = new TestPlugin(
          'test-plugin',
          'A test plugin',
          ['test'],
          ['NORMAL' as VimMode]
        );
        const context = new ExecutionContext();
        context.setMode('INSERT');

        expect(plugin.canExecute(context)).toBe(false);
      });

      it('should return false when disabled and not in supported mode', () => {
        const plugin = new TestPlugin(
          'test-plugin',
          'A test plugin',
          ['test'],
          ['NORMAL' as VimMode]
        );
        const context = new ExecutionContext();
        context.setMode('INSERT');

        plugin.disable();
        expect(plugin.canExecute(context)).toBe(false);
      });
    });
  });
});
