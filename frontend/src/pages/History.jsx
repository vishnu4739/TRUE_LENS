import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getAnalysisHistory,
  getGuestHistory,
  deleteAnalysisById,
  clearAllAnalyses,
} from '../services/analysisService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { Search, Trash2, ArrowUpDown, ExternalLink, Filter } from 'lucide-react';

export default function History() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    fetchHistory();
  }, [isAuthenticated]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isAuthenticated) {
        try {
          const res = await getAnalysisHistory(1, 50);
          setAnalyses(res.predictions || []);
        } catch {
          setAnalyses(getGuestHistory());
        }
      } else {
        setAnalyses(getGuestHistory());
      }
    } catch (err) {
      setError(err.message || 'Failed fetching analysis history.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this analysis record?')) {
      return;
    }

    try {
      await deleteAnalysisById(id);
      setAnalyses((prev) => prev.filter((item) => (item._id || item.id) !== id));
    } catch (err) {
      alert(`Could not delete record: ${err.message}`);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all analysis history? This cannot be undone.')) {
      return;
    }

    try {
      await clearAllAnalyses();
      setAnalyses([]);
    } catch (err) {
      alert(`Could not clear history: ${err.message}`);
    }
  };

  // Filter and sort items
  const filteredItems = analyses
    .filter((item) => {
      const filename = item.imageFilename || '';
      const matchesSearch = filename.toLowerCase().includes(searchTerm.toLowerCase());

      const pClass = item.predictionClass || item.predicted_class || 'original';
      const uStatus = item.uncertaintyStatus || item.uncertainty_status;
      const isUncertain = uStatus === 'uncertain' || uStatus === 'inconclusive' || uStatus === 'highly_uncertain';

      if (filterClass === 'all') return matchesSearch;
      if (filterClass === 'ai') return matchesSearch && (pClass === 'ai_generated' || pClass === 'ai');
      if (filterClass === 'original') return matchesSearch && pClass === 'original';
      if (filterClass === 'uncertain') return matchesSearch && isUncertain;
      return matchesSearch;
    })
    .sort((a, b) => {
      const timeA = new Date(a.analysisTimestamp || a.analyzed_at || 0).getTime();
      const timeB = new Date(b.analysisTimestamp || b.analyzed_at || 0).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

  return (
    <div className="page history-page">
      <div className="container">
        <div className="page-header">
          <h1>Analysis History</h1>
          <p>
            {isAuthenticated
              ? 'Stored history associated with your user account.'
              : 'Local guest analysis records stored on this device.'}
          </p>
        </div>

        {/* Toolbar: Search, Filters, Clear */}
        <div className="card toolbar-card">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="toolbar-controls">
            <div className="control-group">
              <Filter size={15} />
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="select-input"
              >
                <option value="all">All Classifications</option>
                <option value="original">Original Only</option>
                <option value="ai">AI-Generated Only</option>
                <option value="uncertain">Inconclusive Only</option>
              </select>
            </div>

            <div className="control-group">
              <ArrowUpDown size={15} />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="select-input"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {analyses.length > 0 && (
              <button onClick={handleClearAll} className="btn btn-secondary btn-sm clear-btn">
                <Trash2 size={14} />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {loading && <LoadingSpinner message="Loading analysis records..." />}

        {error && <ErrorMessage message={error} onRetry={fetchHistory} />}

        {!loading && filteredItems.length === 0 && (
          <EmptyState
            title={searchTerm || filterClass !== 'all' ? 'No Matching Analyses' : 'No History Records'}
            description={
              searchTerm || filterClass !== 'all'
                ? 'Try adjusting your search terms or filter selection.'
                : 'Upload an image on the Analyze page to create your first record.'
            }
            action={
              <Link to="/analyze" className="btn btn-primary btn-sm">
                Analyze Image
              </Link>
            }
          />
        )}

        {!loading && filteredItems.length > 0 && (
          <div className="card history-table-card">
            <div className="table-responsive">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Filename</th>
                    <th>Classification</th>
                    <th>Confidence</th>
                    <th>Status</th>
                    <th>Analyzed Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, idx) => {
                    const id = item._id || item.id || item.prediction_id || idx;
                    const pClass = item.predictionClass || item.predicted_class || 'original';
                    const isAi = pClass === 'ai_generated' || pClass === 'ai';
                    const pOrig = item.originalProbability ?? item.original_probability ?? 0;
                    const pAi = item.aiGeneratedProbability ?? item.ai_generated_probability ?? 0;
                    const conf = isAi ? pAi : pOrig;
                    const uStatus = item.uncertaintyStatus || item.uncertainty_status;
                    const isUncertain = uStatus === 'uncertain' || uStatus === 'inconclusive';
                    const time = item.analysisTimestamp || item.analyzed_at;

                    return (
                      <tr key={id}>
                        <td className="filename-cell">
                          <strong>{item.imageFilename || `Image Analysis #${idx + 1}`}</strong>
                        </td>
                        <td>
                          <span className={`badge ${isAi ? 'badge-error' : 'badge-success'}`}>
                            {isAi ? 'AI-Generated' : 'Original'}
                          </span>
                        </td>
                        <td className="mono-cell">{(conf * 100).toFixed(1)}%</td>
                        <td>
                          {isUncertain ? (
                            <span className="badge badge-warning">Inconclusive</span>
                          ) : (
                            <span className="badge badge-info">Consistent</span>
                          )}
                        </td>
                        <td className="time-cell">
                          {time ? new Date(time).toLocaleDateString() : 'Recent'}
                        </td>
                        <td className="action-cell">
                          <Link
                            to={`/results/${id}`}
                            state={{ prediction: item }}
                            className="btn btn-ghost btn-sm"
                            title="View results"
                          >
                            <ExternalLink size={14} />
                            <span>View</span>
                          </Link>
                          <button
                            onClick={() => handleDeleteItem(id)}
                            className="btn btn-ghost btn-sm delete-btn"
                            title="Delete record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .toolbar-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          padding: 16px 20px;
          flex-wrap: wrap;
        }
        .search-box {
          position: relative;
          flex: 1;
          min-width: 220px;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-muted);
        }
        .search-input {
          width: 100%;
          padding: 8px 12px 8px 36px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          outline: none;
        }
        .search-input:focus {
          border-color: var(--color-primary);
        }
        .toolbar-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .control-group {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--color-text-secondary);
        }
        .select-input {
          padding: 8px 12px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background: var(--color-surface);
          font-size: 0.85rem;
          color: var(--color-text-primary);
          outline: none;
        }
        .clear-btn {
          color: var(--color-error);
          border-color: #FECACA;
        }
        .clear-btn:hover {
          background: #FEF2F2;
        }
        .history-table-card {
          padding: 0;
          overflow: hidden;
        }
        .history-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        .history-table th {
          text-align: left;
          padding: 12px 16px;
          background: var(--color-background);
          color: var(--color-text-secondary);
          font-weight: 600;
          font-size: 0.775rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid var(--color-border);
        }
        .history-table td {
          padding: 14px 16px;
          border-bottom: 1px solid var(--color-border);
          color: var(--color-text-primary);
        }
        .history-table tbody tr:last-child td {
          border-bottom: none;
        }
        .history-table tbody tr:hover {
          background: #F8FAFC;
        }
        .filename-cell {
          max-width: 240px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .mono-cell {
          font-family: var(--font-mono);
          font-size: 0.85rem;
        }
        .time-cell {
          font-size: 0.825rem;
          color: var(--color-text-muted);
        }
        .action-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .delete-btn {
          color: var(--color-error);
          padding: 6px;
        }
        .delete-btn:hover {
          background: #FEF2F2;
        }
      `}</style>
    </div>
  );
}
