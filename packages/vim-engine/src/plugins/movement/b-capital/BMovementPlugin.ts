/**
 * BMovementPlugin - Move cursor to start of previous WORD (B key)
 *
 * Implements the vim 'B' command for moving the cursor to the start of the previous WORD.
 * A WORD is defined as a sequence of non-whitespace characters (ignoring punctuation).
 *
 * @example
 * ```typescript
 * import { BMovementPlugin } from './b-capital/BMovementPlugin';
 *
 * const plugin = new BMovementPlugin();
 * // Press 'B' to move to start of previous WORD
 * ```
 *
 * @see WordMovementPlugin For the base class
 */
import { WordMovementPlugin } from '../base/WordMovementPlugin';
import { MovementConfig } from '../base/MovementPlugin';
import { findPreviousWORDStart } from '../utils/wordBoundary';
import { VIM_MODE, VimMode } from '../../../state/VimMode';

/**
 * BMovementPlugin - Moves cursor to start of previous WORD
 *
 * The 'B' key in vim normal mode moves the cursor to the start of the previous WORD.
 * A WORD is any sequence of non-whitespace characters, ignoring punctuation.
 * If at the start of a line, moves to end of previous line.
 * Stops at the start of the buffer.
 */
export class BMovementPlugin extends WordMovementPlugin {
  /**
   * Plugin name
   */
  readonly name = 'movement-B';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Move cursor to start of previous WORD (B key)';

  /**
   * Keystroke patterns handled by this plugin
   */
  readonly patterns = ['B'];

  /**
   * Modes this plugin is active in
   */
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new BMovementPlugin instance
   *
   * @param config - Optional movement configuration
   */
  constructor(config?: MovementConfig) {
    super(
      'movement-B',
      'Move cursor to start of previous WORD (B key)',
      'B',
      [VIM_MODE.NORMAL, VIM_MODE.VISUAL],
      config
    );
  }

  /**
   * Get the movement direction
   *
   * @returns 'backward' for B movement
   */
  protected get direction(): 'forward' | 'backward' {
    return 'backward';
  }

  /**
   * Find WORD boundary on a line
   *
   * @param line - The line content to search
   * @param column - The starting column position
   * @returns The column index of the previous WORD start, or null if not found
   */
  protected findBoundary(line: string, column: number, rolling: boolean = false): number | null {
    return findPreviousWORDStart(line, column, rolling);
  }
}
