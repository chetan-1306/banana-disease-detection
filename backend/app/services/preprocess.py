from __future__ import annotations

import io

import numpy as np
from PIL import Image

from app.core.errors import InvalidImageError

IMG_SIZE = (224, 224)


def preprocess_image(image_bytes: bytes) -> np.ndarray:
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img = img.resize(IMG_SIZE)
        arr = np.array(img, dtype=np.float32) / 255.0
        return np.expand_dims(arr, axis=0)  # (1, 224, 224, 3)
    except Exception as e:
        raise InvalidImageError(f"Invalid image: {str(e)}")

