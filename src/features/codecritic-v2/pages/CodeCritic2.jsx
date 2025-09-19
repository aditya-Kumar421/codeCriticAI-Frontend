import { StreamingCodeEditor, StreamingReviewPanel } from '../components';
import { useStreamingCodeReview } from '../hooks/useStreamingCodeReview.js';
import { Button } from '../../../components';
import { Link } from 'react-router-dom';
import './CodeCritic2.css';
import '../../../styles/SimpleNav.css';

/**
 * CodeCritic 2.0 - Enhanced version with streaming AI responses
 */
function CodeCritic2() {
  const {
    code,
    setCode,
    review,
    isStreaming,
    error,
    sessionId,
    streamProgress,
    chunks,
    startStreaming,
    reviewCodeFallback,
    stopStreaming,
    clearAll,
    clearReview,
    initializeSession,
  } = useStreamingCodeReview();

  const handleStartStreaming = () => {
    if (!sessionId) {
      initializeSession();
    }
    startStreaming(code);
  };

  const handleFallbackReview = () => {
    reviewCodeFallback(code);
  };

  return (
    <div className="codecritic2">
      <header className="codecritic2__header">
        <div className="codecritic2__title-section">
          <h1 className="codecritic2__title">CodeCritic 2.0</h1>
        </div>
        
        <div className="codecritic2__badges">
          <Link to="/" className="codecritic2__nav-button">
            ← Original App
          </Link>
          <Link to="/admin" className="codecritic2__nav-button">
            Check Stats →
          </Link>
        </div>
      </header>

      <main className="codecritic2__main">
        <section className="codecritic2__editor-section">
          <div className="codecritic2__editor-header">
            <h2 className="codecritic2__editor-title">Code Editor</h2>
            <div className="codecritic2__editor-controls">
              <Button
                onClick={clearAll}
                variant="outline"
                size="small"
                disabled={!code && !review}
              >
                Clear All
              </Button>
              {isStreaming ? (
                <Button
                  onClick={stopStreaming}
                  variant="danger"
                  loading={false}
                >
                  Stop Review
                </Button>
              ) : (
                <Button
                  onClick={handleStartStreaming}
                  disabled={!code.trim()}
                  className="codecritic2__stream-btn"
                >
                  Review
                </Button>
              )}
            </div>
          </div>
          
          <div className="codecritic2__editor-content">
            <StreamingCodeEditor
              value={code}
              onChange={setCode}
              placeholder="Paste your code here for real-time AI analysis..."
              language="javascript"
              isStreaming={isStreaming}
              streamProgress={streamProgress}
              sessionId={sessionId}
            />
          </div>
        </section>

        <section className="codecritic2__review-section">
          <StreamingReviewPanel
            review={review}
            isStreaming={isStreaming}
            error={error}
            streamProgress={streamProgress}
            chunks={chunks}
            sessionId={sessionId}
            onStopStreaming={stopStreaming}
          />
        </section>
      </main>
    </div>
  );
}

export default CodeCritic2;