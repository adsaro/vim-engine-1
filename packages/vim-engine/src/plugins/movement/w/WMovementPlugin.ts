/**
 * WMovementPlugin - Move cursor to start of next word (w key)
 *
 * Implements the vim 'w' command for moving the cursor to the start of the next word.
 * A word is defined as a sequence of alphanumeric characters or underscores.
 *
 * @example
 * ```typescript
 * import { WMovementPlugin } from './w/WMovementPlugin';
 *
 * const plugin = new WMovementPlugin();
 * // Press 'w' to move to start of next word
 * ```
 *
 * @see WordMovementPlugin For the base class
 */
import { WordMovementPlugin } from '../base/WordMovementPlugin';
import { MovementConfig } from '../base/MovementPlugin';
import { findNextWordStart } from '../utils/wordBoundary';
import { VIM_MODE, VimMode } from '../../../state/VimMode';

/**
 * WMovementPlugin - Moves cursor to start of next word
 *
 * The 'w' key in vim normal mode moves the cursor to the start of the next word.
 * If at the end of a line, moves to start of first word on next line.
 * Stops at the end of the buffer.
 */
export class WMovementPlugin extends WordMovementPlugin {
  /**
   * Plugin name
   */
  readonly name = 'movement-w';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Move cursor to start of next word (w key)';

  /**
   * Keystroke patterns handled by this plugin
   */
  readonly patterns = ['w'];

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
      'movement-w',
      'Move cursor to start of next word (w key)',
      'w',
      [VIM_MODE.NORMAL, VIM_MODE.VISUAL],
      config
    );
  }

  /**
   * Get the movement direction
   *
   * @returns 'forward' for w movement
   */
  protected get direction(): 'forward' | 'backward' {
    return 'forward';
  }

  /**
   * Find word boundary on a line
   *
   * @param line - The line content to search
   * @param column - The starting column position
   * @returns The column index of the next word start, or null if not found
   */
  protected findBoundary(line: string, column: number, rolling: boolean = false): number | null {
    return findNextWordStart(line, column, rolling);
  }
}
