import React from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';
import PinkButton from '../components/PinkButton';
import { COLORS, FONTS, SIZES } from '../theme';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  return (
    <LinearGradient
      colors={[COLORS.white, COLORS.pinkSoft, COLORS.pinkPastel]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />

      {/* Decorative circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle3]} />

      {/* Logo */}
      <View style={styles.logoSection}>
        <Logo size={100} />
      </View>

      {/* Features */}
      <View style={styles.features}>
        {[
          { emoji: '📋', text: 'Quick risk assessment questionnaire' },
          { emoji: '🔬', text: 'AI-powered ultrasound analysis' },
          { emoji: '💬', text: 'Health assistant in 3 languages' },
          { emoji: '🏥', text: 'Clinic referrals in Rwanda' },
        ].map((item, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureEmoji}>{item.emoji}</Text>
            <Text style={styles.featureText}>{item.text}</Text>
          </View>
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <PinkButton
          title="Get Started"
          onPress={() => navigation.navigate('Signup')}
          style={styles.btn}
        />
        <PinkButton
          title="I already have an account"
          variant="ghost"
          size="medium"
          onPress={() => navigation.navigate('Login')}
          style={styles.btn}
        />
      </View>

      
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
    justifyContent: 'space-between',
  },
  // Decorative circles
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: COLORS.pinkLight,
    opacity: 0.15,
  },
  circle1: { width: 200, height: 200, top: -50, right: -60 },
  circle2: { width: 150, height: 150, top: height * 0.3, left: -80 },
  circle3: { width: 100, height: 100, bottom: 100, right: -30 },
  // Logo
  logoSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  // Features
  features: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: COLORS.pink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureText: {
    fontSize: SIZES.body,
    color: COLORS.gray700,
    ...FONTS.medium,
    flex: 1,
  },
  // Buttons
  buttons: {
    gap: 12,
  },
  btn: {
    width: '100%',
  },
  // Footer
  footer: {
    textAlign: 'center',
    fontSize: SIZES.small,
    color: COLORS.gray400,
    ...FONTS.regular,
  },
});

export default WelcomeScreen;
