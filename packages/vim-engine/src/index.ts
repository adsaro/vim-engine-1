/**
 * Vim Game - Main Entry Point
 *
 * TypeScript-based Vim core executor with plugin-based architecture
 */

// Re-export all modules
export * from './core';
export * from './plugin';
export * from './state';
export * from './input';
export * from './plugins';

// Re-export VimExecutor as VimEngine for backwards compatibility with demo
export { VimExecutor as VimEngine } from './core/VimExecutor';
