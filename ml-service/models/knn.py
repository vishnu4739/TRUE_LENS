"""K-Nearest Neighbors model for TrueLens."""

from __future__ import annotations

import logging
import os
import time
from typing import Any, Dict, Optional

import joblib
import numpy as np
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler

from models.base import BaseModel

logger = logging.getLogger(__name__)


class KNNModel(BaseModel):
    MODEL_TYPE = "traditional"
    MODEL_NAME = "knn"

    def __init__(
        self,
        n_neighbors: int = 5,
        weights: str = "distance",
        metric: str = "minkowski",
    ):
        super().__init__()
        self.scaler = StandardScaler()
        self.model = KNeighborsClassifier(
            n_neighbors=n_neighbors,
            weights=weights,
            metric=metric,
            n_jobs=-1,
        )

    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: Optional[np.ndarray] = None,
        y_val: Optional[np.ndarray] = None,
    ) -> Dict[str, Any]:
        logger.info("Training KNN on %d samples", len(y_train))
        start = time.time()
        X_scaled = self.scaler.fit_transform(X_train)
        self.model.fit(X_scaled, y_train)
        self.training_time = time.time() - start
        self.is_trained = True

        info: Dict[str, Any] = {
            "model": self.MODEL_NAME,
            "training_time_seconds": round(self.training_time, 3),
            "n_train_samples": len(y_train),
            "n_features": X_train.shape[1],
            "n_neighbors": self.model.n_neighbors,
        }
        if X_val is not None and y_val is not None:
            val_metrics = self.evaluate(X_val, y_val)
            info["val_metrics"] = val_metrics
        logger.info("KNN trained in %.2fs", self.training_time)
        return info

    def predict(self, X: np.ndarray) -> np.ndarray:
        if X.ndim == 1:
            X = X.reshape(1, -1)
        X_scaled = self.scaler.transform(X)
        return self.model.predict(X_scaled)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        if X.ndim == 1:
            X = X.reshape(1, -1)
        X_scaled = self.scaler.transform(X)
        return self.model.predict_proba(X_scaled)

    def save(self, directory: str) -> str:
        self._ensure_dir(directory)
        path = os.path.join(directory, "knn.joblib")
        joblib.dump({"model": self.model, "scaler": self.scaler}, path)
        logger.info("KNN saved to %s", path)
        return path

    def load(self, directory: str) -> None:
        path = os.path.join(directory, "knn.joblib")
        if not os.path.exists(path):
            raise FileNotFoundError(f"Model file not found: {path}")
        data = joblib.load(path)
        self.model = data["model"]
        self.scaler = data["scaler"]
        self.is_trained = True
        logger.info("KNN loaded from %s", path)
