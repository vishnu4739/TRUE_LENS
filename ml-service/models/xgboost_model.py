"""XGBoost model for TrueLens."""

from __future__ import annotations

import logging
import os
import time
from typing import Any, Dict, Optional

import joblib
import numpy as np

try:
    import xgboost as xgb
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False
    from sklearn.ensemble import HistGradientBoostingClassifier, GradientBoostingClassifier

from models.base import BaseModel

logger = logging.getLogger(__name__)


class XGBoostModel(BaseModel):
    MODEL_TYPE = "traditional"
    MODEL_NAME = "xgboost"

    def __init__(
        self,
        random_state: int = 42,
        n_estimators: int = 100,
        max_depth: int = 6,
        learning_rate: float = 0.1,
    ):
        super().__init__()
        self.random_state = random_state
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.learning_rate = learning_rate

        if HAS_XGBOOST:
            self.model = xgb.XGBClassifier(
                n_estimators=n_estimators,
                max_depth=max_depth,
                learning_rate=learning_rate,
                random_state=random_state,
                eval_metric="logloss",
                use_label_encoder=False,
            )
        else:
            logger.info("Using GradientBoostingClassifier as XGBoost backend")
            self.model = GradientBoostingClassifier(
                n_estimators=n_estimators,
                max_depth=max_depth,
                learning_rate=learning_rate,
                random_state=random_state,
            )

    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: Optional[np.ndarray] = None,
        y_val: Optional[np.ndarray] = None,
    ) -> Dict[str, Any]:
        logger.info("Training XGBoost on %d samples", len(y_train))
        start = time.time()

        if HAS_XGBOOST and X_val is not None and y_val is not None:
            self.model.fit(
                X_train,
                y_train,
                eval_set=[(X_val, y_val)],
                verbose=False,
            )
        else:
            self.model.fit(X_train, y_train)

        self.training_time = time.time() - start
        self.is_trained = True

        info: Dict[str, Any] = {
            "model": self.MODEL_NAME,
            "training_time_seconds": round(self.training_time, 3),
            "n_train_samples": len(y_train),
            "n_features": X_train.shape[1],
            "n_estimators": self.n_estimators,
            "backend": "xgboost" if HAS_XGBOOST else "gradient_boosting",
        }
        return info

    def predict(self, X: np.ndarray) -> np.ndarray:
        if not self.is_trained:
            raise RuntimeError("Model is not trained. Call train() or load() first.")
        if X.ndim == 1:
            X = X.reshape(1, -1)
        return self.model.predict(X)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        if not self.is_trained:
            raise RuntimeError("Model is not trained. Call train() or load() first.")
        if X.ndim == 1:
            X = X.reshape(1, -1)
        return self.model.predict_proba(X)

    def save(self, directory: str) -> str:
        self._ensure_dir(directory)
        path = os.path.join(directory, f"{self.MODEL_NAME}.joblib")
        payload = {
            "model": self.model,
            "metadata": self.metadata,
            "training_time": self.training_time,
            "backend": "xgboost" if HAS_XGBOOST else "gradient_boosting",
        }
        joblib.dump(payload, path)
        logger.info("Saved XGBoost model to %s", path)
        return path

    def load(self, directory: str) -> None:
        path = os.path.join(directory, f"{self.MODEL_NAME}.joblib")
        if not os.path.exists(path):
            raise FileNotFoundError(f"No saved model found at {path}")
        payload = joblib.load(path)
        self.model = payload["model"]
        self.metadata = payload.get("metadata", {})
        self.training_time = payload.get("training_time", 0.0)
        self.is_trained = True
        logger.info("Loaded XGBoost model from %s", path)
