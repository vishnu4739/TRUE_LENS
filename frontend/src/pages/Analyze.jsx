import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import PredictionCard from '../components/PredictionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { analyzeImage } from '../services/analysisService';
import { ArrowRight, RotateCcw } from 'lucide-react';

export default function Analyze() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const result = await analyzeImage(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      result.previewUrl = previewUrl;
      setPrediction(result);
    } catch (err) {
      setError(err.message || 'Image analysis failed. Please verify that the backend and ML service are active.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPrediction(null);
    setError(null);
  };

  return (
    <div className="page analyze-page">
      <div className="container">
        <div className="page-header">
          <h1>Image Authenticity Analysis</h1>
          <p>
            Upload an image to assess whether it exhibits patterns characteristic of 
            AI generation or authentic photography.
          </p>
        </div>

        {!prediction ? (
          <div className="card upload-card">
            <h2 className="card-section-title">Select or Drop Image</h2>
            <p className="card-section-desc">
              Images are validated for format (JPG, JPEG, PNG, WEBP) and size (&lt; 10 MB) prior to transmission.
            </p>

            <ImageUploader
              selectedFile={selectedFile}
              onImageSelect={(file) => {
                setSelectedFile(file);
                setError(null);
              }}
              onRemove={() => setSelectedFile(null)}
            />

            {error && (
              <div style={{ marginTop: '16px' }}>
                <ErrorMessage message={error} onRetry={handleAnalyze} />
              </div>
            )}

            {loading ? (
              <LoadingSpinner message="Extracting features and executing multi-algorithm inference..." />
            ) : (
              <div className="action-bar">
                <button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || loading}
                  className="btn btn-primary"
                >
                  <span>Run Authenticity Analysis</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="results-wrapper">
            <div className="results-actions">
              <button onClick={handleReset} className="btn btn-secondary">
                <RotateCcw size={16} />
                <span>Analyze Another Image</span>
              </button>
            </div>

            <PredictionCard prediction={prediction} />
          </div>
        )}
      </div>

      <style>{`
        .upload-card {
          max-width: 800px;
          margin: 0 auto;
          padding: 32px;
        }
        .card-section-title {
          font-size: 1.25rem;
          margin-bottom: 4px;
        }
        .card-section-desc {
          font-size: 0.9rem;
          margin-bottom: 24px;
        }
        .action-bar {
          margin-top: 24px;
          display: flex;
          justify-content: flex-end;
        }
        .results-wrapper {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 900px;
          margin: 0 auto;
        }
        .results-actions {
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
}
