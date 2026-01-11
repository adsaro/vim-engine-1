/**
 * Simple Browser Test Runner
 * Quick way to test vim executor in a real browser with visual feedback
 */

import puppeteer from 'puppeteer';

/**
 * Creates a simple HTML page for browser testing
 */
function createTestPage(
  content: string,
  initialCursor: { line: number; column: number } = { line: 0, column: 0 }
) {
  const escapedContent = content.replace(/'/g, "\\'").replace(/\n/g, '\\n');

  return `
<!DOCTYPE html>
<html>
<head>
    <title>Vim Game Test</title>
    <style>
        body { font-family: monospace; background: #1e1e1e; color: #d4d4d4; padding: 20px; margin: 0; }
        #status { background: #252526; padding: 10px; margin-bottom: 10px; border-radius: 4px; }
        #editor { background: #1e1e1e; border: 2px solid #3c3c3c; padding: 10px; min-height: 150px; white-space: pre; line-height: 24px; font-size: 16px; }
        #log { background: #0d0d0d; padding: 10px; margin-top: 10px; max-height: 200px; overflow-y: auto; font-size: 12px; border-radius: 4px; }
        .cursor { background: #569cd6; color: white; }
        .highlight { background: rgba(86,156,214,0.1); }
        .log-entry { margin: 2px 0; }
        .key { color: #569cd6; font-weight: bold; }
        .pos { color: #4ec9b0; }
        .controls { margin-bottom: 10px; }
        button { background: #0e639c; color: white; border: none; padding: 8px 16px; margin: 5px; cursor: pointer; border-radius: 4px; }
        button:hover { background: #1177bb; }
        #instructions { background: #252526; padding: 10px; margin-bottom: 10px; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>🧪 Vim Game Browser Test</h1>
    
    <div id="instructions">
        <strong>Instructions:</strong> Press h, j, k, l keys to move cursor. 
        Check browser console for detailed logs. Click "Run Tests" for automated testing.
    </div>

    <div id="status">
        <div><strong>Mode:</strong> <span id="mode">NORMAL</span></div>
        <div><strong>Cursor:</strong> <span id="cursor">Line: 0, Col: 0</span></div>
        <div><strong>Buffer:</strong> <span id="buffer">0 lines, 0 chars</span></div>
    </div>

    <div class="controls">
        <button onclick="runTests()">Run Tests</button>
        <button onclick="clearLog()">Clear Log</button>
        <button onclick="reset()">Reset</button>
        <button onclick="showState()">Show State</button>
    </div>

    <div id="editor">Loading...</div>
    <div id="log"></div>

    <script>
        // Vim system (simplified for browser)
        class CursorPosition {
            constructor(line = 0, column = 0) {
                this.line = line;
                this.column = column;
            }
            moveLeft() { this.column = Math.max(0, this.column - 1); return this; }
            moveRight() { this.column += 1; return this; }
            moveUp() { this.line = Math.max(0, this.line - 1); return this; }
            moveDown() { this.line += 1; return this; }
            clampToBuffer(maxLine, maxColumn) {
                this.line = Math.max(0, Math.min(maxLine, this.line));
                this.column = Math.max(0, Math.min(maxColumn, this.column));
                return this;
            }
        }

        class TextBuffer {
            constructor(initialContent = '') {
                if (initialContent === '') this.lines = [];
                else {
                    const splitLines = initialContent.split('\\n');
                    if (splitLines.length > 1 && splitLines[splitLines.length - 1] === '') splitLines.pop();
                    this.lines = splitLines;
                }
            }
            getLine(lineNumber) {
                if (lineNumber < 0 || lineNumber >= this.lines.length) return null;
                return this.lines[lineNumber];
            }
            getLineCount() { return this.lines.length; }
            getTotalChars() { return this.lines.reduce((sum, line) => sum + line.length, 0); }
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
                this.cursor.clampToBuffer(maxLine, maxColumn);
            }
        }

        // Global state
        let state = new VimState('${escapedContent}');
        state.cursor.line = ${initialCursor.line};
        state.cursor.column = ${initialCursor.column};

        // Movement handlers
        const handlers = {
            'h': (s) => { s.cursor.moveLeft(); s.clampCursor(); return 'Moved left'; },
            'j': (s) => { s.cursor.moveDown(); s.clampCursor(); return 'Moved down'; },
            'k': (s) => { s.cursor.moveUp(); s.clampCursor(); return 'Moved up'; },
            'l': (s) => { s.cursor.moveRight(); s.clampCursor(); return 'Moved right'; }
        };

        function execute(key) {
            const handler = handlers[key];
            if (handler) {
                const before = { line: state.cursor.line, col: state.cursor.column };
                const result = handler(state);
                const after = { line: state.cursor.line, col: state.cursor.column };
                log(\`Key: <span class="key">\${key}</span> - \${result} - Position: <span class="pos">(\${after.line},\${after.col})</span>\`);
                console.log('Execute:', { key, before, after, result });
                return { success: true, before, after, result };
            }
            return { success: false, message: 'Unknown key' };
        }

        function log(message) {
            const logDiv = document.getElementById('log');
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            entry.innerHTML = '[' + new Date().toLocaleTimeString() + '] ' + message;
            logDiv.appendChild(entry);
            logDiv.scrollTop = logDiv.scrollHeight;
        }

        function updateUI() {
            document.getElementById('mode').textContent = state.mode;
            document.getElementById('cursor').textContent = \`Line: \${state.cursor.line}, Col: \${state.cursor.column}\`;
            document.getElementById('buffer').textContent = \`\${state.buffer.getLineCount()} lines, \${state.buffer.getTotalChars()} chars\`;

            // Render editor
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

        function clearLog() {
            document.getElementById('log').innerHTML = '';
        }

        function reset() {
            const content = prompt('Enter initial content (use \\n for newlines):', 'Line 1\\nLine 2\\nLine 3');
            if (content !== null) {
                state = new VimState(content.replace(/\\n/g, '\n'));
                state.cursor.line = 0;
                state.cursor.column = 0;
                updateUI();
                log('Reset with new content');
            }
        }

        function showState() {
            const dump = {
                mode: state.mode,
                cursor: { line: state.cursor.line, column: state.cursor.column },
                buffer: {
                    lines: state.buffer.lines,
                    lineCount: state.buffer.getLineCount(),
                    totalChars: state.buffer.getTotalChars()
                }
            };
            console.log('Current State:', dump);
            log('State dumped to console');
        }

        function runTests() {
            log('<strong>Running automated tests...</strong>');
            
            const tests = [
                { name: 'Move right 3x', content: 'Hello', keys: ['l','l','l'], expected: { line: 0, col: 3 } },
                { name: 'Move down 2x', content: 'A\\nB\\nC', keys: ['j','j'], expected: { line: 2, col: 0 } },
                { name: 'Complex move', content: 'Line1\\nLine2\\nLine3', keys: ['l','l','j','k','h'], expected: { line: 1, col: 1 } },
                { name: 'Boundary right', content: 'Hi', keys: ['l','l','l'], expected: { line: 0, col: 2 } },
                { name: 'Boundary left', content: 'Hi', keys: ['l','l','h','h','h'], expected: { line: 0, col: 0 } }
            ];

            let passed = 0;
            let failed = 0;

            tests.forEach((test, i) => {
                // Create temp state
                const tempState = new VimState(test.content);
                tempState.cursor.line = 0;
                tempState.cursor.column = 0;

                // Execute keys
                test.keys.forEach(key => {
                    const handler = handlers[key];
                    if (handler) handler(tempState);
                });

                const success = tempState.cursor.line === test.expected.line && 
                               tempState.cursor.column === test.expected.col;

                if (success) {
                    passed++;
                    log(\`✅ Test \${i+1}: \${test.name} - PASS\`);
                } else {
                    failed++;
                    log(\`❌ Test \${i+1}: \${test.name} - FAIL (got \${tempState.cursor.line},\${tempState.cursor.column})\`);
                }
            });

            log(\`<strong>Results: \${passed} passed, \${failed} failed</strong>\`);
            console.log('Test Results:', { passed, failed, total: tests.length });
        }

        // Keyboard listener
        document.addEventListener('keydown', (e) => {
            if (['h', 'j', 'k', 'l'].includes(e.key)) {
                e.preventDefault();
                execute(e.key);
                updateUI();
            }
        });

        // Initialize
        updateUI();
        log('Ready! Press h, j, k, l to move. Click "Run Tests" for automated testing.');
        console.log('Vim system ready. State:', state);
    </script>
</body>
</html>`;
}

/**
 * Run tests in browser and return results
 */
export async function runBrowserTests(
  content: string = 'Line 1\nLine 2\nLine 3',
  headless: boolean = true
) {
  console.log('🚀 Starting browser test...\n');

  const browser = await puppeteer.launch({
    headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Capture console logs
  const logs: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    logs.push(text);
    if (!headless) console.log('Browser:', text);
  });

  // Create and load test page
  const html = createTestPage(content);
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Wait for initialization
  await new Promise(resolve => setTimeout(resolve, 500));

  // Run automated tests
  const results = await page.evaluate(() => {
    return new Promise(resolve => {
      // Override log to capture results
      const originalLog = (window as any).log;
      const testResults: any[] = [];

      (window as any).log = (msg: string) => {
        testResults.push(msg);
        originalLog(msg);
      };

      // Run tests
      (window as any).runTests();

      // Wait a bit for async operations
      setTimeout(() => {
        resolve(testResults);
      }, 500);
    });
  });

  // Parse results
  const resultLines = results as string[];
  const passed = resultLines.filter(l => l.includes('PASS')).length;
  const failed = resultLines.filter(l => l.includes('FAIL')).length;

  console.log('📊 Test Results:');
  console.log('='.repeat(50));
  resultLines.forEach(line => {
    if (line.includes('PASS')) {
      console.log('✅', line.replace(/<[^>]*>/g, ''));
    } else if (line.includes('FAIL')) {
      console.log('❌', line.replace(/<[^>]*>/g, ''));
    } else if (line.includes('Results:')) {
      console.log('\n' + line.replace(/<[^>]*>/g, ''));
    }
  });
  console.log('='.repeat(50));

  // Take screenshot if not headless
  if (!headless) {
    await page.screenshot({ path: './browser-test-screenshot.png', fullPage: true });
    console.log('\n📸 Screenshot saved to: ./browser-test-screenshot.png');
  }

  await browser.close();

  return {
    passed,
    failed,
    total: passed + failed,
    logs,
    success: failed === 0,
  };
}

/**
 * Interactive mode - opens browser for manual testing
 */
export async function interactiveTest(
  content: string = 'Welcome to Vim Game!\n\nPress h, j, k, l to move.\nCheck console for logs.'
) {
  console.log('🧪 Interactive Browser Mode');
  console.log('Opening browser window...');
  console.log('Instructions:');
  console.log('  - Press h, j, k, l keys to move cursor');
  console.log('  - Check browser console for detailed logs');
  console.log('  - Click "Run Tests" button for automated testing');
  console.log('  - Close browser window or press Ctrl+C to exit\n');

  await runBrowserTests(content, false);
}

/**
 * Quick debug test - runs a specific scenario
 */
export async function debugTest(
  content: string,
  keys: string[],
  expectedLine: number,
  expectedCol: number
) {
  console.log(`🔍 Debug Test: "${content.replace(/\n/g, '\\n')}"`);
  console.log(`Keys: ${keys.join(', ')}`);
  console.log(`Expected: (${expectedLine}, ${expectedCol})\n`);

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const html = createTestPage(content);
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 300));

  // Execute keys and get final state
  const result = await page.evaluate(keysToExecute => {
    const handlers = {
      h: (s: any) => {
        s.cursor.moveLeft();
        s.clampCursor();
      },
      j: (s: any) => {
        s.cursor.moveDown();
        s.clampCursor();
      },
      k: (s: any) => {
        s.cursor.moveUp();
        s.clampCursor();
      },
      l: (s: any) => {
        s.cursor.moveRight();
        s.clampCursor();
      },
    };

    const state = (window as any).state;

    keysToExecute.forEach((key: string) => {
      const handler = handlers[key as keyof typeof handlers];
      if (handler) handler(state);
    });

    return {
      line: state.cursor.line,
      column: state.cursor.column,
      bufferLines: state.buffer.lines,
    };
  }, keys);

  await browser.close();

  const success = result.line === expectedLine && result.column === expectedCol;

  console.log(`Actual: (${result.line}, ${result.column})`);
  console.log(`Buffer: ${JSON.stringify(result.bufferLines)}`);
  console.log(`Result: ${success ? '✅ PASS' : '❌ FAIL'}\n`);

  return success;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--interactive') || args.includes('-i')) {
    interactiveTest().catch(console.error);
  } else if (args.includes('--debug') && args.length >= 5) {
    // Usage: ts-node simple-browser-test.ts --debug "content" l l j 1 2
    const content = args[1].replace(/\\n/g, '\n');
    const keys = args.slice(2, -2);
    const expectedLine = parseInt(args[args.length - 2]);
    const expectedCol = parseInt(args[args.length - 1]);
    debugTest(content, keys, expectedLine, expectedCol).catch(console.error);
  } else {
    runBrowserTests(args[0] || 'Line 1\nLine 2\nLine 3', true)
      .then(result => {
        process.exit(result.success ? 0 : 1);
      })
      .catch(console.error);
  }
}
