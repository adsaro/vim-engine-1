Here is a comprehensive list of Vim movement keybindings, categorized by how they move the cursor.

### The "Golden" Keys (Basic Movement)

Vim is designed to keep your hands on the home row. You should avoid using the arrow keys.

| Key   | Action | Explanation                              |
| :---- | :----- | :--------------------------------------- |
| **h** | Left   | Moves cursor one character to the left.  |
| **j** | Down   | Moves cursor one line down.              |
| **k** | Up     | Moves cursor one line up.                |
| **l** | Right  | Moves cursor one character to the right. |

---

### Word Movement

These keys allow you to skip over words rather than characters.

| Key    | Action           | Explanation                                                                     |
| :----- | :--------------- | :------------------------------------------------------------------------------ |
| **w**  | Forward by word  | Jumps to the start of the **next** word.                                        |
| **W**  | Forward by WORD  | Jumps to the next WORD (ignores punctuation; treats spaces only as separators). |
| **b**  | Backward by word | Jumps to the start of the **previous** word.                                    |
| **B**  | Backward by WORD | Jumps backward to the start of the previous WORD.                               |
| **e**  | Forward to end   | Jumps to the **end** of the next word.                                          |
| **ge** | Backward to end  | Jumps to the **end** of the previous word.                                      |

---

### Line Movement

These keys move you to specific positions on the current line.

| Key     | Action          | Explanation                                                   |
| :------ | :-------------- | :------------------------------------------------------------ |
| **0**   | Start of line   | Moves to the absolute first character of the line (column 0). |
| **^**   | First non-blank | Moves to the first non-whitespace character (indented text).  |
| **$**   | End of line     | Moves to the very last character of the line.                 |
| **g\_** | Last non-blank  | Moves to the last non-whitespace character of the line.       |

---

### Screen / Page Movement

These keys are for moving large chunks of text at a time.

| Key        | Action         | Explanation                                     |
| :--------- | :------------- | :---------------------------------------------- |
| **Ctrl+f** | Page down      | Moves forward one full screen.                  |
| **Ctrl+b** | Page up        | Moves backward one full screen.                 |
| **Ctrl+d** | Half page down | Moves down half a screen.                       |
| **Ctrl+u** | Half page up   | Moves up half a screen.                         |
| **H**      | High (Top)     | Moves to the top line of the current screen.    |
| **M**      | Middle         | Moves to the middle line of the current screen. |
| **L**      | Low (Bottom)   | Moves to the bottom line of the current screen. |

---

### Document Navigation

These keys jump you to specific lines in the file.

| Key     | Action         | Explanation                                           |
| :------ | :------------- | :---------------------------------------------------- |
| **gg**  | Top of file    | Jumps to the very first line of the document.         |
| **G**   | Bottom of file | Jumps to the very last line of the document.          |
| **:10** | Go to line #   | Jumps to line number 10 (replace 10 with any number). |
| **10G** | Go to line #   | Another way to jump to line 10.                       |

---

### Find and Jump (Character Search)

These are faster than `w` or `l` when you know exactly what you are looking for on the current line.

| Key         | Action         | Explanation                                                                                             |
| :---------- | :------------- | :------------------------------------------------------------------------------------------------------ |
| **f{char}** | Find forward   | Jumps to the next occurrence of `{char}` on the current line. (e.g., `f;` jumps to the next semicolon). |
| **F{char}** | Find backward  | Jumps to the previous occurrence of `{char}` on the current line.                                       |
| **t{char}** | Till forward   | Jumps to **just before** the next occurrence of `{char}`.                                               |
| **T{char}** | Till backward  | Jumps to **just before** the previous occurrence of `{char}`.                                           |
| **;**       | Repeat find    | Repeats the last `f`, `F`, `t`, or `T` command in the same direction.                                   |
| **,**       | Repeat reverse | Repeats the last `f`, `F`, `t`, or `T` command in the opposite direction.                               |

---

### Code Structure (Parentheses & Brackets)

| Key   | Action        | Explanation                                                                                    |
| :---- | :------------ | :--------------------------------------------------------------------------------------------- |
| **%** | Match bracket | Jumps between matching pairs of `()`, `[]`, `{}`, and `<>`. Useful for navigating code blocks. |

---

### Search Movement

| Key          | Action         | Explanation                                                                       |
| :----------- | :------------- | :-------------------------------------------------------------------------------- |
| **/pattern** | Search         | Searches forward for `pattern`. Press `Enter` then `n` to jump to the next match. |
| **?pattern** | Search reverse | Searches backward for `pattern`.                                                  |
| **n**        | Next match     | Jumps to the next search result.                                                  |
| **N**        | Prev match     | Jumps to the previous search result.                                              |
| **\***       | Next word      | Searches for the word currently under your cursor.                                |

---

### The Jump List (Time Travel)

If you jump around a file and want to go back to where you were just a moment ago, use these.

| Key        | Action     | Explanation                                                          |
| :--------- | :--------- | :------------------------------------------------------------------- |
| **Ctrl+o** | Go back    | Jumps to your previous cursor position (works like a "Back" button). |
| **Ctrl+i** | Go forward | Jumps to your next cursor position (works like a "Forward" button).  |

---

### 💡 Pro Tip: Combine with Numbers

Vim allows you to combine movements with numbers to perform the action multiple times.

- **3k** = Move up 3 lines.
- **5w** = Jump forward 5 words.
- **10j** = Move down 10 lines.
- **2f;** = Jump to the _second_ next semicolon.
