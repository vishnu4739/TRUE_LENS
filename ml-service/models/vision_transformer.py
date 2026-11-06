"""Vision Transformer (ViT) model for TrueLens.

Implements a lightweight Vision Transformer architecture:
- 16x16 patch projection
- Learnable class token and position embeddings
- Multi-Head Self Attention Transformer blocks
- MLP classification head
"""

from __future__ import annotations

import logging
import os
import time
from typing import Any, Dict, Optional

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
    class PatchEmbedding(nn.Module):
        """Converts an image into a sequence of patch embeddings."""

        def __init__(self, img_size: int = 224, patch_size: int = 16, in_channels: int = 3, embed_dim: int = 64):
            super().__init__()
            self.img_size = img_size
            self.patch_size = patch_size
            self.n_patches = (img_size // patch_size) ** 2

            self.proj = nn.Conv2d(
                in_channels,
                embed_dim,
                kernel_size=patch_size,
                stride=patch_size,
            )

        def forward(self, x: torch.Tensor) -> torch.Tensor:
            # (B, C, H, W) -> (B, embed_dim, sqrt(N), sqrt(N)) -> (B, embed_dim, N) -> (B, N, embed_dim)
            x = self.proj(x)
            x = x.flatten(2).transpose(1, 2)
            return x

    class SimpleViTNet(nn.Module):
        """Lightweight Vision Transformer classifier."""

        def __init__(
            self,
            img_size: int = 224,
            patch_size: int = 16,
            in_channels: int = 3,
            num_classes: int = 2,
            embed_dim: int = 64,
            depth: int = 3,
            n_heads: int = 4,
            mlp_ratio: float = 2.0,
            dropout: float = 0.1,
        ):
            super().__init__()
            self.patch_embed = PatchEmbedding(img_size, patch_size, in_channels, embed_dim)
            n_patches = self.patch_embed.n_patches

            self.cls_token = nn.Parameter(torch.zeros(1, 1, embed_dim))
            self.pos_embed = nn.Parameter(torch.zeros(1, n_patches + 1, embed_dim))
            self.pos_drop = nn.Dropout(p=dropout)

            encoder_layer = nn.TransformerEncoderLayer(
                d_model=embed_dim,
                nhead=n_heads,
                dim_feedforward=int(embed_dim * mlp_ratio),
                dropout=dropout,
                activation="gelu",
                batch_first=True,
            )
            self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=depth)
            self.norm = nn.LayerNorm(embed_dim)
            self.head = nn.Linear(embed_dim, num_classes)

            # Initialize weights
            nn.init.trunc_normal_(self.pos_embed, std=0.02)
            nn.init.trunc_normal_(self.cls_token, std=0.02)

        def forward(self, x: torch.Tensor) -> torch.Tensor:
            B = x.shape[0]
            x = self.patch_embed(x)

            cls_tokens = self.cls_token.expand(B, -1, -1)
            x = torch.cat((cls_tokens, x), dim=1)
            x = self.pos_drop(x + self.pos_embed)

            x = self.transformer(x)
            cls_out = self.norm(x[:, 0])
            return self.head(cls_out)


class VisionTransformerModel(BaseModel):
    MODEL_TYPE = "deep"
    MODEL_NAME = "vision_transformer"

    def __init__(
        self,
        learning_rate: float = 5e-4,
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
            self.net = SimpleViTNet().to(self.device)
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
            raise RuntimeError("PyTorch is required to train VisionTransformerModel")

        logger.info("Training ViT on %d samples for %d epochs on %s", len(y_train), self.epochs, self.device)
        start = time.time()

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
        optimizer = optim.AdamW(self.net.parameters(), lr=self.learning_rate, weight_decay=1e-2)

        self.net.train()
        for epoch in range(self.epochs):
            for batch_x, batch_y in loader:
                batch_x = batch_x.to(self.device)
                batch_y = batch_y.to(self.device)

                optimizer.zero_grad()
                outputs = self.net(batch_x)
                loss = criterion(outputs, batch_y)
                loss.backward()
                optimizer.step()

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
            raise RuntimeError("Vision Transformer model is not trained or PyTorch is unavailable.")

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
        logger.info("Saved Vision Transformer model to %s", path)
        return path

    def load(self, directory: str) -> None:
        if not HAS_TORCH:
            raise RuntimeError("PyTorch is required to load VisionTransformerModel")
        path = os.path.join(directory, f"{self.MODEL_NAME}.pt")
        if not os.path.exists(path):
            raise FileNotFoundError(f"No saved model found at {path}")
        checkpoint = torch.load(path, map_location=self.device)
        self.net.load_state_dict(checkpoint["state_dict"])
        self.metadata = checkpoint.get("metadata", {})
        self.training_time = checkpoint.get("training_time", 0.0)
        self.is_trained = True
        logger.info("Loaded Vision Transformer model from %s", path)
