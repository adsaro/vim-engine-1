/**
 * Word Boundary Utilities
 *
 * Provides character classification and word boundary detection functions
 * for movement plugin operations.
 */

/**
 * Character classification types
 */
export type CharType = 'word' | 'whitespace' | 'punctuation' | 'other';

/**
 * Get character type
 *
 * Returns the character type as a string:
 * - 'whitespace': Whitespace characters
 * - 'word': Word characters (alphanumeric + underscore)
 * - 'punctuation': Punctuation/symbol characters
 *
 * @param char - The character to classify
 * @returns The character type ('word', 'whitespace', or 'punctuation')
 *
 * @example
 * ```typescript
 * getCharType('a');  // 'word'
 * getCharType(' ');  // 'whitespace'
 * getCharType('.');  // 'punctuation'
 * ```
 */
export function getCharType(char: string): CharType {
  if (/\s/.test(char)) return 'whitespace';
  if (/[\w]/.test(char)) return 'word'; // \w matches [A-Za-z0-9_]
  return 'punctuation';
}

/**
 * Check if a character is a word character
 *
 * Word characters are alphanumeric characters (a-z, A-Z, 0-9) and underscore (_).
 *
 * @param char - The character to check
 * @returns True if the character is a word character
 *
 * @example
 * ```typescript
 * isWordChar('a');  // true
 * isWordChar('Z');  // true
 * isWordChar('5');  // true
 * isWordChar('_');  // true
 * isWordChar(' ');  // false
 * isWordChar('.');  // false
 * ```
 */
export function isWordChar(char: string): boolean {
  if (char.length !== 1) {
    return false;
  }
  return getCharType(char) === 'word';
}

/**
 * Check if a character is whitespace
 *
 * Whitespace includes spaces, tabs, and other Unicode whitespace characters.
 *
 * @param char - The character to check
 * @returns True if the character is whitespace
 *
 * @example
 * ```typescript
 * isWhitespace(' ');   // true
 * isWhitespace('\t');  // true
 * isWhitespace('\n');  // true
 * isWhitespace('a');   // false
 * ```
 */
export function isWhitespace(char: string): boolean {
  if (char.length !== 1) {
    return false;
  }
  return getCharType(char) === 'whitespace';
}

/**
 * Check if a character is punctuation
 *
 * Punctuation characters are non-word, non-whitespace characters.
 *
 * @param char - The character to check
 * @returns True if the character is punctuation
 *
 * @example
 * ```typescript
 * isPunctuation('.');  // true
 * isPunctuation(',');  // true
 * isPunctuation('!');  // true
 * isPunctuation('a');  // false
 * isPunctuation(' ');  // false
 * ```
 */
export function isPunctuation(char: string): boolean {
  if (char.length !== 1) {
    return false;
  }
  return getCharType(char) === 'punctuation';
}

/**
 * Classify a character type
 *
 * @param char - The character to classify
 * @returns The character type: 'word', 'whitespace', 'punctuation', or 'other'
 *
 * @example
 * ```typescript
 * classifyChar('a');   // 'word'
 * classifyChar(' ');   // 'whitespace'
 * classifyChar('.');   // 'punctuation'
 * ```
 */
export function classifyChar(char: string): CharType {
  if (char.length !== 1) {
    return 'other';
  }
  return getCharType(char);
}

/**
 * Find the start of the next word
 *
 * Searches forward from the given column position to find the start
 * of the next word. A word is defined as a sequence of word characters
 * preceded by either whitespace or the start of the line.
 *
 * @param line - The line content to search
 * @param column - The starting column position
 * @returns The column index of the next word start, or null if not found
 *
 * @example
 * ```typescript
 * findNextWordStart('hello world', 0);  // 6 (start of 'world')
 * findNextWordStart('hello world', 6);  // null (no more words)
 * findNextWordStart('hello   world', 5); // 8 (start of 'world')
 * ```
 */
export function findNextWordStart(
  line: string,
  column: number,
  rolling: boolean = false
): number | null {
  const length = line.length;
  if (column < 0 || (column >= length && !rolling)) {
    return null;
  }

  let i = column;

  // Check what type of character we're on
  const charType = getCharType(line[i]);

  if (charType === 'word') {
    if (rolling) {
      return i;
    }
    // On a word character - skip to end of word, then skip spaces and punctuation, return first word character
    while (i < length && getCharType(line[i]) === 'word') {
      i++;
    }
    // Skip whitespace
    while (i < length && getCharType(line[i]) === 'whitespace') {
      i++;
    }
    // Return first word character (which is the beginning of the next word)
    return i < length ? i : null;
  } else if (charType === 'punctuation') {
    if (rolling) {
      return i;
    }
    // On punctuation - skip it (don't stop at punctuation)
    while (i < length && getCharType(line[i]) === 'punctuation') {
      i++;
    }
    // Skip whitespace
    while (i < length && getCharType(line[i]) === 'whitespace') {
      i++;
    }
    // Return first word character
    return i < length ? i : null;
  } else {
    // On whitespace - skip to next word
    while (i < length && getCharType(line[i]) === 'whitespace') {
      i++;
    }
    // Return first word character or punctuation
    return i < length ? i : null;
  }
}

/**
 * Find the end of the current or next word
 *
 * Searches forward from the given column position to find the end
 * of the current word (if positioned on one) or the next word.
 *
 * @param line - The line content to search
 * @param column - The starting column position
 * @returns The column index of the word end, or null if not found
 *
 * @example
 * ```typescript
 * findWordEnd('hello world', 0);   // 4 (end of 'hello')
 * findWordEnd('hello world', 6);   // 10 (end of 'world')
 * findWordEnd('hello   world', 5); // 7 (end of 'world')
 * ```
 */
export function findWordEnd(line: string, column: number, rolling: boolean = false): number | null {
  const length = line.length;
  if (column < 0 || (column + 1 >= length && !rolling && line.length)) {
    return null;
  }
  if (rolling && !line) {
    return null;
  }

  let i = column;
  const currentChar = line[i];
  const charType = getCharType(currentChar);

  if (charType === 'whitespace') {
    // Skip whitespace
    while (i < length && getCharType(line[i]) === 'whitespace') {
      i++;
    }
    // Skip similar characters
    const currentType = getCharType(line[i]);
    while (i < length && getCharType(line[i]) === currentType) {
      i++;
    }
    // Return end of word (one before current position)
    return i > 0 && i <= length ? i - 1 : null;
  }

  if (charType === 'word') {
    // First, check if we're already at the end of a word
    // by looking ahead to see if the next character is a word character
    let nextPos = i + 1;
    while (nextPos < length && getCharType(line[nextPos]) === 'word') {
      nextPos++;
    }

    // If the current position is the last character of the word,
    // we need to find the next word
    if (i === nextPos - 1) {
      // We're at the end of the current word, find next word
      // Move past current position
      i = nextPos;
      // Skip whitespace only (stop at punctuation)
      while (
        i < length &&
        getCharType(line[i]) !== 'word' &&
        getCharType(line[i]) !== 'punctuation'
      ) {
        i++;
      }
      // Skip next word
      const currentType = getCharType(line[i]);
      while (i < length && getCharType(line[i]) === currentType) {
        i++;
      }
      // Return end of word (one before current position)
      return i > 0 && i <= length ? i - 1 : null;
    } else {
      // We're not at the end, just go to end of current word
      // Skip to end of current word
      while (i < length && getCharType(line[i]) === 'word') {
        i++;
      }
      // Return end of word (one before current position)
      return i > 0 && i <= length ? i - 1 : null;
    }
  }

  if (charType === 'punctuation') {
    // First, check if we're already at the end of a punctuation sequence
    // by looking ahead to see if the next character is a punctuation character
    let nextPos = i + 1;
    while (nextPos < length && getCharType(line[nextPos]) === 'punctuation') {
      nextPos++;
    }

    // If the current position is the last character of the word,
    // we need to find the next word
    if (i === nextPos - 1) {
      // We're at the end of the current word, find next word
      // Move past current position
      i = nextPos;
      // Skip whitespace only (stop at punctuation)
      while (
        i < length &&
        getCharType(line[i]) !== 'word' &&
        getCharType(line[i]) !== 'punctuation'
      ) {
        i++;
      }
      // Skip next word
      const currentType = getCharType(line[i]);
      while (i < length && getCharType(line[i]) === currentType) {
        i++;
      }
      // Return end of word (one before current position)
      return i > 0 && i <= length ? i - 1 : null;
    } else {
      // We're not at the end, just go to end of current punctuation sequence
      // Skip to end of current punctuation sequence
      while (i < length && getCharType(line[i]) === 'punctuation') {
        i++;
      }
      // Return end of punctuation sequence (one before current position)
      return i > 0 && i <= length ? i - 1 : null;
    }
  }

  // Punctuation - skip non-whitespace, non-word characters
  while (i < length && getCharType(line[i]) !== 'whitespace' && getCharType(line[i]) !== 'word') {
    i++;
  }
  while (i < length && getCharType(line[i]) === 'whitespace') {
    i++;
  }
  const currentType = getCharType(line[i]);
  while (i < length && getCharType(line[i]) === currentType) {
    i++;
  }
  return i > 0 && i <= length ? i - 1 : null;
}

/**
 * Find the start of the previous word
 *
 * Searches backward from the given column position to find the start
 * of the previous word.
 *
 * @param line - The line content to search
 * @param column - The starting column position
 * @returns The column index of the previous word start, or null if not found
 *
 * @example
 * ```typescript
 * findPreviousWordStart('hello world', 6);  // 0 (start of 'hello')
 * findPreviousWordStart('hello world', 5);  // 0 (start of 'hello')
 * findPreviousWordStart('hello   world', 8); // 8 (start of 'world')
 * ```
 */
export function findPreviousWordStart(
  line: string,
  column: number,
  rolling: boolean = false
): number | null {
  // Ensure column is within bounds to prevent errors
  if (column <= 0) {
    if (rolling) {
      return 0;
    }
    return null;
  }
  if (column > line.length) column = line.length;

  let pos = column - 1;

  // Step 1: Skip over preceding whitespace (if any)
  // If the cursor is at the start of a word, we want to jump to the *previous* word,
  // so we must consume the space between them first.
  while (pos >= 0 && getCharType(line[pos]) === 'whitespace') {
    pos--;
  }

  // If we reached the start of the line while skipping whitespace
  if (pos < 0) return null;

  // Step 2: Identify the type of the word we are currently on (Keyword or Symbol)
  const targetType = getCharType(line[pos]);

  // Step 3: Move backward as long as the character type remains the same
  while (pos >= 0 && getCharType(line[pos]) === targetType) {
    pos--;
  }

  // We went one index too far (into the previous word or whitespace), so add 1
  return pos + 1;
}

/**
 * Find the end of the previous word
 *
 * Searches backward from the given column position to find the end
 * of the previous word. The 'ge' motion in Vim moves to the end of
 * the previous word.
 *
 * @param line - The line content to search
 * @param column - The starting column position
 * @returns The column index of the previous word end, or null if not found
 *
 * @example
 * ```typescript
 * findPreviousWordEnd('hello world', 6);   // 4 (end of 'hello')
 * findPreviousWordEnd('hello   world', 8); // 4 (end of 'hello')
 * findPreviousWordEnd('hello world', 5);   // 4 (end of 'hello')
 * findPreviousWordEnd('one two three four', 18); // 12 (end of 'three')
 * ```
 */
export function findPreviousWordEnd(line: string, column: number, rolling: boolean = false): number | null {
  // 1. Handle edge cases: Start of line
  const length = line.length
  if (column < 1) {
    if (rolling) {
      return 0
    }
    return null;
  }

  // 2. Convert to 0-based index
  let pos = column;

  // Clamp if out of bounds
  if (pos >= length) {
    pos = length - 1;

  if (rolling && !isWhitespace(line[pos])) {
    return pos;
  }
  }

  // --- Phase 1: Escape the current word ---
  // If we are on a word/symbol, move back until we hit the start of it.
  // We strictly stay on the SAME type.
  const startType = getCharType(line[pos]);

  if (!isWhitespace(line[pos])) {
    // Move back as long as we see the exact same type (e.g., stay in Symbol mode)
    while (pos >= 0 && getCharType(line[pos]) === startType) {
      pos--;
    }
  }

  // --- Phase 2: Skip the Gap (Whitespace) ---
  // Now we are either on whitespace (from the start) or we just exited a word and landed on whitespace/previous word.
  // We must consume all whitespace to find the END of the previous word.
  while (pos >= 0 && isWhitespace(line[pos])) {
    pos--;
  }

  // If we went past the start of the line, return null (or 0 if you prefer to clamp)
  if (pos < 0) {
    return null;
  }

  // pos is now on the last character of the previous word.
  return pos;
}

/**
 * Find the start of the next WORD
 *
 * Searches forward from the given column position to find the start
 * of the next WORD. A WORD is defined as a sequence of non-whitespace characters.
 *
 * @param line - The line content to search
 * @param column - The starting column position
 * @returns The column index of the next WORD start, or null if not found
 *
 * @example
 * ```typescript
 * findNextWORDStart('hello world', 0);  // 6 (start of 'world')
 * findNextWORDStart('hello-world test', 0);  // 11 (start of 'test', treats 'hello-world' as one WORD)
 * findNextWORDStart('hello   world', 5); // 8 (start of 'world')
 * ```
 */
export function findNextWORDStart(
  line: string,
  column: number,
  rolling: boolean = false
): number | null {
  const length = line.length;
  let i = column;

  if (rolling) {
    if (!line) {
      return 0;
    }
    // Skip whitespace
    while (i < length && getCharType(line[i]) === 'whitespace') {
      i++;
    }
    return i >= length ? null : i;
  }
  if (column < 0 || column >= length) {
    return null;
  }

  // If on a non-whitespace character, skip to end of current WORD
  if (getCharType(line[i]) !== 'whitespace') {
    while (i < length && getCharType(line[i]) !== 'whitespace') {
      i++;
    }
  }

  // Skip whitespace
  while (i < length && getCharType(line[i]) === 'whitespace') {
    i++;
  }

  // Return position if we found a WORD start
  return i < length && getCharType(line[i]) !== 'whitespace' ? i : null;
}

/**
 * Find the end of the current or next WORD
 *
 * Searches forward from the given column position to find the end
 * of the current WORD (if positioned on one) or the next WORD.
 *
 * @param line - The line content to search
 * @param column - The starting column position
 * @returns The column index of the WORD end, or null if not found
 *
 * @example
 * ```typescript
 * findNextWORDEnd('hello world', 0);   // 4 (end of 'hello')
 * findNextWORDEnd('hello-world test', 0);   // 10 (end of 'hello-world')
 * findNextWORDEnd('hello   world', 5); // 7 (end of 'world')
 * ```
 */
export function findNextWORDEnd(line: string, column: number): number | null {
  const length = line.length;
  if (column < 0 || column >= length) {
    return null;
  }

  let i = column;
  const currentChar = line[i];
  const charType = getCharType(currentChar);

  if (charType === 'whitespace') {
    // Skip whitespace
    while (i < length && getCharType(line[i]) === 'whitespace') {
      i++;
    }
    // Skip WORD characters
    while (i < length && getCharType(line[i]) !== 'whitespace') {
      i++;
    }
    // Return end of WORD (one before current position)
    return i > 0 ? i - 1 : null;
  }

  // Non-whitespace character
  // Skip WORD characters
  while (i < length && getCharType(line[i]) !== 'whitespace') {
    i++;
  }
  // Return end of WORD
  return i > 0 ? i - 1 : null;
}

/**
 * Find the start of the previous WORD
 *
 * Searches backward from the given column position to find the start
 * of the previous WORD.
 *
 * @param line - The line content to search
 * @param column - The starting column position
 * @returns The column index of the previous WORD start, or null if not found
 *
 * @example
 * ```typescript
 * findPreviousWORDStart('hello world', 6);  // 0 (start of 'hello')
 * findPreviousWORDStart('hello-world test', 11);  // 0 (start of 'hello-world')
 * findPreviousWORDStart('hello   world', 8); // 8 (start of 'world')
 * ```
 */
export function findPreviousWORDStart(
  line: string,
  column: number,
  rolling: boolean = false
): number | null {
  if (rolling && !line) {
    return 0;
  }
  if (column <= 0) {
    return null;
  }

  let i = column - 1;

  // Skip whitespace
  while (i >= 0 && getCharType(line[i]) === 'whitespace') {
    i--;
  }
  if (i < 0) {
    return null;
  }

  // Skip non-whitespace characters (WORD characters) backward
  while (i >= 0 && getCharType(line[i]) !== 'whitespace') {
    i--;
  }
  return i + 1;
}

/**
 * Skip whitespace characters backward from a given position
 *
 * @param line - The line content to search
 * @param pos - The starting position (0-based index)
 * @returns The position after skipping whitespace, or -1 if went past start
 *
 * @example
 * ```typescript
 * skipWhitespaceBackward('hello   world', 10); // 7 (position after skipping spaces)
 * skipWhitespaceBackward('hello', 4); // 4 (no whitespace to skip)
 * ```
 */
function skipWhitespaceBackward(line: string, pos: number): number {
  while (pos >= 0 && getCharType(line[pos]) === 'whitespace') {
    pos--;
  }
  return pos;
}

/**
 * Skip non-whitespace characters (WORD characters) backward from a given position
 *
 * @param line - The line content to search
 * @param pos - The starting position (0-based index)
 * @returns The position after skipping non-whitespace characters
 *
 * @example
 * ```typescript
 * skipNonWhitespaceBackward('hello', 4); // -1 (skipped all characters)
 * skipNonWhitespaceBackward('hello', 2); // -1 (skipped from position 2)
 * ```
 */
function skipNonWhitespaceBackward(line: string, pos: number): number {
  while (pos >= 0 && getCharType(line[pos]) !== 'whitespace') {
    pos--;
  }
  return pos;
}

/**
 * Find the end of the previous WORD
 *
 * Searches backward from the given column position to find the end
 * of the previous WORD. A WORD is defined as a sequence of non-whitespace
 * characters (including punctuation).
 *
 * @param line - The line content to search
 * @param column - The starting column position
 * @returns The column index of the previous WORD end, or null if not found
 *
 * @example
 * ```typescript
 * findPreviousWORDEnd('hello world', 6);   // 4 (end of 'hello')
 * findPreviousWORDEnd('hello-world test', 11);   // 10 (end of 'hello-world')
 * findPreviousWORDEnd('hello   world', 8); // 4 (end of 'hello')
 * ```
 */
export function findPreviousWORDEnd(line: string, column: number): number | null {
  if (column <= 0) {
    return null;
  }

  let pos = column - 1;

  // Skip whitespace at end
  pos = skipWhitespaceBackward(line, pos);
  if (pos < 0) {
    return null;
  }

  // Skip non-whitespace characters (WORD characters) backward
  // The position after skipping is one before the WORD start,
  // so we add 1 to get the WORD end
  pos = skipNonWhitespaceBackward(line, pos);
  return pos + 1;
}
