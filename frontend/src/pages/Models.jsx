import React, { useState, useEffect } from 'react';
import { getModelComparison, getModelMetrics } from '../services/modelService';
import ModelComparisonTable from '../components/ModelComparisonTable';
import ConfusionMatrix from '../components/ConfusionMatrix';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Cpu, Award, Database, Layers } from 'lucide-react';

export default function Models() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);
  const [metricsData, setMetricsData] = useState(null);
  const [selectedModelKey, setSelectedModelKey] = useState(null);

  useEffect(() => {
    fetchModelsData();
  }, []);

  const fetchModelsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [compRes, metRes] = await Promise.all([
        getModelComparison(),
        getModelMetrics(),
      ]);

      const compList = compRes.comparison || [];
      setComparisonData(compList);
      setMetricsData(metRes);

      // Select first trained model for confusion matrix
      const firstTrained = (metRes.models || []).find((m) => m.confusion_matrix != null);
      if (firstTrained) {
        setSelectedModelKey(firstTrained.model_key);
      }
    } catch (err) {
      setError(err.message || 'Failed retrieving model comparison metrics.');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data only from trained models
  const chartData = comparisonData
    .filter((m) => m.status === 'trained' && m.accuracy != null)
    .map((m) => ({
      name: m.model_name.length > 14 ? m.model_name.substring(0, 12) + '...' : m.model_name,
      fullName: m.model_name,
      Accuracy: Number(((m.accuracy || 0) * 100).toFixed(1)),
      Precision: Number(((m.precision || 0) * 100).toFixed(1)),
      Recall: Number(((m.recall || 0) * 100).toFixed(1)),
      F1: Number(((m.f1_score || 0) * 100).toFixed(1)),
    }));

  const selectedModelMetrics = (metricsData?.models || []).find(
    (m) => m.model_key === selectedModelKey
  );

  return (
    <div className="page models-page">
      <div className="container">
        <div className="page-header">
          <h1>Model Benchmarks</h1>
          <p>
            Empirical accuracy and performance metrics across 7 forensic detection algorithms.
          </p>
        </div>

        {loading && <LoadingSpinner message="Loading empirical evaluation metrics..." />}

        {error && <ErrorMessage message={error} onRetry={fetchModelsData} />}

        {!loading && (
          <div className="models-content">
            {/* Model Comparison Table */}
            <div className="section-block">
              <div className="section-header-block">
                <div className="header-icon-box">
                  <Award size={20} />
                </div>
                <div>
                  <h2 className="block-title">Model Performance Comparison</h2>
                  <p className="block-desc">
                    Metrics evaluated on an independent, non-overlapping test partition.
                  </p>
                </div>
              </div>

              <ModelComparisonTable models={comparisonData} />
            </div>

            {/* Performance Charts (Recharts) */}
            {chartData.length > 0 ? (
              <div className="section-block">
                <div className="section-header-block">
                  <div className="header-icon-box">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h2 className="block-title">Comparative Metric Visualization</h2>
                    <p className="block-desc">
                      Percentage scores across evaluated models (Accuracy, Precision, Recall, F1).
                    </p>
                  </div>
                </div>

                <div className="card chart-card">
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                        <YAxis domain={[0, 100]} stroke="#64748B" fontSize={12} unit="%" />
                        <Tooltip
                          formatter={(value) => [`${value}%`]}
                          contentStyle={{
                            background: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Bar dataKey="Accuracy" fill="#1F2937" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Precision" fill="#2563EB" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Recall" fill="#059669" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="F1" fill="#D97706" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card empty-chart-notice">
                <p>
                  Performance visualization charts will generate as soon as trained models 
                  complete their test evaluation suite.
                </p>
              </div>
            )}

            {/* Confusion Matrix Section */}
            {metricsData?.models && metricsData.models.some((m) => m.confusion_matrix != null) && (
              <div className="section-block">
                <div className="section-header-block">
                  <div className="header-icon-box">
                    <Cpu size={20} />
                  </div>
                  <div>
                    <h2 className="block-title">Confusion Matrix Inspection</h2>
                    <p className="block-desc">
                      Classification error distribution for individual evaluated algorithms.
                    </p>
                  </div>
                </div>

                {/* Model Selector Tabs */}
                <div className="matrix-selector-bar">
                  {(metricsData.models || [])
                    .filter((m) => m.confusion_matrix != null)
                    .map((m) => (
                      <button
                        key={m.model_key}
                        onClick={() => setSelectedModelKey(m.model_key)}
                        className={`btn btn-sm ${
                          selectedModelKey === m.model_key ? 'btn-primary' : 'btn-secondary'
                        }`}
                      >
                        {m.model}
                      </button>
                    ))}
                </div>

                {selectedModelMetrics && (
                  <ConfusionMatrix
                    matrix={selectedModelMetrics.confusion_matrix}
                    modelName={selectedModelMetrics.model}
                  />
                )}
              </div>
            )}

            {/* Dataset & Methodology Notes */}
            <div className="card dataset-info-card">
              <div className="info-header">
                <Database size={18} />
                <h3 className="info-title">Evaluation Dataset & Methodology</h3>
              </div>
              <div className="info-body">
                <p>
                  <strong>Dataset Distribution:</strong> Models are evaluated against an 
                  isolated test subset comprising camera photographs and procedurally synthesized images.
                </p>
                <p>
                  <strong>Feature Representation:</strong> Traditional algorithms utilize 
                  HOG gradient features, Local Binary Patterns (LBP) for texture granularity, 
                  DCT frequency transform coefficients, and color moment statistics.
                </p>
                <p>
                  <strong>Deterministic Reproducibility:</strong> Feature extraction and 
                  dataset splitting employ a fixed random seed (42) to eliminate data leakage.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .models-content {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        .section-block {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .section-header-block {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .header-icon-box {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: var(--color-background);
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary);
          flex-shrink: 0;
        }
        .block-title {
          font-size: 1.25rem;
          margin-bottom: 2px;
        }
        .block-desc {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
        }
        .chart-card {
          padding: 24px;
        }
        .chart-wrapper {
          width: 100%;
        }
        .matrix-selector-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 8px;
        }
        .dataset-info-card {
          padding: 24px;
          background: var(--color-background);
        }
        .info-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          color: var(--color-text-primary);
        }
        .info-title {
          font-size: 1rem;
          font-weight: 600;
        }
        .info-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 0.875rem;
          line-height: 1.55;
          color: var(--color-text-secondary);
        }
        .info-body strong {
          color: var(--color-text-primary);
        }
        .empty-chart-notice {
          padding: 32px;
          text-align: center;
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
