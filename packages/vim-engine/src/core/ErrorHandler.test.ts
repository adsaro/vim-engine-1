/**
 * ErrorHandler Tests
 */
import { ErrorHandler } from './index';

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = new ErrorHandler();
  });

  describe('constructor', () => {
    it('should create an instance without logger', () => {
      const handler = new ErrorHandler();
      expect(handler).toBeInstanceOf(ErrorHandler);
    });

    it('should create an instance with custom logger', () => {
      const mockLogger = { log: jest.fn() };
      const handler = new ErrorHandler(mockLogger);
      expect(handler).toBeInstanceOf(ErrorHandler);
    });
  });

  describe('createError', () => {
    it('should create a VimError with code and message', () => {
      const error = errorHandler.createError('PLUGIN_NOT_FOUND', 'Plugin not found: test');

      expect(error).toBeInstanceOf(Error);
      expect(error.code).toBe('PLUGIN_NOT_FOUND');
      expect(error.message).toBe('Plugin not found: test');
      expect(error.pluginName).toBeUndefined();
    });

    it('should create a VimError with plugin name', () => {
      const error = errorHandler.createError('EXECUTION_FAILED', 'Execution failed', 'TestPlugin');

      expect(error.code).toBe('EXECUTION_FAILED');
      expect(error.message).toBe('Execution failed');
      expect(error.pluginName).toBe('TestPlugin');
    });

    it('should create a VimError with original error', () => {
      const originalError = new Error('Original error');
      const error = errorHandler.createError(
        'EXECUTION_FAILED',
        'Execution failed',
        undefined,
        originalError
      );

      expect(error.originalError).toBe(originalError);
    });

    it('should create VimError for all error codes', () => {
      const errorCodes: Array<
        | 'PLUGIN_NOT_FOUND'
        | 'PLUGIN_REGISTRATION_FAILED'
        | 'PATTERN_CONFLICT'
        | 'INVALID_PATTERN'
        | 'EXECUTION_FAILED'
        | 'BUFFER_ERROR'
        | 'CURSOR_ERROR'
        | 'MODE_ERROR'
      > = [
        'PLUGIN_NOT_FOUND',
        'PLUGIN_REGISTRATION_FAILED',
        'PATTERN_CONFLICT',
        'INVALID_PATTERN',
        'EXECUTION_FAILED',
        'BUFFER_ERROR',
        'CURSOR_ERROR',
        'MODE_ERROR',
      ];

      for (const code of errorCodes) {
        const error = errorHandler.createError(code, `Test ${code}`);
        expect(error.code).toBe(code);
      }
    });
  });

  describe('isVimError', () => {
    it('should return true for VimError instances', () => {
      const vimError = errorHandler.createError('PLUGIN_NOT_FOUND', 'Test error');
      expect(errorHandler.isVimError(vimError)).toBe(true);
    });

    it('should return false for regular Error instances', () => {
      const regularError = new Error('Regular error');
      expect(errorHandler.isVimError(regularError)).toBe(false);
    });

    it('should return false for non-Error values', () => {
      expect(errorHandler.isVimError('string')).toBe(false);
      expect(errorHandler.isVimError(null)).toBe(false);
      expect(errorHandler.isVimError(undefined)).toBe(false);
      expect(errorHandler.isVimError(123)).toBe(false);
      expect(errorHandler.isVimError({})).toBe(false);
    });
  });

  describe('handle', () => {
    it('should handle VimError and log it', () => {
      const mockLogger = { log: jest.fn() };
      const handler = new ErrorHandler(mockLogger);

      const vimError = handler.createError('PLUGIN_NOT_FOUND', 'Plugin not found');
      handler.handle(vimError);

      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('PLUGIN_NOT_FOUND'));
    });

    it('should handle regular Error and convert to VimError', () => {
      const mockLogger = { log: jest.fn() };
      const handler = new ErrorHandler(mockLogger);

      const regularError = new Error('Regular error');
      handler.handle(regularError);

      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Regular error'));
    });

    it('should handle unknown errors', () => {
      const mockLogger = { log: jest.fn() };
      const handler = new ErrorHandler(mockLogger);

      handler.handle('unknown error');
      expect(mockLogger.log).toHaveBeenCalled();
    });

    it('should increment error count when handling errors', () => {
      const handler = new ErrorHandler();

      handler.handle(new Error('Error 1'));
      handler.handle(new Error('Error 2'));

      expect(handler.getErrorCount()).toBe(2);
    });
  });

  describe('handleAsync (legacy tests)', () => {
    it('should handle promise rejection', async () => {
      const mockLogger = { log: jest.fn() };
      const handler = new ErrorHandler(mockLogger);

      await expect(
        handler.handleAsync(() => Promise.reject(new Error('Async error')))
      ).rejects.toThrow('Async error');

      expect(mockLogger.log).toHaveBeenCalled();
      expect(handler.getErrorCount()).toBe(1);
    });

    it('should handle resolved promise without error', async () => {
      const mockLogger = { log: jest.fn() };
      const handler = new ErrorHandler(mockLogger);

      const result = await handler.handleAsync(() => Promise.resolve('success'));

      expect(result).toBe('success');
      expect(mockLogger.log).not.toHaveBeenCalled();
    });
  });

  describe('error listeners', () => {
    it('should add and remove error listeners', () => {
      const listener = jest.fn();

      errorHandler.addErrorListener('PLUGIN_NOT_FOUND', listener);
      errorHandler.removeErrorListener('PLUGIN_NOT_FOUND', listener);

      // Should not throw
      expect(() => errorHandler.removeErrorListener('PLUGIN_NOT_FOUND', listener)).not.toThrow();
    });

    it('should notify specific error code listeners', () => {
      const listener = jest.fn();

      errorHandler.addErrorListener('PLUGIN_NOT_FOUND', listener);

      const error = errorHandler.createError('PLUGIN_NOT_FOUND', 'Plugin not found');
      errorHandler.handle(error);

      expect(listener).toHaveBeenCalledWith(error);
    });

    it('should not notify listener for different error code', () => {
      const listener = jest.fn();

      errorHandler.addErrorListener('PLUGIN_NOT_FOUND', listener);

      const error = errorHandler.createError('EXECUTION_FAILED', 'Execution failed');
      errorHandler.handle(error);

      expect(listener).not.toHaveBeenCalled();
    });

    it('should add and notify global listeners', () => {
      const globalListener = jest.fn();

      errorHandler.addGlobalListener(globalListener);

      const error = errorHandler.createError('PLUGIN_NOT_FOUND', 'Plugin not found');
      errorHandler.handle(error);

      expect(globalListener).toHaveBeenCalledWith(error);
    });

    it('should notify multiple listeners for same error code', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      errorHandler.addErrorListener('PLUGIN_NOT_FOUND', listener1);
      errorHandler.addErrorListener('PLUGIN_NOT_FOUND', listener2);

      const error = errorHandler.createError('PLUGIN_NOT_FOUND', 'Plugin not found');
      errorHandler.handle(error);

      expect(listener1).toHaveBeenCalledWith(error);
      expect(listener2).toHaveBeenCalledWith(error);
    });
  });

  describe('getErrorCount', () => {
    it('should return initial error count of 0', () => {
      expect(errorHandler.getErrorCount()).toBe(0);
    });

    it('should return incremented error count', () => {
      errorHandler.handle(new Error('Error 1'));
      errorHandler.handle(new Error('Error 2'));

      expect(errorHandler.getErrorCount()).toBe(2);
    });
  });

  describe('clearErrorCount', () => {
    it('should reset error count to 0', () => {
      errorHandler.handle(new Error('Error 1'));
      errorHandler.handle(new Error('Error 2'));

      errorHandler.clearErrorCount();

      expect(errorHandler.getErrorCount()).toBe(0);
    });
  });

  describe('handleAsync - Type Safety', () => {
    it('should preserve return types with handleAsync', async () => {
      // Test string return
      const result1 = await errorHandler.handleAsync(async () => {
        return 'test string';
      });
      expect(result1).toBe('test string');
      expect(typeof result1).toBe('string');

      // Test number return
      const result2 = await errorHandler.handleAsync(() => {
        return 42;
      });
      expect(result2).toBe(42);
      expect(typeof result2).toBe('number');

      // Test object return
      const result3 = await errorHandler.handleAsync(async () => {
        return { foo: 'bar' };
      });
      expect(result3).toEqual({ foo: 'bar' });
    });

    it('should re-throw errors after handling', async () => {
      const testError = new Error('Test error');

      await expect(
        errorHandler.handleAsync(async () => {
          throw testError;
        })
      ).rejects.toThrow('Test error');

      // Error should have been handled
      expect(errorHandler.getErrorCount()).toBe(1);
    });

    it('should handle sync functions that throw', async () => {
      const testError = new Error('Sync error');

      await expect(
        errorHandler.handleAsync(() => {
          throw testError;
        })
      ).rejects.toThrow('Sync error');

      // Error should have been handled
      expect(errorHandler.getErrorCount()).toBe(1);
    });
  });

  describe('destroy', () => {
    it('should handle destroyed state', () => {
      errorHandler.destroy();

      expect(() => errorHandler.handle(new Error('test'))).not.toThrow();

      // Error count should not increment after destroy
      expect(errorHandler.getErrorCount()).toBe(0);
    });

    it('should clean up all listeners', () => {
      const mockListener = jest.fn();
      errorHandler.addErrorListener('PLUGIN_NOT_FOUND', mockListener);
      errorHandler.addGlobalListener(mockListener);

      errorHandler.destroy();

      // Listeners should be cleared
      errorHandler.handle(new Error('test'));

      // Listener should not have been called
      expect(mockListener).not.toHaveBeenCalled();
    });

    it('should be safe to call destroy multiple times', () => {
      expect(() => {
        errorHandler.destroy();
        errorHandler.destroy();
        errorHandler.destroy();
      }).not.toThrow();
    });
  });
});
