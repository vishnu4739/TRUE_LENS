"""Feature extraction for traditional ML models.

Extracts four feature families from an image (as an HWC uint8 NumPy array):
1. HOG (Histogram of Oriented Gradients)
2. Texture (Local Binary Pattern statistics)
3. Frequency domain (DCT-based)
4. Color statistics
"""

from __future__ import annotations

import logging
from typing import Dict, List, Optional, Tuple, Union

import numpy as np
from scipy.fft import dct
from skimage.color import rgb2gray
from skimage.feature import local_binary_pattern, hog

logger = logging.getLogger(__name__)


class FeatureExtractor:
    """Extract a flat feature vector from an RGB uint8 image array."""

    def __init__(
        self,
        hog_orientations: int = 9,
        hog_pixels_per_cell: Union[int, Tuple[int, int]] = 8,
        hog_cells_per_block: int = 2,
        lbp_radius: int = 3,
        lbp_n_points: Optional[int] = None,
    ):
        self.hog_orientations = hog_orientations
        if isinstance(hog_pixels_per_cell, int):
            self.hog_pixels_per_cell = (hog_pixels_per_cell, hog_pixels_per_cell)
        else:
            self.hog_pixels_per_cell = tuple(hog_pixels_per_cell)
        self.hog_cells_per_block = (hog_cells_per_block, hog_cells_per_block)
        self.lbp_radius = lbp_radius
        self.lbp_n_points = lbp_n_points or (8 * lbp_radius)

    # ------------------------------------------------------------------
    # Individual feature families
    # ------------------------------------------------------------------

    def extract_hog(self, image: np.ndarray) -> np.ndarray:
        """Extract HOG features from an RGB image (H, W, 3)."""
        gray = rgb2gray(image)  # float64, [0, 1]
        features = hog(
            gray,
            orientations=self.hog_orientations,
            pixels_per_cell=self.hog_pixels_per_cell,
            cells_per_block=self.hog_cells_per_block,
            feature_vector=True,
            block_norm="L2-Hys",
        )
        return features.astype(np.float32)

    def extract_texture(self, image: np.ndarray) -> np.ndarray:
        """Extract LBP texture statistics from the grayscale image."""
        gray = (rgb2gray(image) * 255).astype(np.uint8)
        lbp = local_binary_pattern(
            gray, self.lbp_n_points, self.lbp_radius, method="uniform"
        )
        # Histogram of LBP values (n_points + 2 bins for uniform LBP)
        n_bins = self.lbp_n_points + 2
        hist, _ = np.histogram(
            lbp.ravel(), bins=n_bins, range=(0, n_bins), density=True
        )
        return hist.astype(np.float32)

    def extract_frequency(self, image: np.ndarray) -> np.ndarray:
        """Extract frequency-domain features using 2-D DCT on grayscale."""
        gray = rgb2gray(image).astype(np.float32)
        # 2-D DCT via separable 1-D DCTs
        dct_coeffs = dct(dct(gray, axis=0, norm="ortho"), axis=1, norm="ortho")
        h, w = dct_coeffs.shape
        # Low frequency (top-left quadrant)
        low = dct_coeffs[: h // 4, : w // 4]
        # Mid frequency
        mid = dct_coeffs[h // 4 : h // 2, w // 4 : w // 2]
        # High frequency (bottom-right quadrant)
        high = dct_coeffs[h // 2 :, w // 2 :]

        stats: List[float] = []
        for band in [low, mid, high]:
            flat = band.ravel()
            stats.extend(
                [
                    float(np.mean(flat)),
                    float(np.std(flat)),
                    float(np.median(flat)),
                    float(np.max(np.abs(flat))),
                    float(np.percentile(np.abs(flat), 75)),
                ]
            )
        return np.array(stats, dtype=np.float32)

    def extract_color(self, image: np.ndarray) -> np.ndarray:
        """Extract colour statistics per channel and cross-channel."""
        stats: List[float] = []
        for c in range(3):
            channel = image[:, :, c].astype(np.float32)
            stats.extend(
                [
                    float(np.mean(channel)),
                    float(np.std(channel)),
                    float(np.median(channel)),
                    float(np.min(channel)),
                    float(np.max(channel)),
                    float(np.percentile(channel, 25)),
                    float(np.percentile(channel, 75)),
                    float(np.mean(np.abs(np.diff(channel, axis=0)))),
                    float(np.mean(np.abs(np.diff(channel, axis=1)))),
                ]
            )
        # Cross-channel correlations
        r = image[:, :, 0].ravel().astype(np.float64)
        g = image[:, :, 1].ravel().astype(np.float64)
        b = image[:, :, 2].ravel().astype(np.float64)

        for pair in [(r, g), (r, b), (g, b)]:
            a, bb = pair
            if np.std(a) > 0 and np.std(bb) > 0:
                stats.append(float(np.corrcoef(a, bb)[0, 1]))
            else:
                stats.append(0.0)
        return np.array(stats, dtype=np.float32)

    # ------------------------------------------------------------------
    # Combined extraction
    # ------------------------------------------------------------------

    def extract_all(self, image: np.ndarray) -> np.ndarray:
        """Extract and concatenate all feature families into one flat vector."""
        hog_feats = self.extract_hog(image)
        tex_feats = self.extract_texture(image)
        freq_feats = self.extract_frequency(image)
        color_feats = self.extract_color(image)
        return np.concatenate([hog_feats, tex_feats, freq_feats, color_feats])

    extract = extract_all
    __call__ = extract_all

    def extract_batch(self, images: np.ndarray) -> np.ndarray:
        """Extract features for a batch of images (N, H, W, 3)."""
        return np.stack([self.extract_all(img) for img in images])

    def get_feature_info(self) -> Dict[str, Union[int, str]]:
        """Return a dict mapping feature family name to its dimensionality."""
        return {
            "hog": "variable (depends on image size)",
            "texture_lbp": self.lbp_n_points + 2,
            "frequency_dct": 15,
            "color_stats": 30,
        }
