/**
 * GMovementPlugin - Jump to last line or specific line with count prefix
 *
 * Implements the vim 'G' command for jumping to the last line of the document
 * or to a specific line when preceded by a count.
 *
 * @example
 * ```typescript
 * import { GMovementPlugin } from './G/GMovementPlugin';
 *
 * const plugin = new GMovementPlugin();
 * // Press 'G' to jump to last line
 * // Press '10G' to jump to line 10
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
 * GMovementPlugin - Jumps to last line or specific line with count prefix
 *
 * The 'G' key in vim normal mode jumps to the last line of the document.
 * When preceded by a count (e.g., '10G'), it jumps to that specific line number.
 *
 * Behavior:
 * - G (no count): Jump to last line of document
 * - [count]G: Jump to line number [count] (1-based, as in vim)
 * - 0G: Jump to last line (same as no count)
 *
 * Column position is set to 0 (the first character position of the line),
 * matching Vim's standard behavior.
 * The base class handles edge cases like empty buffers and line clamping.
 *
 * @example
 * ```typescript
 * // Buffer with 20 lines, cursor at line 5
 * const buffer = new TextBuffer(Array(20).fill('line'));
 * const cursor = new CursorPosition(5, 2, 2);
 *
 * // Jump to last line (G)
 * const plugin = new GMovementPlugin();
 * const newPos = plugin.execute(cursor, buffer, { step: 1 });
 * // newPos.line === 19 (last line, 0-based)
 * // newPos.column === 0 (first character position)
 *
 * // Jump to line 10 (10G)
 * const newPos2 = plugin.execute(cursor, buffer, { step: 10 });
 * // newPos2.line === 9 (line 10 in 1-based, 9 in 0-based)
 * // newPos2.column === 0 (first character position)
 * ```
 */
export class GMovementPlugin extends DocumentNavigationPlugin {
  /**
   * Plugin name
   */
  readonly name = 'movement-G';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Jump to last line or specific line with count prefix';

  /**
   * Keystroke patterns handled by this plugin
   */
  readonly patterns = ['G'];

  /**
   * Modes this plugin is active in
   */
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new GMovementPlugin
   *
   * @param config - Optional movement configuration
   */
  constructor(config?: MovementConfig) {
    super(
      'movement-G',
      'Jump to last line or specific line with count prefix',
      'G',
      [VIM_MODE.NORMAL, VIM_MODE.VISUAL],
      config
    );
    // Override default step to -1 to represent "no count"
    // This allows us to distinguish between:
    // - G without count (step === -1 or 0) → jump to last line
    // - 1G (step === 1) → jump to line 1
    if (!config || config.step === undefined) {
      this.config.step = -1;
    }
  }

  /**
   * Perform the movement action
   *
   * Overrides the base implementation to use count from execution context
   * if available (set by VimExecutor when parsing numeric prefixes like '10G').
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

    // Create a config that uses the count if it's greater than 1 (meaning a count was provided)
    // If count is 1 (default) and config.step is -1 (no count), use -1 to jump to last line
    // If count > 1, use the count as the step value
    const effectiveStep = count > 1 ? count : this.config.step;

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
   * - config.step === 1 (default, no count): Jump to last line
   * - config.step > 1 (count prefix): Jump to specific line (1-based)
   * - config.step === 0: Jump to last line (vim behavior for 0G)
   *
   * Note: Vim uses 1-based line numbers, so '10G' means line 10.
   * The code uses 0-based indexing, so we subtract 1 from the count.
   *
   * The base class's clampLine() method will handle:
   * - Empty buffer case (returns 0)
   * - Clamping to valid range [0, lineCount - 1]
   *
   * @param cursor - The current cursor position (unused for G movement)
   * @param buffer - The text buffer
   * @param config - The movement configuration (includes step/count)
   * @returns The target line number (will be clamped to valid range by base class)
   *
   * @example
   * ```typescript
   * // Buffer with 20 lines
   * const buffer = new TextBuffer(Array(20).fill('line'));
   *
   * // G command (no count, step === 1)
   * plugin.getTargetLine(cursor, buffer, { step: 1 });
   * // Returns: 19 (last line, 0-based)
   *
   * // 10G command (count 10, step === 10)
   * plugin.getTargetLine(cursor, buffer, { step: 10 });
   * // Returns: 9 (line 10 in 1-based, 9 in 0-based)
   *
   * // 0G command (count 0, step === 0)
   * plugin.getTargetLine(cursor, buffer, { step: 0 });
   * // Returns: 19 (last line, same as no count)
   *
   * // 25G command (count 25, step === 25, but buffer only has 20 lines)
   * plugin.getTargetLine(cursor, buffer, { step: 25 });
   * // Returns: 24 (will be clamped to 19 by base class)
   * ```
   */
  protected getTargetLine(
    _cursor: CursorPosition,
    buffer: TextBuffer,
    config: Required<MovementConfig>
  ): number {
    const step = config.step;

    // If step is -1 (default, no count) or 0 (vim behavior for 0G),
    // jump to the last line of the document
    if (step <= 0) {
      return buffer.getLineCount() - 1;
    }

    // If step >= 1 (count prefix provided), jump to specific line
    // Vim uses 1-based line numbers, so 10G means line 10
    // Code uses 0-based indexing, so return step - 1
    // Example: 10G → config.step = 10 → return line 9 (0-based)
    // Example: 1G → config.step = 1 → return line 0 (0-based, first line)
    return step - 1;
  }

  /**
   * Calculate new cursor position
   *
   * Overrides the base class implementation to preserve the column position
   * while moving to the target line.
   *
   * The column is preserved within the bounds of the target line.
   *
   * @param cursor - The current cursor position
   * @param buffer - The text buffer
   * @param config - The movement configuration
   * @returns The new cursor position with preserved column
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

    // Preserve desiredColumn and clamp to target line's length
    const maxColumn = lineContent.length;
    const newColumn = Math.min(cursor.desiredColumn, maxColumn);

    // Return new position with preserved desiredColumn
    return new CursorPosition(clampedLine, newColumn, cursor.desiredColumn);
  }
}
