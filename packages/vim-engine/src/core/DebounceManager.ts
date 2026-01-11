/**
 * DebounceManager - Manages debouncing of functions with dynamic delay configuration
 *
 * Provides a simple debounce mechanism where functions can be subscribed and
 * debounced with a configurable delay. Supports dynamic delay changes and
 * proper cleanup via destroy().
 *
 * @example
 * ```typescript
 * import { DebounceManager } from './core/DebounceManager';
 *
 * const debouncer = new DebounceManager(100);
 *
 * // Subscribe a function to be debounced
 * const unsubscribe = debouncer.subscribe(() => {
 *   console.log('Executed!');
 * });
 *
 * // Change delay dynamically
 * debouncer.setDelay(200);
 *
 * // Cleanup when done
 * debouncer.destroy();
 * ```
 */
import { Subject, Subscription, debounceTime, Observable } from 'rxjs';
import { KeystrokeEvent } from '../input';

export class DebounceManager {
  private delay: number;
  private subscriptions: Map<symbol, { fn: () => void; timer?: NodeJS.Timeout }> = new Map();
  private keystrokeSubject: Subject<KeystrokeEvent> | null = null;
  private debouncedSubject: Subject<string> | null = null;
  private rxSubscriptions: Subscription[] = [];

  /**
   * Minimum delay in milliseconds
   */
  private static readonly MIN_DELAY = 10;

  /**
   * Maximum delay in milliseconds
   */
  private static readonly MAX_DELAY = 1000;

  /**
   * Default delay in milliseconds
   */
  private static readonly DEFAULT_DELAY = 100;

  /**
   * Create a new DebounceManager instance
   *
   * @param delay - Optional delay in milliseconds. Defaults to 100ms.
   *               Will be clamped between 10ms and 1000ms.
   */
  constructor(delay: number = DebounceManager.DEFAULT_DELAY) {
    this.delay = this.clampDelay(delay);
  }

  /**
   * Clamp delay value between MIN_DELAY and MAX_DELAY
   */
  private clampDelay(delay: number): number {
    return Math.max(DebounceManager.MIN_DELAY, Math.min(DebounceManager.MAX_DELAY, delay));
  }

  /**
   * Initialize RxJS subjects (for backward compatibility)
   */
  private initRxJS(): void {
    if (!this.keystrokeSubject) {
      this.keystrokeSubject = new Subject<KeystrokeEvent>();
      this.debouncedSubject = new Subject<string>();

      const subscription = this.keystrokeSubject.pipe(debounceTime(this.delay)).subscribe({
        next: (event: KeystrokeEvent) => {
          if (this.debouncedSubject) {
            this.debouncedSubject.next(event.keystroke);
          }
        },
      });
      this.rxSubscriptions.push(subscription);
    }
  }

  /**
   * Subscribe a function to be debounced
   *
   * Returns an unsubscribe function that can be called to remove
   * the subscription and clear any pending debounce timer.
   *
   * @param fn - The function to debounce
   * @returns Unsubscribe function
   */
  subscribe(fn: () => void): () => void {
    const id = Symbol();
    const wrappedFn = () => {
      this.runWithDebounce(id, fn);
    };

    this.subscriptions.set(id, { fn: wrappedFn, timer: undefined });

    return () => {
      const sub = this.subscriptions.get(id);
      if (sub?.timer) {
        clearTimeout(sub.timer);
      }
      this.subscriptions.delete(id);
    };
  }

  /**
   * Run a function with debouncing
   */
  private runWithDebounce(id: symbol, fn: () => void): void {
    const sub = this.subscriptions.get(id);
    if (!sub) return;

    if (sub.timer) {
      clearTimeout(sub.timer);
    }

    sub.timer = setTimeout(() => {
      sub.timer = undefined;
      fn();
    }, this.delay);
  }

  /**
   * Set the debounce delay
   *
   * Changes the delay for subsequent debounced calls.
   * Existing debounced calls will use their original delay.
   *
   * @param delay - The new delay in milliseconds (clamped between 10-1000ms)
   */
  setDelay(delay: number): void {
    this.delay = this.clampDelay(delay);
  }

  /**
   * Get the current debounce delay
   */
  getDelay(): number {
    return this.delay;
  }

  /**
   * Set the debounce time (alias for setDelay - backward compatibility)
   */
  setDebounceTime(ms: number): void {
    this.setDelay(ms);
  }

  /**
   * Get the debounce time (alias for getDelay - backward compatibility)
   */
  getDebounceTime(): number {
    return this.getDelay();
  }

  // ========== Backward Compatibility Methods (RxJS-based) ==========

  /**
   * Push a keystroke event into the stream (backward compatibility)
   */
  push(event: KeystrokeEvent): void {
    this.initRxJS();
    if (this.keystrokeSubject) {
      this.keystrokeSubject.next(event);
    }
  }

  /**
   * Get the raw keystroke event stream (backward compatibility)
   */
  getStream(): Observable<KeystrokeEvent> {
    this.initRxJS();
    if (this.keystrokeSubject) {
      return this.keystrokeSubject.asObservable();
    }
    throw new Error('DebounceManager not initialized');
  }

  /**
   * Get the debounced keystroke stream (backward compatibility)
   */
  getDebouncedStream(): Observable<string> {
    this.initRxJS();
    if (this.debouncedSubject) {
      return this.debouncedSubject.asObservable();
    }
    throw new Error('DebounceManager not initialized');
  }

  /**
   * Start processing keystrokes (backward compatibility - no-op)
   */
  start(): void {
    // No-op: subjects are initialized on first use
  }

  /**
   * Stop processing keystrokes (backward compatibility - no-op)
   */
  stop(): void {
    // No-op
  }

  /**
   * Destroy the manager and clean up all resources
   */
  destroy(): void {
    // Clear all debounce timers
    this.subscriptions.forEach(sub => {
      if (sub.timer) {
        clearTimeout(sub.timer);
      }
    });
    this.subscriptions.clear();

    // Complete RxJS subjects
    if (this.keystrokeSubject) {
      this.keystrokeSubject.complete();
      this.keystrokeSubject = null;
    }
    if (this.debouncedSubject) {
      this.debouncedSubject.complete();
      this.debouncedSubject = null;
    }

    // Unsubscribe from RxJS subscriptions
    this.rxSubscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.rxSubscriptions = [];
  }
}
