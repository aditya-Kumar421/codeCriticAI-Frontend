import { useState, useCallback, useRef } from 'react';
import { StreamingService } from '../services/streamingService.js';

/**
 * Custom hook for streaming code review functionality
 */
export const useStreamingCodeReview = () => {
  const [code, setCode] = useState('');
  const [review, setReview] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [streamProgress, setStreamProgress] = useState(0);
  const [chunks, setChunks] = useState([]);
  
  const abortControllerRef = useRef(null);

  // Initialize a new session
  const initializeSession = useCallback(() => {
    const newSessionId = StreamingService.generateSessionId();
    setSessionId(newSessionId);
    return newSessionId;
  }, []);

  // Handle chunk received from streaming
  const handleChunk = useCallback((chunk) => {
    setChunks(prev => [...prev, chunk]);
    
    // Update review content based on chunk structure
    if (chunk.content) {
      setReview(prev => prev + chunk.content);
    } else if (chunk.delta) {
      setReview(prev => prev + chunk.delta);
    } else if (typeof chunk === 'string') {
      setReview(prev => prev + chunk);
    }

    // No longer using simulated progress since we have real streaming
    // Progress will be managed by the completion state
  }, []);

  // Handle streaming completion
  const handleComplete = useCallback(() => {
    setIsStreaming(false);
    setStreamProgress(100);
    if (abortControllerRef.current) {
      abortControllerRef.current = null;
    }
  }, []);

  // Handle streaming errors
  const handleError = useCallback((error) => {
    setError(error.message);
    setIsStreaming(false);
    setStreamProgress(0);
    if (abortControllerRef.current) {
      abortControllerRef.current = null;
    }
  }, []);

  // Start streaming code review
  const startStreaming = useCallback(async (codeToReview) => {
    if (!codeToReview?.trim()) {
      setError('Please enter some code to review');
      return;
    }

    // Initialize session if not exists
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = initializeSession();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsStreaming(true);
    setError(null);
    setReview('');
    setChunks([]);
    setStreamProgress(0);

    try {
      await StreamingService.streamCodeReview(
        codeToReview,
        currentSessionId,
        handleChunk,
        handleComplete,
        handleError,
        abortController
      );
    } catch (err) {
      // Only handle error if it's not an abort error
      if (err.name !== 'AbortError') {
        handleError(err);
      }
    }
  }, [sessionId, initializeSession, handleChunk, handleComplete, handleError]);

  // Fallback to non-streaming review
  const reviewCodeFallback = useCallback(async (codeToReview) => {
    if (!codeToReview?.trim()) {
      setError('Please enter some code to review');
      return;
    }

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = initializeSession();
    }

    setIsStreaming(true);
    setError(null);
    setReview('');

    try {
      const result = await StreamingService.reviewCodeFallback(codeToReview, currentSessionId);
      setReview(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsStreaming(false);
    }
  }, [sessionId, initializeSession]);

  // Stop streaming
  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setStreamProgress(0);
  }, []);

  // Clear all data
  const clearAll = useCallback(() => {
    setCode('');
    setReview('');
    setError(null);
    setChunks([]);
    setStreamProgress(0);
    setSessionId(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // Clear only review data
  const clearReview = useCallback(() => {
    setReview('');
    setError(null);
    setChunks([]);
    setStreamProgress(0);
  }, []);

  return {
    // State
    code,
    setCode,
    review,
    isStreaming,
    error,
    sessionId,
    streamProgress,
    chunks,
    
    // Actions
    startStreaming,
    reviewCodeFallback,
    stopStreaming,
    clearAll,
    clearReview,
    initializeSession,
  };
};

export default useStreamingCodeReview;