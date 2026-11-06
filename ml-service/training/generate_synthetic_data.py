"""Generates a synthetic dataset for TrueLens development and testing.

Creates real-like (camera simulation with natural noise, smooth gradients)
and AI-like (diffusion-like artifacts, frequency anomalies) images for
train, val, and test splits with fixed random seed 42.

Also generates data/dataset_info.json documenting the dataset.
"""

import json
import os
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from training.config import (
    DATA_DIR,
    IMAGE_SIZE,
    RANDOM_SEED,
    TEST_AI_DIR,
    TEST_REAL_DIR,
    TRAIN_AI_DIR,
    TRAIN_REAL_DIR,
    VAL_AI_DIR,
    VAL_REAL_DIR,
)

# Set seeds
np.random.seed(RANDOM_SEED)
random.seed(RANDOM_SEED)


def generate_natural_photo(width: int = 224, height: int = 224, seed: int = 0) -> Image.Image:
    """Simulate natural photograph with organic gradients, lighting, and sensor grain."""
    rng = np.random.default_rng(seed)
    
    # Base gradient (sky/landscape or warm interior lighting)
    x = np.linspace(0, 1, width)
    y = np.linspace(0, 1, height)
    xx, yy = np.meshgrid(x, y)
    
    # Natural illumination curve
    r = 120 + 80 * np.sin(xx * 2.0 + rng.uniform(-1, 1)) + 30 * yy
    g = 140 + 70 * np.cos(yy * 1.8 + rng.uniform(-1, 1)) + 20 * xx
    b = 160 + 60 * np.sin((xx + yy) * 1.5 + rng.uniform(-1, 1))
    
    # Add subtle organic geometric structures (natural landscape silhouettes)
    r = np.clip(r, 0, 255).astype(np.uint8)
    g = np.clip(g, 0, 255).astype(np.uint8)
    b = np.clip(b, 0, 255).astype(np.uint8)
    
    img_arr = np.stack([r, g, b], axis=-1)
    img = Image.fromarray(img_arr)
    
    # Add soft natural Gaussian blur + subtle sensor noise
    img = img.filter(ImageFilter.GaussianBlur(radius=rng.uniform(0.5, 1.2)))
    grain = rng.normal(0, 3.5, (height, width, 3))
    arr = np.clip(np.array(img, dtype=np.float32) + grain, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)


def generate_synthetic_ai_image(width: int = 224, height: int = 224, seed: int = 1000) -> Image.Image:
    """Simulate AI-generated image with subtle high-frequency checkerboard / diffusion latent traits."""
    rng = np.random.default_rng(seed)
    
    x = np.linspace(0, 4 * np.pi, width)
    y = np.linspace(0, 4 * np.pi, height)
    xx, yy = np.meshgrid(x, y)
    
    # Oversaturated or surreal wave harmonics common in latent diffusion
    r = 140 + 90 * np.sin(xx * 1.2) * np.cos(yy * 1.2)
    g = 130 + 85 * np.cos(xx * 0.8 + 1.0) * np.sin(yy * 0.8)
    b = 160 + 75 * np.sin((xx + yy) * 1.1)
    
    # Add high-frequency checkerboard / unpooling pattern
    checker = np.sin(xx * 16) * np.sin(yy * 16) * 6.0
    r += checker
    g += checker
    b += checker
    
    arr = np.clip(np.stack([r, g, b], axis=-1), 0, 255).astype(np.uint8)
    img = Image.fromarray(arr)
    return img


def build_dataset(
    n_train_per_class: int = 30,
    n_val_per_class: int = 10,
    n_test_per_class: int = 15,
):
    """Generate training, validation, and test images."""
    splits = [
        ("train", TRAIN_REAL_DIR, TRAIN_AI_DIR, n_train_per_class, 100),
        ("val", VAL_REAL_DIR, VAL_AI_DIR, n_val_per_class, 500),
        ("test", TEST_REAL_DIR, TEST_AI_DIR, n_test_per_class, 800),
    ]
    
    counts = {}
    for split_name, real_dir, ai_dir, count, base_seed in splits:
        real_dir.mkdir(parents=True, exist_ok=True)
        ai_dir.mkdir(parents=True, exist_ok=True)
        
        for i in range(count):
            # Real
            real_img = generate_natural_photo(IMAGE_SIZE[0], IMAGE_SIZE[1], seed=base_seed + i)
            real_img.save(real_dir / f"real_{i:04d}.jpg", quality=92)
            
            # AI
            ai_img = generate_synthetic_ai_image(IMAGE_SIZE[0], IMAGE_SIZE[1], seed=base_seed + 1000 + i)
            ai_img.save(ai_dir / f"ai_{i:04d}.jpg", quality=92)
            
        counts[split_name] = {
            "real": count,
            "ai_generated": count,
            "total": count * 2,
        }
        print(f"Generated {split_name} split: {count} real, {count} AI images")

    # Document dataset in dataset_info.json
    info = {
        "dataset_name": "TrueLens Synthetic Benchmark v1",
        "dataset_source": "Procedural natural camera noise & latent diffusion artifact simulation",
        "license": "Creative Commons CC0 Public Domain (Academic & Educational Use)",
        "number_of_images": sum(v["total"] for v in counts.values()),
        "class_distribution": {
            "real_photographs": sum(v["real"] for v in counts.values()),
            "ai_generated_images": sum(v["ai_generated"] for v in counts.values()),
        },
        "train_val_test_split": {
            "train": counts["train"]["total"],
            "validation": counts["val"]["total"],
            "test": counts["test"]["total"],
        },
        "image_resolution": [IMAGE_SIZE[0], IMAGE_SIZE[1]],
        "preprocessing": "RGB conversion, resize to 224x224, min-max normalization, HOG, LBP texture, DCT frequency, color statistics",
        "known_limitations": [
            "Synthetic simulation dataset designed for reproducible algorithmic verification and testing.",
            "Real-world generalization requires training on massive multi-generator corpuses (e.g., CIFAKE, GenImage, Midjourney, SDXL, DALL-E 3).",
            "Predictions are probability estimates and should not be treated as proof of origin.",
        ],
    }
    
    with open(DATA_DIR / "dataset_info.json", "w") as f:
        json.dump(info, f, indent=2)
    print("Saved dataset metadata to data/dataset_info.json")


if __name__ == "__main__":
    build_dataset()
