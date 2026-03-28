import React, { useEffect, useRef } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, Animated, Share, Alert,
} from 'react-native';
import { COLORS } from '../constants/colors';
import ResultCard from '../components/ResultCard';

export default function ResultScreen({ route, navigation }) {
  const { prediction, imageUri } = route.params;
  const { disease, confidence } = prediction;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const imgScale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.spring(imgScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `BanaGuard Scan Result\n\nCondition: ${disease}\nConfidence: ${Math.round(confidence * 100)}%\n\nScanned with BanaGuard — Banana Disease Detection App`,
      });
    } catch (e) {
      Alert.alert('Error', 'Could not share result.');
    }
  };

  const isHealthy = disease === 'Healthy';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Result</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={styles.shareText}>share</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.curve} />

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Image Preview */}
        <Animated.View style={[styles.imageWrapper, { transform: [{ scale: imgScale }], opacity: fadeAnim }]}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.leafImage} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={{ fontSize: 48 }}>🍃</Text>
            </View>
          )}
          {/* Status overlay badge */}
          <View style={[styles.statusBadge, { backgroundColor: isHealthy ? COLORS.success : COLORS.danger }]}>
            <Text style={styles.statusBadgeText}>{isHealthy ? '✓ Healthy' : '⚠ Disease Detected'}</Text>
          </View>
        </Animated.View>

        {/* Result Card */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <ResultCard disease={disease} confidence={confidence} />

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.outlineBtnText}>New Scan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleShare}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Save Report</Text>
            </TouchableOpacity>
          </View>

          {/* Disclaimer */}
          <Text style={styles.disclaimer}>
            * This result is AI-generated and should be confirmed by an agricultural expert before taking action.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backArrow: { fontSize: 18, color: COLORS.textOnDark },
  backText: { fontSize: 13, color: COLORS.textOnDarkMuted, fontStyle: 'italic' },
  headerTitle: {
    fontFamily: 'serif',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textOnDark,
  },
  shareBtn: { padding: 4 },
  shareText: { fontSize: 13, color: COLORS.textOnDarkMuted, fontStyle: 'italic' },

  curve: {
    height: 24,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    marginTop: -24,
  },

  body: { flex: 1, paddingHorizontal: 20, marginTop: -4 },

  // Image
  imageWrapper: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
    height: 220,
    backgroundColor: COLORS.backgroundMuted,
  },
  leafImage: { width: '100%', height: '100%' },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundMuted,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 12,
  },
  outlineBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.borderStrong,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  outlineBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textOnDark,
  },

  disclaimer: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
  },
});