/**
 * EMovementPlugin - Move cursor to end of current/next word (e key)
 *
 * Implements the vim 'e' command for moving the cursor to the end of the current word.
 * If already at the end of a word, moves to end of the next word.
 * A word is defined as a sequence of alphanumeric characters or underscores.
 *
 * @example
 * ```typescript
 * import { EMovementPlugin } from './e/EMovementPlugin';
 *
 * const plugin = new EMovementPlugin();
 * // Press 'e' to move to end of current/next word
 * ```
 *
 * @see WordMovementPlugin For the base class
 */
import { WordMovementPlugin } from '../base/WordMovementPlugin';
import { MovementConfig } from '../base/MovementPlugin';
import { findWordEnd } from '../utils/wordBoundary';
import { VIM_MODE, VimMode } from '../../../state/VimMode';

/**
 * EMovementPlugin - Moves cursor to end of current/next word
 *
 * The 'e' key in vim normal mode moves the cursor to the end of the current word.
 * If already at the end of a word, moves to end of the next word.
 * Stops at the end of the buffer.
 */
export class EMovementPlugin extends WordMovementPlugin {
  /**
   * Plugin name
   */
  readonly name = 'movement-e';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Move cursor to end of current/next word (e key)';

  /**
   * Keystroke patterns handled by this plugin
   */
  readonly patterns = ['e'];

  /**
   * Modes this plugin is active in
   */
  readonly modes: VimMode[] = [VIM_MODE.NORMAL, VIM_MODE.VISUAL];

  /**
   * Create a new EMovementPlugin instance
   *
   * @param config - Optional movement configuration
   */
  constructor(config?: MovementConfig) {
    super(
      'movement-e',
      'Move cursor to end of current/next word (e key)',
      'e',
      [VIM_MODE.NORMAL, VIM_MODE.VISUAL],
      config
    );
  }

  /**
   * Get the movement direction
   *
   * @returns 'forward' for e movement
   */
  protected get direction(): 'forward' | 'backward' {
    return 'forward';
  }

  /**
   * Find word boundary on a line
   *
   * @param line - The line content to search
   * @param column - The starting column position
   * @returns The column index of the word end, or null if not found
   */
  protected findBoundary(line: string, column: number): number | null {
    return findWordEnd(line, column);
  }
}
