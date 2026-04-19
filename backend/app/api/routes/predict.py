from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core.config import MAX_UPLOAD_BYTES
from app.core.errors import InvalidImageError, ModelInferenceError, ModelNotLoadedError
from app.schemas.prediction import PredictionResponse
from app.services.model_service import model_service
from app.services.preprocess import preprocess_image


router = APIRouter(tags=["Prediction"])
logger = logging.getLogger("banana.api.predict")

SUPPORTED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/jpg", "image/webp"}
LOW_CONFIDENCE_THRESHOLD = 0.60
LEAF_ACCEPT_THRESHOLD = 0.60


@router.post("/predict", response_model=PredictionResponse)
async def predict(file: Optional[UploadFile] = File(default=None)) -> PredictionResponse:
    # Avoid FastAPI's generic 422 by returning a clearer client error
    if file is None:
        raise HTTPException(
            status_code=400,
            detail="No file received. Send multipart/form-data with a field named 'file'.",
        )

    if file.content_type not in SUPPORTED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Unsupported file type. Please upload a JPEG/PNG/WebP image.",
        )

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty upload.")
    if len(image_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File too large.")

    try:
        img_batch = preprocess_image(image_bytes)
        predicted_class, disease, confidence, disease_info = model_service.predict(img_batch)
        is_diseased = predicted_class != "Healthy"
        low_confidence = confidence < LOW_CONFIDENCE_THRESHOLD

        # Reject non-leaf / unclear photos instead of showing misleading results
        if confidence < LEAF_ACCEPT_THRESHOLD:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Image not recognized as a banana leaf (low confidence). "
                    "Please upload a clear, close-up banana leaf photo."
                ),
            )

        # Runtime proof the model executed for this request
        logger.info(
            "prediction predicted_class=%s disease=%s confidence=%.4f is_diseased=%s low_confidence=%s",
            predicted_class,
            disease,
            confidence,
            is_diseased,
            low_confidence,
        )
        return PredictionResponse(
            disease=disease if (is_diseased or disease == "Healthy") else "Healthy",
            confidence=round(confidence, 4),
            is_diseased=is_diseased,
            low_confidence=low_confidence,
            disease_info=disease_info or None,
        )
    except InvalidImageError as e:
        raise HTTPException(status_code=400, detail=e.message)
    except ModelNotLoadedError as e:
        raise HTTPException(status_code=503, detail=e.message)
    except ModelInferenceError as e:
        raise HTTPException(status_code=500, detail=e.message)

