import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, Alert, StatusBar, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';
import PinkButton from '../components/PinkButton';
import { COLORS, FONTS, SIZES, SHADOWS } from '../theme';
import { login } from '../services/api';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Oops!', 'Please fill in all fields 💕');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[COLORS.white, COLORS.pinkSoft]} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Logo size={70} />

          <Text style={styles.title}>Welcome Back! 👋</Text>
          <Text style={styles.subtitle}>Sign in to continue your health journey</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={COLORS.gray400}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.gray400}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <PinkButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={{ marginTop: 8 }}
            />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.switchText}>
              Don't have an account? <Text style={styles.switchLink}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.title,
    ...FONTS.bold,
    color: COLORS.dark,
    marginTop: 28,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.gray500,
    ...FONTS.regular,
    marginTop: 6,
    marginBottom: 30,
  },
  form: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    gap: 18,
    ...SHADOWS.medium,
  },
  inputGroup: { gap: 6 },
  label: {
    fontSize: SIZES.small,
    ...FONTS.semibold,
    color: COLORS.gray600,
    marginLeft: 4,
  },
  input: {
    backgroundColor: COLORS.pinkSoft,
    borderRadius: 14,
    padding: 14,
    fontSize: SIZES.body,
    color: COLORS.dark,
    borderWidth: 1.5,
    borderColor: COLORS.pinkLight,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyeBtn: { padding: 8 },
  eyeText: { fontSize: 20 },
  switchText: {
    marginTop: 24,
    fontSize: SIZES.body,
    color: COLORS.gray500,
    ...FONTS.regular,
  },
  switchLink: {
    color: COLORS.pink,
    ...FONTS.bold,
  },
});

export default LoginScreen;
