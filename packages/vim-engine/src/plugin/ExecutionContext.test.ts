/**
 * ExecutionContext Tests
 */
import { ExecutionContext } from './plugin/ExecutionContext';
import { VimState, TextBuffer, CursorPosition, VimMode, VIM_MODE } from '../state/index';

describe('ExecutionContext', () => {
  describe('constructor', () => {
    it('should create an instance with a VimState', () => {
      const state = new VimState('test content');
      const context = new ExecutionContext(state);

      expect(context).toBeInstanceOf(ExecutionContext);
    });

    it('should create an instance with empty state by default', () => {
      const context = new ExecutionContext();

      expect(context).toBeInstanceOf(ExecutionContext);
    });

    it('should accept a TextBuffer as initial state', () => {
      const buffer = new TextBuffer('line1\nline2');
      const context = new ExecutionContext(new VimState(buffer));

      expect(context).toBeInstanceOf(ExecutionContext);
    });
  });

  describe('getState and setState', () => {
    it('should return the current state', () => {
      const state = new VimState('initial content');
      const context = new ExecutionContext(state);

      const retrievedState = context.getState();

      expect(retrievedState).toBe(state);
    });

    it('should allow setting a new state', () => {
      const initialState = new VimState('initial');
      const newState = new VimState('new content');
      const context = new ExecutionContext(initialState);

      context.setState(newState);

      expect(context.getState()).toBe(newState);
    });
  });

  describe('getBuffer and setBuffer', () => {
    it('should return the current buffer', () => {
      const state = new VimState('test content\nline 2');
      const context = new ExecutionContext(state);

      const buffer = context.getBuffer();

      expect(buffer).toBeInstanceOf(TextBuffer);
      expect(buffer.getContent()).toBe('test content\nline 2');
    });

    it('should allow setting a new buffer', () => {
      const context = new ExecutionContext();
      const newBuffer = new TextBuffer('new buffer content');

      context.setBuffer(newBuffer);

      expect(context.getBuffer().getContent()).toBe('new buffer content');
    });
  });

  describe('getCursor and setCursor', () => {
    it('should return the current cursor position', () => {
      const state = new VimState('test');
      const context = new ExecutionContext(state);

      const cursor = context.getCursor();

      expect(cursor).toBeInstanceOf(CursorPosition);
      expect(cursor.line).toBe(0);
      expect(cursor.column).toBe(0);
    });

    it('should allow setting a new cursor position', () => {
      const context = new ExecutionContext();
      const newCursor = new CursorPosition(5, 10);

      context.setCursor(newCursor);

      const cursor = context.getCursor();
      expect(cursor.line).toBe(5);
      expect(cursor.column).toBe(10);
    });
  });

  describe('moveCursor', () => {
    it('should move cursor by specified delta', () => {
      const state = new VimState('line1\nline2\nline3');
      const context = new ExecutionContext(state);

      context.moveCursor(1, 2);

      const cursor = context.getCursor();
      expect(cursor.line).toBe(1);
      expect(cursor.column).toBe(2);
    });

    it('should move cursor with negative deltas', () => {
      const state = new VimState('line1\nline2');
      state.cursor = new CursorPosition(5, 5);
      const context = new ExecutionContext(state);

      context.moveCursor(-2, -3);

      const cursor = context.getCursor();
      expect(cursor.line).toBe(3);
      expect(cursor.column).toBe(2);
    });
  });

  describe('getMode and setMode', () => {
    it('should return the current mode', () => {
      const state = new VimState('test');
      state.mode = VIM_MODE.INSERT;
      const context = new ExecutionContext(state);

      const mode = context.getMode();

      expect(mode).toBe('INSERT');
    });

    it('should allow setting a new mode', () => {
      const context = new ExecutionContext();

      context.setMode(VIM_MODE.VISUAL);

      expect(context.getMode()).toBe('VISUAL');
    });

    it('should support all vim modes', () => {
      const context = new ExecutionContext();
      const modes: VimMode[] = ['NORMAL', 'INSERT', 'VISUAL', 'COMMAND', 'REPLACE', 'SELECT'];

      modes.forEach(mode => {
        context.setMode(mode);
        expect(context.getMode()).toBe(mode);
      });
    });
  });

  describe('isMode', () => {
    it('should return true when current mode matches', () => {
      const state = new VimState('test');
      state.mode = VIM_MODE.NORMAL;
      const context = new ExecutionContext(state);

      expect(context.isMode('NORMAL')).toBe(true);
      expect(context.isMode(VIM_MODE.NORMAL)).toBe(true);
    });

    it('should return false when current mode does not match', () => {
      const state = new VimState('test');
      state.mode = VIM_MODE.NORMAL;
      const context = new ExecutionContext(state);

      expect(context.isMode('INSERT')).toBe(false);
      expect(context.isMode(VIM_MODE.INSERT)).toBe(false);
      expect(context.isMode('VISUAL')).toBe(false);
    });
  });

  describe('register access', () => {
    describe('getRegister', () => {
      it('should return null for non-existent register', () => {
        const context = new ExecutionContext();

        expect(context.getRegister('a')).toBeNull();
        expect(context.getRegister('b')).toBeNull();
      });

      it('should return register content when it exists', () => {
        const state = new VimState('test');
        state.registers['a'] = ' yanked text';
        const context = new ExecutionContext(state);

        expect(context.getRegister('a')).toBe(' yanked text');
      });
    });

    describe('setRegister', () => {
      it('should set register value', () => {
        const context = new ExecutionContext();

        context.setRegister('a', 'test value');

        expect(context.getRegister('a')).toBe('test value');
      });

      it('should overwrite existing register value', () => {
        const context = new ExecutionContext();

        context.setRegister('a', 'first value');
        context.setRegister('a', 'second value');

        expect(context.getRegister('a')).toBe('second value');
      });
    });

    describe('yankToRegister', () => {
      it('should yank text to register', () => {
        const context = new ExecutionContext();

        context.yankToRegister('a', 'yanked text');

        expect(context.getRegister('a')).toBe('yanked text');
      });

      it('should handle multi-line text', () => {
        const context = new ExecutionContext();

        context.yankToRegister('b', 'line1\nline2\nline3');

        expect(context.getRegister('b')).toBe('line1\nline2\nline3');
      });
    });
  });

  describe('clipboard access', () => {
    it('should return empty clipboard by default', () => {
      const context = new ExecutionContext();

      expect(context.getClipboard()).toBe('');
    });

    it('should return clipboard content', () => {
      const context = new ExecutionContext();

      context.setClipboard('clipboard text');

      expect(context.getClipboard()).toBe('clipboard text');
    });
  });

  describe('clone', () => {
    it('should create a deep copy of the context', () => {
      const state = new VimState('test content');
      const context = new ExecutionContext(state);

      const cloned = context.clone();

      expect(cloned).not.toBe(context);
      expect(cloned.getState()).not.toBe(state);
      expect(cloned.getState().buffer.getContent()).toBe('test content');
    });

    it('should have independent state after clone', () => {
      const state = new VimState('original');
      const context = new ExecutionContext(state);

      const cloned = context.clone();
      cloned.getState().buffer.setContent('modified');

      expect(context.getState().buffer.getContent()).toBe('original');
      expect(cloned.getState().buffer.getContent()).toBe('modified');
    });
  });

  describe('getCurrentLine', () => {
    it('should return the current line content', () => {
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(1, 2);
      const context = new ExecutionContext(state);

      const currentLine = context.getCurrentLine();

      expect(currentLine).toBe('line2');
    });

    it('should return empty string for empty buffer', () => {
      const context = new ExecutionContext();

      const currentLine = context.getCurrentLine();

      expect(currentLine).toBe('');
    });
  });

  describe('getLineNumber', () => {
    it('should return the current line number', () => {
      const state = new VimState('line1\nline2\nline3');
      state.cursor = new CursorPosition(2, 0);
      const context = new ExecutionContext(state);

      const lineNumber = context.getLineNumber();

      expect(lineNumber).toBe(2);
    });

    it('should return 0 for cursor at first line', () => {
      const state = new VimState('first line');
      state.cursor = new CursorPosition(0, 0);
      const context = new ExecutionContext(state);

      const lineNumber = context.getLineNumber();

      expect(lineNumber).toBe(0);
    });
  });
});
