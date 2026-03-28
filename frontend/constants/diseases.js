export const BANANA_DISEASES = {
  'Black Sigatoka': {
    severity: 'high',
    color: 'danger',
    description: 'Fungal leaf disease caused by Mycosphaerella fijiensis. Causes dark streaks and lesions on leaves, reducing photosynthesis.',
    recommendation: 'Apply approved systemic fungicide immediately. Remove and destroy all visibly infected leaves. Improve airflow around plants.',
    icon: '🍂',
  },
  'Yellow Sigatoka': {
    severity: 'medium',
    color: 'warning',
    description: 'Fungal infection caused by Mycosphaerella musicola. Presents as yellow spots that expand into streaks on leaves.',
    recommendation: 'Apply copper-based fungicide spray. Monitor spread weekly. Ensure adequate plant nutrition.',
    icon: '🌿',
  },
  'Panama Disease': {
    severity: 'high',
    color: 'danger',
    description: 'Soil-borne fungal disease caused by Fusarium oxysporum. Attacks the root system and internal stem tissue.',
    recommendation: 'No chemical cure available. Isolate affected plants immediately. Do not replant bananas in the same soil for several years.',
    icon: '🌱',
  },
  'Banana Bunchy Top': {
    severity: 'high',
    color: 'danger',
    description: 'Viral disease spread by banana aphids. Causes stunted growth and a bunched appearance at the top of the plant.',
    recommendation: 'Remove and destroy infected plants entirely. Control aphid populations with insecticide. Use virus-free planting material.',
    icon: '🍃',
  },
  'Moko Disease': {
    severity: 'high',
    color: 'danger',
    description: 'Bacterial wilt disease caused by Ralstonia solanacearum. Causes internal browning and plant collapse.',
    recommendation: 'Destroy infected plants by cutting and applying herbicide to the stump. Disinfect all tools. Restrict movement of plant material.',
    icon: '🌾',
  },
  'Healthy': {
    severity: 'none',
    color: 'success',
    description: 'No disease detected. The banana plant appears to be in good health with no visible signs of infection.',
    recommendation: 'Continue regular watering, fertilization, and monitoring. Inspect leaves weekly for early signs of disease.',
    icon: '✅',
  },
};

export const SEVERITY_LABELS = {
  high: 'High Severity',
  medium: 'Medium Severity',
  low: 'Low Severity',
  none: 'Healthy',
};