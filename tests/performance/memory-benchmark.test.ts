/**
 * Memory benchmark tests for DebounceManager and VimState
 */
import { DebounceManager } from '../../src/core';
import { VimState } from '../../src/state';
import { KeystrokeEvent } from '../../src/input';

describe('Memory Benchmarks', () => {
  describe('DebounceManager Memory Usage', () => {
    it('should not leak memory with subscriptions', () => {
      const manager = new DebounceManager(100);
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 1000; i++) {
        const subscription = manager.getDebouncedStream().subscribe(() => {});
        subscription.unsubscribe();
      }

      // Force garbage collection if available
      if (typeof global !== 'undefined' && global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const growthMB = (finalMemory - initialMemory) / 1024 / 1024;

      // Allow some variance for runtime memory allocation
      expect(growthMB).toBeLessThan(2);

      manager.destroy();
    });

    it('should handle large state cloning efficiently', () => {
      const largeState = new VimState('a'.repeat(10000));
      const startTime = performance.now();
      const cloned = largeState.clone();
      const endTime = performance.now();

      // Use cloned to avoid unused variable warning
      void cloned.buffer;
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should not leak memory with event pushing', () => {
      const manager = new DebounceManager(100);
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 1000; i++) {
        const event = new KeyboardEvent('keydown', { key: 'h' });
        manager.push(new KeystrokeEvent('h', event));
      }

      // Force garbage collection if available
      if (typeof global !== 'undefined' && global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const growthMB = (finalMemory - initialMemory) / 1024 / 1024;

      expect(growthMB).toBeLessThan(10);

      manager.destroy();
    });
  });

  describe('VimState Memory Usage', () => {
    it('should handle large content cloning without excessive memory', () => {
      const largeContent = 'line\n'.repeat(1000);
      const largeState = new VimState(largeContent);

      const initialMemory = process.memoryUsage().heapUsed;
      const cloned = largeState.clone();
      const finalMemory = process.memoryUsage().heapUsed;

      // Use cloned to avoid unused variable warning
      void cloned.buffer;

      // Cloning should not use more than 5MB of additional memory
      const growthMB = (finalMemory - initialMemory) / 1024 / 1024;
      expect(growthMB).toBeLessThan(5);
    });

    it('should not leak memory with multiple clones', () => {
      const state = new VimState('test content');
      const initialMemory = process.memoryUsage().heapUsed;

      let lastClone: VimState | null = null;
      for (let i = 0; i < 100; i++) {
        lastClone = state.clone();
      }

      // Use lastClone to avoid unused variable warning
      expect(lastClone).not.toBeNull();

      // Force garbage collection if available
      if (typeof global !== 'undefined' && global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const growthMB = (finalMemory - initialMemory) / 1024 / 1024;

      // 100 clones should not use more than 2MB of additional memory
      expect(growthMB).toBeLessThan(2);
    });
  });
});
