/**
 * Inside Curly Brace Text Object module (i{)
 *
 * Exports the InsideCurlyBraceTextObject plugin for selecting content inside curly braces.
 *
 * @example
 * ```typescript
 * import { InsideCurlyBraceTextObject } from './i-curly';
 *
 * const plugin = new InsideCurlyBraceTextObject();
 * executor.registerPlugin(plugin);
 *
 * // Use with delete operator: di{ deletes content inside curly braces
 * // Use with change operator: ci{ changes content inside curly braces
 * ```
 */
export * from './InsideCurlyBraceTextObject';
