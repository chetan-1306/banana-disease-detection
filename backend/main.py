from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
import io
from PIL import Image
import tensorflow as tf
import os

app = FastAPI(
    title="Banana Disease Detection API",
    description="API for detecting banana crop diseases using a trained CNN model.",
    version="1.0.0"
)

# ---------------------------------------------------------------------------
# CORS – allow the React frontend (adjust origins for production)
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Load model once at startup
# ---------------------------------------------------------------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "banana_disease_model.h5")

@app.on_event("startup")
def load_model():
    global model
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(
            f"Model file not found at '{MODEL_PATH}'. "
            "Please place banana_disease_model.h5 inside a 'models/' folder next to main.py."
        )
    model = tf.keras.models.load_model(MODEL_PATH)
    print("✅ Model loaded successfully.")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
CLASS_LABELS = [
    "Banana_Rust",
    "Banana_Scab_Moth",
    "Black_Leaf_Streak",
    "Black_Sigatoka",
    "Crown_Rot",
    "Fungal_Disease",
    "Healthy",
    "Panama_Disease",
]

DISEASE_INFO = {
    "Banana_Rust": {
        "description": "Rust-like fungal spots appear on the fruit surface.",
        "treatment": "Apply an appropriate fungicide. Remove and destroy infected plant parts.",
        "severity": "moderate",
    },
    "Banana_Scab_Moth": {
        "description": "Pest damage caused by the Banana Scab Moth on the fruit surface.",
        "treatment": "Use targeted pest control sprays. Consider pheromone traps for monitoring.",
        "severity": "moderate",
    },
    "Black_Leaf_Streak": {
        "description": "Dark streaks appear on leaves caused by Mycosphaerella fijiensis.",
        "treatment": "Apply protective or systemic fungicide. Improve plant spacing for airflow.",
        "severity": "high",
    },
    "Black_Sigatoka": {
        "description": "Serious fungal leaf disease reducing photosynthesis and yield.",
        "treatment": "Use resistant varieties and apply fungicide regularly.",
        "severity": "high",
    },
    "Crown_Rot": {
        "description": "Post-harvest fungal infection at the crown of the fruit.",
        "treatment": "Improve storage conditions and apply post-harvest fungicide dips.",
        "severity": "moderate",
    },
    "Fungal_Disease": {
        "description": "General fungal infection affecting the plant.",
        "treatment": "Maintain field hygiene. Apply broad-spectrum fungicide.",
        "severity": "low",
    },
    "Healthy": {
        "description": "The plant appears healthy with no visible disease.",
        "treatment": "Maintain regular watering, fertilisation, and crop monitoring.",
        "severity": "none",
    },
    "Panama_Disease": {
        "description": "Fusarium wilt caused by Fusarium oxysporum — highly destructive.",
        "treatment": "No chemical cure. Improve drainage, use resistant cultivars, and quarantine affected areas.",
        "severity": "critical",
    },
}

IMG_SIZE = (224, 224)

# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------
def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Read raw bytes → PIL Image → normalised numpy array ready for the model."""
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img = img.resize(IMG_SIZE)
        arr = np.array(img, dtype=np.float32) / 255.0
        return np.expand_dims(arr, axis=0)          # shape: (1, 224, 224, 3)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
def root():
    return {"message": "Banana Disease Detection API is running 🍌"}


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/predict", tags=["Prediction"])
async def predict(file: UploadFile = File(...)):
    """
    Upload a banana leaf image and receive a disease prediction.

    Returns:
    - predicted_class: name of the detected disease (or 'Healthy')
    - confidence: model confidence score (0–100)
    - all_predictions: confidence scores for every class
    - disease_info: description, treatment, and severity
    """
    # Validate file type
    if file.content_type not in ("image/jpeg", "image/png", "image/jpg", "image/webp"):
        raise HTTPException(
            status_code=415,
            detail="Unsupported file type. Please upload a JPEG or PNG image."
        )

    image_bytes = await file.read()
    img_array = preprocess_image(image_bytes)

    predictions = model.predict(img_array, verbose=0)[0]          # shape: (8,)
    predicted_index = int(np.argmax(predictions))
    confidence = float(np.max(predictions)) * 100

    predicted_class = CLASS_LABELS[predicted_index]

    all_predictions = {
        label: round(float(score) * 100, 2)
        for label, score in zip(CLASS_LABELS, predictions)
    }

    return JSONResponse(content={
        "predicted_class": predicted_class,
        "confidence": round(confidence, 2),
        "all_predictions": all_predictions,
        "disease_info": DISEASE_INFO.get(predicted_class, {}),
    })
