/**
 * Browser Test Setup
 * Provides utilities for running tests in a real browser environment using Puppeteer
 */

import { VimExecutor } from '../../src/core/VimExecutor';
import { VimState } from '../../src/state/VimState';
import { VIM_MODE } from '../../src/state/VimMode';
import { HMovementPlugin } from '../../src/plugins/movement/h';
import { JMovementPlugin } from '../../src/plugins/movement/j';
import { KMovementPlugin } from '../../src/plugins/movement/k';
import { LMovementPlugin } from '../../src/plugins/movement/l';

/**
 * Creates a browser-compatible HTML page that loads and runs the vim executor
 * @param initialContent - Initial text content for the buffer
 * @returns HTML string ready for browser execution
 */
export function createBrowserTestPage(initialContent: string = ''): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vim Game Browser Test</title>
    <style>
        body { 
            font-family: monospace; 
            background: #1e1e1e; 
            color: #d4d4d4; 
            padding: 20px;
            margin: 0;
        }
        #status { 
            background: #252526; 
            padding: 10px; 
            margin-bottom: 10px; 
            border-radius: 4px;
            border: 1px solid #3c3c3c;
        }
        #editor { 
            background: #1e1e1e; 
            border: 2px solid #3c3c3c; 
            padding: 10px; 
            min-height: 200px;
            white-space: pre;
            line-height: 24px;
            font-size: 16px;
            position: relative;
        }
        .cursor { 
            background: #569cd6; 
            color: white; 
            position: absolute;
            width: 10px;
            height: 24px;
        }
        #log { 
            background: #0d0d0d; 
            padding: 10px; 
            margin-top: 10px; 
            max-height: 150px; 
            overflow-y: auto;
            font-size: 12px;
            border-radius: 4px;
            border: 1px solid #3c3c3c;
        }
        .log-entry { margin: 2px 0; }
        .success { color: #4ec9b0; }
        .error { color: #f48771; }
        .info { color: #569cd6; }
        button { 
            background: #0e639c; 
            color: white; 
            border: none; 
            padding: 8px 16px; 
            margin: 5px; 
            cursor: pointer; 
            border-radius: 4px;
        }
        button:hover { background: #1177bb; }
        .controls { margin-bottom: 10px; }
        #testResults { 
            background: #252526; 
            padding: 10px; 
            margin-top: 10px; 
            border-radius: 4px;
            border: 1px solid #3c3c3c;
        }
        .test-pass { color: #4ec9b0; }
        .test-fail { color: #f48771; }
    </style>
</head>
<body>
    <h1>Vim Game Browser Test</h1>
    
    <div id="status">
        <div><strong>Mode:</strong> <span id="mode">NORMAL</span></div>
        <div><strong>Cursor:</strong> <span id="cursor">Line: 0, Col: 0</span></div>
        <div><strong>Buffer:</strong> <span id="buffer">0 lines, 0 chars</span></div>
    </div>

    <div class="controls">
        <button onclick="runTests()">Run All Tests</button>
        <button onclick="clearLog()">Clear Log</button>
        <button onclick="resetExecutor()">Reset Executor</button>
    </div>

    <div id="editor">Loading...</div>
    <div id="log"></div>
    <div id="testResults"></div>

    <script>
        // VimExecutor will be loaded here
        let executor;
        let state;
        
        function log(message, type = 'info') {
            const logDiv = document.getElementById('log');
            const entry = document.createElement('div');
            entry.className = 'log-entry ' + type;
            entry.textContent = '[' + new Date().toLocaleTimeString() + '] ' + message;
            logDiv.appendChild(entry);
            logDiv.scrollTop = logDiv.scrollHeight;
            console.log(message);
        }

        function updateStatus() {
            if (!state) return;
            document.getElementById('mode').textContent = state.mode;
            document.getElementById('cursor').textContent = 
                'Line: ' + state.cursor.line + ', Col: ' + state.cursor.column;
            const lineCount = state.buffer.getLineCount();
            const charCount = state.buffer.getTotalChars();
            document.getElementById('buffer').textContent = 
                lineCount + ' lines, ' + charCount + ' chars';
        }

        function renderEditor() {
            if (!state) return;
            const editor = document.getElementById('editor');
            const lines = state.buffer.lines || [];
            
            if (lines.length === 0) {
                editor.innerHTML = '(empty buffer)';
                return;
            }

            let html = '';
            lines.forEach((line, lineIndex) => {
                const isActive = lineIndex === state.cursor.line;
                const lineText = line || ' ';
                
                if (isActive) {
                    const before = lineText.substring(0, state.cursor.column);
                    const at = lineText.substring(state.cursor.column, state.cursor.column + 1) || ' ';
                    const after = lineText.substring(state.cursor.column + 1);
                    
                    html += '<div style="position: relative; background: rgba(86,156,214,0.1);">';
                    html += before;
                    html += '<span style="background: #569cd6; color: white;">' + at + '</span>';
                    html += after;
                    html += '</div>';
                } else {
                    html += '<div>' + lineText + '</div>';
                }
            });
            
            editor.innerHTML = html;
        }

        function resetExecutor() {
            // This will be replaced by the actual implementation
            log('Reset requested - waiting for implementation', 'info');
        }

        function clearLog() {
            document.getElementById('log').innerHTML = '';
            document.getElementById('testResults').innerHTML = '';
        }

        function runTests() {
            if (!window.runVimTests) {
                log('Tests not available yet', 'error');
                return;
            }
            window.runVimTests();
        }

        // Initialize
        log('Browser test page loaded', 'info');
        log('Waiting for test implementation...', 'info');
    </script>
</body>
</html>`;
}

/**
 * Creates a self-contained test page with the actual vim executor code embedded
 */
export function createEmbeddedTestPage(initialContent: string = 'Line 1\nLine 2\nLine 3'): string {
  // We'll embed the compiled code or provide a way to inject it
  const basePage = createBrowserTestPage(initialContent);

  // The actual vim code will be injected at runtime
  return basePage;
}

/**
 * Test result interface
 */
export interface BrowserTestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

/**
 * Run a sequence of keystrokes and return the final state
 */
export async function simulateKeystrokes(
  initialContent: string,
  keystrokes: string[]
): Promise<{ state: VimState; results: BrowserTestResult[] }> {
  // Create executor and state
  const executor = new VimExecutor();
  const state = new VimState(initialContent);

  // Register movement plugins
  executor.registerPlugin(new HMovementPlugin());
  executor.registerPlugin(new JMovementPlugin());
  executor.registerPlugin(new KMovementPlugin());
  executor.registerPlugin(new LMovementPlugin());

  // Set up execution context
  const context = executor.getExecutionContext();
  context.setState(state);
  context.setMode(VIM_MODE.NORMAL);

  const results: BrowserTestResult[] = [];

  // Execute keystrokes
  for (const keystroke of keystrokes) {
    try {
      const beforeLine = state.cursor.line;
      const beforeCol = state.cursor.column;

      executor.handleKeystroke(keystroke);

      const afterLine = state.cursor.line;
      const afterCol = state.cursor.column;

      results.push({
        name: `Keystroke: ${keystroke}`,
        passed: true,
        message: `Moved from (${beforeLine},${beforeCol}) to (${afterLine},${afterCol})`,
        details: {
          keystroke,
          before: { line: beforeLine, col: beforeCol },
          after: { line: afterLine, col: afterCol },
        },
      });
    } catch (error) {
      results.push({
        name: `Keystroke: ${keystroke}`,
        passed: false,
        message: error instanceof Error ? error.message : String(error),
        details: { error },
      });
    }
  }

  return { state, results };
}

/**
 * Run a test scenario and return detailed results
 */
export async function runTestScenario(
  name: string,
  initialContent: string,
  keystrokes: string[],
  expectedFinalLine: number,
  expectedFinalCol: number
): Promise<BrowserTestResult> {
  const { state, results } = await simulateKeystrokes(initialContent, keystrokes);

  const actualLine = state.cursor.line;
  const actualCol = state.cursor.column;

  const passed = actualLine === expectedFinalLine && actualCol === expectedFinalCol;

  return {
    name,
    passed,
    message: passed
      ? `Expected (${expectedFinalLine},${expectedFinalCol}) - Got (${actualLine},${actualCol}) ✓`
      : `Expected (${expectedFinalLine},${expectedFinalCol}) - Got (${actualLine},${actualCol}) ✗`,
    details: {
      keystrokes,
      expected: { line: expectedFinalLine, col: expectedFinalCol },
      actual: { line: actualLine, col: actualCol },
      allResults: results,
    },
  };
}
