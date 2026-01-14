/**
 * Bracket Type Utilities
 *
 * Provides type definitions and helper functions for bracket pair operations
 * used in the percent keybinding for bracket matching.
 */

/**
 * Represents a pair of matching brackets with their opening and closing characters.
 */
export interface BracketPair {
  /** The opening bracket character */
  open: string;
  /** The closing bracket character */
  close: string;
}

/**
 * All supported bracket pairs for matching.
 */
export const BRACKET_PAIRS: readonly BracketPair[] = [
  { open: '(', close: ')' },
  { open: '[', close: ']' },
  { open: '{', close: '}' },
  { open: '<', close: '>' },
] as const;

/**
 * Set of all opening bracket characters for quick lookup.
 */
const OPEN_BRACKETS = new Set(BRACKET_PAIRS.map((pair) => pair.open));

/**
 * Set of all closing bracket characters for quick lookup.
 */
const CLOSE_BRACKETS = new Set(BRACKET_PAIRS.map((pair) => pair.close));

/**
 * Map from opening bracket to its matching closing bracket.
 */
const OPEN_TO_CLOSE_MAP: ReadonlyMap<string, string> = new Map(
  BRACKET_PAIRS.map((pair) => [pair.open, pair.close])
);

/**
 * Map from closing bracket to its matching opening bracket.
 */
const CLOSE_TO_OPEN_MAP: ReadonlyMap<string, string> = new Map(
  BRACKET_PAIRS.map((pair) => [pair.close, pair.open])
);

/**
 * Check if a character is an opening bracket.
 *
 * @param char - The character to check
 * @returns True if the character is an opening bracket
 *
 * @example
 * ```typescript
 * isOpenBracket('(');  // true
 * isOpenBracket('[');  // true
 * isOpenBracket(')');  // false
 * isOpenBracket('a');  // false
 * ```
 */
export function isOpenBracket(char: string): boolean {
  if (char.length !== 1) {
    return false;
  }
  return OPEN_BRACKETS.has(char);
}

/**
 * Check if a character is a closing bracket.
 *
 * @param char - The character to check
 * @returns True if the character is a closing bracket
 *
 * @example
 * ```typescript
 * isCloseBracket(')');  // true
 * isCloseBracket(']');  // true
 * isCloseBracket('(');  // false
 * isCloseBracket('a');  // false
 * ```
 */
export function isCloseBracket(char: string): boolean {
  if (char.length !== 1) {
    return false;
  }
  return CLOSE_BRACKETS.has(char);
}

/**
 * Get the matching bracket character for a given bracket.
 *
 * If the input is an opening bracket, returns the corresponding closing bracket.
 * If the input is a closing bracket, returns the corresponding opening bracket.
 * Returns null for non-bracket characters.
 *
 * @param char - The bracket character to find a match for
 * @returns The matching bracket character, or null if not a bracket
 *
 * @example
 * ```typescript
 * getMatchingBracket('(');  // ')'
 * getMatchingBracket(')');  // '('
 * getMatchingBracket('[');  // ']'
 * getMatchingBracket('a');  // null
 * ```
 */
export function getMatchingBracket(char: string): string | null {
  if (char.length !== 1) {
    return null;
  }

  // Check if it's an opening bracket
  const matchingClose = OPEN_TO_CLOSE_MAP.get(char);
  if (matchingClose !== undefined) {
    return matchingClose;
  }

  // Check if it's a closing bracket
  const matchingOpen = CLOSE_TO_OPEN_MAP.get(char);
  if (matchingOpen !== undefined) {
    return matchingOpen;
  }

  return null;
}

/**
 * Get the complete bracket pair for a given bracket character.
 *
 * If the input is part of a bracket pair, returns the complete pair.
 * Returns null for non-bracket characters.
 *
 * @param char - The bracket character to get the pair for
 * @returns The bracket pair containing the character, or null if not a bracket
 *
 * @example
 * ```typescript
 * getBracketPair('(');  // { open: '(', close: ')' }
 * getBracketPair(')');  // { open: '(', close: ')' }
 * getBracketPair('[');  // { open: '[', close: ']' }
 * getBracketPair('a');  // null
 * ```
 */
export function getBracketPair(char: string): BracketPair | null {
  if (char.length !== 1) {
    return null;
  }

  // Find the pair that contains this character
  for (const pair of BRACKET_PAIRS) {
    if (pair.open === char || pair.close === char) {
      return pair;
    }
  }

  return null;
}

/**
 * Check if a character is any bracket (opening or closing).
 *
 * @param char - The character to check
 * @returns True if the character is any bracket
 *
 * @example
 * ```typescript
 * isBracket('(');  // true
 * isBracket(')');  // true
 * isBracket('a');  // false
 * ```
 */
export function isBracket(char: string): boolean {
  return isOpenBracket(char) || isCloseBracket(char);
}
