import { CodeEditor, ReviewPanel, Button } from './components';
import { useCodeReview } from './hooks/useCodeReview';
import './styles/App.css';

/**
 * Main Application Component
 * Provides code review functionality with AI-powered analysis
 */
function App() {
  const {
    code,
    setCode,
    review,
    isLoading,
    error,
    reviewCode,
    clearAll,
  } = useCodeReview();

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">CodeCritic AI</h1>
      </header>

      <main className="app__main">
        <section className="app__editor-section">
          <div className="app__editor-header">
            <h2 className="app__editor-title">Code Editor</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                onClick={clearAll}
                variant="outline"
                size="small"
                disabled={!code && !review}
              >
                Clear All
              </Button>
              <Button
                onClick={reviewCode}
                loading={isLoading}
                disabled={!code.trim()}
              >
                {isLoading ? 'Reviewing...' : 'Review Code'}
              </Button>
            </div>
          </div>
          <div className="app__editor-content">
            <CodeEditor
              value={code}
              onChange={setCode}
              placeholder="Paste your code here and click 'Review Code' to get AI-powered feedback..."
              language="javascript"
              disabled={isLoading}
            />
          </div>
        </section>

        <section className="app__review-section">
          <ReviewPanel
            review={review}
            isLoading={isLoading}
            error={error}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
