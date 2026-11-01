const fs = require('fs');
const path = require('path');

/**
 * Lightweight, zero-dependency JavaScript formatter.
 * Formats by breaking on ';' and '{' / '}' with clean indentation.
 * Properly skips:
 *  - Single and double quoted strings (with escape handling)
 *  - Template literals (`...` including nested `${...}`)
 *  - Regular expressions (/.../flags) disambiguated from division
 *  - Block and line comments
 * Preserves original character offset as a comment at each line start: /*@<offset>*\/
 */

function formatJS(src) {
  const out = [];
  let curLine = '';
  let lineStartOffset = 0;
  let indent = 0;
  let i = 0;
  const n = src.length;
  let parenDepth = 0;
  let bracketDepth = 0;

  let lastToken = '';
  let lastTokenIsRegexPrefix = true;

  const regexPrefixKeywords = new Set([
    'return', 'case', 'typeof', 'void', 'delete', 'throw',
    'instanceof', 'in', 'of', 'new', 'await', 'yield', 'else',
    'do', 'default'
  ]);

  function isRegexPrefix(tok) {
    if (!tok) return true;
    if (regexPrefixKeywords.has(tok)) return true;
    const lastChar = tok[tok.length - 1];
    return '=([{:;,<>&|!~?^+-*%'.includes(lastChar);
  }

  function flushLine(useIndent = indent) {
    if (curLine.trim().length > 0) {
      out.push(`/*@${lineStartOffset}*/ ${'  '.repeat(Math.max(0, useIndent))}${curLine.trim()}`);
    }
    curLine = '';
  }

  while (i < n) {
    const ch = src[i];

    // If starting a fresh line, skip whitespace and align lineStartOffset to first non-whitespace
    if (curLine.length === 0 && /\s/.test(ch)) {
      i++;
      lineStartOffset = i;
      continue;
    }

    // String literals: '...' or "..."
    if (ch === '\'' || ch === '"') {
      const quote = ch;
      let s = ch;
      i++;
      while (i < n && src[i] !== quote) {
        if (src[i] === '\\' && i + 1 < n) {
          s += src[i] + src[i + 1];
          i += 2;
        } else {
          s += src[i];
          i++;
        }
      }
      if (i < n) {
        s += src[i];
        i++;
      }
      curLine += s;
      lastToken = s;
      lastTokenIsRegexPrefix = false;
      continue;
    }

    // Template literals: `...`
    if (ch === '`') {
      let s = '`';
      i++;
      let depth = 0;
      while (i < n) {
        if (src[i] === '\\' && i + 1 < n) {
          s += src[i] + src[i + 1];
          i += 2;
        } else if (src[i] === '$' && i + 1 < n && src[i + 1] === '{') {
          s += '${';
          i += 2;
          depth++;
        } else if (src[i] === '}' && depth > 0) {
          s += '}';
          i++;
          depth--;
        } else if (src[i] === '`' && depth === 0) {
          s += '`';
          i++;
          break;
        } else {
          s += src[i];
          i++;
        }
      }
      curLine += s;
      lastToken = s;
      lastTokenIsRegexPrefix = false;
      continue;
    }

    // Line comment //
    if (ch === '/' && i + 1 < n && src[i + 1] === '/') {
      let s = '//';
      i += 2;
      while (i < n && src[i] !== '\n') {
        s += src[i];
        i++;
      }
      curLine += s;
      flushLine(indent);
      lineStartOffset = i;
      continue;
    }

    // Block comment /* ... */
    if (ch === '/' && i + 1 < n && src[i + 1] === '*') {
      let s = '/*';
      i += 2;
      while (i < n && !(src[i] === '*' && i + 1 < n && src[i + 1] === '/')) {
        s += src[i];
        i++;
      }
      if (i < n) {
        s += '*/';
        i += 2;
      }
      curLine += s;
      continue;
    }

    // Regular expression literal /.../
    if (ch === '/' && lastTokenIsRegexPrefix) {
      let s = '/';
      i++;
      let inCharClass = false;
      while (i < n) {
        if (src[i] === '\\' && i + 1 < n) {
          s += src[i] + src[i + 1];
          i += 2;
        } else if (src[i] === '[' && !inCharClass) {
          inCharClass = true;
          s += src[i];
          i++;
        } else if (src[i] === ']' && inCharClass) {
          inCharClass = false;
          s += src[i];
          i++;
        } else if (src[i] === '/' && !inCharClass) {
          s += '/';
          i++;
          while (i < n && /[a-z]/i.test(src[i])) {
            s += src[i];
            i++;
          }
          break;
        } else {
          s += src[i];
          i++;
        }
      }
      curLine += s;
      lastToken = s;
      lastTokenIsRegexPrefix = false;
      continue;
    }

    // Parentheses
    if (ch === '(') {
      parenDepth++;
      curLine += '(';
      lastToken = '(';
      lastTokenIsRegexPrefix = true;
      i++;
      continue;
    }
    if (ch === ')') {
      if (parenDepth > 0) parenDepth--;
      curLine += ')';
      lastToken = ')';
      lastTokenIsRegexPrefix = false;
      i++;
      continue;
    }

    // Brackets
    if (ch === '[') {
      bracketDepth++;
      curLine += '[';
      lastToken = '[';
      lastTokenIsRegexPrefix = true;
      i++;
      continue;
    }
    if (ch === ']') {
      if (bracketDepth > 0) bracketDepth--;
      curLine += ']';
      lastToken = ']';
      lastTokenIsRegexPrefix = false;
      i++;
      continue;
    }

    // Open brace {
    if (ch === '{') {
      curLine += '{';
      lastToken = '{';
      lastTokenIsRegexPrefix = true;
      i++;
      flushLine(indent);
      indent++;
      lineStartOffset = i;
      continue;
    }

    // Close brace }
    if (ch === '}') {
      if (curLine.trim().length > 0) {
        flushLine(indent);
      }
      indent = Math.max(0, indent - 1);
      lineStartOffset = i;
      curLine = '}';
      lastToken = '}';
      lastTokenIsRegexPrefix = false;
      i++;

      // Safely attach immediately trailing ')', ']', ';', or ',' without dropping paren/bracket counts
      while (i < n && /\s/.test(src[i])) i++;
      while (i < n && (src[i] === ')' || src[i] === ']' || src[i] === ';' || src[i] === ',')) {
        if (src[i] === ')') {
          if (parenDepth > 0) parenDepth--;
        } else if (src[i] === ']') {
          if (bracketDepth > 0) bracketDepth--;
        }
        curLine += src[i];
        lastToken = src[i];
        lastTokenIsRegexPrefix = isRegexPrefix(src[i]);
        i++;
        if (src[i - 1] === ';') break;
      }
      flushLine(indent);
      lineStartOffset = i;
      continue;
    }

    // Semicolon ;
    if (ch === ';') {
      curLine += ';';
      lastToken = ';';
      lastTokenIsRegexPrefix = true;
      i++;
      if (parenDepth === 0) {
        flushLine(indent);
        lineStartOffset = i;
      }
      continue;
    }

    // Identifiers and numbers
    if (/[a-zA-Z0-9_$]/.test(ch)) {
      let word = '';
      while (i < n && /[a-zA-Z0-9_$]/.test(src[i])) {
        word += src[i];
        i++;
      }
      curLine += word;
      lastToken = word;
      lastTokenIsRegexPrefix = isRegexPrefix(word);
      continue;
    }

    // Other characters (operators, commas, colons, whitespace)
    curLine += ch;
    if (!/\s/.test(ch)) {
      lastToken = ch;
      lastTokenIsRegexPrefix = isRegexPrefix(ch);
    }
    i++;
  }

  flushLine(indent);
  return out.join('\n');
}

module.exports = { formatJS };

if (require.main === module) {
  // 用法：node formatter.js <遊戲程式包資料夾> [輸出資料夾]；輸出預設在本目錄 pretty/（已列入 .gitignore，遊戲原始碼不放進倉庫）。
  const inDir = path.resolve(process.argv[2] || path.join(__dirname, 'gamejs'));
  const outDir = path.resolve(process.argv[3] || path.join(__dirname, 'pretty'));

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const files = fs.readdirSync(inDir).filter(f => f.endsWith('.js'));
  console.log(`Formatting ${files.length} files from ${inDir} to ${outDir}...`);

  const startTime = Date.now();
  for (const file of files) {
    const srcPath = path.join(inDir, file);
    const dstPath = path.join(outDir, file);
    const content = fs.readFileSync(srcPath, 'utf8');
    const formatted = formatJS(content);
    fs.writeFileSync(dstPath, formatted, 'utf8');
  }
  console.log(`Formatted ${files.length} files in ${Date.now() - startTime}ms.`);
}
