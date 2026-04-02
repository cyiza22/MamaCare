import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { COLORS, FONTS, SIZES } from '../theme';

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.text}>{children}</Text>
  </View>
);

const LegalScreen = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.header}>
          MamaCare: End User License Agreement (EULA)
        </Text>
        <Text style={styles.sub}>Last Updated: March 2026</Text>

        <Section title="1. Medical Disclaimer & Intended Use">
          MamaCare is a decision-support and self-assessment tool. It is not a doctor and does not provide a medical diagnosis.

          {"\n\n"}• AI risk scores and image classifications are preliminary.
          {"\n"}• The app is designed to support screening and education.
          {"\n"}• Users must not rely solely on the app when symptoms or concerns are present.
          {"\n"}• Always consult a qualified medical professional when necessary.
        </Section>

        <Section title="2. Accuracy & Limitations">
          The AI model used in MamaCare has an approximate accuracy of 84% and sensitivity of 91%.

          {"\n\n"}• A "Low Risk" result does not guarantee you are healthy.
          {"\n"}• A "High Risk" result does not confirm the presence of cancer.
          {"\n"}• False positives and false negatives are possible.
          {"\n"}• The app should be used as a safety net alongside clinical judgment.
        </Section>

        <Section title="3. User Responsibility & Ethical Use">
          {"\n"}• You are responsible for how you interpret and act on the app’s results.
          {"\n"}• Community Health Workers must obtain patient consent before data collection.
          {"\n"}• Screening purpose must be clearly explained in a language the patient understands.
          {"\n"}• Participation must always be voluntary.
        </Section>

        <Section title="4. Data Privacy & Ownership">
          Your health data belongs to you.

          {"\n\n"}• Data is encrypted using AES-256 (storage) and secure transmission protocols.
          {"\n"}• Data is collected only for screening and referral purposes.
          {"\n"}• You have the right to delete your data at any time.
          {"\n"}• Use must comply with Rwanda Data Protection Law (No. 27/2021).
        </Section>

        <Section title="5. Data Security Responsibilities">
          {"\n"}• Do not share your login credentials.
          {"\n"}• Use the app only on secure devices.
          {"\n"}• Ensure patient data is not exposed to unauthorized individuals.
        </Section>

        <Section title="6. Prohibited Use">
          {"\n"}• Do not use MamaCare outside of breast cancer screening and triage.
          {"\n"}• Do not reverse-engineer or misuse AI models.
          {"\n"}• Do not export or share patient data without authorization.
          {"\n"}• Do not present results as a final or guaranteed diagnosis.
        </Section>

        <Section title="7. Emergency Disclaimer">
          {"\n"}• This app must not be used in medical emergencies.
          {"\n"}• If you are in pain or require urgent care, visit the nearest hospital immediately.
        </Section>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    fontSize: SIZES.title,
    ...FONTS.bold,
    color: COLORS.dark,
    marginBottom: 6,
  },

  sub: {
    fontSize: SIZES.small,
    color: COLORS.gray400,
    marginBottom: 20,
  },

  section: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },

  title: {
    fontSize: SIZES.body,
    ...FONTS.bold,
    color: COLORS.pinkDark,
    marginBottom: 8,
  },

  text: {
    fontSize: SIZES.small,
    color: COLORS.gray700,
    lineHeight: 20,
    ...FONTS.regular,
  },
});

export default LegalScreen;