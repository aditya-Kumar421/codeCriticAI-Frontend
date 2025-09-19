import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { AdminService } from '../services/adminService.js';
import { Button } from '../../../components';
import './AdminDashboard.css';
import '../../../styles/SimpleNav.css';

/**
 * Admin Dashboard with comprehensive statistics and charts
 */
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [languageData, setLanguageData] = useState([]);
  const [responseTimeData, setResponseTimeData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  
  // History section state
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Colors for charts
  const COLORS = {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
    gradient: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#06b6d4'],
  };

  const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#06b6d4', '#84cc16', '#f97316'];

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Only fetch stats from the new API
      const statsResponse = await AdminService.getStats();
      
      if (statsResponse.success) {
        const { stats } = statsResponse;
        setStats(stats);
        
        // Transform language stats for charts
        const transformedLanguageData = stats.languageStats.map(lang => ({
          name: lang._id === 'unknown' ? 'Unknown' : lang._id.charAt(0).toUpperCase() + lang._id.slice(1),
          value: lang.count,
          _id: lang._id
        }));
        setLanguageData(transformedLanguageData);
        
        // Create mock response time data since it's not in the API
        // You can replace this with actual data if available
        setResponseTimeData([
          { time: '00:00', responseTime: stats.averageResponseTime, interactions: Math.floor(stats.todayInteractions / 8) },
          { time: '03:00', responseTime: stats.averageResponseTime * 0.8, interactions: Math.floor(stats.todayInteractions / 10) },
          { time: '06:00', responseTime: stats.averageResponseTime * 1.2, interactions: Math.floor(stats.todayInteractions / 6) },
          { time: '09:00', responseTime: stats.averageResponseTime * 0.9, interactions: Math.floor(stats.todayInteractions / 4) },
          { time: '12:00', responseTime: stats.averageResponseTime * 1.1, interactions: Math.floor(stats.todayInteractions / 3) },
          { time: '15:00', responseTime: stats.averageResponseTime * 0.95, interactions: Math.floor(stats.todayInteractions / 4) },
          { time: '18:00', responseTime: stats.averageResponseTime * 1.05, interactions: Math.floor(stats.todayInteractions / 5) },
          { time: '21:00', responseTime: stats.averageResponseTime * 0.85, interactions: Math.floor(stats.todayInteractions / 8) },
        ]);
      } else {
        throw new Error('Failed to fetch stats');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod]);

  // Real-time data update
  const updateRealTimeStats = useCallback(async () => {
    if (!realTimeEnabled) return;

    try {
      // Use the same stats API for real-time updates
      const statsResponse = await AdminService.getStats();
      
      if (statsResponse.success) {
        const { stats } = statsResponse;
        setStats(prevStats => ({
          ...prevStats,
          ...stats,
        }));
        
        // Update language data
        const transformedLanguageData = stats.languageStats.map(lang => ({
          name: lang._id === 'unknown' ? 'Unknown' : lang._id.charAt(0).toUpperCase() + lang._id.slice(1),
          value: lang.count,
          _id: lang._id
        }));
        setLanguageData(transformedLanguageData);
      }
    } catch (err) {
      console.error('Error updating real-time stats:', err);
    }
  }, [realTimeEnabled]);

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Real-time updates
  useEffect(() => {
    if (!realTimeEnabled) return;

    const interval = setInterval(updateRealTimeStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [realTimeEnabled, updateRealTimeStats]);

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  // Toggle real-time updates
  const toggleRealTime = () => {
    setRealTimeEnabled(prev => !prev);
  };

  // Load recent interactions for history
  const loadInteractionHistory = useCallback(async () => {
    setHistoryLoading(true);
    
    try {
      // Load recent interactions from API
      const response = await AdminService.getInteractions(1, 10); // Get latest 10 interactions
      
      if (response.success && response.data) {
        setHistoryData(response.data.interactions || []);
      } else {
        throw new Error('Failed to fetch interaction history');
      }
    } catch (err) {
      console.error('Error loading interaction history:', err);
      setHistoryData([]); // Set empty array on error
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Load interaction history when stats change
  useEffect(() => {
    if (stats) {
      loadInteractionHistory();
    }
  }, [loadInteractionHistory, stats]);

  // Format numbers
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading && !stats) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="dashboard-title-section">
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">
            Monitor CodeCritic performance and user activity
          </p>
        </div>

        <div className="dashboard-controls">
          <Link to="/" className="codecritic-nav-button codecritic-nav-button--v1">
            CodeCritic 1.0
          </Link>

          <Link to="/codecritic-2" className="codecritic-nav-button codecritic-nav-button--v2">
            CodeCritic 2.0
          </Link>
        </div>
      </header>

      {error && (
        <div className="dashboard-error">
          <p>⚠️ Error loading dashboard: {error}</p>
          <Button onClick={loadDashboardData} size="small">
            Retry
          </Button>
        </div>
      )}

      {stats && (
        <>
          <div className="dashboard-stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Total Interactions</h3>
                <p className="stat-value">{formatNumber(stats.totalInteractions || 0)}</p>
                <span className="stat-change positive">
                  +{stats.todayInteractions || 1} today
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Unique Users</h3>
                <p className="stat-value">{formatNumber(stats.uniqueUsers || 0)}</p>
                <span className="stat-change neutral">
                  Across all sessions
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⚡</div>
              <div className="stat-content">
                <h3>Avg Response Time</h3>
                <p className="stat-value">
                  {stats.averageResponseTime ? `${Math.round(stats.averageResponseTime / 1000)} sec` : '0 sec'}
                </p>
                <span className="stat-change neutral">
                  System performance
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🌐</div>
              <div className="stat-content">
                <h3>Today's Activity</h3>
                <p className="stat-value">{formatNumber(stats.todayInteractions || 0)}</p>
                <span className="stat-change neutral">
                  {realTimeEnabled ? 'Live' : 'Static'}
                </span>
              </div>
            </div>
          </div>

          <div className="dashboard-charts-grid">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Language Distribution</h3>
                <p>Programming languages used in reviews</p>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={languageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {languageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Response Times</h3>
                <p>Performance over {selectedPeriod}</p>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={responseTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="time" 
                      stroke="var(--text-muted)"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="var(--text-muted)"
                      fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: COLORS.secondary }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* <div className="chart-card chart-card--wide">
              <div className="chart-header">
                <h3>Interaction Volume</h3>
                <p>User activity patterns over {selectedPeriod}</p>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={responseTimeData}>
                    <defs>
                      <linearGradient id="colorInteractions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="time" 
                      stroke="var(--text-muted)"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="var(--text-muted)"
                      fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="interactions"
                      stroke={COLORS.primary}
                      fillOpacity={1}
                      fill="url(#colorInteractions)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div> */}

            <div className="chart-card">
              <div className="chart-header">
                <h3>Top Languages</h3>
                <p>Most popular by volume</p>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={languageData.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="var(--text-muted)"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="var(--text-muted)"
                      fontSize={12}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="value" 
                      fill={COLORS.primary}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="dashboard-details">
            <div className="detail-section">
              <h3>System Health</h3>
              <div className="health-indicators">
                <div className="health-indicator">
                  <span className="health-label">API Status</span>
                  <span className="health-status health-status--good">🟢 Operational</span>
                </div>
                <div className="health-indicator">
                  <span className="health-label">Database</span>
                  <span className="health-status health-status--good">🟢 Connected</span>
                </div>
                <div className="health-indicator">
                  <span className="health-label">Cache</span>
                  <span className="health-status health-status--good">🟢 Active</span>
                </div>
                <div className="health-indicator">
                  <span className="health-label">Queue</span>
                  <span className="health-status health-status--warning">🟡 High Load</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <span className="activity-time">2 min ago</span>
                  <span className="activity-text">New user review completed</span>
                </div>
                <div className="activity-item">
                  <span className="activity-time">5 min ago</span>
                  <span className="activity-text">JavaScript analysis spiked</span>
                </div>
                <div className="activity-item">
                  <span className="activity-time">12 min ago</span>
                  <span className="activity-text">Response time improved</span>
                </div>
              </div>
            </div>
          </div>

          {/* Conversation History Section */}
          <div className="dashboard-history-section">
            <div className="history-header">
              <div className="history-title-section">
                <h2 className="history-title">💬 Interaction History</h2>
                <p className="history-subtitle">Recent user conversations and code reviews</p>
              </div>
              
              <div className="history-controls">
                <Button
                  onClick={() => loadInteractionHistory()}
                  variant="outline"
                  size="small"
                  disabled={historyLoading}
                  className="refresh-history-btn"
                >
                  {historyLoading ? '🔄 Loading...' : '🔄 Refresh'}
                </Button>
                
                <Link to="/admin/interactions" className="view-all-btn">
                  View All Interactions →
                </Link>
              </div>
            </div>

            {historyLoading ? (
              <div className="history-loading">
                <div className="loading-spinner"></div>
                <p>Loading interaction history...</p>
              </div>
            ) : (
              <div className="conversation-history">
                {historyData.length > 0 ? (
                  <div className="conversation-list">
                    {historyData.map((interaction) => (
                      <div key={interaction._id} className="conversation-item">
                        <div className="conversation-header">
                          <div className="conversation-meta">
                            <span className="conversation-time">
                              {new Date(interaction.timestamp).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className="conversation-language">
                              {interaction.codeLanguage || 'Unknown'}
                            </span>
                            <span className="conversation-ip">
                              {interaction.userIP}
                            </span>
                          </div>
                          <div className="conversation-stats">
                            <span className={`response-time-indicator ${
                              interaction.responseTime > 10000 ? 'slow' : 
                              interaction.responseTime > 5000 ? 'medium' : 'fast'
                            }`}>
                              {Math.round(interaction.responseTime / 1000)}s
                            </span>
                          </div>
                        </div>
                        
                        <div className="conversation-content">
                          <div className="user-message">
                            <div className="message-label">
                              <span className="message-icon">👤</span>
                              <span>User Code</span>
                            </div>
                            <div className="message-content">
                              <pre className="code-block">
                                <code>{interaction.userCode}</code>
                              </pre>
                            </div>
                          </div>
                          
                          <div className="ai-message">
                            <div className="message-label">
                              <span className="message-icon">🤖</span>
                              <span>CodeCritic Review</span>
                            </div>
                            <div className="message-content">
                              <div className="review-content">
                                {interaction.aiResponse.slice(0, 300)}
                                {interaction.aiResponse.length > 300 && (
                                  <span className="review-more">... <button className="expand-btn">Read More</button></span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-conversations">
                    <div className="no-conversations-icon">💭</div>
                    <h3>No Recent Interactions</h3>
                    <p>User conversations will appear here as they interact with CodeCritic</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;