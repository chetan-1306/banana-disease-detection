from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class InvalidImageError(Exception):
    message: str


@dataclass(frozen=True)
class ModelNotLoadedError(Exception):
    message: str = "Model is not loaded."


@dataclass(frozen=True)
class ModelInferenceError(Exception):
    message: str

