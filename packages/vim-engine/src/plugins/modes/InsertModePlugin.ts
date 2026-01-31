/**
 * InsertModePlugin - Enter insert mode (i key)
 *
 * Implements the vim 'i' command to enter insert mode.
 * In insert mode, typed characters are inserted at the cursor position.
 *
 * @example
 * ```typescript
 * import { InsertModePlugin } from './modes/InsertModePlugin';
 *
 * const plugin = new InsertModePlugin();
 * // Press 'i' to enter insert mode
 * ```
 */
import { AbstractVimPlugin } from '../../plugin/AbstractVimPlugin';
import { ExecutionContext } from '../../plugin/ExecutionContext';
import { VimMode, VIM_MODE } from '../../state/VimMode';

/**
 * InsertModePlugin - Enters insert mode from normal mode
 *
 * The 'i' key in vim normal mode switches to insert mode, allowing
 * text to be inserted at the current cursor position.
 */
export class InsertModePlugin extends AbstractVimPlugin {
  /**
   * Plugin name
   */
  readonly name = 'mode-insert';

  /**
   * Plugin version
   */
  readonly version = '1.0.0';

  /**
   * Plugin description
   */
  readonly description = 'Enter insert mode (i key)';

  /**
   * Keystroke patterns handled by this plugin
   */
  readonly patterns = ['i'];

  /**
   * Modes this plugin is active in
   */
  readonly modes: VimMode[] = [VIM_MODE.NORMAL];

  /**
   * Create a new InsertModePlugin
   */
  constructor() {
    super(
      'mode-insert',
      'Enter insert mode (i key)',
      ['i'],
      [VIM_MODE.NORMAL]
    );
  }

  /**
   * Enter insert mode
   *
   * Switches the editor from normal mode to insert mode.
   * The cursor stays at the current position.
   *
   * @param context - The execution context
   */
  protected performAction(context: ExecutionContext): void {
    context.setMode(VIM_MODE.INSERT);
  }
}
