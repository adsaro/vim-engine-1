/**
 * WMovementPlugin - Move cursor to start of next WORD (W key)
 *
 * Implements the vim 'W' command for moving the cursor to the start of the next WORD.
 * A WORD is defined as a sequence of non-whitespace characters (ignoring punctuation).
 *
 * @example
 * ```typescript
 * import { WMovementPlugin } from './W/WMovementPlugin';
 *
 * const plugin = new WMovementPlugin();
 * // Press 'W' to move to start of next WORD
 * ```
 *
 * @see WordMovementPlugin For the base class
 */
import { WordMovementPlugin } from '../base/WordMovementPlugin';
import { MovementConfig } from '../base/MovementPlugin';
import { findNextWORDStart } from '../utils/wordBoundary';
import { VIM_MODE, VimMode } from '../../../state/VimMode';

/**
 * WMovementPlugin - Moves cursor to start of next WORD
 *
 * The 'W' key in vim normal mode moves the cursor to the start of the next WORD.
 * A WORD is any sequence of non-whitespace characters, ignoring punctuation.
 * If at the end of a line, moves to start of first WORD on next line.
 * Stops at the end of the buffer.
 */
export class WMovementPlugin extends WordMovementPlugin {
  /**
   * Plugin name
   */
  readonly name = 'movement-W';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Move cursor to start of next WORD (W key)';

  /**
   * Keystroke patterns handled by this plugin
   */
  readonly patterns = ['W'];

  /**
   * Modes this plugin is active in
   */
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new WMovementPlugin instance
   *
   * @param config - Optional movement configuration
   */
  constructor(config?: MovementConfig) {
    super(
      'movement-W',
      'Move cursor to start of next WORD (W key)',
      'W',
      [VIM_MODE.NORMAL, VIM_MODE.VISUAL],
      config
    );
  }

  /**
   * Get the movement direction
   *
   * @returns 'forward' for W movement
   */
  protected get direction(): 'forward' | 'backward' {
    return 'forward';
  }

  /**
   * Find WORD boundary on a line
   *
   * @param line - The line content to search
   * @param column - The starting column position
   * @returns The column index of the next WORD start, or null if not found
   */
  protected findBoundary(line: string, column: number): number | null {
    return findNextWORDStart(line, column);
  }
}
