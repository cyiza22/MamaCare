// src/screens/SignupScreen.js

import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, Alert, StatusBar, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';
import PinkButton from '../components/PinkButton';
import { COLORS, FONTS, SIZES, SHADOWS } from '../theme';
import { signup } from '../services/api';

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Oops!', 'Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Oops!', 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Oops!', 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await signup(name.trim(), email.trim(), password);
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err) {
      // Handle structured error from Laravel
      const data = err.response?.data;
      let msg = 'Signup failed. Please try again.';

      if (data?.errors) {
        // Laravel validation errors — grab the first one
        const firstField = Object.keys(data.errors)[0];
        msg = data.errors[firstField][0];
      } else if (data?.message) {
        msg = data.message;
      }

      Alert.alert('Signup Failed', msg);
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

          <Text style={styles.title}>Join MamaCare</Text>
          <Text style={styles.subtitle}>Create your account to get started</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Marie Uwimana"
                placeholderTextColor={COLORS.gray400}
                value={name}
                onChangeText={setName}
              />
            </View>

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
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
                placeholderTextColor={COLORS.gray400}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={[
                  styles.input,
                  confirmPassword && password !== confirmPassword && styles.inputError,
                ]}
                placeholder="Re-enter your password"
                placeholderTextColor={COLORS.gray400}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              {confirmPassword !== '' && password !== confirmPassword && (
                <Text style={styles.errorHint}>Passwords do not match</Text>
              )}
            </View>

            <PinkButton
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
              style={{ marginTop: 8 }}
            />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.switchText}>
              Already have an account? <Text style={styles.switchLink}>Sign In</Text>
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
    paddingTop: 70,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.title,
    ...FONTS.bold,
    color: COLORS.dark,
    marginTop: 24,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.gray500,
    ...FONTS.regular,
    marginTop: 6,
    marginBottom: 28,
  },
  form: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    gap: 16,
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
  inputError: {
    borderColor: '#EF5350',
    backgroundColor: '#FFF5F5',
  },
  errorHint: {
    fontSize: SIZES.tiny,
    color: '#EF5350',
    ...FONTS.medium,
    marginLeft: 4,
    marginTop: 2,
  },
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

export default SignupScreen;