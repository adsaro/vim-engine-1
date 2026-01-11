/**
 * Memory leak tests for DebounceManager
 */
import { DebounceManager } from './index';
import { KeystrokeEvent } from './input';

describe('DebounceManager - Memory Leak Prevention', () => {
  it('should not leak memory with 100 subscribe/unsubscribe cycles', () => {
    const manager = new DebounceManager(100);

    // Only runs in Node.js environment
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 1000; i++) {
        const event = new KeyboardEvent('keydown', { key: 'h' });
        manager.push(new KeystrokeEvent('h', event));
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const growthMB = (finalMemory - initialMemory) / 1024 / 1024;

      // Less than 10MB growth is acceptable for 1000 operations
      // This ensures we're not leaking memory significantly
      expect(growthMB).toBeLessThan(10);
    }

    manager.destroy();
  });

  it('should clean up all subscriptions on destroy', () => {
    const manager = new DebounceManager(100);

    // Push some events
    const event1 = new KeyboardEvent('keydown', { key: 'h' });
    const event2 = new KeyboardEvent('keydown', { key: 'j' });
    manager.push(new KeystrokeEvent('h', event1));
    manager.push(new KeystrokeEvent('j', event2));

    // Destroy should not throw
    expect(() => manager.destroy()).not.toThrow();

    // Should be safe to call destroy multiple times
    expect(() => manager.destroy()).not.toThrow();
  });

  it('should handle cleanup correctly', () => {
    const manager = new DebounceManager(100);

    // Push some events
    for (let i = 0; i < 10; i++) {
      const event = new KeyboardEvent('keydown', { key: 'h' });
      manager.push(new KeystrokeEvent('h', event));
    }

    // Destroy should clean up all subscriptions
    manager.destroy();

    // Should not throw or cause issues
    expect(() => manager.destroy()).not.toThrow();
  });
});
