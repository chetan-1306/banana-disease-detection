// src/api/predict.js
// Drop this file into your React frontend's src/api/ folder.
// Call predictDisease(file) with a File object from an <input type="file">.

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

/**
 * Send an image file to the backend and get a disease prediction.
 *
 * @param {File} file - The image file selected by the user
 * @returns {Promise<{
 *   predicted_class: string,
 *   confidence: number,
 *   all_predictions: Record<string, number>,
 *   disease_info: { description: string, treatment: string, severity: string }
 * }>}
 */
export async function predictDisease(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Server error: ${response.status}`);
  }

  return response.json();
}

/**
 * Check if the backend is reachable and model is loaded.
 * @returns {Promise<boolean>}
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data.model_loaded === true;
  } catch {
    return false;
  }
}
