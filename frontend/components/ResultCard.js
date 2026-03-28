import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { BANANA_DISEASES, SEVERITY_LABELS } from '../constants/diseases';
import ConfidenceBar from './ConfidenceBar';

export default function ResultCard({ disease, confidence }) {
  const info = BANANA_DISEASES[disease] || BANANA_DISEASES['Healthy'];
  const isHealthy = info.severity === 'none';
  const isHigh = info.severity === 'high';

  const severityColor = isHealthy ? COLORS.success : isHigh ? COLORS.danger : COLORS.warning;
  const severityBg = isHealthy ? COLORS.successLight : isHigh ? COLORS.dangerLight : COLORS.warningLight;

  return (
    <View style={styles.container}>
      {/* Disease Name */}
      <View style={[styles.diseaseBanner, { borderLeftColor: severityColor, backgroundColor: severityBg }]}>
        <Text style={styles.detectedLabel}>detected condition</Text>
        <Text style={[styles.diseaseName, { color: isHealthy ? COLORS.primary : COLORS.danger }]}>
          {disease}
        </Text>
        <View style={[styles.severityBadge, { backgroundColor: severityColor }]}>
          <Text style={styles.severityText}>{SEVERITY_LABELS[info.severity]}</Text>
        </View>
      </View>

      {/* Confidence */}
      <ConfidenceBar confidence={confidence} />

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About this condition</Text>
        <Text style={styles.sectionBody}>{info.description}</Text>
      </View>

      {/* Recommendation */}
      <View style={[styles.section, styles.recBox]}>
        <Text style={styles.sectionTitle}>Recommendation</Text>
        <Text style={styles.sectionBody}>{info.recommendation}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  diseaseBanner: {
    borderLeftWidth: 4,
    borderRadius: 0,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    padding: 14,
    gap: 6,
  },
  detectedLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    textTransform: 'lowercase',
    letterSpacing: 0.5,
  },
  diseaseName: {
    fontFamily: 'serif',
    fontSize: 22,
    fontWeight: '700',
  },
  severityBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 2,
  },
  severityText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: { gap: 4 },
  sectionTitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    textTransform: 'lowercase',
    letterSpacing: 0.4,
  },
  sectionBody: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  recBox: {
    backgroundColor: COLORS.backgroundMuted,
    padding: 14,
    borderRadius: 12,
  },
});