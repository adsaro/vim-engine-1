/**
 * Common types used throughout the Vim Game project
 *
 * This module provides shared type definitions that are used across
 * multiple modules of the vim game system.
 */

/**
 * Represents a keystroke with its modifiers
 *
 * Used for describing keystroke input including the key character
 * and state of modifier keys.
 *
 * @example
 * ```typescript
 * const keystroke: Keystroke = {
 *   key: 'c',
 *   ctrl: true
 * };
 * ```
 */
export interface Keystroke {
  /**
   * The key character
   */
  key: string;

  /**
   * Whether Ctrl modifier is active
   */
  ctrl?: boolean;

  /**
   * Whether Alt modifier is active
   */
  alt?: boolean;

  /**
   * Whether Shift modifier is active
   */
  shift?: boolean;

  /**
   * Whether Meta (Cmd/Windows) modifier is active
   */
  meta?: boolean;
}

/**
 * Result of keystroke processing
 *
 * Contains the processed keystrokes and whether the command is complete.
 *
 * @example
 * ```typescript
 * const result: KeystrokeResult = {
 *   keystrokes: ['g', 'g'],
 *   isComplete: true
 * };
 * ```
 */
export interface KeystrokeResult {
  /**
   * Array of processed keystroke strings
   */
  keystrokes: string[];

  /**
   * Whether the command sequence is complete
   */
  isComplete: boolean;
}

/**
 * Plugin configuration options
 *
 * Base configuration that all plugins inherit.
 */
export interface PluginConfig {
  /**
   * Whether the plugin is enabled
   */
  enabled: boolean;

  /**
   * Plugin priority (higher = executed first)
   */
  priority: number;
}

/**
 * Default plugin configuration
 *
 * Used as fallback when no custom configuration is provided.
 */
export const defaultPluginConfig: PluginConfig = {
  enabled: true,
  priority: 0,
};
