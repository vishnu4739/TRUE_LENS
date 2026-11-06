"""Evaluation script for all TrueLens models.

Evaluates all trained models on the held-out test dataset (data/test/real, data/test/ai_generated).
Computes real evaluation metrics:
- Accuracy
- Precision (AI-generated class)
- Recall (AI-generated class)
- F1-Score
- ROC-AUC
- Confusion matrix
Saves individual model JSON results to results/<model_name>.json and a summary to results/summary.json.
If a model has not been trained, it is recorded with status="not_trained" and null metrics.
"""

import json
import logging
import os
import sys
from pathlib import Path
from typing import Any, Dict

import joblib
import numpy as np

# Ensure root of ml-service is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from evaluation.metrics import compute_metrics
from models import MODEL_REGISTRY
from preprocessing.features import FeatureExtractor
from preprocessing.pipeline import ImagePreprocessor
from training.config import (
    DATA_DIR,
    MODELS_DIR,
    RESULTS_DIR,
    TEST_AI_DIR,
    TEST_REAL_DIR,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


ALL_MODELS = [
    ("logistic_regression", "traditional"),
    ("random_forest", "traditional"),
    ("svm", "traditional"),
    ("knn", "traditional"),
    ("xgboost", "traditional"),
    ("cnn", "deep"),
    ("vision_transformer", "deep"),
]


def load_test_data():
    """Load test images for both traditional (feature vector) and deep (raw image) evaluation."""
    preprocessor = ImagePreprocessor()
    extractor = FeatureExtractor()

    real_paths = sorted(list(TEST_REAL_DIR.glob("*.jpg")) + list(TEST_REAL_DIR.glob("*.png")) + list(TEST_REAL_DIR.glob("*.jpeg")))
    ai_paths = sorted(list(TEST_AI_DIR.glob("*.jpg")) + list(TEST_AI_DIR.glob("*.png")) + list(TEST_AI_DIR.glob("*.jpeg")))

    logger.info("Found %d real and %d AI-generated test images", len(real_paths), len(ai_paths))

    trad_features = []
    deep_images = []
    y_test = []

    # Real images (Class 0)
    for p in real_paths:
        try:
            arr_trad = preprocessor.preprocess_for_traditional(str(p))
            feats = extractor.extract(arr_trad)
            trad_features.append(feats)

            pil_img = preprocessor.load_image_from_path(str(p))
            arr_deep = np.array(preprocessor.resize(pil_img, mode="deep"), dtype=np.uint8)
            deep_images.append(arr_deep)

            y_test.append(0)
        except Exception as exc:
            logger.warning("Error reading test file %s: %s", p, exc)

    # AI images (Class 1)
    for p in ai_paths:
        try:
            arr_trad = preprocessor.preprocess_for_traditional(str(p))
            feats = extractor.extract(arr_trad)
            trad_features.append(feats)

            pil_img = preprocessor.load_image_from_path(str(p))
            arr_deep = np.array(preprocessor.resize(pil_img, mode="deep"), dtype=np.uint8)
            deep_images.append(arr_deep)

            y_test.append(1)
        except Exception as exc:
            logger.warning("Error reading test file %s: %s", p, exc)

    X_trad = np.array(trad_features, dtype=np.float32)
    X_deep = np.array(deep_images, dtype=np.uint8)
    y_arr = np.array(y_test, dtype=int)

    return X_trad, X_deep, y_arr


def evaluate_all():
    """Evaluate all 7 models against the test dataset."""
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    # Load dataset info if available
    dataset_version = "TrueLens Synthetic Benchmark v1"
    info_path = DATA_DIR / "dataset_info.json"
    if info_path.exists():
        try:
            with open(info_path, "r") as f:
                d_info = json.load(f)
                dataset_version = d_info.get("dataset_name", dataset_version)
        except Exception:
            pass

    X_trad, X_deep, y_test = load_test_data()

    if len(y_test) == 0:
        logger.error("No test data found in data/test/.")
        return {}

    # Load feature scaler for traditional models
    scaler_path = MODELS_DIR / "scaler.joblib"
    scaler = None
    if scaler_path.exists():
        try:
            scaler = joblib.load(scaler_path)
            X_trad_scaled = scaler.transform(X_trad)
        except Exception as exc:
            logger.warning("Failed loading scaler: %s", exc)
            X_trad_scaled = X_trad
    else:
        X_trad_scaled = X_trad

    summary = {
        "dataset_version": dataset_version,
        "test_sample_count": len(y_test),
        "test_class_distribution": {
            "real": int(np.sum(y_test == 0)),
            "ai_generated": int(np.sum(y_test == 1)),
        },
        "models": [],
    }

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
        display_name = display_names.get(model_key, model_key)
        model_cls = MODEL_REGISTRY.get(model_key)

        result_entry: Dict[str, Any] = {
            "model": display_name,
            "model_key": model_key,
            "model_type": model_type,
            "status": "not_trained",
            "accuracy": None,
            "precision": None,
            "recall": None,
            "f1_score": None,
            "roc_auc": None,
            "confusion_matrix": None,
            "dataset_version": dataset_version,
        }

        if model_cls is not None:
            model_instance = model_cls()
            try:
                model_instance.load(str(MODELS_DIR))
                # Model successfully loaded! Now evaluate on actual test data
                X_eval = X_trad_scaled if model_type == "traditional" else X_deep
                metrics = model_instance.evaluate(X_eval, y_test)

                result_entry["status"] = "trained"
                result_entry["accuracy"] = metrics["accuracy"]
                result_entry["precision"] = metrics["precision"]
                result_entry["recall"] = metrics["recall"]
                result_entry["f1_score"] = metrics["f1_score"]
                result_entry["roc_auc"] = metrics["roc_auc"]
                result_entry["confusion_matrix"] = metrics["confusion_matrix"]
                logger.info(
                    "Evaluated %s: Accuracy=%.4f, F1=%.4f",
                    display_name,
                    metrics["accuracy"],
                    metrics["f1_score"],
                )
            except FileNotFoundError:
                logger.info("Model %s is not trained (no saved weights)", display_name)
            except Exception as exc:
                logger.warning("Evaluation failed for %s: %s", display_name, exc)

        # Save individual model result
        model_result_path = RESULTS_DIR / f"{model_key}.json"
        with open(model_result_path, "w") as f:
            json.dump(result_entry, f, indent=2)

        summary["models"].append(result_entry)

    # Save summary
    with open(RESULTS_DIR / "summary.json", "w") as f:
        json.dump(summary, f, indent=2)

    logger.info("Evaluation complete. Results saved to %s", RESULTS_DIR)
    return summary


if __name__ == "__main__":
    evaluate_all()
