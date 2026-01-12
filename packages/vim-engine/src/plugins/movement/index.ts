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

// Export w and w-capital with aliases to avoid naming conflicts
export { WMovementPlugin as WordMovementPlugin } from './w';
export { WMovementPlugin as CapitalWordMovementPlugin } from './w-capital';

// Export b and b-capital with aliases to avoid naming conflicts
export { BMovementPlugin as BackwardMovementPlugin } from './b';
export { BMovementPlugin as CapitalBackwardMovementPlugin } from './b-capital';
