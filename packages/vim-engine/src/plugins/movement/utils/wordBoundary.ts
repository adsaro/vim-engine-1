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
export function findNextWordStart(line: string, column: number): number | null {
  const length = line.length;
  if (column < 0 || column >= length) {
    return null;
  }

  let i = column;

  // Check what type of character we're on
  const charType = getCharType(line[i]);
  
  if (charType === 'word') {
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
export function findWordEnd(line: string, column: number): number | null {
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
    // Skip word characters
    while (i < length && getCharType(line[i]) === 'word') {
      i++;
    }
    // Return end of word (one before current position)
    return i > 0 ? i - 1 : null;
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
      // Skip non-word characters
      while (i < length && getCharType(line[i]) !== 'word') {
        i++;
      }
      // Skip next word
      while (i < length && getCharType(line[i]) === 'word') {
        i++;
      }
      // Return end of word (one before current position)
      return i > 0 ? i - 1 : null;
    } else {
      // We're not at the end, just go to end of current word
      // Skip to end of current word
      while (i < length && getCharType(line[i]) === 'word') {
        i++;
      }
      // Return end of word (one before current position)
      return i > 0 ? i - 1 : null;
    }
  }

  // Punctuation - skip non-whitespace, non-word characters
  while (i < length && getCharType(line[i]) !== 'whitespace' && getCharType(line[i]) !== 'word') {
    i++;
  }
  while (i < length && getCharType(line[i]) === 'whitespace') {
    i++;
  }
  while (i < length && getCharType(line[i]) === 'word') {
    i++;
  }
  return i > 0 ? i - 1 : null;
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
export function findPreviousWordStart(line: string, column: number): number | null {
  // Ensure column is within bounds to prevent errors
  if (column <= 0) return null;
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
export function findPreviousWordEnd(line: string, column: number): number | null {
  if (column <= 0) {
    return null;
  }

  let i = column - 1;

  // Check if we're at or past the end of the line
  if (column >= line.length) {
    // Start from the last character
    i = line.length - 1;
    // This is the end of the last word on the line
    return i;
  }

  // Check if we're at the end of a word
  // (current position is a word char, and next is not a word char or end of line)
  /* if (i >= 0 && getCharType(line[i]) === 'word' && (i + 1 >= line.length || getCharType(line[i + 1]) !== 'word')) {
    // We're at the end of a word, return this position
    return i;
  } */

  // We're in the middle of a word
  // Go back to the start of this word
  if (i >= 0 && getCharType(line[i]) === 'word') {
    while (i >= 0 && getCharType(line[i]) === 'word') {
      i--;
    }
  }

  // Skip whitespace and non-word characters to find the previous word
  while (i >= 0 && getCharType(line[i]) !== 'word') {
    i--;
  }

  if (i < 0) {
    return null;
  }

  // Now i is at the last character of the previous word
  return i;
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
export function findNextWORDStart(line: string, column: number): number | null {
  const length = line.length;
  if (column < 0 || column >= length) {
    return null;
  }

  let i = column;

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
export function findPreviousWORDStart(line: string, column: number): number | null {
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
 * Find the end of the previous WORD
 *
 * Searches backward from the given column position to find the end
 * of the previous WORD.
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

  let i = column - 1;

  // Skip whitespace at end
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
