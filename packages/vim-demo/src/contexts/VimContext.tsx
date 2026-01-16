import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  VimExecutor as VimEngine,
  VimState,
  VimMode,
  VIM_MODE,
  HMovementPlugin,
  JMovementPlugin,
  KMovementPlugin,
  LMovementPlugin,
  WordMovementPlugin,
  CapitalWordMovementPlugin,
  BackwardMovementPlugin,
  CapitalBackwardMovementPlugin,
  EMovementPlugin,
  GeMovementPlugin,
  ZeroMovementPlugin,
  CaretMovementPlugin,
  DollarMovementPlugin,
  PercentMovementPlugin,
  GUnderscoreMovementPlugin,
  GMovementPlugin,
  GGMovementPlugin,
  ExecutionContext,
  SearchPlugin,
} from '@vim-engine/core';

interface VimContextType {
  vimEngine: VimEngine | null;
  vimState: VimState;
  content: string;
  searchPattern: string;
  setContent: (content: string) => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
  handleKeystroke: (keystroke: string) => void;
  setMode: (mode: VimMode) => void;
  reset: () => void;
  handleSearchChange: (value: string) => void;
  handleSearchKeyDown: (event: React.KeyboardEvent) => void;
}

const VimContext = createContext<VimContextType | null>(null);

export function useVim(): VimContextType {
  const context = useContext(VimContext);
  if (!context) {
    throw new Error('useVim must be used within a VimProvider');
  }
  return context;
}

interface VimProviderProps {
  children: ReactNode;
  initialContent?: string;
}

export function VimProvider({ children, initialContent = '' }: VimProviderProps) {
  const [vimEngine, setVimEngine] = useState<VimEngine | null>(null);
  const [vimState, setVimState] = useState<VimState>(() => {
    const state = new VimState();
    if (initialContent) {
      state.buffer.setContent(initialContent);
    }
    return state;
  });
  const [content, setContent] = useState(initialContent);
  const [searchPattern, setSearchPattern] = useState('');

  // Initialize vim-engine
  useEffect(() => {
    // Create a shared VimState that will be used by both the context and the engine
    const sharedState = new VimState();
    if (initialContent) {
      sharedState.buffer.setContent(initialContent);
    }

    // Create ExecutionContext with the shared state
    const executionContext = new ExecutionContext(sharedState);

    // Create engine with the shared execution context
    const engine = new VimEngine(undefined, { executionContext });
    engine.initialize();

    // Register movement plugins
    engine.registerPlugin(new HMovementPlugin());
    engine.registerPlugin(new JMovementPlugin());
    engine.registerPlugin(new KMovementPlugin());
    engine.registerPlugin(new LMovementPlugin());
    engine.registerPlugin(new WordMovementPlugin());
    engine.registerPlugin(new CapitalWordMovementPlugin());
    engine.registerPlugin(new BackwardMovementPlugin());
    engine.registerPlugin(new CapitalBackwardMovementPlugin());
    engine.registerPlugin(new EMovementPlugin());
    engine.registerPlugin(new GeMovementPlugin());
    engine.registerPlugin(new ZeroMovementPlugin());
    engine.registerPlugin(new CaretMovementPlugin());
    engine.registerPlugin(new DollarMovementPlugin());
    engine.registerPlugin(new PercentMovementPlugin());
    engine.registerPlugin(new GUnderscoreMovementPlugin());
    // Document navigation plugins
    engine.registerPlugin(new GMovementPlugin());
    engine.registerPlugin(new GGMovementPlugin());

    // Register search plugin
    engine.registerPlugin(new SearchPlugin());

    engine.start();

    // Set the shared state
    setVimState(sharedState);

    setVimEngine(engine);

    return () => {
      engine.stop();
      engine.destroy();
    };
  }, [initialContent]);

  const updateState = useCallback(() => {
    if (!vimEngine) return;

    const state = vimEngine.getState();
    // Clone the state to trigger React re-render (otherwise React sees same object reference)
    const clonedState = state.clone();
    setVimState(clonedState);
    setContent(clonedState.buffer.getContent());
    setSearchPattern(clonedState.getCurrentSearchPattern());
  }, [vimEngine]);

  const handleKeystroke = useCallback(
    (keystroke: string) => {
      if (!vimEngine) return;

      vimEngine.handleKeystroke(keystroke);
      updateState();
    },
    [vimEngine, updateState]
  );

  const setMode = useCallback(
    (mode: VimMode) => {
      if (!vimEngine) return;

      vimEngine.setCurrentMode(mode);
      updateState();
    },
    [vimEngine, updateState]
  );

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!vimEngine) return;

    const currentMode = vimEngine.getCurrentMode();

    // Handle search mode keys specially
    if (currentMode === VIM_MODE.SEARCH) {
      if (event.key === 'Enter') {
        // Execute search
        vimEngine.handleKeystroke('<Enter>');
        updateState();
      } else if (event.key === 'Escape') {
        // Cancel search
        vimEngine.cancelSearch();
        updateState();
      } else if (event.key === 'Backspace') {
        // Remove last character
        vimEngine.handleKeystroke('<BS>');
        updateState();
      } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
        // Add character to search pattern
        vimEngine.addSearchCharacter(event.key);
        updateState();
      }
      
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Prevent default browser behavior for vim-like keybindings
    const ctrlKey = event.ctrlKey || event.metaKey;

    // Build keystroke representation
    let keystroke = '';
    if (event.altKey) keystroke += 'A-';
    if (ctrlKey) keystroke += 'C-';
    keystroke += event.key;

    // Process the keystroke
    vimEngine.handleKeyboardEvent(event.nativeEvent as unknown as KeyboardEvent);
    updateState();

    // Prevent default for vim keys
    const vimKeys = [
      'h',
      'j',
      'k',
      'l',
      'w',
      'b',
      'e',
      '0',
      '$',
      'gg',
      'G',
      'i',
      'a',
      'o',
      'O',
      'I',
      'A',
      'v',
      'V',
      ':',
      '/',
      '?',
      'y',
      'd',
      'c',
      'p',
      'P',
      'x',
      'X',
      'u',
      'Escape',
    ];

    if (vimKeys.some((vk) => keystroke.includes(vk)) || ctrlKey || event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
    }
  };
  // Note: Removed useCallback to see if it fixes the event handling issue

  const reset = useCallback(() => {
    if (!vimEngine) return;

    const state = vimEngine.getState();
    state.reset();
    if (initialContent) {
      state.buffer.setContent(initialContent);
    }
    updateState();
  }, [vimEngine, initialContent, updateState]);

  // Handle search pattern changes from the search input
  const handleSearchChange = useCallback(
    (value: string) => {
      if (!vimEngine) return;

      // Update the search pattern in vim state
      vimEngine.getState().setCurrentSearchPattern(value);
      updateState();
    },
    [vimEngine, updateState]
  );

  // Handle key events in search mode
  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!vimEngine) return;

      if (event.key === 'Enter') {
        // Execute search and return to normal mode
        vimEngine.executeSearch();
        vimEngine.exitSearchMode();
        updateState();
        event.preventDefault();
        event.stopPropagation();
      } else if (event.key === 'Escape') {
        // Cancel search and return to normal mode
        vimEngine.cancelSearch();
        updateState();
        event.preventDefault();
        event.stopPropagation();
      } else if (event.key === 'Backspace') {
        // Remove last character from search pattern
        vimEngine.removeSearchCharacter();
        updateState();
        // Don't prevent default - let the input handle the deletion
      }
    },
    [vimEngine, updateState]
  );

  const value: VimContextType = {
    vimEngine,
    vimState,
    content,
    searchPattern,
    setContent,
    handleKeyDown,
    handleKeystroke,
    setMode,
    reset,
    handleSearchChange,
    handleSearchKeyDown,
  };

  return <VimContext.Provider value={value}>{children}</VimContext.Provider>;
}
