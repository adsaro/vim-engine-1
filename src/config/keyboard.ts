/**
 * Keyboard configuration - Centralized keyboard event normalization constants
 *
 * This module provides constants for normalizing keyboard events to consistent
 * vim-style keystroke representations.
 */

/**
 * Key mappings from raw DOM key values to normalized vim-style values
 */
export const KEY_NORMALIZATION_MAP: Readonly<Record<string, string>> = Object.freeze({
  // Special keys
  ' ': 'space',
  Enter: 'enter',
  Tab: 'tab',
  Escape: 'esc',
  Backspace: 'bs',
  Delete: 'del',
  Insert: 'ins',
  Home: 'home',
  End: 'end',
  PageUp: 'pageup',
  PageDown: 'pagedown',

  // Arrow keys
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',

  // Function keys
  F1: 'f1',
  F2: 'f2',
  F3: 'f3',
  F4: 'f4',
  F5: 'f5',
  F6: 'f6',
  F7: 'f7',
  F8: 'f8',
  F9: 'f9',
  F10: 'f10',
  F11: 'f11',
  F12: 'f12',

  // Modifier prefixes
  Control: 'ctrl-',
  Alt: 'alt-',
  Shift: 'shift-',
  Meta: 'cmd-',
});

/**
 * Vim-style notation mappings for special keys
 * Maps DOM key names to vim angle-bracket notation
 */
export const VIM_NOTATION_MAP: Readonly<Record<string, string>> = Object.freeze({
  Enter: '<Enter>',
  Escape: '<Esc>',
  Tab: '<Tab>',
  Backspace: '<BS>',
  ArrowUp: '<Up>',
  ArrowDown: '<Down>',
  ArrowLeft: '<Left>',
  ArrowRight: '<Right>',
  Delete: '<Del>',
  Home: '<Home>',
  End: '<End>',
  PageUp: '<PageUp>',
  PageDown: '<PageDown>',
  Insert: '<Insert>',
  PrintScreen: '<PrintScreen>',
  F1: '<F1>',
  F2: '<F2>',
  F3: '<F3>',
  F4: '<F4>',
  F5: '<F5>',
  F6: '<F6>',
  F7: '<F7>',
  F8: '<F8>',
  F9: '<F9>',
  F10: '<F10>',
  F11: '<F11>',
  F12: '<F12>',
});

/**
 * Special character escape sequences for HTML/XML contexts
 */
export const SPECIAL_CHARS: Readonly<Record<string, string>> = Object.freeze({
  '<': 'lt',
  '>': 'gt',
  '&': 'amp',
  '"': 'quot',
  "'": 'apos',
});

/**
 * Default key patterns for vim motions, operators, and modifiers
 */
export const DEFAULT_KEY_PATTERNS = Object.freeze({
  /** Basic movement keys (h, j, k, l, w, b, e, 0, gg, G) */
  movements: ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', 'gg', 'G'],
  /** Operator keys (d, c, y, r, x, p) */
  operators: ['d', 'c', 'y', 'r', 'x', 'p'],
  /** Text object modifiers (i, a, v, t, f) */
  modifiers: ['i', 'a', 'v', 't', 'f'],
}) as Readonly<{
  movements: readonly string[];
  operators: readonly string[];
  modifiers: readonly string[];
}>;

/**
 * Array of arrow key names for checking
 */
export const ARROW_KEYS: readonly string[] = Object.freeze([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
]);

/**
 * Array of navigation key names for checking
 */
export const NAVIGATION_KEYS: readonly string[] = Object.freeze([
  'Home',
  'End',
  'PageUp',
  'PageDown',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
]);

/**
 * Array of editing key names for checking
 */
export const EDITING_KEYS: readonly string[] = Object.freeze(['Backspace', 'Delete', 'Insert']);

/**
 * Array of modifier key names for checking
 */
export const MODIFIER_KEYS: readonly string[] = Object.freeze(['Control', 'Alt', 'Shift', 'Meta']);

/**
 * Modifier key to prefix mapping for vim notation
 */
export const MODIFIER_PREFIX_MAP: Readonly<Record<string, string>> = Object.freeze({
  Control: 'C',
  Alt: 'A',
  Shift: 'S',
  Meta: 'M',
});
