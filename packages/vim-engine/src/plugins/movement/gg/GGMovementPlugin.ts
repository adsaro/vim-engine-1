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
 * Column position is preserved within the bounds of the target line.
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
 *
 * // Jump to line 5 (5gg)
 * const newPos2 = plugin.execute(cursor, buffer, { step: 5 });
 * // newPos2.line === 4 (line 5 in 1-based, 4 in 0-based)
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
}
