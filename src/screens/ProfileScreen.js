import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';
import PinkButton from '../components/PinkButton';
import { COLORS, FONTS, SIZES, SHADOWS } from '../theme';
import { clearToken } from '../services/api';

const MenuItem = ({ emoji, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.menuEmoji}>{emoji}</Text>
    <View style={styles.menuContent}>
      <Text style={styles.menuTitle}>{title}</Text>
      {subtitle && <Text style={styles.menuSub}>{subtitle}</Text>}
    </View>
    <Text style={styles.menuArrow}>›</Text>
  </TouchableOpacity>
);

const ProfileScreen = ({ navigation }) => {
  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            clearToken();
            navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
          },
        },
      ]
    );
  };

  const openLink = (url) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Profile header */}
        <LinearGradient
          colors={[COLORS.pinkSoft, COLORS.pinkPastel]}
          style={styles.header}
        >
          <Logo size={60} showText={false} />
          <Text style={styles.headerTitle}>MamaCare</Text>
          <Text style={styles.headerSub}>Your breast health companion</Text>
        </LinearGradient>

        {/* Menu sections */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>HEALTH</Text>
          <View style={styles.menuCard}>
            <MenuItem
              emoji="📋"
              title="Take Risk Assessment"
              subtitle="Quick questionnaire screening"
              onPress={() => navigation.navigate('Questionnaire')}
            />
            <View style={styles.divider} />
            <MenuItem
              emoji="📊"
              title="Screening History"
              subtitle="View your past results"
              onPress={() => navigation.navigate('History')}
            />
            <View style={styles.divider} />
            <MenuItem
              emoji="💬"
              title="Chat Assistant"
              subtitle="Ask questions in EN, FR, or RW"
              onPress={() => navigation.navigate('Chat')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LEARN</Text>
          <View style={styles.menuCard}>
            <MenuItem
              emoji="🔍"
              title="Self-Exam Guide"
              subtitle="Step-by-step breast examination"
              onPress={() => navigation.navigate('Chat')}
            />
            <View style={styles.divider} />
            <MenuItem
              emoji="🏥"
              title="Find Health Facilities"
              subtitle="Clinics & hospitals in Rwanda"
              onPress={() => openLink('https://www.moh.gov.rw')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <View style={styles.menuCard}>
            <MenuItem
              emoji="ℹ️"
              title="About MamaCare"
              subtitle="AI-powered screening for underserved communities"
            />
            <View style={styles.divider} />
            <MenuItem
              emoji="🎀"
              title="Breast Cancer Awareness"
              subtitle="Learn more about prevention"
              onPress={() => openLink('https://www.who.int/news-room/fact-sheets/detail/breast-cancer')}
            />
          </View>
        </View>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <PinkButton
            title="Sign Out"
            variant="outline"
            size="medium"
            onPress={handleLogout}
            style={{ width: '100%' }}
          />
        </View>

       

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  // Header
  header: {
    paddingTop: 70,
    paddingBottom: 30,
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: SIZES.title,
    ...FONTS.bold,
    color: COLORS.pinkDark,
  },
  headerSub: {
    fontSize: SIZES.small,
    color: COLORS.gray500,
    ...FONTS.regular,
  },
  // Sections
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: SIZES.tiny,
    ...FONTS.bold,
    color: COLORS.gray400,
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  menuEmoji: { fontSize: 24 },
  menuContent: { flex: 1 },
  menuTitle: {
    fontSize: SIZES.body,
    ...FONTS.semibold,
    color: COLORS.dark,
  },
  menuSub: {
    fontSize: SIZES.small,
    color: COLORS.gray500,
    ...FONTS.regular,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 24,
    color: COLORS.gray300,
    ...FONTS.light,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginLeft: 54,
  },
  // Logout
  logoutSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  version: {
    textAlign: 'center',
    fontSize: SIZES.tiny,
    color: COLORS.gray400,
    ...FONTS.regular,
    marginTop: 20,
  },
});

export default ProfileScreen;
