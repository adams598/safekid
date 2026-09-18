import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { colors, typography } from '../theme';

// Auth screens
import { SplashScreen } from '../screens/auth/SplashScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// App screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { ChildDetailScreen } from '../screens/children/ChildDetailScreen';
import { AddChildScreen } from '../screens/children/AddChildScreen';
import { SafeZonesScreen } from '../screens/zones/SafeZonesScreen';
import { NavigateToChildScreen } from '../screens/home/NavigateToChildScreen';
import { AlertsScreen } from '../screens/alerts/AlertsScreen';
import { ReportsScreen } from '../screens/reports/ReportsScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { FamilyMembersScreen } from '../screens/settings/FamilyMembersScreen';

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ChildrenPlaceholder() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.textSecondary }}>Enfants</Text>
    </View>
  );
}

function MainTabs() {
  const unreadAlertsCount = useAppStore((s) => s.unreadAlertsCount);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: tabBarStyle,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: tabBarLabelStyle,
        tabBarItemStyle: { paddingVertical: 4 },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Carte',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'map' : 'map-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ChildrenTab"
        component={ChildrenPlaceholder}
        options={{
          tabBarLabel: 'Enfants',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="AlertsTab"
        component={AlertsScreen}
        options={{
          tabBarLabel: 'Alertes',
          tabBarBadge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
          tabBarBadgeStyle: badgeStyle,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'notifications' : 'notifications-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ReportsTab"
        component={ReportsScreen}
        options={{
          tabBarLabel: 'Rapports',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'bar-chart' : 'bar-chart-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person-circle' : 'person-circle-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="MainTabs" component={MainTabs} />
      <AppStack.Screen
        name="ChildDetail"
        component={ChildDetailScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <AppStack.Screen
        name="SafeZones"
        component={SafeZonesScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <AppStack.Screen
        name="NavigateToChild"
        component={NavigateToChildScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <AppStack.Screen
        name="AddChild"
        component={AddChildScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <AppStack.Screen
        name="FamilyMembers"
        component={FamilyMembersScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <AppStack.Screen
        name="PairChip"
        component={AddChildScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <AppStack.Screen
        name="ReportDetail"
        component={ReportsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <AppStack.Screen
        name="ZoneEditor"
        component={SafeZonesScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <AppStack.Screen
        name="AddFamilyMember"
        component={FamilyMembersScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </AppStack.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Splash" component={SplashScreen} />
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

export function Navigation() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const tabBarStyle = {
  backgroundColor: colors.surface,
  borderTopColor: colors.border,
  borderTopWidth: 1,
  height: 80,
  paddingTop: 8,
  paddingBottom: 20,
  shadowColor: colors.primary,
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 8,
};

const tabBarLabelStyle = {
  ...typography.labelSmall,
  fontSize: 11,
};

const badgeStyle = {
  backgroundColor: colors.danger,
  color: colors.white,
  fontSize: 10,
};
