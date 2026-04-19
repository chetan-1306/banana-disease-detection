from __future__ import annotations

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

DISPLAY_NAMES = {
    "Banana_Rust": "Banana Rust",
    "Banana_Scab_Moth": "Banana Scab Moth",
    "Black_Leaf_Streak": "Black Leaf Streak",
    "Black_Sigatoka": "Black Sigatoka",
    "Crown_Rot": "Crown Rot",
    "Fungal_Disease": "Fungal Disease",
    "Healthy": "Healthy",
    "Panama_Disease": "Panama Disease",
}


DISEASE_INFO = {
    "Banana_Rust": {
        "description": "Rust-like fungal spots appear on the fruit surface.",
        "treatment": "Apply an appropriate fungicide. Remove and destroy infected plant parts.",
        "severity": "medium",
    },
    "Banana_Scab_Moth": {
        "description": "Pest damage caused by the Banana Scab Moth on the fruit surface.",
        "treatment": "Use targeted pest control sprays. Consider pheromone traps for monitoring.",
        "severity": "medium",
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
        "severity": "medium",
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
        "severity": "high",
    },
}

