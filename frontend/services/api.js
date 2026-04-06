import axios from 'axios';

// Replace 192.168.x.x with your actual IPv4 address from ipconfig
const BASE_URL = 'http://192.168.1.33:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

export const predictDisease = async (imageUri) => {
  const formData = new FormData();
  
  // Expo web sends a blob, Expo native sends a file object
  if (imageUri.startsWith('data:') || imageUri.startsWith('blob:')) {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    formData.append('file', blob, 'banana_leaf.jpg');
  } else {
    formData.append('file', {
      uri: imageUri,
      name: 'banana_leaf.jpg',
      type: 'image/jpeg',
    });
  }

  const response = await api.post('/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  const data = response.data;

  return {
    disease: data.predicted_class.replace(/_/g, ' '),
    confidence: data.confidence / 100,
    severity: data.disease_info?.severity || 'none',
    description: data.disease_info?.description || '',
    treatment: data.disease_info?.treatment || '',
    all_predictions: data.all_predictions,
  };
};

export const pingBackend = async () => {
  const response = await api.get('/health');
  return response.data;
};