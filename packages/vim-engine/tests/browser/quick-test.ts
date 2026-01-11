#!/usr/bin/env ts-node
/**
 * Quick Browser Test - Simple and reliable browser testing
 */

import puppeteer from 'puppeteer';

/**
 * Creates a minimal test page that runs vim tests
 */
function createTestPage() {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Vim Test</title>
    <style>
        body { font-family: monospace; background: #1e1e1e; color: #d4d4d4; padding: 20px; }
        #result { background: #252526; padding: 15px; margin: 10px 0; border-radius: 4px; }
        #log { background: #0d0d0d; padding: 10px; font-size: 12px; max-height: 200px; overflow-y: auto; }
        .pass { color: #4ec9b0; }
        .fail { color: #f48771; }
        .info { color: #569cd6; }
    </style>
</head>
<body>
    <h1>Vim Game Browser Test</h1>
    <div id="result">Running tests...</div>
    <div id="log"></div>

    <script>
        // Minimal vim implementation
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

        const handlers = {
            'h': (s) => { s.cursor.moveLeft(); s.clampCursor(); },
            'j': (s) => { s.cursor.moveDown(); s.clampCursor(); },
            'k': (s) => { s.cursor.moveUp(); s.clampCursor(); },
            'l': (s) => { s.cursor.moveRight(); s.clampCursor(); }
        };

        function executeKeys(state, keys) {
            keys.forEach(key => {
                const handler = handlers[key];
                if (handler) handler(state);
            });
        }

        function runTests() {
            const tests = [
                { name: 'Right 3x', content: 'Hello', keys: ['l','l','l'], expected: { line: 0, col: 3 } },
                { name: 'Down 2x', content: 'A\\nB\\nC', keys: ['j','j'], expected: { line: 2, col: 0 } },
                { name: 'Complex', content: 'L1\\nL2\\nL3', keys: ['l','l','j','k','h'], expected: { line: 0, col: 1 } },
                { name: 'Boundary R', content: 'Hi', keys: ['l','l','l'], expected: { line: 0, col: 2 } },
                { name: 'Boundary L', content: 'Hi', keys: ['l','l','h','h','h'], expected: { line: 0, col: 0 } },
                { name: 'Boundary D', content: 'A\\nB', keys: ['j','j','j'], expected: { line: 1, col: 0 } },
                { name: 'Boundary U', content: 'A\\nB', keys: ['j','k','k'], expected: { line: 0, col: 0 } },
                { name: 'Varying', content: 'Short\\nMedium length\\nLonger', keys: ['l','l','l','l','l','j','j'], expected: { line: 2, col: 5 } },
                { name: 'Empty line', content: 'A\\n\\nC', keys: ['l','l','l','l','l','l','j','j'], expected: { line: 2, col: 1 } },
                { name: 'Single char', content: 'A', keys: ['l','l','h','h'], expected: { line: 0, col: 0 } }
            ];

            let passed = 0;
            let failed = 0;
            const log = [];

            tests.forEach((test, i) => {
                const state = new VimState(test.content);
                state.cursor.line = 0;
                state.cursor.column = 0;
                
                executeKeys(state, test.keys);
                
                const success = state.cursor.line === test.expected.line && 
                               state.cursor.column === test.expected.col;

                if (success) {
                    passed++;
                    log.push(\`✅ \${i+1}. \${test.name}\`);
                } else {
                    failed++;
                    log.push(\`❌ \${i+1}. \${test.name} (got \${state.cursor.line},\${state.cursor.column})\`);
                }
            });

            return { passed, failed, log, total: tests.length };
        }

        // Run immediately
        const results = runTests();
        
        // Update UI
        const resultDiv = document.getElementById('result');
        const logDiv = document.getElementById('log');
        
        resultDiv.innerHTML = \`
            <div><strong>Results:</strong> 
            <span class="pass">\${results.passed} passed</span>, 
            <span class="fail">\${results.failed} failed</span>, 
            \${results.total} total</div>
            <div class="\${results.failed === 0 ? 'pass' : 'fail'}">
                \${results.failed === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}
            </div>
        \`;
        
        logDiv.innerHTML = results.log.map(l => '<div>' + l + '</div>').join('');
        
        // Store results for puppeteer to read
        window.testResults = results;
        
        console.log('Test Results:', results);
    </script>
</body>
</html>`;
}

/**
 * Run browser tests and return results
 */
export async function runQuickTests(headless: boolean = true) {
  console.log('🚀 Running browser tests...\n');

  const browser = await puppeteer.launch({
    headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Capture console
  const logs: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Test Results:') || text.includes('passed') || text.includes('failed')) {
      logs.push(text);
    }
  });

  // Load test page
  const html = createTestPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Wait for tests to complete
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Get results
  const results = await page.evaluate(() => {
    return (window as any).testResults;
  });

  // Take screenshot if interactive
  if (!headless) {
    await page.screenshot({ path: './vim-test-results.png', fullPage: true });
    console.log('📸 Screenshot saved to: ./vim-test-results.png');
  }

  await browser.close();

  // Display results
  if (results) {
    console.log('📊 Test Results:');
    console.log('='.repeat(60));
    results.log.forEach((line: string) => console.log(line));
    console.log('='.repeat(60));
    console.log(`\n📈 Summary: ${results.passed}/${results.total} passed`);

    if (results.failed === 0) {
      console.log('✅ All tests passed!');
    } else {
      console.log('❌ Some tests failed!');
    }
  } else {
    console.log('❌ Failed to get test results');
  }

  return results;
}

/**
 * Run a single custom test
 */
export async function runCustomTest(
  content: string,
  keys: string[],
  expectedLine: number,
  expectedCol: number,
  headless: boolean = true
) {
  console.log(`🔍 Custom Test: "${content.replace(/\n/g, '\\n')}"`);
  console.log(`Keys: ${keys.join(', ')}`);
  console.log(`Expected: (${expectedLine}, ${expectedCol})\n`);

  const browser = await puppeteer.launch({
    headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  const html = `
<!DOCTYPE html>
<html>
<head><title>Custom Test</title></head>
<body>
    <script>
        class CursorPosition {
            constructor(line = 0, column = 0) { this.line = line; this.column = column; }
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
        }
        class VimState {
            constructor(initialContent = '') {
                this.buffer = new TextBuffer(initialContent);
                this.cursor = new CursorPosition();
            }
            clampCursor() {
                const maxLine = Math.max(0, this.buffer.getLineCount() - 1);
                const maxColumn = maxLine >= 0 ? this.buffer.getLine(maxLine).length : 0;
                this.cursor.clampToBuffer(maxLine, maxColumn);
            }
        }

        window.runCustom = (content, keys) => {
            const state = new VimState(content);
            const handlers = {
                'h': (s) => { s.cursor.moveLeft(); s.clampCursor(); },
                'j': (s) => { s.cursor.moveDown(); s.clampCursor(); },
                'k': (s) => { s.cursor.moveUp(); s.clampCursor(); },
                'l': (s) => { s.cursor.moveRight(); s.clampCursor(); }
            };
            keys.forEach(key => { const h = handlers[key]; if (h) h(state); });
            return { line: state.cursor.line, column: state.cursor.column };
        };
    </script>
</body>
</html>`;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 200));

  const result = await page.evaluate(
    (content, keys) => {
      return (window as any).runCustom(content, keys);
    },
    content,
    keys
  );

  await browser.close();

  const success = result.line === expectedLine && result.column === expectedCol;

  console.log(`Actual: (${result.line}, ${result.column})`);
  console.log(`Result: ${success ? '✅ PASS' : '❌ FAIL'}\n`);

  return success;
}

/**
 * Interactive mode
 */
export async function interactiveMode() {
  console.log('🧪 Interactive Browser Mode');
  console.log('Opening browser with test page...');
  console.log('Check the browser window and console for results.\n');

  await runQuickTests(false);
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--interactive') || args.includes('-i')) {
    interactiveMode().catch(console.error);
  } else if (args.includes('--custom') && args.length >= 5) {
    // Usage: --custom "content" key1 key2 ... expectedLine expectedCol
    const contentIndex = args.indexOf('--custom') + 1;
    const content = args[contentIndex].replace(/\\n/g, '\n');
    const keysEnd = args.length - 2;
    const keys = args.slice(contentIndex + 1, keysEnd);
    const expectedLine = parseInt(args[args.length - 2]);
    const expectedCol = parseInt(args[args.length - 1]);

    runCustomTest(content, keys, expectedLine, expectedCol, true)
      .then(success => process.exit(success ? 0 : 1))
      .catch(console.error);
  } else {
    runQuickTests(true)
      .then(results => {
        process.exit(results && results.failed === 0 ? 0 : 1);
      })
      .catch(console.error);
  }
}
