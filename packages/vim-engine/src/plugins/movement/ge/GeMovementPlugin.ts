/**
 * GeMovementPlugin - Move cursor to end of previous word (ge key)
 *
 * Implements the vim 'ge' command for moving the cursor to the end of the previous word.
 * This is the backward counterpart to the 'e' motion.
 *
 * @example
 * ```typescript
 * import { GeMovementPlugin } from './ge/GeMovementPlugin';
 *
 * const plugin = new GeMovementPlugin();
 * // Press 'g' followed by 'e' to move to end of previous word
 * ```
 *
 * @see WordMovementPlugin For the base class
 */
import { WordMovementPlugin } from '../base/WordMovementPlugin';
import { MovementConfig } from '../base/MovementPlugin';
import { findPreviousWordEnd } from '../utils/wordBoundary';
import { VIM_MODE, VimMode } from '../../../state/VimMode';

/**
 * GeMovementPlugin - Moves cursor to end of previous word
 *
 * The 'ge' key sequence in vim normal mode moves the cursor to the end of the previous word.
 * A word is defined as a sequence of word characters (letters, digits, underscore).
 * If at the start of a line, moves to end of last word on previous line.
 * Stops at the start of the buffer.
 */
export class GeMovementPlugin extends WordMovementPlugin {
  /**
   * Plugin name
   */
  readonly name = 'movement-ge';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Move cursor to end of previous word (ge key)';

  /**
   * Keystroke patterns handled by this plugin
   */
  readonly patterns = ['ge'];

  /**
   * Modes this plugin is active in
   */
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new GeMovementPlugin instance
   *
   * @param config - Optional movement configuration
   */
  constructor(config?: MovementConfig) {
    super(
      'movement-ge',
      'Move cursor to end of previous word (ge key)',
      'ge',
      [VIM_MODE.NORMAL, VIM_MODE.VISUAL],
      config
    );
  }

  /**
   * Get the movement direction
   *
   * @returns 'backward' for ge movement
   */
  protected get direction(): 'forward' | 'backward' {
    return 'backward';
  }

  /**
   * Find word end boundary on a line
   *
   * @param line - The line content to search
   * @param column - The starting column position
   * @returns The column index of the previous word end, or null if not found
   */
  protected findBoundary(line: string, column: number, rolling: boolean = false): number | null {
    return findPreviousWordEnd(line, column, rolling);
  }
}
