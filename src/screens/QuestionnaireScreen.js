import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, StatusBar, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PinkButton from '../components/PinkButton';
import RiskBadge from '../components/RiskBadge';
import { COLORS, FONTS, SIZES, SHADOWS } from '../theme';
import { submitScreening } from '../services/api';

// Question definitions
const QUESTIONS = [
  {
    key: 'age',
    question: 'What is your age?',
    type: 'number',
    emoji: '🎂',
  },
  {
    key: 'family_history',
    question: 'Do you have a family history of breast cancer?',
    type: 'choice',
    emoji: '👨‍👩‍👧',
    options: [
      { value: 'none', label: 'No family history', emoji: '✅' },
      { value: 'distant', label: 'Distant relative (aunt, cousin)', emoji: '👤' },
      { value: 'mother_sister', label: 'Mother or sister', emoji: '👩' },
      { value: 'multiple', label: 'Multiple family members', emoji: '👥' },
    ],
  },
  {
    key: 'age_first_period',
    question: 'At what age did you have your first period?',
    type: 'number',
    emoji: '📅',
  },
  {
    key: 'age_first_birth',
    question: 'At what age did you have your first child?',
    type: 'choice',
    emoji: '👶',
    options: [
      { value: 'before_20', label: 'Before age 20', emoji: '🌱' },
      { value: '20_to_29', label: 'Between 20 and 29', emoji: '🌿' },
      { value: 'after_30', label: 'After age 30', emoji: '🌳' },
      { value: 'no_children', label: 'No children', emoji: '💫' },
    ],
  },
  {
    key: 'previous_biopsy',
    question: 'Have you had a previous breast biopsy?',
    type: 'yesno',
    emoji: '🔬',
  },
  {
    key: 'lump_detected',
    question: 'Have you noticed any lumps in your breast?',
    type: 'yesno',
    emoji: '🔍',
  },
  {
    key: 'skin_changes',
    question: 'Have you noticed any skin changes on your breast?',
    type: 'yesno',
    emoji: '👀',
  },
  {
    key: 'nipple_discharge',
    question: 'Have you experienced any nipple discharge?',
    type: 'yesno',
    emoji: '💧',
  },
  {
    key: 'breast_pain',
    question: 'Are you experiencing any breast pain?',
    type: 'yesno',
    emoji: '💗',
  },
];

const QuestionnaireScreen = ({ navigation }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const current = QUESTIONS[step];
  const progress = (step + 1) / QUESTIONS.length;

  const setAnswer = (value) => {
    setAnswers({ ...answers, [current.key]: value });
  };

  const goNext = () => {
    if (answers[current.key] === undefined || answers[current.key] === '') {
      Alert.alert('Please answer', 'Select or enter an answer to continue 💕');
      return;
    }
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...answers,
        age: parseInt(answers.age),
        age_first_period: parseInt(answers.age_first_period),
      };
      const res = await submitScreening(payload);
      setResult(res);
    } catch (err) {
      const msg = err.response?.data?.message || 'Screening failed. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── RESULT SCREEN ─────────────────────────────
  if (result) {
    return (
      <LinearGradient colors={[COLORS.white, COLORS.pinkSoft]} style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.resultContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultEmoji}>
            {result.risk_level === 'low' ? '🎉' : result.risk_level === 'moderate' ? '⚠️' : '🚨'}
          </Text>
          <Text style={styles.resultTitle}>Your Results</Text>

          <RiskBadge level={result.risk_level} score={result.risk_score} size="large" />

          <View style={styles.recBox}>
            <Text style={styles.recTitle}>📋 Recommendations</Text>
            {(result.recommendations || []).map((rec, i) => (
              <View key={i} style={styles.recItem}>
                <Text style={styles.recDot}>•</Text>
                <Text style={styles.recText}>{rec}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.disclaimer}>
            ⚕️ This is a preliminary screening tool, not a medical diagnosis.
            Please consult a healthcare professional.
          </Text>

          <PinkButton
            title="Back to Home"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 16, width: '100%' }}
          />

          <PinkButton
            title="Chat with Assistant"
            variant="outline"
            onPress={() => navigation.navigate('Chat')}
            style={{ marginTop: 10, width: '100%' }}
          />
        </ScrollView>
      </LinearGradient>
    );
  }

  // ─── QUESTION SCREEN ───────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <LinearGradient
            colors={[COLORS.pinkLight, COLORS.pink]}
            style={[styles.progressFill, { width: `${progress * 100}%` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
        <Text style={styles.progressText}>
          {step + 1} of {QUESTIONS.length}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.questionContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.questionEmoji}>{current.emoji}</Text>
        <Text style={styles.questionText}>{current.question}</Text>

        {/* Number input */}
        {current.type === 'number' && (
          <TextInput
            style={styles.numberInput}
            placeholder="Enter a number"
            placeholderTextColor={COLORS.gray400}
            keyboardType="number-pad"
            value={answers[current.key]?.toString() || ''}
            onChangeText={(val) => setAnswer(val)}
          />
        )}

        {/* Yes/No */}
        {current.type === 'yesno' && (
          <View style={styles.yesnoRow}>
            {[
              { value: 'no', label: 'No', emoji: '❌' },
              { value: 'yes', label: 'Yes', emoji: '✅' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.yesnoBtn,
                  answers[current.key] === opt.value && styles.yesnoBtnActive,
                ]}
                onPress={() => setAnswer(opt.value)}
              >
                <Text style={styles.yesnoEmoji}>{opt.emoji}</Text>
                <Text style={[
                  styles.yesnoLabel,
                  answers[current.key] === opt.value && styles.yesnoLabelActive,
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Multiple choice */}
        {current.type === 'choice' && (
          <View style={styles.choiceList}>
            {current.options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.choiceBtn,
                  answers[current.key] === opt.value && styles.choiceBtnActive,
                ]}
                onPress={() => setAnswer(opt.value)}
              >
                <Text style={styles.choiceEmoji}>{opt.emoji}</Text>
                <Text style={[
                  styles.choiceLabel,
                  answers[current.key] === opt.value && styles.choiceLabelActive,
                ]}>
                  {opt.label}
                </Text>
                {answers[current.key] === opt.value && (
                  <Text style={styles.checkMark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.navRow}>
        {step > 0 ? (
          <PinkButton title="← Back" variant="ghost" size="medium" onPress={goBack} />
        ) : (
          <View />
        )}
        <PinkButton
          title={step === QUESTIONS.length - 1 ? 'Submit ✨' : 'Next →'}
          size="medium"
          onPress={goNext}
          loading={loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  // Progress
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.white,
  },
  progressBg: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: SIZES.small,
    ...FONTS.semibold,
    color: COLORS.pink,
    minWidth: 45,
    textAlign: 'right',
  },
  // Question
  questionContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
  },
  questionEmoji: { fontSize: 48, marginBottom: 16 },
  questionText: {
    fontSize: SIZES.title,
    ...FONTS.bold,
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 30,
  },
  // Number input
  numberInput: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    fontSize: 24,
    ...FONTS.bold,
    color: COLORS.dark,
    textAlign: 'center',
    width: '60%',
    borderWidth: 2,
    borderColor: COLORS.pinkLight,
    ...SHADOWS.small,
  },
  // Yes/No
  yesnoRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  yesnoBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray200,
    ...SHADOWS.small,
  },
  yesnoBtnActive: {
    borderColor: COLORS.pink,
    backgroundColor: COLORS.pinkSoft,
  },
  yesnoEmoji: { fontSize: 32, marginBottom: 8 },
  yesnoLabel: {
    fontSize: SIZES.subtitle,
    ...FONTS.semibold,
    color: COLORS.gray600,
  },
  yesnoLabelActive: { color: COLORS.pink },
  // Multiple choice
  choiceList: { width: '100%', gap: 12 },
  choiceBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray200,
    gap: 12,
    ...SHADOWS.small,
  },
  choiceBtnActive: {
    borderColor: COLORS.pink,
    backgroundColor: COLORS.pinkSoft,
  },
  choiceEmoji: { fontSize: 24 },
  choiceLabel: {
    fontSize: SIZES.body,
    ...FONTS.medium,
    color: COLORS.gray700,
    flex: 1,
  },
  choiceLabelActive: { color: COLORS.pink, ...FONTS.semibold },
  checkMark: {
    fontSize: 20,
    color: COLORS.pink,
    ...FONTS.bold,
  },
  // Nav
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  // Result
  resultContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },
  resultEmoji: { fontSize: 64, marginBottom: 12 },
  resultTitle: {
    fontSize: SIZES.header,
    ...FONTS.bold,
    color: COLORS.dark,
    marginBottom: 24,
  },
  recBox: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginTop: 24,
    ...SHADOWS.small,
  },
  recTitle: {
    fontSize: SIZES.subtitle,
    ...FONTS.bold,
    color: COLORS.dark,
    marginBottom: 14,
  },
  recItem: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 8,
  },
  recDot: { color: COLORS.pink, fontSize: SIZES.body, ...FONTS.bold },
  recText: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.gray700,
    ...FONTS.regular,
    lineHeight: 22,
  },
  disclaimer: {
    fontSize: SIZES.small,
    color: COLORS.gray500,
    ...FONTS.regular,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
});

export default QuestionnaireScreen;
