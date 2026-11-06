"""Random Forest model for TrueLens."""

from __future__ import annotations

import logging
import os
import time
from typing import Any, Dict, Optional

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier

from models.base import BaseModel

logger = logging.getLogger(__name__)


class RandomForestModel(BaseModel):
    MODEL_TYPE = "traditional"
    MODEL_NAME = "random_forest"

    def __init__(
        self,
        random_state: int = 42,
        n_estimators: int = 100,
        max_depth: Optional[int] = None,
        min_samples_split: int = 2,
    ):
        super().__init__()
        self.model = RandomForestClassifier(
            random_state=random_state,
            n_estimators=n_estimators,
            max_depth=max_depth,
            min_samples_split=min_samples_split,
            class_weight="balanced",
            n_jobs=-1,
        )

    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: Optional[np.ndarray] = None,
        y_val: Optional[np.ndarray] = None,
    ) -> Dict[str, Any]:
        logger.info("Training Random Forest on %d samples", len(y_train))
        start = time.time()
        self.model.fit(X_train, y_train)
        self.training_time = time.time() - start
        self.is_trained = True

        info: Dict[str, Any] = {
            "model": self.MODEL_NAME,
            "training_time_seconds": round(self.training_time, 3),
            "n_train_samples": len(y_train),
            "n_features": X_train.shape[1],
            "n_estimators": self.model.n_estimators,
        }
        # Feature importance (top 10)
        importances = self.model.feature_importances_
        top_indices = np.argsort(importances)[-10:][::-1]
        info["top_feature_indices"] = top_indices.tolist()
        info["top_feature_importances"] = importances[top_indices].tolist()

        if X_val is not None and y_val is not None:
            val_metrics = self.evaluate(X_val, y_val)
            info["val_metrics"] = val_metrics
        logger.info("Random Forest trained in %.2fs", self.training_time)
        return info

    def predict(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict(X)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        if X.ndim == 1:
            X = X.reshape(1, -1)
        return self.model.predict_proba(X)

    def save(self, directory: str) -> str:
        self._ensure_dir(directory)
        path = os.path.join(directory, "random_forest.joblib")
        joblib.dump(self.model, path)
        logger.info("Random Forest saved to %s", path)
        return path

    def load(self, directory: str) -> None:
        path = os.path.join(directory, "random_forest.joblib")
        if not os.path.exists(path):
            raise FileNotFoundError(f"Model file not found: {path}")
        self.model = joblib.load(path)
        self.is_trained = True
        logger.info("Random Forest loaded from %s", path)
