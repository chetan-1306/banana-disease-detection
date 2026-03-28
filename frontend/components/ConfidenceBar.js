import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export default function ConfidenceBar({ confidence = 0, color = COLORS.primary }) {
  const width = useRef(new Animated.Value(0)).current;
  const pct = Math.round(confidence * 100);

  useEffect(() => {
    Animated.timing(width, {
      toValue: pct,
      duration: 900,
      delay: 200,
      useNativeDriver: false,
    }).start();
  }, [confidence]);

  const barColor =
    pct >= 85 ? COLORS.primary :
    pct >= 60 ? COLORS.warning :
    COLORS.danger;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Confidence score</Text>
        <Text style={[styles.value, { color: barColor }]}>{pct}%</Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: barColor,
              width: width.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <Text style={styles.hint}>
        {pct >= 85 ? 'High confidence result' : pct >= 60 ? 'Moderate confidence — consider re-scanning' : 'Low confidence — please re-scan with better lighting'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
  },
  track: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  hint: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});