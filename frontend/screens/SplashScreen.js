import React, { useEffect, useRef } from 'react';
import {
  View, Text, Animated, StyleSheet, StatusBar, Dimensions,
} from 'react-native';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const titleY    = useRef(new Animated.Value(30)).current;
  const titleOp   = useRef(new Animated.Value(0)).current;
  const subOp     = useRef(new Animated.Value(0)).current;
  const dotScale  = useRef(new Animated.Value(0)).current;
  const barWidth  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(dotScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(titleOp,  { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
        Animated.timing(titleY,   { toValue: 0, duration: 500, delay: 200, useNativeDriver: true }),
      ]),
      Animated.timing(subOp, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(barWidth, { toValue: 1, duration: 900, useNativeDriver: false }),
    ]).start(() => {
      setTimeout(() => navigation.replace('Main'), 400);
    });
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

      {/* Background accent blob */}
      <Animated.View style={[styles.blob, { transform: [{ scale: dotScale }] }]} />

      {/* Number badge */}
      <Animated.View style={[styles.badge, { transform: [{ scale: dotScale }] }]}>
        <Text style={styles.badgeText}>AI</Text>
      </Animated.View>

      <View style={styles.content}>
        <Animated.View style={{ opacity: titleOp, transform: [{ translateY: titleY }] }}>
          <Text style={styles.title}>Banana{'\n'}Disease{'\n'}Detection</Text>
        </Animated.View>

        <Animated.Text style={[styles.sub, { opacity: subOp }]}>
          POWERED BY DEEP LEARNING
        </Animated.Text>

        {/* Loading bar */}
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, {
            width: barWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          }]} />
        </View>
      </View>

      <Animated.Text style={[styles.version, { opacity: subOp }]}>v1.0</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.black,
    paddingHorizontal: 32,
    paddingBottom: 48,
    justifyContent: 'flex-end',
  },
  blob: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.accent,
    opacity: 0.12,
  },
  badge: {
    position: 'absolute',
    top: 80,
    right: 32,
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.black,
    letterSpacing: 0.5,
  },
  content: { gap: 16 },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1.5,
    lineHeight: 52,
  },
  sub: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textOnDarkDim,
    letterSpacing: 0.2,
  },
  barTrack: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 1,
    overflow: 'hidden',
    marginTop: 4,
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 1,
  },
  version: {
    position: 'absolute',
    bottom: 48,
    right: 32,
    fontSize: 11,
    color: COLORS.textOnDarkDim,
    letterSpacing: 0.1,
  },
});