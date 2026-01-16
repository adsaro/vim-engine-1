/**
 * Movement Plugins Index
 */
export * from './base';
export * from './h';
export * from './j';
export * from './k';
export * from './l';
export * from './e';
export * from './ge';

// Line movement plugins
export * from './0';
export * from './caret';
export * from './dollar';
export * from './g-underscore';
export * from './G';
export * from './gg';

// Bracket movement plugins
export * from './percent';

// Search movement plugins
export * from './search-forward';
export * from './search-backward';
export * from './search-input';
export * from './search-next';
export * from './search-prev';
export * from './search-word';

// Search utilities
export { SearchInputManager } from './utils/searchInputManager';
export * from './utils/searchUtils';

// Export w and w-capital with aliases to avoid naming conflicts
export { WMovementPlugin as WordMovementPlugin } from './w';
export { WMovementPlugin as CapitalWordMovementPlugin } from './w-capital';

// Export b and b-capital with aliases to avoid naming conflicts
export { BMovementPlugin as BackwardMovementPlugin } from './b';
export { BMovementPlugin as CapitalBackwardMovementPlugin } from './b-capital';
