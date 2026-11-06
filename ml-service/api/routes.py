"""FastAPI routes for TrueLens ML Service."""

import datetime
import json
import logging
import os
import uuid
from pathlib import Path
from typing import Dict, List, Optional

import joblib
import numpy as np
from fastapi import APIRouter, File, HTTPException, UploadFile, status

from api.schemas import (
    ComparisonResponse,
    EvaluateResponse,
    HealthResponse,
    MetricsResponse,
    ModelComparisonEntry,
    ModelMetricEntry,
    PredictResponse,
    SingleModelPrediction,
)
from evaluation.evaluate import ALL_MODELS, evaluate_all
from models import MODEL_REGISTRY
from models.base import BaseModel
from preprocessing.features import FeatureExtractor
from preprocessing.pipeline import ImagePreprocessor
from training.config import MODELS_DIR, RESULTS_DIR

logger = logging.getLogger(__name__)

router = APIRouter()

# Global state loaded at startup
loaded_models: Dict[str, BaseModel] = {}
feature_scaler = None
preprocessor = ImagePreprocessor()
feature_extractor = FeatureExtractor()


def load_all_saved_models():
    """Attempt to load all trained models from models/saved/ directory."""
    global loaded_models, feature_scaler

    # Load scaler if available
    scaler_path = MODELS_DIR / "scaler.joblib"
    if scaler_path.exists():
        try:
            feature_scaler = joblib.load(scaler_path)
            logger.info("Loaded feature scaler from %s", scaler_path)
        except Exception as exc:
            logger.warning("Failed loading feature scaler: %s", exc)
            feature_scaler = None

    loaded_models.clear()
    for model_key, model_cls in MODEL_REGISTRY.items():
        try:
            instance = model_cls()
            instance.load(str(MODELS_DIR))
            loaded_models[model_key] = instance
            logger.info("Loaded model: %s", model_key)
        except FileNotFoundError:
            logger.info("Model not trained yet: %s", model_key)
        except Exception as exc:
            logger.warning("Could not load model %s: %s", model_key, exc)


# ─── GET /health ─────────────────────────────────────────────────────────────

@router.get("/health", response_model=HealthResponse)
def get_health():
    return HealthResponse(
        status="ok",
        service="TrueLens ML Service",
        version="1.0.0",
        available_models=list(MODEL_REGISTRY.keys()),
        loaded_models=list(loaded_models.keys()),
    )


# ─── GET /models ────────────────────────────────────────────────────────────

@router.get("/models")
def get_models():
    """List all supported algorithms and their current loading/training status."""
    result = []
    display_names = {
        "logistic_regression": "Logistic Regression",
        "random_forest": "Random Forest",
        "svm": "Support Vector Machine",
        "knn": "K-Nearest Neighbors",
        "xgboost": "XGBoost",
        "cnn": "Convolutional Neural Network",
        "vision_transformer": "Vision Transformer",
    }
    for model_key, model_type in ALL_MODELS:
        is_loaded = model_key in loaded_models
        result.append({
            "key": model_key,
            "name": display_names.get(model_key, model_key),
            "type": model_type,
            "status": "trained" if is_loaded else "not_trained",
        })
    return {"models": result}


# ─── GET /models/comparison ─────────────────────────────────────────────────

@router.get("/models/comparison", response_model=ComparisonResponse)
def get_model_comparison():
    """Return model comparison table with actual evaluation metrics from results/summary.json."""
    summary_path = RESULTS_DIR / "summary.json"
    if not summary_path.exists():
        # Fall back to evaluating or returning not_trained records
        display_names = {
            "logistic_regression": "Logistic Regression",
            "random_forest": "Random Forest",
            "svm": "Support Vector Machine",
            "knn": "K-Nearest Neighbors",
            "xgboost": "XGBoost",
            "cnn": "Convolutional Neural Network",
            "vision_transformer": "Vision Transformer",
        }
        comparison_list = []
        for idx, (m_key, m_type) in enumerate(ALL_MODELS, 1):
            comparison_list.append(
                ModelComparisonEntry(
                    rank=idx,
                    model_name=display_names.get(m_key, m_key),
                    model_key=m_key,
                    model_type=m_type,
                    status="not_trained",
                    accuracy=None,
                    precision=None,
                    recall=None,
                    f1_score=None,
                    roc_auc=None,
                )
            )
        return ComparisonResponse(
            dataset_version=None,
            total_models=len(ALL_MODELS),
            trained_models_count=0,
            comparison=comparison_list,
        )

    with open(summary_path, "r") as f:
        summary_data = json.load(f)

    models_data = summary_data.get("models", [])
    # Sort trained models by accuracy descending, then untrained
    trained_models = [m for m in models_data if m.get("status") == "trained" and m.get("accuracy") is not None]
    untrained_models = [m for m in models_data if m.get("status") != "trained" or m.get("accuracy") is None]

    trained_models.sort(key=lambda x: x.get("accuracy", 0.0), reverse=True)

    sorted_list = trained_models + untrained_models
    comparison_entries = []
    for rank, m in enumerate(sorted_list, 1):
        comparison_entries.append(
            ModelComparisonEntry(
                rank=rank,
                model_name=m.get("model", m.get("model_key")),
                model_key=m.get("model_key", ""),
                model_type=m.get("model_type", "traditional"),
                status=m.get("status", "not_trained"),
                accuracy=m.get("accuracy"),
                precision=m.get("precision"),
                recall=m.get("recall"),
                f1_score=m.get("f1_score"),
                roc_auc=m.get("roc_auc"),
            )
        )

    return ComparisonResponse(
        dataset_version=summary_data.get("dataset_version"),
        total_models=len(ALL_MODELS),
        trained_models_count=len(trained_models),
        comparison=comparison_entries,
    )


# ─── GET /metrics ────────────────────────────────────────────────────────────

@router.get("/metrics", response_model=MetricsResponse)
def get_metrics():
    """Return actual evaluation metrics from saved JSON files."""
    summary_path = RESULTS_DIR / "summary.json"
    if not summary_path.exists():
        # If evaluation hasn't been run, return empty placeholder state
        entries = []
        for m_key, m_type in ALL_MODELS:
            entries.append(
                ModelMetricEntry(
                    model=m_key.replace("_", " ").title(),
                    model_key=m_key,
                    model_type=m_type,
                    status="not_trained",
                )
            )
        return MetricsResponse(
            dataset_version=None,
            test_sample_count=0,
            models=entries,
        )

    with open(summary_path, "r") as f:
        summary_data = json.load(f)

    metric_entries = []
    for m in summary_data.get("models", []):
        metric_entries.append(
            ModelMetricEntry(
                model=m.get("model", ""),
                model_key=m.get("model_key", ""),
                model_type=m.get("model_type", "traditional"),
                status=m.get("status", "not_trained"),
                accuracy=m.get("accuracy"),
                precision=m.get("precision"),
                recall=m.get("recall"),
                f1_score=m.get("f1_score"),
                roc_auc=m.get("roc_auc"),
                confusion_matrix=m.get("confusion_matrix"),
                dataset_version=m.get("dataset_version"),
            )
        )

    return MetricsResponse(
        dataset_version=summary_data.get("dataset_version"),
        test_sample_count=summary_data.get("test_sample_count", 0),
        models=metric_entries,
    )


# ─── POST /evaluate ──────────────────────────────────────────────────────────

@router.post("/evaluate", response_model=EvaluateResponse)
def trigger_evaluate():
    """Run full evaluation suite on test dataset and save results."""
    summary = evaluate_all()
    # Reload models after evaluation
    load_all_saved_models()
    return EvaluateResponse(
        message="Evaluation completed successfully",
        summary=summary,
    )


# ─── POST /predict ───────────────────────────────────────────────────────────

@router.post("/predict", response_model=PredictResponse)
async def predict_image(file: UploadFile = File(...)):
    """Analyze an uploaded image using all trained ML models."""
    if not file:
        raise HTTPException(status_code=400, detail="No image file provided")

    # Validate MIME type
    if file.content_type not in ["image/jpeg", "image/png", "image/webp", "image/bmp"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image format '{file.content_type}'. Supported: JPG, JPEG, PNG, WEBP.",
        )

    # Read bytes
    data = await file.read()
    if len(data) == 0:
        raise HTTPException(status_code=400, detail="Uploaded image file is empty")

    try:
        ImagePreprocessor.validate_image_bytes(data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    if len(loaded_models) == 0:
        # Check if saved models exist and try reloading
        load_all_saved_models()
        if len(loaded_models) == 0:
            raise HTTPException(
                status_code=503,
                detail="No trained machine learning models are currently loaded on the server. Please train models first.",
            )

    # Preprocess inputs
    # Traditional: extract features and scale
    arr_trad = preprocessor.preprocess_for_traditional(data)
    feats = feature_extractor.extract(arr_trad).reshape(1, -1)
    if feature_scaler is not None:
        try:
            feats_scaled = feature_scaler.transform(feats)
        except Exception:
            feats_scaled = feats
    else:
        feats_scaled = feats

    # Deep: 224x224 RGB image
    pil_img = ImagePreprocessor.decode_image(data)
    arr_deep = np.array(preprocessor.resize(pil_img, mode="deep"), dtype=np.uint8)

    model_predictions: List[SingleModelPrediction] = []
    display_names = {
        "logistic_regression": "Logistic Regression",
        "random_forest": "Random Forest",
        "svm": "Support Vector Machine",
        "knn": "K-Nearest Neighbors",
        "xgboost": "XGBoost",
        "cnn": "Convolutional Neural Network",
        "vision_transformer": "Vision Transformer",
    }

    orig_probs = []
    ai_probs = []

    for model_key, model_instance in loaded_models.items():
        try:
            if model_instance.MODEL_TYPE == "traditional":
                proba = model_instance.predict_proba(feats_scaled)
            else:
                proba = model_instance.predict_proba(arr_deep)

            p_real = float(proba[0, 0])
            p_ai = float(proba[0, 1])

            predicted_label = "ai_generated" if p_ai >= 0.5 else "original"
            is_model_uncertain = 0.40 <= p_ai <= 0.60

            orig_probs.append(p_real)
            ai_probs.append(p_ai)

            model_predictions.append(
                SingleModelPrediction(
                    model_name=display_names.get(model_key, model_key),
                    predicted_class=predicted_label,
                    confidence=round(float(max(p_real, p_ai)), 4),
                    original_probability=round(p_real, 4),
                    ai_generated_probability=round(p_ai, 4),
                    is_uncertain=is_model_uncertain,
                )
            )
        except Exception as exc:
            logger.warning("Inference failed for model %s: %s", model_key, exc)

    if len(model_predictions) == 0:
        raise HTTPException(
            status_code=500,
            detail="All available models failed to process the image.",
        )

    # Real unweighted ensemble mean of available models
    mean_orig = float(np.mean(orig_probs))
    mean_ai = float(np.mean(ai_probs))

    # Determine uncertainty status
    # Inconclusive if mean probability is very close to 0.50 (between 0.45 and 0.55)
    # Uncertain if between 0.40 and 0.60 or if models strongly disagree
    diff = abs(mean_ai - mean_orig)
    if diff < 0.10:
        uncertainty_status = "inconclusive"
    elif diff < 0.25:
        uncertainty_status = "uncertain"
    else:
        uncertainty_status = "certain"

    predicted_class = "ai_generated" if mean_ai > mean_orig else "original"

    return PredictResponse(
        prediction_id=str(uuid.uuid4()),
        predicted_class=predicted_class,
        original_probability=round(mean_orig, 4),
        ai_generated_probability=round(mean_ai, 4),
        uncertainty_status=uncertainty_status,
        model_version="1.0.0",
        model_predictions=model_predictions,
        available_model_count=len(model_predictions),
        analyzed_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
    )
