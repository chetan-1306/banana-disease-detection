import axios from 'axios';

// Change this to your FastAPI backend IP when running
const BASE_URL = 'http://YOUR_BACKEND_IP:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

/**
 * Send an image to the backend and get a disease prediction
 * @param {string} imageUri - local URI of the image from ImagePicker
 * @returns {{ disease: string, confidence: number }}
 */
export const predictDisease = async (imageUri) => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    name: 'banana_leaf.jpg',
    type: 'image/jpeg',
  });

  const response = await api.post('/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
  // Expected: { disease: "Black Sigatoka", confidence: 0.91 }
};

/**
 * Health check — verify backend is reachable
 */
export const pingBackend = async () => {
  const response = await api.get('/health');
  return response.data;
};