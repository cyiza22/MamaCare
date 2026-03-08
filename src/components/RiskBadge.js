// Risk Level Badge

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../theme';

const RiskBadge = ({ level, score, size = 'medium' }) => {
  const config = {
    low:      { color: COLORS.riskLow,      bg: '#E8F5E9', label: 'Low Risk',      emoji: '💚' },
    moderate: { color: COLORS.riskModerate,  bg: '#FFF3E0', label: 'Moderate Risk', emoji: '🧡' },
    high:     { color: COLORS.riskHigh,      bg: '#FFEBEE', label: 'High Risk',     emoji: '❤️' },
  };

  const c = config[level] || config.low;

  return (
    <View style={[styles.container, { backgroundColor: c.bg }, styles[`${size}Container`]]}>
      <Text style={styles[`${size}Emoji`]}>{c.emoji}</Text>
      <View>
        <Text style={[styles.label, { color: c.color }, styles[`${size}Label`]]}>
          {c.label}
        </Text>
        {score !== undefined && (
          <Text style={[styles.score, { color: c.color }]}>
            Score: {(score * 100).toFixed(0)}%
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    gap: 10,
  },
  // Sizes
  mediumContainer: { padding: 14 },
  largeContainer:  { padding: 20 },
  smallContainer:  { padding: 8, borderRadius: 10 },
  // Emoji
  mediumEmoji: { fontSize: 28 },
  largeEmoji:  { fontSize: 40 },
  smallEmoji:  { fontSize: 20 },
  // Label
  label: { ...FONTS.bold },
  mediumLabel: { fontSize: SIZES.subtitle },
  largeLabel:  { fontSize: SIZES.title },
  smallLabel:  { fontSize: SIZES.body },
  // Score
  score: {
    fontSize: SIZES.small,
    ...FONTS.medium,
    marginTop: 2,
  },
});

export default RiskBadge;
