import PropTypes from 'prop-types';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import './ReviewPanel.css';

/**
 * Review Panel component for displaying AI code review results
 */
const ReviewPanel = ({
  review,
  isLoading = false,
  error = null,
  className = '',
}) => {
  const renderContent = () => {
    if (error) {
      return (
        <div className="review-panel__error">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="review-panel__loading">
          <div className="review-panel__spinner"></div>
          <p>Analyzing your code...</p>
        </div>
      );
    }

    if (!review) {
      return (
        <div className="review-panel__empty">
          <h3>👨‍💻 Code Review</h3>
          <p>
            Paste your code in the editor and click the review button to get AI-powered 
            feedback on your code quality, best practices, and potential improvements.
          </p>
        </div>
      );
    }

    // Ensure review is a string for Markdown component
    const reviewText = typeof review === 'string' ? review : JSON.stringify(review, null, 2);

    return (
      <div className="review-panel__content">
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
      </div>
    );
  };

  return (
    <div className={`review-panel ${className}`}>
      {renderContent()}
    </div>
  );
};

ReviewPanel.propTypes = {
  review: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
};

export default ReviewPanel;