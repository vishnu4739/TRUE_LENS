"""Logistic Regression model for TrueLens."""

from __future__ import annotations

import logging
import os
import time
from typing import Any, Dict, Optional

import joblib
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler

from models.base import BaseModel

logger = logging.getLogger(__name__)


class LogisticRegressionModel(BaseModel):
    MODEL_TYPE = "traditional"
    MODEL_NAME = "logistic_regression"

    def __init__(self, random_state: int = 42, max_iter: int = 1000, C: float = 1.0):
        super().__init__()
        self.scaler = StandardScaler()
        self.model = LogisticRegression(
            random_state=random_state,
            max_iter=max_iter,
            C=C,
            solver="lbfgs",
            class_weight="balanced",
        )

    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: Optional[np.ndarray] = None,
        y_val: Optional[np.ndarray] = None,
    ) -> Dict[str, Any]:
        logger.info("Training Logistic Regression on %d samples", len(y_train))
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
        }
        if X_val is not None and y_val is not None:
            val_metrics = self.evaluate(X_val, y_val)
            info["val_metrics"] = val_metrics
        logger.info("Logistic Regression trained in %.2fs", self.training_time)
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
        path = os.path.join(directory, "logistic_regression.joblib")
        joblib.dump({"model": self.model, "scaler": self.scaler}, path)
        logger.info("Logistic Regression saved to %s", path)
        return path

    def load(self, directory: str) -> None:
        path = os.path.join(directory, "logistic_regression.joblib")
        if not os.path.exists(path):
            raise FileNotFoundError(f"Model file not found: {path}")
        data = joblib.load(path)
        if isinstance(data, dict):
            self.model = data["model"]
            self.scaler = data.get("scaler", StandardScaler())
        else:
            self.model = data
            self.scaler = StandardScaler()
        self.is_trained = True
        logger.info("Logistic Regression loaded from %s", path)
