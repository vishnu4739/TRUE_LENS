"""Train Deep Learning models (CNN and Vision Transformer) on TrueLens dataset.

Pipeline:
1. Load raw images from data/train and data/val
2. Resize to 224x224 RGB
3. Train CNN
4. Train Vision Transformer
5. Save models to models/saved/
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

from models.cnn import CNNModel
from models.vision_transformer import VisionTransformerModel
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


def load_raw_dataset(real_dir: Path, ai_dir: Path, preprocessor: ImagePreprocessor):
    """Load raw resized images (N, H, W, 3) and binary labels."""
    images = []
    labels = []

    real_paths = sorted(list(real_dir.glob("*.jpg")) + list(real_dir.glob("*.png")) + list(real_dir.glob("*.jpeg")))
    for p in real_paths:
        try:
            pil_img = preprocessor.load_image_from_path(str(p))
            resized = preprocessor.resize(pil_img, mode="deep")
            images.append(np.array(resized, dtype=np.uint8))
            labels.append(0)
        except Exception as exc:
            logger.warning("Failed processing %s: %s", p, exc)

    ai_paths = sorted(list(ai_dir.glob("*.jpg")) + list(ai_dir.glob("*.png")) + list(ai_dir.glob("*.jpeg")))
    for p in ai_paths:
        try:
            pil_img = preprocessor.load_image_from_path(str(p))
            resized = preprocessor.resize(pil_img, mode="deep")
            images.append(np.array(resized, dtype=np.uint8))
            labels.append(1)
        except Exception as exc:
            logger.warning("Failed processing %s: %s", p, exc)

    X = np.array(images, dtype=np.uint8)
    y = np.array(labels, dtype=int)
    return X, y


def train_deep_models():
    """Train CNN and Vision Transformer models."""
    logger.info("Initializing preprocessor for deep models...")
    preprocessor = ImagePreprocessor()

    logger.info("Loading training images...")
    X_train, y_train = load_raw_dataset(TRAIN_REAL_DIR, TRAIN_AI_DIR, preprocessor)
    logger.info("Loaded X_train shape: %s, y_train: %d", X_train.shape, len(y_train))

    logger.info("Loading validation images...")
    X_val, y_val = load_raw_dataset(VAL_REAL_DIR, VAL_AI_DIR, preprocessor)
    logger.info("Loaded X_val shape: %s, y_val: %d", X_val.shape, len(y_val))

    if len(X_train) == 0:
        logger.error("No training data found. Please run generate_synthetic_data first.")
        return

    # Train CNN
    logger.info("--- Training CNN Model ---")
    cnn = CNNModel(learning_rate=1e-3, batch_size=16, epochs=5)
    cnn_info = cnn.train(X_train, y_train, X_val, y_val)
    cnn_path = cnn.save(str(MODELS_DIR))
    logger.info("Saved CNN to %s", cnn_path)

    # Train ViT
    logger.info("--- Training Vision Transformer Model ---")
    vit = VisionTransformerModel(learning_rate=5e-4, batch_size=16, epochs=5)
    vit_info = vit.train(X_train, y_train, X_val, y_val)
    vit_path = vit.save(str(MODELS_DIR))
    logger.info("Saved Vision Transformer to %s", vit_path)

    return {
        "cnn": {"status": "trained", "info": cnn_info, "path": cnn_path},
        "vision_transformer": {"status": "trained", "info": vit_info, "path": vit_path},
    }


if __name__ == "__main__":
    train_deep_models()
