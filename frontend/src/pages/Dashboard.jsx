import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAnalysisHistory, getGuestHistory } from '../services/analysisService';
import { getModelComparison } from '../services/modelService';
import { useAuth } from '../context/AuthContext';
import MetricCard from '../components/MetricCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { Activity, ShieldCheck, AlertTriangle, HelpCircle, Layers, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    aiGenerated: 0,
    original: 0,
    uncertain: 0,
  });
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [modelSummary, setModelSummary] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      let records = [];

      if (isAuthenticated) {
        try {
          const hist = await getAnalysisHistory(1, 10);
          records = hist.predictions || [];
        } catch {
          // Fall back to guest storage if auth endpoint fails or mongo is empty
          records = getGuestHistory();
        }
      } else {
        records = getGuestHistory();
      }

      // Calculate honest stats from real recorded analyses
      let aiCount = 0;
      let origCount = 0;
      let uncCount = 0;

      records.forEach((r) => {
        const uStatus = r.uncertaintyStatus || r.uncertainty_status;
        if (uStatus === 'uncertain' || uStatus === 'inconclusive' || uStatus === 'highly_uncertain') {
          uncCount++;
        }
        const pClass = r.predictionClass || r.predicted_class;
        if (pClass === 'ai_generated' || pClass === 'ai') {
          aiCount++;
        } else {
          origCount++;
        }
      });

      setStats({
        total: records.length,
        aiGenerated: aiCount,
        original: origCount,
        uncertain: uncCount,
      });
      setRecentAnalyses(records.slice(0, 5));

      // Fetch real model evaluation summary
      try {
        const comp = await getModelComparison();
        setModelSummary(comp.comparison || []);
      } catch (err) {
        console.warn('Model summary currently unavailable', err.message);
      }
    } catch (err) {
      setError(err.message || 'Failed loading dashboard records.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page dashboard-page">
      <div className="container">
        <div className="page-header">
          <h1>System Dashboard</h1>
          <p>
            Real-time verification history and forensic model performance.
          </p>
        </div>

        {loading && <LoadingSpinner message="Aggregating records and metrics..." />}

        {error && <ErrorMessage message={error} onRetry={fetchDashboardData} />}

        {!loading && (
          <div className="dashboard-content">
            {/* Metric Stat Cards */}
            <div className="grid-4 metrics-overview">
              <MetricCard
                title="Total Analyses"
                value={stats.total}
                subtitle="Cumulative inspection requests"
                icon={Activity}
              />
              <MetricCard
                title="AI-Generated"
                value={stats.aiGenerated}
                subtitle="Classified as synthetic"
                icon={AlertTriangle}
                badge={{ text: 'AI', className: 'badge-error' }}
              />
              <MetricCard
                title="Original Photos"
                value={stats.original}
                subtitle="Classified as camera capture"
                icon={ShieldCheck}
                badge={{ text: 'Real', className: 'badge-success' }}
              />
              <MetricCard
                title="Inconclusive"
                value={stats.uncertain}
                subtitle="Low confidence / conflicting"
                icon={HelpCircle}
                badge={{ text: 'Review', className: 'badge-warning' }}
              />
            </div>

            {/* Recent Analyses + Model Overview Grid */}
            <div className="grid-2 dashboard-sections">
              {/* Recent Analyses */}
              <div className="card section-card">
                <div className="card-header-row">
                  <h3 className="section-title">Recent Inspections</h3>
                  <Link to="/history" className="view-all-link">
                    <span>View all</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                {recentAnalyses.length === 0 ? (
                  <EmptyState
                    title="No Analyses Recorded"
                    description="Upload an image in the analysis tab to populate history records."
                    action={
                      <Link to="/analyze" className="btn btn-primary btn-sm">
                        Analyze Image
                      </Link>
                    }
                  />
                ) : (
                  <div className="recent-list">
                    {recentAnalyses.map((item, idx) => {
                      const id = item._id || item.id || item.prediction_id || idx;
                      const pClass = item.predictionClass || item.predicted_class || 'original';
                      const isAi = pClass === 'ai_generated' || pClass === 'ai';
                      const uStatus = item.uncertaintyStatus || item.uncertainty_status;
                      const isUncertain = uStatus === 'uncertain' || uStatus === 'inconclusive' || uStatus === 'highly_uncertain';
                      const time = item.analysisTimestamp || item.analyzed_at;

                      return (
                        <div key={id} className="recent-item">
                          <div className="item-main">
                            <span className="item-filename">
                              {item.imageFilename || `Inspection #${idx + 1}`}
                            </span>
                            <span className="item-time">
                              {time ? new Date(time).toLocaleDateString() : 'Recent'}
                            </span>
                          </div>
                          <div className="item-meta">
                            <span className={`badge ${isUncertain ? 'badge-warning' : isAi ? 'badge-error' : 'badge-success'}`}>
                              {isUncertain ? 'Inconclusive' : isAi ? 'Not Original' : 'Original'}
                            </span>
                            <Link to={`/results/${id}`} state={{ prediction: item }} className="btn btn-ghost btn-sm">
                              Inspect
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Model Performance Snapshot */}
              <div className="card section-card">
                <div className="card-header-row">
                  <h3 className="section-title">Model Evaluation Snapshot</h3>
                  <Link to="/models" className="view-all-link">
                    <span>Full Evaluation</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                {modelSummary.length === 0 ? (
                  <EmptyState
                    title="Evaluation Data Loading"
                    description="Evaluation results will appear once model test suites have been executed."
                  />
                ) : (
                  <div className="summary-list">
                    {modelSummary.map((m, idx) => {
                      const isTrained = m.status === 'trained' && m.accuracy != null;
                      return (
                        <div key={m.model_key || idx} className="summary-item">
                          <div className="summary-info">
                            <span className="summary-name">{m.model_name || m.model}</span>
                            <span className="summary-type">
                              {m.model_type === 'deep' ? 'Deep Learning' : 'Traditional'}
                            </span>
                          </div>
                          <div className="summary-score">
                            {isTrained ? (
                              <span className="score-badge">
                                {(m.accuracy * 100).toFixed(1)}% acc
                              </span>
                            ) : (
                              <span className="badge badge-warning">Not trained</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .metrics-overview {
          margin-bottom: 32px;
        }
        .dashboard-sections {
          align-items: flex-start;
        }
        .section-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .card-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--color-border);
        }
        .section-title {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .view-all-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.85rem;
          color: var(--color-accent);
          font-weight: 500;
        }
        .recent-list,
        .summary-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .recent-item,
        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: var(--color-background);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
        }
        .item-main,
        .summary-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .item-filename,
        .summary-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        .item-time,
        .summary-type {
          font-size: 0.775rem;
          color: var(--color-text-muted);
        }
        .item-meta {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .item-prob {
          font-family: var(--font-mono);
          font-size: 0.825rem;
          color: var(--color-text-secondary);
        }
        .score-badge {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-primary);
          background: white;
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border);
        }
      `}</style>
    </div>
  );
}
