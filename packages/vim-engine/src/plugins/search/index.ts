/**
 * Search Plugin - Provides vim-style search functionality
 *
 * This module exports all search-related functionality including:
 * - SearchPlugin: The main plugin for handling "/" and "?" search commands
 * - SearchState: Helper class for managing search state
 * - searchUtils: Utility functions for finding pattern matches
 *
 * @example
 * ```typescript
 * import { SearchPlugin, SearchState, findNextMatch } from '@vim-engine/core';
 *
 * // Register the search plugin
 * engine.registerPlugin(new SearchPlugin());
 *
 * // Use search utilities directly
 * const match = findNextMatch(buffer, 'hello', 0, 0);
 * ```
 */

export { SearchPlugin } from './SearchPlugin';
export { SearchState, type SearchResult } from './SearchState';
export { NMovementPlugin } from './n';
export { NMovementPlugin as NCapitalMovementPlugin } from './N-capital';
export * from './searchUtils';
