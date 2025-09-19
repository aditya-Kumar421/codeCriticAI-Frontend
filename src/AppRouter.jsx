import { Routes, Route, useLocation } from 'react-router-dom';
import { CodeEditor, ReviewPanel, Button } from './components';
import { useCodeReview } from './hooks/useCodeReview';
import CodeCritic2 from './features/codecritic-v2/pages/CodeCritic2.jsx';
import { AdminDashboard, InteractionHistory } from './features/admin/components';
import './styles/App.css';

/**
 * Main Application Component with Routing
 */
function App() {
  const location = useLocation();
  
  // Original app logic for the home route
  const {
    code,
    setCode,
    review,
    isLoading,
    error,
    reviewCode,
    clearAll,
  } = useCodeReview();

  // Check if we're on the original app route
  const isOriginalApp = location.pathname === '/';

  return (
    <div className="app">
      <Routes>
        {/* Original CodeCritic App */}
        <Route
          path="/"
          element={
            <>
              <header className="app__header">
                <h1 className="app__title">CodeCritic AI</h1>
                <div className="app__header-nav">
                  <Button
                    variant="outline"
                    size="small"
                    className="app__header-cta"
                    onClick={() => window.open('/codecritic-2', '_self')}
                  >
                    Try CodeCritic 2.0
                    <span className="app__header-arrow">↗</span>
                  </Button>
                </div>
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
            </>
          }
        />

        {/* CodeCritic 2.0 */}
        <Route path="/codecritic-2" element={<CodeCritic2 />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/interactions" element={<InteractionHistory />} />

        {/* Fallback route */}
        <Route
          path="*"
          element={
            <div className="app__error">
              <h1 className="app__error-title">404</h1>
              <p className="app__error-message">
                Page not found. Return to the{' '}
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => window.location.href = '/'}
                >
                  home page
                </Button>
              </p>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;