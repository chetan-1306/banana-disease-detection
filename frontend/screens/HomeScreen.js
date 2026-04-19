import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Animated, Alert, Dimensions, ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, RADIUS, SHADOW } from '../constants/theme';
import { predictDisease, healthCheck, API_BASE_URL } from '../services/api';
import LoadingOverlay from '../components/LoadingOverlay';
import { normalizePrediction } from '../utils/prediction';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = React.useState(false);
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const accentScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,    { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim,   { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.spring(accentScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();

    // Quick connectivity check (helps surface wrong IP/host binding issues)
    healthCheck().catch(() => {
      Alert.alert(
        'Backend not reachable',
        `Could not reach the prediction server.\n\nCurrent API base URL:\n${API_BASE_URL}\n\nFixes:\n• Start backend with --host 0.0.0.0\n• Ensure phone + laptop on same Wi‑Fi`,
        [{ text: 'OK' }]
      );
    });
  }, []);

  const requestPermission = async (type) => {
    const { status } = type === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        `Camera access is needed to scan leaves. Enable it in your device Settings.`,
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleScan = async (useCamera = false) => {
    const ok = await requestPermission(useCamera ? 'camera' : 'library');
    if (!ok) return;

    let result;
    if (useCamera) {
      result = await ImagePicker.launchCameraAsync({
        quality: 0.85,
        allowsEditing: true,
        aspect: [1, 1],
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.85,
        allowsEditing: true,
        aspect: [1, 1],
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
    }

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setLoading(true);

    try {
      const prediction = await predictDisease(uri);
      normalizePrediction(prediction);

      navigation.navigate('Result', { prediction, imageUri: uri });
    } catch (err) {
      Alert.alert(
        'Scan failed',
        `${err?.message || 'Request failed'}\n\nAPI: ${API_BASE_URL}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
      <LoadingOverlay visible={loading} message="Scanning your leaf for disease patterns..." />

      {/* ── Header ── */}
      <View style={styles.header}>
        {/* Accent dot top-right */}
        <Animated.View style={[styles.accentDot, { transform: [{ scale: accentScale }] }]} />

        <View style={styles.headerTop}>
          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>AI · LEAF SCANNER</Text>
            </View>
          </View>
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.headerTitle}>Banana{'\n'}Disease{'\n'}Detection</Text>
        </Animated.View>

        <Animated.Text style={[styles.headerSub, { opacity: fadeAnim }]}>
          Upload or capture a banana leaf to detect disease instantly
        </Animated.Text>
      </View>

      {/* ── Body ── */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], gap: 14 }}>

          {/* Step number + label */}
          <View style={styles.stepRow}>
            <Text style={styles.stepNum}>01</Text>
            <Text style={styles.stepLabel}>CHOOSE AN ACTION</Text>
          </View>

          {/* Upload card */}
          <TouchableOpacity
            style={styles.uploadCard}
            onPress={() => handleScan(false)}
            activeOpacity={0.88}
          >
            <View style={styles.uploadCardLeft}>
              <View style={styles.uploadIconBox}>
                <Text style={styles.uploadIconText}>📁</Text>
              </View>
              <View>
                <Text style={styles.uploadCardTitle}>Upload Photo</Text>
                <Text style={styles.uploadCardSub}>Select from gallery</Text>
              </View>
            </View>
            <View style={styles.uploadArrow}>
              <Text style={styles.uploadArrowText}>→</Text>
            </View>
          </TouchableOpacity>

          {/* Camera card */}
          <TouchableOpacity
            style={[styles.uploadCard, styles.cameraCard]}
            onPress={() => handleScan(true)}
            activeOpacity={0.88}
          >
            <View style={styles.uploadCardLeft}>
              <View style={[styles.uploadIconBox, styles.cameraIconBox]}>
                <Text style={styles.uploadIconText}>📸</Text>
              </View>
              <View>
                <Text style={[styles.uploadCardTitle, { color: COLORS.black }]}>Take Photo</Text>
                <Text style={[styles.uploadCardSub, { color: COLORS.textSecondary }]}>Use your camera</Text>
              </View>
            </View>
            <View style={[styles.uploadArrow, { backgroundColor: COLORS.black }]}>
              <Text style={styles.uploadArrowText}>→</Text>
            </View>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>TIPS FOR BEST RESULTS</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Tips */}
          {[
            { n: '01', t: 'Use natural daylight — avoid flash' },
            { n: '02', t: 'Frame a single leaf, no background clutter' },
            { n: '03', t: 'Keep the camera steady and focused' },
          ].map((tip) => (
            <View key={tip.n} style={styles.tipRow}>
              <Text style={styles.tipNum}>{tip.n}</Text>
              <Text style={styles.tipText}>{tip.t}</Text>
            </View>
          ))}

        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.offWhite },

  // Header
  header: {
    backgroundColor: COLORS.black,
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 32,
    overflow: 'hidden',
    gap: 12,
  },
  accentDot: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.accent,
    opacity: 0.18,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagRow: { flexDirection: 'row' },
  tag: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.black,
    letterSpacing: 0.15,
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1.5,
    lineHeight: 46,
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.textOnDarkDim,
    lineHeight: 18,
    fontWeight: '400',
  },

  // Body
  body: { flex: 1 },
  bodyContent: { padding: 24, paddingBottom: 40 },

  // Step
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepNum: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.border,
    letterSpacing: -1,
    lineHeight: 34,
  },
  stepLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.15,
  },

  // Cards
  uploadCard: {
    backgroundColor: COLORS.black,
    borderRadius: RADIUS.xl,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOW.strong,
  },
  cameraCard: {
    backgroundColor: COLORS.accent,
  },
  uploadCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  uploadIconBox: {
    width: 44, height: 44,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconBox: { backgroundColor: 'rgba(0,0,0,0.12)' },
  uploadIconText: { fontSize: 20 },
  uploadCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 2,
  },
  uploadCardSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  uploadArrow: {
    width: 36, height: 36,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadArrowText: { fontSize: 14, fontWeight: '700', color: COLORS.black },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 6,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.1,
  },

  // Tips
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipNum: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.accent,
    width: 20,
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    fontWeight: '400',
  },
});