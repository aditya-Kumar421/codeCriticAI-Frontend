import PropTypes from 'prop-types';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import './StreamingReviewPanel.css';

/**
 * Enhanced Review Panel for CodeCritic 2.0 with streaming support
 */
const StreamingReviewPanel = ({
  review,
  isStreaming = false,
  error = null,
  streamProgress = 0,
  chunks = [],
  sessionId = null,
  className = '',
  onStopStreaming,
}) => {
  const renderHeader = () => {
    if (isStreaming) {
      return (
        <div className="streaming-review-panel__header streaming">
          <div className="streaming-status">
            <div className="streaming-indicator">
              <span className="streaming-dot"></span>
              <span className="streaming-dot"></span>
              <span className="streaming-dot"></span>
            </div>
            <span className="streaming-text">AI is analyzing your code...</span>
          </div>
          {onStopStreaming && (
            <button 
              onClick={onStopStreaming}
              className="stop-streaming-btn"
              title="Stop streaming"
            >
              ⏹️
            </button>
          )}
        </div>
      );
    }

    if (review && !error) {
      return (
        <div className="streaming-review-panel__header completed">
          <span className="completion-indicator">✅ Analysis Complete</span>
        </div>
      );
    }

    return null;
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="streaming-review-panel__error">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
        </div>
      );
    }

    // Show empty state only when not streaming and no content
    if (!review && !isStreaming && chunks.length === 0) {
      return (
        <div className="streaming-review-panel__empty">
          <h3>CodeCritic 2.0</h3>
          <p>
            Experience real-time AI code analysis with streaming responses. 
            Paste your code and watch as the AI provides live feedback!
          </p>
        </div>
      );
    }

    // Show content during streaming or when review is available
    const reviewText = review || chunks.join('');

    return (
      <div className="streaming-review-panel__content">
        <div className="streaming-review-content">
          <Markdown
            rehypePlugins={[rehypeHighlight]}
            components={{
              // Custom components for better styling
              h1: ({ children }) => <h1 className="review-heading review-heading--1">{children}</h1>,
              h2: ({ children }) => <h2 className="review-heading review-heading--2">{children}</h2>,
              h3: ({ children }) => <h3 className="review-heading review-heading--3">{children}</h3>,
              code: ({ inline, children, ...props }) =>
                inline ? (
                  <code className="review-code-inline" {...props}>
                    {children}
                  </code>
                ) : (
                  <code className="review-code-block" {...props}>
                    {children}
                  </code>
                ),
              ul: ({ children }) => <ul className="review-list">{children}</ul>,
              ol: ({ children }) => <ol className="review-list review-list--ordered">{children}</ol>,
              li: ({ children }) => <li className="review-list-item">{children}</li>,
            }}
          >
            {reviewText}
          </Markdown>
          
          {isStreaming && (
            <div className="streaming-cursor">
              <span className="streaming-cursor__blink">|</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`streaming-review-panel ${className}`}>
      {renderHeader()}
      {renderContent()}
    </div>
  );
};

StreamingReviewPanel.propTypes = {
  review: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  isStreaming: PropTypes.bool,
  error: PropTypes.string,
  streamProgress: PropTypes.number,
  chunks: PropTypes.array,
  sessionId: PropTypes.string,
  className: PropTypes.string,
  onStopStreaming: PropTypes.func,
};

export default StreamingReviewPanel;