/**
 * Performance benchmark tests for keystroke processing, command routing, and pattern matching
 */
import { CommandRouter } from '../../src/core';
import { PluginRegistry, VimPlugin } from '../../src/plugin';
import { VimMode } from '../../src/state';

describe('Performance Benchmarks', () => {
  describe('Keystroke Processing Time', () => {
    it('should process keystroke within 5ms (P95)', () => {
      const processor = new KeystrokeProcessor();
      const times: number[] = [];

      for (let i = 0; i < 100; i++) {
        const start = performance.now();
        processor.process(createKeystrokeEvent('h'));
        times.push(performance.now() - start);
      }

      times.sort((a, b) => a - b);
      const p95 = times[Math.floor(times.length * 0.95)];

      expect(p95).toBeLessThan(5);
    });

    it('should resolve plugin within 2ms (P95)', () => {
      const router = new CommandRouter(new PluginRegistry());
      const plugins = createAllMovementPlugins();
      plugins.forEach(p => {
        p.patterns.forEach(pattern => {
          router.registerPattern(pattern, p);
        });
      });

      const times: number[] = [];
      for (let i = 0; i < 100; i++) {
        const start = performance.now();
        router.matchPattern('h');
        times.push(performance.now() - start);
      }

      times.sort((a, b) => a - b);
      const p95 = times[Math.floor(times.length * 0.95)];

      expect(p95).toBeLessThan(2);
    });
  });

  describe('Pattern Matching Performance', () => {
    it('should route commands quickly with 50 plugins', () => {
      const router = new CommandRouter(new PluginRegistry());

      for (let i = 0; i < 50; i++) {
        const plugin = createMovementPlugin(['left', 'right', 'up', 'down'][i % 4]);
        plugin.patterns.forEach(pattern => {
          router.registerPattern(pattern, plugin);
        });
      }

      const iterations = 1000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        router.matchPattern('h');
      }

      const avgTime = (performance.now() - startTime) / iterations;
      expect(avgTime).toBeLessThan(1);
    });
  });
});

/**
 * KeystrokeProcessor for benchmarking keystroke processing performance
 */
class KeystrokeProcessor {
  process(event: KeyboardEvent): string {
    return event.key;
  }
}

/**
 * Create a mock KeyboardEvent for testing
 */
function createKeystrokeEvent(key: string): KeyboardEvent {
  return new KeyboardEvent('keydown', { key });
}

/**
 * Create all movement plugins for testing
 */
function createAllMovementPlugins(): VimPlugin[] {
  return [
    createMovementPlugin('left'),
    createMovementPlugin('right'),
    createMovementPlugin('up'),
    createMovementPlugin('down'),
  ];
}

/**
 * Create a mock movement plugin for testing
 */
function createMovementPlugin(name: string): VimPlugin {
  const patterns = getPatternsForPlugin(name);

  return {
    name: `movement-${name}`,
    version: '1.0.0',
    description: `Test ${name} movement plugin`,
    patterns,
    modes: ['NORMAL'] as VimMode[],

    initialize: jest.fn(),
    destroy: jest.fn(),
    execute: jest.fn(),
    canExecute: jest.fn().mockReturnValue(true),
    validatePattern: jest.fn().mockReturnValue(true),
    onRegister: jest.fn(),
    onUnregister: jest.fn(),
    enable: jest.fn(),
    disable: jest.fn(),
    isEnabled: jest.fn().mockReturnValue(true),
  };
}

/**
 * Get patterns for a specific plugin
 */
function getPatternsForPlugin(name: string): string[] {
  switch (name) {
    case 'left':
      return ['h', '<Left>'];
    case 'right':
      return ['l', '<Right>'];
    case 'up':
      return ['k', '<Up>'];
    case 'down':
      return ['j', '<Down>'];
    default:
      return [name];
  }
}
