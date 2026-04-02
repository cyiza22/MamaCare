import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS, FONTS, SIZES } from '../theme';

// Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import QuestionnaireScreen from '../screens/QuestionnaireScreen';
import ChatScreen from '../screens/ChatScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ImageUploadScreen from '../screens/ImageUploadScreen';
import OfflinePredictionScreen from '../screens/OfflinePredictionScreen';
import LegalScreen from '../screens/LegalScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom tab bar icon
const TabIcon = ({ emoji, label, focused }) => (
  <View style={styles.tabItem}>
    <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>
      {emoji}
    </Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
      {label}
    </Text>
    {focused && <View style={styles.tabDot} />}
  </View>
);

// Bottom tab navigator
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: styles.tabBar,
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon emoji="🏠" label="Home" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Chat"
      component={ChatScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon emoji="💬" label="Chat" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="History"
      component={HistoryScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon emoji="📊" label="History" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon emoji="👤" label="Profile" focused={focused} />
        ),
      }}
    />
  </Tab.Navigator>
);

// Root stack navigator
const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      screenOptions={{ headerShown: false }} // global default (kept)
      initialRouteName="Welcome"
    >
      {/* Auth screens */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />

      {/* ✅ FIXED LEGAL SCREEN */}
      <Stack.Screen
        name="Legal"
        component={LegalScreen}
        options={{
          headerShown: true,          // ✅ enables header ONLY here
          title: 'Legal',             // ✅ title at the top
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerTitleStyle: {
            ...FONTS.bold,
            color: COLORS.dark,
          },
          headerTintColor: COLORS.pink, // ✅ back arrow color
        }}
      />

      {/* Main app (tabs) */}
      <Stack.Screen name="Main" component={MainTabs} />

      {/* Full-screen modals */}
      <Stack.Screen
        name="Questionnaire"
        component={QuestionnaireScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="ImageUpload"
        component={ImageUploadScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OfflinePrediction"
        component={OfflinePredictionScreen}
        options={{ headerShown: false }}
      />

    </Stack.Navigator>
  </NavigationContainer>
);

const styles = StyleSheet.create({
  tabBar: {
    height: 80,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    paddingTop: 8,
    paddingBottom: 20,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  tabEmoji: {
    fontSize: 22,
    opacity: 0.5,
  },
  tabEmojiActive: {
    opacity: 1,
    fontSize: 24,
  },
  tabLabel: {
    fontSize: 10,
    color: COLORS.gray400,
    ...FONTS.medium,
    marginTop: 3,
  },
  tabLabelActive: {
    color: COLORS.pink,
    ...FONTS.bold,
  },
  tabDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.pink,
    marginTop: 3,
  },
});

export default AppNavigator;