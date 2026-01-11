/**
 * BMovementPlugin - Move cursor to start of previous word (b key)
 *
 * Implements the vim 'b' command for moving the cursor to the start of the previous word.
 * A word is defined as a sequence of alphanumeric characters or underscores.
 *
 * @example
 * ```typescript
 * import { BMovementPlugin } from './b/BMovementPlugin';
 *
 * const plugin = new BMovementPlugin();
 * // Press 'b' to move to start of previous word
 * ```
 *
 * @see WordMovementPlugin For the base class
 */
import { WordMovementPlugin } from '../base/WordMovementPlugin';
import { MovementConfig } from '../base/MovementPlugin';
import { findPreviousWordStart } from '../utils/wordBoundary';
import { VIM_MODE, VimMode } from '../../../state/VimMode';

/**
 * BMovementPlugin - Moves cursor to start of previous word
 *
 * The 'b' key in vim normal mode moves the cursor to the start of the previous word.
 * If at the start of a line, moves to start of last word on previous line.
 * Stops at the start of the buffer.
 */
export class BMovementPlugin extends WordMovementPlugin {
  /**
   * Plugin name
   */
  readonly name = 'movement-b';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Move cursor to start of previous word (b key)';

  /**
   * Keystroke patterns handled by this plugin
   */
  readonly patterns = ['b'];

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
      'movement-b',
      'Move cursor to start of previous word (b key)',
      'b',
      [VIM_MODE.NORMAL, VIM_MODE.VISUAL],
      config
    );
  }

  /**
   * Get the movement direction
   *
   * @returns 'backward' for b movement
   */
  protected get direction(): 'forward' | 'backward' {
    return 'backward';
  }

  /**
   * Find word boundary on a line
   *
   * @param line - The line content to search
   * @param column - The starting column position
   * @returns The column index of the previous word start, or null if not found
   */
  protected findBoundary(line: string, column: number): number | null {
    return findPreviousWordStart(line, column);
  }
}
