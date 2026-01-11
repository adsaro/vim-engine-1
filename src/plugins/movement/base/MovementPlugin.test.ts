/**
 * MovementPlugin Base Class Unit Tests
 */
import { MovementPlugin, MovementConfig } from '../../plugins/movement';
import { ExecutionContext } from '../../plugin/ExecutionContext';
import { VimState } from '../../state/VimState';
import { TextBuffer } from '../../state/TextBuffer';
import { CursorPosition } from '../../state/CursorPosition';
import { VIM_MODE } from '../../state/VimMode';

// Testable subclass that exposes protected methods for testing
class TestableMovementPlugin extends MovementPlugin {
  readonly name = 'test-movement';
  readonly version = '1.0.0';
  readonly description = 'Test movement plugin';
  readonly patterns = ['test'];
  readonly modes = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  constructor(config?: MovementConfig) {
    super(
      'test-movement',
      'Test movement plugin',
      'test',
      [VIM_MODE.NORMAL, VIM_MODE.VISUAL],
      config
    );
  }

  protected calculateNewPosition(
    cursor: CursorPosition,
    buffer: TextBuffer,
    config: Required<MovementConfig>
  ): CursorPosition {
    const line = buffer.getLine(cursor.line);
    if (line === null) {
      return cursor.clone();
    }
    const newColumn = Math.min(line.length, cursor.column + config.step);
    return new CursorPosition(cursor.line, newColumn);
  }

  // Expose protected validateMove for testing
  public testValidateMove(position: CursorPosition, buffer: TextBuffer): boolean {
    return this.validateMove(position, buffer);
  }
}

describe('MovementPlugin', () => {
  describe('Constructor', () => {
    it('should create plugin with default configuration', () => {
      const plugin = new TestableMovementPlugin();
      expect(plugin.name).toBe('test-movement');
      expect(plugin.version).toBe('1.0.0');
      expect(plugin.description).toBe('Test movement plugin');
      expect(plugin.patterns).toEqual(['test']);
      expect(plugin.modes).toContain(VIM_MODE.NORMAL);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
    });

    it('should have default step of 1', () => {
      const plugin = new TestableMovementPlugin();
      expect(plugin.getConfig().step).toBe(1);
      expect(plugin.getConfig().allowWrap).toBe(false);
      expect(plugin.getConfig().scrollOnEdge).toBe(false);
      expect(plugin.getConfig().visualModeEnabled).toBe(true);
    });

    it('should create plugin with custom configuration', () => {
      const config: MovementConfig = {
        step: 5,
        allowWrap: true,
        scrollOnEdge: true,
        visualModeEnabled: false,
      };
      const plugin = new TestableMovementPlugin(config);
      const pluginConfig = plugin.getConfig();
      expect(pluginConfig.step).toBe(5);
      expect(pluginConfig.allowWrap).toBe(true);
      expect(pluginConfig.scrollOnEdge).toBe(true);
      expect(pluginConfig.visualModeEnabled).toBe(false);
    });

    it('should create plugin with partial custom configuration', () => {
      const config: MovementConfig = { step: 3 };
      const plugin = new TestableMovementPlugin(config);
      const pluginConfig = plugin.getConfig();
      expect(pluginConfig.step).toBe(3);
      expect(pluginConfig.allowWrap).toBe(false);
      expect(pluginConfig.scrollOnEdge).toBe(false);
      expect(pluginConfig.visualModeEnabled).toBe(true);
    });
  });

  describe('Configuration', () => {
    it('should return copy of configuration', () => {
      const plugin = new TestableMovementPlugin({ step: 2 });
      const config1 = plugin.getConfig();
      const config2 = plugin.getConfig();
      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
    });

    it('should update configuration at runtime', () => {
      const plugin = new TestableMovementPlugin({ step: 1 });
      expect(plugin.getConfig().step).toBe(1);

      plugin.updateConfig({ step: 10 });
      expect(plugin.getConfig().step).toBe(10);
    });

    it('should update multiple configuration values', () => {
      const plugin = new TestableMovementPlugin({ step: 1, allowWrap: false });
      plugin.updateConfig({ step: 5, allowWrap: true, scrollOnEdge: true });

      const config = plugin.getConfig();
      expect(config.step).toBe(5);
      expect(config.allowWrap).toBe(true);
      expect(config.scrollOnEdge).toBe(true);
    });

    it('should preserve unchanged configuration values', () => {
      const plugin = new TestableMovementPlugin({ step: 1, allowWrap: false });
      plugin.updateConfig({ step: 10 });

      const config = plugin.getConfig();
      expect(config.step).toBe(10);
      expect(config.allowWrap).toBe(false);
      expect(config.scrollOnEdge).toBe(false);
    });
  });

  describe('Pattern Validation', () => {
    it('should validate supported pattern', () => {
      const plugin = new TestableMovementPlugin();
      expect(plugin.validatePattern('test')).toBe(true);
    });

    it('should reject unsupported pattern', () => {
      const plugin = new TestableMovementPlugin();
      expect(plugin.validatePattern('other')).toBe(false);
    });

    it('should validate multiple patterns', () => {
      const plugin = new TestableMovementPlugin();
      expect(plugin.validatePattern('test')).toBe(true);
      expect(plugin.validatePattern('other')).toBe(false);
      expect(plugin.validatePattern('')).toBe(false);
    });
  });

  describe('Mode Support', () => {
    it('should execute in NORMAL mode', () => {
      const plugin = new TestableMovementPlugin({ step: 2 });
      const state = new VimState('hello');
      state.cursor = new CursorPosition(state.cursor.line, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(4);
    });

    it('should execute in VISUAL mode', () => {
      const plugin = new TestableMovementPlugin({ step: 2 });
      const state = new VimState('hello');
      state.cursor = new CursorPosition(state.cursor.line, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.VISUAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(4);
    });

    it('should not execute in INSERT mode', () => {
      const plugin = new TestableMovementPlugin({ step: 2 });
      const state = new VimState('hello');
      state.cursor = new CursorPosition(state.cursor.line, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.INSERT);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(2);
    });

    it('should not execute in COMMAND mode', () => {
      const plugin = new TestableMovementPlugin({ step: 2 });
      const state = new VimState('hello');
      state.cursor = new CursorPosition(state.cursor.line, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.COMMAND);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(2);
    });
  });

  describe('validateMove (via test wrapper)', () => {
    it('should reject move on empty buffer', () => {
      const plugin = new TestableMovementPlugin();
      const buffer = new TextBuffer();
      const position = new CursorPosition(0, 0);

      expect(plugin.testValidateMove(position, buffer)).toBe(false);
    });

    // Note: Negative line numbers are now clamped to 0 in CursorPosition constructor
    // So positions with negative coordinates become valid positions at (0, 0)
    it('should reject line beyond buffer', () => {
      const plugin = new TestableMovementPlugin();
      const buffer = new TextBuffer('line1');
      const position = new CursorPosition(5, 0);

      expect(plugin.testValidateMove(position, buffer)).toBe(false);
    });

    // Note: Negative column numbers are now clamped to 0 in CursorPosition constructor
    // So positions with negative coordinates become valid positions at (0, 0)
    it('should reject column beyond line length', () => {
      const plugin = new TestableMovementPlugin();
      const buffer = new TextBuffer('hello');
      const position = new CursorPosition(0, 10);

      expect(plugin.testValidateMove(position, buffer)).toBe(false);
    });

    it('should accept valid position at line start', () => {
      const plugin = new TestableMovementPlugin();
      const buffer = new TextBuffer('hello');
      const position = new CursorPosition(0, 0);

      expect(plugin.testValidateMove(position, buffer)).toBe(true);
    });

    it('should accept valid position at line end', () => {
      const plugin = new TestableMovementPlugin();
      const buffer = new TextBuffer('hello');
      const position = new CursorPosition(0, 5);

      expect(plugin.testValidateMove(position, buffer)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty buffer gracefully', () => {
      const plugin = new TestableMovementPlugin({ step: 1 });
      const state = new VimState();
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().line).toBe(0);
      expect(context.getCursor().column).toBe(0);
    });

    it('should handle single character line', () => {
      const plugin = new TestableMovementPlugin({ step: 1 });
      const state = new VimState('x');
      state.cursor = new CursorPosition(state.cursor.line, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(1);
    });

    it('should handle multi-line buffer', () => {
      const plugin = new TestableMovementPlugin({ step: 1 });
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(state.cursor.line, 2);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(3);
      expect(context.getCursor().line).toBe(0);
    });

    it('should handle single line buffer', () => {
      const plugin = new TestableMovementPlugin({ step: 1 });
      const state = new VimState('test');
      state.cursor = new CursorPosition(state.cursor.line, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(1);
    });
  });

  describe('Visual Mode Configuration', () => {
    it('should execute in VISUAL mode when enabled', () => {
      const plugin = new TestableMovementPlugin({ step: 2, visualModeEnabled: true });
      const state = new VimState('hello');
      state.cursor = new CursorPosition(state.cursor.line, 1);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.VISUAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(3);
    });

    // Note: visualModeEnabled config is stored but not enforced in current implementation
    // The plugin executes in VISUAL mode because it's in the modes list
    it('should execute in VISUAL mode regardless of visualModeEnabled setting', () => {
      const plugin = new TestableMovementPlugin({ step: 2, visualModeEnabled: false });
      const state = new VimState('hello');
      state.cursor = new CursorPosition(state.cursor.line, 1);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.VISUAL);

      plugin.execute(context);

      // Plugin executes because VISUAL is in the modes list, not because of visualModeEnabled
      expect(context.getCursor().column).toBe(3);
    });
  });

  describe('Multiple Step Movements', () => {
    it('should move multiple steps correctly', () => {
      const plugin = new TestableMovementPlugin({ step: 3 });
      const state = new VimState('hello world');
      state.cursor = new CursorPosition(state.cursor.line, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(3);
    });

    it('should clamp to line length with large step', () => {
      const plugin = new TestableMovementPlugin({ step: 100 });
      const state = new VimState('hi');
      state.cursor = new CursorPosition(state.cursor.line, 0);
      const context = new ExecutionContext(state);
      context.setMode(VIM_MODE.NORMAL);

      plugin.execute(context);

      expect(context.getCursor().column).toBe(2);
    });
  });
});
