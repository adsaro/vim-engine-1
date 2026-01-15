/**
 * GGMovementPlugin - Jump to first line of document
 *
 * Implements the vim 'gg' command for jumping to the first line of the document.
 *
 * @example
 * ```typescript
 * import { GGMovementPlugin } from './gg/GGMovementPlugin';
 *
 * const plugin = new GGMovementPlugin();
 * // Press 'gg' to jump to first line
 * ```
 *
 * @see DocumentNavigationPlugin For the base class
 */
import { DocumentNavigationPlugin } from '../base/DocumentNavigationPlugin';
import { MovementConfig } from '../base/MovementPlugin';
import { CursorPosition } from '../../../state/CursorPosition';
import { TextBuffer } from '../../../state/TextBuffer';
import { VIM_MODE, VimMode } from '../../../state/VimMode';
import { ExecutionContext } from '../../../plugin/ExecutionContext';

/**
 * GGMovementPlugin - Jumps to first line of document
 *
 * The 'gg' key in vim normal mode jumps to the first line of the document.
 * When preceded by a count (e.g., '5gg'), it jumps to that specific line number.
 *
 * Behavior:
 * - gg (no count): Jump to first line of document
 * - [count]gg: Jump to line number [count] (1-based, as in vim)
 * - 0gg: Jump to first line (same as no count)
 *
 * Column position is set to 0 (the first character position of the line),
 * matching Vim's standard behavior.
 * The base class handles edge cases like empty buffers and line clamping.
 *
 * @example
 * ```typescript
 * // Buffer with 20 lines, cursor at line 15
 * const buffer = new TextBuffer(Array(20).fill('line'));
 * const cursor = new CursorPosition(15, 2, 2);
 *
 * // Jump to first line (gg)
 * const plugin = new GGMovementPlugin();
 * const newPos = plugin.execute(cursor, buffer, { step: 1 });
 * // newPos.line === 0 (first line)
 * // newPos.column === 0 (first character position)
 *
 * // Jump to line 5 (5gg)
 * const newPos2 = plugin.execute(cursor, buffer, { step: 5 });
 * // newPos2.line === 4 (line 5 in 1-based, 4 in 0-based)
 * // newPos2.column === 0 (first character position)
 * ```
 */
export class GGMovementPlugin extends DocumentNavigationPlugin {
  /**
   * Plugin name
   */
  readonly name = 'movement-gg';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Jump to first line of document';

  /**
   * Keystroke patterns handled by this plugin
   */
  readonly patterns = ['gg'];

  /**
   * Modes this plugin is active in
   */
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new GGMovementPlugin
   *
   * @param config - Optional movement configuration
   */
  constructor(config?: MovementConfig) {
    super(
      'movement-gg',
      'Jump to first line of document',
      'gg',
      [VIM_MODE.NORMAL, VIM_MODE.VISUAL],
      config
    );
  }

  /**
   * Perform the movement action
   *
   * Overrides the base implementation to use count from execution context
   * if available (set by VimExecutor when parsing numeric prefixes like '5gg').
   *
   * @param context - The execution context
   */
  protected performAction(context: ExecutionContext): void {
    const cursor = context.getCursor();
    const buffer = context.getBuffer();

    if (buffer.isEmpty()) {
      return;
    }

    // Get count from execution context (set by VimExecutor when parsing numeric prefixes)
    const count = context.getCount();

    // Create a config that uses the count
    // If count is 1 (default) or less, use 1 to jump to first line
    // If count > 1, use the count as the step value
    const effectiveStep = count > 1 ? count : 1;

    const configWithCount: Required<MovementConfig> = {
      ...this.config,
      step: effectiveStep,
    };

    const newPosition = this.calculateNewPosition(cursor, buffer, configWithCount);

    if (this.validateMove(newPosition, buffer)) {
      context.setCursor(newPosition);
    }
  }

  /**
   * Calculate the target line number
   *
   * Implements the logic for determining which line to jump to based on
   * the count prefix (config.step):
   *
   * - config.step === 1 (default, no count): Jump to first line
   * - config.step > 1 (count prefix): Jump to specific line (1-based)
   * - config.step === 0: Jump to first line (vim behavior for 0gg)
   *
   * Note: Vim uses 1-based line numbers, so '5gg' means line 5.
   * The code uses 0-based indexing, so we subtract 1 from the count.
   *
   * The base class's clampLine() method will handle:
   * - Empty buffer case (returns 0)
   * - Clamping to valid range [0, lineCount - 1]
   *
   * @param cursor - The current cursor position (unused for gg movement)
   * @param buffer - The text buffer
   * @param config - The movement configuration (includes step/count)
   * @returns The target line number (will be clamped to valid range by base class)
   *
   * @example
   * ```typescript
   * // Buffer with 20 lines
   * const buffer = new TextBuffer(Array(20).fill('line'));
   *
   * // gg command (no count, step === 1)
   * plugin.getTargetLine(cursor, buffer, { step: 1 });
   * // Returns: 0 (first line)
   *
   * // 5gg command (count 5, step === 5)
   * plugin.getTargetLine(cursor, buffer, { step: 5 });
   * // Returns: 4 (line 5 in 1-based, 4 in 0-based)
   *
   * // 0gg command (count 0, step === 0)
   * plugin.getTargetLine(cursor, buffer, { step: 0 });
   * // Returns: 0 (first line, same as no count)
   *
   * // 25gg command (count 25, step === 25, but buffer only has 20 lines)
   * plugin.getTargetLine(cursor, buffer, { step: 25 });
   * // Returns: 24 (will be clamped to 19 by base class)
   * ```
   */
  protected getTargetLine(
    _cursor: CursorPosition,
    _buffer: TextBuffer,
    config: Required<MovementConfig>
  ): number {
    const step = config.step;

    // If step is <= 0 (no count or 0gg), jump to the first line of the document
    if (step <= 1) {
      return 0;
    }

    // If step > 1 (count prefix provided), jump to specific line
    // Vim uses 1-based line numbers, so 5gg means line 5
    // Code uses 0-based indexing, so return step - 1
    // Example: 5gg → config.step = 5 → return line 4 (0-based)
    // Example: 1gg → config.step = 1 → return line 0 (0-based, first line)
    return step - 1;
  }

  /**
   * Calculate new cursor position
   *
   * Overrides the base class implementation to set the column position to 0
   * while moving to the target line, matching Vim's standard behavior for gg.
   *
   * The column is set to 0 (the first character position of the line).
   *
   * @param cursor - The current cursor position
   * @param buffer - The text buffer
   * @param config - The movement configuration
   * @returns The new cursor position with column set to 0
   */
  protected calculateNewPosition(
    cursor: CursorPosition,
    buffer: TextBuffer,
    config: Required<MovementConfig>
  ): CursorPosition {
    // Handle empty buffer case
    if (buffer.isEmpty()) {
      return cursor.clone();
    }

    // Get target line using subclass implementation
    const targetLine = this.getTargetLine(cursor, buffer, config);

    // Clamp target line to valid buffer range
    const clampedLine = this.clampLine(targetLine, buffer);

    // Get target line content
    const lineContent = buffer.getLine(clampedLine);

    // If line doesn't exist (shouldn't happen with clamping), return current position
    if (lineContent === null) {
      return cursor.clone();
    }

    // Set column to 0 (first character position), matching Vim's gg behavior
    return new CursorPosition(clampedLine, 0, 0);
  }
}
