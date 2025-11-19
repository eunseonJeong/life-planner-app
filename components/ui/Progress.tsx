import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface ProgressProps {
  value: number;
  style?: ViewStyle;
  height?: number;
}

export function Progress({ value, style, height = 8 }: ProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <View style={[styles.progressContainer, { height }, style]}>
      <View style={[styles.progressBar, { width: `${clampedValue}%`, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
});

