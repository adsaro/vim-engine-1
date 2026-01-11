/**
 * ErrorHandler - Manages error handling for the vim system
 *
 * The ErrorHandler provides centralized error management for the vim system.
 * It supports:
 * - Custom error codes for different error types
 * - Error listeners by error code
 * - Global error listeners for all errors
 * - Error counting and statistics
 * - Integration with custom loggers
 *
 * @example
 * ```typescript
 * import { ErrorHandler, ErrorCode, VimError } from './core/ErrorHandler';
 *
 * const errorHandler = new ErrorHandler({
 *   log: (msg) => console.log(msg)
 * });
 *
 * // Listen for specific error codes
 * errorHandler.addErrorListener('PLUGIN_NOT_FOUND', (error) => {
 *   console.error('Plugin error:', error.message);
 * });
 *
 * // Listen for all errors
 * errorHandler.addGlobalListener((error) => {
 *   console.error('Global error:', error);
 * });
 *
 * // Create and handle errors
 * const error = errorHandler.createError(
 *   'EXECUTION_FAILED',
 *   'Failed to execute command',
 *   'movement'
 * );
 * errorHandler.handle(error);
 *
 * // Get statistics
 * console.log(`Errors: ${errorHandler.getErrorCount()}`);
 *
 * // Cleanup
 * errorHandler.destroy();
 * ```
 *
 * @see VimError For custom error class
 * @see ErrorCode For available error codes
 */

/**
 * Error codes for the vim system
 */
export type ErrorCode =
  | 'PLUGIN_NOT_FOUND'
  | 'PLUGIN_REGISTRATION_FAILED'
  | 'PATTERN_CONFLICT'
  | 'INVALID_PATTERN'
  | 'EXECUTION_FAILED'
  | 'BUFFER_ERROR'
  | 'CURSOR_ERROR'
  | 'MODE_ERROR';

/**
 * VimError - Custom error class for vim-related errors
 *
 * Extends the standard Error class with additional vim-specific properties
 * for error code, plugin name, and original error reference.
 *
 * @example
 * ```typescript
 * throw new VimError(
 *   'PLUGIN_NOT_FOUND',
 *   'Movement plugin not registered',
 *   'movement'
 * );
 * ```
 */
export class VimError extends Error {
  /**
   * The error code identifying the type of error
   */
  code: ErrorCode;

  /**
   * Optional name of the plugin that caused the error
   */
  pluginName?: string;

  /**
   * Optional reference to the original error that caused this error
   */
  originalError?: Error;

  /**
   * Create a new VimError
   *
   * @param code - The error code identifying the error type
   * @param message - Human-readable error message
   * @param pluginName - Optional name of the plugin that caused the error
   * @param originalError - Optional original error that caused this error
   */
  constructor(code: ErrorCode, message: string, pluginName?: string, originalError?: Error) {
    super(message);
    this.name = 'VimError';
    this.code = code;
    this.pluginName = pluginName;
    this.originalError = originalError;
  }
}

/**
 * Logger interface for custom logging
 */
interface Logger {
  /**
   * Log a message
   * @param msg - The message to log
   */
  log: (msg: string) => void;
}

/**
 * Error listener callback type
 */
type ErrorListener = (error: VimError) => void;

/**
 * ErrorHandler - Manages error handling for the vim system
 */
export class ErrorHandler {
  private logger: Logger | null;
  private errorListeners: Map<ErrorCode, Set<ErrorListener>> = new Map();
  private globalListeners: Set<ErrorListener> = new Set();
  private errorCount: number = 0;
  private isDestroyed: boolean = false;

  /**
   * Create a new ErrorHandler instance
   *
   * @param logger - Optional custom logger for error messages
   *
   * @example
   * ```typescript
   * // Using default (no logging)
   * const handler = new ErrorHandler();
   *
   * // With custom logger
   * const handlerWithLogger = new ErrorHandler({
   *   log: (msg) => console.log(`[ERROR] ${msg}`)
   * });
   * ```
   */
  constructor(logger?: Logger) {
    this.logger = logger ?? null;
  }

  /**
   * Create a VimError with the specified code and message
   *
   * Factory method for creating VimError instances.
   *
   * @param code - The error code
   * @param message - The error message
   * @param pluginName - Optional plugin name
   * @param originalError - Optional original error
   * @returns {VimError} The created error
   *
   * @example
   * ```typescript
   * const error = errorHandler.createError(
   *   'PLUGIN_NOT_FOUND',
   *   'Plugin "movement" not found',
   *   'core'
   * );
   * ```
   */
  createError(
    code: ErrorCode,
    message: string,
    pluginName?: string,
    originalError?: Error
  ): VimError {
    return new VimError(code, message, pluginName, originalError);
  }

  /**
   * Check if an error is a VimError
   *
   * Type guard for VimError instances.
   *
   * @param error - The error to check
   * @returns {boolean} True if the error is a VimError
   *
   * @example
   * ```typescript
   * if (errorHandler.isVimError(someError)) {
   *   console.log(someError.code);
   * }
   * ```
   */
  isVimError(error: unknown): error is VimError {
    return error instanceof VimError;
  }

  /**
   * Handle an error
   *
   * Processes an error by:
   * - Converting to VimError if necessary
   * - Incrementing error count
   * - Logging (if logger is configured)
   * - Notifying specific error code listeners
   * - Notifying global listeners
   *
   * @param error - The error to handle (VimError, Error, or unknown)
   * @returns {void}
   *
   * @example
   * ```typescript
   * // Handle VimError
   * errorHandler.handle(myVimError);
   *
   * // Handle standard Error
   * errorHandler.handle(new Error('Something went wrong'));
   *
   * // Handle unknown error
   * errorHandler.handle('Unknown error');
   * ```
   */
  handle(error: VimError | Error | unknown): void {
    if (this.isDestroyed) {
      console.warn('ErrorHandler destroyed, ignoring error');
      return;
    }

    let vimError: VimError;

    if (this.isVimError(error)) {
      vimError = error;
    } else if (error instanceof Error) {
      vimError = new VimError('EXECUTION_FAILED', error.message, undefined, error);
    } else {
      vimError = new VimError('EXECUTION_FAILED', String(error));
    }

    this.errorCount++;

    // Log the error
    if (this.logger) {
      this.logger.log(
        `[${vimError.code}] ${vimError.message}${vimError.pluginName ? ` (Plugin: ${vimError.pluginName})` : ''}`
      );
    }

    // Notify specific error code listeners
    const listeners = this.errorListeners.get(vimError.code);
    if (listeners) {
      for (const listener of listeners) {
        listener(vimError);
      }
    }

    // Notify global listeners
    for (const listener of this.globalListeners) {
      listener(vimError);
    }
  }

  /**
   * Handle an async function with error handling and type-safe return value
   *
   * Wraps an async function to handle any errors that occur during execution.
   * The error is also passed to the error listener system.
   *
   * @param fn - The async function to execute
   * @returns {Promise<T>} Promise that resolves with the function's return value
   *
   * @throws {Error} The original error is re-thrown after handling
   *
   * @example
   * ```typescript
   * const result = await errorHandler.handleAsync(async () => {
   *   return await someAsyncOperation();
   * });
   * console.log(result);
   * ```
   */
  async handleAsync<T>(fn: () => Promise<T> | T): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.handle(error as Error);
      throw error; // Re-throw for caller handling
    }
  }

  /**
   * Add an error listener for a specific error code
   *
   * @param code - The error code to listen for
   * @param listener - The callback function to invoke
   * @returns {void}
   *
   * @example
   * ```typescript
   * errorHandler.addErrorListener('PLUGIN_NOT_FOUND', (error) => {
   *   console.error('Plugin error:', error.message);
   * });
   * ```
   */
  addErrorListener(code: ErrorCode, listener: ErrorListener): void {
    const listeners = this.errorListeners.get(code);
    if (listeners) {
      listeners.add(listener);
    } else {
      this.errorListeners.set(code, new Set([listener]));
    }
  }

  /**
   * Remove an error listener for a specific error code
   *
   * @param code - The error code
   * @param listener - The listener to remove
   * @returns {void}
   *
   * @example
   * ```typescript
   * const listener = (error) => console.error(error);
   * errorHandler.addErrorListener('EXECUTION_FAILED', listener);
   * errorHandler.removeErrorListener('EXECUTION_FAILED', listener);
   * ```
   */
  removeErrorListener(code: ErrorCode, listener: ErrorListener): void {
    const listeners = this.errorListeners.get(code);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Add a global error listener that receives all errors
   *
   * @param listener - The callback function to invoke for all errors
   * @returns {void}
   *
   * @example
   * ```typescript
   * errorHandler.addGlobalListener((error) => {
   *   console.error('Global error:', error);
   * });
   * ```
   */
  addGlobalListener(listener: ErrorListener): void {
    this.globalListeners.add(listener);
  }

  /**
   * Get the current error count
   *
   * @returns {number} The number of errors handled since creation or last clear
   *
   * @example
   * ```typescript
   * console.log(`Errors: ${errorHandler.getErrorCount()}`);
   * ```
   */
  getErrorCount(): number {
    return this.errorCount;
  }

  /**
   * Clear the error count
   *
   * Resets the error counter to zero.
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * console.log(errorHandler.getErrorCount()); // 5
   * errorHandler.clearErrorCount();
   * console.log(errorHandler.getErrorCount()); // 0
   * ```
   */
  clearErrorCount(): void {
    this.errorCount = 0;
  }

  /**
   * Remove a global error listener
   *
   * @param listener - The listener to remove
   * @returns {void}
   *
   * @example
   * ```typescript
   * const globalListener = (error) => console.error(error);
   * errorHandler.addGlobalListener(globalListener);
   * errorHandler.removeGlobalListener(globalListener);
   * ```
   */
  removeGlobalListener(listener: ErrorListener): void {
    this.globalListeners.delete(listener);
  }

  /**
   * Destroy the error handler and clean up all resources
   *
   * This method:
   * - Marks the handler as destroyed (ignores subsequent errors)
   * - Clears all error code listeners
   * - Clears all global listeners
   * - Resets error count
   *
   * After calling this method, the handler should not be used.
   *
   * @returns {void}
   *
   * @example
   * ```typescript
   * errorHandler.destroy();
   * ```
   */
  destroy(): void {
    this.isDestroyed = true;
    this.errorListeners.clear();
    this.globalListeners.clear();
    this.errorCount = 0;
  }
}
