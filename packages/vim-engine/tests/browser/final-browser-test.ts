#!/usr/bin/env ts-node
/**
 * Final Browser Test - Fixed version
 */

import puppeteer from 'puppeteer';

function createTestPage(): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Vim Game - Final Test</title>
    <style>
        body { font-family: monospace; background: #1e1e1e; color: #d4d4d4; padding: 20px; }
        #status { background: #252526; padding: 15px; margin-bottom: 10px; border-radius: 4px; border: 1px solid #3c3c3c; }
        #editor { background: #1e1e1e; border: 2px solid #3c3c3c; padding: 10px; min-height: 150px; white-space: pre; line-height: 24px; font-size: 16px; }
        #log { background: #0d0d0d; padding: 10px; margin-top: 10px; max-height: 200px; overflow-y: auto; font-size: 12px; border-radius: 4px; border: 1px solid #3c3c3c; }
        #results { background: #252526; padding: 15px; margin-top: 10px; border-radius: 4px; border: 1px solid #3c3c3c; }
        .cursor { background: #569cd6; color: white; }
        .highlight { background: rgba(86,156,214,0.1); }
        .pass { color: #4ec9b0; }
        .fail { color: #f48771; }
        .info { color: #569cd6; }
        .controls { margin-bottom: 10px; }
        button { background: #0e639c; color: white; border: none; padding: 8px 16px; margin: 5px; cursor: pointer; border-radius: 4px; }
        button:hover { background: #1177bb; }
        .test-item { margin: 3px 0; }
    </style>
</head>
<body>
    <h1>🧪 Vim Game - Final Browser Test</h1>
    
    <div id="status">
        <div><strong>Mode:</strong> <span id="mode">NORMAL</span></div>
        <div><strong>Cursor:</strong> <span id="cursor">Line: 0, Col: 0</span></div>
        <div><strong>Buffer:</strong> <span id="buffer">0 lines, 0 chars</span></div>
    </div>

    <div class="controls">
        <button onclick="runTests()">Run All Tests</button>
        <button onclick="clearLog()">Clear Log</button>
    </div>

    <div id="editor">Click "Run All Tests" to start</div>
    <div id="log"></div>
    <div id="results"></div>

    <script>
        // === VIM IMPLEMENTATION ===
        
        class CursorPosition {
            constructor(line = 0, column = 0) {
                this._line = Math.max(0, line);
                this._column = Math.max(0, column);
            }
            get line() { return this._line; }
            get column() { return this._column; }
            clone() { return new CursorPosition(this._line, this._column); }
        }

        class TextBuffer {
            constructor(initialContent = '') {
                if (initialContent === '') {
                    this.lines = [];
                } else {
                    const splitLines = initialContent.split('\\n');
                    if (splitLines.length > 1 && splitLines[splitLines.length - 1] === '') {
                        splitLines.pop();
                    }
                    this.lines = splitLines;
                }
            }
            getLine(lineNumber) {
                if (lineNumber < 0 || lineNumber >= this.lines.length) return null;
                return this.lines[lineNumber];
            }
            getLineCount() { return this.lines.length; }
            getTotalChars() { return this.lines.reduce((sum, line) => sum + line.length, 0); }
            isEmpty() { return this.lines.length === 0; }
        }

        class VimState {
            constructor(initialContent = '') {
                this.buffer = new TextBuffer(initialContent);
                this.cursor = new CursorPosition();
                this.mode = 'NORMAL';
            }
            clampCursor() {
                const maxLine = Math.max(0, this.buffer.getLineCount() - 1);
                const maxColumn = maxLine >= 0 ? this.buffer.getLine(maxLine).length : 0;
                const newLine = Math.max(0, Math.min(maxLine, this.cursor.line));
                const newColumn = Math.max(0, Math.min(maxColumn, this.cursor.column));
                this.cursor = new CursorPosition(newLine, newColumn);
            }
        }

        // Movement Plugins (matching real implementation)
        class HMovementPlugin {
            calculateNewPosition(cursor, buffer, config) {
                const step = config.step || 1;
                const newColumn = Math.max(0, cursor.column - step);
                return new CursorPosition(cursor.line, newColumn);
            }
        }

        class JMovementPlugin {
            calculateNewPosition(cursor, buffer, config) {
                const lineCount = buffer.getLineCount();
                if (lineCount === 0) return cursor.clone();
                
                const step = config.step || 1;
                const newLine = Math.min(lineCount - 1, cursor.line + step);
                
                const targetLine = buffer.getLine(newLine);
                const maxColumn = targetLine ? targetLine.length : 0;
                const newColumn = Math.min(cursor.column, maxColumn);
                
                return new CursorPosition(newLine, newColumn);
            }
        }

        class KMovementPlugin {
            calculateNewPosition(cursor, buffer, config) {
                const lineCount = buffer.getLineCount();
                if (lineCount === 0) return cursor.clone();
                
                const step = config.step || 1;
                const newLine = Math.max(0, cursor.line - step);
                
                const targetLine = buffer.getLine(newLine);
                const maxColumn = targetLine ? targetLine.length : 0;
                const newColumn = Math.min(cursor.column, maxColumn);
                
                return new CursorPosition(newLine, newColumn);
            }
        }

        class LMovementPlugin {
            calculateNewPosition(cursor, buffer, config) {
                const line = buffer.getLine(cursor.line);
                if (line === null) return cursor.clone();
                
                const step = config.step || 1;
                const newColumn = Math.min(line.length, cursor.column + step);
                
                return new CursorPosition(cursor.line, newColumn);
            }
        }

        class MovementPluginManager {
            constructor() {
                this.plugins = {
                    'h': new HMovementPlugin(),
                    'j': new JMovementPlugin(),
                    'k': new KMovementPlugin(),
                    'l': new LMovementPlugin()
                };
            }
            
            execute(key, state) {
                const plugin = this.plugins[key];
                if (!plugin) return false;
                
                const config = { step: 1, allowWrap: false, scrollOnEdge: false };
                const newPosition = plugin.calculateNewPosition(state.cursor, state.buffer, config);
                
                // Validate move
                const lineCount = state.buffer.getLineCount();
                if (lineCount === 0) return false;
                
                if (newPosition.line < 0 || newPosition.line >= lineCount) return false;
                
                const line = state.buffer.getLine(newPosition.line);
                if (line === null) return false;
                
                if (newPosition.column < 0 || newPosition.column > line.length) return false;
                
                state.cursor = newPosition;
                return true;
            }
        }

        // Global state
        let state = new VimState('Line 1\\nLine 2\\nLine 3');
        let pluginManager = new MovementPluginManager();

        // UI Functions
        function updateUI() {
            document.getElementById('mode').textContent = state.mode;
            document.getElementById('cursor').textContent = \`Line: \${state.cursor.line}, Col: \${state.cursor.column}\`;
            document.getElementById('buffer').textContent = \`\${state.buffer.getLineCount()} lines, \${state.buffer.getTotalChars()} chars\`;

            const editor = document.getElementById('editor');
            const lines = state.buffer.lines;
            
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
                    
                    html += '<div class="highlight">';
                    html += before;
                    html += '<span class="cursor">' + at + '</span>';
                    html += after;
                    html += '</div>';
                } else {
                    html += '<div>' + lineText + '</div>';
                }
            });
            
            editor.innerHTML = html;
        }

        function log(message, type = 'info') {
            const logDiv = document.getElementById('log');
            const entry = document.createElement('div');
            entry.className = \`test-item \${type}\`;
            entry.textContent = \`[\${new Date().toLocaleTimeString()}] \${message}\`;
            logDiv.appendChild(entry);
            logDiv.scrollTop = logDiv.scrollHeight;
            console.log(message);
        }

        function clearLog() {
            document.getElementById('log').innerHTML = '';
            document.getElementById('results').innerHTML = '';
        }

        // Test Runner
        function runTests() {
            log('Starting comprehensive test suite...', 'info');
            
            const tests = [
                { name: 'Right 3x', content: 'Hello', keys: ['l','l','l'], expected: { line: 0, col: 3 } },
                { name: 'Down 2x', content: 'A\\nB\\nC', keys: ['j','j'], expected: { line: 2, col: 0 } },
                { name: 'Complex', content: 'L1\\nL2\\nL3', keys: ['l','l','j','k','h'], expected: { line: 0, col: 1 } },
                { name: 'Boundary R', content: 'Hi', keys: ['l','l','l'], expected: { line: 0, col: 2 } },
                { name: 'Boundary L', content: 'Hi', keys: ['l','l','h','h','h'], expected: { line: 0, col: 0 } },
                { name: 'Boundary D', content: 'A\\nB', keys: ['j','j','j'], expected: { line: 1, col: 0 } },
                { name: 'Boundary U', content: 'A\\nB', keys: ['j','k','k'], expected: { line: 0, col: 0 } },
                { name: 'Varying', content: 'Short\\nMedium length\\nLonger', keys: ['l','l','l','l','l','j','j'], expected: { line: 2, col: 5 } },
                { name: 'Empty line', content: 'A\\n\\nC', keys: ['l','l','l','l','l','l','j','j'], expected: { line: 2, col: 0 } },
                { name: 'Single char', content: 'A', keys: ['l','l','h','h'], expected: { line: 0, col: 0 } }
            ];

            let passed = 0;
            let failed = 0;
            const results = [];

            tests.forEach((test, i) => {
                const testState = new VimState(test.content);
                testState.cursor = new CursorPosition(0, 0);
                
                test.keys.forEach(key => {
                    pluginManager.execute(key, testState);
                });
                
                const success = testState.cursor.line === test.expected.line && 
                               testState.cursor.column === test.expected.col;

                if (success) {
                    passed++;
                    results.push(\`✅ \${i+1}. \${test.name}\`);
                    log(\`PASS: \${test.name}\`, 'pass');
                } else {
                    failed++;
                    results.push(\`❌ \${i+1}. \${test.name} (got \${testState.cursor.line},\${testState.cursor.column})\`);
                    log(\`FAIL: \${test.name} - Expected (\${test.expected.line},\${test.expected.col}), got (\${testState.cursor.line},\${testState.cursor.column})\`, 'fail');
                }
                
                // Update global state with last test for UI
                if (i === tests.length - 1) {
                    state = testState;
                    updateUI();
                }
            });

            // Update results display
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = \`
                <div><strong>Summary:</strong> 
                <span class="pass">\${passed} passed</span>, 
                <span class="fail">\${failed} failed</span>, 
                \${tests.length} total</div>
                <div class="\${failed === 0 ? 'pass' : 'fail'}" style="margin-top: 10px; font-weight: bold;">
                    \${failed === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}
                </div>
                <div style="margin-top: 10px; font-family: monospace;">
                    \${results.map(r => '<div>' + r + '</div>').join('')}
                </div>
            \`;

            // Store for puppeteer
            window.testResults = { passed, failed, total: tests.length, results };
            console.log('Test Results:', window.testResults);
        }

        // Keyboard listener
        document.addEventListener('keydown', (e) => {
            if (['h', 'j', 'k', 'l'].includes(e.key)) {
                e.preventDefault();
                if (pluginManager.execute(e.key, state)) {
                    updateUI();
                    log(\`Key: \${e.key} -> Position: \${state.cursor.toString()}\`, 'info');
                }
            }
        });

        // Initialize
        updateUI();
        log('Ready! Click "Run All Tests" or press h, j, k, l to move manually.', 'info');
    </script>
</body>
</html>`;
}

async function runTests(headless: boolean = true) {
  console.log('🚀 Running final browser tests...\n');

  const browser = await puppeteer.launch({
    headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  const html = createTestPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 500));

  const results = await page.evaluate(() => {
    return new Promise(resolve => {
      (window as any).runTests();
      setTimeout(() => resolve((window as any).testResults), 1000);
    });
  });

  if (!headless) {
    await page.screenshot({ path: './final-test-results.png', fullPage: true });
    console.log('📸 Screenshot saved to: ./final-test-results.png');
  }

  await browser.close();

  if (results) {
    console.log('📊 Final Browser Test Results:');
    console.log('='.repeat(60));
    (results as any).results.forEach((line: string) => console.log(line));
    console.log('='.repeat(60));
    console.log(`\n📈 Summary: ${(results as any).passed}/${(results as any).total} passed`);

    if ((results as any).failed === 0) {
      console.log('✅ All tests passed! Movement logic is working correctly.');
    } else {
      console.log('❌ Some tests failed - check the implementation.');
    }
  } else {
    console.log('❌ Failed to get test results');
  }

  return results;
}

async function interactiveTest() {
  console.log('🧪 Interactive Final Test Mode');
  console.log('Opening browser...');
  await runTests(false);
}

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--interactive') || args.includes('-i')) {
    interactiveTest().catch(console.error);
  } else {
    runTests(true)
      .then(results => {
        const success = results && (results as any).failed === 0;
        process.exit(success ? 0 : 1);
      })
      .catch(console.error);
  }
}

export { runTests, interactiveTest };
