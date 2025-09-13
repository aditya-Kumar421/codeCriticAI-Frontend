import { useState, useCallback } from 'react';
import { CodeReviewService } from '../services/codeReviewService.js';

/**
 * Custom hook for managing code review functionality
 */
export const useCodeReview = () => {
  const [code, setCode] = useState('');
  const [review, setReview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const reviewCode = useCallback(async () => {
    if (!code.trim()) {
      setError('Please enter some code to review');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const reviewResult = await CodeReviewService.reviewCode(code);
      setReview(reviewResult);
    } catch (err) {
      setError(err.message);
      console.error('Code review error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [code]);

  const clearReview = useCallback(() => {
    setReview('');
    setError(null);
  }, []);

  const clearAll = useCallback(() => {
    setCode('');
    setReview('');
    setError(null);
  }, []);

  return {
    code,
    setCode,
    review,
    isLoading,
    error,
    reviewCode,
    clearReview,
    clearAll,
  };
};

export default useCodeReview;