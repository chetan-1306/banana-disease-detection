import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, StatusBar } from 'react-native';
import { COLORS } from '../constants/colors';

export default function SplashScreen({ navigation }) {
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const subOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(subOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => navigation.replace('Home'), 800);
    });
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <Animated.View style={[styles.logoCircle, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
        <Text style={styles.logoEmoji}>🍌</Text>
      </Animated.View>

      <Animated.Text style={[styles.title, { opacity: textOpacity }]}>
        BanaGuard
      </Animated.Text>

      <Animated.Text style={[styles.subtitle, { opacity: subOpacity }]}>
        banana disease detection
      </Animated.Text>

      <Animated.Text style={[styles.tagline, { opacity: subOpacity }]}>
        powered by AI
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoEmoji: { fontSize: 48 },
  title: {
    fontFamily: 'serif',
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.textOnDark,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textOnDarkMuted,
    letterSpacing: 1,
    fontStyle: 'italic',
  },
  tagline: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});