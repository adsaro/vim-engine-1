/**
 * KeystrokeProcessor - Converts KeyboardEvents to normalized keystroke strings
 *
 * Provides high-level keystroke processing including normalization,
 * pending keystroke management, and event filtering.
 *
 * @example
 * ```typescript
 * import { KeystrokeProcessor } from './input/KeystrokeProcessor';
 *
 * const processor = new KeystrokeProcessor({ timeout: 500 });
 *
 * document.addEventListener('keydown', (event) => {
 *   if (processor.shouldProcess(event)) {
 *     const keystrokeEvent = processor.process(event);
 *     console.log('Keystroke:', keystrokeEvent.keystroke);
 *   }
 * });
 *
 * // Process pending keystrokes
 * const pending = processor.flushPending();
 * ```
 */
import { KeystrokeEvent } from './KeystrokeEvent';
import { KeyboardEventNormalizer } from './KeyboardEventNormalizer';

/**
 * Options for configuring the KeystrokeProcessor
 */
export interface KeystrokeProcessorOptions {
  /**
   * Timeout in milliseconds for pending keystrokes
   * @default 500
   */
  timeout?: number;
}

/**
 * KeystrokeProcessor - Converts KeyboardEvents to normalized keystroke strings
 */
export class KeystrokeProcessor {
  private normalizer: KeyboardEventNormalizer;
  private timeout: number;
  private pendingKeystrokes: string[];

  /**
   * Create a new KeystrokeProcessor
   *
   * @param options - Optional configuration
   *
   * @example
   * ```typescript
   * // Default options
   * const processor = new KeystrokeProcessor();
   *
   * // Custom timeout
   * const processor = new KeystrokeProcessor({ timeout: 1000 });
   * ```
   */
  constructor(options?: KeystrokeProcessorOptions) {
    this.normalizer = new KeyboardEventNormalizer();
    this.timeout = options?.timeout ?? 500; // Default 500ms timeout
    this.pendingKeystrokes = [];
  }

  /**
   * Process a KeyboardEvent and return a KeystrokeEvent
   *
   * @param event - The keyboard event to process
   * @returns {KeystrokeEvent} The normalized keystroke event
   *
   * @example
   * ```typescript
   * document.addEventListener('keydown', (event) => {
   *   const keystrokeEvent = processor.process(event);
   *   console.log(keystrokeEvent.keystroke);
   * });
   * ```
   */
  process(event: KeyboardEvent): KeystrokeEvent {
    const keystroke = this.normalizer.normalize(event);
    return new KeystrokeEvent(keystroke, event);
  }

  /**
   * Process a single key with its event context
   *
   * @param key - The key string to process
   * @returns {string} The normalized keystroke
   *
   * @example
   * ```typescript
   * const keystroke = processor.processKey('Enter');
   * ```
   */
  processKey(key: string): string {
    return this.normalizer.normalizeKey(key);
  }

  /**
   * Flush pending keystrokes and return as combined string
   *
   * @returns {string} The combined pending keystrokes
   *
   * @example
   * ```typescript
   * const combined = processor.flushPending();
   * ```
   */
  flushPending(): string {
    const result = this.pendingKeystrokes.join('');
    this.pendingKeystrokes = [];
    return result;
  }

  /**
   * Clear all pending keystrokes
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * processor.clearPending();
   * ```
   */
  clearPending(): void {
    this.pendingKeystrokes = [];
  }

  //
  // State methods
  //

  /**
   * Get pending keystrokes as a combined string
   *
   * @returns {string} The pending keystrokes joined as a string
   */
  getPendingKeystrokes(): string {
    return this.pendingKeystrokes.join('');
  }

  /**
   * Get pending keystrokes as an array
   *
   * @returns {string[]} Array of pending keystrokes
   */
  getPendingAsArray(): string[] {
    return [...this.pendingKeystrokes];
  }

  /**
   * Check if there are pending keystrokes
   *
   * @returns {boolean} True if there are pending keystrokes
   */
  hasPending(): boolean {
    return this.pendingKeystrokes.length > 0;
  }

  /**
   * Get the count of pending keystrokes
   *
   * @returns {number} The number of pending keystrokes
   */
  getPendingCount(): number {
    return this.pendingKeystrokes.length;
  }

  //
  // Configuration methods
  //

  /**
   * Set the timeout for pending keystrokes
   *
   * @param timeout - Timeout in milliseconds
   * @returns {void}
   */
  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }

  /**
   * Get the current timeout value
   *
   * @returns {number} The timeout in milliseconds
   */
  getTimeout(): number {
    return this.timeout;
  }

  /**
   * Determine if a keyboard event should be processed
   *
   * Filters out modifier-only key presses that shouldn't trigger
   * command execution.
   *
   * @param event - The keyboard event to check
   * @returns {boolean} True if the event should be processed
   *
   * @example
   * ```typescript
   * document.addEventListener('keydown', (event) => {
   *   if (processor.shouldProcess(event)) {
   *     processor.process(event);
   *   }
   * });
   * ```
   */
  shouldProcess(event: KeyboardEvent): boolean {
    // Always process key events that aren't just modifier presses alone
    const isModifierOnly = this.normalizer.isModifierKey(event);
    const hasNonModifierKeys = event.key.length > 0 && !isModifierOnly;

    // Don't process if it's a modifier key pressed alone without other keys
    if (isModifierOnly && !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey) {
      return false;
    }

    return (
      hasNonModifierKeys ||
      event.ctrlKey ||
      event.altKey ||
      event.metaKey ||
      (event.shiftKey && !isModifierOnly)
    );
  }
}
