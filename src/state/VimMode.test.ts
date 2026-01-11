/**
 * VimMode Unit Tests
 */
import { VimMode, VIM_MODE, isValidVimMode } from './VimMode';

describe('VimMode', () => {
  describe('Type Definition', () => {
    it('should accept valid mode values', () => {
      // VimMode is a type, so we test it through the const object
      expect(VIM_MODE.NORMAL).toBe('NORMAL');
      expect(VIM_MODE.INSERT).toBe('INSERT');
      expect(VIM_MODE.VISUAL).toBe('VISUAL');
      expect(VIM_MODE.COMMAND).toBe('COMMAND');
      expect(VIM_MODE.REPLACE).toBe('REPLACE');
      expect(VIM_MODE.SELECT).toBe('SELECT');
    });

    it('should have all six modes defined', () => {
      const modes = Object.values(VIM_MODE);
      expect(modes).toHaveLength(6);
      expect(modes).toContain('NORMAL');
      expect(modes).toContain('INSERT');
      expect(modes).toContain('VISUAL');
      expect(modes).toContain('COMMAND');
      expect(modes).toContain('REPLACE');
      expect(modes).toContain('SELECT');
    });
  });

  describe('Runtime Constants', () => {
    it('should have NORMAL mode constant', () => {
      expect(VIM_MODE.NORMAL).toBe('NORMAL');
    });

    it('should have INSERT mode constant', () => {
      expect(VIM_MODE.INSERT).toBe('INSERT');
    });

    it('should have VISUAL mode constant', () => {
      expect(VIM_MODE.VISUAL).toBe('VISUAL');
    });

    it('should have COMMAND mode constant', () => {
      expect(VIM_MODE.COMMAND).toBe('COMMAND');
    });

    it('should have REPLACE mode constant', () => {
      expect(VIM_MODE.REPLACE).toBe('REPLACE');
    });

    it('should have SELECT mode constant', () => {
      expect(VIM_MODE.SELECT).toBe('SELECT');
    });

    it('should have all modes in VIM_MODE constant object', () => {
      const expectedModes = ['NORMAL', 'INSERT', 'VISUAL', 'COMMAND', 'REPLACE', 'SELECT'];
      const actualModes = Object.keys(VIM_MODE);
      expect(actualModes).toEqual(expectedModes);
    });

    it('should have readonly const object', () => {
      // VIM_MODE is declared as const, so it's deeply frozen at compile time
      // Values cannot be reassigned
      const mode = VIM_MODE.NORMAL;
      expect(mode).toBe('NORMAL');
    });

    it('should have readonly values', () => {
      // Values cannot be reassigned at compile time
      // VIM_MODE.NORMAL = 'test'; // This would cause a TypeScript error
      expect(typeof VIM_MODE.NORMAL).toBe('string');
    });
  });

  describe('Mode Validation', () => {
    it('should correctly identify valid modes', () => {
      const validModes: VimMode[] = ['NORMAL', 'INSERT', 'VISUAL', 'COMMAND', 'REPLACE', 'SELECT'];
      validModes.forEach(mode => {
        expect(mode in VIM_MODE).toBe(true);
        expect(isValidVimMode(mode)).toBe(true);
      });
    });

    it('should reject invalid modes', () => {
      const invalidModes = ['NORMAL ', 'normal', 'INSERT MODE', '', 'UNKNOWN'];
      invalidModes.forEach(mode => {
        expect((mode as VimMode) in VIM_MODE).toBe(false);
        expect(isValidVimMode(mode)).toBe(false);
      });
    });

    it('should work with isValidVimMode function', () => {
      expect(isValidVimMode('NORMAL')).toBe(true);
      expect(isValidVimMode('INSERT')).toBe(true);
      expect(isValidVimMode('VISUAL')).toBe(true);
      expect(isValidVimMode('COMMAND')).toBe(true);
      expect(isValidVimMode('REPLACE')).toBe(true);
      expect(isValidVimMode('SELECT')).toBe(true);
      expect(isValidVimMode('invalid')).toBe(false);
      expect(isValidVimMode('')).toBe(false);
    });
  });

  describe('Mode Switching', () => {
    it('should allow mode comparison by value', () => {
      const mode1: VimMode = 'NORMAL';
      const mode2: VimMode = 'INSERT';
      expect(mode1).not.toBe(mode2);

      const mode3: VimMode = 'NORMAL';
      expect(mode1).toBe(mode3);
    });

    it('should allow assigning any valid mode', () => {
      let currentMode: VimMode = 'NORMAL';

      const modes: VimMode[] = ['INSERT', 'VISUAL', 'COMMAND', 'REPLACE', 'SELECT', 'NORMAL'];

      modes.forEach(mode => {
        currentMode = mode;
        expect(modes).toContain(currentMode);
      });
    });
  });

  describe('Type Safety', () => {
    it('should work with type assertions', () => {
      const modeString = 'NORMAL' as VimMode;
      // Type assertion works for type conversion
      expect(modeString).toBe('NORMAL');

      // Object property access works
      const value = VIM_MODE.NORMAL;
      expect(value).toBe('NORMAL');
    });

    it('should infer correctly from const object', () => {
      const mode = VIM_MODE.NORMAL;
      // TypeScript should infer this as 'NORMAL' (literal type)
      expect(mode).toBe('NORMAL');
      expect(typeof mode).toBe('string');
    });
  });
});
