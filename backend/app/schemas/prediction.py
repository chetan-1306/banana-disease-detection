from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field


Severity = Literal["none", "low", "medium", "high"]


class DiseaseInfo(BaseModel):
    description: str = ""
    treatment: str = ""
    severity: Severity = "low"


class PredictionResponse(BaseModel):
    disease: str = Field(description="Display name (e.g., 'Black Sigatoka' or 'Healthy').")
    confidence: float = Field(ge=0.0, le=1.0, description="Confidence score (0-1).")
    is_diseased: bool
    low_confidence: bool = False
    disease_info: Optional[DiseaseInfo] = None

