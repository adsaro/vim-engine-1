/**
 * DocumentNavigationPlugin Unit Tests
 * Tests for the base class for document navigation plugins
 */
import { DocumentNavigationPlugin } from './DocumentNavigationPlugin';
import { MovementConfig } from './MovementPlugin';
import { CursorPosition } from '../../../state/CursorPosition';
import { TextBuffer } from '../../../state/TextBuffer';
import { VIM_MODE } from '../../../state/VimMode';

/**
 * Test implementation of DocumentNavigationPlugin for testing abstract class behavior
 */
class TestDocumentNavigationPlugin extends DocumentNavigationPlugin {
  constructor(
    private targetLineOverride: number = 0,
    name: string = 'test-doc-nav',
    description: string = 'Test document navigation',
    pattern: string = 'x',
    modes: VIM_MODE[] = [VIM_MODE.NORMAL]
  ) {
    super(name, description, pattern, modes);
  }

  protected getTargetLine(
    cursor: CursorPosition,
    buffer: TextBuffer,
    config: Required<MovementConfig>
  ): number {
    return this.targetLineOverride;
  }

  // Expose protected methods for testing
  public testClampLine(line: number, buffer: TextBuffer): number {
    return this.clampLine(line, buffer);
  }

  public testCalculateNewPosition(
    cursor: CursorPosition,
    buffer: TextBuffer,
    config: Required<MovementConfig>
  ): CursorPosition {
    return this.calculateNewPosition(cursor, buffer, config);
  }
}

describe('DocumentNavigationPlugin', () => {
  describe('Abstract Class Behavior', () => {
    it('should be instantiable through subclass', () => {
      const plugin = new TestDocumentNavigationPlugin();
      expect(plugin).toBeInstanceOf(DocumentNavigationPlugin);
      expect(plugin.name).toBe('test-doc-nav');
      expect(plugin.patterns).toEqual(['x']);
      expect(plugin.modes).toContain(VIM_MODE.NORMAL);
    });

    it('should require getTargetLine implementation', () => {
      const plugin = new TestDocumentNavigationPlugin(5);
      const buffer = new TextBuffer(['line1', 'line2', 'line3']);
      const cursor = new CursorPosition(0, 3, 3);
      const config: Required<MovementConfig> = {
        step: 1,
        allowWrap: false,
        scrollOnEdge: false,
        visualModeEnabled: true
      };

      const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

      expect(newPosition.line).toBe(2); // Clamped to last line (index 2)
      expect(newPosition.column).toBe(3);
      expect(newPosition.desiredColumn).toBe(3);
    });
  });

  describe('clampLine', () => {
    describe('Positive Line Numbers', () => {
      it('should clamp positive line numbers within buffer range', () => {
        const plugin = new TestDocumentNavigationPlugin();
        const buffer = new TextBuffer(['line1', 'line2', 'line3']);

        expect(plugin.testClampLine(0, buffer)).toBe(0);
        expect(plugin.testClampLine(1, buffer)).toBe(1);
        expect(plugin.testClampLine(2, buffer)).toBe(2);
      });

      it('should clamp line numbers that exceed buffer size to last line', () => {
        const plugin = new TestDocumentNavigationPlugin();
        const buffer = new TextBuffer(['line1', 'line2', 'line3']);

        expect(plugin.testClampLine(3, buffer)).toBe(2);
        expect(plugin.testClampLine(5, buffer)).toBe(2);
        expect(plugin.testClampLine(100, buffer)).toBe(2);
      });

      it('should handle line number exactly at buffer size', () => {
        const plugin = new TestDocumentNavigationPlugin();
        const buffer = new TextBuffer(['line1', 'line2', 'line3']);

        expect(plugin.testClampLine(3, buffer)).toBe(2);
      });
    });

    describe('Negative Line Numbers', () => {
      it('should clamp negative line numbers to 0', () => {
        const plugin = new TestDocumentNavigationPlugin();
        const buffer = new TextBuffer(['line1', 'line2', 'line3']);

        expect(plugin.testClampLine(-1, buffer)).toBe(0);
        expect(plugin.testClampLine(-5, buffer)).toBe(0);
        expect(plugin.testClampLine(-100, buffer)).toBe(0);
      });

      it('should clamp zero to 0', () => {
        const plugin = new TestDocumentNavigationPlugin();
        const buffer = new TextBuffer(['line1', 'line2', 'line3']);

        expect(plugin.testClampLine(0, buffer)).toBe(0);
      });
    });

    describe('Empty Buffer', () => {
      it('should return 0 for empty buffer', () => {
        const plugin = new TestDocumentNavigationPlugin();
        const buffer = new TextBuffer([]);

        expect(plugin.testClampLine(0, buffer)).toBe(0);
        expect(plugin.testClampLine(5, buffer)).toBe(0);
        expect(plugin.testClampLine(-5, buffer)).toBe(0);
      });
    });

    describe('Single Line Buffer', () => {
      it('should handle single line buffer correctly', () => {
        const plugin = new TestDocumentNavigationPlugin();
        const buffer = new TextBuffer(['single line']);

        expect(plugin.testClampLine(0, buffer)).toBe(0);
        expect(plugin.testClampLine(1, buffer)).toBe(0);
        expect(plugin.testClampLine(-1, buffer)).toBe(0);
      });
    });

    describe('Boundary Cases', () => {
      it('should handle line number at exact buffer boundary', () => {
        const plugin = new TestDocumentNavigationPlugin();
        const buffer = new TextBuffer(['line1', 'line2', 'line3']);

        expect(plugin.testClampLine(2, buffer)).toBe(2);
      });

      it('should handle very large positive numbers', () => {
        const plugin = new TestDocumentNavigationPlugin();
        const buffer = new TextBuffer(['line1', 'line2', 'line3']);

        expect(plugin.testClampLine(Number.MAX_SAFE_INTEGER, buffer)).toBe(2);
      });

      it('should handle very large negative numbers', () => {
        const plugin = new TestDocumentNavigationPlugin();
        const buffer = new TextBuffer(['line1', 'line2', 'line3']);

        expect(plugin.testClampLine(Number.MIN_SAFE_INTEGER, buffer)).toBe(0);
      });
    });
  });

  describe('calculateNewPosition', () => {
    describe('Empty Buffer Handling', () => {
      it('should return cursor.clone() for empty buffer', () => {
        const plugin = new TestDocumentNavigationPlugin(5);
        const buffer = new TextBuffer([]);
        const cursor = new CursorPosition(0, 3, 3);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(0);
        expect(newPosition.column).toBe(3);
        expect(newPosition.desiredColumn).toBe(3);
        expect(newPosition).not.toBe(cursor); // Should be a clone, not the same object
      });

      it('should preserve all cursor properties in empty buffer case', () => {
        const plugin = new TestDocumentNavigationPlugin(10);
        const buffer = new TextBuffer([]);
        const cursor = new CursorPosition(5, 10, 10);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(5);
        expect(newPosition.column).toBe(10);
        expect(newPosition.desiredColumn).toBe(10);
      });
    });

    describe('Target Line Calculation', () => {
      it('should use getTargetLine() to get target line', () => {
        const plugin = new TestDocumentNavigationPlugin(1);
        const buffer = new TextBuffer(['line1', 'line2', 'line3']);
        const cursor = new CursorPosition(0, 3, 3);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(1);
      });

      it('should clamp target line to valid buffer range', () => {
        const plugin = new TestDocumentNavigationPlugin(100);
        const buffer = new TextBuffer(['line1', 'line2', 'line3']);
        const cursor = new CursorPosition(0, 3, 3);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(2); // Clamped to last line
      });

      it('should clamp negative target line to 0', () => {
        const plugin = new TestDocumentNavigationPlugin(-10);
        const buffer = new TextBuffer(['line1', 'line2', 'line3']);
        const cursor = new CursorPosition(2, 3, 3);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(0);
      });
    });

    describe('desiredColumn Preservation', () => {
      it('should preserve desiredColumn across line changes', () => {
        const plugin = new TestDocumentNavigationPlugin(1);
        const buffer = new TextBuffer(['line1', 'line2', 'line3']);
        const cursor = new CursorPosition(0, 3, 10);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(1);
        expect(newPosition.desiredColumn).toBe(10);
      });

      it('should preserve desiredColumn when moving to longer line', () => {
        const plugin = new TestDocumentNavigationPlugin(1);
        const buffer = new TextBuffer(['short', 'this is a much longer line', 'line3']);
        const cursor = new CursorPosition(0, 3, 3);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(1);
        expect(newPosition.column).toBe(3);
        expect(newPosition.desiredColumn).toBe(3);
      });

      it('should preserve desiredColumn when moving to shorter line', () => {
        const plugin = new TestDocumentNavigationPlugin(1);
        const buffer = new TextBuffer(['this is a very long line with many characters', 'short', 'line3']);
        const cursor = new CursorPosition(0, 20, 20);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(1);
        expect(newPosition.column).toBe(5); // Clamped to 'short'.length
        expect(newPosition.desiredColumn).toBe(20); // Preserved
      });

      it('should preserve desiredColumn when column equals desiredColumn', () => {
        const plugin = new TestDocumentNavigationPlugin(1);
        const buffer = new TextBuffer(['line1', 'line2', 'line3']);
        const cursor = new CursorPosition(0, 5, 5);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(1);
        expect(newPosition.column).toBe(5);
        expect(newPosition.desiredColumn).toBe(5);
      });
    });

    describe('Column Clamping', () => {
      it('should clamp column to target line length when moving to shorter line', () => {
        const plugin = new TestDocumentNavigationPlugin(1);
        const buffer = new TextBuffer(['this is a very long line', 'short', 'line3']);
        const cursor = new CursorPosition(0, 20, 20);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(1);
        expect(newPosition.column).toBe(5); // 'short'.length
      });

      it('should preserve column when moving to longer line (up to desiredColumn)', () => {
        const plugin = new TestDocumentNavigationPlugin(1);
        const buffer = new TextBuffer(['short', 'this is a much longer line', 'line3']);
        const cursor = new CursorPosition(0, 3, 3);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(1);
        expect(newPosition.column).toBe(3);
      });

      it('should clamp column to 0 when moving to empty line', () => {
        const plugin = new TestDocumentNavigationPlugin(1);
        const buffer = new TextBuffer(['this is a long line', '', 'line3']);
        const cursor = new CursorPosition(0, 15, 15);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(1);
        expect(newPosition.column).toBe(0);
        expect(newPosition.desiredColumn).toBe(15);
      });

      it('should handle column at exact line length', () => {
        const plugin = new TestDocumentNavigationPlugin(0);
        const buffer = new TextBuffer(['hello']);
        const cursor = new CursorPosition(0, 5, 5);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(0);
        expect(newPosition.column).toBe(5);
      });

      it('should clamp column when desiredColumn exceeds line length', () => {
        const plugin = new TestDocumentNavigationPlugin(0);
        const buffer = new TextBuffer(['short']);
        const cursor = new CursorPosition(0, 2, 100);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(0);
        expect(newPosition.column).toBe(5); // 'short'.length
        expect(newPosition.desiredColumn).toBe(100);
      });
    });

    describe('CursorPosition Object Properties', () => {
      it('should return correct CursorPosition object with all properties', () => {
        const plugin = new TestDocumentNavigationPlugin(1);
        const buffer = new TextBuffer(['line1', 'line2', 'line3']);
        const cursor = new CursorPosition(0, 3, 3);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition).toBeInstanceOf(CursorPosition);
        expect(newPosition.line).toBe(1);
        expect(newPosition.column).toBe(3);
        expect(newPosition.desiredColumn).toBe(3);
      });

      it('should return a new CursorPosition instance (not modify original)', () => {
        const plugin = new TestDocumentNavigationPlugin(1);
        const buffer = new TextBuffer(['line1', 'line2', 'line3']);
        const cursor = new CursorPosition(0, 3, 3);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const originalLine = cursor.line;
        const originalColumn = cursor.column;
        const originalDesiredColumn = cursor.desiredColumn;

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(cursor.line).toBe(originalLine);
        expect(cursor.column).toBe(originalColumn);
        expect(cursor.desiredColumn).toBe(originalDesiredColumn);
        expect(newPosition).not.toBe(cursor);
      });
    });

    describe('Edge Cases', () => {
      it('should handle single line buffer', () => {
        const plugin = new TestDocumentNavigationPlugin(0);
        const buffer = new TextBuffer(['single line']);
        const cursor = new CursorPosition(0, 5, 5);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(0);
        expect(newPosition.column).toBe(5);
        expect(newPosition.desiredColumn).toBe(5);
      });

      it('should handle moving from long line to short line (column clamping)', () => {
        const plugin = new TestDocumentNavigationPlugin(1);
        const buffer = new TextBuffer([
          'this is a very long line with many characters',
          'short',
          'line3'
        ]);
        const cursor = new CursorPosition(0, 30, 30);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(1);
        expect(newPosition.column).toBe(5); // Clamped to 'short'.length
        expect(newPosition.desiredColumn).toBe(30);
      });

      it('should handle moving from short line to long line (column restoration)', () => {
        const plugin = new TestDocumentNavigationPlugin(1);
        const buffer = new TextBuffer([
          'short',
          'this is a very long line with many characters',
          'line3'
        ]);
        const cursor = new CursorPosition(0, 3, 3);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(1);
        expect(newPosition.column).toBe(3);
        expect(newPosition.desiredColumn).toBe(3);
      });

      it('should handle moving to line with tabs', () => {
        const plugin = new TestDocumentNavigationPlugin(1);
        const buffer = new TextBuffer(['line1', '\t\thello', 'line3']);
        const cursor = new CursorPosition(0, 3, 3);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(1);
        expect(newPosition.column).toBe(3);
        expect(newPosition.desiredColumn).toBe(3);
      });

      it('should handle moving to line with mixed whitespace', () => {
        const plugin = new TestDocumentNavigationPlugin(1);
        const buffer = new TextBuffer(['line1', '  \t  hello  \t  ', 'line3']);
        const cursor = new CursorPosition(0, 3, 3);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(1);
        expect(newPosition.column).toBe(3);
        expect(newPosition.desiredColumn).toBe(3);
      });

      it('should handle moving from empty line to non-empty line', () => {
        const plugin = new TestDocumentNavigationPlugin(1);
        const buffer = new TextBuffer(['', 'hello world', 'line3']);
        const cursor = new CursorPosition(0, 0, 10);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(1);
        expect(newPosition.column).toBe(10); // Clamped to 'hello world'.length
        expect(newPosition.desiredColumn).toBe(10);
      });

      it('should handle moving from non-empty line to empty line', () => {
        const plugin = new TestDocumentNavigationPlugin(1);
        const buffer = new TextBuffer(['hello world', '', 'line3']);
        const cursor = new CursorPosition(0, 5, 5);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(1);
        expect(newPosition.column).toBe(0);
        expect(newPosition.desiredColumn).toBe(5);
      });

      it('should handle moving to same line', () => {
        const plugin = new TestDocumentNavigationPlugin(0);
        const buffer = new TextBuffer(['line1', 'line2', 'line3']);
        const cursor = new CursorPosition(0, 3, 3);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(0);
        expect(newPosition.column).toBe(3);
        expect(newPosition.desiredColumn).toBe(3);
      });

      it('should handle cursor with desiredColumn different from column', () => {
        const plugin = new TestDocumentNavigationPlugin(1);
        const buffer = new TextBuffer(['line1', 'line2', 'line3']);
        const cursor = new CursorPosition(0, 2, 10);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(1);
        expect(newPosition.column).toBe(5); // Clamped to 'line2'.length
        expect(newPosition.desiredColumn).toBe(10);
      });

      it('should handle very large desiredColumn values', () => {
        const plugin = new TestDocumentNavigationPlugin(0);
        const buffer = new TextBuffer(['short']);
        const cursor = new CursorPosition(0, 0, Number.MAX_SAFE_INTEGER);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(0);
        expect(newPosition.column).toBe(5); // Clamped to 'short'.length
        expect(newPosition.desiredColumn).toBe(Number.MAX_SAFE_INTEGER);
      });

      it('should handle zero desiredColumn', () => {
        const plugin = new TestDocumentNavigationPlugin(1);
        const buffer = new TextBuffer(['line1', 'line2', 'line3']);
        const cursor = new CursorPosition(0, 5, 0);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(1);
        expect(newPosition.column).toBe(0);
        expect(newPosition.desiredColumn).toBe(0);
      });
    });

    describe('Configuration Integration', () => {
      it('should use config.step in getTargetLine when implemented', () => {
        class StepTestPlugin extends TestDocumentNavigationPlugin {
          protected getTargetLine(
            cursor: CursorPosition,
            buffer: TextBuffer,
            config: Required<MovementConfig>
          ): number {
            return config.step - 1; // Use step to determine target line
          }
        }

        const plugin = new StepTestPlugin();
        const buffer = new TextBuffer(['line1', 'line2', 'line3']);
        const cursor = new CursorPosition(0, 3, 3);
        const config: Required<MovementConfig> = {
          step: 3,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(2); // step 3 means line 2 (0-based)
      });

      it('should handle config.step of 1', () => {
        class StepTestPlugin extends TestDocumentNavigationPlugin {
          protected getTargetLine(
            cursor: CursorPosition,
            buffer: TextBuffer,
            config: Required<MovementConfig>
          ): number {
            return config.step - 1;
          }
        }

        const plugin = new StepTestPlugin();
        const buffer = new TextBuffer(['line1', 'line2', 'line3']);
        const cursor = new CursorPosition(0, 3, 3);
        const config: Required<MovementConfig> = {
          step: 1,
          allowWrap: false,
          scrollOnEdge: false,
          visualModeEnabled: true
        };

        const newPosition = plugin.testCalculateNewPosition(cursor, buffer, config);

        expect(newPosition.line).toBe(0);
      });
    });
  });

  describe('Mode Restrictions', () => {
    it('should support NORMAL mode', () => {
      const plugin = new TestDocumentNavigationPlugin(
        0,
        'test-normal',
        'Test NORMAL mode',
        'x',
        [VIM_MODE.NORMAL]
      );

      expect(plugin.modes).toContain(VIM_MODE.NORMAL);
      expect(plugin.modes).not.toContain(VIM_MODE.VISUAL);
    });

    it('should support VISUAL mode', () => {
      const plugin = new TestDocumentNavigationPlugin(
        0,
        'test-visual',
        'Test VISUAL mode',
        'x',
        [VIM_MODE.VISUAL]
      );

      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
      expect(plugin.modes).not.toContain(VIM_MODE.NORMAL);
    });

    it('should support multiple modes', () => {
      const plugin = new TestDocumentNavigationPlugin(
        0,
        'test-multi',
        'Test multiple modes',
        'x',
        [VIM_MODE.NORMAL, VIM_MODE.VISUAL]
      );

      expect(plugin.modes).toContain(VIM_MODE.NORMAL);
      expect(plugin.modes).toContain(VIM_MODE.VISUAL);
    });
  });

  describe('Configuration', () => {
    it('should have default movement config', () => {
      const plugin = new TestDocumentNavigationPlugin();
      const config = plugin.getConfig();

      expect(config.step).toBe(1);
      expect(config.allowWrap).toBe(false);
      expect(config.scrollOnEdge).toBe(false);
      expect(config.visualModeEnabled).toBe(true);
    });

    it('should accept custom config', () => {
      const plugin = new TestDocumentNavigationPlugin();
      plugin.updateConfig({ step: 5, allowWrap: true });

      const config = plugin.getConfig();
      expect(config.step).toBe(5);
      expect(config.allowWrap).toBe(true);
    });
  });
});
