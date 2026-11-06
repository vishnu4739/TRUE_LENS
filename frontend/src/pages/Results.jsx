import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getAnalysisById } from '../services/analysisService';
import PredictionCard from '../components/PredictionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { ArrowLeft, Clock, FileText } from 'lucide-react';

export default function Results() {
  const { id } = useParams();
  const location = useLocation();
  const [prediction, setPrediction] = useState(location.state?.prediction || null);
  const [loading, setLoading] = useState(!prediction);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!prediction && id) {
      fetchAnalysis();
    }
  }, [id]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAnalysisById(id);
      setPrediction(data.prediction || data);
    } catch (err) {
      setError(err.message || 'Unable to locate analysis record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page results-page">
      <div className="container">
        <div className="results-nav-bar">
          <Link to="/analyze" className="btn btn-secondary btn-sm back-link">
            <ArrowLeft size={16} />
            <span>New Analysis</span>
          </Link>

          <span className="analysis-id-badge">
            <FileText size={14} />
            <span>Record ID: {id}</span>
          </span>
        </div>

        {loading && <LoadingSpinner message="Retrieving analysis record..." />}

        {error && <ErrorMessage message={error} onRetry={fetchAnalysis} />}

        {prediction && (
          <div className="results-content-wrap">
            <PredictionCard prediction={prediction} />
          </div>
        )}
      </div>

      <style>{`
        .results-nav-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .analysis-id-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: var(--color-text-muted);
          font-family: var(--font-mono);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          padding: 4px 10px;
          border-radius: var(--radius-md);
        }
        .results-content-wrap {
          max-width: 900px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
