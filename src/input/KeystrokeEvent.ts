/**
 * KeystrokeEvent - Represents a normalized keystroke event
 *
 * Wraps a raw KeyboardEvent and provides a normalized keystroke string
 * along with metadata about the event including modifiers and timestamp.
 *
 * @example
 * ```typescript
 * import { KeystrokeEvent } from './input/KeystrokeEvent';
 *
 * document.addEventListener('keydown', (event) => {
 *   const keystrokeEvent = new KeystrokeEvent(
 *     normalizeKeystroke(event),
 *     event
 *   );
 *
 *   console.log('Keystroke:', keystrokeEvent.keystroke);
 *   console.log('Is repeat:', keystrokeEvent.isRepeat);
 *   console.log('Has Ctrl:', keystrokeEvent.hasCtrl());
 * });
 * ```
 */
export class KeystrokeEvent {
  /**
   * The normalized keystroke string (e.g., 'h', '<Esc>', 'C-c')
   */
  readonly keystroke: string;

  /**
   * The original KeyboardEvent
   */
  readonly rawEvent: KeyboardEvent;

  /**
   * Timestamp when the event was created
   */
  readonly timestamp: number;

  /**
   * Whether this is a key repeat event
   */
  readonly isRepeat: boolean;

  /**
   * State of modifier keys at the time of the event
   */
  readonly modifiers: { ctrl: boolean; alt: boolean; shift: boolean; meta: boolean };

  /**
   * Create a new KeystrokeEvent
   *
   * @param keystroke - The normalized keystroke string
   * @param rawEvent - The original KeyboardEvent
   */
  constructor(keystroke: string, rawEvent: KeyboardEvent) {
    this.keystroke = keystroke;
    this.rawEvent = rawEvent;
    this.timestamp = Date.now();
    this.isRepeat = rawEvent.repeat;
    this.modifiers = {
      ctrl: rawEvent.ctrlKey,
      alt: rawEvent.altKey,
      shift: rawEvent.shiftKey,
      meta: rawEvent.metaKey,
    };
  }

  /**
   * Get the keystroke string
   *
   * @returns {string} The normalized keystroke
   */
  getKeystroke(): string {
    return this.keystroke;
  }

  /**
   * Get the raw keyboard event
   *
   * @returns {KeyboardEvent} The original event
   */
  getRawEvent(): KeyboardEvent {
    return this.rawEvent;
  }

  /**
   * Get the event timestamp
   *
   * @returns {number} Unix timestamp in milliseconds
   */
  getTimestamp(): number {
    return this.timestamp;
  }

  /**
   * Check if this is a modifier-only key press
   *
   * @returns {boolean} True if only a modifier key was pressed
   */
  isModifierOnly(): boolean {
    const modifierKeys = ['Control', 'Alt', 'Shift', 'Meta'];
    return (
      modifierKeys.includes(this.rawEvent.key) ||
      (this.modifiers.ctrl &&
        !this.modifiers.alt &&
        !this.modifiers.shift &&
        !this.modifiers.meta &&
        this.keystroke.length <= 2)
    );
  }

  /**
   * Check if Ctrl modifier was active
   *
   * @returns {boolean} True if Ctrl was pressed
   */
  hasCtrl(): boolean {
    return this.modifiers.ctrl;
  }

  /**
   * Check if Alt modifier was active
   *
   * @returns {boolean} True if Alt was pressed
   */
  hasAlt(): boolean {
    return this.modifiers.alt;
  }

  /**
   * Check if Shift modifier was active
   *
   * @returns {boolean} True if Shift was pressed
   */
  hasShift(): boolean {
    return this.modifiers.shift;
  }

  /**
   * Check if Meta (Cmd/Windows) modifier was active
   *
   * @returns {boolean} True if Meta was pressed
   */
  hasMeta(): boolean {
    return this.modifiers.meta;
  }

  /**
   * Get the complete modifier state
   *
   * @returns {Object} Object with ctrl, alt, shift, meta boolean values
   */
  getModifierState(): { ctrl: boolean; alt: boolean; shift: boolean; meta: boolean } {
    return { ...this.modifiers };
  }
}
