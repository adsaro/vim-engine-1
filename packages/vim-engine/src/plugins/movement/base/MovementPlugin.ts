/**
 * MovementPlugin - Base class for movement plugins
 *
 * Provides common functionality for all movement plugins including
 * cursor position calculation, validation, and configuration management.
 *
 * @example
 * ```typescript
 * import { MovementPlugin, MovementConfig } from './base/MovementPlugin';
 * import { CursorPosition } from '../../../state/CursorPosition';
 * import { TextBuffer } from '../../../state/TextBuffer';
 * import { VimMode } from '../../../state/VimMode';
 *
 * class CustomMovementPlugin extends MovementPlugin {
 *   constructor() {
 *     super(
 *       'custom-movement',
 *       'Custom movement',
 *       'x',
 *       [VimMode.NORMAL]
 *     );
 *   }
 *
 *   protected calculateNewPosition(
 *     cursor: CursorPosition,
 *     buffer: TextBuffer,
 *     config: Required<MovementConfig>
 *   ): CursorPosition {
 *     // Custom movement logic
 *     return new CursorPosition(cursor.line + 1, cursor.column);
 *   }
 * }
 * ```
 *
 * @see AbstractVimPlugin For the base class
 */
import { AbstractVimPlugin } from '../../../plugin/AbstractVimPlugin';
import { ExecutionContext } from '../../../plugin/ExecutionContext';
import { VimMode } from '../../../state/VimMode';
import { CursorPosition } from '../../../state/CursorPosition';
import { TextBuffer } from '../../../state/TextBuffer';

/**
 * Configuration options for movement plugins
 */
export interface MovementConfig {
  /**
   * Number of steps to move per keystroke
   * @default 1
   */
  step?: number;

  /**
   * Whether to wrap around at buffer edges
   * @default false
   */
  allowWrap?: boolean;

  /**
   * Whether to scroll when cursor reaches edge
   * @default false
   */
  scrollOnEdge?: boolean;

  /**
   * Whether to enable in visual mode
   * @default true
   */
  visualModeEnabled?: boolean;
}

/**
 * MovementPlugin - Base class for all movement plugins
 *
 * Extends AbstractVimPlugin to provide common movement functionality:
 * - Cursor position calculation and validation
 * - Configuration management
 * - Buffer boundary checking
 */
export abstract class MovementPlugin extends AbstractVimPlugin {
  protected config: Required<MovementConfig>;

  /**
   * Create a new movement plugin
   *
   * @param name - Unique plugin name
   * @param description - Plugin description
   * @param pattern - Keystroke pattern this plugin handles
   * @param modes - Vim modes this plugin is active in
   * @param config - Optional movement configuration
   *
   * @example
   * ```typescript
   * class MyMovement extends MovementPlugin {
   *   constructor() {
   *     super('my-movement', 'My movement', 'x', [VimMode.NORMAL], {
   *       step: 2,
   *       allowWrap: true
   *     });
   *   }
   * }
   * ```
   */
  constructor(
    name: string,
    description: string,
    pattern: string,
    modes: VimMode[],
    config?: MovementConfig
  ) {
    super(name, description, [pattern], modes);
    this.config = {
      step: config?.step ?? 1,
      allowWrap: config?.allowWrap ?? false,
      scrollOnEdge: config?.scrollOnEdge ?? false,
      visualModeEnabled: config?.visualModeEnabled ?? true,
    };
  }

  /**
   * Perform the movement action
   *
   * Calculates new position, validates it, and updates cursor.
   *
   * @param context - The execution context
   */
  protected performAction(context: ExecutionContext): void {
    const cursor = context.getCursor();
    const buffer = context.getBuffer();

    if (buffer.isEmpty()) {
      return;
    }

    const newPosition = this.calculateNewPosition(cursor, buffer, this.config);

    if (this.validateMove(newPosition, buffer)) {
      context.setCursor(newPosition);
    }
  }

  /**
   * Calculate new cursor position - override in subclass
   *
   * @param cursor - The current cursor position
   * @param buffer - The text buffer
   * @param config - The movement configuration
   * @returns {CursorPosition} The new cursor position
   */
  protected abstract calculateNewPosition(
    cursor: CursorPosition,
    buffer: TextBuffer,
    config: Required<MovementConfig>
  ): CursorPosition;

  /**
   * Validate if the move is allowed
   *
   * Checks that the new position is within buffer bounds.
   *
   * @param newPosition - The proposed new position
   * @param buffer - The text buffer
   * @returns {boolean} True if the move is valid
   */
  /**
   * Check if buffer is empty (has no lines)
   */
  private isBufferEmpty(buffer: TextBuffer): boolean {
    return buffer.getLineCount() === 0;
  }

  /**
   * Check if line number is within valid buffer bounds
   */
  private isLineValid(line: number, lineCount: number): boolean {
    return line >= 0 && line < lineCount;
  }

  /**
   * Check if column number is within valid line bounds
   */
  private isColumnValid(column: number, lineLength: number): boolean {
    return column >= 0 && column <= lineLength;
  }

  /**
   * Get line content, returning null if line doesn't exist
   */
  private getLineSafe(buffer: TextBuffer, line: number): string | null {
    return buffer.getLine(line);
  }

  protected validateMove(newPosition: CursorPosition, buffer: TextBuffer): boolean {
    // Check if buffer is empty
    if (this.isBufferEmpty(buffer)) {
      return false;
    }

    // Check if line number is within valid bounds
    const lineCount = buffer.getLineCount();
    if (!this.isLineValid(newPosition.line, lineCount)) {
      return false;
    }

    // Get line content
    const line = this.getLineSafe(buffer, newPosition.line);
    if (line === null) {
      return false;
    }

    // Check if column number is within valid bounds
    return this.isColumnValid(newPosition.column, line.length);
  }

  /**
   * Get the current configuration
   *
   * @returns {Required<MovementConfig>} The current configuration
   */
  getConfig(): Required<MovementConfig> {
    return { ...this.config };
  }

  /**
   * Update configuration
   *
   * @param config - Partial configuration to update
   * @returns {void}
   */
  updateConfig(config: Partial<MovementConfig>): void {
    this.config = {
      step: config.step ?? this.config.step,
      allowWrap: config.allowWrap ?? this.config.allowWrap,
      scrollOnEdge: config.scrollOnEdge ?? this.config.scrollOnEdge,
      visualModeEnabled: config.visualModeEnabled ?? this.config.visualModeEnabled,
    };
  }
}
