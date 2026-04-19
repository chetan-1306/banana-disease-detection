export const LOW_CONFIDENCE_THRESHOLD = 0.6;

export const clamp01 = (x) => Math.max(0, Math.min(1, typeof x === 'number' ? x : 0));

export const formatConfidencePct = (confidence01) => {
  const pct = clamp01(confidence01) * 100;
  return `${pct.toFixed(2)}%`;
};

/**
 * Normalize backend (or legacy) prediction shapes into one model:
 * { disease, confidence01, isDiseased, isLowConfidence, diseaseInfo }
 */
export const normalizePrediction = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return {
      disease: 'Healthy',
      confidence01: 0,
      isDiseased: false,
      isLowConfidence: true,
      diseaseInfo: null,
    };
  }

  // Preferred backend shape
  if (typeof raw.disease === 'string' && typeof raw.confidence === 'number' && typeof raw.is_diseased === 'boolean') {
    const confidence01 = clamp01(raw.confidence);
    return {
      disease: raw.disease,
      confidence01,
      isDiseased: raw.is_diseased,
      isLowConfidence: typeof raw.low_confidence === 'boolean' ? raw.low_confidence : confidence01 < LOW_CONFIDENCE_THRESHOLD,
      diseaseInfo: raw.disease_info || null,
    };
  }

  // Legacy shapes
  const predictedClass = raw.predicted_class;
  const disease = raw.disease || predictedClass || 'Healthy';

  // Some older code stored confidence as 0..100
  const conf = typeof raw.confidence === 'number' ? raw.confidence : 0;
  const confidence01 = conf > 1 ? clamp01(conf / 100) : clamp01(conf);

  const isDiseased = raw.is_diseased ?? (disease !== 'Healthy');
  return {
    disease,
    confidence01,
    isDiseased,
    isLowConfidence: confidence01 < LOW_CONFIDENCE_THRESHOLD,
    diseaseInfo: raw.disease_info || null,
  };
};

