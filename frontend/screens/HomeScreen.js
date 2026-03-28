import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Image, ScrollView,
  StyleSheet, Alert, StatusBar, Animated, Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/colors';
import { predictDisease } from '../services/api';
import LoadingOverlay from '../components/LoadingOverlay';

const { width } = Dimensions.get('window');

// Mock history — replace with real AsyncStorage/DB later
const MOCK_HISTORY = [
  { id: '1', label: 'Healthy', confidence: 0.98, date: 'Today, 10:24 AM', thumb: null, severity: 'none' },
  { id: '2', label: 'Black Sigatoka', confidence: 0.91, date: 'Yesterday, 3:15 PM', thumb: null, severity: 'high' },
  { id: '3', label: 'Yellow Sigatoka', confidence: 0.76, date: 'Dec 12, 9:00 AM', thumb: null, severity: 'medium' },
];

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(MOCK_HISTORY);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const requestPermission = async (type) => {
    const { status } = type === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', `Please allow ${type} access in your device settings.`);
      return false;
    }
    return true;
  };

  const handlePickImage = async (useCamera = false) => {
    const permitted = await requestPermission(useCamera ? 'camera' : 'library');
    if (!permitted) return;

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: true, aspect: [1, 1] })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.85, allowsEditing: true, aspect: [1, 1], mediaTypes: ImagePicker.MediaTypeOptions.Images });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setLoading(true);

    try {
      const prediction = await predictDisease(uri);
      // Add to history
      setHistory(prev => [{
        id: Date.now().toString(),
        label: prediction.disease,
        confidence: prediction.confidence,
        date: 'Just now',
        thumb: uri,
        severity: prediction.severity || 'none',
      }, ...prev]);
      navigation.navigate('Result', { prediction, imageUri: uri });
    } catch (err) {
      Alert.alert(
        'Connection Error',
        'Could not reach the server. Make sure your backend is running and the IP is correct in services/api.js.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    if (severity === 'none') return COLORS.success;
    if (severity === 'high') return COLORS.danger;
    return COLORS.warning;
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <LoadingOverlay visible={loading} message="Scanning leaf for disease..." />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerGreeting}>good morning</Text>
          <Text style={styles.headerTitle}>BanaGuard</Text>
          <Text style={styles.headerSub}>banana disease detection</Text>
        </View>
        {/* Decorative leaf dots */}
        <View style={styles.headerDecor}>
          <View style={[styles.decorDot, { top: 10, right: 20, width: 40, height: 40, opacity: 0.15 }]} />
          <View style={[styles.decorDot, { top: 30, right: 50, width: 20, height: 20, opacity: 0.1 }]} />
        </View>
      </View>

      {/* Curved transition */}
      <View style={styles.curve} />

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Upload Zone */}
          <TouchableOpacity style={styles.uploadZone} onPress={() => handlePickImage(false)} activeOpacity={0.8}>
            <View style={styles.uploadIconCircle}>
              <Text style={styles.uploadIcon}>📷</Text>
            </View>
            <Text style={styles.uploadTitle}>Upload Leaf Photo</Text>
            <Text style={styles.uploadSub}>tap to select from your gallery</Text>
            <View style={styles.uploadDivider} />
            <Text style={styles.uploadHint}>Supported: JPG, PNG</Text>
          </TouchableOpacity>

          {/* Camera Button */}
          <TouchableOpacity style={styles.cameraBtn} onPress={() => handlePickImage(true)} activeOpacity={0.85}>
            <Text style={styles.cameraIcon}>📸</Text>
            <Text style={styles.cameraBtnText}>Open Camera</Text>
          </TouchableOpacity>

          {/* Tips card */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>📌 Tips for best results</Text>
            <Text style={styles.tipItem}>• Focus on the leaf clearly, avoid blur</Text>
            <Text style={styles.tipItem}>• Use natural light when possible</Text>
            <Text style={styles.tipItem}>• Capture only one leaf at a time</Text>
          </View>

          {/* Recent Scans */}
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          {history.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              <View style={[styles.historyThumb, { backgroundColor: item.severity === 'none' ? '#c8dfc2' : item.severity === 'high' ? '#f4c9c2' : '#f9e6b8' }]}>
                {item.thumb
                  ? <Image source={{ uri: item.thumb }} style={styles.historyImg} />
                  : <Text style={{ fontSize: 16 }}>{item.severity === 'none' ? '🍃' : '🍂'}</Text>
                }
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyLabel}>{item.label}</Text>
                <Text style={styles.historyDate}>{item.date}</Text>
              </View>
              <View style={[styles.historyBadge, { backgroundColor: getSeverityColor(item.severity) + '22' }]}>
                <Text style={[styles.historyBadgeText, { color: getSeverityColor(item.severity) }]}>
                  {Math.round(item.confidence * 100)}%
                </Text>
              </View>
            </View>
          ))}
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
    paddingHorizontal: 24,
    paddingBottom: 36,
    overflow: 'hidden',
  },
  headerContent: { zIndex: 2 },
  headerGreeting: {
    fontSize: 12,
    color: COLORS.textOnDarkMuted,
    letterSpacing: 1,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: 'serif',
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textOnDark,
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.textOnDarkMuted,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  headerDecor: { position: 'absolute', top: 0, right: 0, bottom: 0 },
  decorDot: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: COLORS.white,
  },

  // Curve
  curve: {
    height: 28,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    marginTop: -28,
  },

  body: { flex: 1, paddingHorizontal: 20, marginTop: -4 },

  // Upload Zone
  uploadZone: {
    backgroundColor: COLORS.backgroundMuted,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.borderStrong,
    borderStyle: 'dashed',
    padding: 28,
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  uploadIconCircle: {
    width: 56,
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  uploadIcon: { fontSize: 24 },
  uploadTitle: {
    fontFamily: 'serif',
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary,
  },
  uploadSub: { fontSize: 12, color: COLORS.textMuted },
  uploadDivider: { width: 40, height: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  uploadHint: { fontSize: 11, color: COLORS.textMuted, fontStyle: 'italic' },

  // Camera Button
  cameraBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cameraIcon: { fontSize: 18 },
  cameraBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textOnDark,
    letterSpacing: 0.3,
  },

  // Tips
  tipsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: COLORS.border,
    gap: 5,
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  tipItem: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },

  // Section title
  sectionTitle: {
    fontFamily: 'serif',
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 12,
  },

  // History
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  historyThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  historyImg: { width: '100%', height: '100%' },
  historyInfo: { flex: 1 },
  historyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  historyDate: { fontSize: 11, color: COLORS.textMuted },
  historyBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  historyBadgeText: { fontSize: 12, fontWeight: '700' },
});