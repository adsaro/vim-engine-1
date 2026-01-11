/**
 * DI Container Tests
 */
import { DIContainer, DI_KEYS } from './container';

describe('DIContainer', () => {
  let container: DIContainer;

  beforeEach(() => {
    container = new DIContainer();
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(container).toBeInstanceOf(DIContainer);
    });
  });

  describe('register', () => {
    it('should register a factory function', () => {
      const factory = jest.fn().mockReturnValue('test-value');
      container.register('test-key', factory);
      expect(factory).not.toHaveBeenCalled();
    });

    it('should resolve a registered factory', () => {
      const factory = jest.fn().mockReturnValue('test-value');
      container.register('test-key', factory);
      const value = container.resolve<string>('test-key');
      expect(value).toBe('test-value');
      expect(factory).toHaveBeenCalledTimes(1);
    });

    it('should call factory only once and cache result', () => {
      const factory = jest.fn().mockReturnValue('test-value');
      container.register('test-key', factory);
      container.resolve<string>('test-key');
      container.resolve<string>('test-key');
      container.resolve<string>('test-key');
      expect(factory).toHaveBeenCalledTimes(1);
    });

    it('should allow registering multiple keys', () => {
      container.register('key1', () => 'value1');
      container.register('key2', () => 'value2');
      container.register('key3', () => 'value3');

      expect(container.resolve<string>('key1')).toBe('value1');
      expect(container.resolve<string>('key2')).toBe('value2');
      expect(container.resolve<string>('key3')).toBe('value3');
    });
  });

  describe('registerInstance', () => {
    it('should register an instance directly', () => {
      const instance = { foo: 'bar' };
      container.registerInstance('my-instance', instance);
      const resolved = container.resolve<{ foo: string }>('my-instance');
      expect(resolved).toBe(instance);
    });

    it('should override factory with instance', () => {
      container.register('test-key', () => 'factory-value');
      const instance = { value: 'instance-value' };
      container.registerInstance('test-key', instance);

      const resolved = container.resolve<{ value: string }>('test-key');
      expect(resolved).toEqual(instance);
    });
  });

  describe('resolve', () => {
    it('should throw error for unregistered key', () => {
      expect(() => container.resolve('non-existent')).toThrow(
        // eslint-disable-next-line quotes
        "Dependency 'non-existent' not found"
      );
    });

    it('should resolve registered factory', () => {
      container.register('my-service', () => ({ data: 'test' }));
      const result = container.resolve<{ data: string }>('my-service');
      expect(result.data).toBe('test');
    });

    it('should resolve registered instance', () => {
      const instance = { id: 123 };
      container.registerInstance('my-instance', instance);
      const result = container.resolve<{ id: number }>('my-instance');
      expect(result).toBe(instance);
    });

    it('should resolve instance before factory', () => {
      container.register('key', () => ({ type: 'factory' }));
      container.registerInstance('key', { type: 'instance' });

      const result = container.resolve<{ type: string }>('key');
      expect(result.type).toBe('instance');
    });
  });

  describe('DI_KEYS', () => {
    it('should have PluginRegistry key', () => {
      expect(DI_KEYS.PluginRegistry).toBe('PluginRegistry');
    });

    it('should have CommandRouter key', () => {
      expect(DI_KEYS.CommandRouter).toBe('CommandRouter');
    });

    it('should have DebounceManager key', () => {
      expect(DI_KEYS.DebounceManager).toBe('DebounceManager');
    });

    it('should have ErrorHandler key', () => {
      expect(DI_KEYS.ErrorHandler).toBe('ErrorHandler');
    });

    it('should have ExecutionContext key', () => {
      expect(DI_KEYS.ExecutionContext).toBe('ExecutionContext');
    });
  });
});

describe('DIContainer - Integration', () => {
  it('should support full DI workflow', () => {
    const container = new DIContainer();

    // Register services
    container.register('ServiceA', () => ({ name: 'ServiceA', doA: () => 'A' }));
    container.register('ServiceB', () => ({ name: 'ServiceB', doB: () => 'B' }));

    // Resolve services
    const serviceA = container.resolve<{ name: string; doA: () => string }>('ServiceA');
    const serviceB = container.resolve<{ name: string; doB: () => string }>('ServiceB');

    expect(serviceA.name).toBe('ServiceA');
    expect(serviceA.doA()).toBe('A');
    expect(serviceB.name).toBe('ServiceB');
    expect(serviceB.doB()).toBe('B');
  });
});
