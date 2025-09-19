import { v4 as uuidv4 } from 'uuid';
import { API_BASE_URL, API_ENDPOINTS } from '../../../constants/api.js';

/**
 * Streaming AI service for CodeCritic 2.0
 * Handles real-time streaming responses with session management
 */
export class StreamingService {
  /**
   * Generate a new session ID
   * @returns {string} - Unique session identifier
   */
  static generateSessionId() {
    return uuidv4();
  }

  /**
   * Stream code review from AI with real-time chunks
   * @param {string} code - The code to be reviewed
   * @param {string} sessionId - Session identifier
   * @param {function} onChunk - Callback for each chunk received
   * @param {function} onComplete - Callback when streaming is complete
   * @param {function} onError - Callback for errors
   * @param {AbortController} abortController - Optional abort controller for cancellation
   * @returns {Promise<void>}
   */
  static async streamCodeReview(code, sessionId, onChunk, onComplete, onError, abortController) {
    try {
      if (!code || !code.trim()) {
        throw new Error('Code cannot be empty');
      }

      if (!sessionId) {
        throw new Error('Session ID is required');
      }

      // Use the streaming endpoint
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AI_STREAM}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: code,
        }),
        signal: abortController?.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response body is readable
      if (!response.body) {
        throw new Error('Response body is not readable');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Helper: extract JSON objects from a buffer where objects may be concatenated like {..}{..}
      // Handles nested braces and strings.
      const extractJsonObjects = (input) => {
        const results = [];
        let i = 0;
        let start = -1;
        let depth = 0;
        let inString = false;
        let escape = false;

        while (i < input.length) {
          const ch = input[i];
          if (inString) {
            if (escape) {
              escape = false;
            } else if (ch === '\\') {
              escape = true;
            } else if (ch === '"') {
              inString = false;
            }
          } else {
            if (ch === '"') {
              inString = true;
            } else if (ch === '{') {
              if (depth === 0) start = i;
              depth++;
            } else if (ch === '}') {
              depth--;
              if (depth === 0 && start !== -1) {
                const jsonStr = input.slice(start, i + 1);
                results.push(jsonStr);
                start = -1;
              }
            }
          }
          i++;
        }

        // leftover is from the last unmatched start (if any) or trailing text
        let leftover = '';
        if (depth > 0 && start !== -1) {
          leftover = input.slice(start);
        } else if (depth === 0) {
          // Also consider trailing non-JSON content (e.g., SSE). We'll keep it as leftover to try later
          // Find the last processed index
          let consumedLen = 0;
          if (results.length > 0) {
            const lastStr = results[results.length - 1];
            const lastIndex = input.lastIndexOf(lastStr);
            if (lastIndex !== -1) consumedLen = lastIndex + lastStr.length;
          }
          leftover = input.slice(consumedLen);
        }
        return { objects: results, leftover };
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }

          // Decode the bytes to text and append to buffer
          const text = decoder.decode(value, { stream: true });
          buffer += text;

          // Fast-path: if it's SSE style, split on newlines and handle data: lines
          if (buffer.includes('\n') && buffer.trimStart().startsWith('data:')) {
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              if (!line.trim()) continue;
              if (line.startsWith('data: ')) {
                const payload = line.slice(6);
                if (payload === '[DONE]') continue;
                try {
                  const evt = JSON.parse(payload);
                  if (evt?.type === 'chunk' && typeof evt.data === 'string') {
                    onChunk({ content: evt.data, timestamp: Date.now() });
                  } else if (evt?.type === 'complete') {
                    // server signals end
                    onComplete?.();
                  } else if (evt?.type === 'error') {
                    onError?.(new Error(evt.message || 'Streaming error'));
                  }
                } catch (e) {
                  // Not JSON, but if server sends raw text in data, treat it as content
                  onChunk({ content: payload, timestamp: Date.now() });
                }
              }
            }
            continue; // continue reading
          }

          // Generic path: extract concatenated JSON objects {..}{..}
          const { objects, leftover } = extractJsonObjects(buffer);
          buffer = leftover;
          for (const objStr of objects) {
            try {
              const evt = JSON.parse(objStr);
              if (evt?.type === 'chunk' && typeof evt.data === 'string') {
                onChunk({ content: evt.data, timestamp: Date.now() });
              } else if (evt?.type === 'complete') {
                onComplete?.();
              } else if (evt?.type === 'error') {
                onError?.(new Error(evt.message || 'Streaming error'));
              } else if (evt?.type === 'connected') {
                // ignore showing on screen; could be used for telemetry
              } else {
                // Unknown format; ignore to avoid polluting UI
              }
            } catch (e) {
              // If parse fails, keep in buffer (already handled by leftover)
            }
          }
        }

        // Do not emit leftover non-JSON noise; rely on 'complete' signal or stream end

        onComplete();
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Streaming was aborted');
        return;
      }
      console.error('Streaming error:', error);
      onError(error);
    }
  }

  /**
   * Non-streaming fallback for backward compatibility
   * @param {string} code - The code to be reviewed
   * @param {string} sessionId - Session identifier
   * @returns {Promise<string>} - The complete review response
   */
  static async reviewCodeFallback(code, sessionId) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AI_STREAM}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: code,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // For fallback, we'll read the entire stream and return as complete text
      if (!response.body) {
        throw new Error('Response body is not readable');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
      let buffer = '';

      const extractJsonObjects = (input) => {
        const results = [];
        let i = 0;
        let start = -1;
        let depth = 0;
        let inString = false;
        let escape = false;
        while (i < input.length) {
          const ch = input[i];
          if (inString) {
            if (escape) { escape = false; }
            else if (ch === '\\') { escape = true; }
            else if (ch === '"') { inString = false; }
          } else {
            if (ch === '"') inString = true;
            else if (ch === '{') { if (depth === 0) start = i; depth++; }
            else if (ch === '}') { depth--; if (depth === 0 && start !== -1) { results.push(input.slice(start, i + 1)); start = -1; } }
          }
          i++;
        }
        let leftover = '';
        if (depth > 0 && start !== -1) leftover = input.slice(start);
        else if (results.length > 0) {
          const lastStr = results[results.length - 1];
          const lastIndex = input.lastIndexOf(lastStr);
          if (lastIndex !== -1) leftover = input.slice(lastIndex + lastStr.length);
        } else {
          leftover = input;
        }
        return { objects: results, leftover };
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }

          const text = decoder.decode(value, { stream: true });
          buffer += text;

          // SSE path
          if (buffer.includes('\n') && buffer.trimStart().startsWith('data:')) {
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              if (!line.trim()) continue;
              if (line.startsWith('data: ')) {
                const payload = line.slice(6);
                if (payload === '[DONE]') continue;
                try {
                  const evt = JSON.parse(payload);
                  if (evt?.type === 'chunk' && typeof evt.data === 'string') {
                    result += evt.data;
                  }
                } catch {
                  result += payload;
                }
              }
            }
            continue;
          }

          const { objects, leftover } = extractJsonObjects(buffer);
          buffer = leftover;
          for (const objStr of objects) {
            try {
              const evt = JSON.parse(objStr);
              if (evt?.type === 'chunk' && typeof evt.data === 'string') {
                result += evt.data;
              }
            } catch {
              // ignore malformed
            }
          }
        }

        // Ignore leftover non-JSON noise

        return result;
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('Fallback review error:', error);
      throw error;
    }
  }
}

export default StreamingService;