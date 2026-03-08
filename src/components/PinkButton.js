//Reusable Button

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../theme';

const PinkButton = ({
  title,
  onPress,
  variant = 'filled', // 'filled' | 'outline' | 'ghost'
  size = 'large',      // 'small' | 'medium' | 'large'
  loading = false,
  disabled = false,
  icon = null,
  style = {},
}) => {
  const buttonStyles = [
    styles.base,
    styles[`${variant}Bg`],
    styles[`${size}Size`],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'filled' ? COLORS.white : COLORS.pink} />
      ) : (
        <>
          {icon}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    gap: 8,
  },
  // Variants
  filledBg: {
    backgroundColor: COLORS.pink,
    ...SHADOWS.medium,
  },
  outlineBg: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.pink,
  },
  ghostBg: {
    backgroundColor: COLORS.pinkSoft,
  },
  // Sizes
  largeSize:  { paddingVertical: 16, paddingHorizontal: 32 },
  mediumSize: { paddingVertical: 12, paddingHorizontal: 24 },
  smallSize:  { paddingVertical: 8, paddingHorizontal: 16 },
  // Text
  text: { ...FONTS.semibold, textAlign: 'center' },
  filledText:  { color: COLORS.white },
  outlineText: { color: COLORS.pink },
  ghostText:   { color: COLORS.pink },
  largeText:   { fontSize: SIZES.subtitle },
  mediumText:  { fontSize: SIZES.body },
  smallText:   { fontSize: SIZES.small },
  // Disabled
  disabled:     { opacity: 0.5 },
  disabledText: { opacity: 0.7 },
});

export default PinkButton;
