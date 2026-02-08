/**
 * JSON Sanitizer Utility
 * Cleans AI-generated text that often contains markdown, backticks,
 * code fences, and other characters that break JSON.parse()
 */

/**
 * Sanitize an AI response string into parseable JSON
 * @param {string} raw - Raw AI response text
 * @returns {string} Cleaned JSON string ready for JSON.parse()
 */
function sanitizeJsonString(raw) {
  if (!raw || typeof raw !== 'string') return '[]';

  let text = raw.trim();

  // 1. Strip markdown code fences (```json ... ``` or ``` ... ```)
  text = text.replace(/^```(?:json|JSON)?\s*\n?/gm, '');
  text = text.replace(/\n?```\s*$/gm, '');
  text = text.trim();

  // 2. Remove any <think>...</think> blocks (DeepSeek R1 reasoning)
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // 3. Strip leading/trailing non-JSON text before the first [ or {
  const firstBracket = text.search(/[\[{]/);
  if (firstBracket > 0) {
    text = text.substring(firstBracket);
  }

  // 4. Strip trailing text after the last ] or }
  const lastBracket = Math.max(text.lastIndexOf(']'), text.lastIndexOf('}'));
  if (lastBracket >= 0 && lastBracket < text.length - 1) {
    text = text.substring(0, lastBracket + 1);
  }

  // 5. Fix backtick-wrapped values inside JSON strings
  //    e.g., `:active` → :active  or  `code` → code
  //    We need to be careful to only replace backticks inside JSON string values
  text = text.replace(/`([^`\n]{1,100})`/g, '$1');

  // 6. Fix unescaped control characters inside strings
  //    Replace literal tabs and other control chars
  text = text.replace(/\t/g, '  ');

  // 7. Fix trailing commas before ] or }
  text = text.replace(/,\s*([\]}])/g, '$1');

  // 8. Fix single quotes used as string delimiters (common AI mistake)
  //    Only do this if the text doesn't parse as-is
  try {
    JSON.parse(text);
    return text; // Already valid
  } catch (e) {
    // Continue with more aggressive cleaning
  }

  // 9. Try to fix common issues
  //    Replace fancy/smart quotes with standard ones
  text = text.replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"');
  text = text.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");

  // 10. Fix escaped newlines that aren't properly escaped
  text = text.replace(/(?<!\\)\n/g, '\\n');

  // 11. Try parse again
  try {
    JSON.parse(text);
    return text;
  } catch (e) {
    // Last resort: try to extract just the JSON structure
  }

  // 12. Last resort: try regex extraction
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  const objectMatch = text.match(/\{[\s\S]*\}/);

  if (arrayMatch) {
    try {
      JSON.parse(arrayMatch[0]);
      return arrayMatch[0];
    } catch (e) {
      // Try cleaning the extracted part
      return cleanJsonContent(arrayMatch[0]);
    }
  }
  if (objectMatch) {
    try {
      JSON.parse(objectMatch[0]);
      return objectMatch[0];
    } catch (e) {
      return cleanJsonContent(objectMatch[0]);
    }
  }

  return text;
}

/**
 * Deep-clean JSON content by fixing string values
 */
function cleanJsonContent(text) {
  // Remove backticks aggressively
  let cleaned = text.replace(/`/g, '');

  // Fix trailing commas
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  // Fix unescaped newlines inside string values
  // Walk through and fix strings character by character
  let result = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];

    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }

    if (ch === '\\') {
      escaped = true;
      result += ch;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      result += ch;
      continue;
    }

    if (inString) {
      // Replace literal newlines inside strings with escaped versions
      if (ch === '\n') {
        result += '\\n';
        continue;
      }
      if (ch === '\r') {
        result += '\\r';
        continue;
      }
      // Replace tabs
      if (ch === '\t') {
        result += '\\t';
        continue;
      }
    }

    result += ch;
  }

  return result;
}

/**
 * Safely parse JSON from AI response with full sanitization
 * @param {string} rawResponse - Raw AI response
 * @returns {any} Parsed JSON (array or object)
 * @throws {Error} If JSON cannot be parsed even after sanitization
 */
function safeParseJSON(rawResponse) {
  const sanitized = sanitizeJsonString(rawResponse);

  try {
    return JSON.parse(sanitized);
  } catch (firstError) {
    // Try one more approach: extract array/object and clean
    const arrayMatch = sanitized.match(/\[[\s\S]*\]/);
    const objMatch = sanitized.match(/\{[\s\S]*\}/);

    const target = arrayMatch ? arrayMatch[0] : (objMatch ? objMatch[0] : sanitized);

    // Aggressive backtick removal + control char fix
    let aggressive = target
      .replace(/`/g, '')
      .replace(/,\s*([\]}])/g, '$1');

    try {
      return JSON.parse(aggressive);
    } catch (secondError) {
      console.error('JSON sanitization failed. Raw (first 500 chars):', rawResponse.substring(0, 500));
      throw new Error(`Failed to parse AI response as JSON: ${firstError.message}`);
    }
  }
}

module.exports = {
  sanitizeJsonString,
  safeParseJSON,
  cleanJsonContent
};
