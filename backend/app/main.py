from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import logging

from app.api.routes.predict import router as predict_router
from app.core.config import ALLOWED_ORIGINS
from app.services.model_service import model_service


def create_app() -> FastAPI:
    logging.basicConfig(level=logging.INFO)
    app = FastAPI(
        title="Banana Disease Detection API",
        description="API for detecting banana crop diseases using a trained CNN model.",
        version="1.0.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def _startup() -> None:
        model_service.load()

    @app.get("/", tags=["Health"])
    def root():
        return {"message": "Banana Disease Detection API is running"}

    @app.get("/health", tags=["Health"])
    def health_check():
        return {"status": "ok", "model_loaded": model_service.loaded}

    app.include_router(predict_router)
    return app


app = create_app()

