"""Train all 5 traditional ML models on the TrueLens dataset.

Pipeline:
1. Load train and val images from data/train and data/val
2. Extract HOG, texture, DCT, color features (8,171 features)
3. Train:
   - Logistic Regression
   - Random Forest
   - Support Vector Machine
   - K-Nearest Neighbors
   - XGBoost
4. Save trained models into models/saved/
"""

import logging
import os
import sys
from pathlib import Path

import numpy as np

# Ensure root of ml-service is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from models.knn import KNNModel
from models.logistic_regression import LogisticRegressionModel
from models.random_forest import RandomForestModel
from models.svm import SVMModel
from models.xgboost_model import XGBoostModel
from preprocessing.features import FeatureExtractor
from preprocessing.pipeline import ImagePreprocessor
from training.config import (
    MODELS_DIR,
    TRAIN_AI_DIR,
    TRAIN_REAL_DIR,
    VAL_AI_DIR,
    VAL_REAL_DIR,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def load_dataset_features(real_dir: Path, ai_dir: Path, preprocessor: ImagePreprocessor, extractor: FeatureExtractor):
    """Load images and extract feature vectors."""
    features_list = []
    labels_list = []

    # Real photos (Class 0)
    real_paths = sorted(list(real_dir.glob("*.jpg")) + list(real_dir.glob("*.png")) + list(real_dir.glob("*.jpeg")))
    for p in real_paths:
        try:
            arr = preprocessor.preprocess_for_traditional(str(p))
            feats = extractor.extract(arr)
            features_list.append(feats)
            labels_list.append(0)
        except Exception as exc:
            logger.warning("Failed processing %s: %s", p, exc)

    # AI-generated (Class 1)
    ai_paths = sorted(list(ai_dir.glob("*.jpg")) + list(ai_dir.glob("*.png")) + list(ai_dir.glob("*.jpeg")))
    for p in ai_paths:
        try:
            arr = preprocessor.preprocess_for_traditional(str(p))
            feats = extractor.extract(arr)
            features_list.append(feats)
            labels_list.append(1)
        except Exception as exc:
            logger.warning("Failed processing %s: %s", p, exc)

    X = np.array(features_list, dtype=np.float32)
    y = np.array(labels_list, dtype=int)
    return X, y


def train_traditional_models():
    """Train and save traditional ML models."""
    logger.info("Initializing preprocessor and feature extractor...")
    preprocessor = ImagePreprocessor()
    extractor = FeatureExtractor()

    logger.info("Extracting features from training set...")
    X_train, y_train = load_dataset_features(TRAIN_REAL_DIR, TRAIN_AI_DIR, preprocessor, extractor)
    logger.info("Loaded X_train shape: %s, y_train: %d", X_train.shape, len(y_train))

    logger.info("Extracting features from validation set...")
    X_val, y_val = load_dataset_features(VAL_REAL_DIR, VAL_AI_DIR, preprocessor, extractor)
    logger.info("Loaded X_val shape: %s, y_val: %d", X_val.shape, len(y_val))

    if len(X_train) == 0:
        logger.error("No training data found. Please run generate_synthetic_data or populate data/train.")
        return

    os.makedirs(MODELS_DIR, exist_ok=True)

    # Models to train
    models = [
        LogisticRegressionModel(),
        RandomForestModel(),
        SVMModel(),
        KNNModel(),
        XGBoostModel(),
    ]

    results = {}
    for model in models:
        logger.info("--- Training %s ---", model.MODEL_NAME)
        info = model.train(X_train, y_train, X_val, y_val)
        model_path = model.save(str(MODELS_DIR))
        results[model.MODEL_NAME] = {
            "status": "trained",
            "info": info,
            "path": model_path,
        }
        logger.info("Successfully trained and saved %s to %s", model.MODEL_NAME, model_path)

    return results


if __name__ == "__main__":
    train_traditional_models()
