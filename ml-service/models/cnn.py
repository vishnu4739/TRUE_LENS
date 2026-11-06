"""Convolutional Neural Network model for TrueLens.

Implements a lightweight 4-block CNN for image authenticity detection.
Designed for CPU/GPU training on 224x224 RGB images.
"""

from __future__ import annotations

import logging
import os
import time
from typing import Any, Dict, Optional, Tuple

import numpy as np

try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torch.utils.data import DataLoader, TensorDataset
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False

from models.base import BaseModel

logger = logging.getLogger(__name__)


if HAS_TORCH:
    class SimpleCNNNet(nn.Module):
        """4-block convolutional network with batchnorm, dropout, and residual-like flow."""

        def __init__(self, num_classes: int = 2, dropout: float = 0.3):
            super().__init__()
            self.features = nn.Sequential(
                # Block 1: 3 -> 32 (224 -> 112)
                nn.Conv2d(3, 32, kernel_size=3, padding=1),
                nn.BatchNorm2d(32),
                nn.ReLU(inplace=True),
                nn.MaxPool2d(2, 2),
                
                # Block 2: 32 -> 64 (112 -> 56)
                nn.Conv2d(32, 64, kernel_size=3, padding=1),
                nn.BatchNorm2d(64),
                nn.ReLU(inplace=True),
                nn.MaxPool2d(2, 2),
                
                # Block 3: 64 -> 128 (56 -> 28)
                nn.Conv2d(64, 128, kernel_size=3, padding=1),
                nn.BatchNorm2d(128),
                nn.ReLU(inplace=True),
                nn.MaxPool2d(2, 2),
                
                # Block 4: 128 -> 128 (28 -> 14)
                nn.Conv2d(128, 128, kernel_size=3, padding=1),
                nn.BatchNorm2d(128),
                nn.ReLU(inplace=True),
                nn.AdaptiveAvgPool2d((4, 4)),
            )
            self.classifier = nn.Sequential(
                nn.Flatten(),
                nn.Linear(128 * 4 * 4, 128),
                nn.ReLU(inplace=True),
                nn.Dropout(dropout),
                nn.Linear(128, num_classes),
            )

        def forward(self, x: torch.Tensor) -> torch.Tensor:
            x = self.features(x)
            return self.classifier(x)


class CNNModel(BaseModel):
    MODEL_TYPE = "deep"
    MODEL_NAME = "cnn"

    def __init__(
        self,
        learning_rate: float = 1e-3,
        batch_size: int = 16,
        epochs: int = 5,
        device: Optional[str] = None,
    ):
        super().__init__()
        self.learning_rate = learning_rate
        self.batch_size = batch_size
        self.epochs = epochs

        if HAS_TORCH:
            if device is None:
                self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            else:
                self.device = torch.device(device)
            self.net = SimpleCNNNet(num_classes=2).to(self.device)
        else:
            self.device = "cpu"
            self.net = None

    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: Optional[np.ndarray] = None,
        y_val: Optional[np.ndarray] = None,
    ) -> Dict[str, Any]:
        if not HAS_TORCH:
            raise RuntimeError("PyTorch is required to train CNNModel")

        logger.info("Training CNN on %d samples for %d epochs on %s", len(y_train), self.epochs, self.device)
        start = time.time()

        # Convert (N, H, W, C) to (N, C, H, W) float32 normalized [0, 1]
        if X_train.ndim == 4 and X_train.shape[-1] == 3:
            X_tensor = torch.tensor(X_train.transpose(0, 3, 1, 2), dtype=torch.float32)
            if X_tensor.max() > 1.0:
                X_tensor = X_tensor / 255.0
        else:
            X_tensor = torch.tensor(X_train, dtype=torch.float32)

        y_tensor = torch.tensor(y_train, dtype=torch.long)
        dataset = TensorDataset(X_tensor, y_tensor)
        loader = DataLoader(dataset, batch_size=self.batch_size, shuffle=True)

        criterion = nn.CrossEntropyLoss()
        optimizer = optim.Adam(self.net.parameters(), lr=self.learning_rate)

        self.net.train()
        for epoch in range(self.epochs):
            running_loss = 0.0
            for batch_x, batch_y in loader:
                batch_x = batch_x.to(self.device)
                batch_y = batch_y.to(self.device)

                optimizer.zero_grad()
                outputs = self.net(batch_x)
                loss = criterion(outputs, batch_y)
                loss.backward()
                optimizer.step()
                running_loss += loss.item()

        self.training_time = time.time() - start
        self.is_trained = True

        return {
            "model": self.MODEL_NAME,
            "training_time_seconds": round(self.training_time, 3),
            "n_train_samples": len(y_train),
            "epochs": self.epochs,
            "device": str(self.device),
        }

    def predict(self, X: np.ndarray) -> np.ndarray:
        proba = self.predict_proba(X)
        return np.argmax(proba, axis=1)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        if not self.is_trained or not HAS_TORCH:
            raise RuntimeError("CNN model is not trained or PyTorch is unavailable.")

        if X.ndim == 3:
            X = np.expand_dims(X, axis=0)

        if X.shape[-1] == 3:
            X_tensor = torch.tensor(X.transpose(0, 3, 1, 2), dtype=torch.float32)
            if X_tensor.max() > 1.0:
                X_tensor = X_tensor / 255.0
        else:
            X_tensor = torch.tensor(X, dtype=torch.float32)

        self.net.eval()
        with torch.no_grad():
            outputs = self.net(X_tensor.to(self.device))
            probs = torch.softmax(outputs, dim=1).cpu().numpy()

        return probs

    def save(self, directory: str) -> str:
        self._ensure_dir(directory)
        path = os.path.join(directory, f"{self.MODEL_NAME}.pt")
        torch.save(
            {
                "state_dict": self.net.state_dict(),
                "metadata": self.metadata,
                "training_time": self.training_time,
            },
            path,
        )
        logger.info("Saved CNN model to %s", path)
        return path

    def load(self, directory: str) -> None:
        if not HAS_TORCH:
            raise RuntimeError("PyTorch is required to load CNNModel")
        path = os.path.join(directory, f"{self.MODEL_NAME}.pt")
        if not os.path.exists(path):
            raise FileNotFoundError(f"No saved model found at {path}")
        checkpoint = torch.load(path, map_location=self.device)
        self.net.load_state_dict(checkpoint["state_dict"])
        self.metadata = checkpoint.get("metadata", {})
        self.training_time = checkpoint.get("training_time", 0.0)
        self.is_trained = True
        logger.info("Loaded CNN model from %s", path)
