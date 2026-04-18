from __future__ import annotations

from typing import Dict, Optional, Tuple

import numpy as np
import tensorflow as tf

from app.core.config import MODEL_PATH
from app.core.errors import ModelInferenceError, ModelNotLoadedError
from app.services.labels import CLASS_LABELS, DISEASE_INFO, DISPLAY_NAMES


class ModelService:
    def __init__(self) -> None:
        self._model: Optional[tf.keras.Model] = None

    @property
    def loaded(self) -> bool:
        return self._model is not None

    def load(self) -> None:
        self._model = tf.keras.models.load_model(MODEL_PATH)

    def predict(self, img_batch: np.ndarray) -> Tuple[str, str, float, Dict]:
        if self._model is None:
            raise ModelNotLoadedError()
        try:
            preds = self._model.predict(img_batch, verbose=0)[0]  # (num_classes,)
            idx = int(np.argmax(preds))
            predicted_class = CLASS_LABELS[idx]
            confidence = float(np.max(preds))  # 0..1
            display_name = DISPLAY_NAMES.get(predicted_class, predicted_class.replace("_", " "))
            disease_info = DISEASE_INFO.get(predicted_class, {})
            return predicted_class, display_name, confidence, disease_info
        except Exception as e:
            raise ModelInferenceError(f"Model inference failed: {str(e)}")


model_service = ModelService()

