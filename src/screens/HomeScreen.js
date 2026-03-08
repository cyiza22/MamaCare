import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';
import { COLORS, FONTS, SIZES, SHADOWS } from '../theme';

const { width } = Dimensions.get('window');

const ActionCard = ({ emoji, title, description, color, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.cardIcon, { backgroundColor: color + '18' }]}>
      <Text style={styles.cardEmoji}>{emoji}</Text>
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDesc}>{description}</Text>
    </View>
    <Text style={styles.cardArrow}>›</Text>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={[COLORS.pink, COLORS.pinkDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello! 👋</Text> 
            <Text style={styles.headerTitle}>Your Breast Health</Text>
            <Text style={styles.headerTitle}>Dashboard</Text>
          </View>
          <Logo size={50} showText={false} />
        </View>

        {/* Quick stat */}
        <View style={styles.statCard}>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>🎀</Text> 
            <Text style={styles.statLabel}>Early detection saves lives</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>💪</Text> 
            <Text style={styles.statLabel}>90%+ survival when found early</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Actions */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>What would you like to do?</Text>

        <ActionCard
          emoji="📋"
          title="Risk Assessment"
          description="Answer a quick questionnaire to check your breast cancer risk level"
          color={COLORS.pink}
          onPress={() => navigation.navigate('Questionnaire')}
        />

        <ActionCard
          emoji="💬"
          title="Chat Assistant"
          description="Ask questions about breast health in English, French or Kinyarwanda"
          color={COLORS.coral}
          onPress={() => navigation.navigate('Chat')}
        />

        <ActionCard
          emoji="🔬"
          title="Ultrasound Analysis"
          description="Upload a breast ultrasound image for AI-powered prediction"
          color={COLORS.lavender}
          onPress={() => navigation.navigate('ImageUpload')}
        />

        <ActionCard
          emoji="📊"
          title="My Screening History"
          description="View your past screening results and track changes over time"
          color={COLORS.lavender}
          onPress={() => navigation.navigate('History')}
        />

        <ActionCard
          emoji="📱"
          title="Offline Analysis"
          description="Analyze ultrasound images on your phone — no internet needed"
          color="#6B46C1"
          onPress={() => navigation.navigate('OfflinePrediction')}
        />

        {/* Self-exam reminder card */}
        <View style={styles.reminderCard}>
          <LinearGradient
            colors={[COLORS.pinkSoft, COLORS.pinkPastel]}
            style={styles.reminderGradient}
          >
            <Text style={styles.reminderEmoji}>🌸</Text> 
            <Text style={styles.reminderTitle}>Monthly Self-Exam Reminder</Text>
            <Text style={styles.reminderText}>
              Do a breast self-exam once a month, a few days after your period ends.
              Ask our chat assistant "how to do a self-exam" for step-by-step guidance.
            </Text>
          </LinearGradient>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  // Header
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: SIZES.body,
    color: COLORS.pinkLight,
    ...FONTS.medium,
  },
  headerTitle: {
    fontSize: SIZES.header,
    color: COLORS.white,
    ...FONTS.bold,
    lineHeight: 34,
  },
  // Stat card
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginTop: 20,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statEmoji: { fontSize: 20 },
  statLabel: {
    fontSize: SIZES.tiny,
    color: COLORS.white,
    ...FONTS.medium,
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 12,
  },
  // Body
  body: { flex: 1, marginTop: -20 },
  bodyContent: { paddingHorizontal: 20, paddingTop: 8 },
  sectionTitle: {
    fontSize: SIZES.subtitle,
    ...FONTS.bold,
    color: COLORS.dark,
    marginBottom: 16,
    marginTop: 12,
  },
  // Action cards
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    ...SHADOWS.small,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: { fontSize: 26 },
  cardContent: {
    flex: 1,
    marginLeft: 14,
  },
  cardTitle: {
    fontSize: SIZES.subtitle,
    ...FONTS.semibold,
    color: COLORS.dark,
  },
  cardDesc: {
    fontSize: SIZES.small,
    color: COLORS.gray500,
    ...FONTS.regular,
    marginTop: 3,
    lineHeight: 18,
  },
  cardArrow: {
    fontSize: 28,
    color: COLORS.pinkLight,
    ...FONTS.light,
    marginLeft: 8,
  },
  // Reminder
  reminderCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 4,
  },
  reminderGradient: {
    padding: 22,
    alignItems: 'center',
  },
  reminderEmoji: { fontSize: 36, marginBottom: 8 },
  reminderTitle: {
    fontSize: SIZES.subtitle,
    ...FONTS.bold,
    color: COLORS.pinkDark,
    textAlign: 'center',
  },
  reminderText: {
    fontSize: SIZES.small,
    color: COLORS.gray600,
    ...FONTS.regular,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default HomeScreen;
