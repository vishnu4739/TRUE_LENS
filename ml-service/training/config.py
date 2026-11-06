"""Training configuration for TrueLens models."""

import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models" / "saved"
RESULTS_DIR = BASE_DIR / "results"

TRAIN_REAL_DIR = DATA_DIR / "train" / "real"
TRAIN_AI_DIR = DATA_DIR / "train" / "ai_generated"
VAL_REAL_DIR = DATA_DIR / "val" / "real"
VAL_AI_DIR = DATA_DIR / "val" / "ai_generated"
TEST_REAL_DIR = DATA_DIR / "test" / "real"
TEST_AI_DIR = DATA_DIR / "test" / "ai_generated"

# Image settings
IMAGE_SIZE = (224, 224)
RANDOM_SEED = 42

# Training settings
BATCH_SIZE = 16
EPOCHS = 5
LEARNING_RATE = 1e-3

# Ensure directories exist
for p in [MODELS_DIR, RESULTS_DIR, TRAIN_REAL_DIR, TRAIN_AI_DIR, VAL_REAL_DIR, VAL_AI_DIR, TEST_REAL_DIR, TEST_AI_DIR]:
    p.mkdir(parents=True, exist_ok=True)
