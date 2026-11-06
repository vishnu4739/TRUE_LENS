"""Base model interface for all TrueLens models.

Every model (traditional or deep learning) must subclass ``BaseModel``
and implement all abstract methods.
"""

from __future__ import annotations

import logging
import os
import time
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

logger = logging.getLogger(__name__)


class BaseModel(ABC):
    """Abstract base class defining the common model interface."""

    # Subclasses should set this
    MODEL_TYPE: str = "base"  # "traditional" or "deep"
    MODEL_NAME: str = "base"

    def __init__(self):
        self.is_trained: bool = False
        self.training_time: float = 0.0
        self.metadata: Dict[str, Any] = {}

    # ------------------------------------------------------------------
    # Abstract interface
    # ------------------------------------------------------------------

    @abstractmethod
    def train(
        self,
        X_train: Any,
        y_train: np.ndarray,
        X_val: Optional[Any] = None,
        y_val: Optional[np.ndarray] = None,
    ) -> Dict[str, Any]:
        """Train the model. Returns a dict of training metrics/info."""
        ...

    @abstractmethod
    def predict(self, X: Any) -> np.ndarray:
        """Return class predictions (0 or 1) for input(s)."""
        ...

    @abstractmethod
    def predict_proba(self, X: Any) -> np.ndarray:
        """Return probability estimates, shape (N, 2) for [P(real), P(ai)]."""
        ...

    @abstractmethod
    def save(self, directory: str) -> str:
        """Persist model to *directory*. Returns path to the saved file."""
        ...

    @abstractmethod
    def load(self, directory: str) -> None:
        """Load a previously saved model from *directory*."""
        ...

    # ------------------------------------------------------------------
    # Concrete helpers
    # ------------------------------------------------------------------

    def evaluate(
        self, X: Any, y_true: np.ndarray
    ) -> Dict[str, Any]:
        """Compute standard classification metrics on a test set."""
        from evaluation.metrics import compute_metrics

        y_pred = self.predict(X)
        y_proba = self.predict_proba(X)
        return compute_metrics(y_true, y_pred, y_proba[:, 1])

    def predict_single(self, X: Any) -> Dict[str, Any]:
        """Predict a single sample and return a rich result dict."""
        proba = self.predict_proba(X)
        if proba.ndim == 1:
            proba = proba.reshape(1, -1)
        prob_real = float(proba[0, 0])
        prob_ai = float(proba[0, 1])
        predicted_class = int(np.argmax(proba[0]))
        label = "ai_generated" if predicted_class == 1 else "real"
        uncertain = 0.4 <= prob_ai <= 0.6
        return {
            "model": self.MODEL_NAME,
            "prediction": label,
            "confidence": float(max(prob_real, prob_ai)),
            "probability_real": prob_real,
            "probability_ai_generated": prob_ai,
            "is_uncertain": uncertain,
        }

    def _ensure_dir(self, directory: str) -> None:
        os.makedirs(directory, exist_ok=True)
