import {
  VIM_NOTATION_MAP,
  ARROW_KEYS,
  NAVIGATION_KEYS,
  EDITING_KEYS,
  MODIFIER_KEYS,
} from '../config/keyboard';

/**
 * KeyboardEventNormalizer - Normalizes keyboard events to consistent keystroke representations
 *
 * Converts Browser KeyboardEvents into vim-style keystroke strings with
 * proper notation for special keys and modifiers.
 *
 * @example
 * ```typescript
 * import { KeyboardEventNormalizer } from './input/KeyboardEventNormalizer';
 *
 * const normalizer = new KeyboardEventNormalizer();
 *
 * document.addEventListener('keydown', (event) => {
 *   const keystroke = normalizer.normalize(event);
 *   console.log('Keystroke:', keystroke);
 * });
 *
 * // Custom key mapping
 * normalizer.mapKey('PageUp', '<PageUp>');
 *
 * // Check key type
 * if (normalizer.isArrowKey(event)) {
 *   console.log('Arrow key pressed');
 * }
 * ```
 */
export class KeyboardEventNormalizer {
  private keyMappings: Map<string, string>;

  /**
   * Create a new KeyboardEventNormalizer
   */
  constructor() {
    this.keyMappings = new Map();
  }

  /**
   * Normalizes a KeyboardEvent to a vim-style keystroke string
   *
   * Handles:
   * - Regular character keys
   * - Modifier combinations (C-, A-, M-, S-)
   * - Special keys (Enter, Escape, Arrow keys, Function keys, etc.)
   * - Space key
   *
   * @param event - The keyboard event to normalize
   * @returns {string} The normalized keystroke string
   *
   * @example
   * ```typescript
   * // Regular key
   * normalize({ key: 'a', ctrlKey: false }); // 'a'
   *
   * // With Ctrl
   * normalize({ key: 'c', ctrlKey: true }); // '<C-c>'
   *
   * // Special key
   * normalize({ key: 'Enter' }); // '<Enter>'
   *
   * // With multiple modifiers
   * normalize({ key: 'x', ctrlKey: true, altKey: true }); // '<C-A-x>'
   * ```
   */
  normalize(event: KeyboardEvent): string {
    const key = event.key;

    // Handle space specially
    if (key === ' ') {
      return '<Space>';
    }

    // Handle modifier-only keys
    if (this.isModifierKey(event)) {
      return this.extractModifiers(event) + key;
    }

    // Handle single character keys
    if (key.length === 1) {
      return this.normalizeSingleCharKey(event, key);
    }

    // Handle special keys
    return this.normalizeSpecialKeyWithModifiers(event, key);
  }

  /**
   * Normalizes a single character key with modifiers
   *
   * @param event - The keyboard event
   * @param key - The single character key
   * @returns {string} The normalized keystroke
   */
  private normalizeSingleCharKey(event: KeyboardEvent, key: string): string {
    const hasNonShiftModifiers = this.hasNonShiftModifiers(event);
    const hasOnlyShift = event.shiftKey && !hasNonShiftModifiers;

    // If only shift is pressed, return the key as-is (it will be uppercase)
    if (hasOnlyShift) {
      return key;
    }

    // If we have other modifiers, build the modifier prefix
    if (hasNonShiftModifiers) {
      return this.extractModifiers(event) + key + '>';
    }

    return key;
  }

  /**
   * Normalizes a special key with modifiers
   *
   * @param event - The keyboard event
   * @param key - The special key name
   * @returns {string} The normalized keystroke
   */
  private normalizeSpecialKeyWithModifiers(event: KeyboardEvent, key: string): string {
    const hasNonShiftModifiers = this.hasNonShiftModifiers(event);

    if (hasNonShiftModifiers) {
      return this.extractModifiers(event) + this.normalizeSpecialKey(key) + '>';
    }

    if (event.shiftKey) {
      return '<S-' + this.normalizeSpecialKey(key) + '>';
    }

    return this.normalizeSpecialKey(key);
  }

  /**
   * Checks if the event has non-shift modifiers (ctrl, alt, meta)
   *
   * @param event - The keyboard event
   * @returns {boolean} True if the event has non-shift modifiers
   */
  private hasNonShiftModifiers(event: KeyboardEvent): boolean {
    return event.ctrlKey || event.altKey || event.metaKey;
  }

  /**
   * Normalizes a single key with modifier context
   *
   * @param key - The key string to normalize
   * @returns {string} The normalized keystroke
   *
   * @example
   * ```typescript
   * normalizeKey('a'); // 'a'
   * normalizeKey('Enter'); // '<Enter>'
   * normalizeKey(' '); // '<Space>'
   * ```
   */
  normalizeKey(key: string): string {
    // Check custom key mappings first
    if (this.keyMappings.has(key)) {
      return this.keyMappings.get(key)!;
    }

    // Handle space specially
    if (key === ' ') {
      return '<Space>';
    }

    // Handle single character keys
    if (key.length === 1) {
      return key;
    }

    return this.normalizeSpecialKey(key);
  }

  /**
   * Normalizes special keys to vim notation
   *
   * @param key - The special key name
   * @returns {string} The vim-style notation
   *
   * @example
   * ```typescript
   * normalizeSpecialKey('Enter'); // '<Enter>'
   * normalizeSpecialKey('ArrowUp'); // '<Up>'
   * normalizeSpecialKey('F1'); // '<F1>'
   * ```
   */
  normalizeSpecialKey(key: string): string {
    return VIM_NOTATION_MAP[key] || key;
  }

  /**
   * Extracts modifier prefix from event
   *
   * @param event - The keyboard event
   * @returns {string} The modifier prefix (e.g., '<C-A-')
   */
  private extractModifiers(event: KeyboardEvent): string {
    const parts: string[] = [];
    if (event.ctrlKey) parts.push('C');
    if (event.altKey) parts.push('A');
    if (event.shiftKey) parts.push('S');
    if (event.metaKey) parts.push('M');

    if (parts.length > 0) {
      return '<' + parts.join('-') + '-';
    }
    return '';
  }

  //
  // Key Mapping Methods
  //

  /**
   * Map a custom key to a vim-style notation
   *
   * @param from - The original key name
   * @param to - The vim-style notation
   * @returns {void}
   *
   * @example
   * ```typescript
   * normalizer.mapKey('Help', '<F1>');
   * ```
   */
  mapKey(from: string, to: string): void {
    this.keyMappings.set(from, to);
  }

  /**
   * Remove a custom key mapping
   *
   * @param key - The key to remove
   * @returns {void}
   */
  removeKeyMapping(key: string): void {
    this.keyMappings.delete(key);
  }

  /**
   * Reset all custom key mappings
   *
   * @returns {void}
   */
  resetKeyMappings(): void {
    this.keyMappings.clear();
  }

  //
  // Utility Methods
  //

  /**
   * Check if an event is from an arrow key
   *
   * @param event - The keyboard event
   * @returns {boolean} True if it's an arrow key
   */
  isArrowKey(event: KeyboardEvent): boolean {
    return ARROW_KEYS.includes(event.key);
  }

  /**
   * Check if an event is from a function key (F1-F12)
   *
   * @param event - The keyboard event
   * @returns {boolean} True if it's a function key
   */
  isFunctionKey(event: KeyboardEvent): boolean {
    return /^F\d+$/.test(event.key);
  }

  /**
   * Check if an event is from a navigation key
   *
   * Includes: Home, End, PageUp, PageDown, Arrow keys
   *
   * @param event - The keyboard event
   * @returns {boolean} True if it's a navigation key
   */
  isNavigationKey(event: KeyboardEvent): boolean {
    return NAVIGATION_KEYS.includes(event.key);
  }

  /**
   * Check if an event is from an editing key
   *
   * Includes: Backspace, Delete, Insert
   *
   * @param event - The keyboard event
   * @returns {boolean} True if it's an editing key
   */
  isEditingKey(event: KeyboardEvent): boolean {
    return EDITING_KEYS.includes(event.key);
  }

  /**
   * Check if an event is from a modifier key alone
   *
   * @param event - The keyboard event
   * @returns {boolean} True if it's a modifier-only key press
   */
  isModifierKey(event: KeyboardEvent): boolean {
    return MODIFIER_KEYS.includes(event.key);
  }
}
