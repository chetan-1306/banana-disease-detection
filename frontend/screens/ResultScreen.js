import React, { useRef, useEffect } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, Animated, Share, Alert,
} from 'react-native';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';
import { DISEASES, SEVERITY_CONFIG } from '../constants/diseases';
import { formatConfidencePct, LOW_CONFIDENCE_THRESHOLD, normalizePrediction } from '../utils/prediction';

export default function ResultScreen({ route, navigation }) {
  const { prediction, imageUri } = route.params;
  const normalized = normalizePrediction(prediction);
  const disease = normalized.disease;
  const confidence01 = normalized.confidence01;
  const isDiseased = normalized.isDiseased;
  const isLowConfidence = normalized.isLowConfidence;
  const showDiagnosis = !isLowConfidence;

  const apiInfo = normalized.diseaseInfo;
  const fallbackInfo = DISEASES[disease] || DISEASES['Healthy'];
  const info = apiInfo
    ? {
      ...fallbackInfo,
      description: apiInfo.description || fallbackInfo.description,
      recommendation: apiInfo.treatment || fallbackInfo.recommendation,
      severity: apiInfo.severity || fallbackInfo.severity,
    }
    : fallbackInfo;
  const severity = SEVERITY_CONFIG[info.severity] || SEVERITY_CONFIG.none;
  const pctLabel = formatConfidencePct(confidence01);
  const pctNum = Math.round(confidence01 * 100);
  const isHealthy = !isDiseased;

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;
  const barAnim   = useRef(new Animated.Value(0)).current;
  const imgScale  = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
      Animated.spring(imgScale,  { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
      Animated.timing(barAnim, {
        toValue: confidence01,
        duration: 1000,
        delay: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: showDiagnosis
          ? `🍌 Banana Disease Detection\n\nResult: ${disease}\nConfidence: ${pctLabel}\n\n${info.recommendation}`
          : `🍌 Banana Disease Detection\n\nResult: Low confidence\nConfidence: ${pctLabel}\n\nPlease re-scan with a clearer photo.`,
      });
    } catch (e) { /* silent */ }
  };

  const barColor = isLowConfidence
    ? COLORS.warning
    : isHealthy
      ? COLORS.success
      : info.severity === 'high'
        ? COLORS.danger
        : COLORS.warning;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backLabel}>SCAN</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RESULT</Text>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareLabel}>SHARE</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], gap: 16 }}>

          {/* ── Image ── */}
          <Animated.View style={[styles.imgWrapper, { transform: [{ scale: imgScale }] }]}>
            {imageUri
              ? <Image source={{ uri: imageUri }} style={styles.img} resizeMode="cover" />
              : <View style={styles.imgPlaceholder}><Text style={{ fontSize: 56 }}>🍃</Text></View>
            }
            {/* Status overlay */}
            <View style={[styles.statusChip, { backgroundColor: (isLowConfidence || isHealthy) ? COLORS.success : COLORS.danger }]}>
              <Text style={styles.statusChipText}>
                {isLowConfidence
                  ? '✓  DISEASE NOT DETECTED'
                  : isHealthy
                    ? '✓  HEALTHY'
                    : '⚠  DISEASE DETECTED'}
              </Text>
            </View>
            {/* Corner badge */}
            <View style={styles.cornerBadge}>
              <Text style={styles.cornerEmoji}>{info.emoji}</Text>
            </View>
          </Animated.View>

          {/* ── Disease name block ── */}
          {showDiagnosis && (
            <View style={styles.nameBlock}>
              <View style={styles.nameBlockLeft}>
                <Text style={styles.nameLabel}>DETECTED CONDITION</Text>
                <Text style={styles.diseaseName}>{disease}</Text>
                <Text style={styles.diseaseShort}>{info.shortDesc}</Text>
              </View>
              <View style={[styles.severityBadge, { backgroundColor: severity.color }]}>
                <Text style={styles.severityText}>{info.severity.toUpperCase()}</Text>
              </View>
            </View>
          )}

          {/* ── Confidence ── */}
          <View style={styles.confCard}>
            <View style={styles.confHeader}>
              <Text style={styles.confLabel}>CONFIDENCE SCORE</Text>
              <Text style={[styles.confPct, { color: barColor }]}>{pctLabel}</Text>
            </View>
            <View style={styles.confTrack}>
              <Animated.View
                style={[styles.confFill, {
                  backgroundColor: barColor,
                  width: barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                }]}
              />
            </View>
            <Text style={styles.confHint}>
              {isLowConfidence
                ? `Low confidence (< ${(LOW_CONFIDENCE_THRESHOLD * 100).toFixed(0)}%) — try a clearer photo`
                : pctNum >= 85
                  ? 'High confidence — reliable result'
                  : 'Moderate confidence — consider re-scanning'}
            </Text>
          </View>

          {/* ── About ── */}
          {showDiagnosis && (
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>ABOUT THIS CONDITION</Text>
              <Text style={styles.infoCardBody}>{info.description}</Text>
            </View>
          )}

          {/* ── Recommendation ── */}
          {showDiagnosis && (
            <View style={[styles.recCard, { borderLeftColor: barColor }]}>
              <Text style={styles.recTitle}>RECOMMENDATION</Text>
              <Text style={styles.recBody}>{info.recommendation}</Text>
            </View>
          )}

          {/* ── Actions ── */}
          <View style={styles.actRow}>
            <TouchableOpacity
              style={styles.btnOutline}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.btnOutlineText}>New Scan</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.disclaimer}>
            * AI-generated result. Consult an agricultural expert before taking action.
          </Text>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.offWhite },

  header: {
    backgroundColor: COLORS.black,
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backArrow: { fontSize: 18, color: COLORS.white, fontWeight: '300' },
  backLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textOnDarkDim, letterSpacing: 0.1 },
  headerTitle: { fontSize: 13, fontWeight: '800', color: COLORS.white, letterSpacing: 0.15 },
  shareBtn: { padding: 4 },
  shareLabel: { fontSize: 10, fontWeight: '700', color: COLORS.accent, letterSpacing: 0.1 },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },

  // Image
  imgWrapper: {
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    height: 230,
    backgroundColor: COLORS.border,
    position: 'relative',
    ...SHADOW.strong,
  },
  img: { width: '100%', height: '100%' },
  imgPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusChip: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.1,
  },
  cornerBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerEmoji: { fontSize: 20 },

  // Name block
  nameBlock: {
    backgroundColor: COLORS.black,
    borderRadius: RADIUS.xl,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    ...SHADOW.strong,
  },
  nameBlockLeft: { flex: 1, gap: 4 },
  nameLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textOnDarkDim,
    letterSpacing: 0.15,
  },
  diseaseName: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.8,
    lineHeight: 30,
  },
  diseaseShort: {
    fontSize: 11,
    color: COLORS.textOnDarkDim,
    lineHeight: 16,
    marginTop: 2,
  },
  severityBadge: {
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginTop: 20,
  },
  severityText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.1,
  },

  // Confidence
  confCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.xl,
    padding: 18,
    gap: 8,
    ...SHADOW.card,
  },
  confHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.12,
  },
  confPct: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  confTrack: {
    height: 6,
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  confFill: { height: '100%', borderRadius: RADIUS.full },
  confHint: { fontSize: 11, color: COLORS.textMuted, fontWeight: '400' },

  // Info card
  infoCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.xl,
    padding: 18,
    gap: 8,
    ...SHADOW.card,
  },
  infoCardTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.12,
  },
  infoCardBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontWeight: '400',
  },

  // Rec card
  recCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.xl,
    padding: 18,
    gap: 8,
    borderLeftWidth: 4,
    ...SHADOW.card,
  },
  recTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.12,
  },
  recBody: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 20,
    fontWeight: '500',
  },

  // Buttons
  actRow: { flexDirection: 'row', gap: 12 },
  btnOutline: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.xl,
    paddingVertical: 15,
    alignItems: 'center',
  },
  btnOutlineText: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: 0.02 },
  btnSolid: {
    flex: 1,
    backgroundColor: COLORS.black,
    borderRadius: RADIUS.xl,
    paddingVertical: 15,
    alignItems: 'center',
    ...SHADOW.strong,
  },
  btnSolidText: { fontSize: 13, fontWeight: '700', color: COLORS.white, letterSpacing: 0.02 },

  disclaimer: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 15,
    fontStyle: 'italic',
  },
});