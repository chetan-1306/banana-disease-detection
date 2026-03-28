import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Modal } from 'react-native';
import { COLORS } from '../constants/colors';

export default function LoadingOverlay({ visible, message = 'Analysing leaf...' }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse.setValue(1);
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Animated.View style={[styles.iconCircle, { transform: [{ scale: pulse }] }]}>
            <Text style={styles.icon}>🍃</Text>
          </Animated.View>
          <Text style={styles.title}>Analysing</Text>
          <Text style={styles.subtitle}>{message}</Text>
          <View style={styles.dotsRow}>
            {[0, 1, 2].map((i) => (
              <AnimatedDot key={i} delay={i * 200} />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function AnimatedDot({ delay }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return <Animated.View style={[styles.dot, { opacity }]} />;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    backgroundColor: COLORS.backgroundMuted,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: { fontSize: 28 },
  title: {
    fontFamily: 'serif',
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  dotsRow: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
});