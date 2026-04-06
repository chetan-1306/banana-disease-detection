# 🍌 Banana Disease Detection — Backend

FastAPI backend that serves the trained Keras model to the React frontend.

---

## 📁 Folder Structure

```
backend/
├── main.py               ← FastAPI app
├── requirements.txt      ← Python dependencies
├── models/
│   └── banana_disease_model.h5   ← place your model here
└── README.md
```

---

## 🚀 Setup & Run

### 1. Place your model file

Copy `banana_disease_model.h5` into the `models/` folder:

```
backend/
└── models/
    └── banana_disease_model.h5
```

### 2. Create a virtual environment (recommended)

```bash
python -m venv venv
source venv/bin/activate        # macOS / Linux
venv\Scripts\activate           # Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the server

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at: **http://localhost:8000**

---

## 📡 API Endpoints

| Method | URL       | Description                        |
|--------|-----------|------------------------------------|
| GET    | `/`       | Health check                       |
| GET    | `/health` | Returns model load status          |
| POST   | `/predict`| Upload image → get prediction      |

### POST `/predict`

**Request:** `multipart/form-data` with a field named `file` (JPEG or PNG image)

**Response:**
```json
{
  "predicted_class": "Black_Sigatoka",
  "confidence": 94.73,
  "all_predictions": {
    "Banana_Rust": 0.12,
    "Banana_Scab_Moth": 0.03,
    "Black_Leaf_Streak": 1.45,
    "Black_Sigatoka": 94.73,
    "Crown_Rot": 0.89,
    "Fungal_Disease": 2.11,
    "Healthy": 0.54,
    "Panama_Disease": 0.13
  },
  "disease_info": {
    "description": "Serious fungal leaf disease reducing photosynthesis and yield.",
    "treatment": "Use resistant varieties and apply fungicide regularly.",
    "severity": "high"
  }
}
```

---

## 🌐 Connecting to the React Frontend

In your React app, call the API like this:

```js
const formData = new FormData();
formData.append("file", selectedImageFile);

const response = await fetch("http://localhost:8000/predict", {
  method: "POST",
  body: formData,
});

const result = await response.json();
console.log(result.predicted_class, result.confidence);
```

---

## ⚙️ CORS

By default the backend allows requests from:
- `http://localhost:3000` (Create React App)
- `http://localhost:5173` (Vite)

To allow your deployed frontend, add its URL to the `allow_origins` list in `main.py`.
