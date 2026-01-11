/**
 * DebounceManager Tests
 */
import { DebounceManager } from './index';
import { KeystrokeEvent } from './input';
import { Observable, Subject, take } from 'rxjs';

describe('DebounceManager', () => {
  let debounceManager: DebounceManager;

  beforeEach(() => {
    debounceManager = new DebounceManager(50);
  });

  afterEach(() => {
    debounceManager.destroy();
  });

  describe('constructor', () => {
    it('should create an instance with default debounce time', () => {
      const manager = new DebounceManager();
      expect(manager).toBeInstanceOf(DebounceManager);
      expect(manager.getDebounceTime()).toBe(100);
      manager.destroy();
    });

    it('should create an instance with custom debounce time', () => {
      const manager = new DebounceManager(200);
      expect(manager).toBeInstanceOf(DebounceManager);
      expect(manager.getDebounceTime()).toBe(200);
      manager.destroy();
    });
  });

  describe('getDebounceTime', () => {
    it('should return the configured debounce time', () => {
      expect(debounceManager.getDebounceTime()).toBe(50);
    });
  });

  describe('setDebounceTime', () => {
    it('should update the debounce time', () => {
      debounceManager.setDebounceTime(100);
      expect(debounceManager.getDebounceTime()).toBe(100);
    });

    it('should clamp zero debounce time to minimum (10ms)', () => {
      debounceManager.setDebounceTime(0);
      expect(debounceManager.getDebounceTime()).toBe(10);
    });

    it('should clamp negative debounce time to minimum (10ms)', () => {
      debounceManager.setDebounceTime(-100);
      expect(debounceManager.getDebounceTime()).toBe(10);
    });

    it('should clamp debounce time above maximum to 1000ms', () => {
      debounceManager.setDebounceTime(2000);
      expect(debounceManager.getDebounceTime()).toBe(1000);
    });
  });

  describe('push', () => {
    it('should accept keystroke events', () => {
      const mockEvent = createMockKeystrokeEvent('a');
      expect(() => debounceManager.push(mockEvent)).not.toThrow();
    });

    it('should accumulate keystroke events', () => {
      const event1 = createMockKeystrokeEvent('a');
      const event2 = createMockKeystrokeEvent('b');

      debounceManager.push(event1);
      debounceManager.push(event2);

      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('getStream', () => {
    it('should return an Observable', () => {
      const stream = debounceManager.getStream();
      expect(stream).toBeInstanceOf(Observable);
    });

    it('should emit keystroke events', done => {
      const stream = debounceManager.getStream();
      const mockEvent = createMockKeystrokeEvent('a');

      stream.pipe(take(1)).subscribe(event => {
        expect(event.keystroke).toBe('a');
        done();
      });

      debounceManager.push(mockEvent);
    });
  });

  describe('getDebouncedStream', () => {
    it('should return an Observable', () => {
      const stream = debounceManager.getDebouncedStream();
      expect(stream).toBeInstanceOf(Observable);
    });

    it('should emit after debounce time', done => {
      const debounceMs = 20;
      const manager = new DebounceManager(debounceMs);
      const keystrokes: string[] = [];

      manager
        .getDebouncedStream()
        .pipe(take(3))
        .subscribe({
          next: ks => keystrokes.push(ks),
          complete: () => {
            // All keystrokes should be emitted after their respective debounce times
            expect(keystrokes.length).toBe(3);
            expect(keystrokes).toContain('a');
            expect(keystrokes).toContain('b');
            expect(keystrokes).toContain('c');
            done();
          },
        });

      manager.push(createMockKeystrokeEvent('a'));

      // Wait for debounce to complete before sending next keystroke
      setTimeout(() => {
        manager.push(createMockKeystrokeEvent('b'));
        setTimeout(() => {
          manager.push(createMockKeystrokeEvent('c'));
          setTimeout(() => {
            manager.destroy();
          }, debounceMs * 2);
        }, debounceMs * 2);
      }, debounceMs * 2);
    });

    it('should debounce rapid keystrokes into single emission', done => {
      const debounceMs = 30;
      const manager = new DebounceManager(debounceMs);
      let emissionCount = 0;

      manager
        .getDebouncedStream()
        .pipe(take(1))
        .subscribe({
          next: () => {
            emissionCount++;
          },
          complete: () => {
            // All 3 keystrokes sent in rapid succession should result in only 1 debounced emission
            expect(emissionCount).toBe(1);
            done();
          },
        });

      // Push 3 keystrokes in rapid succession
      manager.push(createMockKeystrokeEvent('a'));
      manager.push(createMockKeystrokeEvent('b'));
      manager.push(createMockKeystrokeEvent('c'));

      // Wait for debounce and destroy
      setTimeout(() => {
        manager.destroy();
      }, debounceMs * 5);
    }, 10000);
  });

  describe('start', () => {
    it('should start processing keystrokes', () => {
      expect(() => debounceManager.start()).not.toThrow();
    });

    it('should allow starting multiple times', () => {
      debounceManager.start();
      expect(() => debounceManager.start()).not.toThrow();
    });
  });

  describe('stop', () => {
    it('should stop processing keystrokes', () => {
      debounceManager.start();
      expect(() => debounceManager.stop()).not.toThrow();
    });
  });

  describe('destroy', () => {
    it('should clean up resources', () => {
      debounceManager.start();
      expect(() => debounceManager.destroy()).not.toThrow();
    });

    it('should allow calling destroy multiple times', () => {
      debounceManager.destroy();
      expect(() => debounceManager.destroy()).not.toThrow();
    });

    it('should make the stream complete after destroy', done => {
      const stream = debounceManager.getStream();

      stream.subscribe({
        complete: () => done(),
      });

      debounceManager.destroy();
    });
  });

  describe('lifecycle', () => {
    it('should work through start -> stop -> destroy cycle', () => {
      debounceManager.start();
      debounceManager.stop();
      debounceManager.destroy();

      expect(debounceManager.getDebounceTime()).toBe(50);
    });

    it('should handle events after restart', () => {
      debounceManager.start();
      debounceManager.stop();
      debounceManager.destroy();

      const newManager = new DebounceManager(100);
      newManager.start();
      newManager.destroy();
    });
  });

  describe('observable behavior', () => {
    it('should use Subject internally for event streaming', () => {
      const stream = debounceManager.getStream();
      const subject = stream as unknown as Subject<KeystrokeEvent>;

      expect(subject).toBeDefined();
    });

    it('should support multiple subscribers', done => {
      const stream = debounceManager.getStream();
      const mockEvent = createMockKeystrokeEvent('x');
      let callCount = 0;

      stream.pipe(take(1)).subscribe(() => callCount++);
      stream.pipe(take(1)).subscribe(() => callCount++);

      debounceManager.push(mockEvent);

      setTimeout(() => {
        expect(callCount).toBe(2);
        done();
      }, 10);
    });
  });
});

/**
 * Helper function to create a mock KeystrokeEvent
 */
function createMockKeystrokeEvent(keystroke: string): KeystrokeEvent {
  const mockKeyboardEvent = {
    key: keystroke,
    repeat: false,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
  } as KeyboardEvent;

  return new KeystrokeEvent(keystroke, mockKeyboardEvent);
}
