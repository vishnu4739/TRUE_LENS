import React from 'react';
import { Shield, BookOpen, Layers, BarChart2, AlertTriangle, FileCode } from 'lucide-react';

export default function About() {
  return (
    <div className="page about-page">
      <div className="container">
        <div className="page-header">
          <h1>About TrueLens</h1>
          <p>
            An academic system for evaluating image authenticity through multi-tier machine 
            learning feature extraction and classification.
          </p>
        </div>

        <div className="about-sections">
          {/* Section 1: Objective */}
          <div className="card about-card">
            <div className="about-header">
              <Shield size={22} className="about-icon" />
              <h2>1. Project Objective</h2>
            </div>
            <p>
              TrueLens is built to research and demonstrate how statistical patterns differ 
              between natural camera-captured photographs and synthetically generated imagery. 
              As diffusion architectures and generative adversarial networks have advanced, 
              detecting subtle algorithmic fingerprints has become critical for media forensics.
            </p>
            <p>
              The system allows users to upload images, evaluate them across multiple traditional 
              and deep learning classifiers, inspect per-model confidence distributions, and examine 
              empirical benchmark metrics on independent test partitions.
            </p>
          </div>

          {/* Section 2: Methodology */}
          <div className="card about-card">
            <div className="about-header">
              <BookOpen size={22} className="about-icon" />
              <h2>2. Detection Methodology</h2>
            </div>
            <p>
              TrueLens combines spatial, frequency, and textural analysis pipelines to characterize 
              images without relying on a single fallible indicator:
            </p>
            <ul className="about-list">
              <li>
                <strong>Histogram of Oriented Gradients (HOG):</strong> Measures edge orientations 
                and structural edge regularity across standardized 8x8 spatial cells.
              </li>
              <li>
                <strong>Local Binary Patterns (LBP):</strong> Captures micro-texture variations, 
                differentiating between natural camera sensor noise and latent upsampling smoothing.
              </li>
              <li>
                <strong>Discrete Cosine Transform (DCT):</strong> Analyzes frequency distributions. 
                Generative models often leave characteristic high-frequency harmonic anomalies 
                in the Fourier/DCT domain.
              </li>
              <li>
                <strong>Color Statistics:</strong> Calculates higher-order moments (mean, variance, 
                skewness) across individual RGB color channels to detect abnormal color co-occurrence.
              </li>
            </ul>
          </div>

          {/* Section 3: Machine Learning Algorithms */}
          <div className="card about-card" id="algorithms">
            <div className="about-header">
              <Layers size={22} className="about-icon" />
              <h2>3. Implemented Machine Learning Algorithms</h2>
            </div>
            <p>
              The system implements 7 distinct algorithms categorized into traditional classifiers 
              and deep neural architectures:
            </p>
            <div className="grid-2 algo-grid">
              <div className="algo-box">
                <h4>Traditional Classifiers</h4>
                <ul>
                  <li><strong>Logistic Regression:</strong> Linear baseline optimizing log-loss.</li>
                  <li><strong>Random Forest:</strong> Ensemble of 100 decision trees with bootstrap aggregation.</li>
                  <li><strong>Support Vector Machine (SVM):</strong> RBF-kernel classifier maximizing margin boundaries.</li>
                  <li><strong>K-Nearest Neighbors (KNN):</strong> Instance-based metric distance classification.</li>
                  <li><strong>XGBoost / Gradient Boosting:</strong> Iterative gradient-boosted decision trees.</li>
                </ul>
              </div>
              <div className="algo-box">
                <h4>Deep Learning Architectures</h4>
                <ul>
                  <li><strong>Convolutional Neural Network (CNN):</strong> 4-block hierarchical feature extractor with batch normalization, adaptive pooling, and dropout regularization.</li>
                  <li><strong>Vision Transformer (ViT):</strong> Patch embedding projection (16x16) with multi-head self-attention encoder blocks and class token classification.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 4: Evaluation Metrics */}
          <div className="card about-card" id="metrics">
            <div className="about-header">
              <BarChart2 size={22} className="about-icon" />
              <h2>4. Evaluation Metrics & Class Definition</h2>
            </div>
            <p>
              Evaluation is conducted on a strictly isolated test set using standard binary classification metrics:
            </p>
            <ul className="about-list">
              <li><strong>Class 0 (Original):</strong> Natural photograph captured by camera sensors.</li>
              <li><strong>Class 1 (AI-Generated):</strong> Synthetic image created via generative models.</li>
              <li><strong>Accuracy:</strong> Ratio of correct predictions over total test samples.</li>
              <li><strong>Precision (AI Class):</strong> Proportion of identified AI images that are truly synthetic: TP / (TP + FP).</li>
              <li><strong>Recall (AI Class):</strong> Proportion of actual synthetic images correctly detected: TP / (TP + FN).</li>
              <li><strong>F1-Score:</strong> Harmonic mean of precision and recall.</li>
              <li><strong>ROC-AUC:</strong> Area under the Receiver Operating Characteristic curve.</li>
            </ul>
          </div>

          {/* Section 5: System Limitations */}
          <div className="card about-card" id="limitations">
            <div className="about-header">
              <AlertTriangle size={22} className="about-icon" />
              <h2>5. System Limitations & Forensic Boundaries</h2>
            </div>
            <p>
              To maintain academic integrity, TrueLens acknowledges the following constraints:
            </p>
            <ul className="about-list">
              <li>
                <strong>No Guaranteed Detection:</strong> No machine learning model is 100% accurate. 
                Predictions are statistical likelihood estimates and should not be used as the sole 
                basis in formal disputes, academic investigations, or legal procedures.
              </li>
              <li>
                <strong>Domain Shift:</strong> Models trained on specific generative models may have 
                lower accuracy when evaluating outputs from newer, unseen generation architectures.
              </li>
              <li>
                <strong>Image Post-Processing:</strong> Heavy JPEG compression, repeated resizing, 
                or filtering can degrade characteristic noise signatures, potentially leading to 
                inconclusive or false positive/negative results.
              </li>
              <li>
                <strong>Uncertainty Handling:</strong> TrueLens explicitly reports an inconclusive 
                status when model predictions fall between 40% and 60% probability or when ensemble 
                models strongly disagree.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        .about-sections {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 900px;
          margin: 0 auto;
        }
        .about-card {
          padding: 28px 32px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .about-header {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--color-primary);
        }
        .about-header h2 {
          font-size: 1.25rem;
          color: var(--color-text-primary);
        }
        .about-icon {
          color: var(--color-primary);
          flex-shrink: 0;
        }
        .about-card p {
          font-size: 0.95rem;
          line-height: 1.6;
        }
        .about-list {
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 0.925rem;
          color: var(--color-text-secondary);
        }
        .about-list strong {
          color: var(--color-text-primary);
        }
        .algo-grid {
          margin-top: 8px;
        }
        .algo-box {
          background: var(--color-background);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 18px 20px;
        }
        .algo-box h4 {
          font-size: 0.95rem;
          margin-bottom: 10px;
          color: var(--color-primary);
        }
        .algo-box ul {
          padding-left: 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.85rem;
          color: var(--color-text-secondary);
        }
        .algo-box strong {
          color: var(--color-text-primary);
        }
        @media (max-width: 768px) {
          .about-card {
            padding: 20px;
          }
          .algo-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
