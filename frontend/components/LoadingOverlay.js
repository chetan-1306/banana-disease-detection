import React, { useEffect, useRef } from 'react';
import {
  View, Text, Modal, Animated, StyleSheet,
} from 'react-native';
import { COLORS } from '../constants/theme';

export default function LoadingOverlay({ visible, message = 'Analysing leaf...' }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (!visible) return;

    Animated.spring(scale, {
      toValue: 1, tension: 80, friction: 8, useNativeDriver: true,
    }).start();

    const animDot = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.delay(800 - delay),
        ])
      ).start();

    animDot(dot1, 0);
    animDot(dot2, 200);
    animDot(dot3, 400);

    return () => { dot1.stopAnimation(); dot2.stopAnimation(); dot3.stopAnimation(); };
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>🔬</Text>
          </View>
          <View style={styles.labelRow}>
            <Text style={styles.step}>SCANNING</Text>
          </View>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.dots}>
            {[dot1, dot2, dot3].map((dot, i) => (
              <Animated.View
                key={i}
                style={[styles.dot, {
                  opacity: dot,
                  transform: [{ scale: dot.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
                }]}
              />
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17,17,17,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 32,
    width: 240,
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 64, height: 64,
    backgroundColor: COLORS.black,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  icon: { fontSize: 28 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  step: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: COLORS.black,
  },
  message: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  dots: { flexDirection: 'row', gap: 6, marginTop: 4 },
  dot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
});