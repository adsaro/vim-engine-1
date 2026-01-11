/**
 * Integration Test Utilities
 * Helper functions for creating test executors and states
 */
import { VimExecutor } from '../src/core/VimExecutor';
import { VimState } from '../src/state/VimState';
import { VIM_MODE } from '../src/state/VimMode';
import { CursorPosition } from '../src/state/CursorPosition';
import { ExecutionContext } from '../src/plugin/ExecutionContext';
import { LMovementPlugin } from '../src/plugins/movement/l';
import { JMovementPlugin } from '../src/plugins/movement/j';
import { KMovementPlugin } from '../src/plugins/movement/k';
import { HMovementPlugin } from '../src/plugins/movement/h';

/**
 * Create a test executor with all movement plugins registered
 */
export function createTestExecutor(): VimExecutor {
  const executor = new VimExecutor();

  // Register all movement plugins
  executor.registerPlugin(new LMovementPlugin());
  executor.registerPlugin(new JMovementPlugin());
  executor.registerPlugin(new KMovementPlugin());
  executor.registerPlugin(new HMovementPlugin());

  return executor;
}

/**
 * Create a test VimState with the given content
 * @param content - The initial text content (lines separated by newlines)
 * @returns A VimState with the cursor in NORMAL mode at the start
 */
export function createTestState(content: string): VimState {
  const state = new VimState(content);
  state.cursor = new CursorPosition(0, 0);
  state.mode = VIM_MODE.NORMAL;
  return state;
}

/**
 * Test executor interface for integration tests
 * Provides a simplified API for testing movement operations
 */
export interface TestExecutor {
  executor: VimExecutor;
  context: ExecutionContext;

  /**
   * Set the execution context with a new state
   */
  setExecutionContext(state: VimState): void;

  /**
   * Execute a keystroke
   */
  execute(keystroke: string): void;

  /**
   * Get the current cursor line
   */
  getLine(): number;

  /**
   * Get the current cursor column
   */
  getColumn(): number;

  /**
   * Get the current state
   */
  getState(): VimState;
}

/**
 * Create a test executor with helper methods
 * This properly syncs the state with the executor's execution context
 */
export function createTestHelper(): TestExecutor {
  const executor = createTestExecutor();
  const context = executor.getExecutionContext();

  // Create initial state
  const initialState = createTestState('');
  context.setState(initialState);
  context.setMode(VIM_MODE.NORMAL);

  return {
    executor,
    context,

    setExecutionContext(state: VimState): void {
      this.context.setState(state);
      this.context.setMode(state.mode);
    },

    async execute(keystroke: string): Promise<void> {
      this.executor.handleKeystroke(keystroke);
    },

    getLine(): number {
      return this.context.getState().cursor.line;
    },

    getColumn(): number {
      return this.context.getState().cursor.column;
    },

    getState(): VimState {
      return this.context.getState();
    },
  };
}

/**
 * Set up a test executor with a given state
 * Use this function to properly attach a state to an executor's execution context
 */
export function setupExecutorWithState(executor: VimExecutor, state: VimState): void {
  const context = executor.getExecutionContext();
  context.setState(state);
  context.setMode(state.mode);
}
