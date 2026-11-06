"""Image preprocessing pipeline for TrueLens.

Handles image validation, decoding, resizing, color conversion,
and normalization for both traditional ML and deep learning pipelines.
"""

import io
import logging
from typing import Optional, Tuple, Union

import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

# Allowed MIME types for uploaded images
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"}
# Maximum file size in bytes (20 MB)
MAX_FILE_SIZE = 20 * 1024 * 1024


class ImagePreprocessor:
    """Unified image preprocessing pipeline.

    Supports two modes:
    - Traditional ML: resizes to a configurable size, outputs a NumPy array.
    - Deep Learning: resizes to 224x224, normalizes to [0, 1], outputs a NumPy array
      shaped (C, H, W) ready for PyTorch.
    """

    def __init__(
        self,
        target_size_traditional: Tuple[int, int] = (128, 128),
        target_size_deep: Tuple[int, int] = (224, 224),
    ):
        self.target_size_traditional = target_size_traditional
        self.target_size_deep = target_size_deep

    # ------------------------------------------------------------------
    # Public helpers
    # ------------------------------------------------------------------

    @staticmethod
    def validate_image_bytes(data: bytes) -> None:
        """Raise ValueError if *data* is not a valid image or exceeds size limits."""
        if len(data) > MAX_FILE_SIZE:
            raise ValueError(
                f"Image exceeds maximum file size of {MAX_FILE_SIZE // (1024 * 1024)} MB"
            )
        if len(data) == 0:
            raise ValueError("Empty image data")
        # Attempt to open with Pillow to verify it is a valid image
        try:
            img = Image.open(io.BytesIO(data))
            img.verify()
        except Exception as exc:
            raise ValueError(f"Invalid image data: {exc}") from exc

    @staticmethod
    def decode_image(data: bytes) -> Image.Image:
        """Decode raw bytes into a PIL Image in RGB mode."""
        img = Image.open(io.BytesIO(data))
        if img.mode != "RGB":
            img = img.convert("RGB")
        return img

    @staticmethod
    def load_image_from_path(path: str) -> Image.Image:
        """Load an image file from disk and convert to RGB."""
        img = Image.open(path)
        if img.mode != "RGB":
            img = img.convert("RGB")
        return img

    def resize(
        self, img: Image.Image, mode: str = "traditional"
    ) -> Image.Image:
        """Resize image for the chosen pipeline mode."""
        target = (
            self.target_size_deep if mode == "deep" else self.target_size_traditional
        )
        return img.resize(target, Image.LANCZOS)

    # ------------------------------------------------------------------
    # Full pipeline methods
    # ------------------------------------------------------------------

    def preprocess_for_traditional(
        self,
        source: Union[bytes, str, Image.Image],
    ) -> np.ndarray:
        """Full pipeline for traditional ML models.

        Returns an (H, W, 3) uint8 NumPy array.
        """
        img = self._to_pil(source)
        img = self.resize(img, mode="traditional")
        return np.asarray(img, dtype=np.uint8)

    def preprocess_for_deep(
        self,
        source: Union[bytes, str, Image.Image],
    ) -> np.ndarray:
        """Full pipeline for deep learning models (CNN / ViT).

        Returns a (3, H, W) float32 NumPy array normalised to [0, 1].
        """
        img = self._to_pil(source)
        img = self.resize(img, mode="deep")
        arr = np.asarray(img, dtype=np.float32) / 255.0
        # HWC -> CHW
        arr = np.transpose(arr, (2, 0, 1))
        return arr

    def preprocess_batch_traditional(
        self,
        sources: list,
    ) -> np.ndarray:
        """Preprocess a list of sources for traditional ML.

        Returns (N, H, W, 3) uint8 array.
        """
        return np.stack([self.preprocess_for_traditional(s) for s in sources])

    def preprocess_batch_deep(
        self,
        sources: list,
    ) -> np.ndarray:
        """Preprocess a list of sources for deep learning.

        Returns (N, 3, H, W) float32 array.
        """
        return np.stack([self.preprocess_for_deep(s) for s in sources])

    # ------------------------------------------------------------------
    # Internals
    # ------------------------------------------------------------------

    def _to_pil(self, source: Union[bytes, str, Image.Image]) -> Image.Image:
        if isinstance(source, Image.Image):
            img = source
        elif isinstance(source, bytes):
            img = self.decode_image(source)
        elif isinstance(source, str):
            img = self.load_image_from_path(source)
        else:
            raise TypeError(f"Unsupported source type: {type(source)}")
        if img.mode != "RGB":
            img = img.convert("RGB")
        return img
