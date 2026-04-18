import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getDevHost = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost;

  if (!hostUri || typeof hostUri !== 'string') return null;
  // hostUri often looks like: "192.168.1.4:8081"
  return hostUri.split(':')[0];
};

const getBaseUrl = () => {
  // Android emulator cannot reach your machine IP directly.
  if (Platform.OS === 'android' && Constants.isDevice === false) {
    return 'http://10.0.2.2:8000';
  }

  const host = getDevHost();
  if (host) return `http://${host}:8000`;

  // Fallback: keep this as a last resort for local dev
  return 'http://127.0.0.1:8000';
};

export const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

const getMimeTypeFromUri = (uri) => {
  const lower = (uri || '').toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
};

const getAxiosErrorMessage = (err) => {
  const status = err?.response?.status;
  const detail = err?.response?.data?.detail;
  if (status && detail) return `${detail} (HTTP ${status})`;
  if (status) return `Request failed (HTTP ${status})`;
  if (err?.message) return err.message;
  return 'Request failed';
};

/**
 * Send image to FastAPI backend for disease prediction
 * @param {string} imageUri - local URI from ImagePicker
 * @returns {import('../types').PredictionResponse | any}
 */
export const predictDisease = async (imageUri) => {
  const formData = new FormData();
  const mime = getMimeTypeFromUri(imageUri);
  const filename = 'leaf' + (mime === 'image/png' ? '.png' : '.jpg');

  // Web requires a real Blob/File. The React Native `{ uri, name, type }` shape
  // is only for native iOS/Android networking stacks.
  if (Platform.OS === 'web') {
    const res = await fetch(imageUri);
    if (!res.ok) {
      throw new Error(`Failed to read image for upload (HTTP ${res.status})`);
    }
    const blob = await res.blob();
    formData.append('file', blob, filename);
  } else {
    formData.append('file', { uri: imageUri, name: filename, type: mime });
  }

  try {
    const response = await api.post('/predict', formData);
    return response.data;
  } catch (err) {
    const message = getAxiosErrorMessage(err);
    const wrapped = new Error(message);
    wrapped.cause = err;
    throw wrapped;
  }
};

export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};