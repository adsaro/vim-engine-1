/**
 * VimMode - Enumerates available vim modes using hybrid approach
 *
 * This module provides a type-safe enum-like pattern for vim modes.
 * It combines a union type for TypeScript type safety with a runtime
 * constant object for validation and iteration.
 *
 * @example
 * ```typescript
 * import { VimMode, VIM_MODE, isValidVimMode } from './state/VimMode';
 *
 * // Using type for type-safe function parameters
 * function setMode(mode: VimMode): void {
 *   // mode is restricted to valid vim modes
 * }
 *
 * // Using constants for runtime values
 * setMode(VIM_MODE.NORMAL);
 * setMode(VIM_MODE.INSERT);
 *
 * // Checking validity
 * if (isValidVimMode(someString)) {
 *   setMode(someString);
 * }
 * ```
 */

/**
 * Union type representing all available vim modes
 *
 * - NORMAL: Default mode for navigation and issuing commands
 * - INSERT: Mode for inserting text
 * - VISUAL: Mode for selecting text
 * - COMMAND: Mode for entering command-line commands (starting with :)
 * - REPLACE: Mode for overwriting text
 * - SELECT: Mode for selecting text (similar to VISUAL but with different behavior)
 * - SEARCH: Mode for entering search patterns with /
 */
export type VimMode = 'NORMAL' | 'INSERT' | 'VISUAL' | 'COMMAND' | 'REPLACE' | 'SELECT' | 'SEARCH';

/**
 * Runtime constant object with all vim modes
 *
 * Used for runtime validation, iteration, and providing type-safe constants
 * that can be used in code without string literals.
 *
 * @example
 * ```typescript
 * const currentMode = VIM_MODE.NORMAL;
 * const isInsertMode = currentMode === VIM_MODE.INSERT;
 * ```
 */
export const VIM_MODE = {
  /**
   * Normal mode - default mode for navigation and commands
   */
  NORMAL: 'NORMAL' as VimMode,

  /**
   * Insert mode - for inserting text
   */
  INSERT: 'INSERT' as VimMode,

  /**
   * Visual mode - for selecting text
   */
  VISUAL: 'VISUAL' as VimMode,

  /**
   * Command mode - for command-line commands (starting with :)
   */
  COMMAND: 'COMMAND' as VimMode,

  /**
   * Replace mode - for overwriting text
   */
  REPLACE: 'REPLACE' as VimMode,

  /**
   * Select mode - for selecting text
   */
  SELECT: 'SELECT' as VimMode,

  /**
   * Search mode - for entering search patterns with /
   */
  SEARCH: 'SEARCH' as VimMode,
} as const;

/**
 * Type alias for the readonly const object
 *
 * Provides TypeScript with information about the shape of VIM_MODE,
 * enabling iteration and key lookup.
 */
export type VIM_MODE_TYPE = typeof VIM_MODE;

/**
 * Check if a given string is a valid VimMode
 *
 * Type guard function that narrows the type of a string to VimMode
 * if it matches one of the valid mode names.
 *
 * @param mode - The string to check
 * @returns {boolean} True if the string is a valid VimMode
 *
 * @example
 * ```typescript
 * const userInput = getModeFromUser();
 * if (isValidVimMode(userInput)) {
 *   // userInput is now typed as VimMode
 *   setMode(userInput);
 * } else {
 *   console.error('Invalid mode:', userInput);
 * }
 * ```
 */
export function isValidVimMode(mode: string): mode is VimMode {
  return mode in VIM_MODE;
}
