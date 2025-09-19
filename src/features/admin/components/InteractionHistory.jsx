import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { AdminService } from '../services/adminService.js';
import { Button } from '../../../components';
import './InteractionHistory.css';
import '../../../styles/SimpleNav.css';

/**
 * Admin component for viewing user interaction history
 */
const InteractionHistory = () => {
  const [interactions, setInteractions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInteractions, setTotalInteractions] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [searchFilters, setSearchFilters] = useState({
    language: '',
    ip: '',
    dateFrom: '',
    dateTo: '',
  });

  // Load interactions
  const loadInteractions = useCallback(async (page = 1, limit = pageSize, filters = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      // Use the new API structure
      const response = await AdminService.getInteractions(page, limit);
      
      if (response.success && response.data) {
        const { interactions, pagination } = response.data;
        
        setInteractions(interactions || []);
        setCurrentPage(pagination.currentPage || page);
        setTotalPages(pagination.totalPages || 1);
        setTotalInteractions(pagination.totalItems || 0);
      } else {
        throw new Error('Failed to fetch interactions');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading interactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  // Initial load
  useEffect(() => {
    loadInteractions();
  }, [loadInteractions]);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      loadInteractions(page, pageSize);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    loadInteractions(1, newSize);
  };

  // Handle search (simplified - just reload data)
  const handleSearch = () => {
    setCurrentPage(1);
    loadInteractions(1, pageSize);
  };

  // Handle filter change (kept for UI compatibility but not used in API)
  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Clear filters (simplified)
  const clearFilters = () => {
    setSearchFilters({
      language: '',
      ip: '',
      dateFrom: '',
      dateTo: '',
    });
    setCurrentPage(1);
    loadInteractions(1, pageSize);
  };

  // Handle IP click to filter by IP
  const handleIPClick = async (ip) => {
    try {
      setIsLoading(true);
      const response = await AdminService.getInteractionsByIP(ip, 1, pageSize);
      
      if (response.success && response.data) {
        const { interactions, pagination } = response.data;
        setInteractions(interactions || []);
        setCurrentPage(pagination.currentPage || 1);
        setTotalPages(Math.ceil((pagination.totalItems || 0) / pageSize));
        setTotalInteractions(pagination.totalItems || 0);
        
        // Update search filters to show IP filter is active
        setSearchFilters(prev => ({ ...prev, ip }));
      }
    } catch (err) {
      setError(err.message);
      console.error('Error filtering by IP:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Format response time
  const formatResponseTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Get language badge color
  const getLanguageBadgeColor = (language) => {
    const colors = {
      javascript: '#f7df1e',
      python: '#3776ab',
      java: '#ed8b00',
      cpp: '#00599c',
      csharp: '#239120',
      typescript: '#3178c6',
      php: '#777bb4',
      ruby: '#cc342d',
      go: '#00add8',
      rust: '#dea584',
    };
    return colors[language?.toLowerCase()] || '#6b7280';
  };

  return (
    <div className="interaction-history">
      {/* Simple navigation */}
      <header className="interaction-history__header">
        <div className="interaction-history__title-section">
          <h1 className="interaction-history__title">User Interactions</h1>
          <p className="interaction-history__subtitle">
            Monitor and analyze user activity across CodeCritic
          </p>
        </div>
        
        <div className="interaction-history__stats">
          <div className="interaction-stat">
            <span className="interaction-stat__value">{totalInteractions}</span>
            <span className="interaction-stat__label">Total Interactions</span>
          </div>
          <div className="interaction-stat">
            <span className="interaction-stat__value">{totalPages}</span>
            <span className="interaction-stat__label">Pages</span>
          </div>
        </div>
      </header>

      <div className="interaction-history__filters">
        <div className="filter-group">
          <label className="filter-label">Language:</label>
          <select
            value={searchFilters.language}
            onChange={(e) => handleFilterChange('language', e.target.value)}
            className="filter-select"
          >
            <option value="">All Languages</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="csharp">C#</option>
            <option value="typescript">TypeScript</option>
            <option value="php">PHP</option>
            <option value="ruby">Ruby</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">IP Address:</label>
          <input
            type="text"
            value={searchFilters.ip}
            onChange={(e) => handleFilterChange('ip', e.target.value)}
            placeholder="192.168.1.1"
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Date From:</label>
          <input
            type="date"
            value={searchFilters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Date To:</label>
          <input
            type="date"
            value={searchFilters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-actions">
          <Button onClick={handleSearch} size="small">
            Search
          </Button>
          <Button onClick={clearFilters} variant="outline" size="small">
            Clear
          </Button>
        </div>
      </div>

      <div className="interaction-history__controls">
        <div className="page-size-control">
          <label>Show:</label>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="page-size-select"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        <div className="control-buttons">
          <Button
            onClick={() => loadInteractions(currentPage, pageSize)}
            variant="outline"
            size="small"
            disabled={isLoading}
          >
            🔄 Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="interaction-history__error">
          <p>⚠️ Error loading interactions: {error}</p>
          <Button onClick={() => loadInteractions()} size="small">
            Retry
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="interaction-history__loading">
          <div className="loading-spinner"></div>
          <p>Loading interactions...</p>
        </div>
      ) : (
        <>
          <div className="interaction-history__table-container">
            <table className="interaction-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>IP Address</th>
                  <th>Language</th>
                  <th>Response Time</th>
                  <th>Request Preview</th>
                  <th>Response Preview</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {interactions.map((interaction) => (
                  <tr key={interaction._id || `${interaction.timestamp}-${interaction.userIP}`}>
                    <td className="timestamp-cell">
                      {formatDate(interaction.timestamp)}
                    </td>
                    <td className="ip-cell">
                      <code 
                        className="clickable-ip" 
                        onClick={() => handleIPClick(interaction.userIP)}
                        title="Click to filter by this IP"
                      >
                        {interaction.userIP}
                      </code>
                    </td>
                    <td className="language-cell">
                      <span
                        className="language-badge"
                        style={{ backgroundColor: getLanguageBadgeColor(interaction.codeLanguage) }}
                      >
                        {interaction.codeLanguage || 'Unknown'}
                      </span>
                    </td>
                    <td className="response-time-cell">
                      <span className={`response-time ${
                        interaction.responseTime > 5000 ? 'slow' :
                        interaction.responseTime > 2000 ? 'medium' : 'fast'
                      }`}>
                        {formatResponseTime(interaction.responseTime)}
                      </span>
                    </td>
                    <td className="request-cell">
                      <div className="code-preview">
                        {interaction.userCode?.slice(0, 100)}
                        {interaction.userCode?.length > 100 && '...'}
                      </div>
                    </td>
                    <td className="response-cell">
                      <div className="code-preview">
                        {interaction.aiResponse?.slice(0, 100)}
                        {interaction.aiResponse?.length > 100 && '...'}
                      </div>
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge ${
                        interaction.status === 'success' ? 'success' :
                        interaction.status === 'error' ? 'error' : 'pending'
                      }`}>
                        {interaction.status || 'unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {interactions.length === 0 && !isLoading && (
              <div className="interaction-history__empty">
                <p>No interactions found</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="interaction-history__pagination">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                size="small"
              >
                Previous
              </Button>
              
              <div className="pagination-info">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <span className="pagination-total">
                  ({totalInteractions} total interactions)
                </span>
              </div>
              
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
                size="small"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InteractionHistory;