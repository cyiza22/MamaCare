// MamaCare Logo

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS, FONTS, SIZES } from '../theme';

const Logo = ({ size = 80, showText = true }) => {
  const scale = size / 80;

  return (
    <View style={styles.container}>
      <View style={[styles.logoCircle, { width: size, height: size, borderRadius: size / 2 }]}>
        <Svg
          width={size * 0.6}
          height={size * 0.6}
          viewBox="0 0 64 64"
        >
          {/* Pink Ribbon */}
          <Path
            d="M32 8 C28 8, 20 14, 20 22 C20 28, 24 32, 28 36 L32 40 L36 36 C40 32, 44 28, 44 22 C44 14, 36 8, 32 8 Z"
            fill={COLORS.pink}
            opacity={0.9}
          />
          <Path
            d="M32 40 L26 52 C24 56, 28 58, 32 54 C36 58, 40 56, 38 52 L32 40 Z"
            fill={COLORS.pinkDark}
            opacity={0.9}
          />
          {/* Heart accent */}
          <Path
            d="M32 18 C30 14, 24 14, 24 18 C24 22, 32 28, 32 28 C32 28, 40 22, 40 18 C40 14, 34 14, 32 18 Z"
            fill={COLORS.white}
            opacity={0.5}
          />
          {/* Small sparkle dots */}
          <Circle cx="16" cy="16" r="2" fill={COLORS.coral} opacity={0.6} />
          <Circle cx="48" cy="16" r="2" fill={COLORS.coral} opacity={0.6} />
          <Circle cx="14" cy="36" r="1.5" fill={COLORS.pinkLight} opacity={0.5} />
          <Circle cx="50" cy="36" r="1.5" fill={COLORS.pinkLight} opacity={0.5} />
        </Svg>
      </View>

      {showText && (
        <View style={styles.textContainer}>
          <Text style={styles.appName}>MamaCare</Text>
          <Text style={styles.tagline}>Breast Health Companion</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logoCircle: {
    backgroundColor: COLORS.pinkSoft,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.pinkLight,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  appName: {
    fontSize: SIZES.header,
    ...FONTS.heavy,
    color: COLORS.pink,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: SIZES.small,
    ...FONTS.medium,
    color: COLORS.gray500,
    marginTop: 2,
    letterSpacing: 0.5,
  },
});

export default Logo;
