/**
 * State module - Editor state and cursor management
 */

export * from "./VimMode";
export * from "./CursorPosition";
export * from "./TextBuffer";
export * from "./VimState";

// Export HistoryState but re-export types separately to avoid conflicts
// with VimState's RegisterContent and MarkPositionMap types
export {
  HistoryState,
  type HistoryStateOptions,
  HISTORY_CONFIG,
} from "./history/HistoryState";
export type {
  RegisterContent as HistoryRegisterContent,
  MarkPositionMap as HistoryMarkPositionMap,
} from "./history/HistoryState";
